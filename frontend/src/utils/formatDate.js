export function formatDate(value, options = {}) {
  if (!value) {
    return 'Unknown';
  }

  return new Intl.DateTimeFormat('en-US', {
    dateStyle: options.dateStyle ?? 'medium',
    timeStyle: options.timeStyle,
  }).format(new Date(value));
}

export function formatRelativeSectionLabel(value) {
  const date = new Date(value);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const matchesDay = (left, right) =>
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate();

  if (matchesDay(date, today)) {
    return 'Today';
  }

  if (matchesDay(date, yesterday)) {
    return 'Yesterday';
  }

  return formatDate(value, { dateStyle: 'long' });
}
