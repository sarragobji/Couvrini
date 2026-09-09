/*
/// this file is basically a security gate for the routes that are protected and can only be accessed by authenticated users. It checks if the user is authenticated and if the user has the required role to access the route. If the user is not authenticated or does not have the required role, 
// it redirects the user to the login page. If the user is authenticated and has the required role, it renders the child components of the protected route.
*/
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

interface ProtectedRouteProps {
  allowedRoles?: string[]
}

function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { user, loading } = useAuth()

  if (loading) {
    return <p>Loading...</p>
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

export default ProtectedRoute