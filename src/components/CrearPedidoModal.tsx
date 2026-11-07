import { useEffect, useMemo, useState } from 'react'
import { Search, Trash2, Plus, AlertCircle, CheckCircle2 } from 'lucide-react'
import { isAxiosError } from 'axios'
import { obtenerProductosConStock, agregarPedido } from '../services/pedidosService'
import type { PedidoAgregarRespuesta } from '../interfaces/PedidoAgregar'
import type { ProductoConStock } from '../interfaces/ProductoConStock'

interface Linea {
  producto: ProductoConStock    // ← era ProductoStock
  cantidad: number
  precioVenta: number
}

interface Props {
  codigoCliente: number
  nombreCliente: string
  onClose: () => void
  onExito: () => void
}

function formatearQ(n: number): string {
  return new Intl.NumberFormat('es-GT', {
    style: 'currency', currency: 'GTQ', maximumFractionDigits: 2,
  }).format(n)
}

function colorPrecio(precio: number, sugerido: number, minimo: number): string {
  if (precio >= sugerido) return '#22c55e'
  if (precio >= minimo) return '#eab308'
  return '#ef4444'
}

function textoPrecio(precio: number, sugerido: number, minimo: number): string {
  if (precio >= sugerido) return 'Buen precio'
  if (precio >= minimo) return 'Por debajo del sugerido'
  return 'El servidor rechazará este precio'
}

