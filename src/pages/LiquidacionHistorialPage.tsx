import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { historialLiquidaciones, obtenerLiquidacionDetalle } from '../services/operacionesPedidoService'
import type { LiquidacionDetalle, LiquidacionHistorial } from '../interfaces/OperacionesPedido'

const q = (n: number) => `Q ${Number(n || 0).toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export default function LiquidacionHistorialPage() {
  const nav = useNavigate()
  const [items, setItems] = useState<LiquidacionHistorial[]>([])
  const [detalle, setDetalle] = useState<LiquidacionDetalle | null>(null)
  const [msg, setMsg] = useState('')
  const [cargando, setCargando] = useState(false)

  const cargar = async () => { setCargando(true); setMsg(''); try { const r = await historialLiquidaciones(); if (r.exito && r.datos) setItems(r.datos); else setMsg(r.mensaje || 'No se pudo cargar historial.') } catch (e: any) { setMsg(e?.response?.data?.mensaje || e?.message || 'Error al cargar historial.') } finally { setCargando(false) } }
  useEffect(() => { void cargar() }, [])

  const verDetalle = async (id: number) => { setCargando(true); setMsg(''); try { const r = await obtenerLiquidacionDetalle(id); if (r.exito && r.datos) setDetalle(r.datos); else setMsg(r.mensaje || 'No se pudo cargar detalle.') } catch (e: any) { setMsg(e?.response?.data?.mensaje || e?.message || 'Error al cargar detalle.') } finally { setCargando(false) } }

  return <div className="container-fluid">
    <div className="d-flex justify-content-between align-items-center mb-3">
      <h3 className="mb-0">Liquidaciones realizadas</h3>
      <div className="d-flex gap-2">
        <button className="btn btn-outline-secondary btn-sm" onClick={() => void cargar()} disabled={cargando}>Refrescar</button>
        <button className="btn btn-primary btn-sm" onClick={() => nav('/dashboard/liquidacion')}>Volver a liquidar</button>
      </div>
    </div>
    {msg && <div className="alert alert-info py-2">{msg}</div>}
    <div className="card mb-3"><div className="card-body">
      <div className="table-responsive"><table className="table table-sm align-middle mb-0">
        <thead className="table-light"><tr><th>#</th><th>Fecha</th><th>Nota carga</th><th>Repartidor</th><th>Usuario</th><th className="text-end">Pedidos</th><th className="text-end">Efectivo</th><th className="text-end">Dep?sitos</th><th className="text-end">Gastos</th><th className="text-end">Liquidado</th><th></th></tr></thead>
        <tbody>
          {items.map(h => <tr key={h.codigoLiquidacion}>
            <td>{h.codigoLiquidacion}</td><td>{new Date(h.fechaLiquidacion).toLocaleDateString()}</td><td>{h.codigoDespacho || h.despachos || '-'}</td><td>{h.nombreRepartidor || '-'}</td><td>{h.usuarioLiquida || `#${h.codigoUsuario}`}</td>
            <td className="text-end">{h.totalPedidos}</td><td className="text-end">{q(h.totalEfectivo)}</td><td className="text-end">{q(h.totalDepositos)}</td><td className="text-end">{q(h.totalGastos)}</td><td className="text-end fw-semibold">{q(h.totalLiquidado)}</td>
            <td className="text-end"><button className="btn btn-sm btn-outline-primary" onClick={() => void verDetalle(h.codigoLiquidacion)}>Ver detalle</button></td>
          </tr>)}
          {!items.length && <tr><td colSpan={11} className="text-center text-muted py-3 sin-registros">No hay liquidaciones registradas.</td></tr>}
        </tbody>
      </table></div>
    </div></div>

    {detalle && <div className="card"><div className="card-body">
      <div className="d-flex justify-content-between align-items-center mb-2"><h5 className="mb-0">Detalle liquidaci?n #{detalle.codigoLiquidacion}</h5><button className="btn btn-sm btn-outline-secondary" onClick={() => setDetalle(null)}>Cerrar</button></div>
      <div className="small text-muted mb-3">Nota carga: {detalle.codigoDespacho || '-'} ? Repartidor: {detalle.nombreRepartidor || '-'} ? Usuario: {detalle.usuarioLiquida || `#${detalle.codigoUsuario}`} ? Fecha: {new Date(detalle.fechaLiquidacion).toLocaleDateString()}</div>
      <div className="row g-3">
        <div className="col-12 col-lg-6">
          <h6>Pedidos</h6>
          <table className="table table-sm"><thead><tr><th>Pedido</th><th>Cliente</th><th>Estado</th><th className="text-end">Entregado</th><th className="text-end">Rechazado</th></tr></thead><tbody>
            {detalle.pedidos.map(p => <tr key={p.codigoPedido}><td>{p.codigoPedido}</td><td>{p.nombreCliente}</td><td>{p.nombreEstado}</td><td className="text-end">{q(p.totalEntregado)}</td><td className="text-end">{q(p.totalRechazado)}</td></tr>)}
          </tbody></table>
          <h6>Gastos</h6>
          <table className="table table-sm"><thead><tr><th>Descripci?n</th><th className="text-end">Monto</th></tr></thead><tbody>
            {detalle.gastos.map((g,i)=><tr key={i}><td>{g.descripcion}</td><td className="text-end">{q(g.monto)}</td></tr>)}
            {!detalle.gastos.length && <tr><td colSpan={2} className="text-muted">Sin gastos</td></tr>}
          </tbody></table>
        </div>
        <div className="col-12 col-lg-6">
          <h6>Efectivo</h6>
          <table className="table table-sm"><thead><tr><th>Denominaci?n</th><th className="text-end">Cant.</th><th className="text-end">Subtotal</th></tr></thead><tbody>
            {detalle.efectivo.map((e,i)=><tr key={i}><td>{q(e.denominacion)} <small className="text-muted">{e.tipo}</small></td><td className="text-end">{e.cantidad}</td><td className="text-end">{q(e.subtotal)}</td></tr>)}
            {!detalle.efectivo.length && <tr><td colSpan={3} className="text-muted">Sin efectivo</td></tr>}
          </tbody></table>
          <h6>Dep?sitos</h6>
          <table className="table table-sm"><thead><tr><th>Banco</th><th>Boleta</th><th className="text-end">Monto</th></tr></thead><tbody>
            {detalle.depositos.map((d,i)=><tr key={i}><td>{d.banco}</td><td>{d.numeroBoleta}</td><td className="text-end">{q(d.monto)}</td></tr>)}
            {!detalle.depositos.length && <tr><td colSpan={3} className="text-muted">Sin dep?sitos</td></tr>}
          </tbody></table>
        </div>
      </div>
      <div className="d-flex flex-wrap gap-3 small border-top pt-2">
        <div><span className="text-muted">Venta:</span> <strong>{q(detalle.totalVenta)}</strong></div>
        <div><span className="text-muted">Rechazado:</span> <strong>{q(detalle.totalRechazado)}</strong></div>
        <div><span className="text-muted">Gastos:</span> <strong>{q(detalle.totalGastos)}</strong></div>
        <div><span className="text-muted">Liquidado:</span> <strong>{q(detalle.totalLiquidado)}</strong></div>
        <div><span className="text-muted">Efectivo:</span> <strong>{q(detalle.efectivo.reduce((a,e)=>a+Number(e.subtotal||0),0))}</strong></div>
        <div><span className="text-muted">Dep?sitos:</span> <strong>{q(detalle.depositos.reduce((a,d)=>a+Number(d.monto||0),0))}</strong></div>
      </div>
    </div></div>}
  </div>
}
