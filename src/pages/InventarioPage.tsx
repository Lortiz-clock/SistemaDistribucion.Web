import { Link } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { consultarInventario, consultarLotes } from '../services/inventarioService'
import { consultarProducto } from '../services/productoService'
import type { InventarioConsultar } from '../interfaces/InventarioConsulta'
import type { InventarioLote } from '../interfaces/InventarioAjuste'
import './InventarioPage.css'

const formatearFecha = (fecha: string | null | undefined) => {
  if (!fecha) return '—'
  const [anio, mes, dia] = fecha.substring(0, 10).split('-')
  return `${dia}/${mes}/${anio}`
}

const normalizar = (t: string | null | undefined) =>
  (t ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()

const convertirACajas = (totalUnidades: number, unidadesPorCaja: number) => {
  if (!unidadesPorCaja || unidadesPorCaja <= 0) {
    return { cajas: 0, sueltas: totalUnidades }
  }
  return {
    cajas: Math.floor(totalUnidades / unidadesPorCaja),
    sueltas: totalUnidades % unidadesPorCaja
  }
}

export default function InventarioPage() {
  const [inventario, setInventario] = useState<InventarioConsultar[]>([])
  const [mensaje, setMensaje] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [bodegaFiltro, setBodegaFiltro] = useState('')

  // nombre de producto (normalizado) -> { codigoProducto, unidadesCaja }
  const [catalogo, setCatalogo] = useState<
    Map<string, { codigoProducto: number; unidadesCaja: number }>
  >(new Map())

  // Modal de lotes
  const [itemLotes, setItemLotes] = useState<InventarioConsultar | null>(null)
  const [lotes, setLotes] = useState<InventarioLote[]>([])
  const [cargandoLotes, setCargandoLotes] = useState(false)
  const [errorLotes, setErrorLotes] = useState('')
  const [busquedaLote, setBusquedaLote] = useState('')

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
      } else {
        setInventario([])
      }
      setMensaje(respuesta.mensaje)
    } catch {
      setInventario([])
      setMensaje('No fue posible comunicarse con la API.')
    }
  }

  const cargarCatalogo = async () => {
    try {
      const respuesta = await consultarProducto()
      if (respuesta.exito && Array.isArray(respuesta.datos)) {
        const mapa = new Map<string, { codigoProducto: number; unidadesCaja: number }>()
        respuesta.datos.forEach((p) =>
          mapa.set(normalizar(p.nombre), {
            codigoProducto: p.codigoProducto,
            unidadesCaja: p.unidadesCaja
          })
        )
        setCatalogo(mapa)
      }
    } catch {
      // si falla, el inventario se muestra igual, solo sin conversión a cajas
    }
  }

  useEffect(() => {
    cargarInventario()
    cargarCatalogo()
  }, [])

  const infoProducto = (nombre: string) => catalogo.get(normalizar(nombre))

  const abrirLotes = async (item: InventarioConsultar) => {
    setItemLotes(item)
    setLotes([])
    setErrorLotes('')
    setBusquedaLote('')

    try {
      setCargandoLotes(true)
      // Si conocemos el código del producto, filtramos en la API; si no, traemos todo
      const info = infoProducto(item.producto)
      const respuesta = await consultarLotes(info?.codigoProducto)

      if (respuesta.exito && Array.isArray(respuesta.datos)) {
        // Solo los lotes de este producto en esta bodega
        setLotes(
          respuesta.datos.filter(
            (l) =>
              normalizar(l.producto) === normalizar(item.producto) &&
              l.bodega === item.bodega
          )
        )
      } else {
        setErrorLotes(respuesta.mensaje || 'No se encontraron lotes.')
      }
    } catch {
      setErrorLotes('No fue posible comunicarse con la API.')
    } finally {
      setCargandoLotes(false)
    }
  }

  const cerrarLotes = () => {
    setItemLotes(null)
    setLotes([])
  }

  const lotesFiltrados = useMemo(() => {
    const texto = normalizar(busquedaLote)
    return lotes.filter(
      (l) =>
        String(l.codigoDetalle).includes(texto) ||
        normalizar(formatearFecha(l.fechaVencimiento)).includes(texto) ||
        normalizar(l.estado).includes(texto)
    )
  }, [lotes, busquedaLote])

  const unidadesCajaModal = itemLotes ? infoProducto(itemLotes.producto)?.unidadesCaja ?? 0 : 0

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
              <span className="inventario-total">Total: {inventario.length}</span>
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
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
            <Link to="/dashboard/inventario/ajustes" className="btn btn-primary text-nowrap">
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
                  <th className="text-center">Cajas</th>
                  <th className="col-stock">Unidades</th>
                  <th className="col-vencimiento">Próx. Vencimiento</th>
                  <th className="text-center">Lotes</th>
                </tr>
              </thead>

              <tbody>
                {inventarioFiltrado.length > 0 ? (
                  inventarioFiltrado.map((item, index) => {
                    const info = infoProducto(item.producto)
                    const { cajas, sueltas } = convertirACajas(
                      item.stock,
                      info?.unidadesCaja ?? 0
                    )
                    return (
                      <tr key={`${item.producto}-${item.bodega}-${index}`}>
                        <td className="col-producto">{item.producto}</td>
                        <td className="col-bodega">{item.bodega}</td>
                        <td className="text-center">
                          {info ? (
                            <>
                              <strong>{cajas}</strong>
                              {sueltas > 0 && (
                                <small className="text-muted"> + {sueltas} sueltas</small>
                              )}
                            </>
                          ) : (
                            '—'
                          )}
                        </td>
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
                        <td className="text-center">
                          <button
                            className="btn btn-outline-primary btn-sm"
                            onClick={() => abrirLotes(item)}
                          >
                            Ver lotes
                          </button>
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="sin-registros text-center">
                      No existen registros de inventario.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL DE LOTES */}
      {itemLotes && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-scrollable">
            <div className="modal-content p-3">
              <h5 className="mb-0">Lotes de {itemLotes.producto}</h5>
              <small className="text-muted">Bodega: {itemLotes.bodega}</small>
              <hr />

              <input
                type="text"
                className="form-control mb-3"
                placeholder="Buscar por lote, vencimiento o estado..."
                value={busquedaLote}
                onChange={(e) => setBusquedaLote(e.target.value)}
              />

              {errorLotes && <div className="alert alert-warning">{errorLotes}</div>}

              <table className="table table-bordered table-sm mb-0">
                <thead>
                  <tr>
                    <th className="text-center">Lote</th>
                    <th className="text-center">Cajas</th>
                    <th className="text-center">Unidades</th>
                    <th>Vencimiento</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {cargandoLotes ? (
                    <tr>
                      <td colSpan={5} className="text-center">
                        Cargando lotes...
                      </td>
                    </tr>
                  ) : lotesFiltrados.length > 0 ? (
                    lotesFiltrados.map((l) => {
                      const { cajas, sueltas } = convertirACajas(l.cantidad, unidadesCajaModal)
                      return (
                        <tr key={l.codigoDetalle}>
                          <td className="text-center">{l.codigoDetalle}</td>
                          <td className="text-center">
                            {cajas}
                            {sueltas > 0 && (
                              <small className="text-muted"> + {sueltas} sueltas</small>
                            )}
                          </td>
                          <td className="text-center fw-bold">{l.cantidad}</td>
                          <td>{formatearFecha(l.fechaVencimiento)}</td>
                          <td>{l.estado}</td>
                        </tr>
                      )
                    })
                  ) : (
                    !errorLotes && (
                      <tr>
                        <td colSpan={5} className="sin-registros text-center">
                          No hay lotes para mostrar.
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>

              <div className="text-end mt-3">
                <button className="btn btn-secondary" onClick={cerrarLotes}>
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}