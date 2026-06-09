import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { getLatestPrediccion, ejecutarPrediccion, completarRuta } from '../services/ecobici'
import type { Prediccion, Ruta } from '../types'

function RutaRow({ ruta, onComplete, canComplete }: { ruta: Ruta; onComplete: () => void; canComplete: boolean }) {
  const [loading, setLoading] = useState(false)
  const handle = async () => { setLoading(true); try { await onComplete() } finally { setLoading(false) } }

  return (
    <div style={{
      background: '#fff',
      border: ruta.completada ? '1px solid #E5E7EB' : '1px solid #D1FAE5',
      borderLeft: ruta.completada ? '4px solid #E5E7EB' : '4px solid #00A651',
      borderRadius: 12,
      padding: '14px 16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      opacity: ruta.completada ? 0.6 : 1,
      boxShadow: ruta.completada ? 'none' : '0 2px 8px rgba(0,166,81,0.06)',
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', gap: 6, marginBottom: 6, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 11, color: '#6B7280', background: '#F3F4F6', borderRadius: 6, padding: '2px 7px' }}>
            Zona {ruta.zona_logistica}
          </span>
          <span style={{ fontSize: 11, color: '#6B7280', background: '#F3F4F6', borderRadius: 6, padding: '2px 7px' }}>
            {ruta.vehiculo_asignado}
          </span>
          {ruta.distancia_km && (
            <span style={{ fontSize: 11, color: '#6B7280', background: '#F3F4F6', borderRadius: 6, padding: '2px 7px' }}>
              {ruta.distancia_km.toFixed(1)} km
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ color: '#111827', fontSize: 13, fontWeight: 600 }}>{ruta.estacion_origen}</span>
          <span style={{ color: '#00A651', fontWeight: 700 }}>→</span>
          <span style={{ color: '#111827', fontSize: 13, fontWeight: 600 }}>{ruta.estacion_destino}</span>
        </div>
        <p style={{ color: '#6B7280', fontSize: 12, marginTop: 4 }}>
          <span style={{ color: '#00A651', fontWeight: 700 }}>{ruta.bicicletas_a_mover}</span> bicicletas a mover
        </p>
      </div>
      {ruta.completada ? (
        <span style={{ color: '#00A651', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap' }}>
          ✓ Completada
        </span>
      ) : canComplete ? (
        <button onClick={handle} disabled={loading} style={{
          background: '#00A651', color: '#fff', fontWeight: 600, fontSize: 12,
          border: 'none', borderRadius: 8, padding: '8px 16px', cursor: 'pointer',
          whiteSpace: 'nowrap', opacity: loading ? 0.6 : 1,
        }}>
          {loading ? '...' : 'Completar'}
        </button>
      ) : (
        <span style={{ color: '#9CA3AF', fontSize: 12, border: '1px solid #E5E7EB', borderRadius: 8, padding: '7px 12px', whiteSpace: 'nowrap' }}>
          Pendiente
        </span>
      )}
    </div>
  )
}

export default function PrediccionesPage() {
  const { user } = useAuth()
  const [prediccion, setPrediccion] = useState<Prediccion | null>(null)
  const [loading, setLoading] = useState(true)
  const [running, setRunning] = useState(false)
  const [error, setError] = useState('')
  const canOperate = user?.rol === 'admin' || user?.rol === 'operador'

  const load = () => {
    setLoading(true)
    getLatestPrediccion().then(setPrediccion).catch(() => setPrediccion(null)).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleEjecutar = async () => {
    setRunning(true); setError('')
    try { const p = await ejecutarPrediccion(); setPrediccion(p) }
    catch { setError('Error al ejecutar el modelo. Intenta de nuevo.') }
    finally { setRunning(false) }
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', paddingTop: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAF8' }}>
      <p style={{ color: '#00A651', fontWeight: 500 }}>Cargando predicción...</p>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAF8', paddingTop: 64 }}>
      <div style={{ background: '#00A651', padding: '24px 24px 28px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ color: '#fff', fontSize: 24, fontWeight: 700, margin: 0 }}>Predicciones ML</h1>
            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, marginTop: 4 }}>Rutas de rebalanceo generadas por el modelo</p>
          </div>
          {canOperate && (
            <button onClick={handleEjecutar} disabled={running} style={{
              background: '#fff', color: '#00A651', fontWeight: 700, fontSize: 13,
              border: 'none', borderRadius: 10, padding: '10px 20px',
              cursor: running ? 'not-allowed' : 'pointer', opacity: running ? 0.7 : 1,
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              {running ? <>
                <span style={{ width: 14, height: 14, border: '2px solid #00A651', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
                Ejecutando...
              </> : '▶ Ejecutar predicción'}
            </button>
          )}
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 16px' }}>
        {error && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '12px 16px', marginBottom: 20 }}>
            <p style={{ color: '#DC2626', fontSize: 13, margin: 0 }}>{error}</p>
          </div>
        )}

        {!prediccion ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#9CA3AF' }}>
            <p style={{ fontSize: 48, marginBottom: 12 }}>🚲</p>
            <p style={{ fontSize: 16, fontWeight: 500, color: '#374151' }}>No hay predicciones aún</p>
            {canOperate && <p style={{ fontSize: 13, marginTop: 6 }}>Ejecuta el modelo para generar rutas de rebalanceo.</p>}
          </div>
        ) : (
          <>
            {/* Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 10, marginBottom: 20 }}>
              {[
                { label: 'Precisión semáforo', value: `${prediccion.accuracy_semaforo_pct.toFixed(1)}%`, color: '#00A651' },
                { label: 'MAE volumen', value: prediccion.mae_volumen_bicicletas.toFixed(2), color: '#3B82F6' },
                { label: 'Movimientos mitigados', value: prediccion.movimientos_mitigados_unidades, color: '#F59E0B' },
                { label: 'Distancia optimizada', value: `${prediccion.distancia_total_optimizada_local_km.toFixed(1)} km`, color: '#8B5CF6' },
              ].map(m => (
                <div key={m.label} style={{ background: '#fff', borderRadius: 12, padding: '14px 16px', border: '1px solid #F0F0F0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                  <p style={{ color: '#6B7280', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>{m.label}</p>
                  <p style={{ color: m.color, fontSize: 22, fontWeight: 700, margin: 0 }}>{m.value}</p>
                </div>
              ))}
            </div>

            {/* Flota */}
            {Object.keys(prediccion.flota_resumen).length > 0 && (
              <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #F0F0F0', padding: '14px 16px', marginBottom: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <p style={{ color: '#6B7280', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 10 }}>Flota asignada</p>
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                  {Object.entries(prediccion.flota_resumen).map(([v, n]) => (
                    <div key={v} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ color: '#00A651', fontWeight: 700, fontSize: 18 }}>{n as number}</span>
                      <span style={{ color: '#374151', fontSize: 13 }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Rutas */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <p style={{ color: '#374151', fontSize: 14, fontWeight: 600 }}>
                Hoja de ruta —{' '}
                <span style={{ color: '#00A651' }}>{prediccion.rutas.filter(r => r.completada).length}</span>
                <span style={{ color: '#9CA3AF' }}>/{prediccion.rutas.length} completadas</span>
              </p>
              <p style={{ color: '#9CA3AF', fontSize: 12 }}>
                {new Date(prediccion.timestamp_evaluacion).toLocaleString('es-MX')}
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {prediccion.rutas.length === 0
                ? <p style={{ textAlign: 'center', color: '#9CA3AF', padding: '40px 0' }}>No hay rutas generadas</p>
                : prediccion.rutas.map(ruta => (
                    <RutaRow key={ruta.id} ruta={ruta} canComplete={canOperate} onComplete={() => { completarRuta(ruta.id).then(load) }} />
                  ))
              }
            </div>
          </>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
