import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { buscarRepartidor, editarRepartidor } from '../services/repartidorServices'
import { consultarEmpleados } from '../services/empleadoServices'
import type { RepartidorEditar } from '../interfaces/RepartidorEditar'
import type { EmpleadoConsulta } from '../interfaces/EmpleadoConsulta'
import './AgregarProveedorPage.css' // se reutilizan los estilos de Proveedores

// El error del servidor llega como "Procedimiento: ... | Mensaje: texto"; se muestra solo el texto
const extraerError = (error: any) => {
  const detalle: string = error?.response?.data?.detalle ?? ''
  const posicion = detalle.indexOf('Mensaje: ')
  if (posicion >= 0) return detalle.substring(posicion + 9)
  return error?.response?.data?.mensaje ?? 'No fue posible comunicarse con la API.'
}

export default function EditarRepartidorPage() {
  const navigate = useNavigate()
  const { codigoRepartidor } = useParams()

  const [repartidor, setRepartidor] = useState<RepartidorEditar | null>(null)
  const [empleados, setEmpleados] = useState<EmpleadoConsulta[]>([])
  const [mensaje, setMensaje] = useState('')
  const [exito, setExito] = useState<boolean | null>(null)

  useEffect(() => {
    const cargar = async () => {
      try {
        const respuestaEmpleados = await consultarEmpleados()
        if (respuestaEmpleados.exito && Array.isArray(respuestaEmpleados.datos)) {
          setEmpleados(respuestaEmpleados.datos)
        }

        const respuesta = await buscarRepartidor(Number(codigoRepartidor))

        if (respuesta.exito && respuesta.datos) {
          setRepartidor({
            codigoRepartidor: respuesta.datos.codigoRepartidor,
            codigoEmpleado: respuesta.datos.codigoEmpleado,
            estado: respuesta.datos.estado
          })
        } else {
          setMensaje(respuesta.mensaje)
          setExito(false)
        }
      } catch {
        setMensaje('No fue posible comunicarse con la API.')
        setExito(false)
      }
    }
    cargar()
  }, [codigoRepartidor])

  const guardarCambios = async (evento: React.FormEvent) => {
    evento.preventDefault()
    if (!repartidor) return

    try {
      const respuesta = await editarRepartidor(repartidor)

      setMensaje(respuesta.mensaje)
      setExito(respuesta.exito)

      if (respuesta.exito) {
        setTimeout(() => navigate('/dashboard/repartidores'), 1000)
      }
    } catch (error) {
      setMensaje(extraerError(error))
      setExito(false)
    }
  }

  // Solo empleados activos, más el que ya tiene este registro
  const opciones = empleados.filter(
    (e) => e.estado || (repartidor && e.codigoEmpleado === repartidor.codigoEmpleado)
  )

  return (
    <div className="agregar-proveedor-page">
      <div className="agregar-proveedor-container">
        <div className="agregar-proveedor-header">
          <h1 className="agregar-proveedor-title">Editar Repartidor</h1>
          <p className="agregar-proveedor-subtitle">
            Modifica los datos del repartidor seleccionado.
          </p>
        </div>

        <div className="agregar-proveedor-card">
          <div className="agregar-proveedor-card-header">
            <h2>Información del Repartidor</h2>
          </div>

          {mensaje && (
            <div className={exito ? 'alert alert-success' : 'alert alert-danger'}>
              {mensaje}
            </div>
          )}

          {repartidor && (
            <form onSubmit={guardarCambios}>
              <div className="row">
                <div className="col-md-8 mb-3">
                  <label className="form-label">Empleado</label>
                  <select
                    className="form-select"
                    value={repartidor.codigoEmpleado}
                    onChange={(e) =>
                      setRepartidor({ ...repartidor, codigoEmpleado: Number(e.target.value) })
                    }
                    required
                  >
                    {opciones.map((e) => (
                      <option key={e.codigoEmpleado} value={e.codigoEmpleado}>
                        {[e.primerNombre, e.segundoNombre, e.primerApellido, e.segundoApellido]
                          .filter(Boolean)
                          .join(' ')}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-md-4 mb-3">
                  <label className="form-label">Estado</label>
                  <select
                    className="form-select"
                    value={repartidor.estado ? '1' : '0'}
                    onChange={(e) =>
                      setRepartidor({ ...repartidor, estado: e.target.value === '1' })
                    }
                  >
                    <option value="1">Activo</option>
                    <option value="0">Inactivo</option>
                  </select>
                </div>
              </div>

              <div className="agregar-proveedor-actions d-flex gap-2 justify-content-end">
                <Link to="/dashboard/repartidores" className="btn btn-secondary">
                  Cancelar
                </Link>
                <button type="submit" className="btn btn-primary">
                  Guardar Cambios
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
