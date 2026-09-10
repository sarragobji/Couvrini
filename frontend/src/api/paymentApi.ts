import api from './axios'

export type PaymentStatus =
  | 'PENDING'
  | 'COMPLETED'
  | 'FAILED'
  | 'REFUNDED'

export interface Payment {
  id: number
  missionId: number
  payerId: number
  recipientId: number
  amount: number
  currency: string
  status: PaymentStatus
  createdAt?: string
  updatedAt?: string
  paymentDate?: string

  mission?: {
    id: number
    status: string
    workerId: number
    shift?: {
      id: number
      title?: string
      shiftDate: string
      startTime: string
      endTime: string
      paymentAmount: number
      paymentCurrency: string
    }
    company?: {
      id: number
      name: string
    }
  }
}

export const getPayments = async (): Promise<Payment[]> => {
  const response = await api.get('/payments')
  return response.data
}

export const getPaymentById = async (id: number): Promise<Payment> => {
  const response = await api.get(`/payments/${id}`)
  return response.data
}

export const createPayment = async (
  missionId: number,
  currency?: string,
): Promise<Payment> => {
  const response = await api.post('/payments', {
    missionId,
    currency,
  })

  return response.data
}

export const updatePaymentStatus = async (
  id: number,
  status: PaymentStatus,
): Promise<Payment> => {
  const response = await api.patch(`/payments/${id}/status`, {
    status,
  })

  return response.data
}