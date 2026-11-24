import { useEffect, useState, useCallback } from 'react'
import { consultarFEL, generarFEL } from '../services/operacionesPedidoService'
import type { FacturaFEL } from '../interfaces/OperacionesPedido'
export default function FacturacionFELPage() {
  const [items, setItems] = useState<FacturaFEL[]>([]); const [pedido, setPedido] = useState(0); const [msg, setMsg] = useState('')
  const cargar = useCallback(async () => { const r = await consultarFEL(); if (r.exito && r.datos) setItems(r.datos) }, [])
  useEffect(() => { void cargar() }, [cargar])
  const generar = async () => { const r = await generarFEL(pedido); setMsg(r.mensaje || ''); await cargar() }
  return <div className="container-fluid"><h3>Facturación FEL</h3><p className="text-muted">Interno. Factura por pedido entregado; toma lotes contables. Proveedor FEL pendiente (estado PENDIENTE).</p>{msg && <div className="alert alert-info">{msg}</div>}<div className="d-flex gap-2 mb-2"><input className="form-control" style={{ maxWidth: 220 }} type="number" placeholder="Código pedido" value={pedido || ''} onChange={e => setPedido(Number(e.target.value))} /><button className="btn btn-primary" onClick={() => void generar()} disabled={!pedido}>Generar FEL</button></div><table className="table table-sm"><thead><tr><th>ID</th><th>Pedido</th><th>Fecha</th><th>Estado</th><th>Total</th><th>Contable</th><th>Envío</th></tr></thead><tbody>{items.map(f => <tr key={f.codigoFacturaFEL}><td>{f.codigoFacturaFEL}</td><td>{f.codigoPedido}</td><td>{new Date(f.fechaEmision).toLocaleString()}</td><td>{f.estado}</td><td>Q {Number(f.total).toFixed(2)}</td><td>Q {Number(f.totalContable).toFixed(2)}</td><td>Q {Number(f.totalEnvio).toFixed(2)}</td></tr>)}</tbody></table></div>
}
