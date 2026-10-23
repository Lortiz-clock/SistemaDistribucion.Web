import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { agregarPuesto } from '../services/puestoServices'
import type { PuestoAgregar } from '../interfaces/PuestoAgregar'
import './AgregarProveedorPage.css' // se reutilizan los estilos de Proveedores

// El error del servidor llega como "Procedimiento: ... | Mensaje: texto"; se muestra solo el texto
const extraerError = (error: any) => {
  const detalle: string = error?.response?.data?.detalle ?? ''
  const posicion = detalle.indexOf('Mensaje: ')
  if (posicion >= 0) return detalle.substring(posicion + 9)
  return error?.response?.data?.mensaje ?? 'No fue posible comunicarse con la API.'
}

export default function AgregarPuestoPage() {
  const navigate = useNavigate()

  const [puesto, setPuesto] = useState<PuestoAgregar>({ nombre: '', descripcion: '' })
  const [mensaje, setMensaje] = useState('')
  const [exito, setExito] = useState<boolean | null>(null)

  const guardar = async (evento: React.FormEvent) => {
    evento.preventDefault()

    try {
      const respuesta = await agregarPuesto(puesto)

      setMensaje(respuesta.mensaje)
      setExito(respuesta.exito)

      if (respuesta.exito) {
        setPuesto({ nombre: '', descripcion: '' })
        setTimeout(() => navigate('/dashboard/puestos'), 1000)
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
          <h1 className="agregar-proveedor-title">Agregar Puesto</h1>
          <p className="agregar-proveedor-subtitle">
            Registra un nuevo puesto de trabajo.
          </p>
        </div>

        <div className="agregar-proveedor-card">
          <div className="agregar-proveedor-card-header">
            <h2>Información del Puesto</h2>
          </div>

          {mensaje && (
            <div className={exito ? 'alert alert-success' : 'alert alert-danger'}>
              {mensaje}
            </div>
          )}

          <form onSubmit={guardar}>
            <div className="row">
              <div className="col-md-12 mb-3">
                <label className="form-label">Nombre</label>
                <input
                  type="text"
                  className="form-control"
                  value={puesto.nombre}
                  onChange={(e) => setPuesto({ ...puesto, nombre: e.target.value })}
                  placeholder="Ej: Vendedor"
                  maxLength={100}
                  required
                />
              </div>
            </div>

            <div className="row">
              <div className="col-md-12 mb-3">
                <label className="form-label">Descripción</label>
                <textarea
                  className="form-control"
                  rows={3}
                  value={puesto.descripcion}
                  onChange={(e) => setPuesto({ ...puesto, descripcion: e.target.value })}
                  placeholder="Funciones principales del puesto"
                  maxLength={255}
                />
              </div>
            </div>

            <div className="agregar-proveedor-actions d-flex gap-2 justify-content-end">
              <Link to="/dashboard/puestos" className="btn btn-secondary">
                Cancelar
              </Link>
              <button type="submit" className="btn btn-primary">
                Guardar Puesto
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
