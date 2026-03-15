export default function ModelSelector({ catalog = [], canSwitch = false, onSwitch }) {
  return (
    <div className="panel overflow-hidden">
      <div className="border-b border-console-border bg-slate-50 px-5 py-4">
        <p className="text-sm font-semibold text-console-text">Registered model profiles</p>
        <p className="mt-1 text-xs text-console-muted">Route generation to the active model profile without code changes.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 bg-white">
          <thead className="bg-slate-50 text-left text-[11px] font-semibold uppercase tracking-[0.24em] text-console-muted">
            <tr>
              <th className="px-5 py-3">Name</th>
              <th className="px-5 py-3">Tier</th>
              <th className="px-5 py-3">Hardware</th>
              <th className="px-5 py-3">Identifier</th>
              <th className="px-5 py-3">State</th>
              <th className="px-5 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm text-console-text">
            {catalog.map((model) => (
              <tr key={model.id} className="hover:bg-slate-50/60">
                <td className="px-5 py-4 font-semibold text-console-blue">{model.model_name}</td>
                <td className="px-5 py-4 text-console-muted">{model.model_type.replace('_', ' ')}</td>
                <td className="px-5 py-4 text-console-muted">{model.hardware_requirement}</td>
                <td className="px-5 py-4 text-xs text-console-muted">{model.identifier}</td>
                <td className="px-5 py-4">
                  <span className={model.is_active ? 'tag-success' : 'tag-muted'}>{model.is_active ? 'Active' : 'Inactive'}</span>
                </td>
                <td className="px-5 py-4 text-right">
                  {canSwitch && !model.is_active ? (
                    <button type="button" onClick={() => onSwitch(model.model_name)} className="console-button-secondary px-3 py-2 text-sm font-semibold">
                      Set active
                    </button>
                  ) : (
                    <span className="text-xs text-console-muted">{model.is_active ? 'In use' : 'Read only'}</span>
                  )}
                </td>
              </tr>
            ))}
            {!catalog.length && (
              <tr>
                <td colSpan="6" className="px-5 py-8 text-center text-sm text-console-muted">
                  No models are registered yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

