import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import './Layout.css'

function Layout() {
  const navigate = useNavigate()

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
        </nav>
      </aside>

      <div className="layout-main">
        <header className="layout-header">
          <h5 className="mb-0">Panel de Administración</h5>
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