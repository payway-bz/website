import { Navigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'

function Base() {
  const { user, loading } = useAuth()
  if (loading) return null
  return <Navigate to={user ? '/transactions' : '/login'} replace />
}

export default Base
