import api from './api'
import type { Prediccion, Ruta, Usuario, AuditLog } from '../types'

// Auth
export const login = async (email: string, password: string) => {
  const form = new URLSearchParams()
  form.append('username', email)
  form.append('password', password)
  const { data } = await api.post('/auth/login', form, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })
  return data as { access_token: string; token_type: string }
}

export const getMe = async () => {
  const { data } = await api.get('/auth/me')
  return data as Usuario
}

// Predicciones
export const getLatestPrediccion = async () => {
  const { data } = await api.get('/predicciones/latest')
  return data as Prediccion
}

export const getPredicciones = async () => {
  const { data } = await api.get('/predicciones')
  return data as Prediccion[]
}

export const ejecutarPrediccion = async () => {
  const { data } = await api.post('/predicciones/ejecutar')
  return data as Prediccion
}

// Rutas
export const completarRuta = async (rutaId: number) => {
  const { data } = await api.patch(`/rutas/${rutaId}/completar`)
  return data as Ruta
}

// Admin
export const getUsuarios = async () => {
  const { data } = await api.get('/admin/usuarios')
  return data as Usuario[]
}

export const crearUsuario = async (payload: {
  nombre: string
  email: string
  password: string
  rol: string
}) => {
  const { data } = await api.post('/admin/usuarios', payload)
  return data as Usuario
}

export const editarUsuario = async (
  id: number,
  payload: { nombre?: string; rol?: string; activo?: boolean }
) => {
  const { data } = await api.patch(`/admin/usuarios/${id}`, payload)
  return data as Usuario
}

export const getAuditLog = async () => {
  const { data } = await api.get('/admin/audit-log')
  return data as AuditLog[]
}
