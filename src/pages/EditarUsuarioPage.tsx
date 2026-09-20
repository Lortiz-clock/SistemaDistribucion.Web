import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { buscarUsuario, editarUsuario } from '../services/usuarioService'
import type { UsuarioEditar } from '../interfaces/UsuarioEditar'
import './AgregarUsuarioPage.css'

function EditarUsuarioPage() {

  const { codigoUsuario } = useParams()
  const navigate = useNavigate()

  const [usuario, setUsuario] = useState<UsuarioEditar>({
    codigoUsuario: 0,
    codigoEmpleado: 0,
    codigoRol: 0,
    nombreUsuario: '',
    passwordHash: '',
    estado: true
  })

  const [mensaje, setMensaje] = useState('')
  const [exito, setExito] = useState<boolean | null>(null)
  const [cargando, setCargando] = useState(true)

  const cargarUsuario = async () => {
    try {
      const respuesta = await buscarUsuario(Number(codigoUsuario))

      if (respuesta.exito && respuesta.datos) {
        setUsuario({
          codigoUsuario: respuesta.datos.codigoUsuario,
          codigoEmpleado: respuesta.datos.codigoEmpleado,
          codigoRol: respuesta.datos.codigoRol,
          nombreUsuario: respuesta.datos.nombreUsuario,
          passwordHash: '', // nunca se precarga la contraseña
          estado: respuesta.datos.estado
        })
      } else {
        setMensaje(respuesta.mensaje)
        setExito(false)
      }
    } catch {
      setMensaje('No fue posible comunicarse con la API.')
      setExito(false)
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargarUsuario()
  }, [codigoUsuario])

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
      const usuarioAEnviar = {
        ...usuario,
        passwordHash: usuario.passwordHash?.trim() === '' ? null : usuario.passwordHash
      }

      const respuesta = await editarUsuario(usuarioAEnviar)

      setMensaje(respuesta.mensaje)
      setExito(respuesta.exito)

      if (respuesta.exito) {
        setTimeout(() => navigate('/dashboard/usuarios'), 1000)
      }
    } catch {
      setMensaje('No fue posible comunicarse con la API.')
      setExito(false)
    }
  }

  if (cargando) {
    return <p>Cargando datos del usuario...</p>
  }

  return (
    <div className="agregar-usuario-page">
      <div className="agregar-usuario-container">

        <div className="agregar-usuario-header">
          <h1 className="agregar-usuario-title">Editar Usuario</h1>
          <p className="agregar-usuario-subtitle">
            Modifica los datos del usuario seleccionado.
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
                <label className="form-label">
                  Nueva Contraseña (dejar vacío para no cambiarla)
                </label>
                <input
                  type="password"
                  className="form-control"
                  name="passwordHash"
                  value={usuario.passwordHash ?? ''}
                  onChange={manejarCambio}
                  placeholder="••••••••"
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

            <div className="agregar-usuario-actions d-flex gap-2 justify-content-end">
  <Link to="/dashboard/usuarios" className="btn btn-secondary">
    Regresar
  </Link>
  <button type="submit" className="btn btn-primary">
    Guardar Cambios
  </button>
</div>

          </form>
        </div>
      </div>
    </div>
  )
}

export default EditarUsuarioPage