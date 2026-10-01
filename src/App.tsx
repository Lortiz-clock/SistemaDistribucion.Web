import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
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

//Importar modulos
import ModulosPage from './pages/ModulosPage'
import AgregarModuloPage from './pages/AgregarModuloPage'
import EditarModuloPage from './pages/EditarModuloPage'

import RolesPage from './pages/RolesPage'
import RolFormularioPage from './pages/RolFormularioPage'

function RutaProtegida({ children }: { children: ReactNode }) {
  const estaLogueado = !!localStorage.getItem('token')
  return estaLogueado ? children : <Navigate to="/" replace />
}


function InicioDashboard() {
  const modulos = JSON.parse(localStorage.getItem('modulos') ?? '[]')
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
          <Route path="usuarios" element={<UsuarioPage />} />
          <Route path="usuarios/agregar" element={<AgregarUsuarioPage />} />
          <Route path="usuarios/editar/:codigoUsuario" element={<EditarUsuarioPage />} />

          <Route path="productos" element={<ProductoPage />} />
          <Route path="productos/agregar" element={<AgregarProductoPage />} />
          <Route path="productos/editar/:codigoProducto" element={<EditarProductoPage />} />

         
          <Route path="proveedores" element={<ProveedorPage />} />
          <Route path="proveedores/agregar" element={<AgregarProveedorPage />} />
          <Route path="proveedores/editar/:codigoProveedor" element={<EditarProveedorPage />} />

          
          <Route path="ordenes/nueva" element={<AgregarOrdenPage />} />
          <Route path="ordenes/listar" element={<ListarOrdenesPage />} />

          <Route path="modulos" element={<ModulosPage />} />
          <Route path="modulos/agregar" element={<AgregarModuloPage />} />
          <Route path="modulos/editar/:codigoModulo" element={<EditarModuloPage/>} />

          <Route path="roles" element={<RolesPage />} />
          <Route path="roles/nuevo" element={<RolFormularioPage />} />
          <Route path="roles/editar/:codigoRol" element={<RolFormularioPage />} />

        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App