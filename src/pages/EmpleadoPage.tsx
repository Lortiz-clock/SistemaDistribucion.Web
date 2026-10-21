import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { consultarEmpleados, eliminarEmpleado } from '../services/empleadoServices'
import type { EmpleadoConsulta } from '../interfaces/EmpleadoConsulta'
import './ProveedorPage.css' // se reutilizan los estilos de Proveedores

const nombreCompleto = (e: EmpleadoConsulta) =>
  [e.primerNombre, e.segundoNombre, e.primerApellido, e.segundoApellido]
    .filter(Boolean)
    .join(' ')

export default function EmpleadoPage() {
  const [empleados, setEmpleados] = useState<EmpleadoConsulta[]>([])
  const [mensaje, setMensaje] = useState('')
  const [busqueda, setBusqueda] = useState('')

  const [seleccionado, setSeleccionado] = useState<EmpleadoConsulta | null>(null)
  const [mostrarModal, setMostrarModal] = useState(false)

  const navigate = useNavigate()

  const filtrados = empleados.filter(
    (item) =>
      item.codigoEmpleado?.toString().includes(busqueda) ||
      nombreCompleto(item).toLowerCase().includes(busqueda.toLowerCase()) ||
      item.telefono?.toLowerCase().includes(busqueda.toLowerCase())
  )

  const verDetalle = (item: EmpleadoConsulta) => {
    setSeleccionado(item)
    setMostrarModal(true)
  }

  const cerrarModal = () => {
    setMostrarModal(false)
    setSeleccionado(null)
  }

  const cargarEmpleados = async () => {
    try {
      const respuesta = await consultarEmpleados()

      if (respuesta.exito && Array.isArray(respuesta.datos)) {
        setEmpleados(respuesta.datos)
      } else {
        setEmpleados([])
      }
      setMensaje(respuesta.mensaje)
    } catch {
      setEmpleados([])
      setMensaje('No fue posible comunicarse con la API.')
    }
  }

  const borrarEmpleado = async (codigoEmpleado: number) => {
    if (!window.confirm('¿Borrar este empleado?')) return
    try {
      const respuesta = await eliminarEmpleado(codigoEmpleado)
      setMensaje(respuesta.mensaje)
      if (respuesta.exito) await cargarEmpleados()
    } catch {
      setMensaje('No se pudo borrar el empleado.')
    }
  }

  useEffect(() => {
    cargarEmpleados()
  }, [])

  return (
    <div className="proveedor-page pagina-lista">
      <div className="proveedor-container pagina-lista-interna">
        <div className="proveedor-header">
          <h1 className="proveedor-title">Consulta de Empleados</h1>
          <p className="proveedor-subtitle">
            Consulta los empleados registrados en el sistema.
          </p>
        </div>

        <div className="proveedor-card tarjeta-lista">
          <div className="proveedor-card-header">
            <h2 className="proveedor-card-title">Empleados registrados</h2>
            <div className="d-flex align-items-center gap-3">
              <span className="proveedor-total">Total: {empleados.length}</span>
              <Link to="/dashboard/empleados/agregar" className="btn btn-primary btn-sm">
                + Agregar Empleado
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
                  <th>Nombre completo</th>
                  <th>Teléfono</th>
                  <th>Fecha ingreso</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {filtrados.length > 0 ? (
                  filtrados.map((item) => (
                    <tr key={item.codigoEmpleado}>
                      <td>{item.codigoEmpleado}</td>
                      <td>{nombreCompleto(item)}</td>
                      <td>{item.telefono}</td>
                      <td>{item.fechaIngreso?.split('T')[0] ?? '—'}</td>
                      <td>
                        <span className={`badge ${item.estado ? 'bg-success' : 'bg-danger'}`}>
                          {item.estado ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex gap-2 justify-content-center">
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => verDetalle(item)}
                          >
                            Detalle
                          </button>
                                                    <button
                            className="btn btn-sm btn-outline-warning"
                            onClick={() =>
                              navigate(`/dashboard/empleados/editar/${item.codigoEmpleado}`)
                            }
                          >
                            Editar
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => borrarEmpleado(item.codigoEmpleado)}
                            disabled={!item.estado}
                            title={item.estado ? 'Borrar empleado' : 'El empleado ya está inactivo'}
                          >
                            Borrar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="sin-registros text-center">
                      No existen empleados registrados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {mostrarModal && seleccionado && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content p-3">
              <h5>Detalle del empleado</h5>
              <hr />
              <p><strong>Código:</strong> {seleccionado.codigoEmpleado}</p>
              <p><strong>Nombre:</strong> {nombreCompleto(seleccionado)}</p>
              <p><strong>Teléfono:</strong> {seleccionado.telefono}</p>
              <p><strong>Fecha de ingreso:</strong> {seleccionado.fechaIngreso?.split('T')[0] ?? '—'}</p>
              <p><strong>Estado:</strong> {seleccionado.estado ? 'Activo' : 'Inactivo'}</p>
              <div className="text-end mt-3">
                <button className="btn btn-secondary" onClick={cerrarModal}>
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
