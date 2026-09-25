import { useEffect, useState } from 'react'
import { consultarOrdenesCompra, buscarDetalleCompra } from '../services/ordenCompraService'
import type { OrdenCompraConsultar } from '../interfaces/OrdenCompraConsultar'
import type { DetalleCompraConsultar } from '../interfaces/DetalleCompraConsultar'
import './ListarOrdenesPage.css'

export default function ListarOrdenesPage() {
  const [ordenes, setOrdenes] = useState<OrdenCompraConsultar[]>([])
  const [mensaje, setMensaje] = useState('')
  const [busqueda, setBusqueda] = useState('')

  const [ordenSeleccionada, setOrdenSeleccionada] = useState<OrdenCompraConsultar | null>(null)
  const [detalles, setDetalles] = useState<DetalleCompraConsultar[]>([])
  const [mostrarModal, setMostrarModal] = useState(false)
  const [cargandoDetalle, setCargandoDetalle] = useState(false)

  const ordenesFiltradas = ordenes.filter(
    (item) =>
      item.codigoCompra.toString().includes(busqueda) ||
      item.nombreProveedor.toLowerCase().includes(busqueda.toLowerCase()) ||
      item.estado.toLowerCase().includes(busqueda.toLowerCase())
  )

  const cargarOrdenes = async () => {
    try {
      const respuesta = await consultarOrdenesCompra()

      if (respuesta.exito && Array.isArray(respuesta.datos)) {
        setOrdenes(respuesta.datos)
        setMensaje(respuesta.mensaje)
      } else {
        setOrdenes([])
        setMensaje(respuesta.mensaje)
      }
    } catch {
      setOrdenes([])
      setMensaje('No fue posible comunicarse con la API.')
    }
  }

  const verDetalle = async (item: OrdenCompraConsultar) => {
    setOrdenSeleccionada(item)
    setMostrarModal(true)
    setCargandoDetalle(true)
    setDetalles([])

    try {
      const respuesta = await buscarDetalleCompra(item.codigoCompra)
      if (respuesta.exito && Array.isArray(respuesta.datos)) {
        setDetalles(respuesta.datos)
      }
    } catch {
      setDetalles([])
    } finally {
      setCargandoDetalle(false)
    }
  }

  const cerrarModal = () => {
    setMostrarModal(false)
    setOrdenSeleccionada(null)
    setDetalles([])
  }

  useEffect(() => {
    cargarOrdenes()
  }, [])

  return (
    <div className="listar-ordenes-page">
      <div className="listar-ordenes-container">
        {/* ENCABEZADO */}
        <div className="listar-ordenes-header">
          <h1 className="listar-ordenes-title">Órdenes de Compra</h1>
          <p className="listar-ordenes-subtitle">
            Consulta las órdenes de compra registradas en el sistema.
          </p>
        </div>

        {/* TARJETA */}
        <div className="listar-ordenes-card">
          <div className="listar-ordenes-card-header">
            <h2 className="listar-ordenes-card-title">Órdenes registradas</h2>
            <span className="listar-ordenes-total">Total: {ordenes.length}</span>
          </div>

          {/* MENSAJE */}
          {mensaje && (
            <div className="alert alert-info listar-ordenes-mensaje" role="alert">
              {mensaje}
            </div>
          )}

          {/* BUSCADOR */}
          <div className="mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Buscar por código, proveedor o estado..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          {/* TABLA */}
          <div className="listar-ordenes-table-container">
            <table className="table table-bordered listar-ordenes-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Proveedor</th>
                  <th>Fecha Emisión</th>
                  <th>Fecha Recepción</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {ordenesFiltradas.length > 0 ? (
                  ordenesFiltradas.map((orden) => (
                    <tr key={orden.codigoCompra}>
                      <td>{orden.codigoCompra}</td>
                      <td>{orden.nombreProveedor}</td>
                      <td>{orden.fechaEmision}</td>
                      <td>{orden.fechaResep}</td>
                      <td>
                        <span
                          className={`badge ${
                            orden.estado === 'Pendiente' ? 'bg-warning text-dark' : 'bg-success'
                          }`}
                        >
                          {orden.estado}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => verDetalle(orden)}
                        >
                          Ver detalles
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center">
                      No existen órdenes de compra registradas.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL DETALLE */}
      {mostrarModal && ordenSeleccionada && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content p-3">
              <h5>Orden de Compra #{ordenSeleccionada.codigoCompra}</h5>
              <p className="mb-1">
                <strong>Proveedor:</strong> {ordenSeleccionada.nombreProveedor}
              </p>
              <p className="mb-1">
                <strong>Fecha Emisión:</strong> {ordenSeleccionada.fechaEmision}
              </p>
              <p className="mb-3">
                <strong>Fecha Recepción:</strong> {ordenSeleccionada.fechaResep}
              </p>
              <hr />

              {cargandoDetalle ? (
                <p className="text-muted">Cargando productos...</p>
              ) : detalles.length > 0 ? (
                <table className="table table-sm table-bordered">
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Cantidad</th>
                      <th>Costo</th>
                      <th>Precio Mínimo</th>
                      <th>Precio Sugerido</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detalles.map((item) => (
                      <tr key={item.codigoDetalle}>
                        <td>{item.nombreProducto}</td>
                        <td>{item.cantidadPedida}</td>
                        <td>Q{item.precioCosto}</td>
                        <td>Q{item.precioMinimo}</td>
                        <td>Q{item.precioSugerido}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-muted">Esta orden no tiene productos.</p>
              )}

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