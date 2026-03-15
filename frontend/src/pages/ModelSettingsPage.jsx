import { useEffect, useState } from 'react';

import ModelSelector from '../components/ModelSelector';
import PageHeader from '../components/PageHeader';
import { useAuth } from '../hooks/useAuth';
import modelService from '../services/modelService';

export default function ModelSettingsPage() {
  const { user } = useAuth();
  const [modelState, setModelState] = useState({ current: null, catalog: [] });

  const loadModels = async () => {
    const { data } = await modelService.current();
    setModelState({ current: data.current, catalog: data.catalog || [] });
  };

  useEffect(() => {
    loadModels();
  }, []);

  const canSwitch = user?.role_code === 'ADMIN';

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Model Routing"
        title="Inference profile management"
        description="Choose the active model profile used by the RAG assistant. The backend reads the active database record and routes generation dynamically."
        details={['High-end models', 'Low-end models', 'Database-driven switch', 'Hardware awareness']}
      />

      <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <section className="panel px-6 py-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-console-muted">Current route</p>
          <h3 className="mt-2 text-2xl font-semibold text-console-text">{modelState.current?.model_name || 'No model selected'}</h3>
          <p className="mt-2 text-sm leading-7 text-console-muted">{modelState.current?.hardware_requirement || 'The router will use the next active model record.'}</p>
          <div className="mt-5 space-y-3 text-sm text-console-muted">
            <div className="flex items-center justify-between rounded-lg border border-console-border bg-[#fafbfc] px-4 py-3">
              <span>Provider</span>
              <span className="font-semibold text-console-text">{modelState.current?.provider || 'huggingface'}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-console-border bg-[#fafbfc] px-4 py-3">
              <span>Temperature</span>
              <span className="font-semibold text-console-text">{modelState.current?.temperature ?? 0.1}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-console-border bg-[#fafbfc] px-4 py-3">
              <span>Max tokens</span>
              <span className="font-semibold text-console-text">{modelState.current?.max_tokens ?? 350}</span>
            </div>
          </div>
        </section>

        <ModelSelector
          catalog={modelState.catalog}
          canSwitch={canSwitch}
          onSwitch={async (modelName) => {
            await modelService.switch({ model_name: modelName });
            await loadModels();
          }}
        />
      </div>
    </div>
  );
}

