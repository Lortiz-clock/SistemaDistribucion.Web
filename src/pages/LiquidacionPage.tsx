import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { crearLiquidacion, despachosPendientesLiquidacion, detalleDespachoLiquidacion } from '../services/operacionesPedidoService'
import type { DespachoPendienteLiquidacion, LiquidacionDespachoDetalle } from '../interfaces/OperacionesPedido'

const q = (n: number) => `Q ${Number(n || 0).toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
const DENOMS: { denominacion: number; tipo: 'BILLETE' | 'MONEDA'; label: string }[] = [
  { denominacion: 100, tipo: 'BILLETE', label: 'Q100' }, { denominacion: 50, tipo: 'BILLETE', label: 'Q50' }, { denominacion: 20, tipo: 'BILLETE', label: 'Q20' },
  { denominacion: 10, tipo: 'BILLETE', label: 'Q10' }, { denominacion: 5, tipo: 'BILLETE', label: 'Q5' },
  { denominacion: 1, tipo: 'MONEDA', label: 'Q1' }, { denominacion: 0.5, tipo: 'MONEDA', label: 'Q0.50' }, { denominacion: 0.25, tipo: 'MONEDA', label: 'Q0.25' }, { denominacion: 0.1, tipo: 'MONEDA', label: 'Q0.10' }, { denominacion: 0.05, tipo: 'MONEDA', label: 'Q0.05' },
]
const BILLETES = DENOMS.filter(d => d.tipo === 'BILLETE')
const MONEDAS = DENOMS.filter(d => d.tipo === 'MONEDA')
type Deposito = { banco: string; numeroBoleta: string; monto: number }
type Gasto = { descripcion: string; monto: number }
type Draft = { efectivo: Record<string, number>; depositos: Deposito[]; gastos: Gasto[]; secciones: { billetes: boolean; monedas: boolean; depositos: boolean; gastos: boolean } }
const draftKey = (id: number) => `liq-draft-${id}`
const draftVacio = (): Draft => ({ efectivo: {}, depositos: [], gastos: [], secciones: { billetes: true, monedas: false, depositos: false, gastos: false } })
const cargarDraft = (id: number): Draft => { try { const raw = localStorage.getItem(draftKey(id)); if (!raw) return draftVacio(); const d = JSON.parse(raw); return { ...draftVacio(), ...d, secciones: { ...draftVacio().secciones, ...(d.secciones || {}) } } } catch { return draftVacio() } }

export default function LiquidacionPage() {
  const nav = useNavigate()
  const [despachos, setDespachos] = useState<DespachoPendienteLiquidacion[]>([])
  const [codigoDespacho, setCodigoDespacho] = useState(0)
  const [detalle, setDetalle] = useState<LiquidacionDespachoDetalle | null>(null)
  const [msg, setMsg] = useState('')
  const [cargando, setCargando] = useState(false)
  const [efectivo, setEfectivo] = useState<Record<string, number>>({})
  const [depositos, setDepositos] = useState<Deposito[]>([])
  const [gastos, setGastos] = useState<Gasto[]>([])
  const [secciones, setSecciones] = useState<Draft['secciones']>(draftVacio().secciones)
  const [depBanco, setDepBanco] = useState(''); const [depBoleta, setDepBoleta] = useState(''); const [depMonto, setDepMonto] = useState(0)
  const [gastoDesc, setGastoDesc] = useState(''); const [gastoMonto, setGastoMonto] = useState(0)
  const [res, setRes] = useState<{ codigoLiquidacion: number; totalVenta: number; totalRechazado: number; totalGastos: number; totalLiquidado: number } | null>(null)

  useEffect(() => { if (!codigoDespacho) return; localStorage.setItem(draftKey(codigoDespacho), JSON.stringify({ efectivo, depositos, gastos, secciones })) }, [codigoDespacho, efectivo, depositos, gastos, secciones])

  const cargarDespachos = async () => { setCargando(true); setMsg(''); try { const r = await despachosPendientesLiquidacion(); if (r.exito && r.datos) setDespachos(r.datos); else { setDespachos([]); setMsg(r.mensaje || 'No se pudieron cargar despachos pendientes.') } } catch (e: any) { setMsg(e?.response?.data?.mensaje || e?.message || 'Error al cargar despachos.') } finally { setCargando(false) } }
  useEffect(() => { void cargarDespachos() }, [])

  const cargarDetalle = async (id: number) => {
    setCodigoDespacho(id); setDetalle(null); setRes(null); setMsg('')
    const d = cargarDraft(id); setEfectivo(d.efectivo); setDepositos(d.depositos); setGastos(d.gastos); setSecciones(d.secciones)
    if (!id) return
    setCargando(true)
    try { const r = await detalleDespachoLiquidacion(id); if (r.exito && r.datos) setDetalle(r.datos); else setMsg(r.mensaje || 'No se pudo cargar el detalle del despacho.') }
    catch (e: any) { setMsg(e?.response?.data?.mensaje || e?.message || 'Error al cargar detalle.') }
    finally { setCargando(false) }
  }

  const pedidosLiquidables = useMemo(() => (detalle?.pedidos || []).filter(p => (p.codigoEstadoPedido === 7 || p.codigoEstadoPedido === 6) && !p.yaLiquidado), [detalle])
  const totalNotaCarga = detalle?.totalNotaCarga || 0
  const totalEntregado = useMemo(() => (detalle?.pedidos || []).reduce((a, p) => a + Number(p.totalEntregado || 0), 0), [detalle])
  const totalRechazado = useMemo(() => (detalle?.pedidos || []).reduce((a, p) => a + Number(p.totalRechazado || 0), 0), [detalle])
  const totalGastos = useMemo(() => gastos.reduce((a, g) => a + Number(g.monto || 0), 0), [gastos])
  const totalEfectivo = useMemo(() => DENOMS.reduce((a, d) => a + d.denominacion * Number(efectivo[`${d.tipo}-${d.denominacion}`] || 0), 0), [efectivo])
  const totalDepositos = useMemo(() => depositos.reduce((a, d) => a + Number(d.monto || 0), 0), [depositos])
  const totalRecibido = totalEfectivo + totalDepositos
  const totalLiquidar = totalEntregado - totalGastos
  const diferencia = totalRecibido - totalLiquidar

  const toggleSeccion = (k: keyof Draft['secciones']) => setSecciones(s => ({ ...s, [k]: !s[k] }))
  const setCant = (tipo: string, denom: number, cant: number) => setEfectivo(prev => ({ ...prev, [`${tipo}-${denom}`]: Math.max(0, cant) }))
  const addDeposito = () => { const banco = depBanco.trim(); const numeroBoleta = depBoleta.trim(); const monto = Number(depMonto || 0); if (!banco || !numeroBoleta || monto <= 0) { setMsg('Completa banco, n?mero de boleta y monto.'); return } setDepositos(d => [...d, { banco, numeroBoleta, monto }]); setDepBanco(''); setDepBoleta(''); setDepMonto(0); setMsg('') }
  const addGasto = () => { const desc = gastoDesc.trim(); const monto = Number(gastoMonto || 0); if (!desc || monto <= 0) { setMsg('Ingresa descripci?n y monto de gasto v?lido.'); return } setGastos(g => [...g, { descripcion: desc, monto }]); setGastoDesc(''); setGastoMonto(0); setMsg('') }

  const liquidar = async () => {
    if (!detalle) return
    if (pedidosLiquidables.length === 0) { setMsg('No hay pedidos entregados/rechazados pendientes de liquidar en este despacho.'); return }
    if (Math.abs(diferencia) > 0.01) { setMsg(`El cuadre no coincide. Diferencia: ${q(diferencia)}. Ajusta efectivo, dep?sitos o gastos.`); return }
    setCargando(true); setMsg('')
    try {
      const r = await crearLiquidacion({
        codigoRepartidor: detalle.codigoRepartidor, codigoDespacho: detalle.codigoDespacho, fechaLiquidacion: new Date().toISOString().slice(0, 10),
        pedidos: pedidosLiquidables.map(p => p.codigoPedido), gastos,
        efectivo: DENOMS.map(d => ({ denominacion: d.denominacion, tipo: d.tipo, cantidad: Number(efectivo[`${d.tipo}-${d.denominacion}`] || 0) })).filter(e => e.cantidad > 0),
        depositos
      })
      setMsg(r.mensaje || '')
      if (r.exito && r.datos) { setRes(r.datos); localStorage.removeItem(draftKey(detalle.codigoDespacho)); setGastos([]); setEfectivo({}); setDepositos([]); setSecciones(draftVacio().secciones); await cargarDespachos(); await cargarDetalle(detalle.codigoDespacho) }
    } catch (e: any) { setMsg(e?.response?.data?.mensaje || e?.message || 'No se pudo liquidar.') }
    finally { setCargando(false) }
  }

  const SeccionBtn = ({ k, label, total }: { k: keyof Draft['secciones']; label: string; total?: number }) => (
    <label className={`btn btn-sm ${secciones[k] ? 'btn-primary' : 'btn-outline-secondary'} mb-0`}>
      <input type="checkbox" className="me-1" checked={secciones[k]} onChange={() => toggleSeccion(k)} />{label}{total !== undefined && secciones[k] ? ` ${q(total)}` : ''}
    </label>
  )

  const [denomEdit, setDenomEdit] = useState<Record<string, boolean>>({})
  const denomKey = (tipo: string, denom: number) => `${tipo}-${denom}`
  const toggleDenom = (tipo: string, denom: number) => {
    const k = denomKey(tipo, denom)
    const activa = Number(efectivo[k] || 0) > 0
    if (activa) { setDenomEdit(p => ({ ...p, [k]: !p[k] })); return }
    setEfectivo(p => ({ ...p, [k]: 1 })); setDenomEdit(p => ({ ...p, [k]: true }))
  }

  const SelectorDenoms = ({ items }: { items: typeof DENOMS }) => {
    const editando = items.filter(d => denomEdit[denomKey(d.tipo, d.denominacion)])
    return <div className="mt-2">
      <div className="d-flex flex-wrap gap-2">
        {items.map(d => {
          const k = denomKey(d.tipo, d.denominacion); const cant = Number(efectivo[k] || 0); const activa = cant > 0; const abierta = !!denomEdit[k]
          return <label key={k} className={`btn btn-sm ${abierta ? 'btn-success' : activa ? 'btn-outline-success' : 'btn-outline-secondary'} mb-0`}>
            <input type="checkbox" className="me-1" checked={abierta || activa} onChange={() => toggleDenom(d.tipo, d.denominacion)} />{d.label}{activa ? ` (${cant})` : ''}
          </label>
        })}
      </div>
      {!!editando.length && <div className="table-responsive mt-2"><table className="table table-sm align-middle mb-0"><thead><tr><th>Denominaci?n</th><th style={{ width: 110 }}>Cantidad</th><th className="text-end">Subtotal</th><th></th></tr></thead><tbody>
        {editando.map(d => { const k = denomKey(d.tipo, d.denominacion); const cant = Number(efectivo[k] || 0); return <tr key={k}><td>{d.label}</td><td><input className="form-control form-control-sm" type="number" min={1} value={cant || ''} onChange={e => setCant(d.tipo, d.denominacion, Math.max(1, Number(e.target.value || 0)))} /></td><td className="text-end">{q(d.denominacion * cant)}</td><td className="text-end"><button className="btn btn-sm btn-outline-secondary" onClick={() => setDenomEdit(p => ({ ...p, [k]: false }))}>Guardar</button></td></tr> })}
      </tbody></table></div>}
    </div>
  }

  return <div className="container-fluid">
    <div className="d-flex justify-content-between align-items-center mb-2">
      <h3 className="mb-0">Liquidaci?n / Cuadre de entregas</h3>
      <button className="btn btn-outline-primary btn-sm" onClick={() => nav('/dashboard/liquidacion/historial')}>Liquidaciones</button>
    </div>
    {msg && <div className="alert alert-info py-2">{msg}</div>}

    <div className="row g-3">
      <div className="col-12 col-xl-4">
        <div className="card" style={{ maxHeight: 'calc(100vh - 170px)' }}><div className="card-body d-flex flex-column" style={{ minHeight: 0 }}>
          <div className="d-flex justify-content-between align-items-center mb-2"><h6 className="mb-0">Notas de carga pendientes</h6><button className="btn btn-sm btn-outline-secondary" onClick={() => void cargarDespachos()} disabled={cargando}>Refrescar</button></div>
          <select className="form-select mb-2" value={codigoDespacho || ''} onChange={e => void cargarDetalle(Number(e.target.value))}>
            <option value="">Seleccione nota de carga...</option>
            {despachos.map(d => <option key={d.codigoDespacho} value={d.codigoDespacho}>#{d.codigoDespacho} - {d.nombreRepartidor}</option>)}
          </select>
          <div className="list-group list-group-flush small mb-2" style={{ maxHeight: detalle ? 170 : '50vh', overflowY: 'auto' }}>
            {despachos.map(d => <button type="button" key={d.codigoDespacho} className={`list-group-item list-group-item-action ${codigoDespacho===d.codigoDespacho?'active':''}`} onClick={() => void cargarDetalle(d.codigoDespacho)}>
              <div className="fw-semibold">Nota #{d.codigoDespacho} ? {d.nombreRepartidor}</div>
              <div>Total nota: {q(d.totalNotaCarga)} | Entregado: {q(d.totalEntregado)}</div>
            </button>)}
            {!despachos.length && !cargando && <div className="text-muted">No hay notas de carga pendientes.</div>}
          </div>

          {detalle && <>
            <div className="border-top pt-2 mb-2">
              <div className="d-flex justify-content-between align-items-center"><h6 className="mb-0">Pedidos nota #{detalle.codigoDespacho}</h6><span className="small text-muted">{q(totalNotaCarga)}</span></div>
              <div className="small text-muted">{detalle.nombreRepartidor}</div>
            </div>
            <div style={{ flex: 1, minHeight: 0, maxHeight: 260, overflowY: 'auto' }}>
              <table className="table table-sm align-middle mb-0"><thead className="table-light" style={{ position: 'sticky', top: 0, zIndex: 1 }}><tr><th>Pedido</th><th>Cliente</th><th>Estado</th><th className="text-end">Ent.</th></tr></thead>
                <tbody>{detalle.pedidos.map(p => <tr key={p.codigoPedido}><td>{p.codigoPedido}</td><td>{p.nombreCliente}</td><td><span className={`badge ${p.codigoEstadoPedido===7?'text-bg-success':p.codigoEstadoPedido===6?'text-bg-danger':p.codigoEstadoPedido===5?'text-bg-primary':'text-bg-secondary'}`}>{p.nombreEstado}</span></td><td className="text-end">{q(p.totalEntregado)}</td></tr>)}</tbody>
              </table>
            </div>
          </>}
        </div></div>
      </div>

      <div className="col-12 col-xl-8">
        {!detalle && <div className="card mb-3"><div className="card-body text-muted">Selecciona una nota de carga para iniciar el cuadre.</div></div>}

        <div className="card mb-3"><div className="card-body">
          <h6 className="mb-2">Cuadre de recibido</h6>
          <div className="d-flex flex-wrap gap-2 mb-2">
            <SeccionBtn k="billetes" label="Billetes" total={BILLETES.reduce((a,d)=>a+d.denominacion*Number(efectivo[`${d.tipo}-${d.denominacion}`]||0),0)} />
            <SeccionBtn k="monedas" label="Monedas" total={MONEDAS.reduce((a,d)=>a+d.denominacion*Number(efectivo[`${d.tipo}-${d.denominacion}`]||0),0)} />
            <SeccionBtn k="depositos" label="Dep?sitos" total={totalDepositos} />
            <SeccionBtn k="gastos" label="Gastos" total={totalGastos} />
          </div>
          <div className="small text-muted mb-2">Los datos se guardan en cach? por nota de carga hasta liquidar.</div>

          {secciones.billetes && <div className="border rounded p-2 mb-2"><div className="fw-semibold small">Billetes - selecciona denominaci?n</div><SelectorDenoms items={BILLETES} /></div>}
          {secciones.monedas && <div className="border rounded p-2 mb-2"><div className="fw-semibold small">Monedas - selecciona denominaci?n</div><SelectorDenoms items={MONEDAS} /></div>}

          {secciones.depositos && <div className="border rounded p-2 mb-2">
            <div className="fw-semibold small mb-2">Boleta de dep?sito</div>
            <div className="row g-2 align-items-end mb-2">
              <div className="col-md-4"><label className="form-label small mb-1">Banco</label><input className="form-control form-control-sm" value={depBanco} onChange={e=>setDepBanco(e.target.value)} /></div>
              <div className="col-md-4"><label className="form-label small mb-1">No. boleta</label><input className="form-control form-control-sm" value={depBoleta} onChange={e=>setDepBoleta(e.target.value)} /></div>
              <div className="col-md-2"><label className="form-label small mb-1">Monto</label><input className="form-control form-control-sm" type="number" value={depMonto||''} onChange={e=>setDepMonto(Number(e.target.value))} /></div>
              <div className="col-md-2"><button className="btn btn-sm btn-outline-primary w-100" onClick={addDeposito} disabled={!detalle}>Agregar</button></div>
            </div>
            {!!depositos.length && <table className="table table-sm mb-0"><thead><tr><th>Banco</th><th>Boleta</th><th className="text-end">Monto</th><th></th></tr></thead><tbody>{depositos.map((d,i)=><tr key={i}><td>{d.banco}</td><td>{d.numeroBoleta}</td><td className="text-end">{q(d.monto)}</td><td className="text-end"><button className="btn btn-sm btn-outline-danger" onClick={()=>setDepositos(ds=>ds.filter((_,idx)=>idx!==i))}>Quitar</button></td></tr>)}</tbody></table>}
          </div>}

          {secciones.gastos && <div className="mt-2">
            <div className="fw-semibold small mb-1">Otros gastos</div>
            <div className="row g-2 align-items-end mb-2">
              <div className="col-md-7"><input className="form-control form-control-sm" placeholder="Descripci?n (marbete, pinchazo...)" value={gastoDesc} onChange={e=>setGastoDesc(e.target.value)} /></div>
              <div className="col-md-3"><input className="form-control form-control-sm" type="number" placeholder="Monto" value={gastoMonto||''} onChange={e=>setGastoMonto(Number(e.target.value))} /></div>
              <div className="col-md-2"><button className="btn btn-sm btn-outline-primary w-100" onClick={addGasto} disabled={!detalle}>Agregar</button></div>
            </div>
            {!!gastos.length && <table className="table table-sm mb-0"><tbody>{gastos.map((g,i)=><tr key={i}><td>{g.descripcion}</td><td className="text-end">{q(g.monto)}</td><td className="text-end"><button className="btn btn-sm btn-outline-danger" onClick={()=>setGastos(gs=>gs.filter((_,idx)=>idx!==i))}>Quitar</button></td></tr>)}</tbody></table>}
          </div>}
        </div></div>

        <div className="card mb-3"><div className="card-body">
          <h6>Resumen de cuadre</h6>
          <div className="row g-2 small">
            <div className="col-6 col-md-3"><div className="text-muted">Total nota</div><strong>{q(totalNotaCarga)}</strong></div>
            <div className="col-6 col-md-3"><div className="text-muted">Entregado</div><strong>{q(totalEntregado)}</strong></div>
            <div className="col-6 col-md-3"><div className="text-muted">Rechazado</div><strong>{q(totalRechazado)}</strong></div>
            <div className="col-6 col-md-3"><div className="text-muted">Gastos</div><strong>{q(totalGastos)}</strong></div>
            <div className="col-6 col-md-3"><div className="text-muted">A liquidar</div><strong className="fs-6">{q(totalLiquidar)}</strong></div>
            <div className="col-6 col-md-3"><div className="text-muted">Efectivo</div><strong>{q(totalEfectivo)}</strong></div>
            <div className="col-6 col-md-3"><div className="text-muted">Dep?sitos</div><strong>{q(totalDepositos)}</strong></div>
            <div className="col-6 col-md-3"><div className="text-muted">Recibido</div><strong>{q(totalRecibido)}</strong></div>
          </div>
          <div className={`mt-2 fw-semibold ${Math.abs(diferencia) < 0.01 ? 'text-success' : 'text-danger'}`}>Diferencia: {q(diferencia)} {Math.abs(diferencia) < 0.01 ? '(cuadrado)' : '(debe ser Q 0.00)'}</div>
          <div className="mt-3"><button className="btn btn-primary" onClick={()=>void liquidar()} disabled={cargando || !detalle || pedidosLiquidables.length===0}>{cargando?'Procesando...':'Liquidar nota de carga'}</button></div>
        </div></div>

        {res && <div className="alert alert-success">Liquidaci?n #{res.codigoLiquidacion} creada. Venta: {q(res.totalVenta)} | Rechazado: {q(res.totalRechazado)} | Gastos: {q(res.totalGastos)} | <strong>Total liquidado: {q(res.totalLiquidado)}</strong></div>}
      </div>
    </div>
  </div>
}
