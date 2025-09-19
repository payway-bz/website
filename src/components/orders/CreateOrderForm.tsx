import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { codes as currencyCodes } from 'currency-codes-ts'

export type CreateOrderInput = {
  amount: number
  description: string
  email: string
  currency: string
}

type Props = {
  onCreate: (input: CreateOrderInput) => void
  onCancel: () => void
}

export default function CreateOrderForm({ onCreate, onCancel }: Props) {
  const [amount, setAmount] = useState<string>('')
  const [description, setDescription] = useState('')
  const [email, setEmail] = useState('')
  const SUPPORTED = ['USD', 'EUR', 'GBP', 'CAD', 'AUD'] as const
  type CurrencyCode = typeof SUPPORTED[number]
  const [currency, setCurrency] = useState<CurrencyCode>('USD')
  const [error, setError] = useState<string | null>(null)

  // Use library for validation, but constrain UI to the five requested codes
  const currencies = useMemo(() => SUPPORTED.slice(), [])

  useEffect(() => {
    const codes = new Set<string>(currencyCodes())
    const missing = SUPPORTED.filter(c => !codes.has(c))
    if (missing.length) {
      console.warn('Some supported currencies not found in currency-codes-ts:', missing)
    }
  }, [])

  const isValid = useMemo(() => {
    const amt = Number(amount)
    const hasAmount = !isNaN(amt) && amt > 0
    const hasEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    const hasDescription = description.trim().length > 0
    return hasAmount && hasEmail && hasDescription
  }, [amount, email, description])

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    const amt = Number(amount)
    if (isNaN(amt) || amt <= 0) return setError('Enter a valid amount')
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError('Enter a valid email')
    if (!description.trim()) return setError('Enter a description')
    if (!currency) return setError('Select a currency')
    onCreate({ amount: amt, description, email, currency })
  }

  return (
    <div className="mb-0">
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700" role="alert">
          {error}
        </div>
      )}
      <form onSubmit={onSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700" htmlFor="amount">Amount</label>
          <input
            id="amount"
            inputMode="decimal"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700" htmlFor="currency">Currency</label>
          <select
            id="currency"
            value={currency}
            onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
            className="mt-1 block w-full rounded-md border-gray-300 bg-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
          >
            {currencies.map((code) => (
              <option key={code} value={code}>{code}</option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700" htmlFor="email">Customer email</label>
          <input
            id="email"
            type="email"
            placeholder="customer@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700" htmlFor="description">Description</label>
          <input
            id="description"
            placeholder="What is this payment for?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
          />
        </div>
        <div className="sm:col-span-2 flex items-center gap-2 justify-end pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!isValid}
            className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Create link
          </button>
        </div>
      </form>
    </div>
  )
}
