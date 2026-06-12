// Instancia central de Axios. Inyecta el token JWT en cada request
// (si existe) y, si el backend responde 401 con un token guardado,
// lo limpia y manda al usuario a /login (sesión expirada o inválida).
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8000',
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (r) => r,
  (error) => {
    if (error.response?.status === 401 && localStorage.getItem('token')) {
      // solo redirige si HAY token y es inválido
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)
export default api
