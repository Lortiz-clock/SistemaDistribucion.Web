import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  buscarOrdenCompra,
  buscarDetalleCompra,
  agregarDetalleCompra,
  editarDetalleCompra,
  eliminarDetalleCompra
} from '../services/ordenCompraService'
import './AgregarOrdenPage.css'
import { consultarProducto } from '../services/productoServices'
import { consultarProveedor } from '../services/proveedorServices'
import ProductoBuscador from '../components/ProductoBuscador'

// Item del carrito, con la marca de origen:
// codigoDetalle > 0 = línea que ya existe en la BD
// codigoDetalle < 0 = línea nueva (id temporal local)
interface ItemEditable {
  codigoDetalle: number
  codigoProducto: number
  nombreProducto: string
  cantidadPedida: number
  precioCosto: number
  margenMinimoPct: number
  metaUtilidadPct: number
  precioMinimo: string
  precioSugerido: string
}

// La foto de las líneas tal como llegaron de la BD (para comparar al guardar)
interface LineaOriginal {
  codigoDetalle: number
  cantidadPedida: number
  precioCosto: number
  margenMinimoPct: number
  metaUtilidadPct: number
}

function EditarOrdenPage() {
  const navigate = useNavigate()
  const { codigoCompra } = useParams()

  const [codigoProveedor, setCodigoProveedor] = useState(0)
  const [fechaResep, setFechaResep] = useState('')
  const [estadoOrden, setEstadoOrden] = useState('')

  const [carrito, setCarrito] = useState<ItemEditable[]>([])
  const [lineasOriginales, setLineasOriginales] = useState<LineaOriginal[]>([])

  const [codigoProducto, setCodigoProducto] = useState(0)
  const [cantidadPedida, setCantidadPedida] = useState(0)
  const [precioCosto, setPrecioCosto] = useState(0)
  const [margenMinimoPct, setMargenMinimoPct] = useState(0)
  const [metaUtilidadPct, setMetaUtilidadPct] = useState(0)

  const [proveedores, setProveedores] = useState<any[]>([])
  const [productos, setProductos] = useState<any[]>([])

  const [mensaje, setMensaje] = useState('')
  const [exito, setExito] = useState<boolean | null>(null)
  const [cargando, setCargando] = useState(true)

  // IDs locales negativos para las líneas nuevas (evita duplicar keys)
  const [siguienteIdLocal, setSiguienteIdLocal] = useState(-1)

  // ══════════ CARGA INICIAL: encabezado + detalle + catálogos en paralelo ══════════
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [ordenResp, detalleResp, proveedoresResp, productosResp] = await Promise.all([
          buscarOrdenCompra(Number(codigoCompra)),
          buscarDetalleCompra(Number(codigoCompra)),
          consultarProveedor(),
          consultarProducto()
        ])

        if (ordenResp.exito && ordenResp.datos) {
          setCodigoProveedor(ordenResp.datos.codigoProveedor)
          // El input date solo acepta yyyy-MM-dd; la API puede traer "2026-09-30T00:00:00"
          setFechaResep(ordenResp.datos.fechaResep.split('T')[0])
          setEstadoOrden(ordenResp.datos.estado)
        }

        if (detalleResp.exito && detalleResp.datos) {
          // Foto original para comparar al guardar
          setLineasOriginales(detalleResp.datos.map((d) => ({
            codigoDetalle: d.codigoDetalle,
            cantidadPedida: d.cantidadPedida,
            precioCosto: d.precioCosto,
            margenMinimoPct: d.margenMinimoPct,
            metaUtilidadPct: d.metaUtilidadPct
          })))

          // Carrito editable con las líneas existentes
          setCarrito(detalleResp.datos.map((d) => ({
            codigoDetalle: d.codigoDetalle,
            codigoProducto: d.codigoProducto,
            nombreProducto: d.nombreProducto,
            cantidadPedida: d.cantidadPedida,
            precioCosto: d.precioCosto,
            margenMinimoPct: d.margenMinimoPct,
            metaUtilidadPct: d.metaUtilidadPct,
            precioMinimo: d.precioMinimo.toFixed(2),
            precioSugerido: d.precioSugerido.toFixed(2)
          })))
        }

        if (proveedoresResp.exito && proveedoresResp.datos) setProveedores(proveedoresResp.datos)
        if (productosResp.exito && productosResp.datos) setProductos(productosResp.datos)

      } catch (error) {
        console.error('Error al cargar la orden', error)
        setMensaje('No fue posible comunicarse con la API.')
        setExito(false)
      } finally {
        setCargando(false)
      }
    }
    cargarDatos()
  }, [codigoCompra])

  // ══════════ AGREGAR PRODUCTO NUEVO (mismo estilo que tu Agregar) ══════════
  const agregarAlCarrito = () => {
    if (codigoProducto === 0 || cantidadPedida <= 0 || precioCosto <= 0) {
      setMensaje('Completa los datos del producto.')
      setExito(false)
      return
    }

    const productoElegido = productos.find((p) => p.codigoProducto === codigoProducto)

    const precioMinimo = precioCosto + (precioCosto * (margenMinimoPct / 100))
    const precioSugerido = precioMinimo + (precioMinimo * (metaUtilidadPct / 100))

    const nuevoProducto: ItemEditable = {
      codigoDetalle: siguienteIdLocal,   // 👈 negativo = línea nueva
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
    setSiguienteIdLocal(siguienteIdLocal - 1)
    setMensaje('')

    setCodigoProducto(0)
    setCantidadPedida(0)
    setPrecioCosto(0)
    setMargenMinimoPct(0)
    setMetaUtilidadPct(0)
  }

  // ══════════ EDITAR UNA FILA EN LÍNEA (con recálculo al vuelo) ══════════
  const actualizarFila = (codigoDetalle: number, campo: string, valor: number) => {
    setCarrito(carrito.map((item) => {
      if (item.codigoDetalle !== codigoDetalle) return item
      const actualizado = { ...item, [campo]: valor }
      // Mismas fórmulas de tu Agregar, para que la pantalla siempre muestre lo que se guardará
      actualizado.precioMinimo = (
        actualizado.precioCosto + (actualizado.precioCosto * (actualizado.margenMinimoPct / 100))
      ).toFixed(2)
      actualizado.precioSugerido = (
        Number(actualizado.precioMinimo) + (Number(actualizado.precioMinimo) * (actualizado.metaUtilidadPct / 100))
      ).toFixed(2)
      return actualizado
    }))
  }

  // ══════════ QUITAR DEL CARRITO ══════════
  const quitarDelCarrito = (codigoDetalle: number) => {
    setCarrito(carrito.filter((item) => item.codigoDetalle !== codigoDetalle))
  }

  // ══════════ GUARDAR: sincroniza eliminar / editar / agregar ══════════
  const guardarCambios = async (evento: React.FormEvent) => {
    evento.preventDefault()

    if (carrito.length === 0) {
      setMensaje('La orden debe tener al menos un producto.')
      setExito(false)
      return
    }

    try {
      setMensaje('Guardando cambios...')

      // 1️⃣ ELIMINAR: originales que ya no están en el carrito
      const eliminadas = lineasOriginales.filter(
        (orig) => !carrito.some((c) => c.codigoDetalle === orig.codigoDetalle)
      )
      for (const linea of eliminadas) {
        const r = await eliminarDetalleCompra(linea.codigoDetalle)
        if (!r.exito) throw new Error(r.mensaje)
      }

      // 2️⃣ EDITAR: existentes cuyo contenido cambió respecto a la foto original
      const editadas = carrito.filter((c) => {
        if (c.codigoDetalle < 0) return false
        const orig = lineasOriginales.find((o) => o.codigoDetalle === c.codigoDetalle)
        return orig && (
          orig.cantidadPedida !== c.cantidadPedida ||
          orig.precioCosto !== c.precioCosto ||
          orig.margenMinimoPct !== c.margenMinimoPct ||
          orig.metaUtilidadPct !== c.metaUtilidadPct
        )
      })
      for (const linea of editadas) {
        const r = await editarDetalleCompra({
          codigoDetalle: linea.codigoDetalle,
          codigoProducto: linea.codigoProducto,
          cantidadPedida: linea.cantidadPedida,
          precioCosto: linea.precioCosto,
          margenMinimoPct: linea.margenMinimoPct,
          metaUtilidadPct: linea.metaUtilidadPct
        })
        if (!r.exito) throw new Error(r.mensaje)
      }

      // 3️⃣ AGREGAR: las líneas nuevas (codigoDetalle negativo)
      const nuevas = carrito.filter((c) => c.codigoDetalle < 0)
      for (const linea of nuevas) {
        const r = await agregarDetalleCompra({
          codigoCompra: Number(codigoCompra),
          codigoProducto: linea.codigoProducto,
          cantidadPedida: linea.cantidadPedida,
          precioCosto: linea.precioCosto,
          margenMinimoPct: linea.margenMinimoPct,
          metaUtilidadPct: linea.metaUtilidadPct
        })
        if (!r.exito) throw new Error(r.mensaje)
      }

      setExito(true)
      setMensaje('Cambios guardados correctamente.')
      setTimeout(() => navigate('/dashboard/ordenes/listar'), 1200)

    } catch (error: any) {
      setExito(false)
      setMensaje(error.message || 'No fue posible comunicarse con la API.')
    }
  }

  if (cargando) {
    return (
      <div className="agregar-orden-page">
        <div className="agregar-orden-container">
          <p className="text-muted">Cargando orden...</p>
        </div>
      </div>
    )
  }

  // ══════════ ORDEN NO EDITABLE (protección visual, la real vive en los SPs) ══════════
  if (estadoOrden !== 'Pendiente') {
    return (
      <div className="agregar-orden-page">
        <div className="agregar-orden-container">
          <div className="agregar-orden-card">
            <div className="alert alert-warning">
              Esta orden está en estado "{estadoOrden}" y ya no puede editarse.
            </div>
            <button
              className="btn btn-outline-secondary"
              onClick={() => navigate('/dashboard/ordenes/listar')}
            >
              Volver al listado
            </button>
          </div>
        </div>
      </div>
    )
  }

  const totalOrden = carrito.reduce(
    (total, item) => total + (item.cantidadPedida * item.precioCosto),
    0
  )

  return (
    <div className="agregar-orden-page">
      <div className="agregar-orden-container">

        <div className="agregar-orden-header">
          <h1 className="agregar-orden-title">Editar Orden #{codigoCompra}</h1>
          <p className="agregar-orden-subtitle">Corrige precios, agrega o quita productos.</p>
        </div>

        <div className="agregar-orden-card">

          {mensaje && (
            <div className={exito ? 'alert alert-success' : 'alert alert-danger'}>
              {mensaje}
            </div>
          )}

          <form onSubmit={guardarCambios}>

            <div className="row mb-4">
              <div className="col-md-6">
                <label className="form-label">Proveedor:</label>
                <select
                  className="form-select"
                  value={codigoProveedor}
                  onChange={(e) => setCodigoProveedor(Number(e.target.value))}
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
                  value={fechaResep}
                  onChange={(e) => setFechaResep(e.target.value)}
                />
              </div>
            </div>

            <h5>Agregar Producto</h5>
            <div className="row align-items-end mb-3">
              <div className="col-md-3">
                <label className="form-label">Producto:</label>
                <ProductoBuscador
                  productos={productos}
                  seleccionado={codigoProducto}
                  onSeleccionar={(p) => setCodigoProducto(p ? p.codigoProducto : 0)}
                />
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
                    <th>Subtotal</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {carrito.length === 0 ? (
                    <tr><td colSpan={9} className="text-center text-muted">No hay productos seleccionados.</td></tr>
                  ) : (
                    carrito.map((item) => (
                      <tr key={item.codigoDetalle}>
                        <td>{item.nombreProducto}</td>
                        <td>
                          <input
                            type="number"
                            className="form-control form-control-sm"
                            value={item.cantidadPedida || ''}
                            onChange={(e) => actualizarFila(item.codigoDetalle, 'cantidadPedida', Number(e.target.value))}
                            style={{ width: '90px' }}
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            step="0.01"
                            className="form-control form-control-sm"
                            value={item.precioCosto || ''}
                            onChange={(e) => actualizarFila(item.codigoDetalle, 'precioCosto', Number(e.target.value))}
                            style={{ width: '100px' }}
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            className="form-control form-control-sm"
                            value={item.margenMinimoPct || ''}
                            onChange={(e) => actualizarFila(item.codigoDetalle, 'margenMinimoPct', Number(e.target.value))}
                            style={{ width: '80px' }}
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            className="form-control form-control-sm"
                            value={item.metaUtilidadPct || ''}
                            onChange={(e) => actualizarFila(item.codigoDetalle, 'metaUtilidadPct', Number(e.target.value))}
                            style={{ width: '80px' }}
                          />
                        </td>
                        <td><strong>Q{item.precioMinimo}</strong></td>
                        <td><strong>Q{item.precioSugerido}</strong></td>
                        <td>Q{(item.cantidadPedida * item.precioCosto).toFixed(2)}</td>
                        <td className="text-center">
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            title="Quitar producto"
                            onClick={() => quitarDelCarrito(item.codigoDetalle)}
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
              <button
                type="button"
                className="btn btn-outline-secondary btn-lg"
                onClick={() => navigate('/dashboard/ordenes/listar')}
              >
                ✖ Cancelar
              </button>
              <button type="submit" className="btn btn-primary btn-lg"> Guardar Cambios</button>
            </div>

          </form>
        </div>
      </div>
    </div>
  )
}

export default EditarOrdenPage