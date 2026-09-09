import api from './axios'

export interface WorkerSkill {
  id: number
  skillId: number
  proficiencyLevel: string
  skill: Skill
}

export interface Skill {
  id: number
  name: string
}

export interface WorkerCategory {
  id: number
  categoryId: number
  category: Category
}

export interface Category {
  id: number
  name: string
  description?: string
}

export interface Availability {
  id?: number
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
  availability: Availability[]
}

export interface UpdateWorkerProfile {
  bio?: string
  resumeUrl?: string
  yearsOfExperience?: number
}

// ==================== PROFILE ====================

export const getWorkerProfile = async () => {
  const response = await api.get('/workers/profile')
  return response.data as WorkerProfile
}

export const createWorkerProfile = async (
  data: UpdateWorkerProfile,
) => {
  const response = await api.post('/workers/profile', data)
  return response.data as WorkerProfile
}

export const updateWorkerProfile = async (
  data: UpdateWorkerProfile,
) => {
  const response = await api.put('/workers/profile', data)
  return response.data as WorkerProfile
}

// ==================== SKILLS ====================

export const getSkills = async () => {
  const response = await api.get('/skills')
  return response.data as Skill[]
}

export const addWorkerSkill = async (skillId: number) => {
  const response = await api.post('/workers/skills', {
    skillId,
  })

  return response.data as WorkerSkill
}

export const removeWorkerSkill = async (skillId: number) => {
  await api.delete(`/workers/skills/${skillId}`)
}

// ==================== CATEGORIES ====================

export const getCategories = async () => {
  const response = await api.get('/categories')
  return response.data as Category[]
}

export const addWorkerCategory = async (categoryId: number) => {
  const response = await api.post('/workers/categories', {
    categoryId,
  })

  return response.data as WorkerCategory
}

export const removeWorkerCategory = async (
  categoryId: number,
) => {
  await api.delete(`/workers/categories/${categoryId}`)
}

// ==================== AVAILABILITY ====================

export const getAvailability = async () => {
  const response = await api.get('/workers/availability')
  return response.data as Availability[]
}

export const updateAvailability = async (
  availability: Availability,
) => {
  const response = await api.post('/workers/availability', availability)
  return response.data as Availability
}