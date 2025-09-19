import { useState, useEffect, useImperativeHandle, forwardRef } from 'react'
import { useAuth } from '../../auth/useAuth'
import { FaWhatsapp } from 'react-icons/fa'
import { FiCopy, FiCheck } from 'react-icons/fi'
import { formatAmount, formatDateTime } from '../../utils/format'
import StatusBadge from '../StatusBadge'
import { getLinkFor, buildWhatsappText } from '../../utils/share'
import type { OrderDTO } from './types'

type OrdersProps = {
  businessId: string
}

export type OrdersHandle = {
  insertRow: (order: OrderDTO) => void
  refresh: () => void
}

function mapOrderDtoToRow(o: OrderDTO) {
  return {
    id: o.id,
    customer: o.customer_email ?? '—',
    amount: o.amount,
    description: o.description ?? undefined,
    currency: o.currency,
    status: o.status,
    created: new Date(o.created_at),
    expiresIn: '—',
  }
}

const Orders = forwardRef<OrdersHandle, OrdersProps>(function Orders({ businessId }, ref) {
  const { user } = useAuth()
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [rows, setRows] = useState<Array<{
    id: string
    customer: string
    amount: number
    description?: string | null
    currency: string
    status: string
    created: Date
    expiresIn: string
  }>>([])
  const [loadingRows, setLoadingRows] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Expose imperative insertRow to parents (e.g., CreateOrderForm can call it after POST)
  useImperativeHandle(ref, () => ({
    insertRow: (order: OrderDTO) => {
      setRows((prev) => [mapOrderDtoToRow(order), ...prev])
    },
    refresh: () => {
      void fetchOrders()
    },
  }), [])

  async function fetchOrders() {
    setError(null)
    if (!user) return
    if (!businessId) return
    setLoadingRows(true)
    try {
      const token = await user.getIdToken()
      const res = await fetch(`/api/orders?business_id=${encodeURIComponent(businessId)}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (!res.ok) throw new Error(`Backend error ${res.status}`)
      const data: OrderDTO[] = await res.json()
      setRows(data.map(mapOrderDtoToRow))
    } catch (e) {
      console.error('Failed to fetch orders', e)
      setError('Failed to load orders. Please try again.')
    } finally {
      setLoadingRows(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [user, businessId])

  const onCopy = async (id: string) => {
    try {
      await navigator.clipboard.writeText(getLinkFor(id))
      setCopiedId(id)
      setTimeout(() => setCopiedId((prev) => (prev === id ? null : prev)), 1500)
    } catch (e) {
      console.error('Failed to copy link', e)
    }
  }
  const onWhatsApp = (id: string) => {
    const row = rows.find(r => r.id === id)
    if (!row) return
    const text = buildWhatsappText(row)
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Customer</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Amount</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Description</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Currency</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Status</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Created</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Expires in</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Share</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {!businessId ? (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-center text-sm text-gray-500">No business selected.</td>
              </tr>
            ) : loadingRows ? (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-center text-sm text-gray-500">Loading…</td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-center text-sm text-red-600">{error}</td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-center text-sm text-gray-500">No orders</td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50/80">
                  <td className="px-4 py-3 text-sm text-gray-900">{r.customer}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{formatAmount(r.amount, r.currency)}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{r.description}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{r.currency}</td>
                  <td className="px-4 py-3 text-sm"><StatusBadge status={r.status} /></td>
                  <td className="px-4 py-3 text-sm text-gray-600">{formatDateTime(r.created)}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{r.expiresIn}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onCopy(r.id)}
                        className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        aria-label="Copy link"
                        title={getLinkFor(r.id)}
                      >
                        <span className="inline-flex w-4 justify-center">
                          {copiedId === r.id ? (
                            <FiCheck className="h-4 w-4 text-green-600" />
                          ) : (
                            <FiCopy className="h-4 w-4" />
                          )}
                        </span>
                        <span>Copy</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onWhatsApp(r.id)}
                        className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        aria-label="Send via WhatsApp"
                        title={`Send payment link to ${r.customer}`}
                      >
                        <FaWhatsapp className="h-4 w-4 text-green-600" />
                        WhatsApp
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
})

export default Orders
