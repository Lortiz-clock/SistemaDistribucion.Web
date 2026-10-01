import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { buscarModulo, editarModulo } from '../services/moduloService'
import type { ModuloEditar } from '../interfaces/ModuloEditar'
import './AgregarModuloPage.css'   // 👈 reutiliza el CSS del formulario

function EditarModuloPage() {

  const navigate = useNavigate()

  // 👇 DIFERENCIA 1: leemos el código de la URL (/dashboard/modulos/editar/7)
  const { codigoModulo } = useParams()

  const [modulo, setModulo] = useState<ModuloEditar>({
    codigoModulo: 0,
    nombre: '',
    rutaFront: '',
    icono: '',
    ordenMostrar: 0,
    estado: true
  })

  const [mensaje, setMensaje] = useState('')
  const [exito, setExito] = useState<boolean | null>(null)
  const [cargando, setCargando] = useState(true)

  // 👇 DIFERENCIA 2: al montar la página, cargamos el módulo de la BD
  useEffect(() => {
    const cargarModulo = async () => {
      try {
        const respuesta = await buscarModulo(Number(codigoModulo))

        if (respuesta.exito && respuesta.datos) {
          // pre-llenamos el formulario con lo que devuelve la API
          setModulo(respuesta.datos)
        } else {
          setMensaje(respuesta.mensaje || 'No se encontró el módulo.')
          setExito(false)
        }
      } catch {
        setMensaje('No fue posible comunicarse con la API.')
        setExito(false)
      } finally {
        setCargando(false)
      }
    }

    cargarModulo()
  }, [codigoModulo])

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
      const respuesta = await editarModulo(modulo)  // 👈 DIFERENCIA 3: PUT en vez de POST

      setMensaje(respuesta.mensaje)
      setExito(respuesta.exito)

      if (respuesta.exito) {
        // 👇 DIFERENCIA 4: tras editar, volvemos al listado
        setTimeout(() => navigate('/dashboard/modulos'), 1200)
      }
    } catch {
      setMensaje('No fue posible comunicarse con la API.')
      setExito(false)
    }
  }

  if (cargando) {
    return (
      <div className="agregar-modulo-page">
        <div className="agregar-modulo-container">
          <p className="text-muted">Cargando módulo...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="agregar-modulo-page">
      <div className="agregar-modulo-container">

        <div className="agregar-modulo-header">
          <h1 className="agregar-modulo-title">Editar Módulo</h1>
          <p className="agregar-modulo-subtitle">
            Modifica la información del módulo.
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
                Guardar Cambios
              </button>

            </div>

          </form>

        </div>
      </div>
    </div>
  )
}

export default EditarModuloPage