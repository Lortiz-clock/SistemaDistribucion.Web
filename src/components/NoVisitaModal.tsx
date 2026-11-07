import { useEffect, useState } from 'react'
import { isAxiosError } from 'axios'
import { consultarMotivosNoVisita } from '../services/motivoNoVisitaServices'
import { registrarNoVisita } from '../services/pedidosService'
import type { MotivoNoVisitaConsulta } from '../interfaces/MotivoNoVisitaConsulta'
import ConfirmarModal from './ConfirmarModal'

interface Props {
  codigoCliente: number
  nombreCliente: string
  onClose: () => void
  onExito: () => void
}

export function NoVisitaModal({ codigoCliente, nombreCliente, onClose, onExito }: Props) {
  const [motivos, setMotivos] = useState<MotivoNoVisitaConsulta[]>([])
  const [motivoSeleccionado, setMotivoSeleccionado] = useState<number | null>(null)
  const [observaciones, setObservaciones] = useState('')
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [exito, setExito] = useState(false)

  useEffect(() => {
    void cargarMotivos()
  }, [])

  async function cargarMotivos() {
    setCargando(true)
    try {
      const res = await consultarMotivosNoVisita()
      if (res.exito && res.datos) {
        setMotivos(res.datos.filter((m) => m.estado))
      } else {
        setError(res.mensaje)
      }
    } catch (err) {
      setError(
        isAxiosError(err) && err.response?.data?.mensaje
          ? err.response.data.mensaje
          : 'No se pudieron cargar los motivos.'
      )
    } finally {
      setCargando(false)
    }
  }

  async function guardar() {
    setError(null)

    if (motivoSeleccionado === null) {
      setError('Selecciona un motivo.')
      return
    }

    setGuardando(true)
    try {
      const res = await registrarNoVisita({
        codigoCliente,
        codigoMotivo: motivoSeleccionado,
        observaciones: observaciones.trim() || undefined,
      })

      if (!res.exito) {
        setError(res.mensaje)
        return
      }

      setExito(true)
    } catch (err) {
      setError(
        isAxiosError(err) && err.response?.data?.mensaje
          ? err.response.data.mensaje
          : 'No se pudo registrar la no visita. Revisa tu conexión.'
      )
    } finally {
      setGuardando(false)
    }
  }

  return (
    <>
      <div className="modal d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                No visita — <span className="text-primary">{nombreCliente}</span>
              </h5>
              <button type="button" className="btn-close" onClick={onClose} disabled={guardando} />
            </div>

            <div className="modal-body">
              {error && <div className="alert alert-danger">{error}</div>}

              {cargando ? (
                <div className="text-center text-muted py-3">
                  <span className="spinner-border spinner-border-sm me-2" />
                  Cargando motivos…
                </div>
              ) : (
                <>
                  <label className="form-label fw-semibold">Motivo de no visita</label>
                  <div className="list-group mb-3" style={{ maxHeight: 250, overflowY: 'auto' }}>
                    {motivos.map((m) => (
                      <button
                        key={m.codigoMotivo}
                        type="button"
                        className={`list-group-item list-group-item-action ${
                          motivoSeleccionado === m.codigoMotivo ? 'active' : ''
                        }`}
                        onClick={() => setMotivoSeleccionado(m.codigoMotivo)}
                      >
                        {m.nombre}
                      </button>
                    ))}
                  </div>

                  <label className="form-label small fw-semibold">Observaciones (opcional)</label>
                  <textarea
                    className="form-control"
                    rows={2}
                    maxLength={500}
                    value={observaciones}
                    onChange={(e) => setObservaciones(e.target.value)}
                    placeholder="Detalles adicionales…"
                  />
                </>
              )}
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-outline-secondary" onClick={onClose} disabled={guardando}>
                Cancelar
              </button>
              <button
                type="button"
                className="btn btn-warning"
                onClick={guardar}
                disabled={guardando || cargando || motivoSeleccionado === null}
              >
                {guardando ? (
                  <><span className="spinner-border spinner-border-sm me-1" />Guardando…</>
                ) : (
                  'Registrar no visita'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ConfirmarModal para el resultado */}
      <ConfirmarModal
        visible={exito}
        titulo="No visita registrada"
        mensaje={`Se registró la no visita para ${nombreCliente}. El cliente no aparecerá como pendiente para este día.`}
        textoAceptar="Aceptar"
        claseAceptar="btn-primary"
        onAceptar={onExito}
        onCancelar={onExito}
      />
    </>
  )
}