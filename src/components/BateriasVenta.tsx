import { useEffect, useState } from 'react'
import { BatteryCharging, Target, TrendingUp } from 'lucide-react'
import type { ResumenVendedor } from '../interfaces/ResumenVendedor'

const VACIO: ResumenVendedor = { ventaSemana: 0, ventaDia: 0, pedidosDia: 0, diasConVenta: 0, porcentajeSemana: 0, porcentajeDia: 0, utilidadSemana: 0, utilidadDia: 0, metaSemanal: 0, metaDiaria: 0 }
const q = (n: number) => `Q ${Number(n || 0).toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

const COLORES = [
  '#b91c1c', '#c2410c', '#dc2626', '#ea580c', '#ef4444',
  '#f97316', '#f59e0b', '#eab308', '#facc15', '#d4d700',
  '#a3e635', '#84cc16', '#65a30d', '#4ade80', '#22c55e',
  '#16a34a', '#10b981', '#059669', '#14b8a6', '#06b6d4'
]

function colorPorcentaje(pct: number) {
  if (pct <= 0) return '#94a3b8'
  return COLORES[Math.min(COLORES.length - 1, Math.floor(pct / 5))]
}

function useAnimatedNumber(target: number, duration = 1200) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    const from = 0
    const start = performance.now()
    let raf = 0
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - t, 3)
      setValue(from + (target - from) * eased)
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, duration])
  return value
}

function Bateria({ titulo, porcentaje }: { titulo: string; porcentaje: number }) {
  const pctTarget = Math.min(100, Math.max(0, Number(porcentaje) || 0))
  const pct = useAnimatedNumber(pctTarget)
  const color = colorPorcentaje(pctTarget)
  const colorInicio = colorPorcentaje(Math.max(0, pctTarget - 25))

  return (
    <div style={{ marginBottom: 24 }}>
      <div className="d-flex justify-content-between align-items-center mb-2">
        <span className="d-flex align-items-center gap-2" style={{ color: '#e2e8f0', fontWeight: 600 }}>
          <BatteryCharging size={18} color={color} />{titulo}
        </span>
        <span style={{ color, fontWeight: 800, fontSize: '1.5rem', textShadow: `0 0 12px ${color}88` }}>
          {pct.toFixed(1)}%
        </span>
      </div>
      <div className="d-flex align-items-center gap-1">
        <div style={{ flex: 1, height: 48, padding: 5, borderRadius: 14, border: `2px solid ${color}`, background: 'linear-gradient(180deg,#0b1220,#111827)', boxShadow: `0 0 18px ${color}55, inset 0 1px 0 rgba(255,255,255,.06)`, overflow: 'hidden' }}>
          <div
            style={{
              width: `${pct}%`,
              height: '100%',
              borderRadius: 9,
              position: 'relative',
              overflow: 'hidden',
              background: pctTarget > 0 ? `linear-gradient(90deg, ${colorInicio}, ${color})` : 'transparent',
              boxShadow: pctTarget > 0 ? `0 0 16px ${color}99, inset 0 1px 0 rgba(255,255,255,.35)` : 'none',
            }}
          >
            {pctTarget > 0 && (
              <>
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(255,255,255,.35) 0%, rgba(255,255,255,0) 35%, rgba(0,0,0,0) 65%, rgba(0,0,0,.18) 100%)' }} />
                <div style={{ position: 'absolute', left: 0, right: 0, height: '55%', background: 'linear-gradient(180deg, transparent, rgba(255,255,255,.3), transparent)', animation: 'bateriaOla 2.2s ease-in-out infinite alternate' }} />
                <div style={{ position: 'absolute', top: 2, left: 2, right: 2, height: '28%', borderRadius: 6, background: 'rgba(255,255,255,.18)' }} />
              </>
            )}
          </div>
        </div>
        <div style={{ width: 11, height: 28, background: `linear-gradient(180deg, ${color}, ${color}aa)`, borderRadius: '0 6px 6px 0', boxShadow: `0 0 10px ${color}88` }} />
      </div>
    </div>
  )
}

export function BateriasVenta({ datos }: { datos: ResumenVendedor | null }) {
  const r = datos ?? VACIO
  return (
    <div style={{ background: 'linear-gradient(180deg,#1b2740,#162033)', border: '1px solid #334155', borderRadius: 12, padding: '20px 24px', marginBottom: 16, boxShadow: 'inset 0 1px 0 rgba(255,255,255,.04)' }}>
      <style>{`@keyframes bateriaOla{0%{top:55%;opacity:.25}100%{top:-10%;opacity:.75}}`}</style>
      <Bateria titulo="Meta semanal" porcentaje={r.porcentajeSemana} />
      <Bateria titulo="Meta diaria" porcentaje={r.porcentajeDia} />
      <div className="row g-3 mt-1">
        <Dato label="Venta semana" valor={q(r.ventaSemana)} icon={<Target size={14} color="#22c55e" />} />
        <Dato label="Venta día" valor={q(r.ventaDia)} icon={<Target size={14} color="#38bdf8" />} />
        <Dato label="Pedidos día" valor={String(r.pedidosDia)} icon={<TrendingUp size={14} color="#a78bfa" />} />
        <Dato label="Días con venta" valor={String(r.diasConVenta)} icon={<CalendarIcon />} />
      </div>
    </div>
  )
}

function Dato({ label, valor, icon }: { label: string; valor: string; icon: React.ReactNode }) {
  return (
    <div className="col-12 col-md-6 col-lg-3">
      <div style={{ background: 'linear-gradient(180deg,#111a2e,#0c1425)', border: '1px solid #334155', borderRadius: 8, padding: '10px 12px' }}>
        <div style={{ color: '#94a3b8', fontSize: '.85rem' }} className="d-flex align-items-center gap-2">{icon}{label}</div>
        <div style={{ color: '#fff', fontWeight: 700 }}>{valor}</div>
      </div>
    </div>
  )
}

function CalendarIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#eab308" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
}
