import type { PedidoConsulta, PedidoDetalle, PedidoHistorial } from './PedidoConsulta'

export interface PedidoBuscar {
  encabezado: PedidoConsulta
  detalle: PedidoDetalle[]
  historial: PedidoHistorial[]
}