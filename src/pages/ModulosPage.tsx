import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { consultarModulos } from '../services/moduloService'
import type { ModuloConsulta } from '../interfaces/ModuloConsulta'
import './ModulosPage.css'

function ModulosPage() {

  const navigate = useNavigate()

  const [modulos, setModulos] = useState<ModuloConsulta[]>([])
  const [mensaje, setMensaje] = useState('')
  const [exito, setExito] = useState<boolean | null>(null)

  const cargarModulos = async () => {
    try {
      const respuesta = await consultarModulos()

      if (respuesta.exito && respuesta.datos) {
        setModulos(respuesta.datos)
        setMensaje(respuesta.mensaje)
        setExito(true)
      } else {
        setModulos([])
        setMensaje(respuesta.mensaje)
        setExito(false)
      }
    } catch {
      setModulos([])
      setMensaje('No fue posible comunicarse con la API.')
      setExito(false)
    }
  }

  useEffect(() => {
    cargarModulos()
  }, [])

  return (
    <div className="modulos-page">
      <div className="modulos-container">

        {/* ENCABEZADO */}
        <div className="modulos-header">
          <h1 className="modulos-title">
            Catálogo de Módulos
          </h1>
          <p className="modulos-subtitle">
            Administra las opciones de menú del sistema.
          </p>
        </div>

        {/* TARJETA */}
        <div className="modulos-card">

          <div className="modulos-card-header">

            <h2 className="modulos-card-title">
              Módulos registrados
            </h2>

            <div className="d-flex gap-2">
              <span className="modulos-total">
                Total: {modulos.length}
              </span>

              <button
                className="btn btn-primary btn-sm"
                onClick={() => navigate('/dashboard/modulos/nuevo')}
              >
                + Nuevo Módulo
              </button>
            </div>

          </div>

          {/* MENSAJE */}
          {mensaje && (
            <div
              className={
                exito
                  ? 'alert alert-info modulos-mensaje'
                  : 'alert alert-danger modulos-mensaje'
              }
              role="alert"
            >
              {mensaje}
            </div>
          )}

          {/* TABLA */}
          <div className="modulos-table-container">

            <table className="table table-bordered modulos-table">

              <thead>
                <tr>
                  <th className="col-codigo">
                    Código
                  </th>
                  <th>
                    Nombre
                  </th>
                  <th>
                    Ruta
                  </th>
                  <th>
                    Icono
                  </th>
                  <th className="col-orden">
                    Orden
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

                {modulos.length > 0 ? (

                  modulos.map((modulo) => (

                    <tr key={modulo.codigoModulo}>

                      <td className="col-codigo">
                        {modulo.codigoModulo}
                      </td>

                      <td>
                        {modulo.nombre}
                      </td>

                      <td>
                        {modulo.rutaFront}
                      </td>

                      <td>
                        {modulo.icono}
                      </td>

                      <td className="col-orden">
                        {modulo.ordenMostrar}
                      </td>

                      <td className="col-estado">
                        <span
                          className={
                            modulo.estado
                              ? 'estado-activo'
                              : 'estado-inactivo'
                          }
                        >
                          {modulo.estado
                            ? 'Activo'
                            : 'Inactivo'}
                        </span>
                      </td>

                      <td className="col-acciones">
                        <button
                          className="btn btn-outline-primary btn-sm"
                          onClick={() =>
                            navigate(
                              `/dashboard/modulos/editar/${modulo.codigoModulo}`
                            )
                          }
                        >
                          Editar
                        </button>
                      </td>

                    </tr>

                  ))

                ) : (
                  <tr>
                    <td
                      colSpan={7}
                      className="sin-registros"
                    >
                      No existen módulos registrados.
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

export default ModulosPage