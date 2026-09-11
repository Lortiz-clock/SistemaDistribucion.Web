import { useState } from 'react'
import { agregarUsuario } from '../services/usuarioService'
import type { UsuarioAgregar } from '../interfaces/UsuarioAgregar'
import './AgregarUsuarioPage.css'

function AgregarUsuarioPage() {

  const [usuario, setUsuario] =
    useState<UsuarioAgregar>({
      codigoEmpleado: 0,
      codigoRol: 0,
      nombreUsuario: '',
      passwordHash: '',
      estado: true
    })

  const [mensaje, setMensaje] = useState('')
  const [exito, setExito] = useState<boolean | null>(null)

  const manejarCambio = (
    evento: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = evento.target

    setUsuario({
      ...usuario,
      [name]:
        name === 'codigoEmpleado' || name === 'codigoRol'
          ? Number(value)
          : name === 'estado'
            ? value === 'true'
            : value
    })
  }

  const guardarUsuario = async (evento: React.FormEvent) => {
    evento.preventDefault()

    try {
      const respuesta = await agregarUsuario(usuario)

      setMensaje(respuesta.mensaje)
      setExito(respuesta.exito)

      if (respuesta.exito) {
        setUsuario({
          codigoEmpleado: 0,
          codigoRol: 0,
          nombreUsuario: '',
          passwordHash: '',
          estado: true
        })
      }
    } catch {
      setMensaje('No fue posible comunicarse con la API.')
      setExito(false)
    }
  }

  return (
    <div className="agregar-usuario-page">
      <div className="agregar-usuario-container">

        <div className="agregar-usuario-header">
          <h1 className="agregar-usuario-title">Agregar Usuario</h1>
          <p className="agregar-usuario-subtitle">
            Registra un nuevo usuario en el sistema.
          </p>
        </div>

        <div className="agregar-usuario-card">
          <div className="agregar-usuario-card-header">
            <h2>Información del Usuario</h2>
          </div>

          {mensaje && (
            <div className={exito ? 'alert alert-success' : 'alert alert-danger'}>
              {mensaje}
            </div>
          )}

          <form onSubmit={guardarUsuario}>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Código de Empleado</label>
                <input
                  type="number"
                  className="form-control"
                  name="codigoEmpleado"
                  value={usuario.codigoEmpleado}
                  onChange={manejarCambio}
                  min="1"
                  required
                />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Código de Rol</label>
                <input
                  type="number"
                  className="form-control"
                  name="codigoRol"
                  value={usuario.codigoRol}
                  onChange={manejarCambio}
                  min="1"
                  required
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label">Nombre de Usuario</label>
              <input
                type="text"
                className="form-control"
                name="nombreUsuario"
                value={usuario.nombreUsuario}
                onChange={manejarCambio}
                required
              />
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Contraseña</label>
                <input
                  type="password"
                  className="form-control"
                  name="passwordHash"
                  value={usuario.passwordHash}
                  onChange={manejarCambio}
                  required
                />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Estado</label>
                <select
                  className="form-select"
                  name="estado"
                  value={String(usuario.estado)}
                  onChange={manejarCambio}
                >
                  <option value="true">Activo</option>
                  <option value="false">Inactivo</option>
                </select>
              </div>
            </div>

            <div className="agregar-usuario-actions">
              <button type="submit" className="btn btn-primary">
                Guardar Usuario
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  )
}

export default AgregarUsuarioPage