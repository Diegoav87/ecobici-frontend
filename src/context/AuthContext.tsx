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

useEffect(() => {
  if (!token) {
    setLoading(false)  
    return
  }
  getMe()
    .then(setUser)
    .catch(() => {
      localStorage.removeItem('token')
      setToken(null)
    })
    .finally(() => setLoading(false))
}, [token])

  const signIn = async (newToken: string) => {
    localStorage.setItem('token', newToken)
    setToken(newToken)
    const me = await getMe()
    setUser(me)
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
