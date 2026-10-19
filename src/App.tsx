import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Login from './pages/Login'
import Layout from './components/Layout'
import UsuarioPage from './pages/UsuarioPages'
import type { ReactNode } from 'react'
import AgregarUsuarioPage from './pages/AgregarUsuarioPage'
import EditarUsuarioPage from './pages/EditarUsuarioPage'
import ProductoPage from './pages/ProductoPage'
import AgregarProductoPage from './pages/AgregarProductoPage'
import EditarProductoPage from './pages/EditarProductoPage'
// Importaciones del módulo de Proveedores
import ProveedorPage from './pages/ProveedorPage'
import AgregarProveedorPage from './pages/AgregarProveedorPage'
import EditarProveedorPage from './pages/EditarProveedorPage'
// Importaciones del módulo de Orden de Compra
import AgregarOrdenPage from './pages/AgregarOrdenPage'
import ListarOrdenesPage from './pages/ListarOrdenesPage'
import EditarOrdenPage from './pages/EditarOrdenPage'
// Importaciones del módulo de Módulos
import ModulosPage from './pages/ModulosPage'
import AgregarModuloPage from './pages/AgregarModuloPage'
import EditarModuloPage from './pages/EditarModuloPage'
// Importaciones del módulo de Roles
import RolesPage from './pages/RolesPage'
import RolFormularioPage from './pages/RolFormularioPage'
// Importaciones del módulo de Recepción
import RecepcionPage from './pages/RecepcionPage'

import InventarioPage from './pages/InventarioPage'
function RutaProtegida({ children }: { children: ReactNode }) {
  const estaLogueado = !!localStorage.getItem('token')
  return estaLogueado ? children : <Navigate to="/" replace />
}

// Lee los módulos permitidos del localStorage (guardados en el login)
const obtenerModulos = () => {
  try {
    return JSON.parse(localStorage.getItem('modulos') ?? '[]')
  } catch {
    return []
  }
}

// Verifica que la ruta visitada esté entre los módulos del usuario
function RutaModulo({ children }: { children: ReactNode }) {
  const location = useLocation()
  const segmentos = location.pathname.split('/')
  const prefijo = '/' + segmentos[1] + '/' + segmentos[2]   // '/dashboard/ordenes'

  const permitida = obtenerModulos().some((m: any) =>
    prefijo === m.rutaFront ||
    m.rutaFront.startsWith(prefijo) ||      // módulo "Nueva Orden" (/dashboard/ordenes/nueva) da acceso a /dashboard/ordenes/*
    prefijo.startsWith(m.rutaFront)
  )
  return permitida ? <>{children}</> : <Navigate to="/dashboard" replace />
}

// Manda al primer módulo permitido del usuario
function InicioDashboard() {
  const modulos = obtenerModulos()
  return <Navigate to={modulos[0]?.rutaFront ?? '/'} replace />
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route
          path="/dashboard"
          element={
            <RutaProtegida>
              <Layout />
            </RutaProtegida>
          }
        >
          <Route index element={<InicioDashboard />} />

          <Route path="usuarios" element={<RutaModulo><UsuarioPage /></RutaModulo>} />
          <Route path="usuarios/agregar" element={<RutaModulo><AgregarUsuarioPage /></RutaModulo>} />
          <Route path="usuarios/editar/:codigoUsuario" element={<RutaModulo><EditarUsuarioPage /></RutaModulo>} />

          <Route path="productos" element={<RutaModulo><ProductoPage /></RutaModulo>} />
          <Route path="productos/agregar" element={<RutaModulo><AgregarProductoPage /></RutaModulo>} />
          <Route path="productos/editar/:codigoProducto" element={<RutaModulo><EditarProductoPage /></RutaModulo>} />

          {/* RUTAS DEL MÓDULO PROVEEDORES */}
          <Route path="proveedores" element={<RutaModulo><ProveedorPage /></RutaModulo>} />
          <Route path="proveedores/agregar" element={<RutaModulo><AgregarProveedorPage /></RutaModulo>} />
          <Route path="proveedores/editar/:codigoProveedor" element={<RutaModulo><EditarProveedorPage /></RutaModulo>} />

          {/* RUTAS DEL MÓDULO ORDEN DE COMPRA */}
          <Route path="ordenes/nueva" element={<RutaModulo><AgregarOrdenPage /></RutaModulo>} />
          <Route path="ordenes/listar" element={<RutaModulo><ListarOrdenesPage /></RutaModulo>} />
          <Route path="ordenes/editar/:codigoCompra" element={<RutaModulo><EditarOrdenPage /></RutaModulo>} />

          {/* RUTAS DEL MÓDULO MODULOS */}
          <Route path="modulos" element={<RutaModulo><ModulosPage /></RutaModulo>} />
          <Route path="modulos/nuevo" element={<RutaModulo><AgregarModuloPage /></RutaModulo>} />
          <Route path="modulos/editar/:codigoModulo" element={<RutaModulo><EditarModuloPage /></RutaModulo>} />

          {/* RUTAS DEL MÓDULO ROLES */}
          <Route path="roles" element={<RutaModulo><RolesPage /></RutaModulo>} />
          <Route path="roles/nuevo" element={<RutaModulo><RolFormularioPage /></RutaModulo>} />
          <Route path="roles/editar/:codigoRol" element={<RutaModulo><RolFormularioPage /></RutaModulo>} />

          {/* RUTAS DEL MÓDULO RECEPCIÓN */}
          <Route path="recepcion" element={<RutaModulo><RecepcionPage /></RutaModulo>} />
          <Route path="inventario" element={<InventarioPage/>} />

        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App