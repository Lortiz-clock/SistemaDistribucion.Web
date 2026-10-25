import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { buscarMotivoNoVisita, editarMotivoNoVisita } from '../services/motivoNoVisitaServices'
import type { MotivoNoVisitaEditar } from '../interfaces/MotivoNoVisitaEditar'
import './AgregarProveedorPage.css' // se reutilizan los estilos de Proveedores

// El error del servidor llega como "Procedimiento: ... | Mensaje: texto"; se muestra solo el texto
const extraerError = (error: any) => {
  const detalle: string = error?.response?.data?.detalle ?? ''
  const posicion = detalle.indexOf('Mensaje: ')
  if (posicion >= 0) return detalle.substring(posicion + 9)
  return error?.response?.data?.mensaje ?? 'No fue posible comunicarse con la API.'
}

export default function EditarMotivoNoVisitaPage() {
  const navigate = useNavigate()
  const { codigoMotivo } = useParams()

  const [motivo, setMotivo] = useState<MotivoNoVisitaEditar | null>(null)
  const [mensaje, setMensaje] = useState('')
  const [exito, setExito] = useState<boolean | null>(null)

  useEffect(() => {
    const cargar = async () => {
      try {
        const respuesta = await buscarMotivoNoVisita(Number(codigoMotivo))

        if (respuesta.exito && respuesta.datos) {
          setMotivo({
            codigoMotivo: respuesta.datos.codigoMotivo,
            nombre: respuesta.datos.nombre,
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
  }, [codigoMotivo])

  const guardarCambios = async (evento: React.FormEvent) => {
    evento.preventDefault()
    if (!motivo) return

    try {
      const respuesta = await editarMotivoNoVisita(motivo)

      setMensaje(respuesta.mensaje)
      setExito(respuesta.exito)

      if (respuesta.exito) {
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
          <h1 className="agregar-proveedor-title">Editar Motivo de No Visita</h1>
          <p className="agregar-proveedor-subtitle">
            Modifica los datos del motivo seleccionado.
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

          {motivo && (
            <form onSubmit={guardarCambios}>
              <div className="row">
                <div className="col-md-8 mb-3">
                  <label className="form-label">Nombre</label>
                  <input
                    type="text"
                    className="form-control"
                    value={motivo.nombre}
                    onChange={(e) => setMotivo({ ...motivo, nombre: e.target.value })}
                    maxLength={100}
                    required
                  />
                </div>

                <div className="col-md-4 mb-3">
                  <label className="form-label">Estado</label>
                  <select
                    className="form-select"
                    value={motivo.estado ? '1' : '0'}
                    onChange={(e) => setMotivo({ ...motivo, estado: e.target.value === '1' })}
                  >
                    <option value="1">Activo</option>
                    <option value="0">Inactivo</option>
                  </select>
                </div>
              </div>

              <div className="agregar-proveedor-actions d-flex gap-2 justify-content-end">
                <Link to="/dashboard/motivos-no-visita" className="btn btn-secondary">
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
