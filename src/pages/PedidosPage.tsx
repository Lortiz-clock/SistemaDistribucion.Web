import { useCallback, useEffect, useState } from 'react'
import { MapPin, Plus, RefreshCw, Calendar, Navigation, Edit2, Power } from 'lucide-react'
import { isAxiosError } from 'axios'
import {
  obtenerMisClientesDelDia,
  obtenerResumenVendedor,
  consultarPedidos,
  buscarPedido,
  cambiarEstadoPedido,
  agregarCierre,
} from '../services/pedidosService'
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
  const dia = hoy.getDay() // 0=Dom,1=Lun,...,6=Sab
  const desdeLunes = dia === 0 ? 6 : dia - 1
  const lunes = new Date(hoy)
  lunes.setDate(hoy.getDate() - desdeLunes)
  const sabado = new Date(lunes)
  sabado.setDate(lunes.getDate() + 5)
  const iso = (date: Date) => {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  }
  return { fechaDesde: iso(lunes), fechaHasta: iso(sabado) }
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

  // Selector de productos para agregar línea

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
      if (res.exito && res.datos) { setPedidoSeleccionadoParaEdicion(res.datos); setEditarAbierto(true) }
      else setMensaje(res.mensaje || 'No se pudo cargar el detalle del pedido.')
    } catch (error) { setMensaje(extraerMensaje(error, 'No se pudo cargar el detalle del pedido.')) }
  }

  function cerrarEdicionPedido() {
    setEditarAbierto(false)
    setPedidoSeleccionadoParaEdicion(null)
  }

  // ─── Helpers para líneas ───
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
        <CrearPedidoModal
          codigoCliente={pedidoParaEditar.encabezado.codigoCliente}
          nombreCliente={clientes.find(c => c.codigoCliente === pedidoParaEditar.encabezado.codigoCliente)?.nombreCliente || `Cliente ${pedidoParaEditar.encabezado.codigoCliente}`}
          pedidoExistente={pedidoParaEditar}
          onClose={cerrarEdicionPedido}
          onExito={() => { cerrarEdicionPedido(); if (dia) void cargarDatos(dia) }}
        />
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
                <h5 className="modal-title">Cierre de venta del d?a</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setCierreAbierto(false)} disabled={cerrando} />
              </div>
              <div className="modal-body">
                <p className="mb-2">
                  ?Confirmas el cierre de venta del <strong>{new Date().toISOString().split('T')[0]}</strong>
                  {codigoEmpleado > 0 ? <> (Empleado <strong>{codigoEmpleado}</strong>)</> : ''}?
                </p>
                <div className="alert alert-warning mb-0">
                  <Power size={16} className="me-1" />
                  Al cerrar la venta del d?a, los pedidos pasar?n a <strong>"En preparaci?n"</strong> y no podr?s ingresar m?s pedidos para esta fecha.
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
                  {cerrando ? <><Power size={14} className="spin" /> Cerrando...</> : <><Power size={14} /> Confirmar cierre</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
