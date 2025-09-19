import { useRef, useState } from 'react'
import Modal from '../Modal'
import CreateOrderForm, { type CreateOrderInput } from './CreateOrderForm'
import OrdersTable, { type OrdersHandle } from './OrdersTable'
import type { OrderDTO } from './types'
import { useAuth } from '../../auth/useAuth'

type Props = {
  businessId: string
}

export default function Orders({ businessId }: Props) {
  const ordersRef = useRef<OrdersHandle>(null)
  const { user } = useAuth()
  const [showCreate, setShowCreate] = useState(false)
  const [banner, setBanner] = useState<null | { type: 'success' | 'error' | 'info'; message: string }>(null)

  const onCreateOrder = async (input: CreateOrderInput) => {
    try {
      if (!user) throw new Error('not authenticated')
      if (!businessId) throw new Error('no selected business')
      const token = await user.getIdToken()
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: input.amount,
          description: input.description,
          email: input.email,
          currency: input.currency,
          business_id: businessId,
        }),
      })
      if (!res.ok) throw new Error(`Backend error ${res.status}`)
      const order: OrderDTO = await res.json()

      // Prepend the newly created order to the table
      ordersRef.current?.insertRow(order)

      setBanner({ type: 'success', message: 'Order created.' })
      setTimeout(() => setBanner(null), 3000)
      setShowCreate(false)
    } catch (e) {
      console.error('Failed to create order', e)
      setBanner({ type: 'error', message: 'Failed to create order. Please try again.' })
      setTimeout(() => setBanner(null), 4000)
    }
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Orders</h2>
        <button
          type="button"
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          disabled={!businessId}
          title={!businessId ? 'Select or create a business first' : 'Create order'}
        >
          Create order
        </button>
      </div>

      {banner && (
        <div className={`rounded-lg border p-3 text-sm ${
          banner.type === 'success'
            ? 'border-green-200 bg-green-50 text-green-800'
            : banner.type === 'error'
            ? 'border-red-200 bg-red-50 text-red-800'
            : 'border-blue-200 bg-blue-50 text-blue-800'
        }`} role="alert">
          {banner.message}
        </div>
      )}

      <OrdersTable ref={ordersRef} businessId={businessId} />

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create order">
        <CreateOrderForm onCreate={onCreateOrder} onCancel={() => setShowCreate(false)} />
      </Modal>
    </section>
  )
}
