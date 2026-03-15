export function formatDateTime(value) {
  if (!value) return 'Unknown';
  return new Date(value).toLocaleString();
}

export function formatRelativeDate(value) {
  if (!value) return 'Unknown';
  const date = new Date(value);
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export function groupByDate(items, key = 'timestamp') {
  return items.reduce((accumulator, item) => {
    const date = new Date(item[key]).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    accumulator[date] = accumulator[date] || [];
    accumulator[date].push(item);
    return accumulator;
  }, {});
}

export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

