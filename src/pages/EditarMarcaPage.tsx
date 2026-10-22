import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { buscarMarca, editarMarca } from '../services/marcaService'
import type { MarcaEditar } from '../interfaces/MarcaEditar'
import './AgregarMarcaPage.css'  

function EditarMarcaPage() {

  const navigate = useNavigate()

  const { codigoMarca } = useParams()

  const [marca, setMarca] = useState<MarcaEditar>({
    codigoMarca: 0,
    nombre: '',
    estado: true
  })

  const [mensaje, setMensaje] = useState('')
  const [exito, setExito] = useState<boolean | null>(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    const cargarMarca = async () => {
      try {
        const respuesta = await buscarMarca(Number(codigoMarca))

        if (respuesta.exito && respuesta.datos) {
          setMarca(respuesta.datos)
        } else {
          setMensaje(respuesta.mensaje || 'No se encontró la marca.')
          setExito(false)
        }
      } catch {
        setMensaje('No fue posible comunicarse con la API.')
        setExito(false)
      } finally {
        setCargando(false)
      }
    }

    cargarMarca()
  }, [codigoMarca])

  const manejarCambio = (
    evento:
      React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
  ) => {
    const { name, value } = evento.target

    setMarca({
      ...marca,
      [name]:
        name === 'estado'
          ? value === 'true'
          : value
    })
  }

  const guardarMarca = async (
    evento: React.FormEvent
  ) => {
    evento.preventDefault()

    try {
      const respuesta = await editarMarca(marca)  

      setMensaje(respuesta.mensaje)
      setExito(respuesta.exito)

      if (respuesta.exito) {
        setTimeout(() => navigate('/dashboard/marcas'), 1200)
      }
    } catch {
      setMensaje('No fue posible comunicarse con la API.')
      setExito(false)
    }
  }

  if (cargando) {
    return (
      <div className="agregar-marca-page">
        <div className="agregar-marca-container">
          <p className="text-muted">Cargando marca...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="agregar-marca-page">
      <div className="agregar-marca-container">

        <div className="agregar-marca-header">
          <h1 className="agregar-marca-title">Editar Marca</h1>
          <p className="agregar-marca-subtitle">
            Modifica la información de la marca.
          </p>
        </div>

        <div className="agregar-marca-card">

          <div className="agregar-marca-card-header">
            <h2>Información de la Marca</h2>
          </div>

          {mensaje && (
            <div
              className={
                exito
                  ? 'alert alert-success'
                  : 'alert alert-danger'
              }
            >
              {mensaje}
            </div>
          )}

          <form onSubmit={guardarMarca}>
            <div className="row">

              <div className="col-md-6 mb-3">
                <label className="form-label">
                  Nombre de la Marca
                </label>

                <input
                  type="text"
                  className="form-control"
                  name="nombre"
                  value={marca.nombre}
                  onChange={manejarCambio}
                  required
                />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">
                  Estado
                </label>

                <select
                  className="form-select"
                  name="estado"
                  value={String(marca.estado)}
                  onChange={manejarCambio}
                >
                  <option value="true">
                    Activo
                  </option>

                  <option value="false">
                    Inactivo
                  </option>
                </select>
              </div>

            </div>

            <div className="agregar-marca-actions">

              <button
                type="submit"
                className="btn btn-primary"
              >
                Guardar Cambios
              </button>

            </div>

          </form>

        </div>
      </div>
    </div>
  )
}

export default EditarMarcaPage