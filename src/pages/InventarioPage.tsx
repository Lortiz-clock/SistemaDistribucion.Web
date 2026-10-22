import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { consultarInventario } from '../services/inventarioService'
import type { InventarioConsultar } from '../interfaces/InventarioConsulta'
import './InventarioPage.css'

const formatearFecha = (fecha: string | null) => {
  if (!fecha) return '—'
  const [anio, mes, dia] = fecha.substring(0, 10).split('-')
  return `${dia}/${mes}/${anio}`
}

export default function InventarioPage() {
  const [inventario, setInventario] = useState<InventarioConsultar[]>([])
  const [mensaje, setMensaje] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [bodegaFiltro, setBodegaFiltro] = useState('')
  const bodegas = Array.from(new Set(inventario.map((item) => item.bodega))).sort()

  const inventarioFiltrado = inventario.filter(
  (item) =>
    (bodegaFiltro === '' || item.bodega === bodegaFiltro) &&
    (item.producto.toLowerCase().includes(busqueda.toLowerCase()) ||
      item.bodega.toLowerCase().includes(busqueda.toLowerCase()))
)


  const cargarInventario = async () => {
    try {
      const respuesta = await consultarInventario()

      if (respuesta.exito && Array.isArray(respuesta.datos)) {
        setInventario(respuesta.datos)
        setMensaje(respuesta.mensaje)
      } else {
        setInventario([])
        setMensaje(respuesta.mensaje)
      }
    } catch {
      setInventario([])
      setMensaje('No fue posible comunicarse con la API.')
    }
  }

  useEffect(() => {
    cargarInventario()
  }, [])

  return (
    <div className="inventario-page pagina-lista">
      <div className="inventario-container pagina-lista-interna">
        {/* ENCABEZADO */}
        <div className="inventario-header">
          <h1 className="inventario-title">Consulta de Inventario</h1>
          <p className="inventario-subtitle">
            Consulta el stock disponible de productos por bodega.
          </p>
        </div>

        {/* TARJETA */}
        <div className="inventario-card tarjeta-lista">
          <div className="inventario-card-header">
            <h2 className="inventario-card-title">Inventarios registrados</h2>
            <div className="d-flex align-items-center gap-3">
              <span className="inventario-total">
                Total: {inventario.length}
              </span>
              
            </div>
          </div>

          {/* MENSAJE */}
          {mensaje && (
            <div className="alert alert-info inventario-mensaje" role="alert">
              {mensaje}
            </div>
          )}

          {/* BUSCADOR */}
         <div className="mb-3 flex-shrink-0 d-flex gap-2">
  <input
    type="text"
    className="form-control"
    placeholder="Buscar por producto o bodega..."
    value={busqueda}
    onChange={(e) => setBusqueda(e.target.value)}
  />
  <select
    className="form-select w-auto"
    value={bodegaFiltro}
    onChange={(e) => setBodegaFiltro(e.target.value)}
  >
    <option value="">Todas las bodegas</option>
    {bodegas.map((b) => (
      <option key={b} value={b}>{b}</option>
    ))}
  </select>
  <Link
    to="/dashboard/inventario/ajustes"
    className="btn btn-primary text-nowrap"
  >
    Ajustar inventario
  </Link>
</div>

          {/* TABLA */}
          <div className="inventario-table-container tabla-scroll">
            <table className="table table-bordered inventario-table">
              <thead>
                <tr>
                  <th className="col-producto">Producto</th>
                  <th className="col-bodega">Bodega</th>
                  <th className="col-stock">Stock</th>
                  <th className="col-vencimiento">Próx. Vencimiento</th>
                </tr>
              </thead>

              <tbody>
                {inventarioFiltrado.length > 0 ? (
                  inventarioFiltrado.map((item, index) => (
                    <tr key={`${item.producto}-${item.bodega}-${index}`}>
                      <td className="col-producto">{item.producto}</td>
                      <td className="col-bodega">{item.bodega}</td>
                      <td className="col-stock">
                        <span
                          className={`badge ${
                            item.stock > 10
                              ? 'bg-success'
                              : item.stock > 0
                              ? 'bg-warning text-dark'
                              : 'bg-danger'
                          }`}
                        >
                          {item.stock}
                        </span>
                      </td>
                      <td className="col-vencimiento">
                        {formatearFecha(item.proximoVencimiento)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="sin-registros text-center">
                      No existen registros de inventario.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}