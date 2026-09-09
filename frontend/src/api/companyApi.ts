import api from './axios'

export interface Company {
  id: number
  name: string
  description?: string
  address?: string
  city?: string
  postalCode?: string
  country?: string
  phone?: string
  email?: string
  websiteUrl?: string
}

export interface CompanyMembership {
  id: number
  companyId: number
  userId: number
  role: string
  company: Company
}

export interface CompanyMember {
  id: number
  userId: number
  companyId: number
  role: string
  joinedAt?: string
  user: {
    id: number
    firstName: string
    lastName: string
    email: string
    role: string
  }
}

export interface CreateCompanyData {
  name: string
  description?: string
  address?: string
  city?: string
  postalCode?: string
  country?: string
  phone?: string
  email?: string
  websiteUrl?: string
}

export const getMyCompanies = async () => {
  const response = await api.get('/companies/my')
  return response.data as CompanyMembership[]
}

export const getCompanyById = async (id: number) => {
  const response = await api.get(`/companies/${id}`)
  return response.data as Company & {
    members: CompanyMember[]
  }
}

export const createCompany = async (data: CreateCompanyData) => {
  const response = await api.post('/companies', data)
  return response.data as Company
}

export const updateCompany = async (
  id: number,
  data: Partial<CreateCompanyData>,
) => {
  const response = await api.patch(`/companies/${id}`, data)
  return response.data as Company
}

export const getCompanyMembers = async (companyId: number) => {
  const response = await api.get(`/companies/${companyId}/members`)
  return response.data as CompanyMember[]
}