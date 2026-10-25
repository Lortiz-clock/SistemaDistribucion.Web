import { useEffect, useState } from 'react'
import {
  consultarInversionInventario,
  consultarExistenciasConsolidadas
} from '../services/reporteInventarioService'
import type { InversionInventarioConsulta } from '../interfaces/InversionInventarioConsulta'
import type { ExistenciaConsolidadaConsulta } from '../interfaces/ExistenciaConsolidadaConsulta'
import { formatoQuetzales, formatoFecha } from '../utils/formato'

function ReporteInventarioPage() {
  const [inversion, setInversion] =
    useState<InversionInventarioConsulta | null>(null)
  const [existencias, setExistencias] =
    useState<ExistenciaConsolidadaConsulta[]>([])
  const [mensaje, setMensaje] = useState('')

  const cargar = async () => {
    try {
      const resInversion = await consultarInversionInventario()
      const resExistencias = await consultarExistenciasConsolidadas()

      setInversion(resInversion.exito ? resInversion.datos : null)
      setExistencias(resExistencias.exito ? (resExistencias.datos ?? []) : [])
      setMensaje(
        resInversion.exito && resExistencias.exito
          ? resExistencias.mensaje
          : resInversion.mensaje || resExistencias.mensaje
      )
    } catch {
      setInversion(null)
      setExistencias([])
      setMensaje('No fue posible comunicarse con la API.')
    }
  }

  useEffect(() => {
    cargar()
  }, [])

  return (
    <div className="container mt-4">
      <h1>Reporte de inventario</h1>
      <p>Inversión y existencias consolidadas de todas las bodegas.</p>

      {mensaje && <div className="alert alert-info">{mensaje}</div>}

      {/* INVERSIÓN */}
      <h2 className="mt-4">Inversión en inventario</h2>
      <p>
        Total:{' '}
        <strong>{formatoQuetzales(inversion?.inversionTotal ?? 0)}</strong>
      </p>
      <table className="table table-bordered table-striped">
        <thead>
          <tr>
            <th>Bodega</th>
            <th className="text-end">Inversión</th>
          </tr>
        </thead>
        <tbody>
          {inversion && inversion.porBodega.length > 0 ? (
            inversion.porBodega.map((b) => (
              <tr key={b.codigoBodega}>
                <td>{b.nombre}</td>
                <td className="text-end">{formatoQuetzales(b.inversion)}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={2} className="text-center">
                No existen datos de inversión.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* EXISTENCIAS CONSOLIDADAS */}
      <h2 className="mt-4">Existencias consolidadas por producto</h2>
      <table className="table table-bordered table-striped">
        <thead>
          <tr>
            <th>Código</th>
            <th>Producto</th>
            <th className="text-end">Cantidad total</th>
            <th className="text-center">Bodegas</th>
            <th className="text-end">Costo promedio</th>
            <th className="text-end">Valor total</th>
            <th>Vencimiento más próximo</th>
          </tr>
        </thead>
        <tbody>
          {existencias.length > 0 ? (
            existencias.map((e) => (
              <tr key={e.codigoProducto}>
                <td>{e.codigoProducto}</td>
                <td>{e.nombre}</td>
                <td className="text-end">{e.cantidadTotal}</td>
                <td className="text-center">{e.bodegasConExistencia}</td>
                <td className="text-end">{formatoQuetzales(e.costoPromedio)}</td>
                <td className="text-end">{formatoQuetzales(e.valorTotal)}</td>
                <td>{formatoFecha(e.vencimientoMasProximo)}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={7} className="text-center">
                No existen existencias registradas.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

export default ReporteInventarioPage