import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { login, register } from '../services/ecobici'

type Mode = 'login' | 'register'

export default function LoginPage() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState<Mode>('login')  // moved inside component
  const [nombre, setNombre] = useState('')          // moved inside component
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (mode === 'register') {
        await register(nombre, email, password)  // wrapped in try/catch
        setMode('login')
        setNombre('')
        setEmail('')
        setPassword('')
      } else {
        const { access_token } = await login(email, password)
        await signIn(access_token)
        navigate('/dashboard')
      }
    } catch {
      setError(mode === 'register' ? 'Error al crear la cuenta' : 'Correo o contraseña incorrectos')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAF8', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: '#fff', borderRadius: 20, boxShadow: '0 8px 32px rgba(0,0,0,0.1)', padding: '40px 32px', width: '100%', maxWidth: 380 }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ width: 64, height: 64, borderRadius: 16, background: '#00A651', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
            <svg width="38" height="38" fill="white" viewBox="0 0 24 24">
              <path d="M5 20.5A3.5 3.5 0 0 1 1.5 17 3.5 3.5 0 0 1 5 13.5 3.5 3.5 0 0 1 8.5 17 3.5 3.5 0 0 1 5 20.5M5 12a5 5 0 0 0-5 5 5 5 0 0 0 5 5 5 5 0 0 0 5-5 5 5 0 0 0-5-5m9.8-2H11V8h3.8c1 0 1.82.72 1.96 1.67L17 11.35c.07.34.03.68-.12.97L15.13 15H11v-2h3.4l1.1-2H14.8M19 20.5a3.5 3.5 0 0 1-3.5-3.5 3.5 3.5 0 0 1 3.5-3.5 3.5 3.5 0 0 1 3.5 3.5 3.5 3.5 0 0 1-3.5 3.5m0-9a5 5 0 0 0-5 5 5 5 0 0 0 5 5 5 5 0 0 0 5-5 5 5 0 0 0-5-5"/>
            </svg>
          </div>
          <h1 style={{ color: '#111827', fontSize: 22, fontWeight: 700, margin: 0 }}>ECOBICI</h1>
          <p style={{ color: '#6B7280', fontSize: 13, marginTop: 4 }}>Panel de operaciones</p>
        </div>

        {/* Tab switcher */}
        <div style={{ display: 'flex', gap: 4, background: '#F3F4F6', borderRadius: 10, padding: 4, marginBottom: 24 }}>
          {(['login', 'register'] as Mode[]).map(m => (
            <button
              key={m}
              type="button"
              onClick={() => { setMode(m); setError('') }}
              style={{
                flex: 1, padding: '8px', border: 'none', borderRadius: 8,
                background: mode === m ? '#00A651' : 'transparent',
                color: mode === m ? '#fff' : '#6B7280',
                fontWeight: 600, fontSize: 13, cursor: 'pointer',
              }}
            >
              {m === 'login' ? 'Iniciar sesión' : 'Registrarse'}
            </button>
          ))}
        </div>

        {/* Form — wraps everything including nombre */}
        <form onSubmit={handleSubmit}>
          {mode === 'register' && (
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', color: '#374151', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
                Nombre completo
              </label>
              <input
                type="text"
                value={nombre}
                onChange={e => setNombre(e.target.value)}
                required
                placeholder="Ana García"
                style={{ width: '100%', border: '1.5px solid #E5E7EB', borderRadius: 10, padding: '11px 14px', fontSize: 14, color: '#111827', outline: 'none', boxSizing: 'border-box' }}
                onFocus={e => (e.target.style.borderColor = '#00A651')}
                onBlur={e => (e.target.style.borderColor = '#E5E7EB')}
              />
            </div>
          )}

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
              style={{ width: '100%', border: '1.5px solid #E5E7EB', borderRadius: 10, padding: '11px 14px', fontSize: 14, color: '#111827', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.15s' }}
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
              style={{ width: '100%', border: '1.5px solid #E5E7EB', borderRadius: 10, padding: '11px 14px', fontSize: 14, color: '#111827', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.15s' }}
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
              color: '#fff', fontWeight: 600, fontSize: 15, border: 'none',
              borderRadius: 10, padding: '13px',
              cursor: loading ? 'not-allowed' : 'pointer', transition: 'background 0.15s',
            }}
          >
            {loading ? 'Cargando...' : mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
          </button>
        </form>
      </div>

      <p style={{ color: '#D1D5DB', fontSize: 11, marginTop: 24 }}>
        © 2025 Ecobici · Panel interno
      </p>
    </div>
  )
}