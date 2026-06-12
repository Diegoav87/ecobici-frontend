// Maneja la sesión del usuario en toda la app.
// El token se guarda en localStorage para persistir el login entre recargas.
// Al montar, si hay un token guardado, intenta validar la sesión con /auth/me.
// Si el token es inválido o expiró, se limpia y se trata como sesión nula.
import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { Usuario } from '../types'
import { getMe } from '../services/ecobici'

interface AuthCtx {
  user: Usuario | null
  token: string | null
  loading: boolean
  signIn: (token: string) => Promise<void>
  signOut: () => void
}

const AuthContext = createContext<AuthCtx | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Usuario | null>(null)
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)

  // Se ejecuta cada vez que cambia `token` (login, logout, carga inicial).
// Si no hay token, no hay nada que validar -> loading=false de inmediato.
  useEffect(() => {
    if (!token) {
      setLoading(false)
      return
    }
    getMe()
      .then(data => {
        setUser(data)
        setLoading(false)
      })
      .catch(() => {
        localStorage.removeItem('token')
        setToken(null)
        setLoading(false)
      })
  }, [token])

  // Guarda el token y obtiene los datos del usuario autenticado.
// Si getMe() falla (token inválido), se revierte el login.

  const signIn = async (newToken: string) => {
    localStorage.setItem('token', newToken)
    setToken(newToken)
    try {
      const me = await getMe()
      setUser(me)
      console.log('signIn ok', me)
    } catch(e) {
      console.log('signIn error', e)
      localStorage.removeItem('token')
      setToken(null)
    }
  }

  const signOut = () => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
