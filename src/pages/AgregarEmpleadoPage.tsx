import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { agregarEmpleado } from '../services/empleadoServices'
import { consultarPuestos } from '../services/puestoServices'
import { consultarEstadosCiviles } from '../services/estadoCivilServices'
import type { EmpleadoAgregar } from '../interfaces/EmpleadoAgregar'
import type { PuestoConsulta } from '../interfaces/PuestoConsulta'
import type { EstadoCivilConsulta } from '../interfaces/EstadoCivilConsulta'
import './AgregarProveedorPage.css' // se reutilizan los estilos de Proveedores

// El error del servidor llega como "Procedimiento: ... | Mensaje: texto"; se muestra solo el texto
const extraerError = (error: any) => {
  const detalle: string = error?.response?.data?.detalle ?? ''
  const posicion = detalle.indexOf('Mensaje: ')
  if (posicion >= 0) return detalle.substring(posicion + 9)
  return error?.response?.data?.mensaje ?? 'No fue posible comunicarse con la API.'
}

const vacio: EmpleadoAgregar = {
  telefono: '',
  fechaIngreso: null,
  estado: true,
  primerNombre: '',
  segundoNombre: '',
  primerApellido: '',
  segundoApellido: '',
  codigoPuesto: null,
  dpi: '',
  fechaNacimiento: null,
  codigoEstadoCivil: null,
  profesion: '',
  extendidoEn: '',
  direccion: ''
}

