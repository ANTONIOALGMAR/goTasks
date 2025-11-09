type Props = { status?: string };

const COLORS: Record<string, string> = {
  todo: 'bg-gray-200 text-gray-800',
  open: 'bg-gray-200 text-gray-800',
  pending: 'bg-gray-200 text-gray-800',
  in_progress: 'bg-blue-200 text-blue-800',
  doing: 'bg-blue-200 text-blue-800',
  done: 'bg-green-200 text-green-800',
  completed: 'bg-green-200 text-green-800',
  canceled: 'bg-red-200 text-red-800',
};

export default function StatusBadge({ status }: Props) {
  const key = (status || '').toLowerCase();
  const color = COLORS[key] || 'bg-gray-100 text-gray-700';
  const label = status ? status.replace(/_/g, ' ') : 'unknown';
  return (
    <span className={`inline-block rounded px-2 py-1 text-xs font-medium ${color}`}>
      {label}
    </span>
  );
}