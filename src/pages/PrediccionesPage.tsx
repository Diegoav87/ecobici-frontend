import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { getLatestPrediccion, ejecutarPrediccion, completarRuta } from '../services/ecobici'
import type { Prediccion, Ruta } from '../types'
import api from '../services/api'

interface Station {
  station_id: number
  name: string
  pct_full: number
  bikes_avail: number
  capacity: number
}

type Prioridad = 'vaciar' | 'llenar' | 'vigilar' | 'ok'

function getPrioridad(pct: number): Prioridad {
  if (pct > 0.75) return 'vaciar'
  if (pct < 0.15) return 'llenar'
  if (pct > 0.65 || pct < 0.25) return 'vigilar'
  return 'ok'
}

function getRutaPrioridad(ruta: Ruta, stationMap: Record<string, Station>): Prioridad {
  const origen = stationMap[ruta.estacion_origen]
  const destino = stationMap[ruta.estacion_destino]
  if (origen?.pct_full > 0.75) return 'vaciar'
  if (destino?.pct_full < 0.15) return 'llenar'
  if (origen?.pct_full > 0.65 || destino?.pct_full < 0.25) return 'vigilar'
  return 'ok'
}

const PRIORIDAD_CONFIG = {
  vaciar:  { label: 'Vaciar urgente',  color: '#EF4444', bg: '#FEF2F2', border: '#FECACA', dot: '#EF4444', order: 0 },
  llenar:  { label: 'Llenar urgente',  color: '#F59E0B', bg: '#FFFBEB', border: '#FDE68A', dot: '#F59E0B', order: 1 },
  vigilar: { label: 'Vigilar',         color: '#3B82F6', bg: '#EFF6FF', border: '#BFDBFE', dot: '#3B82F6', order: 2 },
  ok:      { label: 'Sin urgencia',    color: '#9CA3AF', bg: '#F9FAFB', border: '#E5E7EB', dot: '#9CA3AF', order: 3 },
}

function PctBar({ pct, color }: { pct: number; color: string }) {
  return (
    <div style={{ background: '#F3F4F6', borderRadius: 4, height: 4, overflow: 'hidden', width: 60 }}>
      <div style={{ width: `${Math.round(pct * 100)}%`, height: '100%', background: color, borderRadius: 4 }} />
    </div>
  )
}

