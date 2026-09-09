import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setError('')
    setLoading(true)

    try {
      await login(email, password)
      const savedUser = JSON.parse(localStorage.getItem('user') || 'null')  
      if (savedUser?.role === 'WORKER') {
        navigate('/worker')
      } else if (savedUser?.role === 'MANAGER' || savedUser?.role === 'EMPLOYEE') {
        navigate('/dashboard')
      } else if (savedUser?.role === 'ADMIN') {
        navigate('/admin')
      }
    } catch (error: any) {
      setError(
        error.response?.data?.message ||
          'Email or password is incorrect.',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1>Login</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {error && <p>{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  )
}

export default Login