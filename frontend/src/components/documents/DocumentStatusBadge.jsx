import Badge from '../ui/Badge';

const toneMap = {
  PROCESSED: 'success',
  PROCESSING: 'warning',
  FAILED: 'danger',
  UPLOADED: 'accent',
};

export default function DocumentStatusBadge({ status }) {
  return <Badge tone={toneMap[status] || 'default'}>{status}</Badge>;
}

