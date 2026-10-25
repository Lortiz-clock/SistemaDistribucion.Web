import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { consultarMotivosNoVisita, desactivarMotivoNoVisita } from '../services/motivoNoVisitaServices'
import type { MotivoNoVisitaConsulta } from '../interfaces/MotivoNoVisitaConsulta'
import './ProveedorPage.css' // se reutilizan los estilos de Proveedores

export default function MotivoNoVisitaPage() {
  const [motivos, setMotivos] = useState<MotivoNoVisitaConsulta[]>([])
  const [mensaje, setMensaje] = useState('')
  const [busqueda, setBusqueda] = useState('')

  const navigate = useNavigate()

  const filtrados = motivos.filter(
    (item) =>
      item.codigoMotivo?.toString().includes(busqueda) ||
      item.nombre?.toLowerCase().includes(busqueda.toLowerCase())
  )

  const cargar = async () => {
    try {
      const respuesta = await consultarMotivosNoVisita()

      if (respuesta.exito && Array.isArray(respuesta.datos)) {
        setMotivos(respuesta.datos)
      } else {
        setMotivos([])
      }
      setMensaje(respuesta.mensaje)
    } catch {
      setMotivos([])
      setMensaje('No fue posible comunicarse con la API.')
    }
  }

  const desactivar = async (codigoMotivo: number) => {
    if (!window.confirm('¿Desactivar este motivo? Quedará inactivo, pero se conserva su historial.')) return

    try {
      const respuesta = await desactivarMotivoNoVisita(codigoMotivo)
      setMensaje(respuesta.mensaje)
      if (respuesta.exito) await cargar()
    } catch {
      setMensaje('No se pudo desactivar el motivo.')
    }
  }

  useEffect(() => {
    cargar()
  }, [])

  return (
    <div className="proveedor-page pagina-lista">
      <div className="proveedor-container pagina-lista-interna">
        <div className="proveedor-header">
          <h1 className="proveedor-title">Motivos de No Visita</h1>
          <p className="proveedor-subtitle">
            Motivos por los que un cliente puede quedar sin visitar.
          </p>
        </div>

        <div className="proveedor-card tarjeta-lista">
          <div className="proveedor-card-header">
            <h2 className="proveedor-card-title">Motivos registrados</h2>
            <div className="d-flex align-items-center gap-3">
              <span className="proveedor-total">Total: {motivos.length}</span>
              <Link to="/dashboard/motivos-no-visita/agregar" className="btn btn-primary btn-sm">
                + Agregar Motivo
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
              placeholder="Buscar por código o nombre..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          <div className="proveedor-table-container tabla-scroll">
            <table className="table table-bordered proveedor-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Nombre</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {filtrados.length > 0 ? (
                  filtrados.map((item) => (
                    <tr key={item.codigoMotivo}>
                      <td>{item.codigoMotivo}</td>
                      <td>{item.nombre}</td>
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
                              navigate(`/dashboard/motivos-no-visita/editar/${item.codigoMotivo}`)
                            }
                          >
                            Editar
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => desactivar(item.codigoMotivo)}
                            disabled={!item.estado}
                            title={item.estado ? 'Desactivar motivo' : 'Ya está inactivo'}
                          >
                            Desactivar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="sin-registros text-center">
                      No existen motivos registrados.
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
