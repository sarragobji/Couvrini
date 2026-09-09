import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

export default api
// instead of writing the baseURL in every request, we can set it once in the axios instance. This way, we can easily change the baseURL if needed, and all requests will automatically use the new baseURL.