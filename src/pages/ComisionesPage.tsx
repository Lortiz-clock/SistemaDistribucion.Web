import { useEffect, useState } from 'react'
import { guardarComision, obtenerComisiones } from '../services/operacionesPedidoService'
import type { ComisionEntrega } from '../interfaces/OperacionesPedido'
export default function ComisionesPage(){
  const [items,setItems]=useState<ComisionEntrega[]>([]); const [msg,setMsg]=useState('');
  const cargar=async()=>{ const r=await obtenerComisiones(); if(r.exito&&r.datos) setItems(r.datos); };
  useEffect(()=>{cargar();},[]);
  const save=async(c:ComisionEntrega)=>{ const r=await guardarComision(c); setMsg(r.mensaje||''); await cargar(); };
  return <div className="container-fluid"><h3>Comisiones de entrega</h3>{msg&&<div className="alert alert-info">{msg}</div>}<table className="table table-sm"><thead><tr><th>% Min</th><th>% Max</th><th>Monto</th><th>Activo</th><th></th></tr></thead><tbody>{items.map((c,i)=><tr key={c.codigoComisionEntrega||i}><td><input className="form-control form-control-sm" type="number" value={c.porcentajeMinimo} onChange={e=>{const v=[...items]; v[i]={...c,porcentajeMinimo:Number(e.target.value)}; setItems(v)}}/></td><td><input className="form-control form-control-sm" type="number" value={c.porcentajeMaximo??''} onChange={e=>{const v=[...items]; v[i]={...c,porcentajeMaximo:e.target.value===''?null:Number(e.target.value)}; setItems(v)}}/></td><td><input className="form-control form-control-sm" type="number" value={c.montoPago} onChange={e=>{const v=[...items]; v[i]={...c,montoPago:Number(e.target.value)}; setItems(v)}}/></td><td><input type="checkbox" checked={c.estado} onChange={e=>{const v=[...items]; v[i]={...c,estado:e.target.checked}; setItems(v)}}/></td><td><button className="btn btn-sm btn-primary" onClick={()=>save(c)}>Guardar</button></td></tr>)}</tbody></table></div>
}
