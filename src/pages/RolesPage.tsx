import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { consultarRoles } from '../services/rolService'
import type { RolConsulta } from '../interfaces/Rol'
import './RolesPage.css'

function RolesPage() {

  const navigate = useNavigate()

  const [roles, setRoles] = useState<RolConsulta[]>([])
  const [mensaje, setMensaje] = useState('')
  const [exito, setExito] = useState<boolean | null>(null)

  const cargarRoles = async () => {
    try {
      const respuesta = await consultarRoles()

      if (respuesta.exito && respuesta.datos) {
        setRoles(respuesta.datos)
        setMensaje(respuesta.mensaje)
        setExito(true)
      } else {
        setRoles([])
        setMensaje(respuesta.mensaje)
        setExito(false)
      }
    } catch {
      setRoles([])
      setMensaje('No fue posible comunicarse con la API.')
      setExito(false)
    }
  }

  useEffect(() => {
    cargarRoles()
  }, [])

  return (
    <div className="roles-page">
      <div className="roles-container">

        {/* ENCABEZADO */}
        <div className="roles-header">
          <h1 className="roles-title">
            Administración de Roles
          </h1>
          <p className="roles-subtitle">
            Define los perfiles y sus permisos en el sistema.
          </p>
        </div>

        {/* TARJETA */}
        <div className="roles-card">

          <div className="roles-card-header">

            <h2 className="roles-card-title">
              Roles registrados
            </h2>

            <div className="d-flex gap-2 align-items-center">
              <span className="roles-total">
                Total: {roles.length}
              </span>

              <button
                className="btn btn-primary btn-sm"
                onClick={() => navigate('/dashboard/roles/nuevo')}
              >
                + Nuevo Rol
              </button>
            </div>

          </div>

          {/* MENSAJE */}
          {mensaje && (
            <div
              className={
                exito
                  ? 'alert alert-info roles-mensaje'
                  : 'alert alert-danger roles-mensaje'
              }
              role="alert"
            >
              {mensaje}
            </div>
          )}

          {/* TABLA */}
          <div className="roles-table-container">

            <table className="table table-bordered roles-table">

              <thead>
                <tr>
                  <th className="col-codigo">
                    Código
                  </th>
                  <th>
                    Nombre
                  </th>
                  <th>
                    Descripción
                  </th>
                  <th className="col-estado">
                    Estado
                  </th>
                  <th className="col-acciones">
                    Acciones
                  </th>
                </tr>
              </thead>

              <tbody>

                {roles.length > 0 ? (

                  roles.map((rol) => (

                    <tr key={rol.codigoRol}>

                      <td className="col-codigo">
                        {rol.codigoRol}
                      </td>

                      <td>
                        {rol.nombre}
                      </td>

                      <td>
                        {rol.descripcionRol}
                      </td>

                      <td className="col-estado">
                        <span
                          className={
                            rol.estado
                              ? 'estado-activo'
                              : 'estado-inactivo'
                          }
                        >
                          {rol.estado ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>

                      <td className="col-acciones">
                        <button
                          className="btn btn-outline-primary btn-sm"
                          onClick={() =>
                            navigate(`/dashboard/roles/editar/${rol.codigoRol}`)
                          }
                        >
                          Editar
                        </button>
                      </td>

                    </tr>

                  ))

                ) : (
                  <tr>
                    <td colSpan={5} className="sin-registros">
                      No existen roles registrados.
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

export default RolesPage