function RutaRow({ ruta, prioridad, station, onComplete, canComplete }: {
  ruta: Ruta
  prioridad: Prioridad
  station?: Station
  onComplete: () => void
  canComplete: boolean
}) {
  const [loading, setLoading] = useState(false)
  const cfg = PRIORIDAD_CONFIG[prioridad]

  const handle = async () => {
    setLoading(true)
    try { await onComplete() } finally { setLoading(false) }
  }

  return (
    <div style={{
      background: '#fff',
      border: `1px solid ${ruta.completada ? '#E5E7EB' : cfg.border}`,
      borderLeft: `4px solid ${ruta.completada ? '#E5E7EB' : cfg.color}`,
      borderRadius: 12,
      padding: '12px 16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      opacity: ruta.completada ? 0.55 : 1,
      boxShadow: ruta.completada ? 'none' : '0 1px 4px rgba(0,0,0,0.04)',
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', gap: 6, marginBottom: 5, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: 20, padding: '2px 8px', fontWeight: 600 }}>
            {cfg.label}
          </span>
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
          <div>
            <span style={{ color: '#111827', fontSize: 13, fontWeight: 600 }}>{ruta.estacion_origen}</span>
            {station && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                <PctBar pct={station.pct_full} color={station.pct_full > 0.75 ? '#EF4444' : '#00A651'} />
                <span style={{ fontSize: 10, color: '#9CA3AF' }}>{Math.round(station.pct_full * 100)}%</span>
              </div>
            )}
          </div>
          <span style={{ color: '#00A651', fontWeight: 700, fontSize: 16 }}>→</span>
          <span style={{ color: '#111827', fontSize: 13, fontWeight: 600 }}>{ruta.estacion_destino}</span>
        </div>
        <p style={{ color: '#6B7280', fontSize: 12, marginTop: 4 }}>
          <span style={{ color: cfg.color, fontWeight: 700 }}>{ruta.bicicletas_a_mover}</span> bicicletas a mover
        </p>
      </div>
      {ruta.completada ? (
        <span style={{ color: '#00A651', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap' }}>✓ Completada</span>
      ) : canComplete ? (
        <button onClick={handle} disabled={loading} style={{
          background: cfg.color, color: '#fff', fontWeight: 600, fontSize: 12,
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
  const [stations, setStations] = useState<Record<string, Station>>({})
  const [loading, setLoading] = useState(true)
  const [running, setRunning] = useState(false)
  const [error, setError] = useState('')
  const [filtro, setFiltro] = useState<'all' | Prioridad>('all')
  const canOperate = user?.rol === 'admin' || user?.rol === 'operador'

  const load = () => {
    setLoading(true)
    Promise.all([
      getLatestPrediccion().catch(() => null),
      api.get('/estaciones').catch(() => ({ data: [] })),
    ]).then(([pred, estResp]) => {
      setPrediccion(pred)
      const map: Record<string, Station> = {}
      for (const s of estResp.data) {
        map[String(s.station_id)] = s
        map[s.name] = s
      }
      setStations(map)
    }).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleEjecutar = async () => {
    setRunning(true); setError('')
    try { const p = await ejecutarPrediccion(); setPrediccion(p) }
    catch { setError('Error al ejecutar el modelo. Intenta de nuevo.') }
    finally { setRunning(false) }
  }

  const handleComplete = (rutaId: number) => {
    completarRuta(rutaId).then(load)
  }

  // Agrupar rutas por prioridad
  const rutasConPrioridad = (prediccion?.rutas ?? []).map(r => ({
    ruta: r,
    prioridad: getRutaPrioridad(r, stations),
    station: stations[r.estacion_origen],
  })).sort((a, b) => PRIORIDAD_CONFIG[a.prioridad].order - PRIORIDAD_CONFIG[b.prioridad].order)

  const filtradas = filtro === 'all' ? rutasConPrioridad : rutasConPrioridad.filter(r => r.prioridad === filtro)

  const counts = {
    vaciar:  rutasConPrioridad.filter(r => r.prioridad === 'vaciar').length,
    llenar:  rutasConPrioridad.filter(r => r.prioridad === 'llenar').length,
    vigilar: rutasConPrioridad.filter(r => r.prioridad === 'vigilar').length,
    ok:      rutasConPrioridad.filter(r => r.prioridad === 'ok').length,
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', paddingTop: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAF8' }}>
      <p style={{ color: '#00A651', fontWeight: 500 }}>Cargando predicción...</p>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAF8', paddingTop: 64 }}>
      {/* Header */}
      <div style={{ background: '#00A651', padding: '24px 24px 28px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ color: '#fff', fontSize: 24, fontWeight: 700, margin: 0 }}>Predicciones ML</h1>
            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, marginTop: 4 }}>
              Rutas priorizadas por nivel de urgencia
            </p>
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
            {canOperate && <p style={{ fontSize: 13, marginTop: 6 }}>Ejecuta el modelo para generar rutas.</p>}
          </div>
        ) : (
          <>
            {/* Métricas */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10, marginBottom: 20 }}>
              {[
                { label: 'Precisión', value: `${prediccion.accuracy_semaforo_pct.toFixed(1)}%`, color: '#00A651' },
                { label: 'Mov. mitigados', value: prediccion.movimientos_mitigados_unidades, color: '#F59E0B' },
                { label: 'Dist. optimizada', value: `${prediccion.distancia_total_optimizada_local_km.toFixed(1)} km`, color: '#8B5CF6' },
                { label: 'MAE volumen', value: prediccion.mae_volumen_bicicletas.toFixed(2), color: '#3B82F6' },
              ].map(m => (
                <div key={m.label} style={{ background: '#fff', borderRadius: 12, padding: '12px 14px', border: '1px solid #F0F0F0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                  <p style={{ color: '#6B7280', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>{m.label}</p>
                  <p style={{ color: m.color, fontSize: 20, fontWeight: 700, margin: 0 }}>{m.value}</p>
                </div>
              ))}
            </div>

            {/* Resumen por prioridad */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 20 }}>
              {(['vaciar', 'llenar', 'vigilar', 'ok'] as Prioridad[]).map(p => {
                const cfg = PRIORIDAD_CONFIG[p]
                return (
                  <button key={p} onClick={() => setFiltro(filtro === p ? 'all' : p)} style={{
                    background: filtro === p ? cfg.bg : '#fff',
                    border: `1.5px solid ${filtro === p ? cfg.color : '#E5E7EB'}`,
                    borderRadius: 12, padding: '10px 12px', cursor: 'pointer', textAlign: 'left',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: cfg.dot, display: 'inline-block' }} />
                      <span style={{ fontSize: 10, color: cfg.color, fontWeight: 600 }}>{cfg.label}</span>
                    </div>
                    <p style={{ color: '#111827', fontSize: 22, fontWeight: 700, margin: 0 }}>{counts[p]}</p>
                    <p style={{ color: '#9CA3AF', fontSize: 10, margin: 0 }}>rutas</p>
                  </button>
                )
              })}
            </div>

            {/* Progreso */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <p style={{ color: '#374151', fontSize: 13, fontWeight: 600 }}>
                {filtro === 'all' ? 'Todas las rutas' : PRIORIDAD_CONFIG[filtro].label} —{' '}
                <span style={{ color: '#00A651' }}>{prediccion.rutas.filter(r => r.completada).length}</span>
                <span style={{ color: '#9CA3AF' }}>/{prediccion.rutas.length} completadas</span>
              </p>
              <p style={{ color: '#9CA3AF', fontSize: 11 }}>
                {new Date(prediccion.timestamp_evaluacion).toLocaleString('es-MX')}
              </p>
            </div>

            {/* Rutas */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {filtradas.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#9CA3AF', padding: '40px 0' }}>No hay rutas en esta categoría</p>
              ) : filtradas.map(({ ruta, prioridad, station }) => (
                <RutaRow
                  key={ruta.id}
                  ruta={ruta}
                  prioridad={prioridad}
                  station={station}
                  canComplete={canOperate}
                  onComplete={() => handleComplete(ruta.id)}
                />
              ))}
            </div>
          </>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
