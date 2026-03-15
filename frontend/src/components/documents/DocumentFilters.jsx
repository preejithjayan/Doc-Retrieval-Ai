export default function DocumentFilters({
  filters,
  onSearchChange,
  onFilterChange,
}) {
  return (
    <div className="glass-card neural-outline rounded-[30px] p-5">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_repeat(4,minmax(0,1fr))]">
        <input
          aria-label="Search documents"
          value={filters.search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search by filename or owner"
        />
        <select value={filters.status} onChange={(event) => onFilterChange('status', event.target.value)} aria-label="Filter by status">
          <option value="ALL">All statuses</option>
          <option value="PROCESSED">Processed</option>
          <option value="PROCESSING">Processing</option>
          <option value="UPLOADED">Pending</option>
          <option value="FAILED">Failed</option>
        </select>
        <select value={filters.fileType} onChange={(event) => onFilterChange('fileType', event.target.value)} aria-label="Filter by document type">
          <option value="ALL">All types</option>
          <option value="PDF">PDF</option>
          <option value="IMAGE">Image</option>
          <option value="TXT">Text</option>
          <option value="DOCX">DOCX</option>
        </select>
        <input
          type="date"
          aria-label="Start date"
          value={filters.dateFrom}
          onChange={(event) => onFilterChange('dateFrom', event.target.value)}
        />
        <input
          type="date"
          aria-label="End date"
          value={filters.dateTo}
          onChange={(event) => onFilterChange('dateTo', event.target.value)}
        />
      </div>
    </div>
  );
}
