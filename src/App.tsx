
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

// Importaciones del módulo de Empleados
import EmpleadoPage from './pages/EmpleadoPage'
import AgregarEmpleadoPage from './pages/AgregarEmpleadoPage'
import EditarEmpleadoPage from './pages/EditarEmpleadoPage'

// Importaciones del módulo de Categorías
import CategoriaPage from './pages/CategoriaPage'
import AgregarCategoriaPage from './pages/AgregarCategoriaPage'
import EditarCategoriaPage from './pages/EditarCategoriaPage'

// Importaciones del módulo de Inventario
import InventarioPage from './pages/InventarioPage'
import AjusteInventarioPage from './pages/AjusteInventarioPage'

// Importaciones del módulo de Clientes
import ClientesPage from './pages/ClientesPage'
import AgregarClientePage from './pages/AgregarClientePage'
import EditarClientePage from './pages/EditarClientePage'

// Importaciones del módulo de Vendedores
import VendedorPage from './pages/VendedorPage'
import AgregarVendedorPage from './pages/AgregarVendedorPage'
import EditarVendedorPage from './pages/EditarVendedorPage'

// Importaciones del módulo de Repartidores
import RepartidorPage from './pages/RepartidorPage'
import AgregarRepartidorPage from './pages/AgregarRepartidorPage'
import EditarRepartidorPage from './pages/EditarRepartidorPage'

// Importaciones del módulo de Puestos
import PuestoPage from './pages/PuestoPage'
import AgregarPuestoPage from './pages/AgregarPuestoPage'
import EditarPuestoPage from './pages/EditarPuestoPage'

// Importaciones del módulo de Marcas
import MarcaPage from './pages/MarcaPage'
import AgregarMarcaPage from './pages/AgregarMarcaPage'
import EditarMarcaPage from './pages/EditarMarcaPage'

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
  const prefijo = '/' + segmentos[1] + '/' + segmentos[2]

  const permitida = obtenerModulos().some((m: any) =>
    prefijo === m.rutaFront ||
    m.rutaFront.startsWith(prefijo) ||
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

          {/* RUTAS DEL MÓDULO USUARIOS */}
          <Route path="usuarios" element={<RutaModulo><UsuarioPage /></RutaModulo>} />
          <Route path="usuarios/agregar" element={<RutaModulo><AgregarUsuarioPage /></RutaModulo>} />
          <Route path="usuarios/editar/:codigoUsuario" element={<RutaModulo><EditarUsuarioPage /></RutaModulo>} />

          {/* RUTAS DEL MÓDULO PRODUCTOS */}
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

          {/* RUTAS DEL MÓDULO MÓDULOS */}
          <Route path="modulos" element={<RutaModulo><ModulosPage /></RutaModulo>} />
          <Route path="modulos/nuevo" element={<RutaModulo><AgregarModuloPage /></RutaModulo>} />
          <Route path="modulos/editar/:codigoModulo" element={<RutaModulo><EditarModuloPage /></RutaModulo>} />

          {/* RUTAS DEL MÓDULO ROLES */}
          <Route path="roles" element={<RutaModulo><RolesPage /></RutaModulo>} />
          <Route path="roles/nuevo" element={<RutaModulo><RolFormularioPage /></RutaModulo>} />
          <Route path="roles/editar/:codigoRol" element={<RutaModulo><RolFormularioPage /></RutaModulo>} />

          {/* RUTAS DEL MÓDULO RECEPCIÓN */}
          <Route path="recepcion" element={<RutaModulo><RecepcionPage /></RutaModulo>} />

          {/* RUTAS DEL MÓDULO INVENTARIO */}
          <Route path="inventario" element={<InventarioPage />} />
          <Route path="inventario/ajustes" element={<RutaModulo><AjusteInventarioPage /></RutaModulo>} />

          {/* RUTAS DEL MÓDULO CLIENTES */}
          <Route path="clientes" element={<RutaModulo><ClientesPage /></RutaModulo>} />
          <Route path="clientes/agregar" element={<RutaModulo><AgregarClientePage /></RutaModulo>} />
          <Route path="clientes/editar/:codigoCliente" element={<RutaModulo><EditarClientePage /></RutaModulo>} />

          {/* RUTAS DEL MÓDULO EMPLEADOS */}
          <Route path="empleados" element={<RutaModulo><EmpleadoPage /></RutaModulo>} />
          <Route path="empleados/agregar" element={<RutaModulo><AgregarEmpleadoPage /></RutaModulo>} />
          <Route path="empleados/editar/:codigoEmpleado" element={<RutaModulo><EditarEmpleadoPage /></RutaModulo>} />

          {/* RUTAS DEL MÓDULO CATEGORÍAS */}
          <Route path="categorias" element={<RutaModulo><CategoriaPage /></RutaModulo>} />
          <Route path="categorias/agregar" element={<RutaModulo><AgregarCategoriaPage /></RutaModulo>} />
          <Route path="categorias/editar/:codigoCategoria" element={<RutaModulo><EditarCategoriaPage /></RutaModulo>} />

          {/* RUTAS DEL MÓDULO VENDEDORES */}
          <Route path="vendedores" element={<RutaModulo><VendedorPage /></RutaModulo>} />
          <Route path="vendedores/agregar" element={<RutaModulo><AgregarVendedorPage /></RutaModulo>} />
          <Route path="vendedores/editar/:codigoVendedor" element={<RutaModulo><EditarVendedorPage /></RutaModulo>} />

          {/* RUTAS DEL MÓDULO REPARTIDORES */}
          <Route path="repartidores" element={<RutaModulo><RepartidorPage /></RutaModulo>} />
          <Route path="repartidores/agregar" element={<RutaModulo><AgregarRepartidorPage /></RutaModulo>} />
          <Route path="repartidores/editar/:codigoRepartidor" element={<RutaModulo><EditarRepartidorPage /></RutaModulo>} />

          {/* RUTAS DEL MÓDULO PUESTOS */}
          <Route path="puestos" element={<RutaModulo><PuestoPage /></RutaModulo>} />
          <Route path="puestos/agregar" element={<RutaModulo><AgregarPuestoPage /></RutaModulo>} />
          <Route path="puestos/editar/:codigoPuesto" element={<RutaModulo><EditarPuestoPage /></RutaModulo>} />

          {/* RUTAS DEL MÓDULO MARCAS */}
          <Route path="marca" element={<RutaModulo><MarcaPage /></RutaModulo>} />
          <Route path="marca/agregar" element={<RutaModulo><AgregarMarcaPage /></RutaModulo>} />
          <Route path="marca/editar/:codigoMarca" element={<RutaModulo><EditarMarcaPage /></RutaModulo>} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
