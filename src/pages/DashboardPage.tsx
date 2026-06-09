import { useEffect, useState } from 'react'
import { getLatestPrediccion } from '../services/ecobici'
import type { Prediccion } from '../types'
import api from '../services/api'

interface Station {
  station_id: number
  name: string
  bikes_avail: number
  docks_avail: number
  capacity: number
  pct_full: number
  is_renting: number
}

function getStatus(pct: number, isRenting: number) {
  if (!isRenting) return 'offline'
  if (pct <= 0.1) return 'empty'
  if (pct >= 0.9) return 'full'
  if (pct <= 0.25) return 'low'
  return 'ok'
}

const STATUS_CONFIG = {
  ok:      { label: 'Disponible',       color: '#00A651', bg: '#F0FAF4', border: '#C3E8D4' },
  low:     { label: 'Pocas bicis',      color: '#F59E0B', bg: '#FFFBEB', border: '#FDE68A' },
  empty:   { label: 'Sin bicis',        color: '#EF4444', bg: '#FEF2F2', border: '#FECACA' },
  full:    { label: 'Llena',            color: '#3B82F6', bg: '#EFF6FF', border: '#BFDBFE' },
  offline: { label: 'Fuera de servicio',color: '#9CA3AF', bg: '#F9FAFB', border: '#E5E7EB' },
}

