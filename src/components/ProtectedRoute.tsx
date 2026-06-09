import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import type { Rol } from '../types'

interface Props {
  children: React.ReactNode
  roles?: Rol[]
}

export default function ProtectedRoute({ children, roles }: Props) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0f0a] flex items-center justify-center">
        <span className="w-4 h-4 border-2 border-[#2ecc71]/30 border-t-[#2ecc71] rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.rol)) return <Navigate to="/dashboard" replace />

  return <>{children}</>
}
