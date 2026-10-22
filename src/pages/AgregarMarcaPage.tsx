import { useState } from 'react'
import { agregarMarca } from '../services/marcaService'
import type { MarcaAgregar } from '../interfaces/MarcaAgregar'
import './AgregarMarcaPage.css'

function AgregarMarcaPage() {

  const [marca, setMarca] = useState<MarcaAgregar>({
    nombre: '',
    estado: true
  })

  const [mensaje, setMensaje] = useState('')
  const [exito, setExito] = useState<boolean | null>(null)

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
      const respuesta = await agregarMarca(marca)

      setMensaje(respuesta.mensaje)
      setExito(respuesta.exito)

      if (respuesta.exito) {
        setMarca({
          nombre: '',
          estado: true
        })
      }
    } catch {
      setMensaje('No fue posible comunicarse con la API.')
      setExito(false)
    }
  }

  return (
    <div className="agregar-marca-page">
      <div className="agregar-marca-container">

        <div className="agregar-marca-header">
          <h1 className="agregar-marca-title">Agregar Marca</h1>
          <p className="agregar-marca-subtitle">
            Registra una nueva marca en el sistema.
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
                  placeholder="Ej: Toyota"
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
                Guardar Marca
              </button>

            </div>

          </form>

        </div>
      </div>
    </div>
  )
}

export default AgregarMarcaPage