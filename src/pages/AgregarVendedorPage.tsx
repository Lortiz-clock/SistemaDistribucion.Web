import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { agregarVendedor } from '../services/vendedorServices'
import { consultarEmpleados } from '../services/empleadoServices'
import type { EmpleadoConsulta } from '../interfaces/EmpleadoConsulta'
import './AgregarProveedorPage.css' // se reutilizan los estilos de Proveedores

// El error del servidor llega como "Procedimiento: ... | Mensaje: texto"; se muestra solo el texto
const extraerError = (error: any) => {
  const detalle: string = error?.response?.data?.detalle ?? ''
  const posicion = detalle.indexOf('Mensaje: ')
  if (posicion >= 0) return detalle.substring(posicion + 9)
  return error?.response?.data?.mensaje ?? 'No fue posible comunicarse con la API.'
}

export default function AgregarVendedorPage() {
  const navigate = useNavigate()

  const [empleados, setEmpleados] = useState<EmpleadoConsulta[]>([])
  const [codigoEmpleado, setCodigoEmpleado] = useState(0)
  const [mensaje, setMensaje] = useState('')
  const [exito, setExito] = useState<boolean | null>(null)

  useEffect(() => {
    const cargar = async () => {
      try {
        const respuesta = await consultarEmpleados()
        if (respuesta.exito && Array.isArray(respuesta.datos)) {
          setEmpleados(respuesta.datos.filter((e) => e.estado))
        }
      } catch {
        setMensaje('No fue posible cargar los empleados.')
        setExito(false)
      }
    }
    cargar()
  }, [])

  const guardar = async (evento: React.FormEvent) => {
    evento.preventDefault()

    if (codigoEmpleado === 0) {
      setMensaje('Selecciona un empleado.')
      setExito(false)
      return
    }

    try {
      const respuesta = await agregarVendedor({ codigoEmpleado })

      setMensaje(respuesta.mensaje)
      setExito(respuesta.exito)

      if (respuesta.exito) {
        setTimeout(() => navigate('/dashboard/vendedores'), 1000)
      }
    } catch (error) {
      setMensaje(extraerError(error))
      setExito(false)
    }
  }

  return (
    <div className="agregar-proveedor-page">
      <div className="agregar-proveedor-container">
        <div className="agregar-proveedor-header">
          <h1 className="agregar-proveedor-title">Agregar Vendedor</h1>
          <p className="agregar-proveedor-subtitle">
            Registra un empleado como vendedor.
          </p>
        </div>

        <div className="agregar-proveedor-card">
          <div className="agregar-proveedor-card-header">
            <h2>Información del Vendedor</h2>
          </div>

          {mensaje && (
            <div className={exito ? 'alert alert-success' : 'alert alert-danger'}>
              {mensaje}
            </div>
          )}

          <form onSubmit={guardar}>
            <div className="row">
              <div className="col-md-12 mb-3">
                <label className="form-label">Empleado</label>
                <select
                  className="form-select"
                  value={codigoEmpleado}
                  onChange={(e) => setCodigoEmpleado(Number(e.target.value))}
                  required
                >
                  <option value={0}>Seleccione un empleado</option>
                  {empleados.map((e) => (
                    <option key={e.codigoEmpleado} value={e.codigoEmpleado}>
                      {[e.primerNombre, e.segundoNombre, e.primerApellido, e.segundoApellido]
                        .filter(Boolean)
                        .join(' ')}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="agregar-proveedor-actions d-flex gap-2 justify-content-end">
              <Link to="/dashboard/vendedores" className="btn btn-secondary">
                Cancelar
              </Link>
              <button type="submit" className="btn btn-primary">
                Guardar Vendedor
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
