import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { login } from '../services/ecobici'

export default function LoginPage() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { access_token } = await login(email, password)
      await signIn(access_token)
      navigate('/dashboard')
    } catch {
      setError('Correo o contraseña incorrectos')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAF8', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      {/* Card */}
      <div style={{ background: '#fff', borderRadius: 20, boxShadow: '0 8px 32px rgba(0,0,0,0.1)', padding: '40px 32px', width: '100%', maxWidth: 380 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 64, height: 64, borderRadius: 16, background: '#00A651', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
            <svg width="38" height="38" fill="white" viewBox="0 0 24 24">
              <path d="M5 20.5A3.5 3.5 0 0 1 1.5 17 3.5 3.5 0 0 1 5 13.5 3.5 3.5 0 0 1 8.5 17 3.5 3.5 0 0 1 5 20.5M5 12a5 5 0 0 0-5 5 5 5 0 0 0 5 5 5 5 0 0 0 5-5 5 5 0 0 0-5-5m9.8-2H11V8h3.8c1 0 1.82.72 1.96 1.67L17 11.35c.07.34.03.68-.12.97L15.13 15H11v-2h3.4l1.1-2H14.8M19 20.5a3.5 3.5 0 0 1-3.5-3.5 3.5 3.5 0 0 1 3.5-3.5 3.5 3.5 0 0 1 3.5 3.5 3.5 3.5 0 0 1-3.5 3.5m0-9a5 5 0 0 0-5 5 5 5 0 0 0 5 5 5 5 0 0 0 5-5 5 5 0 0 0-5-5"/>
            </svg>
          </div>
          <h1 style={{ color: '#111827', fontSize: 22, fontWeight: 700, margin: 0 }}>ECOBICI</h1>
          <p style={{ color: '#6B7280', fontSize: 13, marginTop: 4 }}>Panel de operaciones</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', color: '#374151', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
              Correo electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="operador@ecobici.mx"
              style={{
                width: '100%',
                border: '1.5px solid #E5E7EB',
                borderRadius: 10,
                padding: '11px 14px',
                fontSize: 14,
                color: '#111827',
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color 0.15s',
              }}
              onFocus={e => (e.target.style.borderColor = '#00A651')}
              onBlur={e => (e.target.style.borderColor = '#E5E7EB')}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', color: '#374151', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              style={{
                width: '100%',
                border: '1.5px solid #E5E7EB',
                borderRadius: 10,
                padding: '11px 14px',
                fontSize: 14,
                color: '#111827',
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color 0.15s',
              }}
              onFocus={e => (e.target.style.borderColor = '#00A651')}
              onBlur={e => (e.target.style.borderColor = '#E5E7EB')}
            />
          </div>

          {error && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, padding: '10px 14px', marginBottom: 16 }}>
              <p style={{ color: '#DC2626', fontSize: 13, margin: 0 }}>{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              background: loading ? '#86EFAC' : '#00A651',
              color: '#fff',
              fontWeight: 600,
              fontSize: 15,
              border: 'none',
              borderRadius: 10,
              padding: '13px',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background 0.15s',
            }}
          >
            {loading ? 'Entrando...' : 'Iniciar sesión'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, color: '#9CA3AF', fontSize: 12 }}>
          ¿Sin cuenta? Contacta a tu administrador
        </p>
      </div>

      <p style={{ color: '#D1D5DB', fontSize: 11, marginTop: 24 }}>
        © 2025 Ecobici · Panel interno
      </p>
    </div>
  )
}
