import { useEffect, useState, useCallback } from 'react'
import { confirmarPreparado, obtenerPreparacion } from '../services/operacionesPedidoService'
import { buscarPedido } from '../services/pedidosService'
import type { PedidoOperacion } from '../interfaces/OperacionesPedido'
import type { PedidoDetalle } from '../interfaces/PedidoConsulta'

export default function PreparacionPedidosPage() {
  const [items, setItems] = useState<PedidoOperacion[]>([])
  const [detalles, setDetalles] = useState<Record<number, PedidoDetalle[]>>({})
  const [abierto, setAbierto] = useState<number | null>(null)
  const [cargandoDetalle, setCargandoDetalle] = useState<number | null>(null)
  const [msg, setMsg] = useState('')

  const cargar = useCallback(async () => {
    const r = await obtenerPreparacion()
    if (r.exito && r.datos) setItems(r.datos)
    else setMsg(r.mensaje || 'Error')
  }, [])

  useEffect(() => { void cargar() }, [cargar])

  const verDetalle = async (codigoPedido: number) => {
    if (abierto === codigoPedido) { setAbierto(null); return }
    setAbierto(codigoPedido)
    if (detalles[codigoPedido]) return
    setCargandoDetalle(codigoPedido)
    try {
      const r = await buscarPedido(codigoPedido)
      if (r.exito && r.datos) setDetalles(prev => ({ ...prev, [codigoPedido]: r.datos!.detalle }))
      else setMsg(r.mensaje || 'Error al cargar detalle')
    } finally { setCargandoDetalle(null) }
  }

  const confirmar = async (id: number) => {
    const r = await confirmarPreparado(id)
    setMsg(r.mensaje || '')
    if (r.exito) { setDetalles(prev => { const n = { ...prev }; delete n[id]; return n }); setAbierto(null) }
    await cargar()
  }

  return (
    <div className="container-fluid">
      <h3>Preparaci?n de pedidos</h3>
      {msg && <div className="alert alert-info py-2">{msg}</div>}
      <div className="table-responsive" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
        <table className="table table-sm table-hover align-middle">
          <thead className="table-light" style={{ position: 'sticky', top: 0, zIndex: 1 }}>
            <tr><th>Pedido</th><th>Cliente</th><th>Fecha</th><th>Entrega prog.</th><th>Unidades</th><th>Estado</th><th></th></tr>
          </thead>
          <tbody>
            {items.map(p => (
              <>
                <tr key={p.codigoPedido}>
                  <td>{p.codigoPedido}</td>
                  <td>{p.nombreCliente}</td>
                  <td>{new Date(p.fechaPedido).toLocaleString()}</td>
                  <td>{p.fechaEntregaProgramada ? new Date(p.fechaEntregaProgramada).toLocaleDateString() : ''}</td>
                  <td>{p.totalUnidades}</td>
                  <td>{p.nombreEstado}</td>
                  <td className="d-flex gap-2">
                    <button className="btn btn-sm btn-outline-secondary" onClick={() => void verDetalle(p.codigoPedido)}>
                      {abierto === p.codigoPedido ? 'Ocultar' : 'Ver productos'}
                    </button>
                    {p.codigoEstadoPedido === 2 && <button className="btn btn-sm btn-primary" onClick={() => void confirmar(p.codigoPedido)}>Confirmar preparado</button>}
                  </td>
                </tr>
                {abierto === p.codigoPedido && (
                  <tr key={`${p.codigoPedido}-det`}>
                    <td colSpan={7} className="bg-light">
                      {cargandoDetalle === p.codigoPedido ? <div className="text-muted">Cargando productos...</div> : (
                        <table className="table table-sm mb-0">
                          <thead><tr><th>Producto</th><th className="text-end">Cantidad</th><th className="text-end">Precio</th><th>Faltante</th></tr></thead>
                          <tbody>
                            {(detalles[p.codigoPedido] || []).map(d => (
                              <tr key={d.codigoPedidoDetalle}>
                                <td>{d.nombreProducto || `Producto ${d.codigoProducto}`}</td>
                                <td className="text-end">{d.cantidad}</td>
                                <td className="text-end">{Number(d.precioVenta).toFixed(2)}</td>
                                <td>{d.esFaltante ? <span className="badge text-bg-warning">Faltante</span> : <span className="badge text-bg-success">OK</span>}</td>
                              </tr>
                            ))}
                            {!detalles[p.codigoPedido]?.length && <tr><td colSpan={4} className="text-muted">Sin detalle</td></tr>}
                          </tbody>
                        </table>
                      )}
                    </td>
                  </tr>
                )}
              </>
            ))}
            {!items.length && <tr><td colSpan={7} className="text-muted">No hay pedidos en preparaci?n</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
