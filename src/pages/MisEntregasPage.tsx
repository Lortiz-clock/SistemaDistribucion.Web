import { useEffect, useState } from 'react'
import { Navigation } from 'lucide-react'
import { marcarEntregado, obtenerMiRepartidor, obtenerMisEntregas, registrarRechazo, revertirAEntregado } from '../services/operacionesPedidoService'
import { buscarPedido } from '../services/pedidosService'
import { consultarMotivosNoVisita } from '../services/motivoNoVisitaServices'
import { consultarRepartidores } from '../services/repartidorServices'
import type { PedidoOperacion } from '../interfaces/OperacionesPedido'
import type { PedidoDetalle } from '../interfaces/PedidoConsulta'
import type { MotivoNoVisitaConsulta } from '../interfaces/MotivoNoVisitaConsulta'
import type { RepartidorConsulta } from '../interfaces/RepartidorConsulta'

type ResumenRep = { repartidor: RepartidorConsulta; pendientes: number; entregados: number; rechazados: number; total: number; error?: string }

export default function MisEntregasPage() {
  const [items, setItems] = useState<PedidoOperacion[]>([])
  const [msg, setMsg] = useState('')
  const [codigoRepartidor, setCodigoRepartidor] = useState<number | null>(null)
  const [esAdmin, setEsAdmin] = useState(false)
  const [repartidores, setRepartidores] = useState<ResumenRep[]>([])
  const [cargando, setCargando] = useState(true)
  const [abierto, setAbierto] = useState<number | null>(null)
  const [detalles, setDetalles] = useState<Record<number, PedidoDetalle[]>>({})
  const [cargandoDetalle, setCargandoDetalle] = useState<number | null>(null)
  const [motivos, setMotivos] = useState<MotivoNoVisitaConsulta[]>([])
  const [rechazo, setRechazo] = useState<{ codigoPedido: number; motivoSel: string; otro: string } | null>(null)
  const [procesando, setProcesando] = useState<number | null>(null)

  const cargar = async (codRep?: number | null) => {
    const c = codRep ?? codigoRepartidor
    if (!c) { setItems([]); return }
    setCargando(true)
    try {
      const r = await obtenerMisEntregas(c)
      if (r.exito && r.datos) setItems(r.datos)
      else { setItems([]); setMsg(r.mensaje || 'No se pudieron cargar entregas.') }
    } catch (e: any) { setMsg(e?.response?.data?.mensaje || e?.message || 'Error cargando entregas.') }
    finally { setCargando(false) }
  }

  const cargarRepartidores = async () => {
    setCargando(true)
    try {
      const rr = await consultarRepartidores()
      if (!rr.exito) { setMsg(rr.mensaje || 'No se pudieron cargar repartidores.'); setRepartidores([]); return }
      const reps = (rr.datos || []).filter(r => r.estado)
      const resumen = await Promise.all(reps.map(async rep => {
        try {
          const r = await obtenerMisEntregas(rep.codigoRepartidor)
          if (!r.exito) return { repartidor: rep, pendientes: 0, entregados: 0, rechazados: 0, total: 0, error: r.mensaje }
          const list = r.datos || []
          return { repartidor: rep, pendientes: list.filter(x => x.codigoEstadoPedido === 4).length, entregados: list.filter(x => x.codigoEstadoPedido === 7).length, rechazados: list.filter(x => x.codigoEstadoPedido === 6).length, total: list.length }
        } catch (e: any) { return { repartidor: rep, pendientes: 0, entregados: 0, rechazados: 0, total: 0, error: e?.response?.data?.mensaje || e?.message } }
      }))
      const errores = resumen.map(r => r.error).filter(Boolean)
      if (errores.length) setMsg(`Aviso: ${errores[0]}`)
      setRepartidores(resumen)
    } catch (e: any) { setMsg(e?.response?.data?.mensaje || e?.message || 'No se pudieron cargar repartidores.') }
    finally { setCargando(false) }
  }

  useEffect(() => {
    void (async () => {
      try {
        const [r, m] = await Promise.all([obtenerMiRepartidor(), consultarMotivosNoVisita()])
        if (m.exito && m.datos) setMotivos(m.datos.filter(x => x.estado))
        const mi = r.exito ? (r.datos ?? null) : null
        const rol = (localStorage.getItem('nombreRol') || '').toLowerCase()
        const admin = rol === 'admin' || rol === 'administradores'
        if (mi) { setCodigoRepartidor(mi); await cargar(mi) }
        else if (admin) { setEsAdmin(true); await cargarRepartidores() }
        else setMsg('Tu usuario no tiene repartidor asociado.')
      } catch (e: any) {
        const rol = (localStorage.getItem('nombreRol') || '').toLowerCase()
        const admin = rol === 'admin' || rol === 'administradores'
        setMsg(e?.response?.data?.mensaje || e?.message || 'No se pudo identificar el repartidor.')
        if (admin) { setEsAdmin(true); await cargarRepartidores() }
      }
      finally { setCargando(false) }
    })()
  }, [])

  const verDetalle = async (codigoPedido: number) => {
    if (abierto === codigoPedido) { setAbierto(null); return }
    setAbierto(codigoPedido)
    if (detalles[codigoPedido]) return
    setCargandoDetalle(codigoPedido)
    try {
      const r = await buscarPedido(codigoPedido)
      if (r.exito && r.datos) setDetalles(prev => ({ ...prev, [codigoPedido]: r.datos!.detalle || [] }))
      else setMsg(r.mensaje || 'No se pudo cargar el detalle.')
    } catch (e: any) { setMsg(e?.response?.data?.mensaje || e?.message || 'No se pudo cargar el detalle.') }
    finally { setCargandoDetalle(null) }
  }

  const entregar = async (codigoPedido: number) => {
    setProcesando(codigoPedido); setMsg('')
    try {
      const r = await marcarEntregado(codigoPedido)
      setMsg(r.exito ? `Pedido #${codigoPedido} marcado como entregado.` : (r.mensaje || 'No se pudo marcar entregado.'))
      if (r.exito) await cargar()
    } catch (e: any) { setMsg(e?.response?.data?.mensaje || e?.message || 'No se pudo marcar entregado.') }
    finally { setProcesando(null) }
  }

  const revertir = async (codigoPedido: number) => {
    setProcesando(codigoPedido); setMsg('')
    try {
      const r = await revertirAEntregado(codigoPedido)
      setMsg(r.exito ? `Pedido #${codigoPedido} marcado como entregado.` : (r.mensaje || 'No se pudo cambiar el estado.'))
      if (r.exito) await cargar()
    } catch (e: any) { setMsg(e?.response?.data?.mensaje || e?.message || 'No se pudo cambiar el estado.') }
    finally { setProcesando(null) }
  }

  const abrirRechazo = (codigoPedido: number) => { setRechazo({ codigoPedido, motivoSel: '', otro: '' }); setMsg('') }

  const confirmarRechazo = async () => {
    if (!rechazo) return
    const motivo = rechazo.motivoSel === '__otro__' ? rechazo.otro.trim() : rechazo.motivoSel.trim()
    if (!motivo) { setMsg('Selecciona un motivo de rechazo.'); return }
    setProcesando(rechazo.codigoPedido); setMsg('')
    try {
      const r = await registrarRechazo({ codigoPedido: rechazo.codigoPedido, motivo, esParcial: false, detalles: [] })
      setMsg(r.exito ? `Pedido #${rechazo.codigoPedido} rechazado.` : (r.mensaje || 'No se pudo registrar rechazo.'))
      if (r.exito) { setRechazo(null); await cargar() }
    } catch (e: any) { setMsg(e?.response?.data?.mensaje || e?.message || 'No se pudo registrar rechazo.') }
    finally { setProcesando(null) }
  }

  const pendientes = items.filter(p => p.codigoEstadoPedido === 4)
  const atendidos = items.filter(p => p.codigoEstadoPedido !== 4)
  const total = items.reduce((a, p) => a + Number(p.totalVenta || 0), 0)
  const nombreRepartidor = repartidores.find(x => x.repartidor.codigoRepartidor === codigoRepartidor)?.repartidor.nombreEmpleado

  const verEntregasRep = async (cod: number) => { setCodigoRepartidor(cod); setAbierto(null); setDetalles({}); setMsg(''); await cargar(cod) }
  const volverLista = async () => { setCodigoRepartidor(null); setItems([]); setAbierto(null); setDetalles({}); setMsg(''); await cargarRepartidores() }

  const renderFila = (p: PedidoOperacion) => (<>
    <tr key={p.codigoPedido}>
      <td data-label="Pedido">{p.codigoPedido}</td>
      <td data-label="Cliente">{p.nombreCliente}</td>
      <td data-label="Direccion">{p.direccion}</td>
      <td data-label="Ubicacion">{p.latitud && p.longitud ? <a href={`https://waze.com/ul?ll=${p.latitud},${p.longitud}&navigate=yes`} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-info" title="Navegar con Waze"><Navigation size={14} /></a> : ''}</td>
      <td data-label="Total" className="text-end">Q {Number(p.totalVenta).toFixed(2)}</td>
      <td data-label="Estado"><span className={`badge ${p.codigoEstadoPedido === 4 ? 'text-bg-warning' : p.codigoEstadoPedido === 7 ? 'text-bg-success' : p.codigoEstadoPedido === 6 ? 'text-bg-danger' : 'text-bg-secondary'}`}>{p.nombreEstado}</span></td>
      <td data-label="Detalle"><button className="btn btn-sm btn-outline-primary" onClick={() => void verDetalle(p.codigoPedido)}>{abierto === p.codigoPedido ? 'Ocultar' : 'Ver detalle'}</button></td>
      <td data-label="Accion" className="col-acciones">
        {p.codigoEstadoPedido === 4 && <div className="d-flex gap-1 flex-wrap">
          <button className="btn btn-sm btn-success" disabled={procesando === p.codigoPedido} onClick={() => void entregar(p.codigoPedido)}>{procesando === p.codigoPedido ? '...' : 'Entregado'}</button>
          <button className="btn btn-sm btn-outline-danger" disabled={procesando === p.codigoPedido} onClick={() => abrirRechazo(p.codigoPedido)}>Rechazado</button>
        </div>}
        {p.codigoEstadoPedido === 6 && <div className="d-flex gap-1 flex-wrap">
          <button className="btn btn-sm btn-success" disabled={procesando === p.codigoPedido} onClick={() => void revertir(p.codigoPedido)}>{procesando === p.codigoPedido ? '...' : 'Marcar entregado'}</button>
        </div>}
        {p.codigoEstadoPedido !== 4 && p.codigoEstadoPedido !== 6 && <span className="text-muted small">-</span>}
      </td>
    </tr>
    {abierto === p.codigoPedido && <tr key={`${p.codigoPedido}-det`}><td colSpan={8} className="bg-light" data-label="Detalle pedido">
      <div className="p-2">
        <div className="fw-semibold mb-2">Detalle pedido #{p.codigoPedido}</div>
        {cargandoDetalle === p.codigoPedido ? <div className="text-muted">Cargando detalle...</div> :
          <div className="table-responsive"><table className="table table-sm mb-0 bg-white"><thead><tr><th>Producto</th><th className="text-end">Cantidad</th><th className="text-end">Precio</th><th className="text-end">Subtotal</th></tr></thead><tbody>
            {(detalles[p.codigoPedido] || []).map(d => <tr key={d.codigoPedidoDetalle}><td>{d.nombreProducto || `Producto ${d.codigoProducto}`}</td><td className="text-end">{d.cantidad}</td><td className="text-end">Q {Number(d.precioVenta).toFixed(2)}</td><td className="text-end">Q {(Number(d.cantidad) * Number(d.precioVenta)).toFixed(2)}</td></tr>)}
            {!detalles[p.codigoPedido]?.length && <tr><td colSpan={4} className="text-muted sin-registros">Sin detalle</td></tr>}
          </tbody></table></div>}
      </div>
    </td></tr>}
  </>)

  if (esAdmin && !codigoRepartidor) {
    return <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-2 flex-wrap gap-2">
        <h3 className="mb-0">Entregas por repartidor</h3>
        <button className="btn btn-outline-secondary btn-sm" onClick={() => void cargarRepartidores()} disabled={cargando}>Refrescar</button>
      </div>
      {msg && <div className="alert alert-info py-2">{msg}</div>}
      {cargando ? <div className="text-muted">Cargando...</div> :
      <div className="table-responsive"><table className="table table-sm align-middle"><thead><tr><th>Repartidor</th><th className="text-end">Pendientes</th><th className="text-end">Entregados</th><th className="text-end">Rechazados</th><th className="text-end">Total</th><th></th></tr></thead><tbody>
        {repartidores.map(r => <tr key={r.repartidor.codigoRepartidor}>
          <td data-label="Repartidor">{r.repartidor.nombreEmpleado || `Repartidor ${r.repartidor.codigoRepartidor}`}</td>
          <td data-label="Pendientes" className="text-end"><span className="badge text-bg-warning">{r.pendientes}</span></td>
          <td data-label="Entregados" className="text-end"><span className="badge text-bg-success">{r.entregados}</span></td>
          <td data-label="Rechazados" className="text-end"><span className="badge text-bg-danger">{r.rechazados}</span></td>
          <td data-label="Total" className="text-end">{r.total}</td>
          <td data-label="Accion" className="col-acciones text-end"><div className="d-flex justify-content-end"><button className="btn btn-sm btn-primary" onClick={() => void verEntregasRep(r.repartidor.codigoRepartidor)}>Ver entregas</button></div></td>
        </tr>)}
        {!repartidores.length && <tr><td colSpan={6} className="text-muted sin-registros">No hay repartidores activos.</td></tr>}
      </tbody></table></div>}
    </div>
  }

  return <div className="container-fluid">
    <div className="d-flex justify-content-between align-items-center mb-2 flex-wrap gap-2">
      <div className="d-flex gap-2 align-items-center flex-wrap">
        {esAdmin && <button className="btn btn-outline-secondary btn-sm" onClick={() => void volverLista()}>Volver</button>}
        <h3 className="mb-0">{esAdmin ? `Entregas de ${nombreRepartidor || `repartidor ${codigoRepartidor}`}` : 'Mis entregas'}</h3>
        {codigoRepartidor ? <span className="badge text-bg-secondary">Repartidor {codigoRepartidor}</span> : null}
      </div>
      <div className="d-flex gap-2 align-items-center flex-wrap">
        <span className="badge text-bg-warning">Pendientes {pendientes.length}</span>
        <span className="badge text-bg-success">Entregados {items.filter(x => x.codigoEstadoPedido === 7).length}</span>
        <span className="badge text-bg-danger">Rechazados {items.filter(x => x.codigoEstadoPedido === 6).length}</span>
        <button className="btn btn-outline-secondary btn-sm" onClick={() => void cargar()} disabled={cargando}>Refrescar</button>
        <div className="fw-bold">Total a cobrar: Q {total.toFixed(2)}</div>
      </div>
    </div>
    {msg && <div className="alert alert-info py-2">{msg}</div>}

    {rechazo && <div className="card mb-3 border-danger"><div className="card-body py-3">
      <div className="fw-semibold mb-2">Rechazar pedido #{rechazo.codigoPedido}</div>
      <div className="row g-2 align-items-end">
        <div className="col-md-6">
          <label className="form-label small mb-1">Motivo de no recepcion</label>
          <select className="form-select" value={rechazo.motivoSel} onChange={e => setRechazo(r => r ? { ...r, motivoSel: e.target.value } : r)}>
            <option value="">Seleccione un motivo...</option>
            {motivos.map(m => <option key={m.codigoMotivo} value={m.nombre}>{m.nombre}</option>)}
            <option value="__otro__">Otro motivo</option>
          </select>
        </div>
        {rechazo.motivoSel === '__otro__' && <div className="col-md-6">
          <label className="form-label small mb-1">Especifique el motivo</label>
          <input className="form-control" value={rechazo.otro} onChange={e => setRechazo(r => r ? { ...r, otro: e.target.value } : r)} placeholder="Escriba el motivo" />
        </div>}
        <div className="col-12 d-flex gap-2">
          <button className="btn btn-danger" onClick={() => void confirmarRechazo()} disabled={procesando === rechazo.codigoPedido}>{procesando === rechazo.codigoPedido ? 'Guardando...' : 'Confirmar rechazo'}</button>
          <button className="btn btn-outline-secondary" onClick={() => setRechazo(null)} disabled={procesando === rechazo.codigoPedido}>Cancelar</button>
        </div>
      </div>
      <div className="text-muted small mt-2">Rechazo total: libera reserva antes de liquidar y queda en historial para reportes.</div>
    </div></div>}

    <div className="card mb-3"><div className="card-header fw-semibold">Pendientes de entregar</div>
      <div className="table-responsive"><table className="table table-sm align-middle mb-0">
        <thead><tr><th>Pedido</th><th>Cliente</th><th>Direccion</th><th>Ubicacion</th><th className="text-end">Total</th><th>Estado</th><th>Detalle</th><th>Accion</th></tr></thead>
        <tbody>
          {pendientes.map(renderFila)}
          {!pendientes.length && !cargando && <tr><td colSpan={8} className="text-muted sin-registros">No hay pedidos pendientes.</td></tr>}
        </tbody>
      </table></div>
    </div>

    <div className="card"><div className="card-header fw-semibold">Entregados y rechazados</div>
      <div className="table-responsive"><table className="table table-sm align-middle mb-0">
        <thead><tr><th>Pedido</th><th>Cliente</th><th>Direccion</th><th>Ubicacion</th><th className="text-end">Total</th><th>Estado</th><th>Detalle</th><th>Accion</th></tr></thead>
        <tbody>
          {atendidos.map(renderFila)}
          {!atendidos.length && !cargando && <tr><td colSpan={8} className="text-muted sin-registros">No hay pedidos entregados o rechazados.</td></tr>}
        </tbody>
      </table></div>
    </div>
  </div>
}


