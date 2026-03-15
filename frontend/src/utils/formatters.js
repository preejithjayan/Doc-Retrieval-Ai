export function formatDate(value) {
  if (!value) return 'Unknown';
  return new Date(value).toLocaleString();
}

export function statusTone(status) {
  if (status === 'PROCESSED') return 'tag-success';
  if (status === 'PROCESSING') return 'tag-warning';
  if (status === 'FAILED') return 'tag-danger';
  return 'tag-muted';
}

export function roleLabel(role) {
  return role || 'VIEWER';
}

