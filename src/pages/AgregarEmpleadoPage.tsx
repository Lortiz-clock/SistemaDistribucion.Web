import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { agregarEmpleado } from '../services/empleadoServices'
import type { EmpleadoAgregar } from '../interfaces/EmpleadoAgregar'
import './AgregarProveedorPage.css' // se reutilizan los estilos de Proveedores

const vacio: EmpleadoAgregar = {
  telefono: '',
  fechaIngreso: null,
  estado: true,
  primerNombre: '',
  segundoNombre: '',
  primerApellido: '',
  segundoApellido: ''
}

export default function AgregarEmpleadoPage() {
  const navigate = useNavigate()
  const [empleado, setEmpleado] = useState<EmpleadoAgregar>(vacio)
  const [mensaje, setMensaje] = useState('')
  const [exito, setExito] = useState<boolean | null>(null)

  const manejarCambio = (
    evento: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = evento.target

    setEmpleado({
      ...empleado,
      [name]:
        name === 'estado' ? value === 'true'
        : name === 'fechaIngreso' ? (value || null)
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
    } catch {
      setMensaje('No fue posible comunicarse con la API.')
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
