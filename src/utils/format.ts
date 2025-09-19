export const formatAmount = (n: number, currency: string) =>
  new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(n)

export const formatDateTime = (d: Date) =>
  d.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
