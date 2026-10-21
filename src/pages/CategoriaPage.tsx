import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { consultarCategorias, eliminarCategoria } from '../services/categoriaServices'
import type { CategoriaConsulta } from '../interfaces/CategoriaConsulta'
import './ProveedorPage.css' // se reutilizan los estilos de Proveedores

export default function CategoriaPage() {
  const [categorias, setCategorias] = useState<CategoriaConsulta[]>([])
  const [mensaje, setMensaje] = useState('')
  const [busqueda, setBusqueda] = useState('')

  const [seleccionada, setSeleccionada] = useState<CategoriaConsulta | null>(null)
  const [mostrarModal, setMostrarModal] = useState(false)

  const navigate = useNavigate()

  const filtradas = categorias.filter(
    (item) =>
      item.codigoCategoria?.toString().includes(busqueda) ||
      item.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      item.descripcion?.toLowerCase().includes(busqueda.toLowerCase())
  )

  const verDetalle = (item: CategoriaConsulta) => {
    setSeleccionada(item)
    setMostrarModal(true)
  }

  const cerrarModal = () => {
    setMostrarModal(false)
    setSeleccionada(null)
  }

  const cargarCategorias = async () => {
    try {
      const respuesta = await consultarCategorias()

      if (respuesta.exito && Array.isArray(respuesta.datos)) {
        setCategorias(respuesta.datos)
      } else {
        setCategorias([])
      }
      setMensaje(respuesta.mensaje)
    } catch {
      setCategorias([])
      setMensaje('No fue posible comunicarse con la API.')
    }
  }

  const borrarCategoria = async (codigoCategoria: number) => {
    if (!window.confirm('¿Borrar esta categoría?')) return

    try {
      const respuesta = await eliminarCategoria(codigoCategoria)
      setMensaje(respuesta.mensaje)
      if (respuesta.exito) await cargarCategorias()
    } catch {
      setMensaje('No se pudo borrar la categoría.')
    }
  }

  useEffect(() => {
    cargarCategorias()
  }, [])

  return (
    <div className="proveedor-page pagina-lista">
      <div className="proveedor-container pagina-lista-interna">
        <div className="proveedor-header">
          <h1 className="proveedor-title">Consulta de Categorías</h1>
          <p className="proveedor-subtitle">
            Consulta las categorías registradas en el sistema.
          </p>
        </div>

        <div className="proveedor-card tarjeta-lista">
          <div className="proveedor-card-header">
            <h2 className="proveedor-card-title">Categorías registradas</h2>
            <div className="d-flex align-items-center gap-3">
              <span className="proveedor-total">Total: {categorias.length}</span>
              <Link to="/dashboard/categorias/agregar" className="btn btn-primary btn-sm">
                + Agregar Categoría
              </Link>
            </div>
          </div>

          {mensaje && (
            <div className="alert alert-info proveedor-mensaje" role="alert">
              {mensaje}
            </div>
          )}

          <div className="mb-3 flex-shrink-0">
            <input
              type="text"
              className="form-control"
              placeholder="Buscar por código, nombre o descripción..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          <div className="proveedor-table-container tabla-scroll">
            <table className="table table-bordered proveedor-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Nombre</th>
                  <th>Descripción</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {filtradas.length > 0 ? (
                  filtradas.map((item) => (
                    <tr key={item.codigoCategoria}>
                      <td>{item.codigoCategoria}</td>
                      <td>{item.nombre}</td>
                      <td>{item.descripcion}</td>
                      <td>
                        <div className="d-flex gap-2 justify-content-center">
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => verDetalle(item)}
                          >
                            Detalle
                          </button>
                          <button
                            className="btn btn-sm btn-outline-warning"
                            onClick={() =>
                              navigate(`/dashboard/categorias/editar/${item.codigoCategoria}`)
                            }
                          >
                            Editar
                            </button>
                            <button
                             className="btn btn-sm btn-outline-danger"
                            onClick={() => borrarCategoria(item.codigoCategoria)}
                          >
                             Borrar
                              </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="sin-registros text-center">
                      No existen categorías registradas.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {mostrarModal && seleccionada && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content p-3">
              <h5>Detalle de la categoría</h5>
              <hr />
              <p><strong>Código:</strong> {seleccionada.codigoCategoria}</p>
              <p><strong>Nombre:</strong> {seleccionada.nombre}</p>
              <p><strong>Descripción:</strong> {seleccionada.descripcion}</p>
              <div className="text-end mt-3">
                <button className="btn btn-secondary" onClick={cerrarModal}>
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
