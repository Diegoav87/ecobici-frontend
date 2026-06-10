export type Rol = 'admin' | 'operador' | 'viewer'

export interface Usuario {
  id: number
  nombre: string
  email: string
  rol: Rol
  activo: boolean
}

export interface Ruta {
  id: number
  zona_logistica: number
  estacion_origen: string
  estacion_destino: string
  bicicletas_a_mover: number
  distancia_km: number | null
  vehiculo_asignado: string
  completada: boolean
  completada_at: string | null
}

export interface Prediccion {
  id: number
  timestamp_evaluacion: string
  movimientos_mitigados_unidades: number
  eficiencia_rebalanceo_local_pct: number
  distancia_total_optimizada_local_km: number
  flota_resumen: Record<string, number>
  created_at: string
  rutas: Ruta[]
}

export interface AuditLog {
  id: number
  usuario_id: number | null
  accion: string
  detalle: string | null
  ip_address: string | null
  timestamp: string
}
