import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  abrirRecepcion, buscarRecepcion, cerrarRecepcion, cancelarRecepcion
} from '../services/recepcionService'
import {
  buscarRecepcionDetalle, agregarDetalleRecepcion, resolverRecepcionDetalle,
  buscarPendientesAutorizacion
} from '../services/recepcionDetalleService'
import { consultarOrdenesCompra } from '../services/ordenCompraService'
import type { RecepcionDetalleConsulta, RecepcionPendiente } from '../interfaces/Recepcion'
import './RecepcionPage.css'
import { tienePermiso } from '../utils/permisos'

function RecepcionPage() {
  const navigate = useNavigate()

  // ═══ FASE 1: ABRIR ═══
  const [ordenesPendientes, setOrdenesPendientes] = useState<any[]>([])
  const [codigoCompra, setCodigoCompra] = useState(0)
  const [codigoBodega, setCodigoBodega] = useState(0)
  const [abriendo, setAbriendo] = useState(false)

  // ═══ FASE 2: REGISTRAR ═══
  const [codigoRecepcion, setCodigoRecepcion] = useState(0)
  const [recepcion, setRecepcion] = useState<any>(null)
  const [detalles, setDetalles] = useState<RecepcionDetalleConsulta[]>([])
  const [filaEnEdicion, setFilaEnEdicion] = useState<{
    codigoDetalle: number
    cajas: number
    sueltas: number
    precioFacturado: number
    fechaVencimiento: string
    comentario: string
  } | null>(null)

  // ═══ PANEL DE PENDIENTES (solo admin) ═══
  const [pendientes, setPendientes] = useState<RecepcionPendiente[]>([])

  const [mensaje, setMensaje] = useState('')
  const [exito, setExito] = useState<boolean | null>(null)

  // ⚠️ TODO: reemplazar por el código real del empleado logueado
  const codigoEmpleado = 1

  // Permiso del rol para resolver líneas (solo el admin lo tiene)
  const puedeResolver = tienePermiso('/dashboard/recepcion', 'permiteEditar')

  // ═══ CARGA INICIAL: órdenes pendientes + panel de autorizaciones ═══
  useEffect(() => {
    const cargar = async () => {
      try {
        const respuesta = await consultarOrdenesCompra()
        if (respuesta.exito && respuesta.datos) {
          setOrdenesPendientes(
            respuesta.datos.filter((o) => o.estado === 'Pendiente' || o.estado === 'EnProceso')
          )
        }
      } catch {
        setMensaje('No fue posible comunicarse con la API.')
        setExito(false)
      }
    }
    cargar()
  }, [])

  useEffect(() => {
    if (!puedeResolver) return
    const cargarPendientes = async () => {
      try {
        const respuesta = await buscarPendientesAutorizacion()
        if (respuesta.exito && respuesta.datos) {
          setPendientes(respuesta.datos)
        }
      } catch {
        // sin permiso o error: simplemente no muestra el panel
      }
    }
    cargarPendientes()
  }, [puedeResolver])

  // ⚠️ Simplificación V1: bodegas fijas. Si tienes servicio de bodegas, úsalo.
  const bodegas = [
    { codigoBodega: 1, nombre: 'Bodega Central' },
    { codigoBodega: 2, nombre: 'Bodega Contable' },
    { codigoBodega: 3, nombre: 'Bodega No Contable' }
  ]

  // ═══ ABRIR RECEPCIÓN (fase 1 → fase 2) ═══
  const abrir = async () => {
    if (codigoCompra === 0 || codigoBodega === 0) {
      setMensaje('Selecciona la orden y la bodega destino.')
      setExito(false)
      return
    }

    setAbriendo(true)
    try {
      const respuesta = await abrirRecepcion({
        codigoCompra,
        codigoEmpleado,
        codigoBodega
      })

      if (respuesta.exito && respuesta.datos) {
        await cargarRecepcion(respuesta.datos)
      } else {
        setMensaje(respuesta.mensaje || 'No se pudo abrir la recepción.')
        setExito(false)
      }
    } catch {
      setMensaje('No fue posible comunicarse con la API.')
      setExito(false)
    } finally {
      setAbriendo(false)
    }
  }

  // ═══ CARGAR una recepción (encabezado + líneas en paralelo) ═══
  const cargarRecepcion = async (codigo: number) => {
    try {
      const [respRecepcion, respDetalle] = await Promise.all([
        buscarRecepcion(codigo),
        buscarRecepcionDetalle(codigo)
      ])

      if (respRecepcion.exito && respRecepcion.datos) {
        setRecepcion(respRecepcion.datos)
        setCodigoRecepcion(respRecepcion.datos.codigoRecepcion)
      }
      if (respDetalle.exito && respDetalle.datos) {
        setDetalles(respDetalle.datos)
      }
      setMensaje('')
    } catch {
      setMensaje('No fue posible cargar la recepción.')
      setExito(false)
    }
  }

  // ═══ EMPEZAR A EDITAR una fila (precarga con lo pedido) ═══
  const empezarEdicion = (d: RecepcionDetalleConsulta) => {
    setFilaEnEdicion({
      codigoDetalle: d.codigoDetalle,
      cajas: Math.floor(d.cantidadPedida / (d.unidadesCaja || 1)),
      sueltas: d.cantidadPedida % (d.unidadesCaja || 1),
      precioFacturado: d.precioAcordado,
      fechaVencimiento: d.fechaVencimiento ?? '',
      comentario: ''
    })
  }

  // ═══ GUARDAR una fila (registrar el producto) ═══
  const guardarFila = async () => {
    if (!filaEnEdicion) return

    const unidadesTotales =
      (filaEnEdicion.cajas * (unidadesPorCaja(filaEnEdicion.codigoDetalle) || 1)) +
      filaEnEdicion.sueltas

    if (unidadesTotales <= 0) {
      setMensaje('La cantidad recibida debe ser mayor a cero.')
      setExito(false)
      return
    }

    try {
      const respuesta = await agregarDetalleRecepcion({
        codigoRecepcion,
        codigoDetalle: filaEnEdicion.codigoDetalle,
        cantidadRecibidaUnidades: unidadesTotales,
        precioFacturado: filaEnEdicion.precioFacturado,
        fechaVencimiento: filaEnEdicion.fechaVencimiento || undefined,
        comentario: filaEnEdicion.comentario || undefined
      })

      if (respuesta.exito && respuesta.datos) {
        if (respuesta.datos.requiereAutorizacion) {
          setMensaje('⚠️ El precio facturado difiere del acordado. Quedó pendiente de autorización del administrador.')
          setExito(false)
        } else {
          setMensaje('Producto ingresado a bodega.')
          setExito(true)
        }
        setFilaEnEdicion(null)
        await cargarRecepcion(codigoRecepcion)
      } else {
        setMensaje(respuesta.mensaje || 'No se pudo registrar el producto.')
        setExito(false)
      }
    } catch {
      setMensaje('No fue posible comunicarse con la API.')
      setExito(false)
    }
  }

  // ═══ RESOLVER (admin): autorizar o rechazar ═══
  // Recibe datos sueltos para servir a la tabla Y al panel de pendientes
  const resolver = async (codigoRecepcionDetalle: number, precioFacturado: number, autorizado: boolean) => {
    try {
      const respuesta = await resolverRecepcionDetalle({
        codigoRecepcionDetalle,
        autorizado,
        // Autorizar = aceptar el precio de la factura → el detalle se corrige a ese precio
        nuevoPrecioCosto: autorizado ? precioFacturado : undefined
      })

      if (respuesta.exito) {
        setMensaje(autorizado ? 'Producto autorizado e ingresado.' : 'Producto rechazado.')
        setExito(true)
        // Refresca el panel de pendientes (si es admin)
        if (puedeResolver) {
          const p = await buscarPendientesAutorizacion()
          if (p.exito && p.datos) setPendientes(p.datos)
        }
        // Refresca la tabla si hay una recepción abierta
        if (codigoRecepcion > 0) await cargarRecepcion(codigoRecepcion)
      } else {
        setMensaje(respuesta.mensaje || 'No se pudo resolver la línea.')
        setExito(false)
      }
    } catch {
      setMensaje('No fue posible comunicarse con la API.')
      setExito(false)
    }
  }

  // ═══ CERRAR RECEPCIÓN ═══
  const cerrar = async () => {
    if (!window.confirm('¿Cerrar la recepción? Los productos autorizados ingresarán a bodega.')) return

    try {
      const respuesta = await cerrarRecepcion(codigoRecepcion)
      if (respuesta.exito) {
        setMensaje('✅ Recepción cerrada. Inventario actualizado.')
        setExito(true)
        await cargarRecepcion(codigoRecepcion)
      } else {
        setMensaje(respuesta.mensaje || 'No se pudo cerrar la recepción.')
        setExito(false)
      }
    } catch {
      setMensaje('No fue posible comunicarse con la API.')
      setExito(false)
    }
  }

  // ═══ CANCELAR RECEPCIÓN (orden equivocada) ═══
  const cancelar = async () => {
    if (!window.confirm('¿Cancelar la recepción? Se perderán los registros y la orden volverá a Pendiente.')) return

    try {
      const respuesta = await cancelarRecepcion(codigoRecepcion)
      if (respuesta.exito) {
        setRecepcion(null)
        setDetalles([])
        setCodigoRecepcion(0)
        setMensaje('Recepción cancelada. La orden volvió a Pendiente.')
        setExito(true)
        const r = await consultarOrdenesCompra()
        if (r.exito && r.datos) {
          setOrdenesPendientes(r.datos.filter((o) => o.estado === 'Pendiente' || o.estado === 'EnProceso'))
        }
      } else {
        setMensaje(respuesta.mensaje || 'No se pudo cancelar la recepción.')
        setExito(false)
      }
    } catch {
      setMensaje('No fue posible comunicarse con la API.')
      setExito(false)
    }
  }

  // Helper: el factor de conversión de una línea (del catálogo)
  const unidadesPorCaja = (codigoDetalle: number): number => {
    const d = detalles.find((x) => x.codigoDetalle === codigoDetalle)
    return d?.unidadesCaja || 1
  }

  const totalRecibido = detalles
    .filter((d) => d.estadoDetalle === 'Ingresado')
    .reduce((total, d) => total + (d.cantidadRecibidaUnidades * d.precioAcordado), 0)

  // ══════════ RENDER ══════════
  return (
    <div className="recepcion-page">
      <div className="recepcion-container">

        <div className="recepcion-header">
          <h1 className="recepcion-title">Recepción de Mercadería</h1>
          <p className="recepcion-subtitle">Registra la mercadería que llega de los proveedores.</p>
        </div>

        <div className="recepcion-card">

          {mensaje && (
            <div className={exito ? 'alert alert-success mx-3 mt-3' : 'alert alert-danger mx-3 mt-3'}>
              {mensaje}
            </div>
          )}

          {/* ═════ PANEL DE PENDIENTES (solo admin) ═════ */}
          {puedeResolver && pendientes.length > 0 && (
            <div className="alert alert-warning mx-3 mt-3 mb-0">
              <h6 className="alert-heading">
                ⚠️ Productos pendientes de autorización ({pendientes.length})
              </h6>
              <div className="table-responsive">
                <table className="table table-sm table-bordered mb-0 bg-white">
                  <thead>
                    <tr>
                      <th>Orden</th>
                      <th>Producto</th>
                      <th className="text-center">Recibidas</th>
                      <th className="text-center">Acordado</th>
                      <th className="text-center">Facturado</th>
                      <th>Bodega</th>
                      <th>Recibió</th>
                      <th className="text-center">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendientes.map((p) => (
                      <tr key={p.codigoRecepcionDetalle}>
                        <td>#{p.codigoCompra}</td>
                        <td>{p.producto}</td>
                        <td className="text-center">{p.cantidadRecibidaUnidades}</td>
                        <td className="text-center">Q{p.precioAcordado.toFixed(2)}</td>
                        <td className="text-center text-danger fw-bold">Q{p.precioFacturado.toFixed(2)}</td>
                        <td>{p.bodega}</td>
                        <td>{p.recibidoPor}</td>
                        <td className="text-center">
                          <div className="d-flex gap-1 justify-content-center">
                            <button
                              className="btn btn-sm btn-outline-success"
                              title="Autorizar precio e ingresar"
                              onClick={() => resolver(p.codigoRecepcionDetalle, p.precioFacturado, true)}
                            >
                              ✓
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              title="Rechazar producto"
                              onClick={() => {
                                if (window.confirm('¿Rechazar este producto? No ingresará a bodega.')) {
                                  resolver(p.codigoRecepcionDetalle, p.precioFacturado, false)
                                }
                              }}
                            >
                              ✖
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ═════ FASE 1: SELECCIÓN ═════ */}
          {!recepcion && (
            <div className="p-3">
              <div className="row mb-3">
                <div className="col-md-5 mb-3">
                  <label className="form-label">Orden de Compra pendiente:</label>
                  <select
                    className="form-select"
                    value={codigoCompra}
                    onChange={(e) => setCodigoCompra(Number(e.target.value))}
                  >
                    <option value={0}>Seleccione la orden que llega...</option>
                    {ordenesPendientes.map((o) => (
                      <option key={o.codigoCompra} value={o.codigoCompra}>
                        #{o.codigoCompra} — {o.nombreProveedor}
                        {o.estado === 'EnProceso' ? ' (continuar recepción)' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-md-4 mb-3">
                  <label className="form-label">Bodega destino:</label>
                  <select
                    className="form-select"
                    value={codigoBodega}
                    onChange={(e) => setCodigoBodega(Number(e.target.value))}
                  >
                    <option value={0}>Seleccione bodega...</option>
                    {bodegas.map((b) => (
                      <option key={b.codigoBodega} value={b.codigoBodega}>
                        {b.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-md-3 mb-3 d-flex align-items-end">
                  <button
                    className="btn btn-primary w-100"
                    onClick={abrir}
                    disabled={abriendo}
                  >
                    {abriendo ? 'Abriendo...' : '📦 Abrir Recepción'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ═════ FASE 2: REGISTRAR ═════ */}
          {recepcion && (
            <div className="p-3">

              <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap">
                <h5 className="mb-0">
                  Orden #{recepcion.codigoCompra} — {recepcion.bodega}
                </h5>
                <span className={`badge ${recepcion.estado === 'EnProceso' ? 'bg-info text-dark' : 'bg-success'}`}>
                  {recepcion.estado}
                </span>
              </div>

              <div className="table-responsive mb-3">
                <table className="table table-bordered align-middle">
                  <thead className="table-dark">
                    <tr>
                      <th>Producto</th>
                      <th className="text-center">Pedidas</th>
                      <th style={{ width: '170px' }} className="text-center">Recibidas (cajas + sueltas)</th>
                      <th style={{ width: '110px' }} className="text-center">Precio factura</th>
                      <th style={{ width: '140px' }}>Vence</th>
                      <th>Comentario</th>
                      <th className="text-center">Estado</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {detalles.length === 0 ? (
                      <tr><td colSpan={8} className="text-center text-muted py-4">
                        Esta orden no tiene productos.
                      </td></tr>
                    ) : (
                      detalles.map((d) => {
                        const enEdicion = filaEnEdicion?.codigoDetalle === d.codigoDetalle
                        const faltante = d.cantidadPedida - d.cantidadRecibidaUnidades
                        const precioDistinto = d.estadoDetalle === 'PendienteAutorizacion'

                        return (
                          <tr
                            key={d.codigoRecepcionDetalle || d.codigoDetalle}
                            className={precioDistinto ? 'table-warning' : ''}
                          >
                            <td>{d.producto}</td>
                            <td className="text-center">{d.cantidadPedida}</td>

                            {enEdicion ? (
                              <>
                                <td className="text-center">
                                  <div className="d-flex gap-1 justify-content-center">
                                    <input
                                      type="number" min={0} className="form-control form-control-sm"
                                      style={{ width: '65px' }}
                                      value={filaEnEdicion!.cajas || ''}
                                      placeholder="cajas"
                                      onChange={(e) => setFilaEnEdicion({ ...filaEnEdicion!, cajas: Number(e.target.value) })}
                                    />
                                    <span className="align-self-center">+</span>
                                    <input
                                      type="number" min={0} className="form-control form-control-sm"
                                      style={{ width: '65px' }}
                                      value={filaEnEdicion!.sueltas || ''}
                                      placeholder="suel."
                                      onChange={(e) => setFilaEnEdicion({ ...filaEnEdicion!, sueltas: Number(e.target.value) })}
                                    />
                                  </div>
                                </td>
                                <td>
                                  <input
                                    type="number" step="0.01" className="form-control form-control-sm"
                                    value={filaEnEdicion!.precioFacturado || ''}
                                    onChange={(e) => setFilaEnEdicion({ ...filaEnEdicion!, precioFacturado: Number(e.target.value) })}
                                  />
                                </td>
                                <td>
                                  <input
                                    type="date" className="form-control form-control-sm"
                                    value={filaEnEdicion!.fechaVencimiento}
                                    onChange={(e) => setFilaEnEdicion({ ...filaEnEdicion!, fechaVencimiento: e.target.value })}
                                  />
                                </td>
                                <td>
                                  <input
                                    type="text" className="form-control form-control-sm"
                                    value={filaEnEdicion!.comentario}
                                    placeholder="Nota..."
                                    onChange={(e) => setFilaEnEdicion({ ...filaEnEdicion!, comentario: e.target.value })}
                                  />
                                </td>
                                <td className="text-center">—</td>
                                <td className="text-center">
                                  <button className="btn btn-sm btn-success" onClick={guardarFila}>
                                    ✔
                                  </button>
                                </td>
                              </>
                            ) : d.codigoRecepcionDetalle > 0 ? (
                              <>
                                <td className="text-center">
                                  {d.cantidadRecibidaUnidades} un.
                                  <small className="text-muted d-block">
                                    {Math.floor(d.cantidadRecibidaUnidades / (d.unidadesCaja || 1))} cajas
                                    + {d.cantidadRecibidaUnidades % (d.unidadesCaja || 1)} sueltas
                                  </small>
                                </td>
                                <td className="text-center">Q{d.precioFacturado.toFixed(2)}</td>
                                <td className="text-center">{d.fechaVencimiento || '—'}</td>
                                <td>
                                  <small>{d.comentario || ''}</small>
                                  {faltante > 0 && d.estadoDetalle === 'Ingresado' && (
                                    <small className="text-danger d-block">⚠️ Faltan {faltante}</small>
                                  )}
                                </td>
                                <td className="text-center">
                                  {d.estadoDetalle === 'Ingresado' && <span className="badge bg-success">Ingresado</span>}
                                  {d.estadoDetalle === 'PendienteAutorizacion' && <span className="badge bg-warning text-dark">Pendiente</span>}
                                  {d.estadoDetalle === 'Rechazado' && <span className="badge bg-danger">Rechazado</span>}
                                </td>
                                <td className="text-center">
                                  {/* SOLO el admin (permiteEditar) ve los botones de autorización */}
                                  {d.estadoDetalle === 'PendienteAutorizacion' && puedeResolver && (
                                    <div className="d-flex gap-1 justify-content-center">
                                      <button
                                        className="btn btn-sm btn-outline-success"
                                        title="Autorizar precio e ingresar"
                                        onClick={() => resolver(d.codigoRecepcionDetalle, d.precioFacturado, true)}
                                      >
                                        ✓
                                      </button>
                                      <button
                                        className="btn btn-sm btn-outline-danger"
                                        title="Rechazar producto"
                                        onClick={() => {
                                          if (window.confirm('¿Rechazar este producto? No ingresará a bodega.')) {
                                            resolver(d.codigoRecepcionDetalle, d.precioFacturado, false)
                                          }
                                        }}
                                      >
                                        ✖
                                      </button>
                                    </div>
                                  )}
                                </td>
                              </>
                            ) : (
                              <>
                                <td colSpan={5} className="text-center text-muted">Sin registrar</td>
                                <td className="text-center">—</td>
                                <td className="text-center">
                                  <button
                                    className="btn btn-sm btn-outline-primary"
                                    onClick={() => empezarEdicion(d)}
                                  >
                                    Registrar
                                  </button>
                                </td>
                              </>
                            )}
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>

              <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                <div className="border rounded p-2 px-3" style={{ backgroundColor: '#f8f9fa' }}>
                  <strong>Total recibido: </strong>
                  <strong>Q{totalRecibido.toFixed(2)}</strong>
                </div>

                {recepcion.estado === 'EnProceso' ? (
                  <div className="d-flex gap-2">
                    <button className="btn btn-outline-danger" onClick={cancelar}>
                      ✖ Cancelar Recepción
                    </button>
                    <button className="btn btn-primary" onClick={cerrar}>
                      🔒 Cerrar Recepción
                    </button>
                  </div>
                ) : (
                  <button className="btn btn-outline-secondary" onClick={() => navigate('/dashboard')}>
                    Volver
                  </button>
                )}
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  )
}

export default RecepcionPage