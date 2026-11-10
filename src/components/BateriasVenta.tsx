import { BatteryCharging, ShoppingCart, Calendar } from 'lucide-react'
import type { ResumenVendedor } from '../interfaces/ResumenVendedor'

const VACIO: ResumenVendedor = {
  ventaSemana: 0,
  ventaDia: 0,
  pedidosDia: 0,
  diasConVenta: 0,
  porcentajeSemana: 0,
  porcentajeDia: 0,
}

const colorBateria = (p: number) => (p >= 100 ? '#22c55e' : p >= 50 ? '#f59e0b' : '#ef4444')
const formatoQ = (n: number) =>
  `Q ${n.toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

function diaActualDeSemana(): number {
  return [4, 5, 6, 1, 2, 3, 4][new Date().getDay()]
}

function Bateria({ titulo, porcentaje }: { titulo: string; porcentaje: number }) {
  const color = colorBateria(porcentaje)
  const ancho = Math.min(Math.max(porcentaje, 0), 100)
  return (
    <div style={{ marginBottom: 20 }}>
      <div className="d-flex justify-content-between align-items-center mb-2">
        <span className="d-flex align-items-center gap-2" style={{ color: '#e2e8f0' }}>
          <BatteryCharging size={16} color={color} />
          {titulo}
        </span>
        <span style={{ color, fontWeight: 700, fontSize: '1.6rem' }}>
          {porcentaje.toFixed(1)}%
        </span>
      </div>
      <div className="d-flex align-items-center">
        <div
          style={{
            flex: 1,
            height: 48,
            borderRadius: 12,
            border: `2px solid ${color}`,
            background: '#111a2e',
            boxShadow: `0 0 12px ${color}55`,
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <div
            style={{
              width: `${ancho}%`,
              height: '100%',
              background: color,
              transition: 'width 0.4s ease',
            }}
          />
          <span
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 700,
            }}
          >
            {Math.round(porcentaje)}%
          </span>
        </div>
        <div
          style={{
            width: 8,
            height: 20,
            background: color,
            borderRadius: '0 4px 4px 0',
            marginLeft: 2,
          }}
        />
      </div>
    </div>
  )
}

function Dato({
  icono,
  etiqueta,
  valor,
  detalle,
}: {
  icono: React.ReactNode
  etiqueta: string
  valor: string
  detalle?: string
}) {
  return (
    <div>
      <div className="d-flex align-items-center gap-2" style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
        {icono}
        {etiqueta}
      </div>
      <div style={{ color: '#fff', fontWeight: 700, fontSize: '1.1rem' }}>{valor}</div>
      {detalle && <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{detalle}</div>}
    </div>
  )
}

export function BateriasVenta({ datos }: { datos: ResumenVendedor | null }) {
  const r = datos ?? VACIO
  return (
    <div
      style={{
        background: '#1a2438',
        border: '1px solid #1e40af',
        borderRadius: 8,
        padding: '20px 24px',
        marginBottom: 16,
      }}
    >
      <Bateria titulo="Utilidad de la semana" porcentaje={r.porcentajeSemana} />
      <Bateria titulo="Utilidad del día" porcentaje={r.porcentajeDia} />
      <div className="row g-3">
        <div className="col-6 col-md-4">
          <Dato
            icono={<ShoppingCart size={14} color="#22c55e" />}
            etiqueta="Venta de la semana"
            valor={formatoQ(r.ventaSemana)}
          />
        </div>
        <div className="col-6 col-md-4">
          <Dato
            icono={<ShoppingCart size={14} color="#38bdf8" />}
            etiqueta="Venta del día"
            valor={formatoQ(r.ventaDia)}
            detalle={`${r.pedidosDia} pedido${r.pedidosDia === 1 ? '' : 's'}`}
          />
        </div>
        <div className="col-12 col-md-4">
          <Dato
            icono={<Calendar size={14} color="#eab308" />}
            etiqueta="Días con venta"
            valor={`${r.diasConVenta} / 6`}
            detalle={`día ${diaActualDeSemana()} de 6`}
          />
        </div>
      </div>
    </div>
  )
}