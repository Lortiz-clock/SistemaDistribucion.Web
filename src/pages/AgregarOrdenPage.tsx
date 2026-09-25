import { useState, useEffect } from 'react'
import { agregarOrdenCompleta } from '../services/ordenCompraService'
import type { DetalleCompraItem, OrdenCompraCompletaAgregar } from '../interfaces/OrdenCompraCompletaAgregar'
import './AgregarOrdenPage.css'
import { consultarProducto } from '../services/productoServices'
import { consultarProveedor } from '../services/proveedorServices'

interface ItemCarrito extends DetalleCompraItem {
  nombreProducto: string
  precioMinimo: string
  precioSugerido: string
}

function AgregarOrdenPage() {
  const [orden, setOrden] = useState<Omit<OrdenCompraCompletaAgregar, 'detalles'>>({
    codigoProveedor: 0,
    fechaResep: ''
  })

  const [carrito, setCarrito] = useState<ItemCarrito[]>([])

  const [codigoProducto, setCodigoProducto] = useState(0)
  const [cantidadPedida, setCantidadPedida] = useState(0)
  const [precioCosto, setPrecioCosto] = useState(0)
  const [margenMinimoPct, setMargenMinimoPct] = useState(0)
  const [metaUtilidadPct, setMetaUtilidadPct] = useState(0)

  const [proveedores, setProveedores] = useState<any[]>([])
  const [productos, setProductos] = useState<any[]>([])

  const [mensaje, setMensaje] = useState('')
  const [exito, setExito] = useState<boolean | null>(null)

  useEffect(() => {
  const cargarDatos = async () => {
    try {
      const respuestaProveedores = await consultarProveedor()
      if (respuestaProveedores.exito) setProveedores(respuestaProveedores.datos)

      const respuestaProductos = await consultarProducto()
      if (respuestaProductos.exito) setProductos(respuestaProductos.datos)
    } catch (error) {
      console.error("Error al cargar datos", error)
    }
  }
  cargarDatos()
}, [])

  const agregarAlCarrito = () => {
    if (codigoProducto === 0 || cantidadPedida <= 0 || precioCosto <= 0) {
      setMensaje('Completa los datos del producto.')
      setExito(false)
      return
    }

    const productoElegido = productos.find((p) => p.codigoProducto === codigoProducto)

    const precioMinimo = precioCosto + (precioCosto * (margenMinimoPct / 100))
    const precioSugerido = precioMinimo + (precioMinimo * (metaUtilidadPct / 100))

    const nuevoProducto: ItemCarrito = {
      codigoProducto,
      nombreProducto: productoElegido?.nombre ?? '',
      cantidadPedida,
      precioCosto,
      margenMinimoPct,
      metaUtilidadPct,
      precioMinimo: precioMinimo.toFixed(2),
      precioSugerido: precioSugerido.toFixed(2)
    }

    setCarrito([...carrito, nuevoProducto])
    setMensaje('')

    setCodigoProducto(0)
    setCantidadPedida(0)
    setPrecioCosto(0)
  }

  const guardarOrdenCompleta = async (evento: React.FormEvent) => {
    evento.preventDefault()

    if (orden.codigoProveedor === 0 || carrito.length === 0) {
      setMensaje('Falta seleccionar proveedor o agregar productos.')
      setExito(false)
      return
    }

    try {
      setMensaje('Guardando orden...')
      setExito(true)

      const ordenCompleta: OrdenCompraCompletaAgregar = {
        codigoProveedor: orden.codigoProveedor,
        fechaResep: orden.fechaResep,
        detalles: carrito.map((item) => ({
          codigoProducto: item.codigoProducto,
          cantidadPedida: item.cantidadPedida,
          precioCosto: item.precioCosto,
          margenMinimoPct: item.margenMinimoPct,
          metaUtilidadPct: item.metaUtilidadPct
        }))
      }

      const respuesta = await agregarOrdenCompleta(ordenCompleta)

      if (respuesta.exito) {
        setMensaje(`¡Orden de compra #${respuesta.datos} creada con éxito!`)
        setExito(true)
        setOrden({ codigoProveedor: 0, fechaResep: '' })
        setCarrito([])
      } else {
        setMensaje(respuesta.mensaje || 'Error al crear la orden.')
        setExito(false)
      }
    } catch (error: any) {
      setMensaje(error.response?.data?.mensaje || 'No fue posible comunicarse con la API.')
      setExito(false)
    }
  }

  return (
    <div className="agregar-orden-page">
      <div className="agregar-orden-container">

        <div className="agregar-orden-header">
          <h1 className="agregar-orden-title">Nueva Orden de Compra</h1>
          <p className="agregar-orden-subtitle">Registra un pedido a un proveedor.</p>
        </div>

        <div className="agregar-orden-card">

          {mensaje && (
            <div className={exito ? 'alert alert-success' : 'alert alert-danger'}>
              {mensaje}
            </div>
          )}

          <form onSubmit={guardarOrdenCompleta}>

            <div className="row mb-4">
              <div className="col-md-6">
                <label className="form-label">Proveedor:</label>
                <select
                  className="form-select"
                  value={orden.codigoProveedor}
                  onChange={(e) => setOrden({ ...orden, codigoProveedor: Number(e.target.value) })}
                  required
                >
                  <option value="0">Seleccione Proveedor</option>
                  {proveedores.map((p) => (
  <option key={p.codigoProveedor} value={p.codigoProveedor}>
    {p.nombre}
  </option>
))}
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label">Fecha de Recepción:</label>
                <input
                  type="date"
                  className="form-control"
                  value={orden.fechaResep}
                  onChange={(e) => setOrden({ ...orden, fechaResep: e.target.value })}
                  required
                />
              </div>
            </div>

            <h5>Agregar Producto</h5>
            <div className="row align-items-end mb-3">
              <div className="col-md-3">
                <label className="form-label">Producto:</label>
                <select
                  className="form-select"
                  value={codigoProducto}
                  onChange={(e) => setCodigoProducto(Number(e.target.value))}
                >
                  <option value="0">Seleccione Producto</option>
                  {productos.map((p) => (
                    <option key={p.codigoProducto} value={p.codigoProducto}>
                      {p.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-2">
                <label className="form-label">Cantidad:</label>
                <input type="number" className="form-control" placeholder="Cantidad" value={cantidadPedida || ''} onChange={(e) => setCantidadPedida(Number(e.target.value))} />
              </div>
              <div className="col-md-2">
                <label className="form-label">Costo (Q):</label>
                <input type="number" step="0.01" className="form-control" placeholder="Costo" value={precioCosto || ''} onChange={(e) => setPrecioCosto(Number(e.target.value))} />
              </div>
              <div className="col-md-2">
                <label className="form-label">Margen Mín (%):</label>
                <input type="number" className="form-control" placeholder="Margen" value={margenMinimoPct || ''} onChange={(e) => setMargenMinimoPct(Number(e.target.value))} />
              </div>
              <div className="col-md-2">
                <label className="form-label">Meta Util (%):</label>
                <input type="number" className="form-control" placeholder="Meta" value={metaUtilidadPct || ''} onChange={(e) => setMetaUtilidadPct(Number(e.target.value))} />
              </div>
              <div className="col-md-1">
                <button type="button" className="btn btn-success w-100" onClick={agregarAlCarrito}>+</button>
              </div>
            </div>

            <div className="table-responsive mb-4">
              <table className="table table-bordered">
                <thead className="table-dark">
                  <tr>
                    <th>Producto</th>
                    <th>Cantidad</th>
                    <th>Costo</th>
                    <th>Mín %</th>
                    <th>Meta %</th>
                    <th>Precio Mínimo</th>
                    <th>Precio Sugerido</th>
                  </tr>
                </thead>
                <tbody>
                  {carrito.length === 0 ? (
                    <tr><td colSpan={7} className="text-center text-muted">No hay productos seleccionados.</td></tr>
                  ) : (
                    carrito.map((item, index) => (
                      <tr key={index}>
                        <td>{item.nombreProducto}</td>
                        <td>{item.cantidadPedida}</td>
                        <td>Q{item.precioCosto}</td>
                        <td>{item.margenMinimoPct}%</td>
                        <td>{item.metaUtilidadPct}%</td>
                        <td><strong>Q{item.precioMinimo}</strong></td>
                        <td><strong>Q{item.precioSugerido}</strong></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="text-end">
              <button type="submit" className="btn btn-primary btn-lg">💾 Guardar Orden Completa</button>
            </div>

          </form>
        </div>
      </div>
    </div>
  )
}

export default AgregarOrdenPage