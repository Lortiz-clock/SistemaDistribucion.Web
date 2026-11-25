import { useCallback, useEffect, useState } from 'react'
import { consultarFEL, generarFEL, obtenerFELImpresion } from '../services/operacionesPedidoService'
import type { FacturaFEL, FacturaFELImpresion } from '../interfaces/OperacionesPedido'

const fmtFecha = (v?: string | null) => { if (!v) return ''; const d = new Date(v); return isNaN(d.getTime()) ? v : d.toLocaleDateString('es-GT'); }
const money = (n: number) => `Q ${Number(n || 0).toFixed(2)}`
const esc = (s: unknown) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

function facturaHtml(f: FacturaFELImpresion) {
  const filas = (f.detalle || []).map(d => `
    <tr>
      <td class="c">${d.cantidad}</td>
      <td>${esc(d.nombreProducto || `Producto ${d.codigoProducto}`)}</td>
      <td class="r">${money(d.precioUnitario)}</td>
      <td class="r">${money(d.totalLinea)}</td>
    </tr>`).join('')
  const numero = f.numero || f.serie || String(f.codigoFacturaFEL)
  return `<section class="factura">
    <div class="row"><span class="lbl">RUTA:</span><span>${esc(f.nombreVendedor || '-')}</span></div>
    <div class="row"><span class="lbl">FECHA EMISION:</span><span>${fmtFecha(f.fechaPedido || f.fechaEmision)}</span></div>
    <div class="row"><span class="lbl">FACTURA:</span><span>${esc(numero)}</span></div>
    <div class="sep"></div>
    <div class="row"><span class="lbl">CODIGO:</span><span>${f.codigoCliente ?? ''}</span></div>
    <div class="row"><span class="lbl">NOMBRE:</span><span>${esc(f.nombreCliente || '')}</span></div>
    <div class="row"><span class="lbl">DIRECCION:</span><span>${esc(f.direccionCliente || '')}</span></div>
    <div class="sep"></div>
    <table>
      <thead><tr><th class="c" style="width:52px">Cant.</th><th>Descripci?n</th><th class="r" style="width:72px">Precio</th><th class="r" style="width:72px">Total</th></tr></thead>
      <tbody>${filas || '<tr><td colspan="4">Sin detalle</td></tr>'}</tbody>
    </table>
    <div class="sep"></div>
    <div class="total"><span>TOTAL A PAGAR:</span><span>${money(f.total)}</span></div>
  </section>`
}

export default function FacturacionFELPage() {
  const [items, setItems] = useState<FacturaFEL[]>([]); const [pedido, setPedido] = useState(0); const [msg, setMsg] = useState('')
  const [seleccion, setSeleccion] = useState<number[]>([]); const [imprimiendo, setImprimiendo] = useState(false)
  const cargar = useCallback(async () => { const r = await consultarFEL(); if (r.exito && r.datos) setItems(r.datos) }, [])
  useEffect(() => { void cargar() }, [cargar])
  const generar = async () => { const r = await generarFEL(pedido); setMsg(r.mensaje || ''); await cargar() }
  const toggle = (id: number) => setSeleccion(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id])
  const todos = () => setSeleccion(seleccion.length === items.length ? [] : items.map(i => i.codigoFacturaFEL))

  const imprimir = async (idsArg?: number[]) => {
    const ids = idsArg?.length ? idsArg : (seleccion.length ? seleccion : items.map(i => i.codigoFacturaFEL))
    if (!ids.length) return
    setImprimiendo(true)
    try {
      const datos: FacturaFELImpresion[] = []
      for (const id of ids) { const r = await obtenerFELImpresion(id); if (r.exito && r.datos) datos.push(r.datos) }
      if (!datos.length) { setMsg('No se encontraron facturas para imprimir.'); return }
      const w = window.open('', '_blank', 'width=900,height=700')
      if (!w) { setMsg('Permita ventanas emergentes para imprimir.'); return }
      w.document.write(`<!doctype html><html><head><meta charset="utf-8"/><title>Facturas</title><style>
        @page{size:letter;margin:12mm}body{font-family:Arial,sans-serif;color:#111;margin:0;font-size:12px}
        .factura{width:360px;max-width:100%;margin:0 auto;page-break-after:always;break-after:page;padding:0 0 8mm}
        .factura:last-child{page-break-after:auto;break-after:auto}
        .row{display:flex;gap:8px;margin:2px 0;line-height:1.35}.lbl{font-weight:bold;min-width:112px}
        .sep{border-top:1px dashed #666;margin:8px 0}
        table{width:100%;border-collapse:collapse;margin:4px 0}th,td{padding:3px 2px;text-align:left;vertical-align:top;font-size:11px}
        th{font-weight:bold;border-bottom:1px solid #999}.c{text-align:center}.r{text-align:right}
        .total{display:flex;justify-content:space-between;font-weight:bold;font-size:13px;margin-top:6px}
      </style></head><body>${datos.map(facturaHtml).join('')}</body></html>`)
      w.document.close(); w.focus(); setTimeout(() => { w.print(); w.close(); }, 300)
    } finally { setImprimiendo(false) }
  }

  return <div className="container-fluid">
    <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-2">
      <div><h3 className="mb-0">Facturaci?n FEL</h3><p className="text-muted mb-0">Interno. Factura por pedido entregado; toma lotes contables. Proveedor FEL pendiente.</p></div>
      <button className="btn btn-outline-primary" onClick={() => void imprimir()} disabled={imprimiendo || items.length===0}>{imprimiendo ? 'Preparando...' : `Imprimir ${seleccion.length ? `(${seleccion.length})` : 'todas'}`}</button>
    </div>
    {msg && <div className="alert alert-info">{msg}</div>}
    <div className="d-flex gap-2 mb-2"><input className="form-control" style={{ maxWidth: 220 }} type="number" placeholder="C?digo pedido" value={pedido || ''} onChange={e => setPedido(Number(e.target.value))} /><button className="btn btn-primary" onClick={() => void generar()} disabled={!pedido}>Generar FEL</button></div>
    <div className="table-responsive"><table className="table table-sm align-middle"><thead><tr><th><input type="checkbox" checked={items.length>0 && seleccion.length===items.length} onChange={todos} /></th><th>ID</th><th>Pedido</th><th>Fecha</th><th>Estado</th><th className="text-end">Total</th><th></th></tr></thead><tbody>
      {items.map(f => <tr key={f.codigoFacturaFEL}><td><input type="checkbox" checked={seleccion.includes(f.codigoFacturaFEL)} onChange={() => toggle(f.codigoFacturaFEL)} /></td><td>{f.codigoFacturaFEL}</td><td>{f.codigoPedido}</td><td>{new Date(f.fechaEmision).toLocaleString()}</td><td>{f.estado}</td><td className="text-end">Q {Number(f.total).toFixed(2)}</td><td><button className="btn btn-sm btn-outline-secondary" onClick={() => void imprimir([f.codigoFacturaFEL])}>Imprimir</button></td></tr>)}
    </tbody></table></div>
  </div>
}
