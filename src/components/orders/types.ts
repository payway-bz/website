
export type OrderDTO = {
    id: string
    created_at: string
    updated_at: string
    created_by: string
    status: string
    amount: number
    description?: string | null
    customer_email?: string | null
    currency: string
  }

  