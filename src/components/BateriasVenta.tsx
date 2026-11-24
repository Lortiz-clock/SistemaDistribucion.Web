import { BatteryCharging, Calendar, Target } from 'lucide-react'
import type { ResumenVendedor } from '../interfaces/ResumenVendedor'

const VACIO: ResumenVendedor = { ventaSemana: 0, ventaDia: 0, pedidosDia: 0, diasConVenta: 0, porcentajeSemana: 0, porcentajeDia: 0, utilidadSemana: 0, utilidadDia: 0, metaSemanal: 0, metaDiaria: 0 }
const colorBateria = (p: number) => (p >= 100 ? '#22c55e' : p >= 70 ? '#f59e0b' : '#ef4444')
const q = (n: number) => `Q ${Number(n || 0).toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

function Bateria({ titulo, porcentaje }: { titulo: string; porcentaje: number }) {
  const color = colorBateria(porcentaje)
  const ancho = Math.min(Math.max(porcentaje, 0), 100)
  return (
    <div style={{ marginBottom: 20 }}>
      <div className="d-flex justify-content-between align-items-center mb-2">
        <span className="d-flex align-items-center gap-2" style={{ color: '#e2e8f0' }}><BatteryCharging size={16} color={color} />{titulo}</span>
        <span style={{ color, fontWeight: 700, fontSize: '1.6rem' }}>{porcentaje.toFixed(1)}%</span>
      </div>
      <div className="d-flex align-items-center">
        <div style={{ flex: 1, height: 48, borderRadius: 12, border: `2px solid ${color}`, background: '#111a2e', boxShadow: `0 0 12px ${color}55`, overflow: 'hidden', position: 'relative' }}>
          <div style={{ width: `${ancho}%`, height: '100%', background: color, transition: 'width 0.4s ease' }} />
          <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700 }}>{Math.round(porcentaje)}%</span>
        </div>
        <div style={{ width: 8, height: 20, background: color, borderRadius: '0 4px 4px 0', marginLeft: 2 }} />
      </div>
    </div>
  )
}

function Dato({ label, valor, icon }: { label: string; valor: string; icon: React.ReactNode }) {
  return (
    <div className="col-12 col-md-6">
      <div style={{ background: '#111a2e', border: '1px solid #334155', borderRadius: 8, padding: '10px 12px' }}>
        <div style={{ color: '#94a3b8', fontSize: '0.9rem' }} className="d-flex align-items-center gap-2">{icon}{label}</div>
        <div style={{ color: '#fff', fontWeight: 700, fontSize: '1.05rem' }}>{valor}</div>
      </div>
    </div>
  )
}

export function BateriasVenta({ datos }: { datos: ResumenVendedor | null }) {
  const r = datos ?? VACIO
  return (
    <div style={{ background: '#1a2438', border: '1px solid #1e40af', borderRadius: 8, padding: '20px 24px', marginBottom: 16 }}>
      <Bateria titulo="Meta de la semana" porcentaje={r.porcentajeSemana} />
      <Bateria titulo="Meta del d?a" porcentaje={r.porcentajeDia} />
      <div className="row g-3">
        <Dato label="Venta total acumulada del d?a" valor={q(r.ventaDia)} icon={<Target size={14} color="#22c55e" />} />
        <Dato label="Meta acumulada de la semana" valor={q(r.metaSemanal)} icon={<Calendar size={14} color="#eab308" />} />
      </div>
    </div>
  )
}
