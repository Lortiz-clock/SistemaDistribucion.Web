import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { buscarPuesto, editarPuesto } from '../services/puestoServices'
import type { PuestoEditar } from '../interfaces/PuestoEditar'
import './AgregarProveedorPage.css' // se reutilizan los estilos de Proveedores

// El error del servidor llega como "Procedimiento: ... | Mensaje: texto"; se muestra solo el texto
const extraerError = (error: any) => {
  const detalle: string = error?.response?.data?.detalle ?? ''
  const posicion = detalle.indexOf('Mensaje: ')
  if (posicion >= 0) return detalle.substring(posicion + 9)
  return error?.response?.data?.mensaje ?? 'No fue posible comunicarse con la API.'
}

export default function EditarPuestoPage() {
  const navigate = useNavigate()
  const { codigoPuesto } = useParams()

  const [puesto, setPuesto] = useState<PuestoEditar | null>(null)
  const [mensaje, setMensaje] = useState('')
  const [exito, setExito] = useState<boolean | null>(null)

  useEffect(() => {
    const cargar = async () => {
      try {
        const respuesta = await buscarPuesto(Number(codigoPuesto))

        if (respuesta.exito && respuesta.datos) {
          setPuesto({
            codigoPuesto: respuesta.datos.codigoPuesto,
            nombre: respuesta.datos.nombre,
            descripcion: respuesta.datos.descripcion ?? '',
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
  }, [codigoPuesto])

  const guardarCambios = async (evento: React.FormEvent) => {
    evento.preventDefault()
    if (!puesto) return

    try {
      const respuesta = await editarPuesto(puesto)

      setMensaje(respuesta.mensaje)
      setExito(respuesta.exito)

      if (respuesta.exito) {
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
          <h1 className="agregar-proveedor-title">Editar Puesto</h1>
          <p className="agregar-proveedor-subtitle">
            Modifica los datos del puesto seleccionado.
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

          {puesto && (
            <form onSubmit={guardarCambios}>
              <div className="row">
                <div className="col-md-8 mb-3">
                  <label className="form-label">Nombre</label>
                  <input
                    type="text"
                    className="form-control"
                    value={puesto.nombre}
                    onChange={(e) => setPuesto({ ...puesto, nombre: e.target.value })}
                    maxLength={100}
                    required
                  />
                </div>

                <div className="col-md-4 mb-3">
                  <label className="form-label">Estado</label>
                  <select
                    className="form-select"
                    value={puesto.estado ? '1' : '0'}
                    onChange={(e) => setPuesto({ ...puesto, estado: e.target.value === '1' })}
                  >
                    <option value="1">Activo</option>
                    <option value="0">Inactivo</option>
                  </select>
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
                    maxLength={255}
                  />
                </div>
              </div>

              <div className="agregar-proveedor-actions d-flex gap-2 justify-content-end">
                <Link to="/dashboard/puestos" className="btn btn-secondary">
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
