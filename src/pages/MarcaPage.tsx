import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { consultarMarcas } from '../services/marcaService'
import type { MarcaConsulta } from '../interfaces/MarcaConsulta'
import './MarcaPage.css'

function MarcaPage() {

  const navigate = useNavigate()

  const [marcas, setMarcas] = useState<MarcaConsulta[]>([])
  const [mensaje, setMensaje] = useState('')
  const [exito, setExito] = useState<boolean | null>(null)

  const cargarMarcas = async () => {
    try {
      const respuesta = await consultarMarcas()

      if (respuesta.exito && respuesta.datos) {
        setMarcas(respuesta.datos)
        setMensaje(respuesta.mensaje)
        setExito(true)
      } else {
        setMarcas([])
        setMensaje(respuesta.mensaje)
        setExito(false)
      }
    } catch {
      setMarcas([])
      setMensaje('No fue posible comunicarse con la API.')
      setExito(false)
    }
  }

  useEffect(() => {
    cargarMarcas()
  }, [])

  return (
    <div className="marca-page">
  <div className="marca-container">

        {/* ENCABEZADO */}
        <div className="marca-header">
          <h1 className="marca-title">
            Catálogo de Marca
          </h1>
          <p className="marca-subtitle">
            Administra las marcas registradas en el sistema.
          </p>
        </div>

        {/* TARJETA */}
        <div className="marca-card tarjeta-lista">

          <div className="marca-card-header">

            <h2 className="marca-card-title">
              Marcas registradas
            </h2>

            <div className="d-flex gap-2">
              <span className="marca-total">
                Total: {marcas.length}
              </span>

              <button
                className="btn btn-primary btn-sm"
                onClick={() => navigate('/dashboard/marca/agregar')}
              >
                + Nueva Marca
              </button>
            </div>

          </div>

          {/* MENSAJE */}
          {mensaje && (
            <div
              className={
                exito
                  ? 'alert alert-info marca-mensaje'
                  : 'alert alert-danger marca-mensaje'
              }
              role="alert"
            >
              {mensaje}
            </div>
          )}

          {/* TABLA */}
          <div className="marca-table-container tabla-scroll">

            <table className="table table-bordered marca-table">

              <thead>
                <tr>
                  <th className="col-codigo">
                    Código
                  </th>
                  <th>
                    Nombre
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

                {marcas.length > 0 ? (

                  marcas.map((marca) => (

                    <tr key={marca.codigoMarca}>

                      <td className="col-codigo">
                        {marca.codigoMarca}
                      </td>

                      <td>
                        {marca.nombre}
                      </td>

                      <td className="col-estado">
                        <span
                          className={
                            marca.estado
                              ? 'estado-activo'
                              : 'estado-inactivo'
                          }
                        >
                          {marca.estado
                            ? 'Activo'
                            : 'Inactivo'}
                        </span>
                      </td>

                      <td className="col-acciones">
                        <button
                          className="btn btn-outline-primary btn-sm"
                          onClick={() =>
                            navigate(
                              `/dashboard/marca/editar/${marca.codigoMarca}`
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
                      colSpan={4}
                      className="sin-registros"
                    >
                      No existen marcas registradas.
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

export default MarcaPage