import api from './axios'

export interface ShiftRequiredSkill {
  id: number
  shiftId: number
  skillId: number
  requiredLevel?: string
  skill: {
    id: number
    name: string
  }
}

export interface Shift {
  id: number
  createdByUserId: number
  companyId: number
  categoryId: number

  title?: string
  description?: string

  shiftDate: string
  startTime: string
  endTime: string

  location?: string
  paymentAmount?: number
  paymentCurrency?: string

  status: string
  notes?: string

  requiredSkills?: ShiftRequiredSkill[]

  company?: {
    id: number
    name: string
  }

  category?: {
    id: number
    name: string
    description?: string
  }
}

export interface ShiftFilters {
  status?: string
  categoryId?: number
  date?: string
}

export const getShifts = async (filters?: ShiftFilters) => {
  const response = await api.get('/shifts', {
    params: filters,
  })

  return response.data as Shift[]
}

export const getShiftById = async (id: number) => {
  const response = await api.get(`/shifts/${id}`)

  return response.data as Shift
}