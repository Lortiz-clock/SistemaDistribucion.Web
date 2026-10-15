import { useState, useEffect } from 'react'
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import {
  Users, Package, Truck, ShoppingCart, ClipboardList,
  ShieldCheck, LayoutDashboard, Boxes, ClipboardCheck,
  ChevronDown, ChevronRight
} from 'lucide-react'
import './Layout.css'
import { obtenerNombreUsuario } from '../services/authService'
import type { Modulo } from '../interfaces/UsuarioLogin'

const iconosDisponibles: Record<string, any> = {
  Users, Package, Truck, ShoppingCart, ClipboardList,
  ShieldCheck, Boxes, ClipboardCheck
}

// ═══ Definición de grupos: módulos que se muestran juntos ═══
const definicionGrupos = [
  {
    nombre: 'Ordenes de Compra',
    icono: ShoppingCart,
    items: [
      { contiene: '/dashboard/ordenes/nueva', nombre: 'Nueva Orden' },
      { contiene: '/dashboard/ordenes/listar', nombre: 'Órdenes de Compra' },
      { contiene: '/dashboard/recepcion', nombre: 'Recepción' }
    ]
  }
]

interface GrupoMenu {
  nombre: string
  icono: any
  items: Modulo[]
  esLinkDirecto: boolean
  ruta?: string
}

function agruparModulos(modulos: Modulo[]): GrupoMenu[] {
  const grupos: GrupoMenu[] = []
  const yaAgrupados: string[] = []

  for (const def of definicionGrupos) {
    // Los módulos del usuario que pertenecen a este grupo (en el orden del grupo)
    const items = def.items
      .map((i) => modulos.find((m) => m.rutaFront === i.contiene))
      .filter((m): m is Modulo => !!m)

    if (items.length >= 2) {
      // ═══ 2 o más módulos del grupo → ACORDEÓN ═══
      grupos.push({ nombre: def.nombre, icono: def.icono, items, esLinkDirecto: false })
      items.forEach((i) => yaAgrupados.push(i.rutaFront))
    } else if (items.length === 1) {
      // ═══ Solo 1 módulo del grupo → LINK DIRECTO (sin acordeón) ═══
      grupos.push({
        nombre: items[0].nombre,
        icono: iconosDisponibles[items[0].icono] || def.icono,
        items: [items[0]],
        esLinkDirecto: true,
        ruta: items[0].rutaFront
      })
      yaAgrupados.push(items[0].rutaFront)
    }
  }

  // Los demás módulos: links directos, en su orden original
  modulos
    .filter((m) => !yaAgrupados.includes(m.rutaFront))
    .forEach((m) => {
      grupos.push({
        nombre: m.nombre,
        icono: iconosDisponibles[m.icono] || LayoutDashboard,
        items: [m],
        esLinkDirecto: true,
        ruta: m.rutaFront
      })
    })

  return grupos
}

function Layout() {
  const navigate = useNavigate()
  const location = useLocation()
  const nombre = obtenerNombreUsuario()

  const [modulosPermitidos, setModulosPermitidos] = useState<Modulo[]>([])
  const [grupoAbierto, setGrupoAbierto] = useState<string | null>(null)
  const [menuAbierto, setMenuAbierto] = useState(false)

  useEffect(() => {
    const guardados = localStorage.getItem('modulos')
    if (guardados) {
      setModulosPermitidos(JSON.parse(guardados))
    } else {
      navigate('/')
    }
  }, [navigate])

  // Auto-abre el grupo si estás navegando dentro de él
  // ✅ Bien: los dos al mismo nivel, uno debajo del otro
useEffect(() => {
  const ruta = location.pathname
  if (ruta.startsWith('/dashboard/ordenes') || ruta.startsWith('/dashboard/recepcion')) {
    setGrupoAbierto('Ordenes de Compra')
  }
}, [location.pathname])

useEffect(() => {
  setMenuAbierto(false)
}, [location.pathname])

  const cerrarSesion = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('nombreUsuario')
    localStorage.removeItem('modulos')
    navigate('/')
  }

  const grupos = agruparModulos(modulosPermitidos)

  return (
    <div className="layout-wrapper">
      <aside className={`layout-sidebar ${menuAbierto ? 'abierto' : ''}`}>
        <h4 className="layout-sidebar-title">Distribución</h4>
        <nav className="nav flex-column">

          {grupos.map((grupo) =>
            grupo.esLinkDirecto ? (
              // ─── Módulo simple: link directo ───
              <NavLink
                to={grupo.ruta!}
                key={grupo.nombre}
                className={({ isActive }) => `nav-link layout-nav-link ${isActive ? 'active' : ''}`}
              >
                <grupo.icono size={18} style={{ marginRight: '10px' }} />
                {grupo.nombre}
              </NavLink>
            ) : (
              // ─── Grupo acordeón ───
              <div key={grupo.nombre} className="nav-item">
                <button
                  className="nav-link layout-nav-link layout-grupo-btn d-flex justify-content-between align-items-center w-100 text-start"
                  onClick={() => setGrupoAbierto(grupoAbierto === grupo.nombre ? null : grupo.nombre)}
                >
                  <span>
                    <grupo.icono size={18} style={{ marginRight: '10px' }} />
                    {grupo.nombre}
                  </span>
                  {grupoAbierto === grupo.nombre
                    ? <ChevronDown size={16} />
                    : <ChevronRight size={16} />}
                </button>

                {grupoAbierto === grupo.nombre && (
                  <div className="layout-submenu">
                    {grupo.items.map((item) => (
                      <NavLink
                        to={item.rutaFront}
                        key={item.rutaFront}
                        className={({ isActive }) =>
                          `nav-link layout-submenu-link ${isActive ? 'active' : ''}`}
                      >
                        {item.nombre}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            )
          )}
        </nav>
      </aside>

      <div
          className={`layout-overlay ${menuAbierto ? 'visible' : ''}`}
          onClick={() => setMenuAbierto(false)}
        />

      <div className="layout-main">
        <header className="layout-header">
          <div className="d-flex align-items-center" style={{ minWidth: 0 }}>
            <button className="layout-menu-toggle" onClick={() => setMenuAbierto(true)}>
              ☰
            </button>
            <span className="text-white me-3 text-truncate">Hola bienvenido, {nombre}</span>
          </div>
          <button className="btn btn-danger btn-sm flex-shrink-0" onClick={cerrarSesion}>
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