import { Search } from 'lucide-react';

export default function SearchBar({ value, onChange, onSubmit, placeholder = 'Search...' }) {
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3 md:flex-row">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-console-muted" size={16} />
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="w-full pl-9"
        />
      </div>
      <button type="submit" className="console-button-primary px-5 py-2 text-sm font-semibold">
        Run search
      </button>
    </form>
  );
}

