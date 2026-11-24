import { useState } from 'react'
import { registrarRechazo } from '../services/operacionesPedidoService'
export default function RechazosPage(){
  const [codigoPedido,setCodigoPedido]=useState(0); const [motivo,setMotivo]=useState(''); const [msg,setMsg]=useState('');
  const enviar=async()=>{ const r=await registrarRechazo({codigoPedido,motivo,esParcial:false,detalles:[]}); setMsg(r.exito?`Rechazo registrado #${r.datos}`:(r.mensaje||'Error')); };
  return <div className="container-fluid"><h3>Rechazos / Devoluciones</h3>{msg&&<div className="alert alert-info">{msg}</div>}<div className="row g-2" style={{maxWidth:700}}><div className="col-md-4"><input className="form-control" type="number" placeholder="Código pedido" value={codigoPedido||''} onChange={e=>setCodigoPedido(Number(e.target.value))} /></div><div className="col-md-8"><input className="form-control" placeholder="Motivo" value={motivo} onChange={e=>setMotivo(e.target.value)} /></div><div className="col-12"><button className="btn btn-danger" onClick={enviar} disabled={!codigoPedido}>Registrar rechazo total</button></div></div><p className="text-muted mt-3">El rechazo libera reserva antes de liquidar. El histórico se conserva para comisiones/metas.</p></div>
}
