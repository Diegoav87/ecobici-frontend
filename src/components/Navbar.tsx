// Barra de navegación. Los links visibles dependen del rol del usuario
// (ver navItems: viewer solo ve Estaciones, operador suma Predicciones,
// admin ve todo incluyendo Admin).
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const navItems = [
  { to: '/dashboard', label: 'Estaciones', roles: ['admin', 'operador', 'viewer', null] },
  { to: '/predicciones', label: 'Predicciones', roles: ['admin', 'operador'] },
  { to: '/admin', label: 'Admin', roles: ['admin'] },
]

// Colores distintivos por rol, usados en el avatar y la etiqueta del usuario.

const ROL_COLOR: Record<string, { color: string; bg: string }> = {
  admin:    { color: '#92400E', bg: '#FEF3C7' },
  operador: { color: '#065F46', bg: '#D1FAE5' },
  viewer:   { color: '#1E40AF', bg: '#DBEAFE' },
}

export default function Navbar() {
  const { user, signOut } = useAuth()
  const location = useLocation()

  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
      background: '#fff',
      borderBottom: '1px solid #E5E7EB',
      boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 16px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Logo */}
        <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: '#00A651', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="20" height="20" fill="white" viewBox="0 0 24 24">
              <path d="M5 20.5A3.5 3.5 0 0 1 1.5 17 3.5 3.5 0 0 1 5 13.5 3.5 3.5 0 0 1 8.5 17 3.5 3.5 0 0 1 5 20.5M5 12a5 5 0 0 0-5 5 5 5 0 0 0 5 5 5 5 0 0 0 5-5 5 5 0 0 0-5-5m9.8-2H11V8h3.8c1 0 1.82.72 1.96 1.67L17 11.35c.07.34.03.68-.12.97L15.13 15H11v-2h3.4l1.1-2H14.8M19 20.5a3.5 3.5 0 0 1-3.5-3.5 3.5 3.5 0 0 1 3.5-3.5 3.5 3.5 0 0 1 3.5 3.5 3.5 3.5 0 0 1-3.5 3.5m0-9a5 5 0 0 0-5 5 5 5 0 0 0 5 5 5 5 0 0 0 5-5 5 5 0 0 0-5-5"/>
            </svg>
          </div>
          <div>
            <span style={{ color: '#00A651', fontWeight: 700, fontSize: 16, letterSpacing: '-0.02em' }}>ECOBICI</span>
            <span style={{ color: '#9CA3AF', fontSize: 11, marginLeft: 4 }}>ops</span>
          </div>
        </Link>

        {/* Nav links */}
        <nav style={{ display: 'flex', gap: 2 }}>
          {navItems.map(item => {
            const allowed = item.roles.includes(user?.rol ?? null)
            if (!allowed) return null
            const active = location.pathname === item.to
            return (
              <Link
                key={item.to}
                to={item.to}
                style={{
                  padding: '6px 14px',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: active ? 600 : 500,
                  color: active ? '#00A651' : '#6B7280',
                  background: active ? '#F0FAF4' : 'transparent',
                  textDecoration: 'none',
                  transition: 'all 0.15s',
                }}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* User */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 12, padding: '6px 10px 6px 6px' }}>
              <div style={{
                width: 30, height: 30, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: ROL_COLOR[user.rol]?.bg, flexShrink: 0,
              }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: ROL_COLOR[user.rol]?.color }}>
                  {user.nombre.charAt(0).toUpperCase()}
                </span>
              </div>
              <div style={{ lineHeight: 1.2 }}>
                <p style={{ color: '#111827', fontSize: 13, fontWeight: 600, margin: 0 }}>{user.nombre}</p>
                <span style={{ fontSize: 10, fontWeight: 600, color: ROL_COLOR[user.rol]?.color }}>
                  {user.rol}
                </span>
              </div>
              <button
                onClick={signOut}
                title="Cerrar sesión"
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px 0 2px 6px', color: '#9CA3AF', borderLeft: '1px solid #E5E7EB', display: 'flex', alignItems: 'center' }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              style={{ fontSize: 13, fontWeight: 600, color: '#fff', background: '#00A651', borderRadius: 8, padding: '8px 16px', textDecoration: 'none' }}
            >
              Iniciar sesión
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
