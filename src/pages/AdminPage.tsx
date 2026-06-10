import { useEffect, useRef, useState } from 'react'
import { getUsuarios, getAuditLog, crearUsuario, editarUsuario } from '../services/ecobici'
import type { Usuario, AuditLog } from '../types'

type Tab = 'usuarios' | 'audit'
const ROL_OPTIONS = ['viewer', 'operador', 'admin'] as const
const ROL_STYLE: Record<string, { color: string; bg: string }> = {
  admin:    { color: '#92400E', bg: '#FEF3C7' },
  operador: { color: '#065F46', bg: '#D1FAE5' },
  viewer:   { color: '#1E40AF', bg: '#DBEAFE' },
}

function Modal({ onClose, onCreate }: { onClose: () => void; onCreate: () => void }) {
  const [form, setForm] = useState({ nombre: '', email: '', password: '', rol: 'viewer' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError('')
    try { await crearUsuario(form); onCreate(); onClose() }
    catch { setError('No se pudo crear el usuario.') }
    finally { setLoading(false) }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 16 }}>
      <div style={{ background: '#fff', borderRadius: 20, padding: '28px 24px', width: '100%', maxWidth: 400, boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
        <h3 style={{ color: '#111827', fontWeight: 700, fontSize: 18, marginBottom: 20 }}>Nuevo usuario</h3>
        <form onSubmit={handleSubmit}>
          {[
            { key: 'nombre', label: 'Nombre', type: 'text', placeholder: 'Ana García' },
            { key: 'email', label: 'Correo', type: 'email', placeholder: 'ana@ecobici.mx' },
            { key: 'password', label: 'Contraseña', type: 'password', placeholder: '••••••••' },
          ].map(f => (
            <div key={f.key} style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', color: '#374151', fontSize: 13, fontWeight: 500, marginBottom: 5 }}>{f.label}</label>
              <input
                type={f.type}
                placeholder={f.placeholder}
                value={form[f.key as keyof typeof form]}
                onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                required
                style={{ width: '100%', border: '1.5px solid #E5E7EB', borderRadius: 10, padding: '10px 13px', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
          ))}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', color: '#374151', fontSize: 13, fontWeight: 500, marginBottom: 5 }}>Rol</label>
            <select value={form.rol} onChange={e => setForm({ ...form, rol: e.target.value })}
              style={{ width: '100%', border: '1.5px solid #E5E7EB', borderRadius: 10, padding: '10px 13px', fontSize: 14, outline: 'none', background: '#fff' }}>
              {ROL_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          {error && <p style={{ color: '#DC2626', fontSize: 12, marginBottom: 12 }}>{error}</p>}
          <div style={{ display: 'flex', gap: 10 }}>
            <button type="button" onClick={onClose} style={{ flex: 1, border: '1.5px solid #E5E7EB', borderRadius: 10, padding: '11px', fontSize: 13, background: '#fff', cursor: 'pointer', color: '#6B7280' }}>
              Cancelar
            </button>
            <button type="submit" disabled={loading} style={{ flex: 1, background: '#00A651', color: '#fff', border: 'none', borderRadius: 10, padding: '11px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              {loading ? 'Creando...' : 'Crear usuario'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const ACCION_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  EJECUTAR_PREDICCION: { label: 'Predicción ejecutada', color: '#1D4ED8', bg: '#EFF6FF', border: '#BFDBFE' },
  CREAR_USUARIO:       { label: 'Usuario creado',       color: '#065F46', bg: '#D1FAE5', border: '#6EE7B7' },
  EDITAR_USUARIO:      { label: 'Usuario editado',      color: '#92400E', bg: '#FEF3C7', border: '#FDE68A' },
}

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>('usuarios')
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [visibleLogs, setVisibleLogs] = useState(40)
  const sentinelRef = useRef<HTMLDivElement>(null)

  const loadUsuarios = () => getUsuarios().then(setUsuarios).catch(() => null)
  const loadLogs = () => getAuditLog().then(setLogs).catch(() => null)

  useEffect(() => {
    Promise.all([loadUsuarios(), loadLogs()]).finally(() => setLoading(false))
  }, [])

  useEffect(() => { setVisibleLogs(40) }, [tab])

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) setVisibleLogs(c => c + 40)
    }, { threshold: 0.1 })
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [loading])

  const usuarioMap = Object.fromEntries(usuarios.map(u => [u.id, u]))

  if (loading) return (
    <div style={{ minHeight: '100vh', paddingTop: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAF8' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 40, height: 40, border: '3px solid #E5E7EB', borderTopColor: '#00A651', borderRadius: '50%', animation: 'spin 0.7s linear infinite', margin: '0 auto 12px' }} />
        <p style={{ color: '#6B7280', fontSize: 14 }}>Cargando...</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAF8', paddingTop: 64 }}>
      <div style={{ background: '#00A651', padding: '24px 24px 28px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ color: '#fff', fontSize: 24, fontWeight: 700, margin: 0 }}>Administración</h1>
            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, marginTop: 4 }}>Usuarios y registro de actividad</p>
          </div>
          {tab === 'usuarios' && (
            <button onClick={() => setShowModal(true)} style={{
              background: '#fff', color: '#00A651', fontWeight: 700, fontSize: 13,
              border: 'none', borderRadius: 10, padding: '10px 20px', cursor: 'pointer',
            }}>
              + Nuevo usuario
            </button>
          )}
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 16px' }}>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12, padding: 4, width: 'fit-content', marginBottom: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          {(['usuarios', 'audit'] as Tab[]).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: '7px 18px', borderRadius: 9, fontSize: 13, fontWeight: 500, border: 'none', cursor: 'pointer',
              background: tab === t ? '#00A651' : 'transparent',
              color: tab === t ? '#fff' : '#6B7280',
            }}>
              {t === 'usuarios' ? `Usuarios (${usuarios.length})` : 'Audit log'}
            </button>
          ))}
        </div>

        {/* Usuarios */}
        {tab === 'usuarios' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {usuarios.map(u => (
              <div key={u.id} style={{
                background: u.activo ? '#fff' : '#FAFAFA',
                border: `1px solid ${u.activo ? '#F0F0F0' : '#E5E7EB'}`,
                borderRadius: 12, padding: '14px 16px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap',
                boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
              }}>
                <div>
                  <p style={{ color: u.activo ? '#111827' : '#9CA3AF', fontSize: 14, fontWeight: 600, margin: 0 }}>{u.nombre}</p>
                  <p style={{ color: u.activo ? '#6B7280' : '#9CA3AF', fontSize: 12, margin: '2px 0 0' }}>{u.email}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
                    <select value={u.rol} onChange={e => editarUsuario(u.id, { rol: e.target.value }).then(loadUsuarios)}
                      style={{
                        fontSize: 11, fontWeight: 700, borderRadius: 20, cursor: 'pointer', outline: 'none',
                        padding: '4px 24px 4px 10px', appearance: 'none',
                        border: `1.5px solid ${ROL_STYLE[u.rol]?.color}`,
                        color: ROL_STYLE[u.rol]?.color,
                        background: ROL_STYLE[u.rol]?.bg,
                      }}>
                      {ROL_OPTIONS.map(r => <option key={r} value={r} style={{ background: '#fff', color: '#111' }}>{r}</option>)}
                    </select>
                    <svg style={{ position: 'absolute', right: 8, pointerEvents: 'none', color: ROL_STYLE[u.rol]?.color }} width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                  <button onClick={() => editarUsuario(u.id, { activo: !u.activo }).then(loadUsuarios)}
                    style={{
                      fontSize: 12, fontWeight: 500, cursor: 'pointer', borderRadius: 8, padding: '5px 12px',
                      border: `1px solid ${u.activo ? '#FECACA' : '#BBF7D0'}`,
                      background: u.activo ? '#FEF2F2' : '#F0FAF4',
                      color: u.activo ? '#DC2626' : '#00A651',
                    }}>
                    {u.activo ? 'Desactivar' : 'Activar'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Audit log */}
        {tab === 'audit' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {logs.length === 0
              ? <p style={{ textAlign: 'center', color: '#9CA3AF', padding: '48px 0' }}>Sin actividad registrada</p>
              : logs.slice(0, visibleLogs).map(log => {
                  const cfg = ACCION_CONFIG[log.accion]
                  const autor = log.usuario_id ? usuarioMap[log.usuario_id] : null
                  return (
                    <div key={log.id} style={{ background: '#fff', border: '1px solid #F0F0F0', borderRadius: 10, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.03)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                        <div style={{ width: 34, height: 34, borderRadius: 9, background: cfg?.bg ?? '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: `1px solid ${cfg?.border ?? '#E5E7EB'}` }}>
                          <span style={{ fontSize: 15 }}>
                            {log.accion === 'EJECUTAR_PREDICCION' ? '🤖' : log.accion === 'CREAR_USUARIO' ? '👤' : '✏️'}
                          </span>
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3, flexWrap: 'wrap' }}>
                            <span style={{ fontSize: 12, fontWeight: 600, color: cfg?.color ?? '#374151', background: cfg?.bg ?? '#F3F4F6', border: `1px solid ${cfg?.border ?? '#E5E7EB'}`, borderRadius: 20, padding: '2px 8px' }}>
                              {cfg?.label ?? log.accion}
                            </span>
                            {log.detalle && (
                              <span style={{ fontSize: 12, color: '#6B7280' }}>{log.detalle}</span>
                            )}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: 11, color: '#9CA3AF' }}>
                              {autor ? autor.nombre : log.usuario_id ? `Usuario #${log.usuario_id}` : 'Sistema'}
                            </span>
                            {log.ip_address && (
                              <>
                                <span style={{ color: '#E5E7EB' }}>·</span>
                                <span style={{ fontSize: 11, color: '#9CA3AF', fontFamily: 'monospace' }}>{log.ip_address}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <span style={{ fontSize: 11, color: '#9CA3AF', whiteSpace: 'nowrap', flexShrink: 0 }}>
                        {new Date(log.timestamp).toLocaleString('es-MX', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  )
                })
            }
            <div ref={sentinelRef} style={{ height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {visibleLogs < logs.length && (
                <div style={{ width: 24, height: 24, border: '2px solid #E5E7EB', borderTopColor: '#00A651', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
              )}
            </div>
          </div>
        )}
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>

      {showModal && <Modal onClose={() => setShowModal(false)} onCreate={loadUsuarios} />}
    </div>
  )
}
