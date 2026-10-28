import { useState, useEffect } from 'react'
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import {
  ShieldUser, Package, Truck, ShoppingCart, ClipboardList,
  ShieldCheck, LayoutDashboard, Layers, ClipboardCheck, PlayingCardsFan,
  ChevronDown, PackageOpen, BriefcaseBusiness, UserCog, Timeline,
  FileText, BarChart3, Combine
} from 'lucide-react'
import './Layout.css'
import './tema-oscuro.css'
import './menu-acordeon.css'
import { obtenerNombreUsuario } from '../services/authService'
import type { Modulo } from '../interfaces/UsuarioLogin'

const iconosDisponibles: Record<string, any> = {
  ShieldUser, Package, Truck, ShoppingCart, ClipboardList, PlayingCardsFan,
  ShieldCheck, Layers, ClipboardCheck, PackageOpen, BriefcaseBusiness, UserCog, Timeline, 
  FileText, BarChart3, Combine
}

// ═══ Definición de grupos: módulos que se muestran juntos ═══
// IMPORTANTE: cada "contiene" debe ser IGUAL a la rutaFront que viene de la base de datos.
const definicionGrupos = [
  {
    nombre: 'Ordenes de Compra',
    icono: ShoppingCart,
    prefijos: ['/dashboard/ordenes', '/dashboard/recepcion'],
    items: [
      { contiene: '/dashboard/ordenes/nueva', nombre: 'Nueva Orden' },
      { contiene: '/dashboard/ordenes/listar', nombre: 'Órdenes de Compra' },
      { contiene: '/dashboard/recepcion', nombre: 'Recepción' }
    ]
  },
  {
    nombre: 'Catálogo e Inventario',
    icono: Package,
    prefijos: [
      '/dashboard/productos',
      '/dashboard/inventario',
      '/dashboard/marca',
      '/dashboard/categorias'
    ],
    items: [
      { contiene: '/dashboard/productos', nombre: 'Productos' },
      { contiene: '/dashboard/inventario', nombre: 'Inventario' },
      { contiene: '/dashboard/marca', nombre: 'Marca' },
      { contiene: '/dashboard/categorias', nombre: 'Categorías' }
    ]
  },
  {
    nombre: 'Administración',
    icono: ShieldUser,
    prefijos: [
      '/dashboard/usuarios',
      '/dashboard/roles',
      '/dashboard/modulos',
      '/dashboard/empleados',
      '/dashboard/puestos',
      '/dashboard/repartidores'
    ],
    items: [
      { contiene: '/dashboard/usuarios', nombre: 'Usuarios' },
      { contiene: '/dashboard/roles', nombre: 'Roles' },
      { contiene: '/dashboard/modulos', nombre: 'Módulos' },
      { contiene: '/dashboard/empleados', nombre: 'Empleados' },
      { contiene: '/dashboard/puestos', nombre: 'Puestos' },
      { contiene: '/dashboard/repartidores', nombre: 'Repartidores' }
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

  // Abre automáticamente el grupo de la ruta actual
  useEffect(() => {
    const ruta = location.pathname
    const grupo = definicionGrupos.find((g) =>
      g.prefijos.some((p) => ruta.startsWith(p))
    )
    if (grupo) setGrupoAbierto(grupo.nombre)
  }, [location.pathname])

  // Cierra el menú móvil al navegar
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

          {grupos.map((grupo, i) => {
            if (grupo.esLinkDirecto) {
              return (
                <NavLink
                  to={grupo.ruta!}
                  key={grupo.nombre}
                  style={{ '--li': i } as React.CSSProperties}
                  className={({ isActive }) => `nav-link layout-nav-link ${isActive ? 'active' : ''}`}
                >
                  <grupo.icono size={18} style={{ marginRight: '10px' }} />
                  {grupo.nombre}
                </NavLink>
              )
            }

            // ─── Grupo acordeón ───
            const abierto = grupoAbierto === grupo.nombre
            const activo = grupo.items.some((it) => location.pathname.startsWith(it.rutaFront))

            return (
              <div
                key={grupo.nombre}
                className={`nav-item layout-grupo ${abierto ? 'abierto' : ''} ${activo ? 'grupo-activo' : ''}`}
                style={{ '--li': i } as React.CSSProperties}
              >
                <button
                  type="button"
                  className="nav-link layout-nav-link layout-grupo-btn d-flex justify-content-between align-items-center w-100 text-start"
                  aria-expanded={abierto}
                  onClick={() => setGrupoAbierto(abierto ? null : grupo.nombre)}
                >
                  <span className="layout-grupo-titulo">
                    <grupo.icono size={18} />
                    <span>{grupo.nombre}</span>
                  </span>
                  <span className="layout-grupo-extra">
                    <span className="layout-grupo-contador">{grupo.items.length}</span>
                    <ChevronDown size={16} className="layout-chevron" />
                  </span>
                </button>

                {/* Siempre renderizado para poder animar la apertura */}
                <div className="layout-submenu-wrap">
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
                </div>
              </div>
            )
          })}
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
