import { useEffect, useState } from 'react'
import { marcarEntregado, obtenerMiRepartidor, obtenerMisEntregas } from '../services/operacionesPedidoService'
import { buscarPedido } from '../services/pedidosService'
import type { PedidoOperacion } from '../interfaces/OperacionesPedido'
import type { PedidoDetalle } from '../interfaces/PedidoConsulta'

export default function MisEntregasPage(){
  const [items,setItems]=useState<PedidoOperacion[]>([])
  const [msg,setMsg]=useState('')
  const [codigoRepartidor,setCodigoRepartidor]=useState<number|null>(null)
  const [cargando,setCargando]=useState(true)
  const [abierto,setAbierto]=useState<number|null>(null)
  const [detalles,setDetalles]=useState<Record<number,PedidoDetalle[]>>({})

  const cargar=async(codRep?:number|null)=>{
    const c=codRep ?? codigoRepartidor
    if(!c){ setItems([]); return }
    setCargando(true)
    try{
      const r=await obtenerMisEntregas(c)
      if(r.exito&&r.datos) setItems(r.datos); else setMsg(r.mensaje||'No se pudieron cargar entregas.')
    } catch(e:any){ setMsg(e?.response?.data?.mensaje || e?.message || 'Error cargando entregas.') }
    finally{ setCargando(false) }
  }

  useEffect(()=>{ void (async()=>{
    try{
      const r=await obtenerMiRepartidor()
      if(r.exito){ setCodigoRepartidor(r.datos ?? null); await cargar(r.datos ?? null) }
      else setMsg(r.mensaje||'No se pudo identificar el repartidor.')
    } catch(e:any){ setMsg(e?.response?.data?.mensaje || e?.message || 'No se pudo identificar el repartidor.') }
    finally{ setCargando(false) }
  })() },[])

  const verDetalle=async(codigoPedido:number)=>{
    if(abierto===codigoPedido){ setAbierto(null); return }
    setAbierto(codigoPedido)
    if(detalles[codigoPedido]) return
    const r=await buscarPedido(codigoPedido)
    if(r.exito&&r.datos) setDetalles(prev=>({...prev,[codigoPedido]:r.datos!.detalle}))
  }

  const entregar=async(codigoPedido:number)=>{ try{ await marcarEntregado(codigoPedido); setMsg('Pedido marcado como entregado.'); await cargar() } catch(e:any){ setMsg(e?.response?.data?.mensaje || e?.message || 'No se pudo marcar entregado.') } }
  const total=items.reduce((a,p)=>a+Number(p.totalVenta||0),0)

  return <div className="container-fluid">
    <div className="d-flex justify-content-between align-items-center mb-2 flex-wrap gap-2">
      <h3 className="mb-0">Mis entregas</h3>
      <div className="d-flex gap-2 align-items-center">
        {codigoRepartidor ? <span className="badge text-bg-secondary">Repartidor {codigoRepartidor}</span> : null}
        <button className="btn btn-outline-secondary btn-sm" onClick={()=>void cargar()} disabled={cargando}>Refrescar</button>
        <div className="fw-bold">Total a cobrar: Q {total.toFixed(2)}</div>
      </div>
    </div>
    {msg&&<div className="alert alert-info py-2">{msg}</div>}
    {!codigoRepartidor && !cargando && <div className="alert alert-warning">Tu usuario no tiene repartidor asociado. Asocia el usuario al empleado repartidor en la configuraci?n.</div>}
    <div className="table-responsive">
      <table className="table table-sm align-middle">
        <thead><tr><th>Pedido</th><th>Cliente</th><th>Direcci?n</th><th>Ubicaci?n</th><th className="text-end">Total</th><th>Estado</th><th></th><th></th></tr></thead>
        <tbody>
          {items.map(p=><>
            <tr key={p.codigoPedido}>
              <td>{p.codigoPedido}</td>
              <td>{p.nombreCliente}</td>
              <td>{p.direccion}</td>
              <td>{p.latitud&&p.longitud?<a href={`https://www.google.com/maps?q=${p.latitud},${p.longitud}`} target="_blank" rel="noreferrer">Ver mapa</a>:''}</td>
              <td className="text-end">Q {Number(p.totalVenta).toFixed(2)}</td>
              <td>{p.nombreEstado}</td>
              <td><button className="btn btn-sm btn-outline-secondary" onClick={()=>void verDetalle(p.codigoPedido)}>{abierto===p.codigoPedido?'Ocultar':'Detalle'}</button></td>
              <td>{p.codigoEstadoPedido===4&&<button className="btn btn-sm btn-success" onClick={()=>void entregar(p.codigoPedido)}>Entregado</button>}</td>
            </tr>
            {abierto===p.codigoPedido && <tr key={`${p.codigoPedido}-det`}><td colSpan={8} className="bg-light">
              <table className="table table-sm mb-0"><thead><tr><th>Producto</th><th className="text-end">Cantidad</th><th className="text-end">Precio</th></tr></thead><tbody>
                {(detalles[p.codigoPedido]||[]).map(d=><tr key={d.codigoPedidoDetalle}><td>{d.nombreProducto||`Producto ${d.codigoProducto}`}</td><td className="text-end">{d.cantidad}</td><td className="text-end">Q {Number(d.precioVenta).toFixed(2)}</td></tr>)}
                {!detalles[p.codigoPedido]?.length && <tr><td colSpan={3} className="text-muted">Sin detalle</td></tr>}
              </tbody></table>
            </td></tr>}
          </>)}
          {!items.length && !cargando && <tr><td colSpan={8} className="text-muted">No hay entregas asignadas.</td></tr>}
        </tbody>
      </table>
    </div>
  </div>
}
