import { Cpu, Sparkles } from 'lucide-react';

import { useTilt } from '../../hooks/useTilt';
import Badge from '../ui/Badge';
import Button from '../ui/Button';

export default function ModelCard({ model, metadata, isPending, onActivate }) {
  const tiltProps = useTilt();

  return (
    <article
      className={`glass-card neural-outline rounded-[28px] p-5 ${model.is_active ? 'shadow-glow' : ''}`}
      {...tiltProps}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-display text-xl font-semibold">{model.model_name}</p>
          <p className="mt-2 text-sm text-slate-400">{metadata.description}</p>
        </div>
        {model.is_active ? <Badge tone="info">Active</Badge> : null}
      </div>

      <div className="mt-5 grid gap-3">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <Sparkles className="h-4 w-4 text-cyan" />
            Quality
          </div>
          <div className="mt-3 h-2 rounded-full bg-white/10">
            <div className="h-full rounded-full bg-gradient-to-r from-violet to-cyan" style={{ width: `${metadata.quality}%` }} />
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <Cpu className="h-4 w-4 text-violet-300" />
            Speed
          </div>
          <div className="mt-3 h-2 rounded-full bg-white/10">
            <div className="h-full rounded-full bg-gradient-to-r from-cyan to-sky-400" style={{ width: `${metadata.speed}%` }} />
          </div>
        </div>
      </div>

      <p className="mt-5 text-sm text-slate-400">{model.hardware_requirement}</p>

      <div className="mt-6">
        <Button type="button" variant={model.is_active ? 'secondary' : 'primary'} disabled={isPending || model.is_active} onClick={() => onActivate(model.model_name)}>
          {isPending && !model.is_active ? 'Switching...' : model.is_active ? 'Currently Active' : 'Activate'}
        </Button>
      </div>
    </article>
  );
}
