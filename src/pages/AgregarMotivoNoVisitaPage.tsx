import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { agregarMotivoNoVisita } from '../services/motivoNoVisitaServices'
import './AgregarProveedorPage.css' // se reutilizan los estilos de Proveedores

// El error del servidor llega como "Procedimiento: ... | Mensaje: texto"; se muestra solo el texto
const extraerError = (error: any) => {
  const detalle: string = error?.response?.data?.detalle ?? ''
  const posicion = detalle.indexOf('Mensaje: ')
  if (posicion >= 0) return detalle.substring(posicion + 9)
  return error?.response?.data?.mensaje ?? 'No fue posible comunicarse con la API.'
}

export default function AgregarMotivoNoVisitaPage() {
  const navigate = useNavigate()

  const [nombre, setNombre] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [exito, setExito] = useState<boolean | null>(null)

  const guardar = async (evento: React.FormEvent) => {
    evento.preventDefault()

    try {
      const respuesta = await agregarMotivoNoVisita({ nombre })

      setMensaje(respuesta.mensaje)
      setExito(respuesta.exito)

      if (respuesta.exito) {
        setNombre('')
        setTimeout(() => navigate('/dashboard/motivos-no-visita'), 1000)
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
          <h1 className="agregar-proveedor-title">Agregar Motivo de No Visita</h1>
          <p className="agregar-proveedor-subtitle">
            Registra un nuevo motivo en el catálogo.
          </p>
        </div>

        <div className="agregar-proveedor-card">
          <div className="agregar-proveedor-card-header">
            <h2>Información del Motivo</h2>
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
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej: Cliente cerrado"
                  maxLength={100}
                  required
                />
              </div>
            </div>

            <div className="agregar-proveedor-actions d-flex gap-2 justify-content-end">
              <Link to="/dashboard/motivos-no-visita" className="btn btn-secondary">
                Cancelar
              </Link>
              <button type="submit" className="btn btn-primary">
                Guardar Motivo
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
