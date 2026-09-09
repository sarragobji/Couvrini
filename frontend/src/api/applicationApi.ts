import api from './axios'

export interface Application {
  id: number
  shiftId: number
  workerId: number
  message?: string
  status: string
  appliedAt: string
  reviewedAt?: string

  shift?: {
    id: number
    title?: string
    description?: string
    shiftDate: string
    startTime: string
    endTime: string
    location?: string
    paymentAmount?: number
    paymentCurrency?: string
  }
}

export const createApplication = async (
  shiftId: number,
  message?: string,
) => {
  const response = await api.post('/applications', {
    shiftId,
    message,
  })

  return response.data as Application
}

export const getMyApplications = async () => {
  const response = await api.get('/applications/my')

  return response.data as Application[]
}

export const getApplicationById = async (id: number) => {
  const response = await api.get(`/applications/${id}`)

  return response.data as Application
}

export const withdrawApplication = async (id: number) => {
  await api.patch(`/applications/${id}/withdraw`)
}