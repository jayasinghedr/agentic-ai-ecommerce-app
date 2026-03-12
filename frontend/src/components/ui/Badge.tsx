interface Props {
  label: string;
  variant?: 'offer' | 'status' | 'role';
  status?: string;
}

const statusColors: Record<string, string> = {
  Processing: 'bg-yellow-100 text-yellow-800',
  Shipped: 'bg-blue-100 text-blue-800',
  Delivered: 'bg-green-100 text-green-800',
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-600',
};

export default function Badge({ label, variant = 'offer', status }: Props) {
  if (variant === 'status' && status) {
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[status] ?? 'bg-gray-100 text-gray-600'}`}
      >
        {label}
      </span>
    );
  }

  if (variant === 'role') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-brand-black text-white">
        {label}
      </span>
    );
  }

  // Default offer badge
  return (
    <span className="badge-offer">
      {label}
    </span>
  );
}
