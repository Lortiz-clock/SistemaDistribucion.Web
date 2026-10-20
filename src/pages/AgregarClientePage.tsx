import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { consultarCliente } from '../services/clienteService'
import type { ClientesConsulta } from '../interfaces/ClientesConsulta'
import './InventarioPage.css'

const POR_PAGINA = 15

const tieneUbicacion = (c: ClientesConsulta) =>
  c.latitud != null && c.longitud != null && !(c.latitud === 0 && c.longitud === 0)

const normalizar = (t: string | null | undefined) =>
  (t ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

type FiltroUbicacion = 'todos' | 'con' | 'sin'

export default function ClientesPage() {
  const [clientes, setClientes] = useState<ClientesConsulta[]>([])
  const [mensaje, setMensaje] = useState('')
  const [cargando, setCargando] = useState(true)

  const [busqueda, setBusqueda] = useState('')
  const [filtroUbicacion, setFiltroUbicacion] = useState<FiltroUbicacion>('todos')
  const [filtroEstado, setFiltroEstado] = useState('')
  const [orden, setOrden] = useState<'asc' | 'desc'>('asc')
  const [pagina, setPagina] = useState(1)

  const cambiarBusqueda = (valor: string) => {
    setBusqueda(valor)
    setPagina(1)
  }

  const cambiarUbicacion = (valor: FiltroUbicacion) => {
    setFiltroUbicacion(valor)
    setPagina(1)
  }

  const cambiarEstado = (valor: string) => {
    setFiltroEstado(valor)
    setPagina(1)
  }

  const limpiarFiltros = () => {
    setBusqueda('')
    setFiltroUbicacion('todos')
    setFiltroEstado('')
    setPagina(1)
  }

  const hayFiltros =
    busqueda !== '' || filtroUbicacion !== 'todos' || filtroEstado !== ''

  const totalConUbicacion = clientes.filter(tieneUbicacion).length
  const totalSinUbicacion = clientes.length - totalConUbicacion

  const clientesFiltrados = clientes
    .filter((c) => {
      const texto = normalizar(busqueda)
      const coincide =
        normalizar(c.nombre).includes(texto) ||
        normalizar(c.nit).includes(texto) ||
        normalizar(c.direccion).includes(texto) ||
        normalizar(c.referencia).includes(texto)

      const ubicacionOk =
        filtroUbicacion === 'todos' ||
        (filtroUbicacion === 'con' && tieneUbicacion(c)) ||
        (filtroUbicacion === 'sin' && !tieneUbicacion(c))

      const estadoOk =
        filtroEstado === '' ||
        (filtroEstado === 'activo' && c.estado) ||
        (filtroEstado === 'inactivo' && !c.estado)

      return coincide && ubicacionOk && estadoOk
    })
    .sort((a, b) => {
      const r = a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' })
      return orden === 'asc' ? r : -r
    })

  const totalPaginas = Math.max(1, Math.ceil(clientesFiltrados.length / POR_PAGINA))
  const paginaActual = Math.min(pagina, totalPaginas)
  const inicio = (paginaActual - 1) * POR_PAGINA
  const clientesPagina = clientesFiltrados.slice(inicio, inicio + POR_PAGINA)

  const cargarClientes = async () => {
    try {
      setCargando(true)
      const respuesta = await consultarCliente()
      if (respuesta.exito && Array.isArray(respuesta.datos)) {
        setClientes(respuesta.datos)
      } else {
        setClientes([])
      }
      setMensaje(respuesta.mensaje)
    } catch {
      setClientes([])
      setMensaje('No fue posible comunicarse con la API.')
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargarClientes()
  }, [])

  return (
    <div className="inventario-page pagina-lista">
      <div className="inventario-container pagina-lista-interna">
        {/* ENCABEZADO */}
        <div className="inventario-header">
          <h1 className="inventario-title">Clientes</h1>
          <p className="inventario-subtitle">
            Consulta y administra los clientes y su ubicación.
          </p>
        </div>

        {/* TARJETA */}
        <div className="inventario-card tarjeta-lista">
          <div className="inventario-card-header">
            <h2 className="inventario-card-title">Clientes registrados</h2>
            <div className="d-flex align-items-center gap-3">
              <span className="inventario-total">
                {hayFiltros
                  ? `Mostrando ${clientesFiltrados.length} de ${clientes.length}`
                  : `Total: ${clientes.length}`}
              </span>
              <Link to="/dashboard/clientes/agregar" className="btn btn-primary btn-sm">
                Nuevo cliente
              </Link>
            </div>
          </div>

          {/* MENSAJE */}
          {mensaje && !cargando && clientes.length === 0 && (
            <div className="alert alert-info inventario-mensaje" role="alert">
              {mensaje}
            </div>
          )}

          {/* FILTROS */}
          <div className="mb-3 flex-shrink-0 d-flex flex-wrap gap-2">
            <input
              type="text"
              className="form-control"
              style={{ flex: '1 1 260px' }}
              placeholder="Buscar por nombre, NIT, dirección o referencia..."
              value={busqueda}
              onChange={(e) => cambiarBusqueda(e.target.value)}
            />

            <div className="btn-group" role="group" aria-label="Filtro de ubicación">
              <button
                type="button"
                className={`btn btn-sm ${filtroUbicacion === 'todos' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => cambiarUbicacion('todos')}
              >
                Todos ({clientes.length})
              </button>
              <button
                type="button"
                className={`btn btn-sm ${filtroUbicacion === 'con' ? 'btn-success' : 'btn-outline-success'}`}
                onClick={() => cambiarUbicacion('con')}
              >
                Con ubicación ({totalConUbicacion})
              </button>
              <button
                type="button"
                className={`btn btn-sm ${filtroUbicacion === 'sin' ? 'btn-warning' : 'btn-outline-warning'}`}
                onClick={() => cambiarUbicacion('sin')}
              >
                Sin ubicación ({totalSinUbicacion})
              </button>
            </div>

            <select
              className="form-select w-auto"
              value={filtroEstado}
              onChange={(e) => cambiarEstado(e.target.value)}
            >
              <option value="">Todos los estados</option>
              <option value="activo">Activos</option>
              <option value="inactivo">Inactivos</option>
            </select>

            {hayFiltros && (
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm"
                onClick={limpiarFiltros}
              >
                Limpiar filtros
              </button>
            )}
          </div>

          {/* TABLA */}
          <div className="inventario-table-container tabla-scroll">
            <table className="table table-bordered inventario-table">
              <thead>
                <tr>
                  <th
                    style={{ cursor: 'pointer', userSelect: 'none' }}
                    onClick={() => setOrden(orden === 'asc' ? 'desc' : 'asc')}
                    title="Ordenar por nombre"
                  >
                    Nombre {orden === 'asc' ? '▲' : '▼'}
                  </th>
                  <th>NIT</th>
                  <th>Dirección</th>
                  <th>Referencia</th>
                  <th>Ubicación</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {cargando ? (
                  <tr>
                    <td colSpan={7} className="text-center">
                      Cargando clientes...
                    </td>
                  </tr>
                ) : clientesPagina.length > 0 ? (
                  clientesPagina.map((c) => (
                    <tr key={c.codigoCliente}>
                      <td>{c.nombre}</td>
                      <td>{c.nit || 'CF'}</td>
                      <td>{c.direccion}</td>
                      <td>{c.referencia}</td>
                      <td>
                        {tieneUbicacion(c) ? (
                          <>
                            <span className="badge bg-success">Mapeado</span>
                            <div className="text-muted" style={{ fontSize: 11 }}>
                              {c.latitud!.toFixed(5)}, {c.longitud!.toFixed(5)}
                            </div>
                          </>
                        ) : (
                          <span className="badge bg-warning text-dark">Sin ubicación</span>
                        )}
                      </td>
                      <td>
                        <span className={`badge ${c.estado ? 'bg-success' : 'bg-secondary'}`}>
                          {c.estado ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <Link
                            to={`/dashboard/clientes/editar/${c.codigoCliente}`}
                            className="btn btn-outline-primary btn-sm"
                          >
                            Editar
                          </Link>
                          {tieneUbicacion(c) && (
                            <a
                              href={`https://waze.com/ul?ll=${c.latitud},${c.longitud}&navigate=yes`}
                              target="_blank"
                              rel="noreferrer"
                              className="btn btn-outline-secondary btn-sm"
                            >
                              Navegar
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="sin-registros text-center">
                      No existen clientes con esos filtros.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINACIÓN */}
          {clientesFiltrados.length > POR_PAGINA && (
            <div className="d-flex justify-content-between align-items-center mt-3 flex-shrink-0">
              <small className="text-muted">
                {inicio + 1}–{Math.min(inicio + POR_PAGINA, clientesFiltrados.length)} de{' '}
                {clientesFiltrados.length}
              </small>
              <div className="d-flex align-items-center gap-2">
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm"
                  disabled={paginaActual === 1}
                  onClick={() => setPagina(paginaActual - 1)}
                >
                  Anterior
                </button>
                <span className="small">
                  Página {paginaActual} de {totalPaginas}
                </span>
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm"
                  disabled={paginaActual === totalPaginas}
                  onClick={() => setPagina(paginaActual + 1)}
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}  