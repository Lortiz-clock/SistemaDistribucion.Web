import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loginUsuario } from '../services/authService'
import type { UsuarioLogin } from '../interfaces/UsuarioLogin'
import './Login.css'

function Login() {
  const navigate = useNavigate()
  const [credenciales, setCredenciales] = useState<UsuarioLogin>({
    nombreUsuario: '',
    password: ''
  })
  const [mensaje, setMensaje] = useState('')

  const manejarCambio = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredenciales({ ...credenciales, [e.target.name]: e.target.value })
  }

  const iniciarSesion = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const respuesta = await loginUsuario(credenciales)

      if (respuesta.exito && respuesta.datos?.token) {
        localStorage.setItem('token', respuesta.datos.token)
        localStorage.setItem('nombreUsuario', respuesta.datos.nombreCompleto)
        localStorage.setItem('modulos', JSON.stringify(respuesta.datos.modulos))
        navigate('/dashboard')
      } else {
        setMensaje(respuesta.mensaje || 'Credenciales incorrectos.')
      }
    } catch (error) {
      setMensaje('No fue posible comunicarse con la API.')
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <h2 className="login-title">DISTRIBUCIÓN</h2>

        {mensaje && (
          <div className="alert alert-danger" role="alert">
            {mensaje}
          </div>
        )}

        <form onSubmit={iniciarSesion}>
          <div className="mb-4">
            <label className="form-label">Usuario</label>
            <input
              type="text"
              className="form-control"
              name="nombreUsuario"
              value={credenciales.nombreUsuario}
              onChange={manejarCambio}
              required
              autoFocus
            />
          </div>

          <div className="mb-4">
            <label className="form-label">Contraseña</label>
            <input
              type="password"
              className="form-control"
              name="password"
              value={credenciales.password}
              onChange={manejarCambio}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary w-100">
            INGRESAR
          </button>
        </form>
      </div>
    </div>
  )
}

export default Login