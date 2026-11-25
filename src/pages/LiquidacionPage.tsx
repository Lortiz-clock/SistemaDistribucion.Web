import { useEffect, useMemo, useState } from 'react'
import { crearLiquidacion, despachosPendientesLiquidacion, detalleDespachoLiquidacion } from '../services/operacionesPedidoService'
import type { DespachoPendienteLiquidacion, LiquidacionDespachoDetalle } from '../interfaces/OperacionesPedido'

const q = (n: number) => `Q ${Number(n || 0).toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export default function LiquidacionPage() {
  const [despachos, setDespachos] = useState<DespachoPendienteLiquidacion[]>([])
  const [codigoDespacho, setCodigoDespacho] = useState(0)
  const [detalle, setDetalle] = useState<LiquidacionDespachoDetalle | null>(null)
  const [msg, setMsg] = useState('')
  const [cargando, setCargando] = useState(false)
  const [gastoDesc, setGastoDesc] = useState('')
  const [gastoMonto, setGastoMonto] = useState(0)
  const [gastos, setGastos] = useState<{ descripcion: string; monto: number }[]>([])
  const [res, setRes] = useState<{ codigoLiquidacion: number; totalVenta: number; totalRechazado: number; totalGastos: number; totalLiquidado: number } | null>(null)

  const cargarDespachos = async () => {
    setCargando(true); setMsg('')
    try {
      const r = await despachosPendientesLiquidacion()
      if (r.exito && r.datos) setDespachos(r.datos)
      else { setDespachos([]); setMsg(r.mensaje || 'No se pudieron cargar despachos pendientes.') }
    } catch (e: any) { setMsg(e?.response?.data?.mensaje || e?.message || 'Error al cargar despachos.') }
    finally { setCargando(false) }
  }

  useEffect(() => { void cargarDespachos() }, [])

  const cargarDetalle = async (id: number) => {
    setCodigoDespacho(id); setDetalle(null); setRes(null); setMsg('')
    if (!id) return
    setCargando(true)
    try {
      const r = await detalleDespachoLiquidacion(id)
      if (r.exito && r.datos) setDetalle(r.datos)
      else setMsg(r.mensaje || 'No se pudo cargar el detalle del despacho.')
    } catch (e: any) { setMsg(e?.response?.data?.mensaje || e?.message || 'Error al cargar detalle.') }
    finally { setCargando(false) }
  }

  const pedidosLiquidables = useMemo(() => (detalle?.pedidos || []).filter(p => p.codigoEstadoPedido === 7 && !p.yaLiquidado), [detalle])
  const totalEntregado = useMemo(() => pedidosLiquidables.reduce((a, p) => a + Number(p.totalEntregado || 0), 0), [pedidosLiquidables])
  const totalRechazado = useMemo(() => (detalle?.pedidos || []).reduce((a, p) => a + Number(p.totalRechazado || 0), 0), [detalle])
  const totalGastos = useMemo(() => gastos.reduce((a, g) => a + Number(g.monto || 0), 0), [gastos])
  const totalLiquidar = totalEntregado - totalGastos

  const addGasto = () => {
    const desc = gastoDesc.trim(); const monto = Number(gastoMonto || 0)
    if (!desc || monto <= 0) { setMsg('Ingresa descripci?n y monto de gasto v?lido.'); return }
    setGastos(g => [...g, { descripcion: desc, monto }]); setGastoDesc(''); setGastoMonto(0); setMsg('')
  }

  const liquidar = async () => {
    if (!detalle) return
    if (pedidosLiquidables.length === 0) { setMsg('No hay pedidos entregados pendientes de liquidar en este despacho.'); return }
    setCargando(true); setMsg('')
    try {
      const r = await crearLiquidacion({
        codigoRepartidor: detalle.codigoRepartidor,
        fechaLiquidacion: new Date().toISOString().slice(0, 10),
        pedidos: pedidosLiquidables.map(p => p.codigoPedido),
        gastos
      })
      setMsg(r.mensaje || '')
      if (r.exito && r.datos) { setRes(r.datos); setGastos([]); await cargarDespachos(); await cargarDetalle(detalle.codigoDespacho) }
    } catch (e: any) { setMsg(e?.response?.data?.mensaje || e?.message || 'No se pudo liquidar.') }
    finally { setCargando(false) }
  }

  return <div className="container-fluid">
    <h3>Liquidaci?n / Cuadre de entregas</h3>
    <p className="text-muted">Selecciona una nota de carga/despacho pendiente. Revisa pedidos entregados/rechazados, agrega gastos y liquida para cuadrar efectivo/dep?sitos.</p>
    {msg && <div className="alert alert-info py-2">{msg}</div>}

    <div className="row g-3">
      <div className="col-12 col-xl-4">
        <div className="card h-100"><div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h6 className="mb-0">Despachos pendientes</h6>
            <button className="btn btn-sm btn-outline-secondary" onClick={() => void cargarDespachos()} disabled={cargando}>Refrescar</button>
          </div>
          <select className="form-select mb-3" value={codigoDespacho || ''} onChange={e => void cargarDetalle(Number(e.target.value))}>
            <option value="">Seleccione despacho...</option>
            {despachos.map(d => <option key={d.codigoDespacho} value={d.codigoDespacho}>#{d.codigoDespacho} - {d.nombreRepartidor} - {new Date(d.fechaDespacho).toLocaleDateString()} ({d.estado})</option>)}
          </select>
          <div className="list-group list-group-flush small">
            {despachos.map(d => <button type="button" key={d.codigoDespacho} className={`list-group-item list-group-item-action ${codigoDespacho===d.codigoDespacho?'active':''}`} onClick={() => void cargarDetalle(d.codigoDespacho)}>
              <div className="fw-semibold">Despacho #{d.codigoDespacho} ? {d.nombreRepartidor}</div>
              <div>Entregados: {d.pedidosEntregados} | Rechazados: {d.pedidosRechazados} | Otros: {d.pedidosOtros}</div>
              <div>Entregado: {q(d.totalEntregado)} | Rechazado: {q(d.totalRechazado)}</div>
            </button>)}
            {!despachos.length && !cargando && <div className="text-muted">No hay despachos pendientes de liquidar.</div>}
          </div>
        </div></div>
      </div>

      <div className="col-12 col-xl-8">
        <div className="card mb-3"><div className="card-body">
          <h6>Detalle del despacho</h6>
          {!detalle && <div className="text-muted">Selecciona un despacho para ver pedidos y cuadre.</div>}
          {detalle && <>
            <div className="mb-2 small text-muted">Despacho #{detalle.codigoDespacho} ? {detalle.nombreRepartidor} ? {new Date(detalle.fechaDespacho).toLocaleDateString()} ? {detalle.estadoDespacho}</div>
            <div className="table-responsive"><table className="table table-sm align-middle mb-0">
              <thead className="table-light"><tr><th>Pedido</th><th>Cliente</th><th>Estado</th><th className="text-end">Entregado</th><th className="text-end">Rechazado</th><th>Liquidaci?n</th></tr></thead>
              <tbody>
                {detalle.pedidos.map(p => <tr key={p.codigoPedido}>
                  <td>{p.codigoPedido}</td><td>{p.nombreCliente}</td>
                  <td><span className={`badge ${p.codigoEstadoPedido===7?'text-bg-success':p.codigoEstadoPedido===6?'text-bg-danger':'text-bg-secondary'}`}>{p.nombreEstado}</span></td>
                  <td className="text-end">{q(p.totalEntregado)}</td><td className="text-end">{q(p.totalRechazado)}</td>
                  <td>{p.yaLiquidado ? <span className="badge text-bg-primary">Liquidado</span> : p.codigoEstadoPedido===7 ? <span className="badge text-bg-warning">Pendiente</span> : <span className="text-muted small">No liquida</span>}</td>
                </tr>)}
              </tbody>
            </table></div>
          </>}
        </div></div>

        <div className="card mb-3"><div className="card-body">
          <h6>Gastos / deducciones</h6>
          <div className="row g-2 align-items-end mb-2">
            <div className="col-md-6"><label className="form-label small mb-1">Descripci?n</label><input className="form-control" value={gastoDesc} onChange={e=>setGastoDesc(e.target.value)} placeholder="Pinchazo, marbete, otro" /></div>
            <div className="col-md-3"><label className="form-label small mb-1">Monto</label><input className="form-control" type="number" value={gastoMonto||''} onChange={e=>setGastoMonto(Number(e.target.value))} /></div>
            <div className="col-md-3"><button className="btn btn-outline-primary w-100" onClick={addGasto} disabled={!detalle}>Agregar gasto</button></div>
          </div>
          {!!gastos.length && <div className="table-responsive mb-2"><table className="table table-sm mb-0"><thead><tr><th>Descripci?n</th><th className="text-end">Monto</th><th></th></tr></thead><tbody>{gastos.map((g,i)=><tr key={i}><td>{g.descripcion}</td><td className="text-end">{q(g.monto)}</td><td className="text-end"><button className="btn btn-sm btn-outline-danger" onClick={()=>setGastos(gs=>gs.filter((_,idx)=>idx!==i))}>Quitar</button></td></tr>)}</tbody></table></div>}
          <div className="d-flex flex-wrap gap-3 small">
            <div><span className="text-muted">Entregado a liquidar: </span><strong>{q(totalEntregado)}</strong></div>
            <div><span className="text-muted">Rechazado: </span><strong>{q(totalRechazado)}</strong></div>
            <div><span className="text-muted">Gastos: </span><strong>{q(totalGastos)}</strong></div>
            <div><span className="text-muted">Total a cuadrar: </span><strong className="fs-6">{q(totalLiquidar)}</strong></div>
          </div>
          <div className="mt-3"><button className="btn btn-primary" onClick={()=>void liquidar()} disabled={cargando || !detalle || pedidosLiquidables.length===0}>{cargando?'Procesando...':'Liquidar pedidos entregados del despacho'}</button></div>
        </div></div>

        {res && <div className="alert alert-success">Liquidaci?n #{res.codigoLiquidacion} creada. Venta: {q(res.totalVenta)} | Rechazado: {q(res.totalRechazado)} | Gastos: {q(res.totalGastos)} | <strong>Total liquidado: {q(res.totalLiquidado)}</strong></div>}
      </div>
    </div>
  </div>
}
