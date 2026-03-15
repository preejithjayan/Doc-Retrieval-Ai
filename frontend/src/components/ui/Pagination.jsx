import Button from './Button';

export default function Pagination({ page, pageSize, count, onPageChange }) {
  const totalPages = Math.max(Math.ceil((count || 0) / pageSize), 1);
  const start = count === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, count || 0);
  const pages = [];

  for (let pageNumber = 1; pageNumber <= totalPages; pageNumber += 1) {
    pages.push(pageNumber);
  }

  return (
    <div className="flex flex-col gap-4 border-t border-white/10 pt-6 md:flex-row md:items-center md:justify-between">
      <p className="text-sm text-slate-400">
        Showing {start}-{end} of {count || 0} results
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="secondary"
          className="px-4 py-2"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          Prev
        </Button>
        {pages.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => onPageChange(item)}
            className={`h-11 w-11 rounded-full border text-sm transition ${
              item === page
                ? 'border-cyan/40 bg-cyan/10 text-cyan shadow-glow'
                : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/20'
            }`}
          >
            {item}
          </button>
        ))}
        <Button
          variant="secondary"
          className="px-4 py-2"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
