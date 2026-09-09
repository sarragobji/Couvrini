import api from './axios'

export type MissionStatus =
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'

export interface Mission {
  id: number
  shiftId: number
  companyId: number
  workerId: number
  applicationId?: number
  status: MissionStatus
  startedAt?: string
  completedAt?: string
  createdAt?: string
  updatedAt?: string

  shift: {
    id: number
    title?: string
    description?: string
    shiftDate: string
    startTime: string
    endTime: string
    location?: string
    paymentAmount: number
    paymentCurrency: string
    status: string
  }

  company: {
    id: number
    name: string
  }
}

export const getMyMissions = async (): Promise<Mission[]> => {
  const response = await api.get('/missions/my')
  return response.data
}

export const getMissionById = async (id: number): Promise<Mission> => {
  const response = await api.get(`/missions/${id}`)
  return response.data
}

export const startMission = async (id: number): Promise<Mission> => {
  const response = await api.post(`/missions/${id}/start`)
  return response.data
}

export const completeMission = async (id: number): Promise<Mission> => {
  const response = await api.post(`/missions/${id}/complete`)
  return response.data
}

export const cancelMission = async (id: number): Promise<Mission> => {
  const response = await api.post(`/missions/${id}/cancel`)
  return response.data
}