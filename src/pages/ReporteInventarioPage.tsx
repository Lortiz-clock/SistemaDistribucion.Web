import { useEffect, useState, useCallback } from 'react'
import { consultarInversionInventario, consultarExistenciasConsolidadas } from '../services/reporteInventarioService'
import { consultarProducto } from '../services/productoService'
import api from '../services/api'
import type { RespuestaApi } from '../interfaces/RespuestaApi'
import type { InversionInventarioConsulta } from '../interfaces/InversionInventarioConsulta'
import type { ExistenciaConsolidadaConsulta } from '../interfaces/ExistenciaConsolidadaConsulta'
import { formatoQuetzales, formatoFecha } from '../utils/formato'

interface Bodega { codigoBodega: number; nombre: string }

function ReporteInventarioPage() {
  const [inversion, setInversion] = useState<InversionInventarioConsulta | null>(null)
  const [existencias, setExistencias] = useState<ExistenciaConsolidadaConsulta[]>([])
  const [bodegas, setBodegas] = useState<Bodega[]>([])
  const [productos, setProductos] = useState<{ codigoProducto: number; nombre: string }[]>([])
  const [codigoBodega, setCodigoBodega] = useState<number | ''>('')
  const [codigoProducto, setCodigoProducto] = useState<number | ''>('')
  const [busquedaProducto, setBusquedaProducto] = useState('')
  const [mensaje, setMensaje] = useState('')

  const cargar = useCallback(async () => {
    try {
      const [resInv, resEx] = await Promise.all([
        consultarInversionInventario(codigoBodega === '' ? undefined : Number(codigoBodega)),
        consultarExistenciasConsolidadas(codigoProducto === '' ? undefined : Number(codigoProducto)),
      ])
      setInversion(resInv.exito ? resInv.datos : null)
      setExistencias(resEx.exito ? (resEx.datos ?? []) : [])
      setMensaje(resInv.exito && resEx.exito ? 'Reporte consultado correctamente.' : (resInv.mensaje || resEx.mensaje))
    } catch {
      setInversion(null); setExistencias([]); setMensaje('No fue posible comunicarse con la API.')
    }
  }, [codigoBodega, codigoProducto])

  useEffect(() => {
    void (async () => {
      try {
        const [rb, rp] = await Promise.all([
          api.get<RespuestaApi<Bodega[]>>('/api/Bodega/ConsultarBodega'),
          consultarProducto(),
        ])
        if (rb.data.exito && rb.data.datos) setBodegas(rb.data.datos)
        if (rp.exito && rp.datos) setProductos(rp.datos.map(p => ({ codigoProducto: p.codigoProducto, nombre: p.nombre })))
      } catch { /* filtros opcionales */ }
    })()
  }, [])

  useEffect(() => { void cargar() }, [cargar])

  return (
    <div className="container mt-4">
      <h1>Reporte de inventario</h1>
      <p>Inversión y existencias consolidadas de bodegas.</p>
      <div className="row g-2 mb-3">
        <div className="col-md-4">
          <label className="form-label">Bodega (inversión)</label>
          <select className="form-select" value={codigoBodega} onChange={e => setCodigoBodega(e.target.value ? Number(e.target.value) : '')}>
            <option value="">Todas</option>
            {bodegas.map(b => <option key={b.codigoBodega} value={b.codigoBodega}>{b.nombre}</option>)}
          </select>
        </div>
        <div className="col-md-5">
          <label className="form-label">Producto (existencias)</label>
          <select className="form-select" value={codigoProducto} onChange={e => setCodigoProducto(e.target.value ? Number(e.target.value) : '')}>
            <option value="">Todos con existencia</option>
            {productos.map(p => <option key={p.codigoProducto} value={p.codigoProducto}>{p.nombre}</option>)}
          </select>
        </div>
        <div className="col-md-3 d-flex align-items-end"><button className="btn btn-primary w-100" onClick={() => void cargar()}>Consultar</button></div>
      </div>
      {mensaje && <div className="alert alert-info">{mensaje}</div>}
      <h2 className="mt-4">Inversión en inventario</h2>
      <p>Total: <strong>{formatoQuetzales(inversion?.inversionTotal ?? 0)}</strong></p>
      <table className="table table-bordered table-striped"><thead><tr><th>Bodega</th><th className="text-end">Inversión</th></tr></thead><tbody>
        {inversion && inversion.porBodega.length > 0 ? inversion.porBodega.map(b => <tr key={b.codigoBodega}><td>{b.nombre}</td><td className="text-end">{formatoQuetzales(b.inversion)}</td></tr>) : <tr><td colSpan={2} className="text-center">No existen datos de inversión.</td></tr>}
      </tbody></table>
      <h2 className="mt-4">Existencias consolidadas por producto</h2>
      <div className="mb-2">
        <input
          className="form-control"
          placeholder="Buscar producto por nombre o c?digo..."
          value={busquedaProducto}
          onChange={e => setBusquedaProducto(e.target.value)}
        />
      </div>
      <div className="table-responsive" style={{ maxHeight: '55vh', overflowY: 'auto' }}>
        <table className="table table-bordered table-striped mb-0">
          <thead className="table-light" style={{ position: 'sticky', top: 0, zIndex: 1 }}>
            <tr><th>C?digo</th><th>Producto</th><th className="text-end">Cantidad total</th><th className="text-center">Bodegas</th><th className="text-end">Costo promedio</th><th className="text-end">Valor total</th><th>Vencimiento m?s pr?ximo</th></tr>
          </thead>
          <tbody>
            {(() => {
              const q = busquedaProducto.trim().toLowerCase()
              const filtradas = q ? existencias.filter(e => e.nombre.toLowerCase().includes(q) || String(e.codigoProducto).includes(q)) : existencias
              return filtradas.length > 0 ? filtradas.map(e => (
                <tr key={e.codigoProducto}><td>{e.codigoProducto}</td><td>{e.nombre}</td><td className="text-end">{e.cantidadTotal}</td><td className="text-center">{e.bodegasConExistencia}</td><td className="text-end">{formatoQuetzales(e.costoPromedio)}</td><td className="text-end">{formatoQuetzales(e.valorTotal)}</td><td>{formatoFecha(e.vencimientoMasProximo)}</td></tr>
              )) : <tr><td colSpan={7} className="text-center">No existen existencias registradas.</td></tr>
            })()}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ReporteInventarioPage
