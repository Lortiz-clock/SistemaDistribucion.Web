import { useState } from 'react'
import { reporteVentasVendedor } from '../services/operacionesPedidoService'
import type { ReporteVendedor } from '../interfaces/OperacionesPedido'
export default function ReporteVendedoresPage(){
  const [desde,setDesde]=useState(''); const [hasta,setHasta]=useState(''); const [items,setItems]=useState<ReporteVendedor[]>([]);
  const cargar=async()=>{ if(!desde||!hasta) return; const r=await reporteVentasVendedor(desde,hasta); if(r.exito&&r.datos) setItems(r.datos); };
  return <div className="container-fluid"><h3>Reporte de ventas por vendedor</h3><div className="d-flex gap-2 mb-2"><input className="form-control" style={{maxWidth:180}} type="date" value={desde} onChange={e=>setDesde(e.target.value)} /><input className="form-control" style={{maxWidth:180}} type="date" value={hasta} onChange={e=>setHasta(e.target.value)} /><button className="btn btn-primary" onClick={cargar}>Consultar</button></div><table className="table table-sm"><thead><tr><th>Vendedor</th><th>Venta</th><th>Utilidad</th><th>Entregados</th><th>Total</th><th>% Entrega</th><th>Comisión</th></tr></thead><tbody>{items.map(r=><tr key={r.codigoEmpleado}><td>{r.nombreEmpleado}</td><td>Q {Number(r.ventaTotal).toFixed(2)}</td><td>Q {Number(r.utilidadTotal).toFixed(2)}</td><td>{r.pedidosEntregados}</td><td>{r.totalPedidos}</td><td>{Number(r.porcentajeEntrega).toFixed(2)}%</td><td>Q {Number(r.comision).toFixed(2)}</td></tr>)}</tbody></table><p className="text-muted">Incluye solo pedidos/productos entregados.</p></div>
}
