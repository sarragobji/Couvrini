import api from './axios'

export interface Application {
  id: number
  shiftId: number
  workerId: number
  message?: string
  status: string
  appliedAt: string
  reviewedAt?: string

  worker?: {
    id: number
    firstName: string
    lastName: string
    role: string
  }

  shift?: {
    id: number
    title?: string
    shiftDate: string
    startTime: string
    endTime: string
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

export const getShiftApplications = async (shiftId: number) => {
  const response = await api.get(`/applications/shift/${shiftId}`)
  return response.data as Application[]
}

export const getApplicationById = async (id: number) => {
  const response = await api.get(`/applications/${id}`)
  return response.data as Application
}

export const updateApplicationStatus = async (
  id: number,
  status: 'ACCEPTED' | 'REJECTED',
) => {
  const response = await api.patch(`/applications/${id}/status`, {
    status,
  })

  return response.data as Application
}

export const withdrawApplication = async (id: number) => {
  await api.patch(`/applications/${id}/withdraw`)
}