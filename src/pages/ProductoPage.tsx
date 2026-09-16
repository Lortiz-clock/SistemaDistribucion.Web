import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { consultarProducto } from '../services/productoServices'
import type { ProductoConsulta } from '../interfaces/ProductoConsulta'
import './ProductoPage.css'

function ProductoPage() {

  const [producto, setProducto] = useState<ProductoConsulta[]>([])

  const [mensaje, setMensaje] = useState('')
  const [busqueda, setBusqueda] = useState('')

  const [productoSeleccionado, setProductoSeleccionado] = useState<ProductoConsulta | null>(null)
  const [mostrarModal, setMostrarModal] = useState(false)

  const productosFiltrados = producto.filter((item) =>
    item.codigoProducto.toString().includes(busqueda) ||
    item.nombre.toLowerCase().includes(busqueda.toLowerCase())
  )

  const verDetalle = (item: ProductoConsulta) => {
    setProductoSeleccionado(item)
    setMostrarModal(true)
  }

  const cerrarModal = () => {
    setMostrarModal(false)
    setProductoSeleccionado(null)
  }

  const cargarProducto = async () => {
    try {
      const respuesta = await consultarProducto()

      if (respuesta.exito && Array.isArray(respuesta.datos)) {
        setProducto(respuesta.datos)
        setMensaje(respuesta.mensaje)
      } else {
        setProducto([])
        setMensaje(respuesta.mensaje)
      }
    } catch {
      setProducto([])
      setMensaje('No fue posible comunicarse con la API.')
    }
  }

  useEffect(() => {
    cargarProducto()
  }, [])

  return (
    <div className="producto-page">

      <div className="producto-container">

        {/* ENCABEZADO */}
        <div className="producto-header">
          <h1 className="producto-title">
            Consulta de Productos
          </h1>
          <p className="producto-subtitle">
            Consulta los productos registrados en el catálogo.
          </p>
        </div>

        {/* TARJETA */}
        <div className="producto-card">

          <div className="producto-card-header">
            <h2 className="producto-card-title">
              Productos registrados
            </h2>
            <div className="d-flex align-items-center gap-3">
              <span className="producto-total">
                Total: {producto.length}
              </span>
              <Link to="/dashboard/productos/agregar" className="btn btn-primary btn-sm">
                + Agregar Producto
              </Link>
            </div>
          </div>

          {/* MENSAJE */}
          {mensaje && (
            <div className="alert alert-info producto-mensaje" role="alert">
              {mensaje}
            </div>
          )}

          {/* BUSCADOR */}
          <div className="mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Buscar por código o nombre de producto..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          {/* TABLA */}
          <div className="producto-table-container">

            <table className="table table-bordered producto-table">

              <thead>
                <tr>
                  <th className="col-codigo">Código</th>
                  <th className="col-nombre">Nombre</th>
                  <th className="col-dias">Días Vencimiento</th>
                  <th className="col-precio">Precio Mínimo</th>
                  <th className="col-acciones">Acciones</th>
                </tr>
              </thead>

              <tbody>
                {productosFiltrados.length > 0 ? (
                  productosFiltrados.map((item) => (
                    <tr key={item.codigoProducto}>
                      <td className="col-codigo">{item.codigoProducto}</td>
                      <td className="col-nombre">{item.nombre}</td>
                      <td className="col-dias">{item.diasVencimiento}</td>
                      <td className="col-precio">{item.precioMinimo}</td>
                      <td className="col-acciones">
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => verDetalle(item)}
                        >
                          Detalle
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="sin-registros">
                      No existen productos registrados.
                    </td>
                  </tr>
                )}
              </tbody>

            </table>

          </div>

        </div>

      </div>

      {/* MODAL DETALLE */}
      {mostrarModal && productoSeleccionado && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content p-3">
              <h5>Detalle del producto</h5>
              <p><strong>Costo:</strong> {productoSeleccionado.costo}</p>
              <p><strong>Margen Mínimo:</strong> {productoSeleccionado.margenMinimo}</p>
              <p><strong>Stock Mínimo:</strong> {productoSeleccionado.stockMinimo}</p>
              <p><strong>Categoría:</strong> {productoSeleccionado.codigoCategoria}</p>
              <p><strong>Fecha Vencimiento:</strong> {productoSeleccionado.fechaVencimiento}</p>
              <p><strong>Unidades por Caja:</strong> {productoSeleccionado.unidadesPorCaja}</p>
              <p><strong>Estado:</strong> {productoSeleccionado.estado ? 'Activo' : 'Inactivo'}</p>
              <button className="btn btn-secondary" onClick={cerrarModal}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default ProductoPage