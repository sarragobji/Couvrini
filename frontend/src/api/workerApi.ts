import api from './axios'

export interface Skill {
  id: number
  name: string
  description?: string
  createdAt?: string
  updatedAt?: string
}

export interface Category {
  id: number
  name: string
  description?: string
  createdAt?: string
  updatedAt?: string
}

export interface WorkerSkill {
  id: number
  workerProfileId: number
  skillId: number
  proficiencyLevel?: string
  addedAt?: string
  skill: Skill
}

export interface WorkerCategory {
  id: number
  workerProfileId: number
  categoryId: number
  category: Category
}

export interface Availability {
  id?: number
  workerProfileId?: number
  dayOfWeek: number
  startTime: string
  endTime: string
  isAvailable: boolean
}

export interface WorkerProfile {
  id: number
  userId: number
  bio?: string
  resumeUrl?: string
  yearsOfExperience: number
  averageRating: number
  totalReviews: number
  isVerified: boolean
  skills: WorkerSkill[]
  categories: WorkerCategory[]
  availability?: Availability[]
  createdAt?: string
  updatedAt?: string
}

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

export interface Application {
  id: number
  shiftId: number
  workerId: number
  message?: string
  status: string
  appliedAt: string
  reviewedAt?: string

  worker: {
    id: number
    firstName: string
    lastName: string
    role: string
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
  createdAt?: string
  updatedAt?: string

  company?: {
    id: number
    name: string
  }

  category?: {
    id: number
    name: string
    description?: string
  }

  requiredSkills?: ShiftRequiredSkill[]
  applications?: Application[]
}

export interface ShiftFilters {
  categoryId?: number
  status?: string
  date?: string
  search?: string
}

export interface CreateShiftData {
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
  notes?: string
  requiredSkillIds?: number[]
}

export const getCategories = async () => {
  const response = await api.get('/categories')
  return response.data as Category[]
}

export const getSkills = async () => {
  const response = await api.get('/skills')
  return response.data as Skill[]
}

export const getWorkerProfile = async () => {
  const response = await api.get('/workers/profile')
  return response.data as WorkerProfile
}

export const createWorkerProfile = async (data: {
  bio?: string
  resumeUrl?: string
  yearsOfExperience?: number
}) => {
  const response = await api.post('/workers/profile', data)
  return response.data as WorkerProfile
}

export const updateWorkerProfile = async (data: {
  bio?: string
  resumeUrl?: string
  yearsOfExperience?: number
}) => {
  const response = await api.put('/workers/profile', data)
  return response.data as WorkerProfile
}

export const addWorkerSkill = async (skillId: number) => {
  const response = await api.post('/workers/skills', { skillId })
  return response.data as WorkerSkill
}

export const removeWorkerSkill = async (skillId: number) => {
  await api.delete(`/workers/skills/${skillId}`)
}

export const addWorkerCategory = async (categoryId: number) => {
  const response = await api.post('/workers/categories', { categoryId })
  return response.data as WorkerCategory
}

export const removeWorkerCategory = async (categoryId: number) => {
  await api.delete(`/workers/categories/${categoryId}`)
}

export const getAvailability = async () => {
  const response = await api.get('/workers/availability')
  return response.data as Availability[]
}

export const updateAvailability = async (data: Availability) => {
  const response = await api.post('/workers/availability', data)
  return response.data as Availability
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

export const createShift = async (data: CreateShiftData) => {
  const response = await api.post('/shifts', data)
  return response.data as Shift
}

export const updateShift = async (
  id: number,
  data: Partial<CreateShiftData> & { status?: string },
) => {
  const response = await api.patch(`/shifts/${id}`, data)
  return response.data as Shift
}

export const cancelShift = async (id: number) => {
  await api.delete(`/shifts/${id}`)
}

export const addRequiredSkill = async (
  shiftId: number,
  skillId: number,
  requiredLevel?: string,
) => {
  const response = await api.post(`/shifts/${shiftId}/skills`, {
    skillId,
    requiredLevel,
  })

  return response.data as ShiftRequiredSkill
}

export const removeRequiredSkill = async (
  shiftId: number,
  skillId: number,
) => {
  await api.delete(`/shifts/${shiftId}/skills/${skillId}`)
}