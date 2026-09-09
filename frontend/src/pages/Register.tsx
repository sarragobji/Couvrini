import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

function Register() {
  const navigate = useNavigate()
  const { register } = useAuth()

  const [form, setForm] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
  })

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setError('')
    setLoading(true)

    try {
      await register(form)
      const savedUser = JSON.parse(localStorage.getItem('user') || 'null')
      if (savedUser?.role === 'WORKER') {
        navigate('/worker')
      } else if (savedUser?.role === 'MANAGER' || savedUser?.role === 'EMPLOYEE') {
        navigate('/dashboard')
      }
    } catch (error: any) {
      const message = error.response?.data?.message

      setError(
        Array.isArray(message)
          ? message.join(', ')
          : message || 'Registration failed.',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1>Register</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label>First name</label>
          <input
            name="firstName"
            value={form.firstName}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Last name</label>
          <input
            name="lastName"
            value={form.lastName}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Password</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
          />
        </div>

        {error && <p>{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? 'Creating account...' : 'Register'}
        </button>
      </form>
    </div>
  )
}

export default Register