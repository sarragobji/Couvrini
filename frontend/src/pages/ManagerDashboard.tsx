import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

function ManagerDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <div>
      <h1>Manager Dashboard</h1>

      <h2>
        Welcome, {user?.firstName}!
      </h2>

      <p>Email: {user?.email}</p>
      <p>Role: {user?.role}</p>

      <hr />

      <button onClick={() => navigate('/dashboard/company')}>
        My Company
      </button>

      <button onClick={() => navigate('/dashboard/shifts')}>
        My Shifts
      </button>

      <button onClick={() => navigate('/dashboard/shifts/create')}>
        Create Replacement Shift
      </button>

      <hr />

      <button onClick={logout}>
        Logout
      </button>
    </div>
  )
}

export default ManagerDashboard