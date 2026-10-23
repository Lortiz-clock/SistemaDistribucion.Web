import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { consultarPuestos, desactivarPuesto } from '../services/puestoServices'
import type { PuestoConsulta } from '../interfaces/PuestoConsulta'
import './ProveedorPage.css' // se reutilizan los estilos de Proveedores

// El error del servidor llega como "Procedimiento: ... | Mensaje: texto"; se muestra solo el texto
const extraerError = (error: any) => {
  const detalle: string = error?.response?.data?.detalle ?? ''
  const posicion = detalle.indexOf('Mensaje: ')
  if (posicion >= 0) return detalle.substring(posicion + 9)
  return error?.response?.data?.mensaje ?? 'No fue posible comunicarse con la API.'
}

export default function PuestoPage() {
  const [puestos, setPuestos] = useState<PuestoConsulta[]>([])
  const [mensaje, setMensaje] = useState('')
  const [exito, setExito] = useState(true)
  const [busqueda, setBusqueda] = useState('')

  const navigate = useNavigate()

  const filtrados = puestos.filter(
    (item) =>
      item.codigoPuesto?.toString().includes(busqueda) ||
      item.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      item.descripcion?.toLowerCase().includes(busqueda.toLowerCase())
  )

  const cargar = async () => {
    try {
      const respuesta = await consultarPuestos()

      if (respuesta.exito && Array.isArray(respuesta.datos)) {
        setPuestos(respuesta.datos)
      } else {
        setPuestos([])
      }
      setMensaje(respuesta.mensaje)
      setExito(respuesta.exito)
    } catch {
      setPuestos([])
      setMensaje('No fue posible comunicarse con la API.')
      setExito(false)
    }
  }

  const desactivar = async (codigoPuesto: number) => {
    if (!window.confirm('¿Desactivar este puesto? Quedará inactivo, pero se conserva su historial.')) return

    try {
      const respuesta = await desactivarPuesto(codigoPuesto)
      setMensaje(respuesta.mensaje)
      setExito(respuesta.exito)
      if (respuesta.exito) await cargar()
    } catch (error) {
      setMensaje(extraerError(error))
      setExito(false)
    }
  }

  useEffect(() => {
    cargar()
  }, [])

  return (
    <div className="proveedor-page pagina-lista">
      <div className="proveedor-container pagina-lista-interna">
        <div className="proveedor-header">
          <h1 className="proveedor-title">Consulta de Puestos</h1>
          <p className="proveedor-subtitle">
            Puestos de trabajo que se asignan a los empleados.
          </p>
        </div>

        <div className="proveedor-card tarjeta-lista">
          <div className="proveedor-card-header">
            <h2 className="proveedor-card-title">Puestos registrados</h2>
            <div className="d-flex align-items-center gap-3">
              <span className="proveedor-total">Total: {puestos.length}</span>
              <Link to="/dashboard/puestos/agregar" className="btn btn-primary btn-sm">
                + Agregar Puesto
              </Link>
            </div>
          </div>

          {mensaje && (
            <div className={`alert ${exito ? 'alert-info' : 'alert-danger'} proveedor-mensaje`} role="alert">
              {mensaje}
            </div>
          )}

          <div className="mb-3 flex-shrink-0">
            <input
              type="text"
              className="form-control"
              placeholder="Buscar por código, nombre o descripción..."
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
                  <th>Descripción</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {filtrados.length > 0 ? (
                  filtrados.map((item) => (
                    <tr key={item.codigoPuesto}>
                      <td>{item.codigoPuesto}</td>
                      <td>{item.nombre}</td>
                      <td>{item.descripcion}</td>
                      <td>
                        <span className={`badge ${item.estado ? 'bg-success' : 'bg-secondary'}`}>
                          {item.estado ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex gap-2 justify-content-center">
                          <button
                            className="btn btn-sm btn-outline-warning"
                            onClick={() => navigate(`/dashboard/puestos/editar/${item.codigoPuesto}`)}
                          >
                            Editar
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => desactivar(item.codigoPuesto)}
                            disabled={!item.estado}
                            title={item.estado ? 'Desactivar puesto' : 'Ya está inactivo'}
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
                      No existen puestos registrados.
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
