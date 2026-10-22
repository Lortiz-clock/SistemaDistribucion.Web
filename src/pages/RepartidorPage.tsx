import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { consultarRepartidores, desactivarRepartidor } from '../services/repartidorServices'
import type { RepartidorConsulta } from '../interfaces/RepartidorConsulta'
import './ProveedorPage.css' // se reutilizan los estilos de Proveedores

export default function RepartidorPage() {
  const [repartidores, setRepartidores] = useState<RepartidorConsulta[]>([])
  const [mensaje, setMensaje] = useState('')
  const [busqueda, setBusqueda] = useState('')

  const navigate = useNavigate()

  const filtrados = repartidores.filter(
    (item) =>
      item.codigoRepartidor?.toString().includes(busqueda) ||
      item.nombreEmpleado?.toLowerCase().includes(busqueda.toLowerCase()) ||
      item.telefono?.toLowerCase().includes(busqueda.toLowerCase())
  )

  const cargar = async () => {
    try {
      const respuesta = await consultarRepartidores()

      if (respuesta.exito && Array.isArray(respuesta.datos)) {
        setRepartidores(respuesta.datos)
      } else {
        setRepartidores([])
      }
      setMensaje(respuesta.mensaje)
    } catch {
      setRepartidores([])
      setMensaje('No fue posible comunicarse con la API.')
    }
  }

  const desactivar = async (codigoRepartidor: number) => {
    if (!window.confirm('¿Desactivar este repartidor? Quedará inactivo, pero se conserva su historial.')) return

    try {
      const respuesta = await desactivarRepartidor(codigoRepartidor)
      setMensaje(respuesta.mensaje)
      if (respuesta.exito) await cargar()
    } catch {
      setMensaje('No se pudo desactivar el repartidor.')
    }
  }

  useEffect(() => {
    cargar()
  }, [])

  return (
    <div className="proveedor-page pagina-lista">
      <div className="proveedor-container pagina-lista-interna">
        <div className="proveedor-header">
          <h1 className="proveedor-title">Consulta de Repartidores</h1>
          <p className="proveedor-subtitle">
            Consulta los repartidores registrados en el sistema.
          </p>
        </div>

        <div className="proveedor-card tarjeta-lista">
          <div className="proveedor-card-header">
            <h2 className="proveedor-card-title">Repartidores registrados</h2>
            <div className="d-flex align-items-center gap-3">
              <span className="proveedor-total">Total: {repartidores.length}</span>
              <Link to="/dashboard/repartidores/agregar" className="btn btn-primary btn-sm">
                + Agregar Repartidor
              </Link>
            </div>
          </div>

          {mensaje && (
            <div className="alert alert-info proveedor-mensaje" role="alert">
              {mensaje}
            </div>
          )}

          <div className="mb-3 flex-shrink-0">
            <input
              type="text"
              className="form-control"
              placeholder="Buscar por código, nombre o teléfono..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          <div className="proveedor-table-container tabla-scroll">
            <table className="table table-bordered proveedor-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Empleado</th>
                  <th>Teléfono</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {filtrados.length > 0 ? (
                  filtrados.map((item) => (
                    <tr key={item.codigoRepartidor}>
                      <td>{item.codigoRepartidor}</td>
                      <td>{item.nombreEmpleado}</td>
                      <td>{item.telefono}</td>
                      <td>
                        <span className={`badge ${item.estado ? 'bg-success' : 'bg-secondary'}`}>
                          {item.estado ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex gap-2 justify-content-center">
                          <button
                            className="btn btn-sm btn-outline-warning"
                            onClick={() =>
                              navigate(`/dashboard/repartidores/editar/${item.codigoRepartidor}`)
                            }
                          >
                            Editar
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => desactivar(item.codigoRepartidor)}
                            disabled={!item.estado}
                            title={item.estado ? 'Desactivar repartidor' : 'Ya está inactivo'}
                          >
                            Desactivar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="sin-registros text-center">
                      No existen repartidores registrados.
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
