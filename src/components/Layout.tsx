import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import './Layout.css'
import { obtenerNombreUsuario } from '../services/authService'

function Layout() {
  const navigate = useNavigate()
  const nombre = obtenerNombreUsuario()
  
  const cerrarSesion = () => {
    localStorage.removeItem('token')
    navigate('/')
  }

  return (
    <div className="layout-wrapper">
      <aside className="layout-sidebar">
        <h4 className="layout-sidebar-title">Distribución</h4>
        <nav className="nav flex-column">
          <NavLink
            to="/dashboard/usuarios"
            className={({ isActive }) => `nav-link layout-nav-link ${isActive ? 'active' : ''}`}
          >
            👥 Usuarios
          </NavLink>

          <NavLink
            to="/dashboard/productos"
            className={({ isActive }) => `nav-link layout-nav-link ${isActive ? 'active' : ''}`}
          >
            📦 Productos
          </NavLink>

          <NavLink
            to="/dashboard/proveedores"
            className={({ isActive }) => `nav-link layout-nav-link ${isActive ? 'active' : ''}`}
          >
            🚚 Proveedores
          </NavLink>

          {/* 👇 BOTONES DEL MÓDULO ORDEN DE COMPRA */}
          <NavLink
            to="/dashboard/ordenes/nueva"
            className={({ isActive }) => `nav-link layout-nav-link ${isActive ? 'active' : ''}`}
          >
            🛒 Nueva Orden
          </NavLink>

          <NavLink
            to="/dashboard/ordenes/listar"
            className={({ isActive }) => `nav-link layout-nav-link ${isActive ? 'active' : ''}`}
          >
            📋 Órdenes de Compra
          </NavLink>

        </nav>
      </aside>

      <div className="layout-main">
        <header className="layout-header">
          <span className="text-white me-3">Hola bienvenido, {nombre}</span>
          <button className="btn btn-danger btn-sm" onClick={cerrarSesion}>
            Cerrar Sesión
          </button>
        </header>

        <main className="layout-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default Layout