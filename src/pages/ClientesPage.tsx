import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { consultarCliente } from '../services/clienteService'
import type { ClientesConsulta } from '../interfaces/ClientesConsulta'
import './InventarioPage.css'

const tieneUbicacion = (c: ClientesConsulta) =>
  c.latitud != null && c.longitud != null && !(c.latitud === 0 && c.longitud === 0)

export default function ClientesPage() {
  const [clientes, setClientes] = useState<ClientesConsulta[]>([])
  const [mensaje, setMensaje] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [filtroUbicacion, setFiltroUbicacion] = useState('')

  const clientesFiltrados = clientes.filter((c) => {
    const texto = busqueda.toLowerCase()
    const coincide =
      c.nombre.toLowerCase().includes(texto) ||
      (c.nit ?? '').toLowerCase().includes(texto) ||
      (c.direccion ?? '').toLowerCase().includes(texto)

    const ubicacionOk =
      filtroUbicacion === '' ||
      (filtroUbicacion === 'con' && tieneUbicacion(c)) ||
      (filtroUbicacion === 'sin' && !tieneUbicacion(c))

    return coincide && ubicacionOk
  })

  const cargarClientes = async () => {
    try {
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
    }
  }

  useEffect(() => {
    cargarClientes()
  }, [])

  return (
    <div className="inventario-page pagina-lista">
      <div className="inventario-container pagina-lista-interna">
        <div className="inventario-header">
          <h1 className="inventario-title">Clientes</h1>
          <p className="inventario-subtitle">
            Consulta y administra los clientes y su ubicación.
          </p>
        </div>

        <div className="inventario-card tarjeta-lista">
          <div className="inventario-card-header">
            <h2 className="inventario-card-title">Clientes registrados</h2>
            <div className="d-flex align-items-center gap-3">
              <span className="inventario-total">
                Total: {clientesFiltrados.length}
              </span>
              <Link to="/dashboard/clientes/agregar" className="btn btn-primary btn-sm">
                Nuevo cliente
              </Link>
            </div>
          </div>

          {mensaje && (
            <div className="alert alert-info inventario-mensaje" role="alert">
              {mensaje}
            </div>
          )}

          <div className="mb-3 flex-shrink-0 d-flex gap-2">
            <input
              type="text"
              className="form-control"
              placeholder="Buscar por nombre, NIT o dirección..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
            <select
              className="form-select w-auto"
              value={filtroUbicacion}
              onChange={(e) => setFiltroUbicacion(e.target.value)}
            >
              <option value="">Toda ubicación</option>
              <option value="con">Con ubicación</option>
              <option value="sin">Sin ubicación</option>
            </select>
          </div>

          <div className="inventario-table-container tabla-scroll">
            <table className="table table-bordered inventario-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>NIT</th>
                  <th>Dirección</th>
                  <th>Referencia</th>
                  <th>Ubicación</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {clientesFiltrados.length > 0 ? (
                  clientesFiltrados.map((c) => (
                    <tr key={c.codigoCliente}>
                      <td>{c.nombre}</td>
                      <td>{c.nit || 'CF'}</td>
                      <td>{c.direccion}</td>
                      <td>{c.referencia}</td>
                      <td>
                        {tieneUbicacion(c) ? (
                          <span className="badge bg-success">Mapeado</span>
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
                      No existen clientes.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}