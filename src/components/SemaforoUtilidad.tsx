import { BatteryCharging, Target, Calendar } from 'lucide-react'
import type { SemaforoUtilidad as SemaforoData } from '../interfaces/SemaforoUtilidad'

const COLORES = {
  VERDE: { base: '#22c55e', claro: '#4ade80', glow: 'rgba(34,197,94,0.5)' },
  AMARILLO: { base: '#eab308', claro: '#fde047', glow: 'rgba(234,179,8,0.5)' },
  ROJO: { base: '#ef4444', claro: '#fca5a5', glow: 'rgba(239,68,68,0.5)' },
  GRIS: { base: '#6b7280', claro: '#9ca3af', glow: 'rgba(107,114,128,0.4)' },
}
const MENSAJES = {
  VERDE: 'Va a alcanzar la meta',
  AMARILLO: 'Al ritmo llega, pero hay que cuidarlo',
  ROJO: 'No va a alcanzar la meta',
  GRIS: 'No hay meta definida para este período',
}

export function SemaforoUtilidad({ datos, titulo = 'Utilidad de la semana', esDiario = false }: { datos: SemaforoData | null; titulo?: string; esDiario?: boolean }) {
  if (!datos) return <div className="card mb-3"><div className="card-body text-center text-muted py-4"><span className="spinner-border spinner-border-sm me-2" />Cargando...</div></div>
  const colorKey = esDiario ? datos.colorDia : datos.color
  const c = COLORES[colorKey] ?? COLORES.GRIS
  const mensaje = MENSAJES[colorKey] ?? MENSAJES.GRIS
  const porcentaje = esDiario ? datos.porcentajeDia : datos.porcentajeAcumulado
  const fillPorcentaje = Math.min(Math.max(porcentaje, 0), 100)
  const cargando = datos.diasConVenta > 0
  return (
    <>
      <style>{`@keyframes batteryShine{0%{left:-40%}50%{left:100%}100%{left:100%}}`}</style>
      <div className="card mb-3"><div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div className="d-flex align-items-center gap-2"><BatteryCharging size={22} style={{ color: c.base }} /><h6 className="mb-0">{titulo}</h6></div>
          <div className="text-end"><div className="h3 mb-0 fw-bold" style={{ color: c.base }}>{porcentaje.toFixed(1)}%</div><small className="text-muted">{esDiario ? 'avance del día' : 'avance de semana'}</small></div>
        </div>
        <div className="d-flex align-items-center gap-1 mb-2">
          <div style={{ position: 'relative', flex: 1, height: 54, border: `2.5px solid ${c.base}`, borderRadius: 16, padding: 4, overflow: 'hidden', backgroundColor: 'rgba(15,23,42,0.6)', boxShadow: `0 0 20px ${c.glow}, inset 0 2px 6px rgba(0,0,0,0.3)` }}>
            <div style={{ width: `${fillPorcentaje}%`, height: '100%', background: `linear-gradient(180deg, ${c.claro} 0%, ${c.base} 100%)`, borderRadius: 12, transition: 'width 1.5s cubic-bezier(0.4, 0, 0.2, 1)', boxShadow: `inset 0 1px 3px rgba(255,255,255,0.3), 0 0 12px ${c.glow}`, position: 'relative', overflow: 'hidden', minWidth: fillPorcentaje > 0 ? 8 : 0 }}>
              {cargando && <div style={{ position: 'absolute', top: 0, width: '40%', height: '100%', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)', animation: 'batteryShine 2.5s ease-in-out infinite' }} />}
            </div>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: '#fff', fontWeight: 700, fontSize: '1.05rem', textShadow: '0 1px 3px rgba(0,0,0,0.6)', zIndex: 1 }}>{porcentaje.toFixed(0)}%</div>
          </div>
          <div style={{ width: 8, height: 28, background: `linear-gradient(180deg, ${c.claro}, ${c.base})`, borderRadius: '0 6px 6px 0', boxShadow: `0 0 8px ${c.glow}` }} />
        </div>
        <p className="small mb-3" style={{ color: c.base }}>{mensaje}</p>
        <div className="row g-2">
          <div className="col-6"><div className="d-flex align-items-center gap-2 mb-1"><Target size={14} className="text-primary" /><small className="text-muted">Estado</small></div><div className="fw-semibold" style={{ color: c.base }}>{colorKey}</div></div>
          <div className="col-6"><div className="d-flex align-items-center gap-2 mb-1"><Calendar size={14} className="text-warning" /><small className="text-muted">Días con venta</small></div><div className="fw-semibold">{datos.diasConVenta} / {datos.diasTotales}</div></div>
          {!esDiario && <div className="col-6"><div className="d-flex align-items-center gap-2 mb-1"><BatteryCharging size={14} className="text-info" /><small className="text-muted">Proyección</small></div><div className="fw-semibold">{datos.porcentajeProyeccion.toFixed(1)}%</div></div>}
        </div>
      </div></div>
    </>
  )
}
