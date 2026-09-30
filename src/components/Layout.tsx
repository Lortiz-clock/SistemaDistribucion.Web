import { useState, useEffect } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  Users, Package, Truck, ShoppingCart, ClipboardList,
  ShieldCheck, LayoutDashboard
} from 'lucide-react'
import './Layout.css'
import { obtenerNombreUsuario } from '../services/authService'
import type { Modulo } from '../interfaces/UsuarioLogin'

// Diccionario: el texto guardado en la BD (columna Icono) → componente visual
const iconosDisponibles: Record<string, any> = {
  Users,
  Package,
  Truck,
  ShoppingCart,
  ClipboardList,
  ShieldCheck
}

function Layout() {
  const navigate = useNavigate()
  const nombre = obtenerNombreUsuario()

  const [modulosPermitidos, setModulosPermitidos] = useState<Modulo[]>([])

  useEffect(() => {
    const guardados = localStorage.getItem('modulos')
    if (guardados) {
      setModulosPermitidos(JSON.parse(guardados))
    } else {
      navigate('/')
    }
  }, [navigate])

  const cerrarSesion = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('nombreUsuario')
    localStorage.removeItem('modulos')
    navigate('/')
  }

  return (
    <div className="layout-wrapper">
      <aside className="layout-sidebar">
        <h4 className="layout-sidebar-title">Distribución</h4>
        <nav className="nav flex-column">
          {modulosPermitidos.map((modulo) => {
            const IconoComponente = iconosDisponibles[modulo.icono] || LayoutDashboard
            return (
              <NavLink
                to={modulo.rutaFront}
                key={modulo.rutaFront}
                className={({ isActive }) => `nav-link layout-nav-link ${isActive ? 'active' : ''}`}
              >
                <IconoComponente size={18} style={{ marginRight: '10px' }} />
                {modulo.nombre}
              </NavLink>
            )
          })}
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