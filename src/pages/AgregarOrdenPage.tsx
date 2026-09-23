import { useState } from 'react'
import { agregarOrdenCompra, agregarDetalleCompra } from '../services/ordenCompraService'
import type { OrdenCompraAgregar } from '../interfaces/OrdenCompraAgregar'
import './AgregarOrdenPage.css'

function AgregarOrdenPage() {
  // 1. Estado del encabezado
  const [orden, setOrden] = useState<OrdenCompraAgregar>({
    codigoProveedor: 0,
    fechaResep: ''
  })

   const [carrito, setCarrito] = useState<any[]>([])
  
 
  const [codigoProducto, setCodigoProducto] = useState(0)
  const [cantidadPedida, setCantidadPedida] = useState(0)
  const [precioCosto, setPrecioCosto] = useState(0)
  const [margenMinimoPct, setMargenMinimoPct] = useState(0)
  const [metaUtilidadPct, setMetaUtilidadPct] = useState(0)

  const [mensaje, setMensaje] = useState('')
  const [exito, setExito] = useState<boolean | null>(null)

 
  const agregarAlCarrito = () => {
    if (codigoProducto === 0 || cantidadPedida <= 0 || precioCosto <= 0) {
      setMensaje('Completa los datos del producto.')
      setExito(false)
      return
    }

    const nuevoProducto = {
      codigoProducto,
      cantidadPedida,
      precioCosto,
      margenMinimoPct,
      metaUtilidadPct,
 
      precioMinimo: (precioCosto + (precioCosto * (margenMinimoPct / 100))).toFixed(2),
      precioSugerido: ((precioCosto + (precioCosto * (margenMinimoPct / 100))) + ((precioCosto + (precioCosto * (margenMinimoPct / 100))) * (metaUtilidadPct / 100))).toFixed(2)
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

      // PASO 1: Guardamos el encabezado y obtenemos el CodigoCompra
      const respuestaOrden = await agregarOrdenCompra(orden)
      
      if (respuestaOrden.exito) {
        const nuevoCodigoCompra = respuestaOrden.datos.codigoCompra // Tu API en C# debe devolver esto

        // PASO 2: Recorremos el carrito y guardamos cada producto
        for (const producto of carrito) {
          await agregarDetalleCompra({
            codigoCompra: nuevoCodigoCompra,
            codigoProducto: producto.codigoProducto,
            cantidadPedida: producto.cantidadPedida,
            precioCosto: producto.precioCosto,
            margenMinimoPct: producto.margenMinimoPct,
            metaUtilidadPct: producto.metaUtilidadPct
          })
        }

        setMensaje('¡Orden de compra creada con éxito!')
        setExito(true)
        
        // Limpiamos todo
        setOrden({ codigoProveedor: 0, fechaResep: '' })
        setCarrito([])
      } else {
        setMensaje(respuestaOrden.mensaje)
        setExito(false)
      }
    } catch {
      setMensaje('No fue posible comunicarse con la API.')
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
            
            {/* --- ENCABEZADO DE LA ORDEN --- */}
            <div className="row mb-4">
              <div className="col-md-6">
                <label className="form-label">Proveedor:</label>
                <select 
                  className="form-select" 
                  value={orden.codigoProveedor}
                  onChange={(e) => setOrden({...orden, codigoProveedor: Number(e.target.value)})}
                  required
                >
                  <option value="0">Seleccione...</option>
                  <option value="1">Distribuidora Norte</option>
                  <option value="2">Carnicería Sur</option>
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label">Fecha de Recepción:</label>
                <input 
                  type="date" 
                  className="form-control" 
                  value={orden.fechaResep}
                  onChange={(e) => setOrden({...orden, fechaResep: e.target.value})}
                  required 
                />
              </div>
            </div>

            {/* --- AGREGAR PRODUCTOS --- */}
            <h5>Agregar Producto</h5>
            <div className="row align-items-end mb-3">
              <div className="col-md-2">
                <label className="form-label">Cód. Producto:</label>
                <input type="number" className="form-control" value={codigoProducto || ''} onChange={(e) => setCodigoProducto(Number(e.target.value))} />
              </div>
              <div className="col-md-2">
                <label className="form-label">Cantidad:</label>
                <input type="number" className="form-control" value={cantidadPedida || ''} onChange={(e) => setCantidadPedida(Number(e.target.value))} />
              </div>
              <div className="col-md-2">
                <label className="form-label">Costo (Q):</label>
                <input type="number" step="0.01" className="form-control" value={precioCosto || ''} onChange={(e) => setPrecioCosto(Number(e.target.value))} />
              </div>
              <div className="col-md-2">
                <label className="form-label">Margen Mín (%):</label>
                <input type="number" className="form-control" value={margenMinimoPct || ''} onChange={(e) => setMargenMinimoPct(Number(e.target.value))} />
              </div>
              <div className="col-md-2">
                <label className="form-label">Meta Util (%):</label>
                <input type="number" className="form-control" value={metaUtilidadPct || ''} onChange={(e) => setMetaUtilidadPct(Number(e.target.value))} />
              </div>
              <div className="col-md-2">
                <button type="button" className="btn btn-success w-100" onClick={agregarAlCarrito}>+ Agregar</button>
              </div>
            </div>

            {/* --- TABLA DEL CARRITO TEMPORAL --- */}
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
                    <tr><td colSpan={7} className="text-center text-muted">No hay productos.</td></tr>
                  ) : (
                    carrito.map((item, index) => (
                      <tr key={index}>
                        <td>{item.codigoProducto}</td>
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