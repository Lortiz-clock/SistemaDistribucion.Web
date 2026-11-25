import { useMemo, useState } from 'react'
import { dashboardVendedores } from '../services/operacionesPedidoService'
import type { DashboardVendedorItem } from '../interfaces/OperacionesPedido'

const q = (n: number) => `Q ${Number(n || 0).toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
const COLORS = ['#2563eb', '#16a34a', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316']

type PieItem = { label: string; value: number; color: string }

function PieCard({ title, items, valueFmt }: { title: string; items: PieItem[]; valueFmt?: (n: number) => string }) {
  const fmt = valueFmt ?? q
  const rows = items.filter(i => i.value > 0)
  const total = rows.reduce((a, b) => a + b.value, 0)
  let acc = 0
  const stops = rows.map(r => {
    const start = (acc / (total || 1)) * 360
    acc += r.value
    const end = (acc / (total || 1)) * 360
    return `${r.color} ${start}deg ${end}deg`
  }).join(', ')
  return (
    <div className="card h-100"><div className="card-body">
      <h6 className="mb-3">{title}</h6>
      <div className="d-flex gap-3 align-items-center flex-wrap">
        <div style={{ width: 190, height: 190, borderRadius: '50%', background: total > 0 ? `conic-gradient(${stops})` : '#e5e7eb', position: 'relative', flex: '0 0 auto' }}>
          <div style={{ position: 'absolute', inset: 30, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 8 }}>
            <div><div className="fw-bold" style={{ fontSize: 14 }}>{fmt(total)}</div><div className="text-muted small">total</div></div>
          </div>
        </div>
        <div style={{ minWidth: 190, flex: 1 }}>
          {rows.length === 0 && <div className="text-muted small">Sin datos</div>}
          {rows.map(r => (
            <div key={r.label} className="d-flex justify-content-between align-items-center small mb-1 gap-2">
              <span className="d-flex align-items-center gap-2"><span style={{ width: 10, height: 10, borderRadius: 2, background: r.color, display: 'inline-block' }} />{r.label}</span>
              <span><span className="fw-semibold me-2">{fmt(r.value)}</span><span className="text-muted">{total ? ((r.value / total) * 100).toFixed(1) : '0.0'}%</span></span>
            </div>
          ))}
        </div>
      </div>
    </div></div>
  )
}

function Kpi({ label, value }: { label: string; value: string }) {
  return <div className="col-6 col-lg-3"><div className="card h-100"><div className="card-body py-3"><div className="text-muted small">{label}</div><div className="fw-bold fs-5">{value}</div></div></div></div>
}

export default function ReporteVendedoresPage() {
  const hoy = new Date().toISOString().slice(0, 10)
  const [desde, setDesde] = useState(hoy)
  const [hasta, setHasta] = useState(hoy)
  const [items, setItems] = useState<DashboardVendedorItem[]>([])
  const [vendedor, setVendedor] = useState('todos')
  const [msg, setMsg] = useState('')
  const [cargando, setCargando] = useState(false)

  const cargar = async () => {
    if (!desde || !hasta) return
    setCargando(true); setMsg('')
    try {
      const r = await dashboardVendedores(desde, hasta)
      if (r.exito && r.datos) setItems(r.datos)
      else { setItems([]); setMsg(r.mensaje || 'No se pudo cargar el reporte') }
    } catch (e) { setItems([]); setMsg(e instanceof Error ? e.message : 'Error al cargar') }
    finally { setCargando(false) }
  }

  const filtrados = useMemo(() => vendedor === 'todos' ? items : items.filter(i => String(i.codigoEmpleado) === vendedor), [items, vendedor])

  const tot = useMemo(() => filtrados.reduce((a, r) => ({
    venta: a.venta + r.ventaTotal,
    ventaDia: a.ventaDia + r.ventaDia,
    ref: a.ref + r.utilidadReferencia,
    real: a.real + r.utilidadReal,
    perdida: a.perdida + r.utilidadPerdida,
    montoPerdido: a.montoPerdido + r.montoRechazadoDevuelto,
    pedidos: a.pedidos + r.totalPedidos,
    rechazados: a.rechazados + r.pedidosRechazados,
    noVisitados: a.noVisitados + r.clientesNoVisitados,
  }), { venta: 0, ventaDia: 0, ref: 0, real: 0, perdida: 0, montoPerdido: 0, pedidos: 0, rechazados: 0, noVisitados: 0 }), [filtrados])

  const pieVenta: PieItem[] = vendedor === 'todos'
    ? items.filter(i => i.ventaTotal > 0).map((i, idx) => ({ label: i.nombreEmpleado, value: i.ventaTotal, color: COLORS[idx % COLORS.length] }))
    : [
        { label: 'Venta total', value: tot.venta, color: '#2563eb' },
        { label: 'Monto rechazado/devuelto', value: tot.montoPerdido, color: '#ef4444' },
      ]

  const pieUtilidad: PieItem[] = [
    { label: 'Utilidad referencia', value: tot.ref, color: '#16a34a' },
    { label: 'Utilidad real (liquidada)', value: tot.real, color: '#2563eb' },
    { label: 'Utilidad perdida', value: tot.perdida, color: '#ef4444' },
  ]

  return <div className="container-fluid">
    <h3>Dashboard de vendedores</h3>
    <p className="text-muted">Filtra por rango de fechas y vendedor. Utilidad referencia: pedidos no rechazados. Utilidad real: pedidos liquidados. Utilidad perdida: rechazos/devoluciones.</p>
    <div className="d-flex gap-2 mb-3 flex-wrap align-items-end">
      <div><label className="form-label mb-1 small">Desde</label><input className="form-control" style={{ maxWidth: 180 }} type="date" value={desde} onChange={e => setDesde(e.target.value)} /></div>
      <div><label className="form-label mb-1 small">Hasta</label><input className="form-control" style={{ maxWidth: 180 }} type="date" value={hasta} onChange={e => setHasta(e.target.value)} /></div>
      <div><label className="form-label mb-1 small">Vendedor</label>
        <select className="form-select" style={{ minWidth: 260 }} value={vendedor} onChange={e => setVendedor(e.target.value)}>
          <option value="todos">Todos los vendedores</option>
          {items.map(i => <option key={i.codigoEmpleado} value={String(i.codigoEmpleado)}>{i.nombreEmpleado}</option>)}
        </select>
      </div>
      <button className="btn btn-primary" onClick={() => void cargar()} disabled={cargando}>{cargando ? 'Cargando...' : 'Consultar'}</button>
    </div>
    {msg && <div className="alert alert-info py-2">{msg}</div>}

    <div className="row g-3 mb-3">
      <Kpi label="Venta total" value={q(tot.venta)} />
      <Kpi label="Venta del día" value={q(tot.ventaDia)} />
      <Kpi label="Monto rechazado/devuelto" value={q(tot.montoPerdido)} />
      <Kpi label="Clientes no visitados" value={String(tot.noVisitados)} />
    </div>

    <div className="row g-3 mb-3">
      <div className="col-12 col-xl-6"><PieCard title={vendedor === 'todos' ? 'Venta total por vendedor' : 'Venta total vs monto rechazado/devuelto'} items={pieVenta} /></div>
      <div className="col-12 col-xl-6"><PieCard title="Utilidades: referencia, real y perdida" items={pieUtilidad} /></div>
    </div>

    <div className="card mb-3"><div className="card-body py-3 d-flex justify-content-between flex-wrap gap-2">
      <div><span className="text-muted small">Utilidad total (referencia)</span><div className="fw-bold fs-5 text-success">{q(tot.ref)}</div></div>
      <div><span className="text-muted small">Utilidad real (liquidada)</span><div className="fw-bold fs-5 text-primary">{q(tot.real)}</div></div>
      <div><span className="text-muted small">Utilidad perdida</span><div className="fw-bold fs-5 text-danger">{q(tot.perdida)}</div></div>
    </div></div>

    <div className="card"><div className="table-responsive"><table className="table table-sm align-middle mb-0">
      <thead className="table-light"><tr><th>Vendedor</th><th className="text-end">Venta total</th><th className="text-end">Venta día</th><th className="text-end">Util. ref.</th><th className="text-end">Util. real</th><th className="text-end">Util. perdida</th><th className="text-end">Monto perdido</th><th className="text-end">Pedidos</th><th className="text-end">Rechazados</th><th className="text-end">No visitados</th></tr></thead>
      <tbody>
        {filtrados.map(r => <tr key={r.codigoEmpleado}><td>{r.nombreEmpleado}</td><td className="text-end">{q(r.ventaTotal)}</td><td className="text-end">{q(r.ventaDia)}</td><td className="text-end">{q(r.utilidadReferencia)}</td><td className="text-end">{q(r.utilidadReal)}</td><td className="text-end">{q(r.utilidadPerdida)}</td><td className="text-end">{q(r.montoRechazadoDevuelto)}</td><td className="text-end">{r.totalPedidos}</td><td className="text-end">{r.pedidosRechazados}</td><td className="text-end">{r.clientesNoVisitados}</td></tr>)}
        {!filtrados.length && <tr><td colSpan={10} className="text-muted">Consulta un rango de fechas para ver datos.</td></tr>}
      </tbody>
    </table></div></div>
  </div>
}
