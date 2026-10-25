import { useEffect, useState } from 'react'
import { isAxiosError } from 'axios'
import { consultarComprasPorProveedor } from '../services/reporteCompraService'
import { consultarProveedor } from '../services/proveedorServices'
import type { ReporteComprasProveedorConsulta } from '../interfaces/ReporteComprasProveedorConsulta'
import { formatoQuetzales, formatoFecha } from '../utils/formato'

interface ProveedorLista {
  codigoProveedor: number
  nombre: string
}

function ReporteComprasPage() {
  const [proveedores, setProveedores] = useState<ProveedorLista[]>([])
  const [codigoProveedor, setCodigoProveedor] = useState('')
  const [fechaInicio, setFechaInicio] = useState('')
  const [fechaFin, setFechaFin] = useState('')
  const [estado, setEstado] = useState('')
  const [reporte, setReporte] =
    useState<ReporteComprasProveedorConsulta | null>(null)
  const [mensaje, setMensaje] = useState('')

  const cargarProveedores = async () => {
    try {
      const respuesta = await consultarProveedor()
        if (respuesta.exito) {
            if (respuesta.exito) {
  setProveedores(respuesta.datos ?? [])
}
      }
    } catch {
      setProveedores([])
    }
  }

  const consultar = async () => {
    // Validación de formato (las reglas de negocio las valida el backend)
    if (fechaInicio && fechaFin && fechaInicio > fechaFin) {
      setMensaje('La fecha inicial no puede ser mayor que la fecha final.')
      return
    }

    try {
      const respuesta = await consultarComprasPorProveedor({
        codigoProveedor: codigoProveedor ? Number(codigoProveedor) : undefined,
        fechaInicio: fechaInicio || undefined,
        fechaFin: fechaFin || undefined,
        estado: estado || undefined
      })

      if (respuesta.exito) {
        setReporte(respuesta.datos)
      } else {
        setReporte(null)
      }
      setMensaje(respuesta.mensaje)
    } catch (error) {
      setReporte(null)
      if (isAxiosError(error) && error.response?.data?.mensaje) {
        setMensaje(error.response.data.mensaje)
      } else {
        setMensaje('No fue posible comunicarse con la API.')
      }
    }
  }

  const limpiar = () => {
    setCodigoProveedor('')
    setFechaInicio('')
    setFechaFin('')
    setEstado('')
    setReporte(null)
    setMensaje('')
  }

  useEffect(() => {
    cargarProveedores()
    consultar()
  }, [])

  const totalGeneral =
    reporte?.resumen.reduce((suma, r) => suma + r.totalComprado, 0) ?? 0

  return (
    <div className="container mt-4">
      <h1>Reporte de compras por proveedor</h1>
      <p>Consulta las compras filtrando por proveedor, fechas y estado.</p>

      {/* FILTROS */}
      <div className="row g-3 mb-3">
        <div className="col-md-3">
          <label className="form-label">Proveedor</label>
          <select
            className="form-select"
            value={codigoProveedor}
            onChange={(e) => setCodigoProveedor(e.target.value)}
          >
            <option value="">Todos</option>
            {proveedores.map((p) => (
              <option key={p.codigoProveedor} value={p.codigoProveedor}>
                {p.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-3">
          <label className="form-label">Fecha inicial</label>
          <input
            type="date"
            className="form-control"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
          />
        </div>

        <div className="col-md-3">
          <label className="form-label">Fecha final</label>
          <input
            type="date"
            className="form-control"
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
          />
        </div>

        <div className="col-md-3">
          <label className="form-label">Estado</label>
          <select
            className="form-select"
            value={estado}
            onChange={(e) => setEstado(e.target.value)}
          >
            <option value="">Todos</option>
            <option value="Pendiente">Pendiente</option>
            <option value="Recepcionada">Recepcionada</option>
          </select>
        </div>
      </div>

      <div className="mb-3">
        <button className="btn btn-primary me-2" onClick={consultar}>
          Consultar
        </button>
        <button className="btn btn-outline-secondary" onClick={limpiar}>
          Limpiar
        </button>
      </div>

      {mensaje && <div className="alert alert-info">{mensaje}</div>}

      {/* RESUMEN POR PROVEEDOR */}
      <h2 className="mt-4">Resumen por proveedor</h2>
      <table className="table table-bordered table-striped">
        <thead>
          <tr>
            <th>Proveedor</th>
            <th>Órdenes</th>
            <th>Pendientes</th>
            <th>Recepcionadas</th>
            <th className="text-end">Total comprado</th>
          </tr>
        </thead>
        <tbody>
          {reporte && reporte.resumen.length > 0 ? (
            <>
              {reporte.resumen.map((r) => (
                <tr key={r.codigoProveedor}>
                  <td>{r.proveedor}</td>
                  <td>{r.cantidadOrdenes}</td>
                  <td>{r.pendientes}</td>
                  <td>{r.recepcionadas}</td>
                  <td className="text-end">{formatoQuetzales(r.totalComprado)}</td>
                </tr>
              ))}
              <tr>
                <td colSpan={4} className="text-end fw-bold">Total general</td>
                <td className="text-end fw-bold">{formatoQuetzales(totalGeneral)}</td>
              </tr>
            </>
          ) : (
            <tr>
              <td colSpan={5} className="text-center">
                No existen datos para los filtros seleccionados.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* DETALLE DE ÓRDENES */}
      <h2 className="mt-4">Detalle de órdenes</h2>
      <table className="table table-bordered table-striped">
        <thead>
          <tr>
            <th>Código</th>
            <th>Proveedor</th>
            <th>Fecha emisión</th>
            <th>Fecha recepción</th>
            <th>Estado</th>
            <th className="text-end">Total</th>
          </tr>
        </thead>
        <tbody>
          {reporte && reporte.ordenes.length > 0 ? (
            reporte.ordenes.map((o) => (
              <tr key={o.codigoCompra}>
                <td>{o.codigoCompra}</td>
                <td>{o.proveedor}</td>
                <td>{formatoFecha(o.fechaEmision)}</td>
                <td>{formatoFecha(o.fechaRecepcionReal)}</td>
                <td>{o.estado}</td>
                <td className="text-end">{formatoQuetzales(o.totalOrden)}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6} className="text-center">
                No existen órdenes para los filtros seleccionados.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

export default ReporteComprasPage