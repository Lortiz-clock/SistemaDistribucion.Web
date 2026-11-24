import { useEffect, useState } from 'react'
import { asignarDespacho, obtenerCarga } from '../services/operacionesPedidoService'
import type { PedidoOperacion } from '../interfaces/OperacionesPedido'

export default function DespachoCargaPage() {
  const [items,setItems]=useState<PedidoOperacion[]>([]); const [sel,setSel]=useState<number[]>([]); const [rep,setRep]=useState(0); const [msg,setMsg]=useState('');
  const cargar=async()=>{ const r=await obtenerCarga(); if(r.exito&&r.datos) setItems(r.datos); };
  useEffect(()=>{ cargar(); },[]);
  const toggle=(id:number)=>setSel(s=>s.includes(id)?s.filter(x=>x!==id):[...s,id]);
  const asignar=async()=>{ const r=await asignarDespacho({codigoRepartidor:rep,pedidos:sel}); setMsg(r.mensaje||''); setSel([]); await cargar(); };
  return <div className="container-fluid"><h3>Despacho / Carga</h3>{msg&&<div className="alert alert-info">{msg}</div>}<div className="d-flex gap-2 mb-2"><input className="form-control" style={{maxWidth:220}} type="number" placeholder="Código repartidor" value={rep||''} onChange={e=>setRep(Number(e.target.value))} /><button className="btn btn-primary" onClick={asignar} disabled={!rep||sel.length===0}>Asignar y cargar</button></div><table className="table table-sm"><thead><tr><th></th><th>Pedido</th><th>Cliente</th><th>Dirección</th><th>Entrega</th><th>Total</th><th>Estado</th></tr></thead><tbody>{items.map(p=><tr key={p.codigoPedido}><td><input type="checkbox" checked={sel.includes(p.codigoPedido)} onChange={()=>toggle(p.codigoPedido)} disabled={p.codigoEstadoPedido!==3} /></td><td>{p.codigoPedido}</td><td>{p.nombreCliente}</td><td>{p.direccion}</td><td>{p.fechaEntregaProgramada?new Date(p.fechaEntregaProgramada).toLocaleDateString():''}</td><td>Q {Number(p.totalVenta).toFixed(2)}</td><td>{p.nombreEstado}</td></tr>)}</tbody></table></div>
}
