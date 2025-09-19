import { useEffect, type ReactNode } from 'react'

type Props = {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
}

export default function Modal({ open, onClose, title, children }: Props) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="absolute inset-0 flex items-start sm:items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-lg rounded-xl bg-white shadow-xl ring-1 ring-black/5">
          {title && (
            <div className="px-5 pt-5 pb-2">
              <h2 className="text-base font-semibold text-gray-900">{title}</h2>
            </div>
          )}
          <div className="px-5 pb-5 pt-3">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
