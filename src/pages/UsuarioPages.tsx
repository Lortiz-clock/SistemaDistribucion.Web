import { useEffect, useState } from 'react'
import { consultarUsuario } from '../services/usuarioService'
import type { UsuarioConsulta } from '../interfaces/UsuarioConsulta'
import './UsuarioPage.css'

function UsuarioPage() {

  const [usuario, setUsuario] = useState<UsuarioConsulta[]>([])

  const [mensaje, setMensaje] = useState('')

  const cargarUsuario = async () => {
    try {

      const respuesta = await consultarUsuario()

      if (respuesta.exito) {

        setUsuario(respuesta.datos)

        setMensaje(respuesta.mensaje)

      } else {

        setUsuario([])

        setMensaje(respuesta.mensaje)

      }

    } catch {

      setUsuario([])

      setMensaje('No fue posible comunicarse con la API.')

    }
  }

  useEffect(() => {
    cargarUsuario()
  }, [])

  return (
    <div className="usuario-page">

      <div className="usuario-container">

        {/* ENCABEZADO */}

        <div className="usuario-header">

          <h1 className="usuario-title">
            Consulta de Usuario
          </h1>

          <p className="usuario-subtitle">
            Consulta los usuarios registrados en el sistema.
          </p>

        </div>

        {/* TARJETA */}

        <div className="usuario-card">

          <div className="usuario-card-header">

            <h2 className="usuario-card-title">
              Usuarios registrados
            </h2>

            <span className="usuario-total">
              Total: {usuario.length}
            </span>

          </div>

          {/* MENSAJE */}

          {mensaje && (

            <div
              className="alert alert-info usuario-mensaje"
              role="alert"
            >
              {mensaje}
            </div>

          )}

          {/* TABLA */}

          <div className="usuario-table-container">

            <table
              className="
                table
                table-bordered
                usuario-table
              "
            >

              <thead>

                <tr>

                  <th className="col-codigo">
                    Código
                  </th>

                  <th className="col-usuario">
                    Usuario
                  </th>

                  <th className="col-nombre">
                    Nombre Completo
                  </th>

                  <th className="col-rol">
                    Rol
                  </th>

                  <th className="col-estado">
                    Estado
                  </th>

                </tr>

              </thead>

              <tbody>

                {usuario.length > 0 ? (

                  usuario.map((item) => (

                    <tr key={item.codigoUsuario}>

                      <td className="col-codigo">
                        {item.codigoUsuario}
                      </td>

                      <td className="col-usuario">
                        {item.nombreUsuario}
                      </td>

                      <td className="col-nombre">
                        {item.nombreCompleto}
                      </td>

                      <td className="col-rol">
                        {item.nombreRol}
                      </td>

                      <td className="col-estado">

                        <span
                          className={
                            item.estado
                              ? 'estado-activo'
                              : 'estado-inactivo'
                          }
                        >
                          {item.estado
                            ? 'Activo'
                            : 'Inactivo'}
                        </span>

                      </td>

                    </tr>

                  ))

                ) : (

                  <tr>

                    <td
                      colSpan={5}
                      className="sin-registros"
                    >
                      No existen usuarios registrados.
                    </td>

                  </tr>

                )}

              </tbody>

            </table>

          </div>

        </div>

      </div>

    </div>
  )
}

export default UsuarioPage