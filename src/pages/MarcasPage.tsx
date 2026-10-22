import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { consultarMarcas } from '../services/marcaService'
import type { MarcaConsulta } from '../interfaces/MarcaConsulta'
import './MarcasPage.css'

function MarcasPage() {

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
    <div className="marcas-page d-flex flex-column h-100" style={{ minHeight: 0 }}>
     <div className="marcas-container d-flex flex-column flex-grow-1" style={{ minHeight: 0 }}>

        {/* ENCABEZADO */}
        <div className="marcas-header">
          <h1 className="marcas-title">
            Catálogo de Marcas
          </h1>
          <p className="marcas-subtitle">
            Administra las marcas registradas en el sistema.
          </p>
        </div>

        {/* TARJETA */}
        <div className="marcas-card tarjeta-lista">

          <div className="marcas-card-header">

            <h2 className="marcas-card-title">
              Marcas registradas
            </h2>

            <div className="d-flex gap-2">
              <span className="marcas-total">
                Total: {marcas.length}
              </span>

              <button
                className="btn btn-primary btn-sm"
                onClick={() => navigate('/dashboard/marcas/agregar')}
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
                  ? 'alert alert-info marcas-mensaje'
                  : 'alert alert-danger marcas-mensaje'
              }
              role="alert"
            >
              {mensaje}
            </div>
          )}

          {/* TABLA */}
          <div className="marcas-table-container tabla-scroll">

            <table className="table table-bordered marcas-table">

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
                              `/dashboard/marcas/editar/${marca.codigoMarca}`
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

export default MarcasPage