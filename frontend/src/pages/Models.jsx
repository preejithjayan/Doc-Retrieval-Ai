import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { getCurrentModel, switchModel } from '../api/modelsApi';
import PageWrapper from '../components/layout/PageWrapper';
import ModelCard from '../components/models/ModelCard';
import Skeleton from '../components/ui/Skeleton';
import { useToast } from '../hooks/useToast';

const modelMeta = {
  Llama: { description: 'Balanced frontier-grade reasoning with strong long-form responses.', speed: 58, quality: 94 },
  Mistral: { description: 'Fast multilingual instruction model for reliable enterprise answers.', speed: 72, quality: 88 },
  Qwen: { description: 'A strong all-rounder for retrieval-heavy prompts and document analysis.', speed: 70, quality: 90 },
  Phi: { description: 'Lean reasoning model with a practical balance of speed and cost.', speed: 86, quality: 78 },
  TinyLlama: { description: 'Compact, CPU-friendly option for lightweight local inference.', speed: 95, quality: 64 },
  Distilled: { description: 'Safe fallback path when hosted model access is unavailable.', speed: 92, quality: 60 },
};

export default function Models() {
  const toast = useToast();
  const queryClient = useQueryClient();

  const modelsQuery = useQuery({
    queryKey: ['models'],
    queryFn: () => getCurrentModel(),
  });

  const switchMutation = useMutation({
    mutationFn: (modelName) => switchModel(modelName),
    onSuccess: () => {
      toast.success('Active model switched.');
      queryClient.invalidateQueries({ queryKey: ['models'] });
      queryClient.invalidateQueries({ queryKey: ['analytics-overview'] });
    },
    onError: () => {
      toast.error('Unable to switch models right now.');
    },
  });

  return (
    <PageWrapper>
      <section className="mx-auto max-w-7xl">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.35em] text-cyan/70">Model Control</p>
          <h1 className="mt-4 font-display text-4xl font-semibold">Route queries through the right intelligence tier.</h1>
        </div>

        {modelsQuery.isLoading ? (
          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-[320px] rounded-[28px]" />
            ))}
          </div>
        ) : (
          <>
            <div className="mt-8 glass-card neural-outline rounded-[30px] p-6 shadow-glow">
              <p className="font-mono text-xs uppercase tracking-[0.32em] text-cyan/70">Currently Active</p>
              <h2 className="mt-4 font-display text-3xl font-semibold">{modelsQuery.data?.current?.model_name || 'No active model'}</h2>
              <p className="mt-2 text-sm text-slate-400">{modelsQuery.data?.current?.hardware_requirement}</p>
            </div>

            <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {(modelsQuery.data?.catalog || []).map((model) => (
                <ModelCard
                  key={model.id}
                  model={model}
                  metadata={modelMeta[model.model_name] || { description: 'Model profile unavailable.', speed: 50, quality: 50 }}
                  isPending={switchMutation.isPending && switchMutation.variables === model.model_name}
                  onActivate={(modelName) => switchMutation.mutate(modelName)}
                />
              ))}
            </div>
          </>
        )}
      </section>
    </PageWrapper>
  );
}
