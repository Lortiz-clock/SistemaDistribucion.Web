import { useCallback, useEffect, useState } from 'react'
import { MapPin, Plus, RefreshCw, Calendar, Navigation, Edit2, Save, Power, Trash2, PlusCircle, X } from 'lucide-react'
import { isAxiosError } from 'axios'
import {
  obtenerMisClientesDelDia,
  obtenerResumenVendedor,
  consultarPedidos,
  buscarPedido,
  editarPedido,
  cambiarEstadoPedido,
  agregarCierre,
  obtenerProductosConStock,
} from '../services/pedidosService'
import type { ProductoConStock } from '../interfaces/ProductoConStock'
import type { ClienteRutaPlan } from '../interfaces/ClienteRutaPlan'
import type { ResumenVendedor } from '../interfaces/ResumenVendedor'
import type { PedidoBuscar } from '../interfaces/PedidoBuscar'
import type { PedidoConsulta } from '../interfaces/PedidoConsulta'
import { CrearPedidoModal } from '../components/CrearPedidoModal'
import { NoVisitaModal } from '../components/NoVisitaModal'
import { BateriasVenta } from '../components/BateriasVenta'

const DIAS = [
  { v: 1, n: 'Lunes' },
  { v: 2, n: 'Martes' },
  { v: 3, n: 'Miércoles' },
  { v: 4, n: 'Jueves' },
  { v: 5, n: 'Viernes' },
  { v: 6, n: 'Sábado' },
]

function diaDeHoy(): number {
  return new Date().getDay()
}

function urlWaze(lat: number, lng: number): string {
  return `https://www.waze.com/ul?ll=${lat},${lng}&navigate=yes`
}

function rangoSemanaActual(): { fechaDesde: string; fechaHasta: string } {
  const hoy = new Date()
  const desdeMiercoles = (hoy.getDay() - 3 + 7) % 7
  const miercoles = new Date(hoy)
  miercoles.setDate(hoy.getDate() - desdeMiercoles)
  const martes = new Date(miercoles)
  martes.setDate(miercoles.getDate() + 6)
  const iso = (date: Date) => date.toISOString().split('T')[0]
  return { fechaDesde: iso(miercoles), fechaHasta: iso(martes) }
}

function extraerMensaje(error: unknown, fallback: string): string {
  if (isAxiosError(error) && error.response?.data?.mensaje) {
    return error.response.data.mensaje
  }
  return fallback
}

// Extrae codigoEmpleado del token JWT (payload)
function obtenerCodigoEmpleado(): number {
  const token = localStorage.getItem('token')
  if (!token) return 0
  try {
    const payload = token.split('.')[1]
    const decoded = JSON.parse(atob(payload))
    // El backend ahora incluye 'codigoEmpleado' y 'codigoUsuario' en el token
    return decoded.codigoEmpleado ?? decoded.codigo_empleado ?? decoded.sub ?? 0
  } catch {
    return 0
  }
}

