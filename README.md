# Ecobici Ops — Frontend

Panel web interno para operaciones de Ecobici CDMX. Permite monitorear el estado en tiempo real de las ~680 estaciones de la red, ejecutar el modelo de predicción de rebalanceo (Machine Learning) y dar seguimiento operativo a las rutas de redistribución de bicicletas, organizadas por alcaldía.

## Stack

- **React 19** + **TypeScript**
- **Vite** como bundler y dev server
- **React Router v7** para ruteo
- **Tailwind CSS v4** para estilos utilitarios
- **Axios** para llamadas HTTP al backend

## Requisitos previos

- Node.js 18 o superior
- El backend de Ecobici corriendo en `http://localhost:8000` (ver repo `ecobici-backend`)
- El servicio de Machine Learning corriendo en `http://localhost:8001` (ver repo `modelo-ml`), consumido indirectamente a través del backend

## Instalación

```bash
npm install
```

## Variables de entorno

Crea un archivo `.env` en la raíz del proyecto (opcional, tiene un valor por defecto):

```
VITE_API_URL=http://localhost:8000
```

Si no se define, el cliente de Axios usa `http://localhost:8000` por defecto (ver `src/services/api.ts`).

## Ejecutar en desarrollo

```bash
npm run dev
```

La app corre por defecto en `http://localhost:5173`.

## Build de producción

```bash
npm run build
npm run preview
```

## Estructura del proyecto

```
src/
  components/
    Navbar.tsx          Barra de navegación superior, muestra rol y datos del usuario
    ProtectedRoute.tsx   Wrapper de rutas que requieren sesión y/o rol específico
  context/
    AuthContext.tsx      Maneja sesión, token JWT y usuario actual
  pages/
    LoginPage.tsx        Login y registro de usuarios
    DashboardPage.tsx    Vista principal — estado en vivo de las estaciones
    PrediccionesPage.tsx Vista de predicciones ML y rutas de rebalanceo
    AdminPage.tsx        Gestión de usuarios y bitácora de auditoría (solo admin)
  services/
    api.ts               Instancia de Axios con interceptores de auth
    ecobici.ts            Funciones que llaman a cada endpoint del backend
  types.ts                 Tipos compartidos (Usuario, Prediccion, Ruta, AuditLog, Rol)
  App.tsx                   Definición de rutas
  main.tsx                  Punto de entrada de React
```

## Autenticación y roles

La sesión se maneja con un JWT guardado en `localStorage`. `AuthContext` carga el usuario actual al iniciar la app (`/auth/me`) y expone `signIn` / `signOut` al resto de la aplicación.

Existen tres roles:

| Rol | Acceso |
|-----|--------|
| `viewer` | Solo puede ver el Dashboard de estaciones |
| `operador` | Dashboard + Predicciones (puede ejecutar el modelo y completar rutas) |
| `admin` | Todo lo anterior + Administración (usuarios y audit log) |

Las rutas `/predicciones` y `/admin` están protegidas con `ProtectedRoute`, que redirige a `/login` si no hay sesión, o a `/dashboard` si el rol no tiene permiso.

## Páginas

### Dashboard (`/dashboard`)

Vista pública (no requiere login) con el estado en tiempo real de la red:

- Total de bicicletas disponibles y resumen de estaciones (OK, atención urgente, offline)
- Buscador por nombre o número de estación
- Filtros por estado de la estación (Sin bicis, Pocas, Disponibles, Llenas, Offline)
- Tarjetas con barra de ocupación, bicis disponibles y lugares libres por estación
- Se actualiza automáticamente cada 30 segundos
- Banner con resumen de la predicción ML activa, si existe

### Predicciones (`/predicciones`)

Requiere rol `admin` u `operador`:

- Botón para ejecutar el modelo de Machine Learning y generar una nueva predicción
- Métricas globales: movimientos mitigados, distancia optimizada, eficiencia de rebalanceo
- Rutas de redistribución agrupadas por nivel de urgencia (Vaciar urgente, Llenar urgente, Vigilar, Sin urgencia) y por zona logística
- Cada ruta muestra estación de origen, destino, bicicletas a mover, vehículo asignado y distancia
- Permite marcar rutas como completadas

### Administración (`/admin`)

Requiere rol `admin`:

- Gestión de usuarios: crear, cambiar rol y activar/desactivar
- Bitácora de auditoría con las acciones del sistema (ejecución de predicciones, creación y edición de usuarios)

## Notas

- El proyecto usa Tailwind v4 vía `@tailwindcss/vite`, configurado en `vite.config.ts`.
- Las páginas principales usan estilos inline (`style={{ ... }}`) en lugar de clases de Tailwind para mantener un diseño visual consistente y autocontenido por componente.
- Si ves un error 401 al cargar `/predicciones/latest` sin haber iniciado sesión, es esperado — esa ruta requiere autenticación.