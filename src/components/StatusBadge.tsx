type Props = { status: string }

export default function StatusBadge({ status }: Props) {
  const base = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium'
  switch (status.toLowerCase()) {
    case 'paid':
      return <span className={`${base} bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20`}>Paid</span>
    case 'pending':
      return <span className={`${base} bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20`}>Pending</span>
    default:
      return <span className={`${base} bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/20`}>Failed</span>
  }
}
