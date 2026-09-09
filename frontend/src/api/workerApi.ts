/*
This file contains the API functions for interacting with the worker profile endpoints. It uses the axios instance defined in axios.ts to make HTTP requests to the backend server. The functions include getting, creating, and updating a worker profile. The WorkerProfile and UpdateWorkerProfile interfaces define the structure of the data returned from and sent to the backend.
Instead of writing the baseURL in every request like api.get('/worker/profile'), we now have getWorkerProfile() which internally calls api.get('/worker/profile'). This way, we can easily change the baseURL if needed, and all requests will automatically use the new baseURL.
*/
import api from './axios'

export interface WorkerProfile {
  userId: number
  bio?: string
  resumeUrl?: string
  yearsOfExperience: number
  averageRating: number
  totalReviews: number
  isVerified: boolean
}

export interface UpdateWorkerProfile {
  bio?: string
  resumeUrl?: string
  yearsOfExperience?: number
}

export const getWorkerProfile = async () => {
  const response = await api.get('/workers/profile')
  return response.data
}

export const createWorkerProfile = async (
  data: UpdateWorkerProfile,
) => {
  const response = await api.post('/workers/profile', data)
  return response.data
}

export const updateWorkerProfile = async (
  data: UpdateWorkerProfile,
) => {
  const response = await api.patch('/workers/profile', data)
  return response.data
}