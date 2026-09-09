import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import Login from './pages/Login'
import Register from './pages/Register'
import ProtectedRoute from './routes/ProtectedRoute'
import WorkerDashboard from './pages/WorkerDashboard'
import WorkerProfile from './pages/WorkerProfile'
import WorkerSkills from './pages/WorkerSkills'
import WorkerCategories from './pages/WorkerCategories'
import WorkerAvailability from './pages/WorkerAvailability'
import ShiftList from './pages/ShiftList'
import ShiftDetails from './pages/ShiftDetails'
import MyApplications from './pages/MyApplications'

function ManagerDashboard() {
  const { user, logout } = useAuth()
  return (
    <div>
      <h1>Manager Dashboard</h1>
      <p>Welcome, {user?.firstName} {user?.lastName}!</p>
      <button onClick={logout}>
        Logout
      </button>
    </div>
  )
}

function AdminDashboard() {
  const { user, logout } = useAuth()
  return (
    <div>
      <h1>Admin Dashboard</h1>
      <p>Welcome, {user?.firstName} {user?.lastName}!</p>
      <button onClick={logout}>
        Logout
      </button>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Worker protected routes */}
        <Route element={<ProtectedRoute allowedRoles={['WORKER']} />}>
          <Route path="/worker" element={<WorkerDashboard />} />
          <Route path="/worker/profile" element={<WorkerProfile />} />
          <Route path="/worker/skills" element={<WorkerSkills />} />
          <Route path="/worker/categories" element={<WorkerCategories />} />
          <Route path="/worker/availability" element={<WorkerAvailability />} />
          <Route path="/worker/shifts" element={<ShiftList />} />
          <Route path="/worker/shifts/:id" element={<ShiftDetails />} />
          <Route path="/worker/applications" element={<MyApplications />} />
        </Route>

        {/* Manager / Employee protected routes */}
        <Route
          element={
            <ProtectedRoute allowedRoles={['MANAGER', 'EMPLOYEE']} />
          }
        >
          <Route path="/dashboard" element={<ManagerDashboard />} />
        </Route>

        {/* Admin protected routes */}
        <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App