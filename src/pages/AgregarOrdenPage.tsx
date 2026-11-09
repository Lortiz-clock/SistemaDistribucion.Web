import { useState, useEffect } from 'react'
import { agregarOrdenCompleta } from '../services/ordenCompraService'
import type { DetalleCompraItem, OrdenCompraCompletaAgregar } from '../interfaces/OrdenCompraCompletaAgregar'
import './AgregarOrdenPage.css'
import { consultarProducto } from '../services/productoService'
import { consultarProveedor } from '../services/proveedorServices'
import ProductoBuscador from './ProductoBuscador'

interface ItemCarrito extends DetalleCompraItem {
  nombreProducto: string
  precioMinimo: string
  precioSugerido: string
  margenPct: string
  metaPct: string
}

// Unidades que trae una caja, tomadas del catalogo de productos.
// El factor viene de tbl_Productos.UnidadesCaja (unidades por caja).
const obtenerFactorCaja = (producto: any): number => Number(producto?.unidadesCaja) || 0

function AgregarOrdenPage() {
  const [orden, setOrden] = useState<Omit<OrdenCompraCompletaAgregar, 'detalles'>>({
    codigoProveedor: 0,
    fechaResep: ''
  })

  const [carrito, setCarrito] = useState<ItemCarrito[]>([])

  const [codigoProducto, setCodigoProducto] = useState(0)
  const [cantidadPedida, setCantidadPedida] = useState(0)
  const [precioCosto, setPrecioCosto] = useState(0)
  const [precioMin, setPrecioMin] = useState(0)   // precio mínimo exacto en Q
  const [precioSug, setPrecioSug] = useState(0)   // precio sugerido exacto en Q

  const [proveedores, setProveedores] = useState<any[]>([])
  const [productos, setProductos] = useState<any[]>([])

  const [mensaje, setMensaje] = useState('')
  const [exito, setExito] = useState<boolean | null>(null)

  // -- Conversion a cajas --
  const [cajasPedidas, setCajasPedidas] = useState(0)
  const productoActual = productos.find((p) => p.codigoProducto === codigoProducto)
  const factorCaja = obtenerFactorCaja(productoActual)
  // Lo que se guarda siempre son UNIDADES: cajas x factor + sueltas
  const unidadesTotales = (cajasPedidas * factorCaja) + cantidadPedida

  // -- Porcentajes en tiempo real --
  // Margen: cuánto sube el precio mínimo sobre el costo
  const margenPct = precioMin > 0 && precioCosto > 0
  ? ((precioMin - precioCosto) / precioMin) * 100
  : 0
const metaPct = precioSug > 0 && precioCosto > 0
  ? ((precioSug - precioCosto) / precioSug) * 100
  : 0

  const desglosarCajas = (codigoProd: number, unidades: number) => {
    const factor = obtenerFactorCaja(productos.find((p) => p.codigoProducto === codigoProd))
    if (factor <= 1) return `${unidades} un.`
    return `${Math.floor(unidades / factor)} cajas + ${unidades % factor} sueltas`
  }

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const respuestaProveedores = await consultarProveedor()
        if (respuestaProveedores.exito && respuestaProveedores.datos) {
          setProveedores(respuestaProveedores.datos)
        }

        const respuestaProductos = await consultarProducto()
        if (respuestaProductos.exito && respuestaProductos.datos) {
          setProductos(respuestaProductos.datos)
        }
      } catch (error) {
        console.error("Error al cargar datos", error)
      }
    }
    cargarDatos()
  }, [])

  const limpiarProducto = () => {
    setCodigoProducto(0)
    setCantidadPedida(0)
    setCajasPedidas(0)
    setPrecioCosto(0)
    setPrecioMin(0)
    setPrecioSug(0)
  }

  const agregarAlCarrito = () => {
    if (codigoProducto === 0 || unidadesTotales <= 0 || precioCosto <= 0) {
      setMensaje('Completa los datos del producto.')
      setExito(false)
      return
    }

    if (precioMin < precioCosto) {
      setMensaje('El precio mínimo no puede ser menor al costo.')
      setExito(false)
      return
    }

    if (precioSug < precioMin) {
      setMensaje('El precio sugerido no puede ser menor al precio mínimo.')
      setExito(false)
      return
    }

    const productoElegido = productos.find((p) => p.codigoProducto === codigoProducto)

    const nuevoProducto: ItemCarrito = {
      codigoProducto,
      nombreProducto: productoElegido?.nombre ?? '',
      cantidadPedida: unidadesTotales,
      precioCosto,
      // Se envían los precios exactos en los mismos campos del DTO
      margenMinimoPct: precioMin,
      metaUtilidadPct: precioSug,
      // Solo para mostrar en la tabla
      precioMinimo: precioMin.toFixed(2),
      precioSugerido: precioSug.toFixed(2),
      margenPct: margenPct.toFixed(2),
      metaPct: metaPct.toFixed(2)
    }

    setCarrito([...carrito, nuevoProducto])
    setMensaje('')
    limpiarProducto()
  }

  const quitarDelCarrito = (index: number) => {
    setCarrito(carrito.filter((_, i) => i !== index))
  }

  const cancelarOrden = () => {
    if (carrito.length > 0) {
      const confirmar = window.confirm('¿Seguro que deseas cancelar la orden? Se perderán los productos agregados.')
      if (!confirmar) return
    }

    setCarrito([])
    setOrden({ codigoProveedor: 0, fechaResep: '' })
    limpiarProducto()
    setMensaje('')
    setExito(null)
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
          margenMinimoPct: item.margenMinimoPct,   // lleva el precio mínimo exacto
          metaUtilidadPct: item.metaUtilidadPct    // lleva el precio sugerido exacto
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

  const totalOrden = carrito.reduce(
    (total, item) => total + (item.cantidadPedida * item.precioCosto),
    0
  )

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
                <small className="d-block" style={{ minHeight: '1.25rem' }}>&nbsp;</small>
                <label className="form-label">Producto:</label>
                <ProductoBuscador
                  productos={productos}
                  seleccionado={codigoProducto}
                  onSeleccionar={(p) => setCodigoProducto(p ? p.codigoProducto : 0)}
                />
              </div>
              <div className="col-md-2">
                <small className="d-block" style={{ minHeight: '1.25rem' }}>&nbsp;</small>
                <label className="form-label">Cajas / Sueltas:</label>
                <div className="d-flex gap-1">
                  <input type="number" min={0} className="form-control" placeholder="Cajas" title="Cajas" disabled={factorCaja <= 1} value={cajasPedidas || ''} onChange={(e) => setCajasPedidas(Number(e.target.value))} />
                  <input type="number" min={0} className="form-control" placeholder="Suel." title="Unidades sueltas" value={cantidadPedida || ''} onChange={(e) => setCantidadPedida(Number(e.target.value))} />
                </div>
              </div>
              <div className="col-md-2">
                <small className="d-block" style={{ minHeight: '1.25rem' }}>&nbsp;</small>
                <label className="form-label">Costo (Q):</label>
                <input type="number" step="0.01" min={0} className="form-control" placeholder="Costo" value={precioCosto || ''} onChange={(e) => setPrecioCosto(Number(e.target.value))} />
              </div>
              <div className="col-md-2">
                <small
                  className={`d-block ${margenPct < 0 ? 'text-danger' : 'text-muted'}`}
                  style={{ minHeight: '1.25rem' }}
                >
                  {precioMin > 0 && precioCosto > 0 ? `Margen: ${margenPct.toFixed(2)}%` : '\u00A0'}
                </small>
                <label className="form-label">Precio Mínimo (Q):</label>
                <input type="number" step="0.01" min={0} className="form-control" placeholder="Mínimo" value={precioMin || ''} onChange={(e) => setPrecioMin(Number(e.target.value))} />
              </div>
              <div className="col-md-2">
                <small
                  className={`d-block ${metaPct < 0 ? 'text-danger' : 'text-muted'}`}
                  style={{ minHeight: '1.25rem' }}
                >
                  {precioSug > 0 && precioCosto > 0 ? `Meta: ${metaPct.toFixed(2)}%` : '\u00A0'}
                </small>
                <label className="form-label">Precio Sugerido (Q):</label>
                <input type="number" step="0.01" min={0} className="form-control" placeholder="Sugerido" value={precioSug || ''} onChange={(e) => setPrecioSug(Number(e.target.value))} />
              </div>
              <div className="col-md-1">
                <button type="button" className="btn btn-success w-100" onClick={agregarAlCarrito}>+</button>
              </div>
              {codigoProducto !== 0 && (
                <div className="col-12 mt-2">
                  <small className="text-muted">
                    {factorCaja > 1 ? `1 caja = ${factorCaja} un.` : 'Este producto no tiene factor de caja (solo unidades)'}
                    {' · '}Total a pedir: <strong>{unidadesTotales}</strong> un.
                    {factorCaja > 1 && ` (${cajasPedidas} cajas + ${cantidadPedida} sueltas)`}
                  </small>
                </div>
              )}
            </div>

            <div className="table-responsive mb-4">
              <table className="table table-bordered">
                <thead className="table-dark">
                  <tr>
                    <th>Producto</th>
                    <th>Cantidad (un.)</th>
                    <th>Costo</th>
                    <th>Precio Mínimo</th>
                    <th>Margen</th>
                    <th>Precio Sugerido</th>
                    <th>Meta</th>
                    <th>Subtotal</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {carrito.length === 0 ? (
                    <tr><td colSpan={9} className="text-center text-muted">No hay productos seleccionados.</td></tr>
                  ) : (
                    carrito.map((item, index) => (
                      <tr key={index}>
                        <td>{item.nombreProducto}</td>
                        <td>{item.cantidadPedida}<small className="text-muted d-block">{desglosarCajas(item.codigoProducto, item.cantidadPedida)}</small></td>
                        <td>Q{item.precioCosto}</td>
                        <td><strong>Q{item.precioMinimo}</strong></td>
                        <td>{item.margenPct}%</td>
                        <td><strong>Q{item.precioSugerido}</strong></td>
                        <td>{item.metaPct}%</td>
                        <td>Q{(item.cantidadPedida * item.precioCosto).toFixed(2)}</td>
                        <td className="text-center">
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            title="Quitar producto"
                            onClick={() => quitarDelCarrito(index)}
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="text-end mb-3">
              <div className="d-inline-block text-start border rounded p-3" style={{ backgroundColor: '#f8f9fa', color: '#212529' }}>
                <div className="d-flex justify-content-between gap-5">
                  <span>Productos distintos:</span>
                  <strong>{carrito.length}</strong>
                </div>
                <div className="d-flex justify-content-between gap-5">
                  <span>Unidades totales:</span>
                  <strong>{carrito.reduce((acc, item) => acc + item.cantidadPedida, 0)}</strong>
                </div>
                <hr className="my-2" />
                <h5 className="mb-0">
                  Total de la orden: <strong>Q{totalOrden.toFixed(2)}</strong>
                </h5>
              </div>
            </div>

            <div className="d-flex justify-content-end gap-2">
              <button type="button" className="btn btn-outline-secondary btn-lg" onClick={cancelarOrden}>
                ✖ Cancelar
              </button>
              <button type="submit" className="btn btn-primary btn-lg"> Guardar</button>
            </div>

          </form>
        </div>
      </div>
    </div>
  )
}

export default AgregarOrdenPage