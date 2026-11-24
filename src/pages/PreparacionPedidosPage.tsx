import { useEffect, useState, useCallback } from 'react'
import { confirmarPreparado, obtenerPreparacion } from '../services/operacionesPedidoService'
import type { PedidoOperacion } from '../interfaces/OperacionesPedido'

export default function PreparacionPedidosPage() {
  const [items, setItems] = useState<PedidoOperacion[]>([])
  const [msg, setMsg] = useState('')
  const cargar = useCallback(async () => {
    const r = await obtenerPreparacion()
    if (r.exito && r.datos) setItems(r.datos)
    else setMsg(r.mensaje || 'Error')
  }, [])
  useEffect(() => { void cargar() }, [cargar])
  const confirmar = async (id: number) => { const r = await confirmarPreparado(id); setMsg(r.mensaje || ''); await cargar() }
  return <div className="container-fluid"><h3>Preparación de pedidos</h3>{msg && <div className="alert alert-info">{msg}</div>}<table className="table table-sm"><thead><tr><th>Pedido</th><th>Cliente</th><th>Fecha</th><th>Entrega prog.</th><th>Unidades</th><th>Estado</th><th></th></tr></thead><tbody>{items.map(p => <tr key={p.codigoPedido}><td>{p.codigoPedido}</td><td>{p.nombreCliente}</td><td>{new Date(p.fechaPedido).toLocaleString()}</td><td>{p.fechaEntregaProgramada ? new Date(p.fechaEntregaProgramada).toLocaleDateString() : ''}</td><td>{p.totalUnidades}</td><td>{p.nombreEstado}</td><td>{p.codigoEstadoPedido === 2 && <button className="btn btn-sm btn-primary" onClick={() => void confirmar(p.codigoPedido)}>Confirmar preparado</button>}</td></tr>)}</tbody></table></div>
}
