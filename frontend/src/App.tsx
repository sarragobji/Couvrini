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
import ManagerDashboard from './pages/ManagerDashboard'
import MyCompany from './pages/MyCompany'
import CreateShift from './pages/CreateShift'
import MyShifts from './pages/MyShifts'
import ManagerShiftDetails from './pages/ManagerShiftDetails'
import MyMissions from './pages/MyMissions'

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
          <Route path="/worker/missions" element={<MyMissions />} />
        </Route>

        {/* Manager / Employee protected routes */}
        <Route
          element={
            <ProtectedRoute allowedRoles={['MANAGER', 'EMPLOYEE']} />
          }
        >
          <Route path="/dashboard" element={<ManagerDashboard />} />
          <Route path="/dashboard/company" element={<MyCompany />} />
          <Route path="/dashboard/shifts" element={<MyShifts />} />
          <Route path="/dashboard/shifts/create" element={<CreateShift />} />
          <Route path="/dashboard/shifts/:id" element={<ManagerShiftDetails />} />
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