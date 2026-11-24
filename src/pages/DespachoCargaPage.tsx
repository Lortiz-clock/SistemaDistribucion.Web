import { useCallback, useEffect, useMemo, useState } from 'react'
import { asignarDespacho, confirmarCargaDespacho, obtenerCarga } from '../services/operacionesPedidoService'
import { buscarPedido } from '../services/pedidosService'
import { consultarRepartidores } from '../services/repartidorServices'
import type { PedidoOperacion } from '../interfaces/OperacionesPedido'
import type { PedidoDetalle } from '../interfaces/PedidoConsulta'
import type { RepartidorConsulta } from '../interfaces/RepartidorConsulta'

export default function DespachoCargaPage() {
  const [items, setItems] = useState<PedidoOperacion[]>([])
  const [sel, setSel] = useState<number[]>([])
  const [rep, setRep] = useState(0)
  const [repartidores, setRepartidores] = useState<RepartidorConsulta[]>([])
  const [msg, setMsg] = useState('')
  const [detalles, setDetalles] = useState<Record<number, PedidoDetalle[]>>({})
  const [abierto, setAbierto] = useState<number | null>(null)
  const [cargandoDetalle, setCargandoDetalle] = useState<number | null>(null)
  const [ocupado, setOcupado] = useState(false)

  const cargar = useCallback(async () => {
    const r = await obtenerCarga()
    if (r.exito && r.datos) setItems(r.datos)
    else setMsg(r.mensaje || 'Error al cargar pedidos')
  }, [])

  useEffect(() => { void cargar() }, [cargar])
  useEffect(() => {
    const cargarRepartidores = async () => {
      const r = await consultarRepartidores()
      if (r.exito && r.datos) setRepartidores(r.datos.filter(x => x.estado))
    }
    void cargarRepartidores()
  }, [])

  const toggle = (id: number) => setSel(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id])

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

  const asignar = async () => {
    setOcupado(true)
    try {
      const r = await asignarDespacho({ codigoRepartidor: rep, pedidos: sel })
      setMsg(r.mensaje || '')
      if (r.exito) setSel([])
      await cargar()
    } finally { setOcupado(false) }
  }

  const confirmarCarga = async (codigoDespacho: number) => {
    setOcupado(true)
    try {
      const r = await confirmarCargaDespacho(codigoDespacho)
      setMsg(r.mensaje || '')
      await cargar()
    } finally { setOcupado(false) }
  }

  const obtenerDetallesDespacho = async (pedidos: PedidoOperacion[]) => {
    const map: Record<number, PedidoDetalle[]> = { ...detalles }
    for (const p of pedidos) {
      if (!map[p.codigoPedido]) {
        const r = await buscarPedido(p.codigoPedido)
        if (r.exito && r.datos) map[p.codigoPedido] = r.datos.detalle
        else map[p.codigoPedido] = []
      }
    }
    setDetalles(map)
    return map
  }

  const abrirImpresion = (titulo: string, html: string, ticket = false) => {
    const w = window.open('', '_blank', 'width=1000,height=800')
    if (!w) { setMsg('Permite ventanas emergentes para imprimir.'); return }
    const estilo = ticket ? `
        @page{size:80mm auto;margin:3mm}
        body{font-family:Arial,sans-serif;margin:0;color:#111;width:74mm;font-size:11px}
        h1,h2,h3{margin:0 0 4px;font-size:13px}
        table{width:100%;border-collapse:collapse;margin:4px 0 8px}
        th,td{border-bottom:1px dashed #999;padding:2px 0;font-size:10px;vertical-align:top}
        th{font-weight:bold}
        .muted{color:#333;font-size:10px;margin-bottom:4px}
        .pedido{page-break-inside:avoid;border-top:1px dashed #333;padding-top:6px;margin-bottom:8px}
        .tot{font-size:12px;font-weight:bold;text-align:right;margin-top:4px}
        .noprint{margin-bottom:8px}
        @media print{.noprint{display:none} body{width:74mm}}
    ` : `
        @page{size:letter;margin:12mm}
        body{font-family:Arial,sans-serif;margin:24px;color:#111}
        h1,h2,h3{margin:0 0 8px} table{width:100%;border-collapse:collapse;margin:8px 0 16px}
        th,td{border:1px solid #ccc;padding:6px;font-size:12px;vertical-align:top} th{background:#f5f5f5}
        .muted{color:#555;font-size:12px} .pedido{page-break-inside:avoid;border:1px solid #ddd;padding:12px;margin-bottom:16px}
        .tot{font-size:14px;font-weight:bold;text-align:right} .noprint{margin-bottom:12px}
        @media print{.noprint{display:none} body{margin:0}}
    `
    w.document.write(`<!doctype html><html><head><meta charset="utf-8"/><title>${titulo}</title>
      <style>${estilo}</style></head><body>
      <div class="noprint"><button onclick="window.print()">Imprimir</button> <small>${ticket ? 'Formato ticket 80mm' : 'Formato carta'}</small></div>
      ${html}</body></html>`)
    w.document.close()
  }

  const imprimirHojaRuta = async (g: { nombreRepartidor: string; codigoDespacho?: number | null; pedidos: PedidoOperacion[] }, ticket = false) => {
    setOcupado(true)
    try {
      const total = g.pedidos.reduce((a, p) => a + Number(p.totalVenta || 0), 0)
      const filas = g.pedidos.map(p => `<tr><td>${p.nombreCliente}</td><td style="text-align:right">Q ${Number(p.totalVenta || 0).toFixed(2)}</td></tr>`).join('')
      abrirImpresion('Hoja de ruta', `
        <h2>Hoja de ruta</h2>
        <div class="muted">Repartidor: ${g.nombreRepartidor} ${g.codigoDespacho ? `| Despacho: ${g.codigoDespacho}` : ''} | Fecha: ${new Date().toLocaleString()}</div>
        <table><thead><tr><th>Cliente</th><th style="${ticket ? 'width:70px' : 'width:160px'};text-align:right">Total</th></tr></thead><tbody>${filas}</tbody></table>
        <div class="tot">Total ruta: Q ${total.toFixed(2)}</div>`, ticket)
    } finally { setOcupado(false) }
  }

  const imprimirPedidos = async (g: { nombreRepartidor: string; codigoDespacho?: number | null; pedidos: PedidoOperacion[] }, ticket = false) => {
    setOcupado(true)
    try {
      const map = await obtenerDetallesDespacho(g.pedidos)
      const bloques = g.pedidos.map(p => {
        const det = map[p.codigoPedido] || []
        const filas = det.map(d => `<tr><td>${d.nombreProducto || `Producto ${d.codigoProducto}`}</td><td style="text-align:right">${d.cantidad}</td></tr>`).join('')
        const total = det.reduce((a, d) => a + Number(d.cantidad || 0) * Number(d.precioVenta || 0), 0)
        const head = `<tr><th>Producto</th><th style="${ticket ? 'width:55px' : 'width:90px'};text-align:right">Cant.</th></tr>`
        return `<div class="pedido">
          <h3>Pedido #${p.codigoPedido}</h3>
          <div><strong>Cliente:</strong> ${p.nombreCliente}</div>
          <div><strong>Dirección:</strong> ${p.direccion || ''}</div>
          <table><thead>${head}</thead><tbody>${filas || '<tr><td colspan="2">Sin detalle</td></tr>'}</tbody></table>
          <div class="tot">Total pedido: Q ${total.toFixed(2)}</div>
          <div class="muted"><strong>Dirección entrega:</strong> ${p.direccion || ''}</div>
        </div>`
      }).join('')
      abrirImpresion('Pedidos despacho', `
        <h2>Nota de carga / Pedidos</h2>
        <div class="muted">Repartidor: ${g.nombreRepartidor} ${g.codigoDespacho ? `| Despacho: ${g.codigoDespacho}` : ''} | Fecha: ${new Date().toLocaleString()}</div>
        ${bloques}`, ticket)
    } finally { setOcupado(false) }
  }

  const grupos = useMemo(() => {
    const m = new Map<string, { key: string; codigoDespacho?: number | null; estadoDespacho?: string; codigoRepartidor?: number | null; nombreRepartidor: string; pedidos: PedidoOperacion[] }>()
    for (const p of items) {
      const key = p.codigoDespacho ? `d-${p.codigoDespacho}` : p.codigoRepartidor ? `r-${p.codigoRepartidor}` : 'sin'
      const actual = m.get(key) || { key, codigoDespacho: p.codigoDespacho, estadoDespacho: p.estadoDespacho, codigoRepartidor: p.codigoRepartidor, nombreRepartidor: p.nombreRepartidor || (p.codigoRepartidor ? `Repartidor ${p.codigoRepartidor}` : 'Sin asignar'), pedidos: [] }
      actual.pedidos.push(p)
      m.set(key, actual)
    }
    return Array.from(m.values()).sort((a, b) => (a.codigoRepartidor || 999999) - (b.codigoRepartidor || 999999))
  }, [items])

  const sinAsignar = items.filter(p => p.codigoEstadoPedido === 3 && !p.codigoRepartidor)

  return (
    <div className="container-fluid">
      <h3>Despacho / Carga</h3>
      {msg && <div className="alert alert-info py-2">{msg}</div>}

      <div className="card mb-3">
        <div className="card-body d-flex gap-2 align-items-end flex-wrap">
          <div>
            <label className="form-label mb-1">Repartidor</label>
            <select className="form-select" style={{ minWidth: 280 }} value={rep || ''} onChange={e => setRep(Number(e.target.value))}>
              <option value="">Seleccione repartidor...</option>
              {repartidores.map(r => <option key={r.codigoRepartidor} value={r.codigoRepartidor}>{r.nombreEmpleado}</option>)}
            </select>
          </div>
          <button className="btn btn-primary" onClick={() => void asignar()} disabled={ocupado || !rep || sel.length === 0}>Asignar pedidos</button>
          <span className="text-muted small">Selecciona pedidos preparados sin repartidor. La carga se confirma despu?s.</span>
        </div>
      </div>

      {grupos.map(g => (
        <div className="card mb-3" key={g.key}>
          <div className="card-header d-flex justify-content-between align-items-center flex-wrap gap-2">
            <div>
              <strong>{g.nombreRepartidor}</strong>
              {g.codigoDespacho ? <span className="ms-2 badge text-bg-secondary">Despacho {g.codigoDespacho}</span> : null}
              {g.estadoDespacho ? <span className="ms-2 badge text-bg-info">{g.estadoDespacho}</span> : <span className="ms-2 badge text-bg-warning">SIN ASIGNAR</span>}
            </div>
            <div className="d-flex gap-2 flex-wrap">
              {g.key !== 'sin' && <button className="btn btn-sm btn-outline-dark" disabled={ocupado} onClick={() => void imprimirHojaRuta(g, false)}>Hoja ruta carta</button>}
              {g.key !== 'sin' && <button className="btn btn-sm btn-outline-dark" disabled={ocupado} onClick={() => void imprimirHojaRuta(g, true)}>Hoja ruta ticket</button>}
              {g.key !== 'sin' && <button className="btn btn-sm btn-outline-primary" disabled={ocupado} onClick={() => void imprimirPedidos(g, false)}>Nota carga carta</button>}
              {g.key !== 'sin' && <button className="btn btn-sm btn-outline-primary" disabled={ocupado} onClick={() => void imprimirPedidos(g, true)}>Nota carga ticket</button>}
              {g.codigoDespacho && g.estadoDespacho === 'PLANIFICADO' && (
                <button className="btn btn-sm btn-success" disabled={ocupado} onClick={() => void confirmarCarga(g.codigoDespacho!)}>Confirmar carga</button>
              )}
            </div>
          </div>
          <div className="table-responsive" style={{ maxHeight: '45vh', overflowY: 'auto' }}>
            <table className="table table-sm align-middle mb-0">
              <thead className="table-light" style={{ position: 'sticky', top: 0, zIndex: 2 }}>
                <tr><th></th><th>Pedido</th><th>Cliente</th><th>Direcci?n</th><th>Entrega</th><th className="text-end">Unidades</th><th className="text-end">Total</th><th>Estado</th><th></th></tr>
              </thead>
              <tbody>
                {g.pedidos.map(p => (
                  <>
                    <tr key={p.codigoPedido}>
                      <td>{p.codigoEstadoPedido === 3 && !p.codigoRepartidor ? <input type="checkbox" checked={sel.includes(p.codigoPedido)} onChange={() => toggle(p.codigoPedido)} /> : null}</td>
                      <td>{p.codigoPedido}</td>
                      <td>{p.nombreCliente}</td>
                      <td className="small">{p.direccion}</td>
                      <td>{p.fechaEntregaProgramada ? new Date(p.fechaEntregaProgramada).toLocaleDateString() : ''}</td>
                      <td className="text-end">{p.totalUnidades}</td>
                      <td className="text-end">Q {Number(p.totalVenta).toFixed(2)}</td>
                      <td>{p.nombreEstado}</td>
                      <td><button className="btn btn-sm btn-outline-secondary" onClick={() => void verDetalle(p.codigoPedido)}>{abierto === p.codigoPedido ? 'Ocultar' : 'Productos'}</button></td>
                    </tr>
                    {abierto === p.codigoPedido && (
                      <tr key={`${p.codigoPedido}-det`}><td colSpan={9} className="bg-light p-0">
                        <div style={{ position: 'relative', zIndex: 0, padding: '.5rem' }}>
                        {cargandoDetalle === p.codigoPedido ? <div className="text-muted">Cargando...</div> : (
                          <table className="table table-sm mb-0"><thead><tr><th>Producto</th><th className="text-end">Cantidad</th><th className="text-end">Precio</th><th>Faltante</th></tr></thead><tbody>
                            {(detalles[p.codigoPedido] || []).map(d => <tr key={d.codigoPedidoDetalle}><td>{d.nombreProducto || `Producto ${d.codigoProducto}`}</td><td className="text-end">{d.cantidad}</td><td className="text-end">{Number(d.precioVenta).toFixed(2)}</td><td>{d.esFaltante ? <span className="badge text-bg-warning">Faltante</span> : 'OK'}</td></tr>)}
                            {!detalles[p.codigoPedido]?.length && <tr><td colSpan={4} className="text-muted">Sin detalle</td></tr>}
                          </tbody></table>
                        )}
                        </div>
                      </td></tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      {!items.length && <div className="text-muted">No hay pedidos preparados/cargados.</div>}
      {!!sinAsignar.length && <div className="text-muted small">Pedidos preparados sin asignar: {sinAsignar.length}</div>}
    </div>
  )
}
