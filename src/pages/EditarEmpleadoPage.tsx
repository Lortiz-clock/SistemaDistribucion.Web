import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { buscarEmpleado, editarEmpleado } from '../services/empleadoServices'
import type { EmpleadoEditar } from '../interfaces/EmpleadoEditar'
import './AgregarProveedorPage.css' // se reutilizan los estilos de Proveedores

export default function EditarEmpleadoPage() {
  const navigate = useNavigate()
  const { codigoEmpleado } = useParams()

  const [empleado, setEmpleado] = useState<EmpleadoEditar | null>(null)
  const [mensaje, setMensaje] = useState('')
  const [exito, setExito] = useState<boolean | null>(null)

  useEffect(() => {
    const cargar = async () => {
      try {
        const respuesta = await buscarEmpleado(Number(codigoEmpleado))

        if (respuesta.exito && respuesta.datos) {
          setEmpleado({
            ...respuesta.datos,
            fechaIngreso: respuesta.datos.fechaIngreso?.split('T')[0] ?? null
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
  }, [codigoEmpleado])

  const manejarCambio = (
    evento: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    if (!empleado) return
    const { name, value } = evento.target

    setEmpleado({
      ...empleado,
      [name]:
        name === 'estado' ? value === 'true'
        : name === 'fechaIngreso' ? (value || null)
        : value
    })
  }

  const guardarCambios = async (evento: React.FormEvent) => {
    evento.preventDefault()
    if (!empleado) return

    try {
      const respuesta = await editarEmpleado(empleado)

      setMensaje(respuesta.mensaje)
      setExito(respuesta.exito)

      if (respuesta.exito) {
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
          <h1 className="agregar-proveedor-title">Editar Empleado</h1>
          <p className="agregar-proveedor-subtitle">
            Modifica los datos del empleado seleccionado.
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

          {empleado && (
            <form onSubmit={guardarCambios}>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Primer nombre</label>
                  <input type="text" className="form-control" name="primerNombre"
                    value={empleado.primerNombre ?? ''} onChange={manejarCambio}
                    maxLength={30} required />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Segundo nombre</label>
                  <input type="text" className="form-control" name="segundoNombre"
                    value={empleado.segundoNombre ?? ''} onChange={manejarCambio}
                    maxLength={30} />
                </div>
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Primer apellido</label>
                  <input type="text" className="form-control" name="primerApellido"
                    value={empleado.primerApellido ?? ''} onChange={manejarCambio}
                    maxLength={30} required />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Segundo apellido</label>
                  <input type="text" className="form-control" name="segundoApellido"
                    value={empleado.segundoApellido ?? ''} onChange={manejarCambio}
                    maxLength={30} />
                </div>
              </div>

              <div className="row">
                <div className="col-md-4 mb-3">
                  <label className="form-label">Teléfono</label>
                  <input type="text" className="form-control" name="telefono"
                    value={empleado.telefono ?? ''} onChange={manejarCambio}
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
