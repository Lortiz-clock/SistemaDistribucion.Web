import { useState, useEffect } from 'react'
import { consultarOrdenesCompra, buscarDetalleCompra } from '../services/ordenCompraService'
import type { OrdenCompraConsultar } from '../interfaces/OrdenCompraConsultar'
import type { DetalleCompraConsultar } from '../interfaces/DetalleCompraConsultar'

const calcularEstadoFecha = (fechaResep: string) => {
  if (!fechaResep) return { texto: 'Sin fecha', clase: 'bg-secondary' }

  const fecha = new Date(fechaResep)
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)

  const diferenciaMs = fecha.getTime() - hoy.getTime()
  const dias = Math.floor(diferenciaMs / (1000 * 60 * 60 * 24))

  if (dias > 0) {
    return { texto: `Faltan ${dias} días`, clase: 'bg-info text-dark' }
  } else if (dias === 0) {
    return { texto: 'Llega hoy', clase: 'bg-warning text-dark' }
  } else {
    return { texto: `${Math.abs(dias)} días de atraso`, clase: 'bg-danger' }
  }
}

function ListarOrdenesPage() {
  const [ordenes, setOrdenes] = useState<OrdenCompraConsultar[]>([])
  const [mensaje, setMensaje] = useState('')
  const [busqueda, setBusqueda] = useState('')

  const [ordenSeleccionada, setOrdenSeleccionada] = useState<OrdenCompraConsultar | null>(null)
  const [detalles, setDetalles] = useState<DetalleCompraConsultar[]>([])
  const [mostrarModal, setMostrarModal] = useState(false)
  const [cargandoDetalle, setCargandoDetalle] = useState(false)

  useEffect(() => {
    const cargarOrdenes = async () => {
      try {
        const respuesta = await consultarOrdenesCompra()
        if (respuesta.exito) {
          setOrdenes(respuesta.datos)
          setMensaje(respuesta.mensaje)
        } else {
          setMensaje('No se encontraron órdenes.')
        }
      } catch (error) {
        setMensaje('No fue posible cargar las órdenes de compra.')
      }
    }
    cargarOrdenes()
  }, [])

  const ordenesFiltradas = ordenes.filter((item) =>
    item.codigoCompra.toString().includes(busqueda) ||
    item.nombreProveedor.toLowerCase().includes(busqueda.toLowerCase()) ||
    item.estado.toLowerCase().includes(busqueda.toLowerCase())
  )

  const verDetalle = async (orden: OrdenCompraConsultar) => {
    setOrdenSeleccionada(orden)
    setMostrarModal(true)
    setCargandoDetalle(true)
    setDetalles([])

    try {
      const respuesta = await buscarDetalleCompra(orden.codigoCompra)
      if (respuesta.exito && Array.isArray(respuesta.datos)) {
        setDetalles(respuesta.datos)
      }
    } catch (error) {
      console.error("Error al cargar detalles", error)
    } finally {
      setCargandoDetalle(false)
    }
  }

  const cerrarModal = () => {
    setMostrarModal(false)
    setOrdenSeleccionada(null)
    setDetalles([])
  }

  return (
    <div className="container mt-4">
      <h2>Órdenes de Compra</h2>
      {mensaje && <div className="alert alert-info">{mensaje}</div>}

      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Buscar por código, proveedor o estado..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      <div className="card shadow-sm">
        <div className="card-body">
          <table className="table table-bordered table-hover mb-0">
            <thead className="table-dark">
              <tr>
                <th>Código</th>
                <th>Proveedor</th>
                <th>Fecha Emisión</th>
                <th>Estado Recepción</th> {/* 👈 Cambiamos el título */}
                <th>Estado Orden</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {ordenesFiltradas.length > 0 ? (
                ordenesFiltradas.map((orden) => {
                  // 👇 Ejecutamos la función para saber de qué color pintar la fecha
                  const estadoFecha = calcularEstadoFecha(orden.fechaResep)

                  return (
                    <tr key={orden.codigoCompra}>
                      <td>{orden.codigoCompra}</td>
                      <td>{orden.nombreProveedor}</td>
                      <td>{orden.fechaEmision}</td>
                      <td>
                        {/* Mostramos la fecha y abajo el badge de colores */}
                        <small className="text-muted d-block">{orden.fechaResep}</small>
                        <span className={`badge ${estadoFecha.clase}`}>
                          {estadoFecha.texto}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${orden.estado === 'Pendiente' ? 'bg-warning text-dark' : 'bg-success'}`}>
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
                  )
                })
              ) : (
                <tr>
                  <td colSpan={6} className="text-center text-muted">No existen órdenes de compra registradas.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DE DETALLES */}
      {mostrarModal && ordenSeleccionada && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex={-1}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content p-4">
              <h5>Orden de Compra #{ordenSeleccionada.codigoCompra}</h5>
              <p className="mb-1"><strong>Proveedor:</strong> {ordenSeleccionada.nombreProveedor}</p>
              <p className="mb-1"><strong>Fecha Emisión:</strong> {ordenSeleccionada.fechaEmision}</p>
              <p className="mb-3"><strong>Fecha Recepción:</strong> {ordenSeleccionada.fechaResep}</p>
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
                        <td><strong>Q{item.precioMinimo}</strong></td>
                        <td><strong>Q{item.precioSugerido}</strong></td>
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

export default ListarOrdenesPage