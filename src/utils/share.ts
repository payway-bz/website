import { formatAmount } from './format'

export const getLinkFor = (id: string, base?: string) => {
  const origin = base ?? window.location.origin
  return `${origin}/pay/${id}`
}

export const buildWhatsappText = (row: any) => {
  const link = getLinkFor(row.id)
  const amount = formatAmount(row.amount, row.currency)
  return `Payment for ${row.customer}: ${amount} — ${link}`
}
