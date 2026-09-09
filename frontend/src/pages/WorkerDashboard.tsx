import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

function WorkerDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <div>
      <h1>Worker Dashboard</h1>

      <h2>
        Welcome, {user?.firstName}!
      </h2>

      <p>
        Email: {user?.email}
      </p>

      <p>
        Role: {user?.role}
      </p>

      <hr />

      <button onClick={() => navigate('/worker/profile')}>
        My Profile
      </button>

      <button onClick={() => navigate('/worker/skills')}>
        My Skills
      </button>

      <button onClick={() => navigate('/worker/availability')}>
        My Availability
      </button>

      <br />
      <br />

      <button onClick={logout}>
        Logout
      </button>
    </div>
  )
}

export default WorkerDashboard