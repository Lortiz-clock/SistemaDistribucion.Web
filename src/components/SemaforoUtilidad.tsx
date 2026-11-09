import { BatteryCharging, TrendingUp, Target, Calendar } from 'lucide-react'
import type { SemaforoUtilidad as SemaforoData } from '../interfaces/SemaforoUtilidad'

const COLORES = {
  VERDE:    { base: '#22c55e', claro: '#4ade80', glow: 'rgba(34,197,94,0.5)' },
  AMARILLO: { base: '#eab308', claro: '#fde047', glow: 'rgba(234,179,8,0.5)' },
  ROJO:     { base: '#ef4444', claro: '#fca5a5', glow: 'rgba(239,68,68,0.5)' },
  GRIS:     { base: '#6b7280', claro: '#9ca3af', glow: 'rgba(107,114,128,0.4)' },
}

const MENSAJES = {
  VERDE: 'Va a alcanzar la meta',
  AMARILLO: 'Al ritmo llega, pero hay que cuidarlo',
  ROJO: 'No va a alcanzar la meta',
  GRIS: 'No hay meta definida para este período',
}

function formatearQ(n: number): string {
  return new Intl.NumberFormat('es-GT', {
    style: 'currency',
    currency: 'GTQ',
    maximumFractionDigits: 2,
  }).format(n)
}

export function SemaforoUtilidad({
  datos,
  titulo = 'Utilidad de la semana',
  esDiario = false,
}: {
  datos: SemaforoData | null
  titulo?: string
  esDiario?: boolean
}) {
  if (!datos) {
    return (
      <div className="card mb-3">
        <div className="card-body text-center text-muted py-4">
          <span className="spinner-border spinner-border-sm me-2" />
          Cargando…
        </div>
      </div>
    )
  }

  const c = COLORES[datos.color]
  const mensaje = MENSAJES[datos.color]
  const fillPorcentaje = Math.min(datos.porcentajeAcumulado, 100)
  const cargando = datos.diasConVenta > 0 // hay ventas → la batería "está cargando"

  return (
    <>
      <style>{`
        @keyframes batteryShine {
          0%   { left: -40%; }
          50%  { left: 100%; }
          100% { left: 100%; }
        }
        @keyframes batteryPulse {
          0%, 100% { opacity: 0.5; }
          50%      { opacity: 0.8; }
        }
      `}</style>

      <div className="card mb-3">
        <div className="card-body">
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div className="d-flex align-items-center gap-2">
              <BatteryCharging size={22} style={{ color: c.base }} />
              <h6 className="mb-0">{titulo}</h6>
            </div>
            <div className="text-end">
              <div className="h3 mb-0 fw-bold" style={{ color: c.base }}>
                {datos.porcentajeProyeccion.toFixed(1)}%
              </div>
              <small className="text-muted">proyección al cierre</small>
            </div>
          </div>

          {/* Batería gordita */}
          <div className="d-flex align-items-center gap-1 mb-2">
            {/* Cuerpo */}
            <div
              style={{
                position: 'relative',
                flex: 1,
                height: 54,
                border: `2.5px solid ${c.base}`,
                borderRadius: 16,
                padding: 4,
                overflow: 'hidden',
                backgroundColor: 'rgba(15,23,42,0.6)',
                boxShadow: `0 0 20px ${c.glow}, inset 0 2px 6px rgba(0,0,0,0.3)`,
              }}
            >
              {/* Relleno con gradiente */}
              <div
                style={{
                  width: `${fillPorcentaje}%`,
                  height: '100%',
                  background: `linear-gradient(180deg, ${c.claro} 0%, ${c.base} 100%)`,
                  borderRadius: 12,
                  transition: 'width 1.5s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: `inset 0 1px 3px rgba(255,255,255,0.3), 0 0 12px ${c.glow}`,
                  position: 'relative',
                  overflow: 'hidden',
                  minWidth: fillPorcentaje > 0 ? 8 : 0,
                }}
              >
                {/* Brillo que se mueve (solo si hay ventas) */}
                {cargando && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      width: '40%',
                      height: '100%',
                      background:
                        'linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)',
                      animation: 'batteryShine 2.5s ease-in-out infinite',
                    }}
                  />
                )}
              </div>

              {/* Porcentaje del acumulado centrado */}
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  color: '#ffffff',
                  fontWeight: '700',
                  fontSize: '1.05rem',
                  textShadow: '0 1px 3px rgba(0,0,0,0.6)',
                  zIndex: 1,
                }}
              >
                {datos.porcentajeAcumulado.toFixed(0)}%
              </div>
            </div>

            {/* Tapita de la batería */}
            <div
              style={{
                width: 8,
                height: 28,
                background: `linear-gradient(180deg, ${c.claro}, ${c.base})`,
                borderRadius: '0 6px 6px 0',
                boxShadow: `0 0 8px ${c.glow}`,
              }}
            />
          </div>

          {/* Mensaje de estado */}
          <p className="small mb-3" style={{ color: c.base }}>
            {mensaje}
          </p>

          {/* Métricas */}
          <div className="row g-2">
            <div className="col-6">
              <div className="d-flex align-items-center gap-2 mb-1">
                <TrendingUp size={14} className="text-success" />
                <small className="text-muted">Acumulado</small>
              </div>
              <div className="fw-semibold">{formatearQ(datos.utilidadAcumulada)}</div>
              <small className="text-muted">
                {datos.porcentajeAcumulado.toFixed(1)}% de la meta
              </small>
            </div>
            <div className="col-6">
              <div className="d-flex align-items-center gap-2 mb-1">
                <Target size={14} className="text-primary" />
                <small className="text-muted">{esDiario ? 'Meta diaria' : 'Meta semanal'}</small>
              </div>
              <div className="fw-semibold">{formatearQ(datos.metaSemanal)}</div>
              {!esDiario && (
                <small className="text-muted">
                  diaria: {formatearQ(datos.metaSemanal / 6)}
                </small>
              )}
            </div>
            <div className="col-6">
              <div className="d-flex align-items-center gap-2 mb-1">
                <BatteryCharging size={14} className="text-info" />
                <small className="text-muted">Proyección</small>
              </div>
              <div className="fw-semibold">{formatearQ(datos.proyeccionFinSemana)}</div>
              <small className="text-muted">
                {datos.porcentajeProyeccion.toFixed(1)}% de la meta
              </small>
            </div>
            <div className="col-6">
              <div className="d-flex align-items-center gap-2 mb-1">
                <Calendar size={14} className="text-warning" />
                <small className="text-muted">Días con venta</small>
              </div>
              <div className="fw-semibold">
                {datos.diasConVenta} / {datos.diasTotales}
              </div>
              <small className="text-muted">
                día {datos.diasTranscurridos} de {datos.diasTotales}
              </small>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}