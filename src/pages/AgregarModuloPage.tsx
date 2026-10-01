import { useState } from 'react'
import { agregarModulo } from '../services/moduloService'
import type { ModuloAgregar } from '../interfaces/ModuloAgregar'
import './AgregarModuloPage.css'

function AgregarModuloPage() {

  const [modulo, setModulo] = useState<ModuloAgregar>({
    nombre: '',
    rutaFront: '',
    icono: '',
    ordenMostrar: 0,
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

    setModulo({
      ...modulo,
      [name]:
        name === 'ordenMostrar'
          ? Number(value)
          : name === 'estado'
          ? value === 'true'
          : value
    })
  }

  const guardarModulo = async (
    evento: React.FormEvent
  ) => {
    evento.preventDefault()

    try {
      const respuesta = await agregarModulo(modulo)

      setMensaje(respuesta.mensaje)
      setExito(respuesta.exito)

      if (respuesta.exito) {
        setModulo({
          nombre: '',
          rutaFront: '',
          icono: '',
          ordenMostrar: 0,
          estado: true
        })
      }
    } catch {
      setMensaje('No fue posible comunicarse con la API.')
      setExito(false)
    }
  }

  return (
    <div className="agregar-modulo-page">
      <div className="agregar-modulo-container">

        <div className="agregar-modulo-header">
          <h1 className="agregar-modulo-title">Agregar Módulo</h1>
          <p className="agregar-modulo-subtitle">
            Registra una nueva opción de menú en el sistema.
          </p>
        </div>

        <div className="agregar-modulo-card">

          <div className="agregar-modulo-card-header">
            <h2>Información del Módulo</h2>
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

          <form onSubmit={guardarModulo}>
            <div className="row">

              <div className="col-md-6 mb-3">
                <label className="form-label">
                  Nombre del Módulo
                </label>

                <input
                  type="text"
                  className="form-control"
                  name="nombre"
                  value={modulo.nombre}
                  onChange={manejarCambio}
                  placeholder="Ej: Reportes"
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
                  value={String(modulo.estado)}
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

            <div className="mb-3">
              <label className="form-label">
                Ruta del Frontend
              </label>

              <input
                type="text"
                className="form-control"
                name="rutaFront"
                value={modulo.rutaFront}
                onChange={manejarCambio}
                placeholder="/dashboard/reportes"
                required
              />
            </div>

            <div className="row">

              <div className="col-md-6 mb-3">
                <label className="form-label">
                  Icono (Lucide)
                </label>

                <input
                  type="text"
                  className="form-control"
                  name="icono"
                  value={modulo.icono}
                  onChange={manejarCambio}
                  placeholder="FileText"
                  required
                />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">
                  Orden de Visualización
                </label>

                <input
                  type="number"
                  className="form-control"
                  name="ordenMostrar"
                  value={modulo.ordenMostrar || ''}
                  onChange={manejarCambio}
                  min={1}
                  required
                />
              </div>

            </div>

            <div className="agregar-modulo-actions">

              <button
                type="submit"
                className="btn btn-primary"
              >
                Guardar Módulo
              </button>

            </div>

          </form>

        </div>
      </div>
    </div>
  )
}

export default AgregarModuloPage