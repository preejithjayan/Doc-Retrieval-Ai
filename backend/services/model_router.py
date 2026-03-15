from apps.modelswitch.models import ActiveModel


MODEL_REGISTRY = {
    'Llama': {
        'identifier': 'meta-llama/Meta-Llama-3-8B-Instruct',
        'model_type': ActiveModel.ModelType.HIGH_END,
        'hardware_requirement': '16GB+ GPU or hosted inference',
    },
    'Mistral': {
        'identifier': 'mistralai/Mistral-7B-Instruct-v0.3',
        'model_type': ActiveModel.ModelType.HIGH_END,
        'hardware_requirement': '16GB+ GPU or hosted inference',
    },
    'Qwen': {
        'identifier': 'Qwen/Qwen2.5-7B-Instruct',
        'model_type': ActiveModel.ModelType.HIGH_END,
        'hardware_requirement': '16GB+ GPU or hosted inference',
    },
    'Phi': {
        'identifier': 'microsoft/Phi-3-mini-4k-instruct',
        'model_type': ActiveModel.ModelType.LOW_END,
        'hardware_requirement': '8GB GPU or strong CPU',
    },
    'TinyLlama': {
        'identifier': 'TinyLlama/TinyLlama-1.1B-Chat-v1.0',
        'model_type': ActiveModel.ModelType.LOW_END,
        'hardware_requirement': 'CPU-friendly, 4GB+ RAM',
    },
    'Distilled': {
        'identifier': 'google/flan-t5-base',
        'model_type': ActiveModel.ModelType.LOW_END,
        'hardware_requirement': 'CPU-friendly, 4GB+ RAM',
    },
}


class ModelRouterService:
    def get_current_model(self):
        return ActiveModel.objects.filter(is_active=True).first()

    def get_catalog(self):
        return ActiveModel.objects.order_by('-is_active', 'model_type', 'model_name')

    def switch_model(self, model_name):
        target = ActiveModel.objects.get(model_name=model_name)
        ActiveModel.objects.exclude(pk=target.pk).update(is_active=False)
        target.is_active = True
        target.save(update_fields=['is_active', 'updated_at'])
        return target

    def generate(self, prompt, citations=None):
        active_model = self.get_current_model()
        if active_model and active_model.provider == 'huggingface':
            return self._generate_with_hf_or_fallback(active_model, prompt, citations or [])
        return self._generate_with_extract_fallback(citations or [])

    def _generate_with_hf_or_fallback(self, active_model, prompt, citations):
        try:
            from django.conf import settings
            from huggingface_hub import InferenceClient

            if settings.HUGGINGFACE_API_TOKEN:
                client = InferenceClient(model=active_model.identifier, token=settings.HUGGINGFACE_API_TOKEN)
                output = client.text_generation(prompt, max_new_tokens=active_model.max_tokens, temperature=active_model.temperature)
                return output.strip()
        except Exception:
            pass

        try:
            from django.conf import settings
            from transformers import pipeline

            generator = pipeline('text2text-generation', model=settings.LLM_FALLBACK_MODEL)
            response = generator(prompt, max_new_tokens=220, do_sample=False)[0]['generated_text']
            return response.strip()
        except Exception:
            return self._generate_with_extract_fallback(citations)

    def _generate_with_extract_fallback(self, citations):
        if not citations:
            return 'I could not find relevant information in the indexed documents.'
        snippets = "\n".join(f"- {item['snippet']}" for item in citations[:3])
        return (
            'The configured model is currently unavailable, so this response is based on the top retrieved evidence.\n\n'
            f'{snippets}'
        )
