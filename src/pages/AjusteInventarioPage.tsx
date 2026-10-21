import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  consultarLotes,
  ajustarInventario,
  consultarHistorial
} from '../services/inventarioAjusteService'
import type { InventarioLote, InventarioHistorial } from '../interfaces/InventarioAjuste'
import './InventarioPage.css' // se reutilizan los estilos de Inventario

const formatearFecha = (fecha: string | null) => {
  if (!fecha) return '—'
  const [anio, mes, dia] = fecha.substring(0, 10).split('-')
  return `${dia}/${mes}/${anio}`
}

const formatearFechaHora = (fecha: string) => {
  if (!fecha) return '—'
  const [parteFecha, parteHora] = fecha.split('T')
  return `${formatearFecha(parteFecha)} ${parteHora?.substring(0, 5) ?? ''}`
}

// Intenta sacar el código de usuario del token (claims comunes)
const obtenerCodigoUsuario = (): number | null => {
  try {
    const token = localStorage.getItem('token')
    if (!token) return null
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    const payload = JSON.parse(atob(base64))
    const valor =
      payload.codigoUsuario ??
      payload.CodigoUsuario ??
      payload.nameid ??
      payload.sub ??
      payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier']
    const numero = Number(valor)
    return Number.isInteger(numero) && numero > 0 ? numero : null
  } catch {
    return null
  }
}

// Extrae el motivo legible del error que devuelve la API
const extraerError = (error: any): string => {
  const detalle: string | undefined = error?.response?.data?.detalle
  if (detalle) {
    const indice = detalle.indexOf('Mensaje: ')
    return indice >= 0 ? detalle.substring(indice + 9) : detalle
  }
  return 'No fue posible comunicarse con la API.'
}