export function CrearPedidoModal({ codigoCliente, nombreCliente, onClose, onExito }: Props) {
  const [productos, setProductos] = useState<ProductoConStock[]>([])
  const [cargando, setCargando] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [lineas, setLineas] = useState<Linea[]>([])
  const [observaciones, setObservaciones] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resultado, setResultado] = useState<PedidoAgregarRespuesta | null>(null)

  useEffect(() => {
    void cargarProductos()
  }, [])

  async function cargarProductos() {
    setCargando(true)
    try {
      const res = await obtenerProductosConStock()
      if (res.exito && res.datos) setProductos(res.datos)
      else setError(res.mensaje)
    } catch (err) {
      setError(
        isAxiosError(err) && err.response?.data?.mensaje
          ? err.response.data.mensaje
          : 'No se pudieron cargar los productos.'
      )
    } finally {
      setCargando(false)
    }
  }

  const productosFiltrados = useMemo(() => {
    if (!busqueda.trim()) return productos
    const q = busqueda.toLowerCase()
    return productos.filter((p) => p.nombre.toLowerCase().includes(q))
  }, [productos, busqueda])

  const productosDisponibles = useMemo(() => {
    const enCarrito = new Set(lineas.map((l) => l.producto.codigoProducto))
    return productosFiltrados.filter((p) => !enCarrito.has(p.codigoProducto))
  }, [productosFiltrados, lineas])

  function agregarLinea(producto: ProductoConStock) {
    setLineas((prev) => [
      ...prev,
      { producto, cantidad: 1, precioVenta: producto.precioSugerido },
    ])
    setBusqueda('')
  }

  function actualizarLinea(index: number, cambios: Partial<Linea>) {
    setLineas((prev) =>
      prev.map((l, i) => (i === index ? { ...l, ...cambios } : l))
    )
  }

  function quitarLinea(index: number) {
    setLineas((prev) => prev.filter((_, i) => i !== index))
  }

  const total = lineas.reduce((sum, l) => sum + l.cantidad * l.precioVenta, 0)

  async function guardar() {
    setError(null)

    if (lineas.length === 0) {
      setError('Agrega al menos un producto al pedido.')
      return
    }

    for (const l of lineas) {
      if (l.cantidad <= 0) {
        setError(`La cantidad de "${l.producto.nombre}" debe ser mayor a 0.`)
        return
      }
      if (l.cantidad > l.producto.existenciaDisponible) {
        setError(`"${l.producto.nombre}" solo tiene ${l.producto.existenciaDisponible} disponibles.`)
        return
      }
      if (l.precioVenta <= 0) {
        setError(`El precio de "${l.producto.nombre}" debe ser mayor a 0.`)
        return
      }
    }

    setGuardando(true)
    try {
      const res = await agregarPedido({
        codigoCliente,
        observaciones: observaciones.trim() || undefined,
        lineas: lineas.map((l) => ({
          codigoProducto: l.producto.codigoProducto,
          cantidad: l.cantidad,
          precioVenta: l.precioVenta,
        })),
      })

      if (!res.exito || !res.datos) {
        setError(res.mensaje)
        return
      }

      setResultado(res.datos)

      if (res.datos.faltantes.length === 0) {
        setTimeout(() => onExito(), 1500)
      }
    } catch (err) {
      setError(
        isAxiosError(err) && err.response?.data?.mensaje
          ? err.response.data.mensaje
          : 'No se pudo guardar el pedido. Revisa tu conexión.'
      )
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="modal d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
      <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              Crear pedido — <span className="text-primary">{nombreCliente}</span>
            </h5>
            <button type="button" className="btn-close" onClick={onClose} disabled={guardando} />
          </div>

          <div className="modal-body">
            {resultado && (
              <div className="alert alert-success d-flex align-items-center gap-2">
                <CheckCircle2 size={20} />
                <div>
                  Pedido #{resultado.codigoPedido} creado correctamente.
                  {resultado.faltantes.length > 0
                    ? ' Algunos productos no tienen stock suficiente (ver abajo).'
                    : ' Cerrando…'}
                </div>
              </div>
            )}

            {resultado && resultado.faltantes.length > 0 && (
              <div className="alert alert-warning">
                <div className="d-flex align-items-center gap-2 mb-2">
                  <AlertCircle size={18} />
                  <strong>Faltantes de stock</strong>
                </div>
                <ul className="mb-0 ps-3">
                  {resultado.faltantes.map((f) => (
                    <li key={f.codigoProducto}>
                      {f.nombre}: faltan <strong>{f.faltante}</strong> unidades
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {error && <div className="alert alert-danger">{error}</div>}

            {!resultado && (
              <>
                <label className="form-label fw-semibold">Buscar producto</label>
                <div className="input-group mb-2">
                  <span className="input-group-text"><Search size={16} /></span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Escribe el nombre del producto…"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    disabled={cargando}
                  />
                </div>

                {cargando ? (
                  <div className="text-center text-muted py-3">
                    <span className="spinner-border spinner-border-sm me-2" />
                    Cargando productos…
                  </div>
                ) : (
                  <div className="border rounded mb-3" style={{ maxHeight: 200, overflowY: 'auto' }}>
                    {productosDisponibles.length === 0 ? (
                      <div className="text-center text-muted py-3 small">
                        {busqueda ? 'No se encontraron productos con ese nombre.' : 'Todos los productos ya están en el pedido.'}
                      </div>
                    ) : (
                      <ul className="list-group list-group-flush">
                        {productosDisponibles.slice(0, 20).map((p) => (
                          <li key={p.codigoProducto} className="list-group-item d-flex align-items-center justify-content-between">
                            <div>
                              <div className="fw-semibold">{p.nombre}</div>
                              <small className="text-muted">
                                Stock: {p.existenciaDisponible} · Sugerido: {formatearQ(p.precioSugerido)}
                              </small>
                            </div>
                            <button className="btn btn-sm btn-outline-primary" onClick={() => agregarLinea(p)}>
                              <Plus size={14} className="me-1" />
                              Agregar
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}

                <label className="form-label fw-semibold">
                  Líneas del pedido ({lineas.length})
                </label>
                {lineas.length === 0 ? (
                  <div className="text-center text-muted py-3 border rounded small">
                    No hay productos en el pedido. Agrega uno desde el buscador.
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-sm align-middle">
                      <thead>
                        <tr>
                          <th>Producto</th>
                          <th style={{ width: 80 }}>Cant.</th>
                          <th style={{ width: 150 }}>Precio</th>
                          <th style={{ width: 100 }}>Subtotal</th>
                          <th style={{ width: 40 }} />
                        </tr>
                      </thead>
                      <tbody>
                        {lineas.map((l, i) => {
                          const color = colorPrecio(l.precioVenta, l.producto.precioSugerido, l.producto.precioMinimo)
                          const texto = textoPrecio(l.precioVenta, l.producto.precioSugerido, l.producto.precioMinimo)
                          const cruzaLotes = l.cantidad > l.producto.stockPrimerLote
                          return (
                            <tr key={l.producto.codigoProducto}>
                              <td>
                                <div className="fw-semibold small">{l.producto.nombre}</div>
                                <small className="text-muted">
                                  Disp: {l.producto.existenciaDisponible} · Sug: {formatearQ(l.producto.precioSugerido)}
                                </small>
                                {cruzaLotes && (
                                  <small className="text-warning d-block">⚠ Cruza varios lotes</small>
                                )}
                              </td>
                              <td>
                                <input
                                  type="number"
                                  className="form-control form-control-sm"
                                  style={{ width: 60 }}
                                  min={1}
                                  max={l.producto.existenciaDisponible}
                                  value={l.cantidad}
                                  onChange={(e) => actualizarLinea(i, { cantidad: parseInt(e.target.value) || 0 })}
                                />
                              </td>
                              <td>
                                <div className="d-flex align-items-center gap-1">
                                  <input
                                    type="number"
                                    step="0.01"
                                    className="form-control form-control-sm"
                                    style={{ width: 80 }}
                                    min={0}
                                    value={l.precioVenta}
                                    onChange={(e) => actualizarLinea(i, { precioVenta: parseFloat(e.target.value) || 0 })}
                                  />
                                  <div
                                    className="rounded-circle flex-shrink-0"
                                    style={{ width: 14, height: 14, backgroundColor: color, boxShadow: `0 0 6px ${color}80` }}
                                    title={texto}
                                  />
                                </div>
                                <small className="text-muted">{texto}</small>
                              </td>
                              <td className="fw-semibold">{formatearQ(l.cantidad * l.precioVenta)}</td>
                              <td>
                                <button className="btn btn-sm btn-outline-danger p-1" onClick={() => quitarLinea(i)}>
                                  <Trash2 size={14} />
                                </button>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                <div className="mb-3">
                  <label className="form-label small fw-semibold">Observaciones (opcional)</label>
                  <textarea
                    className="form-control"
                    rows={2}
                    maxLength={500}
                    value={observaciones}
                    onChange={(e) => setObservaciones(e.target.value)}
                    placeholder="Notas internas para este pedido…"
                  />
                </div>

                <div className="d-flex justify-content-between align-items-center border-top pt-2">
                  <span className="fw-semibold">Total del pedido</span>
                  <span className="h5 mb-0 fw-bold text-primary">{formatearQ(total)}</span>
                </div>
              </>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-outline-secondary" onClick={onClose} disabled={guardando}>
              {resultado ? 'Cerrar' : 'Cancelar'}
            </button>
            {!resultado && (
              <button
                type="button"
                className="btn btn-primary"
                onClick={guardar}
                disabled={guardando || lineas.length === 0}
              >
                {guardando ? (
                  <><span className="spinner-border spinner-border-sm me-1" />Guardando…</>
                ) : (
                  'Guardar pedido'
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}