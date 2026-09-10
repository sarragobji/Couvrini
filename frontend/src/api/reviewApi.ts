import api from './axios'

export type ReviewRating =
  | 'ONE'
  | 'TWO'
  | 'THREE'
  | 'FOUR'
  | 'FIVE'

export interface Review {
  id: number
  missionId: number
  reviewerId: number
  reviewedUserId: number
  rating: ReviewRating
  comment?: string
  createdAt?: string
  updatedAt?: string

  reviewer?: {
    id: number
    firstName: string
    lastName: string
  }

  reviewedUser?: {
    id: number
    firstName: string
    lastName: string
    role?: string
  }

  mission?: {
    id: number
    status: string
    shift?: {
      id: number
      title?: string
      shiftDate?: string
    }
  }
}

export interface CreateReviewData {
  missionId: number
  rating: ReviewRating
  comment?: string
}

export const createReview = async (
  data: CreateReviewData,
): Promise<Review> => {
  const response = await api.post('/reviews', data)
  return response.data
}

export const getMyReviews = async (): Promise<Review[]> => {
  const response = await api.get('/reviews')
  return response.data
}

export const getReviewById = async (
  id: number,
): Promise<Review> => {
  const response = await api.get(`/reviews/${id}`)
  return response.data
}

export const getUserReviews = async (
  userId: number,
): Promise<Review[]> => {
  const response = await api.get(`/reviews/users/${userId}`)
  return response.data
}