import { useState } from 'react'
import { marcarEntregado, obtenerMisEntregas } from '../services/operacionesPedidoService'
import type { PedidoOperacion } from '../interfaces/OperacionesPedido'

export default function MisEntregasPage(){
  const [rep,setRep]=useState(0); const [items,setItems]=useState<PedidoOperacion[]>([]); const [msg,setMsg]=useState('');
  const cargar=async()=>{ if(!rep) return; const r=await obtenerMisEntregas(rep); if(r.exito&&r.datos) setItems(r.datos); };
  const entregar=async(id:number)=>{ const r=await marcarEntregado(id); setMsg(r.mensaje||''); await cargar(); };
  const total=items.reduce((a,b)=>a+Number(b.totalVenta||0),0);
  return <div className="container-fluid"><h3>Mis entregas</h3>{msg&&<div className="alert alert-info">{msg}</div>}<div className="d-flex gap-2 mb-2"><input className="form-control" style={{maxWidth:220}} type="number" placeholder="Código repartidor" value={rep||''} onChange={e=>setRep(Number(e.target.value))} /><button className="btn btn-secondary" onClick={cargar}>Cargar</button><div className="ms-auto fw-bold">Total: Q {total.toFixed(2)}</div></div><table className="table table-sm"><thead><tr><th>Pedido</th><th>Cliente</th><th>Dirección</th><th>Ubicación</th><th>Total</th><th>Estado</th><th></th></tr></thead><tbody>{items.map(p=><tr key={p.codigoPedido}><td>{p.codigoPedido}</td><td>{p.nombreCliente}</td><td>{p.direccion}</td><td>{p.latitud&&p.longitud?<a href={`https://www.google.com/maps?q=${p.latitud},${p.longitud}`} target="_blank">Ver mapa</a>:''}</td><td>Q {Number(p.totalVenta).toFixed(2)}</td><td>{p.nombreEstado}</td><td>{p.codigoEstadoPedido===4&&<button className="btn btn-sm btn-success" onClick={()=>entregar(p.codigoPedido)}>Entregado</button>}</td></tr>)}</tbody></table></div>
}
