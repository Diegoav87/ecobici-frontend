// Envuelve rutas que requieren sesión activa (y opcionalmente un rol específico).
// Mientras AuthContext valida el token, muestra un spinner para evitar
// parpadeos o redirecciones prematuras a /login.
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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <span className="w-8 h-8 border-4 border-[#00A651]/30 border-t-[#00A651] rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />
// Si el usuario está logueado pero su rol no tiene permiso para esta
// página, lo regresamos al Dashboard en vez de a Login.
  if (roles && !roles.includes(user.rol)) return <Navigate to="/dashboard" replace />

  return <>{children}</>
}