export default function AgregarEmpleadoPage() {
  const navigate = useNavigate()
  const [empleado, setEmpleado] = useState<EmpleadoAgregar>(vacio)
  const [mensaje, setMensaje] = useState('')
  const [exito, setExito] = useState<boolean | null>(null)

  // Catálogos para las listas desplegables
  const [puestos, setPuestos] = useState<PuestoConsulta[]>([])
  const [estadosCiviles, setEstadosCiviles] = useState<EstadoCivilConsulta[]>([])

  useEffect(() => {
    const cargarCatalogos = async () => {
      try {
        const rp = await consultarPuestos()
        if (rp.exito && Array.isArray(rp.datos)) setPuestos(rp.datos.filter((p) => p.estado))

        const re = await consultarEstadosCiviles()
        if (re.exito && Array.isArray(re.datos)) setEstadosCiviles(re.datos)
      } catch {
        setMensaje('No fue posible cargar los puestos o estados civiles.')
        setExito(false)
      }
    }
    cargarCatalogos()
  }, [])

  const manejarCambio = (
    evento: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = evento.target

    setEmpleado({
      ...empleado,
      [name]:
        name === 'estado' ? value === 'true'
        : name === 'codigoPuesto' || name === 'codigoEstadoCivil' ? (value === '' ? null : Number(value))
        : name === 'fechaIngreso' || name === 'fechaNacimiento' ? (value || null)
        : value
    })
  }

  const guardarEmpleado = async (evento: React.FormEvent) => {
    evento.preventDefault()

    try {
      const respuesta = await agregarEmpleado(empleado)

      setMensaje(respuesta.mensaje)
      setExito(respuesta.exito)

      if (respuesta.exito) {
        setEmpleado(vacio)
        setTimeout(() => navigate('/dashboard/empleados'), 1000)
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
          <h1 className="agregar-proveedor-title">Agregar Empleado</h1>
          <p className="agregar-proveedor-subtitle">
            Registra un nuevo empleado en el sistema.
          </p>
        </div>

        <div className="agregar-proveedor-card">
          <div className="agregar-proveedor-card-header">
            <h2>Información del Empleado</h2>
          </div>

          {mensaje && (
            <div className={exito ? 'alert alert-success' : 'alert alert-danger'}>
              {mensaje}
            </div>
          )}

          <form onSubmit={guardarEmpleado}>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Primer nombre</label>
                <input type="text" className="form-control" name="primerNombre"
                  value={empleado.primerNombre} onChange={manejarCambio}
                  maxLength={30} required />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Segundo nombre</label>
                <input type="text" className="form-control" name="segundoNombre"
                  value={empleado.segundoNombre} onChange={manejarCambio}
                  maxLength={30} />
              </div>
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Primer apellido</label>
                <input type="text" className="form-control" name="primerApellido"
                  value={empleado.primerApellido} onChange={manejarCambio}
                  maxLength={30} required />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Segundo apellido</label>
                <input type="text" className="form-control" name="segundoApellido"
                  value={empleado.segundoApellido} onChange={manejarCambio}
                  maxLength={30} />
              </div>
            </div>

            <div className="row">
              <div className="col-md-4 mb-3">
                <label className="form-label">Teléfono</label>
                <input type="text" className="form-control" name="telefono"
                  value={empleado.telefono} onChange={manejarCambio}
                  maxLength={20} required />
              </div>
              <div className="col-md-4 mb-3">
                <label className="form-label">Fecha de ingreso</label>
                <input type="date" className="form-control" name="fechaIngreso"
                  value={empleado.fechaIngreso ?? ''} onChange={manejarCambio} />
              </div>
              <div className="col-md-4 mb-3">
                <label className="form-label">Estado</label>
                <select className="form-select" name="estado"
                  value={String(empleado.estado)} onChange={manejarCambio}>
                  <option value="true">Activo</option>
                  <option value="false">Inactivo</option>
                </select>
              </div>
            </div>

            <h5 className="mt-2 mb-3">Puesto y datos personales</h5>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Puesto</label>
                <select className="form-select" name="codigoPuesto"
                  value={empleado.codigoPuesto ?? ''} onChange={manejarCambio}>
                  <option value="">Sin puesto asignado</option>
                  {puestos.map((p) => (
                    <option key={p.codigoPuesto} value={p.codigoPuesto}>{p.nombre}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">DPI (13 dígitos)</label>
                <input type="text" className="form-control" name="dpi"
                  value={empleado.dpi ?? ''} onChange={manejarCambio}
                  inputMode="numeric" maxLength={13} pattern="[0-9]{13}"
                  title="El DPI debe tener exactamente 13 dígitos" />
              </div>
            </div>

            <div className="row">
              <div className="col-md-4 mb-3">
                <label className="form-label">Fecha de nacimiento</label>
                <input type="date" className="form-control" name="fechaNacimiento"
                  value={empleado.fechaNacimiento ?? ''} onChange={manejarCambio} />
              </div>
              <div className="col-md-4 mb-3">
                <label className="form-label">Estado civil</label>
                <select className="form-select" name="codigoEstadoCivil"
                  value={empleado.codigoEstadoCivil ?? ''} onChange={manejarCambio}>
                  <option value="">Sin especificar</option>
                  {estadosCiviles.map((ec) => (
                    <option key={ec.codigoEstadoCivil} value={ec.codigoEstadoCivil}>{ec.nombre}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-4 mb-3">
                <label className="form-label">Profesión</label>
                <input type="text" className="form-control" name="profesion"
                  value={empleado.profesion ?? ''} onChange={manejarCambio} maxLength={100} />
              </div>
            </div>

            <div className="row">
              <div className="col-md-4 mb-3">
                <label className="form-label">Extendido en</label>
                <input type="text" className="form-control" name="extendidoEn"
                  value={empleado.extendidoEn ?? ''} onChange={manejarCambio} maxLength={100} />
              </div>
              <div className="col-md-8 mb-3">
                <label className="form-label">Dirección</label>
                <input type="text" className="form-control" name="direccion"
                  value={empleado.direccion ?? ''} onChange={manejarCambio} maxLength={255} />
              </div>
            </div>

            <div className="agregar-proveedor-actions d-flex gap-2 justify-content-end">
              <Link to="/dashboard/empleados" className="btn btn-secondary">
                Cancelar
              </Link>
              <button type="submit" className="btn btn-primary">
                Guardar Empleado
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