function StationCard({ s }: { s: Station }) {
  const status = getStatus(s.pct_full, s.is_renting)
  const cfg = STATUS_CONFIG[status]
  const barW = Math.round(s.pct_full * 100)

  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 16,
        border: '1px solid #F0F0F0',
        padding: '16px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        transition: 'box-shadow 0.2s',
      }}
      onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,166,81,0.15)')}
      onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)')}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div style={{ flex: 1, marginRight: 8 }}>
          <p style={{ color: '#9CA3AF', fontSize: 10, fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 3 }}>
            Est. {String(s.station_id).padStart(3, '0')}
          </p>
          <p style={{ color: '#111827', fontSize: 13, fontWeight: 600, lineHeight: 1.3 }}>{s.name}</p>
        </div>
        <span style={{
          fontSize: 10, fontWeight: 600, color: cfg.color, background: cfg.bg,
          border: `1px solid ${cfg.border}`, borderRadius: 20, padding: '3px 8px', whiteSpace: 'nowrap',
        }}>
          {cfg.label}
        </span>
      </div>

      <div style={{ background: '#F3F4F6', borderRadius: 4, height: 6, overflow: 'hidden', marginBottom: 10 }}>
        <div style={{ width: `${barW}%`, height: '100%', background: cfg.color, borderRadius: 4, transition: 'width 0.5s ease' }} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
        <span>
          <span style={{ color: cfg.color, fontWeight: 700, fontSize: 16 }}>{s.bikes_avail}</span>
          <span style={{ color: '#6B7280', marginLeft: 3 }}>bicis</span>
        </span>
        <span style={{ color: '#9CA3AF' }}>{s.docks_avail} lugares libres</span>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const [stations, setStations] = useState<Station[]>([])
  const [prediccion, setPrediccion] = useState<Prediccion | null>(null)
  const [filter, setFilter] = useState<'all' | 'empty' | 'low' | 'ok' | 'full' | 'offline'>('all')
  const [search, setSearch] = useState('')
  const [lastUpdate, setLastUpdate] = useState(new Date())

  useEffect(() => {
    const load = () => {
      api.get('/estaciones')
        .then(res => {
          setStations(res.data)
          setLastUpdate(new Date())
        })
        .catch(() => null)
      getLatestPrediccion().then(setPrediccion).catch(() => null)
    }

    load()
    const interval = setInterval(load, 30_000)
    return () => clearInterval(interval)
  }, [])

  const filtered = stations.filter(s => {
    const matchFilter = filter === 'all' || getStatus(s.pct_full, s.is_renting) === filter
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
      String(s.station_id).includes(search)
    return matchFilter && matchSearch
  })

  const counts = {
    ok:      stations.filter(s => getStatus(s.pct_full, s.is_renting) === 'ok').length,
    low:     stations.filter(s => getStatus(s.pct_full, s.is_renting) === 'low').length,
    empty:   stations.filter(s => getStatus(s.pct_full, s.is_renting) === 'empty').length,
    full:    stations.filter(s => getStatus(s.pct_full, s.is_renting) === 'full').length,
    offline: stations.filter(s => getStatus(s.pct_full, s.is_renting) === 'offline').length,
  }

  const totalBikes = stations.reduce((acc, s) => acc + s.bikes_avail, 0)

  const filters: { key: typeof filter; label: string; count: number }[] = [
    { key: 'all',     label: 'Todas',        count: stations.length },
    { key: 'empty',   label: 'Sin bicis',     count: counts.empty },
    { key: 'low',     label: 'Pocas',         count: counts.low },
    { key: 'ok',      label: 'Disponibles',   count: counts.ok },
    { key: 'full',    label: 'Llenas',        count: counts.full },
    { key: 'offline', label: 'Offline',       count: counts.offline },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAF8', paddingTop: 64 }}>
      <div style={{ background: '#00A651', padding: '28px 24px 32px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, marginBottom: 4 }}>
            Estado de la red · actualizado a las{' '}
            <span style={{ color: '#fff', fontWeight: 600 }}>
              {lastUpdate.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
            <h1 style={{ color: '#fff', fontSize: 28, fontWeight: 700, margin: 0 }}>
              {totalBikes} bicis disponibles
            </h1>
            <span style={{
              background: 'rgba(255,255,255,0.2)', color: '#fff', fontSize: 11,
              fontWeight: 600, padding: '3px 10px', borderRadius: 20, letterSpacing: '0.05em',
            }}>● LIVE</span>
          </div>
          <div style={{ display: 'flex', gap: 24, marginTop: 20, flexWrap: 'wrap' }}>
            {[
              { label: 'Estaciones OK',     value: counts.ok },
              { label: 'Atención urgente',  value: counts.empty + counts.low },
              { label: 'Total estaciones',  value: stations.length },
              ...(prediccion ? [{ label: 'Precisión modelo', value: `${prediccion.accuracy_semaforo_pct.toFixed(1)}%` }] : []),
            ].map(stat => (
              <div key={stat.label} style={{ textAlign: 'center' }}>
                <p style={{ color: '#fff', fontSize: 22, fontWeight: 700, margin: 0 }}>{stat.value}</p>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, margin: 0 }}>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 16px' }}>
        {prediccion && (
          <div style={{
            background: '#fff', border: '1px solid #E8F5EE', borderLeft: '4px solid #00A651',
            borderRadius: 12, padding: '14px 18px', marginBottom: 20,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12,
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          }}>
            <div>
              <p style={{ color: '#6B7280', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 3 }}>Predicción ML activa</p>
              <p style={{ color: '#111827', fontSize: 13 }}>
                <span style={{ color: '#00A651', fontWeight: 700 }}>{prediccion.movimientos_mitigados_unidades}</span> movimientos mitigados ·{' '}
                <span style={{ color: '#F59E0B', fontWeight: 700 }}>{prediccion.rutas.filter(r => !r.completada).length}</span> rutas pendientes
              </p>
            </div>
            <a href="/predicciones" style={{
              color: '#00A651', fontSize: 13, fontWeight: 600,
              border: '1.5px solid #00A651', borderRadius: 8, padding: '7px 14px',
              textDecoration: 'none', whiteSpace: 'nowrap',
            }}>
              Ver rutas →
            </a>
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexDirection: 'column' }}>
          <input
            type="text"
            placeholder="Buscar estación..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              background: '#fff', border: '1.5px solid #E5E7EB', borderRadius: 10,
              padding: '10px 16px', fontSize: 14, color: '#111827', outline: 'none',
              width: '100%', boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
            }}
          />
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {filters.map(f => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                style={{
                  padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 500,
                  border: filter === f.key ? '1.5px solid #00A651' : '1.5px solid #E5E7EB',
                  background: filter === f.key ? '#00A651' : '#fff',
                  color: filter === f.key ? '#fff' : '#6B7280',
                  cursor: 'pointer', transition: 'all 0.15s',
                }}
              >
                {f.label} {f.count > 0 && <span style={{ opacity: 0.75 }}>({f.count})</span>}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
          {filtered.map(s => <StationCard key={s.station_id} s={s} />)}
          {filtered.length === 0 && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '64px 0', color: '#9CA3AF' }}>
              <p style={{ fontSize: 32, marginBottom: 8 }}>🚲</p>
              <p>No hay estaciones que coincidan</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
