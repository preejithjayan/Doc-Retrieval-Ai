import Badge from '../ui/Badge';

const toneMap = {
  ADMIN: 'warning',
  MANAGER: 'accent',
  ANALYST: 'success',
  VIEWER: 'default',
  ACTIVE: 'success',
  INACTIVE: 'danger',
};

export default function RoleBadge({ role }) {
  return <Badge tone={toneMap[role] || 'default'}>{role}</Badge>;
}