export default function AjusteInventarioPage() {
  const [pestana, setPestana] = useState<'lotes' | 'historial'>('lotes')

  const [lotes, setLotes] = useState<InventarioLote[]>([])
  const [historial, setHistorial] = useState<InventarioHistorial[]>([])
  const [busqueda, setBusqueda] = useState('')
  const [bodegaFiltro, setBodegaFiltro] = useState('')

  const [mensaje, setMensaje] = useState('')
  const [exito, setExito] = useState<boolean | null>(null)

  // Modal de ajuste
  const [loteSeleccionado, setLoteSeleccionado] = useState<InventarioLote | null>(null)
  const [tipoAjuste, setTipoAjuste] = useState<'Descuento' | 'Incremento'>('Descuento')
  const [cantidad, setCantidad] = useState('')
  const [motivo, setMotivo] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [errorModal, setErrorModal] = useState('')

  const bodegas = Array.from(new Set(lotes.map((l) => l.bodega))).sort()

  const lotesFiltrados = lotes.filter(
    (l) =>
      (bodegaFiltro === '' || l.bodega === bodegaFiltro) &&
      (l.producto.toLowerCase().includes(busqueda.toLowerCase()) ||
        l.bodega.toLowerCase().includes(busqueda.toLowerCase()))
  )

  const historialFiltrado = historial.filter(
    (h) =>
      (bodegaFiltro === '' || h.bodega === bodegaFiltro) &&
      (h.producto.toLowerCase().includes(busqueda.toLowerCase()) ||
        h.motivo.toLowerCase().includes(busqueda.toLowerCase()) ||
        h.usuario.toLowerCase().includes(busqueda.toLowerCase()))
  )

  const cargarLotes = async () => {
    try {
      const respuesta = await consultarLotes()
      setLotes(respuesta.exito && Array.isArray(respuesta.datos) ? respuesta.datos : [])
    } catch {
      setLotes([])
      setMensaje('No fue posible comunicarse con la API.')
      setExito(false)
    }
  }

  const cargarHistorial = async () => {
    try {
      const respuesta = await consultarHistorial()
      setHistorial(respuesta.exito && Array.isArray(respuesta.datos) ? respuesta.datos : [])
    } catch {
      setHistorial([])
      setMensaje('No fue posible comunicarse con la API.')
      setExito(false)
    }
  }

  useEffect(() => {
    cargarLotes()
    cargarHistorial()
  }, [])

  const abrirModal = (lote: InventarioLote) => {
    setLoteSeleccionado(lote)
    setTipoAjuste('Descuento')
    setCantidad('')
    setMotivo('')
    setErrorModal('')
  }

  const cerrarModal = () => {
    setLoteSeleccionado(null)
    setErrorModal('')
  }

  const cantidadNumero = Number(cantidad)
  const cantidadResultante =
    loteSeleccionado && cantidadNumero > 0
      ? tipoAjuste === 'Descuento'
        ? loteSeleccionado.cantidad - cantidadNumero
        : loteSeleccionado.cantidad + cantidadNumero
      : null

  const guardarAjuste = async (evento: React.FormEvent) => {
    evento.preventDefault()
    if (!loteSeleccionado) return

    if (!Number.isInteger(cantidadNumero) || cantidadNumero <= 0) {
      setErrorModal('La cantidad debe ser un número entero mayor a cero.')
      return
    }
    if (motivo.trim() === '') {
      setErrorModal('El motivo del ajuste es obligatorio.')
      return
    }
    if (cantidadResultante !== null && cantidadResultante < 0) {
      setErrorModal('El descuento es mayor a la cantidad disponible en el lote.')
      return
    }

    setEnviando(true)
    try {
      const respuesta = await ajustarInventario({
        codigoProductoBodega: loteSeleccionado.codigoProductoBodega,
        tipoAjuste,
        cantidad: cantidadNumero,
        motivo: motivo.trim(),
        codigoUsuario: obtenerCodigoUsuario()
      })

      if (respuesta.exito) {
        setMensaje(respuesta.mensaje)
        setExito(true)
        cerrarModal()
        await cargarLotes()
        await cargarHistorial()
      } else {
        setErrorModal(respuesta.mensaje)
      }
    } catch (error) {
      setErrorModal(extraerError(error))
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="inventario-page pagina-lista">
      <div className="inventario-container pagina-lista-interna">
        <div className="inventario-header">
          <h1 className="inventario-title">Ajustes de Inventario</h1>
          <p className="inventario-subtitle">
            Ajusta la cantidad de un lote y deja registrado el motivo.
          </p>
        </div>

        <div className="inventario-card tarjeta-lista">
          <div className="inventario-card-header">
            <h2 className="inventario-card-title">
              {pestana === 'lotes' ? 'Lotes de inventario' : 'Historial de ajustes'}
            </h2>
            <div className="d-flex align-items-center gap-3">
              <span className="inventario-total">
                Total: {pestana === 'lotes' ? lotesFiltrados.length : historialFiltrado.length}
              </span>
              <Link to="/dashboard/inventario" className="btn btn-secondary btn-sm">
                Volver a Inventario
              </Link>
            </div>
          </div>

          {mensaje && (
            <div
              className={`alert ${exito ? 'alert-success' : 'alert-danger'} inventario-mensaje`}
              role="alert"
            >
              {mensaje}
            </div>
          )}

          {/* PESTAÑAS */}
          <ul className="nav nav-tabs mb-3">
            <li className="nav-item">
              <button
                className={`nav-link ${pestana === 'lotes' ? 'active' : ''}`}
                onClick={() => setPestana('lotes')}
              >
                Lotes
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${pestana === 'historial' ? 'active' : ''}`}
                onClick={() => {
                  setPestana('historial')
                  cargarHistorial()
                }}
              >
                Historial
              </button>
            </li>
          </ul>

          {/* FILTROS */}
          <div className="mb-3 flex-shrink-0 d-flex gap-2">
            <input
              type="text"
              className="form-control"
              placeholder={
                pestana === 'lotes'
                  ? 'Buscar por producto o bodega...'
                  : 'Buscar por producto, motivo o usuario...'
              }
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
          </div>

          {/* TABLA DE LOTES */}
          {pestana === 'lotes' && (
            <div className="inventario-table-container tabla-scroll">
              <table className="table table-bordered inventario-table">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Bodega</th>
                    <th>Compra #</th>
                    <th>Cantidad</th>
                    <th>Vencimiento</th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {lotesFiltrados.length > 0 ? (
                    lotesFiltrados.map((l) => (
                      <tr key={l.codigoProductoBodega}>
                        <td>{l.producto}</td>
                        <td>{l.bodega}</td>
                        <td>{l.codigoDetalle}</td>
                        <td>
                          <span
                            className={`badge ${
                              l.cantidad > 10 ? 'bg-success'
                              : l.cantidad > 0 ? 'bg-warning text-dark'
                              : 'bg-danger'
                            }`}
                          >
                            {l.cantidad}
                          </span>
                        </td>
                        <td>{formatearFecha(l.fechaVencimiento)}</td>
                        <td>
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => abrirModal(l)}
                          >
                            Ajustar
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="sin-registros text-center">
                        No existen lotes de inventario.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* TABLA DE HISTORIAL */}
          {pestana === 'historial' && (
            <div className="inventario-table-container tabla-scroll">
              <table className="table table-bordered inventario-table">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Producto</th>
                    <th>Bodega</th>
                    <th>Tipo</th>
                    <th>Cantidad</th>
                    <th>Antes → Después</th>
                    <th>Motivo</th>
                    <th>Usuario</th>
                  </tr>
                </thead>
                <tbody>
                  {historialFiltrado.length > 0 ? (
                    historialFiltrado.map((h) => (
                      <tr key={h.codigoAjuste}>
                        <td>{formatearFechaHora(h.fechaAjuste)}</td>
                        <td>{h.producto}</td>
                        <td>{h.bodega}</td>
                        <td>
                          <span
                            className={`badge ${
                              h.tipoAjuste === 'Descuento' ? 'bg-danger' : 'bg-success'
                            }`}
                          >
                            {h.tipoAjuste}
                          </span>
                        </td>
                        <td>{h.cantidad}</td>
                        <td>{h.cantidadAnterior} → {h.cantidadNueva}</td>
                        <td>{h.motivo}</td>
                        <td>{h.usuario || '—'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="sin-registros text-center">
                        Aún no hay ajustes registrados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* MODAL DE AJUSTE */}
      {loteSeleccionado && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <form className="modal-content p-3" onSubmit={guardarAjuste}>
              <h5>Ajustar inventario</h5>
              <hr />
              <p className="mb-1"><strong>Producto:</strong> {loteSeleccionado.producto}</p>
              <p className="mb-1"><strong>Bodega:</strong> {loteSeleccionado.bodega}</p>
              <p className="mb-3">
                <strong>Cantidad actual del lote:</strong> {loteSeleccionado.cantidad}
              </p>

              {errorModal && <div className="alert alert-danger">{errorModal}</div>}

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Tipo de ajuste</label>
                  <select
                    className="form-select"
                    value={tipoAjuste}
                    onChange={(e) => setTipoAjuste(e.target.value as 'Descuento' | 'Incremento')}
                  >
                    <option value="Descuento">Descuento (baja)</option>
                    <option value="Incremento">Incremento (sube)</option>
                  </select>
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Cantidad (unidades)</label>
                  <input
                    type="number"
                    min={1}
                    className="form-control"
                    value={cantidad}
                    onChange={(e) => setCantidad(e.target.value)}
                    required
                  />
                </div>
              </div>

              {cantidadResultante !== null && (
                <p className={cantidadResultante < 0 ? 'text-danger' : 'text-muted'}>
                  Quedaría en: <strong>{cantidadResultante}</strong> unidades
                </p>
              )}

              <div className="mb-3">
                <label className="form-label">Motivo del ajuste</label>
                <textarea
                  className="form-control"
                  rows={3}
                  maxLength={255}
                  placeholder="Ej.: producto dañado, merma, error de conteo..."
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  required
                />
              </div>

              <div className="text-end mt-2 d-flex gap-2 justify-content-end">
                <button type="button" className="btn btn-secondary" onClick={cerrarModal}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" disabled={enviando}>
                  {enviando ? 'Guardando...' : 'Guardar ajuste'}
                </button>
              </div>
            </form>
            </div>
        </div>
      )}
    </div>
  )
}
