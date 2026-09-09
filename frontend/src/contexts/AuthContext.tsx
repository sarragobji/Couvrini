/* 
/// This file is the central place to manage the authentication state of the application. It provides a context that can be used by any component in the application to access the current user's authentication status and information. 
///Instead of login and register who right now handle the authentication state, we will use this context to manage the authentication state with localStorage, this file will provide a context that can be used by any component in the application to access the current user's authentication status and information.
*/
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import api from '../api/axios'

export interface User {
  id: number
  email: string
  firstName: string
  lastName: string
  phone?: string
  profilePhotoUrl?: string
  role: string
  accountStatus: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: {
    email: string
    password: string
    firstName: string
    lastName: string
  }) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('user')

    return savedUser ? JSON.parse(savedUser) : null
  })

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('accessToken')

    if (!token) {
      setLoading(false)
      return
    }

    api
      .get('/auth/me') // After refreshing the browser, we check if the saved login token is still valid by making a request to the backend to get the current user's information. If the token is valid, we set the user state with the returned user data. If the token is invalid or expired, we remove the token and user data from localStorage and set the user state to null.
      .then((response) => {
        setUser(response.data)
        localStorage.setItem('user', JSON.stringify(response.data))
      })
      .catch(() => {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('user')
        setUser(null)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  const login = async (email: string, password: string) => {
    const response = await api.post('/auth/login', {
      email,
      password,
    })

    const { accessToken, user } = response.data

    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('user', JSON.stringify(user))

    setUser(user)
  }

  const register = async (data: {
    email: string
    password: string
    firstName: string
    lastName: string
  }) => {
    const response = await api.post('/auth/register', data)

    const { accessToken, user } = response.data

    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('user', JSON.stringify(user))

    setUser(user)
  }

  const logout = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('user')
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }

  return context
}