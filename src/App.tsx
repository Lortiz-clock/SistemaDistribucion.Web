import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Layout from './components/Layout'
import UsuarioPage from './pages/UsuarioPages'
import type { ReactNode } from 'react'
import AgregarUsuarioPage from './pages/AgregarUsuarioPage'
import EditarUsuarioPage from './pages/EditarUsuarioPage'
import ProductoPage from './pages/ProductoPage'
import AgregarProductoPage from './pages/AgregarProductoPage'

function RutaProtegida({ children }: { children: ReactNode }) {
  const estaLogueado = !!localStorage.getItem('token')
  return estaLogueado ? children : <Navigate to="/" replace />
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
          <Route index element={<Navigate to="/dashboard/usuarios" replace />} />
            <Route path="usuarios" element={<UsuarioPage />} />
            <Route path="usuarios/agregar" element={<AgregarUsuarioPage />} />
            <Route path="usuarios/editar/:codigoUsuario" element={<EditarUsuarioPage />} />
            <Route path="productos" element={<ProductoPage />} />
            <Route path="productos/agregar" element={<AgregarProductoPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App