export default function PedidosPage() {
  const codigoEmpleado = obtenerCodigoEmpleado()

  const [dia, setDia] = useState<number | null>(null)
  const [metaModalOpen, setMetaModalOpen] = useState(false)
  const [mostrarSelectorDia, setMostrarSelectorDia] = useState(true)
  const [clientes, setClientes] = useState<ClienteRutaPlan[]>([])
  const [cargando, setCargando] = useState(false)
  const [mensaje, setMensaje] = useState('')

  // Pedidos del día (para editar)
  const [pedidosDelDia, setPedidosDelDia] = useState<PedidoConsulta[]>([])

  // Pedido seleccionado para editar (desde el listado del día)
  const [pedidoParaEditar, setPedidoSeleccionadoParaEdicion] = useState<PedidoBuscar | null>(
    null
  )

  // Edición de pedido - líneas
  const [editarAbierto, setEditarAbierto] = useState(false)
  const [editando, setEditando] = useState(false)
  const [lineasEditando, setLineasEditando] = useState<Array<{
    codigoProducto: number
    nombreProducto: string
    cantidad: number
    precioVenta: number
    esFaltante: boolean
    codigoPedidoDetalle?: number // undefined = nueva línea
  }>>([])
  const [observacionesEditando, setObservacionesEditando] = useState('')

  // Selector de productos para agregar línea
  const [mostrarSelectorProducto, setMostrarSelectorProducto] = useState(false)
  const [productosDisponibles, setProductosDisponibles] = useState<ProductoConStock[]>([])
  const [busquedaProducto, setBusquedaProducto] = useState('')
  const [cargandoProductos, setCargandoProductos] = useState(false)

  // Cambio de estado
  const [cambioEstadoAbierto, setCambioEstadoAbierto] = useState(false)
  const [estadoNuevo, setEstadoNuevo] = useState<number | null>(null)
  const [motivoEstado, setMotivoEstado] = useState<number | null>(null)
  const [cambiandoEstado, setCambiandoEstado] = useState(false)

  // Cierre de venta
  const [cierreAbierto, setCierreAbierto] = useState(false)
  const [cerrando, setCerrando] = useState(false)

  // Modales existentes
  const [modalAbierto, setModalAbierto] = useState(false)
  const [clienteSeleccionado, setClienteSeleccionado] = useState<ClienteRutaPlan | null>(null)
  const [resumen, setResumen] = useState<ResumenVendedor | null>(null)
  const [modalNoVisitaAbierto, setModalNoVisitaAbierto] = useState(false)
  const [clienteNoVisita, setClienteNoVisita] = useState<ClienteRutaPlan | null>(null)

  const cargarDatos = useCallback(async (diaSemana: number) => {
    setCargando(true)
    setMensaje('')

    const { fechaDesde, fechaHasta } = rangoSemanaActual()

    try {
      const resResumen = await obtenerResumenVendedor(fechaDesde, fechaHasta)
      if (resResumen.exito && resResumen.datos) {
        setResumen(resResumen.datos)
      }

      const resClientes = await obtenerMisClientesDelDia(diaSemana)

      if (resClientes.exito && resClientes.datos) {
        setClientes(resClientes.datos)
        setMensaje(
          resClientes.datos.length === 0
            ? `No tienes clientes asignados para ${DIAS.find((d) => d.v === diaSemana)?.n}.`
            : resClientes.mensaje
        )
      } else {
        setClientes([])
        setMensaje(resClientes.mensaje)
      }

      // Cargar pedidos del día del empleado para saber quién ya tiene pedido
      const resPedidos = await consultarPedidos(fechaDesde, fechaHasta, codigoEmpleado)
      if (resPedidos.exito && resPedidos.datos) {
        setPedidosDelDia(resPedidos.datos)
      } else {
        setPedidosDelDia([])
      }
    } catch (error) {
      setMensaje(extraerMensaje(error, 'No se pudieron cargar los datos. Revisa tu conexión.'))
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => {
    const hoy = diaDeHoy()
    if (hoy >= 1 && hoy <= 6) {
      setDia(hoy)
      setMostrarSelectorDia(false)
      void cargarDatos(hoy)
    } else {
      setMostrarSelectorDia(true)
    }
  }, [cargarDatos])

  function seleccionarDia(diaSemana: number) {
    setDia(diaSemana)
    setMostrarSelectorDia(false)
    void cargarDatos(diaSemana)
  }

  function abrirCrearPedido(cliente: ClienteRutaPlan) {
    setClienteSeleccionado(cliente)
    setModalAbierto(true)
  }

  function cerrarCrearPedido() {
    setModalAbierto(false)
    setClienteSeleccionado(null)
  }

  function onPedidoCreado() {
    cerrarCrearPedido()
    if (dia) void cargarDatos(dia)
    setMensaje('Pedido creado correctamente.')
  }

  function abrirNoVisita(cliente: ClienteRutaPlan) {
    setClienteNoVisita(cliente)
    setModalNoVisitaAbierto(true)
  }

  function cerrarNoVisita() {
    setModalNoVisitaAbierto(false)
    setClienteNoVisita(null)
  }

  function onNoVisitaRegistrada() {
    cerrarNoVisita()
    if (dia) void cargarDatos(dia)
    setMensaje('No visita registrada correctamente.')
  }

  // ─── Edición de pedido (desde el listado del día) ───
  async function abrirEdicionPedido(codigoPedido: number) {
    try {
      const res = await buscarPedido(codigoPedido)
      if (res.exito && res.datos) {
        setPedidoSeleccionadoParaEdicion(res.datos)
        // Obtener productos para nombres y selector
        const productosRes = await obtenerProductosConStock()
        const mapaProductos = new Map<number, string>()
        if (productosRes.exito && productosRes.datos) {
          productosRes.datos.forEach(p => mapaProductos.set(p.codigoProducto, p.nombre))
          setProductosDisponibles(productosRes.datos)
        }
        // Mapear líneas del backend al estado de edición
        const lineasIniciales = res.datos.detalle.map(d => ({
          codigoProducto: d.codigoProducto,
          nombreProducto: mapaProductos.get(d.codigoProducto) || `Producto ${d.codigoProducto}`,
          cantidad: d.cantidadEntregada ?? d.cantidad,
          precioVenta: d.precioVenta,
          esFaltante: d.esFaltante,
          codigoPedidoDetalle: d.codigoPedidoDetalle,
        }))
        setLineasEditando(lineasIniciales)
        setObservacionesEditando(res.datos.encabezado.observaciones ?? '')
        setEditarAbierto(true)
      } else {
        setMensaje(res.mensaje || 'No se pudo cargar el detalle del pedido.')
      }
    } catch (error) {
      setMensaje(extraerMensaje(error, 'No se pudo cargar el detalle del pedido.'))
    }
  }

  function cerrarEdicionPedido() {
    setEditarAbierto(false)
    setPedidoSeleccionadoParaEdicion(null)
    setLineasEditando([])
    setObservacionesEditando('')
    setMostrarSelectorProducto(false)
    setBusquedaProducto('')
  }

  // ─── Helpers para líneas ───
  function calcularTotalLineas(): number {
    return lineasEditando.reduce((sum, l) => sum + l.cantidad * l.precioVenta, 0)
  }

  function actualizarLinea(index: number, campo: 'cantidad' | 'precioVenta', valor: number) {
    setLineasEditando(prev => prev.map((l, i) => i === index ? { ...l, [campo]: Math.max(0, valor) } : l))
  }

  function eliminarLinea(index: number) {
    setLineasEditando(prev => prev.filter((_, i) => i !== index))
  }

  function abrirSelectorProducto() {
    setBusquedaProducto('')
    setMostrarSelectorProducto(true)
    // Si no hay productos cargados, cargarlos
    if (productosDisponibles.length === 0) {
      cargarProductosParaSelector()
    }
  }

  async function cargarProductosParaSelector() {
    setCargandoProductos(true)
    try {
      const res = await obtenerProductosConStock()
      if (res.exito && res.datos) {
        setProductosDisponibles(res.datos)
      }
    } catch {
      // silencioso
    } finally {
      setCargandoProductos(false)
    }
  }

  function agregarLineaDesdeSelector(producto: ProductoConStock) {
    // Verificar si ya existe
    const existe = lineasEditando.some(l => l.codigoProducto === producto.codigoProducto)
    if (existe) {
      setMensaje('Ese producto ya está en el pedido.')
      return
    }
    setLineasEditando(prev => [...prev, {
      codigoProducto: producto.codigoProducto,
      nombreProducto: producto.nombre,
      cantidad: 1,
      precioVenta: producto.precioSugerido,
      esFaltante: false,
    }])
    setMostrarSelectorProducto(false)
    setBusquedaProducto('')
  }

  async function guardarEdicionPedido() {
    if (!pedidoParaEditar) return
    if (lineasEditando.length === 0) {
      setMensaje('El pedido debe tener al menos un producto.')
      return
    }
    setEditando(true)
    try {
      const lineasParaEnviar = lineasEditando.map(l => ({
        codigoProducto: l.codigoProducto,
        cantidad: l.cantidad,
        precioVenta: l.precioVenta,
      }))
      const res = await editarPedido({
        codigoPedido: pedidoParaEditar.encabezado.codigoPedido,
        observaciones: observacionesEditando.trim() || undefined,
        lineas: lineasParaEnviar,
      })
      if (res.exito) {
        setMensaje('Pedido editado correctamente.')
        cerrarEdicionPedido()
        if (dia) void cargarDatos(dia)
      } else {
        setMensaje(res.mensaje || 'No se pudo editar el pedido.')
      }
    } catch (error) {
      setMensaje(extraerMensaje(error, 'No se pudo editar el pedido.'))
    } finally {
      setEditando(false)
    }
  }

  // ─── Cambiar estado ───
  function abrirCambioEstado(pedido: PedidoBuscar) {
    setPedidoSeleccionadoParaEdicion(pedido)
    setCambioEstadoAbierto(true)
  }

  function cerrarCambioEstado() {
    setCambioEstadoAbierto(false)
    setEstadoNuevo(null)
    setMotivoEstado(null)
  }

  async function guardarCambioEstado() {
    if (!pedidoParaEditar) return
    const estadoNum = Number(estadoNuevo)
    if (!Number.isFinite(estadoNum) || isNaN(estadoNum)) return
    setCambiandoEstado(true)
    try {
      const res = await cambiarEstadoPedido({
        codigoPedido: pedidoParaEditar.encabezado.codigoPedido,
        codigoEstadoNuevo: estadoNum,
        codigoMotivo: motivoEstado ?? undefined,
      })
      if (res.exito) {
        setMensaje('Estado del pedido actualizado.')
        cerrarCambioEstado()
        if (dia) void cargarDatos(dia)
      } else {
        setMensaje(res.mensaje || 'No se pudo cambiar el estado.')
      }
    } catch (error) {
      setMensaje(extraerMensaje(error, 'No se pudo cambiar el estado.'))
    } finally {
      setCambiandoEstado(false)
    }
  }

  // ─── Cierre de venta / día ───
  async function guardarCierre() {
    setCerrando(true)
    const fechaVenta = new Date().toISOString().split('T')[0]
    try {
      const res = await agregarCierre({ codigoEmpleado, fechaVenta })
      if (res.exito) {
        setMensaje('Cierre de venta registrado correctamente.')
        setCierreAbierto(false)
        if (dia) void cargarDatos(dia)
      } else {
        setMensaje(res.mensaje || 'No se pudo registrar el cierre.')
      }
    } catch (error) {
      setMensaje(extraerMensaje(error, 'No se pudo registrar el cierre.'))
    } finally {
      setCerrando(false)
    }
  }

  const nombreDia = DIAS.find((d) => d.v === dia)?.n ?? ''
  const clientesConIndice = clientes.map((c, indiceRuta) => ({ c, indiceRuta }))
  const pendientes = clientesConIndice.filter((x) => !x.c.visitado)
  const atendidos = clientesConIndice.filter((x) => x.c.visitado)

  return (
    <div className="pedidos-page pagina-lista">
      <div className="pagina-lista-interna">
        {/* Encabezado */}
        <div className="mb-3 d-flex justify-content-between align-items-center">
          <div>
            <h1>Pedidos</h1>
            {dia && (
              <p className="d-flex align-items-center gap-1">
                <Calendar size={14} />
                Día de ruta: <strong className="mx-1">{nombreDia}</strong>
                <button
                  className="btn btn-sm btn-link p-0 ms-1"
                  onClick={() => setMostrarSelectorDia(true)}
                >
                  (cambiar)
                </button>
              </p>
            )}
          </div>
          <div className="d-flex align-items-center gap-2">
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary"
              onClick={() => dia && cargarDatos(dia)}
              disabled={cargando}
              title="Refrescar"
            >
              <RefreshCw size={14} className={cargando ? 'spin' : ''} />
            </button>
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary"
              onClick={() => setMetaModalOpen(true)}
              title="Meta"
            >
              Meta
            </button>
            {pedidoParaEditar && (
              <>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-warning"
                  onClick={() => abrirCambioEstado(pedidoParaEditar)}
                  disabled={cambiandoEstado}
                  title="Cambiar estado"
                >
                  Estado
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => abrirEdicionPedido(pedidoParaEditar.encabezado.codigoPedido)}
                  disabled={editando}
                  title="Editar pedido"
                >
                  <Edit2 size={14} />
                </button>
              </>
            )}
            <button
              type="button"
              className="btn btn-sm btn-danger"
              onClick={() => setCierreAbierto(true)}
              disabled={cerrando}
              title="Cierre de venta"
            >
              {cerrando ? <Power size={14} className="spin" /> : <Power size={14} />}
              Cierre
            </button>
          </div>
        </div>

        {mensaje && (
          <div className="alert alert-info alert-dismissible fade show" role="alert">
            {mensaje}
            <button type="button" className="btn-close" onClick={() => setMensaje('')} />
          </div>
        )}

        {/* Pedido seleccionado para editar */}
        {pedidoParaEditar && (
          <div className="card mb-3">
            <div className="card-header bg-light">
              <h6 className="mb-0">
                Pedido #{pedidoParaEditar.encabezado.codigoPedido}
                <span className="badge bg-secondary ms-2">
                  Estado: {pedidoParaEditar.encabezado.codigoEstadoPedido}
                </span>
              </h6>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-sm-6">
                  <p className="mb-1"><strong>Cliente:</strong> {pedidoParaEditar.encabezado.codigoCliente}</p>
                  <p className="mb-1"><strong>Fecha pedido:</strong> {pedidoParaEditar.encabezado.fechaPedido}</p>
                </div>
                <div className="col-sm-6">
                  <p className="mb-1"><strong>Observaciones:</strong> {pedidoParaEditar.encabezado.observaciones || '—'}</p>
                  <p className="mb-1"><strong>Motivo:</strong> {pedidoParaEditar.encabezado.codigoMotivo || '—'}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- FILA PRINCIPAL: CLIENTES --- */}
        <div className="row g-3">
          <div className="col-12">
            <div className="tarjeta-lista">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h2 className="h5 m-0">
                  Clientes del {nombreDia}{' '}
                  <span className="badge bg-primary">{clientes.length}</span>
                </h2>
              </div>

              {cargando ? (
                <div className="text-center text-muted py-4">
                  <span className="spinner-border spinner-border-sm me-2" />
                  Cargando clientes…
                </div>
              ) : clientes.length === 0 ? (
                <div className="text-center text-muted py-4">
                  No hay clientes asignados para este día.
                  <br />
                  <small>El administrador puede asignarlos desde el planificador de rutas.</small>
                </div>
              ) : (
                <>
                  {pendientes.length === 0 ? (
                    <div className="text-center text-muted py-3 mb-3">
                      No hay clientes pendientes por atender.
                    </div>
                  ) : (
                    <ul className="list-group mb-3">
                      {pendientes.filter(({ c }) => {
                        const p = c.codigoPedido ? pedidosDelDia.find(x => x.codigoPedido === c.codigoPedido) : null
                        return !(p && p.codigoCierre !== null)
                      }).map(({ c, indiceRuta }) => (
                        <li
                          key={c.codigoClienteRuta}
                          className="list-group-item d-flex align-items-center gap-2"
                        >
                          <span className="badge rounded-pill bg-dark">{indiceRuta + 1}</span>
                          <div className="flex-grow-1" style={{ minWidth: 0 }}>
                            <div className="fw-semibold">{c.nombreCliente}</div>
                            <small className="d-flex align-items-center gap-1" style={{ color: '#94a3b8' }}>
                              <MapPin size={12} className="flex-shrink-0" />
                              <span>{c.direccion || 'Sin dirección'}</span>
                            </small>
                          </div>

                          {c.latitud != null && c.longitud != null && (
                            <a
                              href={urlWaze(c.latitud, c.longitud)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-sm btn-outline-info"
                              title="Navegar con Waze"
                            >
                              <Navigation size={14} />
                            </a>
                          )}

                          <button
                            className="btn btn-sm btn-outline-warning"
                            onClick={() => abrirNoVisita(c)}
                            title="Registrar no visita"
                            disabled={cargando}
                          >
                            No visita
                          </button>

                          {c.codigoPedido != null && c.codigoPedido > 0 ? (
                            <>
                              {(() => {
                                const codigoPedido = c.codigoPedido
                                const p = pedidosDelDia.find((x) => x.codigoPedido === codigoPedido)
                                const estaCerrado = p ? p.codigoCierre !== null : false
                                if (estaCerrado) {
                                  return (
                                    <button
                                      type="button"
                                      className="btn btn-sm btn-outline-secondary"
                                      disabled
                                      title="Venta finalizada"
                                    >
                                      Venta finalizada
                                    </button>
                                  )
                                }
                                return (
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-outline-secondary"
                                    onClick={() => abrirEdicionPedido(codigoPedido)}
                                    title="Editar productos del pedido"
                                  >
                                    <Edit2 size={14} className="me-1" />
                                    Editar productos
                                  </button>
                                )
                              })()}
                            </>
                          ) : (
                            <button
                              type="button"
                              className="btn btn-sm btn-success"
                              onClick={() => abrirCrearPedido(c)}
                              disabled={cargando}
                            >
                              <Plus size={14} className="me-1" />
                              Nuevo pedido
                            </button>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}

                  {atendidos.length > 0 && (
                    <>
                      <div className="d-flex justify-content-between align-items-center mb-2 mt-2">
                        <h3 className="h6 m-0">
                          Atendidos <span className="badge bg-success">{atendidos.length}</span>
                        </h3>
                      </div>
                      <ul className="list-group">
                        {atendidos.filter(({ c }) => {
                          const p = c.codigoPedido ? pedidosDelDia.find(x => x.codigoPedido === c.codigoPedido) : null
                          return !(p && p.codigoCierre !== null)
                        }).map(({ c, indiceRuta }) => (
                          <li
                            key={c.codigoClienteRuta}
                            className="list-group-item d-flex align-items-center gap-2"
                          >
                            <span className="badge rounded-pill bg-success">{indiceRuta + 1}</span>
                            <div className="flex-grow-1" style={{ minWidth: 0 }}>
                              <div className="fw-semibold">
                                {c.nombreCliente}
                                <span className="badge bg-success ms-1">Visitado</span>
                              </div>
                              <small className="d-flex align-items-center gap-1" style={{ color: '#94a3b8' }}>
                                <MapPin size={12} className="flex-shrink-0" />
                                <span>{c.direccion || 'Sin dirección'}</span>
                              </small>
                            </div>

                            {c.latitud != null && c.longitud != null && (
                              <a
                                href={urlWaze(c.latitud, c.longitud)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-sm btn-outline-info"
                                title="Navegar con Waze"
                              >
                                <Navigation size={14} />
                              </a>
                            )}

                            {c.codigoPedido != null && c.codigoPedido > 0 ? (
                              <>
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-secondary"
                                  onClick={() => abrirEdicionPedido(c.codigoPedido!)}
                                  title="Editar productos del pedido"
                                >
                                  <Edit2 size={14} className="me-1" />
                                  Editar productos
                                </button>
                              </>
                            ) : (
                              <button
                                type="button"
                                className="btn btn-sm btn-success"
                                onClick={() => abrirCrearPedido(c)}
                                disabled={cargando}
                              >
                                <Plus size={14} className="me-1" />
                                Nuevo pedido
                              </button>
                            )}
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Selector de día */}
      {mostrarSelectorDia && (
        <div className="modal d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">¿Qué día vas a visitar?</h5>
              </div>
              <div className="modal-body">
                <p className="text-muted small">
                  Selecciona el día de ruta para ver tus clientes asignados.
                </p>
                <div className="d-grid gap-2">
                  {DIAS.map((d) => (
                    <button
                      key={d.v}
                      className={`btn ${dia === d.v ? 'btn-primary' : 'btn-outline-primary'}`}
                      onClick={() => seleccionarDia(d.v)}
                    >
                      {d.n}
                      {diaDeHoy() === d.v && (
                        <span className="badge bg-success ms-2">hoy</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modales existentes */}
      {modalAbierto && clienteSeleccionado && (
        <CrearPedidoModal
          codigoCliente={clienteSeleccionado.codigoCliente}
          nombreCliente={clienteSeleccionado.nombreCliente}
          onClose={cerrarCrearPedido}
          onExito={onPedidoCreado}
        />
      )}

      {modalNoVisitaAbierto && clienteNoVisita && (
        <NoVisitaModal
          codigoCliente={clienteNoVisita.codigoCliente}
          nombreCliente={clienteNoVisita.nombreCliente}
          onClose={cerrarNoVisita}
          onExito={onNoVisitaRegistrada}
        />
      )}

      {/* Modal: Meta de utilidad */}
      {metaModalOpen && (
        <div className="modal d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Meta de utilidad</h5>
                <button type="button" className="btn-close" onClick={() => setMetaModalOpen(false)} />
              </div>
              <div className="modal-body">
                <BateriasVenta datos={resumen} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Editar pedido */}
      {editarAbierto && pedidoParaEditar && (
        <div className="modal d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1060 }}>
          <div className="modal-dialog modal-xl modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Editar pedido #{pedidoParaEditar.encabezado.codigoPedido}</h5>
                <button type="button" className="btn-close" onClick={cerrarEdicionPedido} disabled={editando} />
              </div>
              <div className="modal-body">
                {/* Observaciones */}
                <div className="mb-3">
                  <label className="form-label fw-semibold">Observaciones</label>
                  <textarea
                    className="form-control"
                    rows={2}
                    maxLength={500}
                    value={observacionesEditando}
                    onChange={(e) => setObservacionesEditando(e.target.value)}
                    disabled={editando}
                    placeholder="Notas internas del pedido…"
                  />
                </div>

                {/* Tabla de líneas */}
                <div className="table-responsive">
                  <table className="table table-sm table-bordered align-middle mb-3">
                    <thead className="table-light">
                      <tr>
                        <th style={{ width: '40%' }}>Producto</th>
                        <th style={{ width: '15%' }}>Cantidad</th>
                        <th style={{ width: '20%' }}>Precio unitario</th>
                        <th style={{ width: '15%' }}>Subtotal</th>
                        <th style={{ width: '10%' }} className="text-center">Estado</th>
                        <th style={{ width: '5%' }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {lineasEditando.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center text-muted py-4">
                            No hay productos en el pedido. Haz clic en "Agregar producto" para añadir líneas.
                          </td>
                        </tr>
                      ) : (
                        lineasEditando.map((linea, index) => (
                          <tr key={index}>
                            <td>
                              <strong>{linea.nombreProducto}</strong>
                              <br />
                              <small className="text-muted">Código: {linea.codigoProducto}</small>
                            </td>
                            <td>
                              <input
                                type="number"
                                className="form-control form-control-sm"
                                value={linea.cantidad}
                                onChange={(e) => actualizarLinea(index, 'cantidad', parseInt(e.target.value) || 0)}
                                min="1"
                                disabled={editando}
                                style={{ width: '80px' }}
                              />
                            </td>
                            <td>
                              <input
                                type="number"
                                className="form-control form-control-sm"
                                value={linea.precioVenta.toFixed(2)}
                                onChange={(e) => actualizarLinea(index, 'precioVenta', parseFloat(e.target.value) || 0)}
                                min="0.01"
                                step="0.01"
                                disabled={editando}
                                style={{ width: '120px' }}
                              />
                            </td>
                            <td className="fw-semibold">
                              Q {(linea.cantidad * linea.precioVenta).toFixed(2)}
                            </td>
                            <td className="text-center">
                              {linea.esFaltante ? (
                                <span className="badge bg-warning text-dark">Faltante</span>
                              ) : (
                                <span className="badge bg-success">OK</span>
                              )}
                            </td>
                            <td className="text-center">
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => eliminarLinea(index)}
                                disabled={editando}
                                title="Eliminar línea"
                              >
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                    <tfoot>
                      <tr className="table-light">
                        <td colSpan={3} className="text-end fw-bold">Total:</td>
                        <td className="fw-bold fs-5">Q {calcularTotalLineas().toFixed(2)}</td>
                        <td colSpan={2}></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* Botón agregar producto */}
                <div className="mb-3 text-end">
                  <button
                    type="button"
                    className="btn btn-outline-primary btn-sm"
                    onClick={abrirSelectorProducto}
                    disabled={editando || lineasEditando.length >= 20}
                  >
                    <PlusCircle size={14} className="me-1" /> Agregar producto
                  </button>
                </div>

                {/* Selector de productos (dropdown) */}
                {mostrarSelectorProducto && (
                  <div className="card card-body mb-3" style={{ maxHeight: '300px', overflow: 'auto' }}>
                    <div className="mb-2">
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="Buscar producto..."
                        value={busquedaProducto}
                        onChange={(e) => setBusquedaProducto(e.target.value)}
                        autoFocus
                      />
                    </div>
                    {cargandoProductos ? (
                      <div className="text-center text-muted py-3">
                        <div className="spinner-border spinner-border-sm me-2" /> Cargando productos…
                      </div>
                    ) : (
                      <ul className="list-group list-group-flush">
                        {productosDisponibles
                          .filter(p =>
                            p.nombre.toLowerCase().includes(busquedaProducto.toLowerCase()) ||
                            p.codigoProducto.toString().includes(busquedaProducto)
                          )
                          .filter(p => !lineasEditando.some(l => l.codigoProducto === p.codigoProducto))
                          .slice(0, 50)
                          .map(producto => (
                            <li
                              key={producto.codigoProducto}
                              className="list-group-item d-flex justify-content-between align-items-center px-0"
                              onClick={() => agregarLineaDesdeSelector(producto)}
                              style={{ cursor: 'pointer' }}
                            >
                              <div>
                                <strong>{producto.nombre}</strong>
                                <br />
                                <small className="text-muted">
                                  Código: {producto.codigoProducto} | Stock: {producto.existenciaDisponible} | Precio sugerido: Q {producto.precioSugerido.toFixed(2)}
                                </small>
                              </div>
                              <Plus size={16} className="text-primary" />
                            </li>
                          ))}
                        {productosDisponibles.length === 0 && !cargandoProductos && (
                          <li className="list-group-item text-center text-muted px-0">No hay productos con stock disponible</li>
                        )}
                      </ul>
                    )}
                    <div className="text-end mt-2">
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => setMostrarSelectorProducto(false)}
                      >
                        <X size={14} className="me-1" /> Cerrar
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline-secondary" onClick={cerrarEdicionPedido} disabled={editando}>
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={guardarEdicionPedido}
                  disabled={editando || lineasEditando.length === 0}
                >
                  {editando ? <><Save size={14} className="spin" /> Guardando…</> : <><Save size={14} /> Guardar cambios</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Cambiar estado */}
      {cambioEstadoAbierto && pedidoParaEditar && (
        <div className="modal d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Cambiar estado del pedido #{pedidoParaEditar.encabezado.codigoPedido}</h5>
                <button type="button" className="btn-close" onClick={cerrarCambioEstado} disabled={cambiandoEstado} />
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label fw-semibold">Nuevo estado (código numérico)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={estadoNuevo ?? ''}
                    onChange={(e) => setEstadoNuevo(e.target.value ? parseInt(e.target.value, 10) : null)}
                    disabled={cambiandoEstado}
                    placeholder="Ej: 2 = en preparación"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Código de motivo (opcional)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={motivoEstado ?? ''}
                    onChange={(e) => setMotivoEstado(e.target.value ? parseInt(e.target.value, 10) : null)}
                    disabled={cambiandoEstado}
                    placeholder="Código de motivo…"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline-secondary" onClick={cerrarCambioEstado} disabled={cambiandoEstado}>
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn btn-warning"
                  onClick={guardarCambioEstado}
                  disabled={cambiandoEstado || estadoNuevo === null}
                >
                  {cambiandoEstado ? 'Actualizando…' : 'Cambiar estado'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Cierre de venta */}
      {cierreAbierto && (
        <div className="modal d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header bg-danger text-white">
                <h5 className="modal-title">Cierre de venta / día</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setCierreAbierto(false)} disabled={cerrando} />
              </div>
              <div className="modal-body">
                <p>
                  Esto registrará el cierre de venta para el empleado <strong>{codigoEmpleado}</strong>
                  con fecha <strong>{new Date().toISOString().split('T')[0]}</strong>.
                </p>
                <div className="alert alert-warning">
                  <Power size={16} />{' '}
                  Esta acción cambiará el estado de los pedidos a "en preparación" y cerrará la venta del día.
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline-secondary" onClick={() => setCierreAbierto(false)} disabled={cerrando}>
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={guardarCierre}
                  disabled={cerrando || !codigoEmpleado}
                >
                  {cerrando ? <><Power size={14} className="spin" /> Cerrando…</> : <><Power size={14} /> Confirmar cierre</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
