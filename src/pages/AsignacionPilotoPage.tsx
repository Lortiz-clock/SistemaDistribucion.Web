import { useEffect, useMemo, useState } from 'react'
import { isAxiosError } from 'axios'
import { Link } from 'react-router-dom'
import { ArrowLeft, RefreshCw, Truck, CheckSquare, Square, Trash2 } from 'lucide-react'
import type { PedidoRepartidorConsulta } from '../interfaces/PedidoRepartidorConsulta'
import type { RepartidorConsulta } from '../interfaces/RepartidorConsulta'
import {
  consultarAsignacionPedidos,
  asignarPedidosPiloto,
  quitarAsignacionPedidos
} from '../services/pedidoRepartidorService'
import { consultarRepartidores } from '../services/repartidorServices'

function fechaHoy(): string {
  return new Date().toISOString().split('T')[0]
}

function extraerMensaje(error: unknown, fallback: string): string {
  if (isAxiosError(error)) {
    const data = error.response?.data as { mensaje?: string } | undefined
    if (data?.mensaje) return data.mensaje
  }
  return fallback
}

export default function AsignacionPilotoPage() {
  const [fechaDesde, setFechaDesde] = useState(fechaHoy())
  const [fechaHasta, setFechaHasta] = useState(fechaHoy())
  const [pedidos, setPedidos] = useState<PedidoRepartidorConsulta[]>([])
  const [repartidores, setRepartidores] = useState<RepartidorConsulta[]>([])
  const [pilotoPorVendedor, setPilotoPorVendedor] = useState<Record<number, number>>({})
  const [seleccion, setSeleccion] = useState<Record<number, boolean>>({})
  const [cargando, setCargando] = useState(false)
  const [procesando, setProcesando] = useState(false)
  const [mensaje, setMensaje] = useState('')

  const cargarRepartidores = async () => {
    try {
      const res = await consultarRepartidores()
      if (res.exito && res.datos) {
        setRepartidores(res.datos.filter(r => r.estado))
      }
    } catch {
      // silencioso
    }
  }

  const cargarPedidos = async () => {
    setCargando(true)
    setMensaje('')
    try {
      const res = await consultarAsignacionPedidos(fechaDesde, fechaHasta)
      if (res.exito && res.datos) {
        setPedidos(res.datos)
        setSeleccion({})
        if (res.datos.length === 0) setMensaje('No hay pedidos en el rango seleccionado.')
      } else {
        setPedidos([])
        setMensaje(res.mensaje || 'No fue posible consultar los pedidos.')
      }
    } catch (error) {
      setPedidos([])
      setMensaje(extraerMensaje(error, 'No fue posible consultar los pedidos.'))
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    void cargarRepartidores()
    void cargarPedidos()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const grupos = useMemo(() => {
    const mapa = new Map<number, { codigoEmpleado: number; nombreVendedor: string; pedidos: PedidoRepartidorConsulta[] }>()
    for (const p of pedidos) {
      if (!mapa.has(p.codigoEmpleado)) {
        mapa.set(p.codigoEmpleado, {
          codigoEmpleado: p.codigoEmpleado,
          nombreVendedor: p.nombreVendedor?.trim() || `Vendedor ${p.codigoEmpleado}`,
          pedidos: []
        })
      }
      mapa.get(p.codigoEmpleado)!.pedidos.push(p)
    }
    return Array.from(mapa.values()).sort((a, b) => a.nombreVendedor.localeCompare(b.nombreVendedor))
  }, [pedidos])

  const togglePedido = (codigoPedido: number) => {
    setSeleccion(prev => ({ ...prev, [codigoPedido]: !prev[codigoPedido] }))
  }

  const seleccionarGrupo = (codigos: number[], valor: boolean) => {
    setSeleccion(prev => {
      const next = { ...prev }
      for (const id of codigos) next[id] = valor
      return next
    })
  }

  const asignar = async (pedidosIds: number[], codigoRepartidor: number) => {
    if (!codigoRepartidor) {
      setMensaje('Seleccione un piloto.')
      return
    }
    if (pedidosIds.length === 0) {
      setMensaje('Seleccione al menos un pedido.')
      return
    }
    setProcesando(true)
    setMensaje('')
    try {
      const res = await asignarPedidosPiloto(pedidosIds, codigoRepartidor)
      if (res.exito) {
        setMensaje(res.mensaje || 'Pedidos asignados correctamente.')
        await cargarPedidos()
      } else {
        setMensaje(res.mensaje || 'No fue posible asignar los pedidos.')
      }
    } catch (error) {
      setMensaje(extraerMensaje(error, 'No fue posible asignar los pedidos.'))
    } finally {
      setProcesando(false)
    }
  }

  const quitar = async (pedidosIds: number[]) => {
    if (pedidosIds.length === 0) return
    setProcesando(true)
    setMensaje('')
    try {
      const res = await quitarAsignacionPedidos(pedidosIds)
      if (res.exito) {
        setMensaje(res.mensaje || 'Asignación retirada correctamente.')
        await cargarPedidos()
      } else {
        setMensaje(res.mensaje || 'No fue posible retirar la asignación.')
      }
    } catch (error) {
      setMensaje(extraerMensaje(error, 'No fue posible retirar la asignación.'))
    } finally {
      setProcesando(false)
    }
  }

  return (
    <div className="pagina-lista">
      <div className="pagina-lista-interna">
        <div className="mb-3 d-flex justify-content-between align-items-center flex-wrap gap-2">
          <div>
            <h1 className="mb-1"><Truck size={22} className="me-2" />Asignación a piloto</h1>
            <p className="text-muted mb-0">Agrupa pedidos por vendedor y asígnalos a un piloto (ruta completa o granular).</p>
          </div>
          <div className="d-flex gap-2">
            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => void cargarPedidos()} disabled={cargando || procesando}>
              <RefreshCw size={14} className={cargando ? 'spin' : ''} /> Refrescar
            </button>
            <Link to="/dashboard/pedidos" className="btn btn-outline-secondary btn-sm">
              <ArrowLeft size={14} className="me-1" /> Volver a pedidos
            </Link>
          </div>
        </div>

        {mensaje && (
          <div className="alert alert-info alert-dismissible fade show" role="alert">
            {mensaje}
            <button type="button" className="btn-close" onClick={() => setMensaje('')} />
          </div>
        )}

        <div className="card mb-3">
          <div className="card-body">
            <div className="row g-2 align-items-end">
              <div className="col-sm-4 col-md-3">
                <label className="form-label">Desde</label>
                <input type="date" className="form-control" value={fechaDesde} onChange={(e) => setFechaDesde(e.target.value)} />
              </div>
              <div className="col-sm-4 col-md-3">
                <label className="form-label">Hasta</label>
                <input type="date" className="form-control" value={fechaHasta} onChange={(e) => setFechaHasta(e.target.value)} />
              </div>
              <div className="col-sm-4 col-md-3">
                <button type="button" className="btn btn-primary w-100" onClick={() => void cargarPedidos()} disabled={cargando}>
                  Consultar
                </button>
              </div>
            </div>
          </div>
        </div>

        {cargando ? (
          <div className="text-center text-muted py-4">
            <span className="spinner-border spinner-border-sm me-2" />Cargando pedidos…
          </div>
        ) : grupos.length === 0 ? (
          <div className="text-center text-muted py-4">No hay pedidos para mostrar.</div>
        ) : (
          grupos.map(grupo => {
            const idsGrupo = grupo.pedidos.map(p => p.codigoPedido)
            const idsSeleccionados = idsGrupo.filter(id => seleccion[id])
            const todosSeleccionados = idsGrupo.length > 0 && idsSeleccionados.length === idsGrupo.length
            const pilotoSeleccionado = pilotoPorVendedor[grupo.codigoEmpleado] ?? 0

            return (
              <div className="card mb-3" key={grupo.codigoEmpleado}>
                <div className="card-header bg-light">
                  <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                    <div>
                      <strong>{grupo.nombreVendedor}</strong>
                      <span className="badge bg-primary ms-2">{grupo.pedidos.length} pedidos</span>
                    </div>
                    <div className="d-flex align-items-center gap-2 flex-wrap">
                      <select
                        className="form-select form-select-sm"
                        style={{ minWidth: 220 }}
                        value={pilotoSeleccionado}
                        onChange={(e) => setPilotoPorVendedor(prev => ({ ...prev, [grupo.codigoEmpleado]: Number(e.target.value) }))}
                      >
                        <option value={0}>Seleccione piloto…</option>
                        {repartidores.map(r => (
                          <option key={r.codigoRepartidor} value={r.codigoRepartidor}>
                            {r.nombreEmpleado || `Repartidor ${r.codigoRepartidor}`}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        className="btn btn-sm btn-primary"
                        disabled={procesando || !pilotoSeleccionado}
                        onClick={() => void asignar(idsGrupo, pilotoSeleccionado)}
                        title="Asignar ruta completa"
                      >
                        <Truck size={14} className="me-1" /> Ruta completa
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-primary"
                        disabled={procesando || !pilotoSeleccionado || idsSeleccionados.length === 0}
                        onClick={() => void asignar(idsSeleccionados, pilotoSeleccionado)}
                        title="Asignar seleccionados"
                      >
                        Asignar seleccionados ({idsSeleccionados.length})
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        disabled={procesando || idsSeleccionados.length === 0}
                        onClick={() => void quitar(idsSeleccionados)}
                        title="Quitar asignación"
                      >
                        <Trash2 size={14} className="me-1" /> Quitar
                      </button>
                    </div>
                  </div>
                </div>
                <div className="card-body p-0">
                  <div className="table-responsive">
                    <table className="table table-sm table-hover mb-0 align-middle">
                      <thead className="table-light">
                        <tr>
                          <th style={{ width: 40 }} className="text-center">
                            <button
                              type="button"
                              className="btn btn-sm btn-link p-0"
                              onClick={() => seleccionarGrupo(idsGrupo, !todosSeleccionados)}
                              title="Seleccionar todos"
                            >
                              {todosSeleccionados ? <CheckSquare size={16} /> : <Square size={16} />}
                            </button>
                          </th>
                          <th>Pedido</th>
                          <th>Cliente</th>
                          <th>Fecha</th>
                          <th>Estado</th>
                          <th className="text-end">Total</th>
                          <th>Piloto asignado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {grupo.pedidos.map(p => (
                          <tr key={p.codigoPedido}>
                            <td className="text-center">
                              <input
                                type="checkbox"
                                className="form-check-input"
                                checked={!!seleccion[p.codigoPedido]}
                                onChange={() => togglePedido(p.codigoPedido)}
                              />
                            </td>
                            <td>#{p.codigoPedido}</td>
                            <td>{p.nombreCliente || `Cliente ${p.codigoCliente}`}</td>
                            <td>{String(p.fechaPedido).slice(0, 10)}</td>
                            <td>
                              <span className="badge bg-secondary">{p.nombreEstado || p.codigoEstadoPedido}</span>
                            </td>
                            <td className="text-end">Q {Number(p.totalVenta ?? 0).toFixed(2)}</td>
                            <td>
                              {p.nombreRepartidor ? (
                                <span className="badge bg-success">{p.nombreRepartidor}</span>
                              ) : (
                                <span className="text-muted">Sin asignar</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
