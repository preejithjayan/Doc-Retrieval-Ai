export function truncate(value, maxLength = 120) {
  if (!value || value.length <= maxLength) {
    return value ?? '';
  }
  return `${value.slice(0, maxLength).trim()}...`;
}
