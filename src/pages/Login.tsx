import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Lock, Eye, EyeOff } from 'lucide-react'
import { loginUsuario } from '../services/authService'
import type { UsuarioLogin } from '../interfaces/UsuarioLogin'
import './Login.css'

// Pequeño ayudante: pasa el número de orden a CSS para la animación escalonada
const orden = (n: number) => ({ '--li': n } as React.CSSProperties)

function Login() {
  const navigate = useNavigate()
  const [credenciales, setCredenciales] = useState<UsuarioLogin>({
    nombreUsuario: '',
    password: ''
  })
  const [mensaje, setMensaje] = useState('')
  const [verPassword, setVerPassword] = useState(false)
  const [cargando, setCargando] = useState(false)

  const manejarCambio = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredenciales({ ...credenciales, [e.target.name]: e.target.value })
  }

  const iniciarSesion = async (e: React.FormEvent) => {
    e.preventDefault()
    setMensaje('')
    setCargando(true)

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
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        {/* LADO DEL FORMULARIO */}
        <div className="login-form-box">
          <h2 className="login-title animacion" style={orden(0)}>Iniciar sesión</h2>

          {mensaje && (
            <div className="login-error animacion" style={orden(1)} role="alert">
              {mensaje}
            </div>
          )}

          <form onSubmit={iniciarSesion}>
            <div className="login-campo animacion" style={orden(1)}>
              <input
                type="text"
                id="nombreUsuario"
                name="nombreUsuario"
                placeholder=" "
                value={credenciales.nombreUsuario}
                onChange={manejarCambio}
                required
                autoFocus
                autoComplete="username"
              />
              <label htmlFor="nombreUsuario">Usuario</label>
              <User className="login-icono" size={18} />
            </div>

            <div className="login-campo animacion" style={orden(2)}>
              <input
                type={verPassword ? 'text' : 'password'}
                id="password"
                name="password"
                placeholder=" "
                value={credenciales.password}
                onChange={manejarCambio}
                required
                autoComplete="current-password"
              />
              <label htmlFor="password">Contraseña</label>
              <button
                type="button"
                className="login-ojo"
                onClick={() => setVerPassword(!verPassword)}
                title={verPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                tabIndex={-1}
              >
                {verPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
              <Lock className="login-icono login-icono-candado" size={18} />
            </div>

            <button
              type="submit"
              className="login-boton animacion"
              style={orden(3)}
              disabled={cargando}
            >
              {cargando ? 'INGRESANDO...' : 'INGRESAR'}
            </button>
          </form>
        </div>

        {/* LADO DE BIENVENIDA (panel diagonal) */}
        <div className="login-info-fondo" />
        <div className="login-info-box">
          <h1 className="animacion-derecha" style={orden(0)}>DISTRIBUCIÓN</h1>
          <p className="animacion-derecha" style={orden(1)}>
            Bienvenido al sistema. Ingresa tus credenciales para continuar con tu trabajo.
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
