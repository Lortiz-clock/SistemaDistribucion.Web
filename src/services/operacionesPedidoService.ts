import api from './api'
import type { RespuestaApi } from '../interfaces/RespuestaApi'
import type { PedidoOperacion, ComisionEntrega, ReporteVendedor, FacturaFEL, LiquidacionResultado } from '../interfaces/OperacionesPedido'

export const obtenerPreparacion = async () => (await api.get<RespuestaApi<PedidoOperacion[]>>('/api/OperacionesPedido/Preparacion')).data
export const confirmarPreparado = async (codigoPedido: number) => (await api.post<RespuestaApi<boolean>>(`/api/OperacionesPedido/Preparacion/${codigoPedido}/Confirmar`)).data
export const obtenerCarga = async () => (await api.get<RespuestaApi<PedidoOperacion[]>>('/api/OperacionesPedido/Carga')).data
export const asignarDespacho = async (payload: { codigoRepartidor: number; pedidos: number[] }) => (await api.post<RespuestaApi<number>>('/api/OperacionesPedido/Despacho/Asignar', payload)).data
export const obtenerMisEntregas = async (codigoRepartidor: number) => (await api.get<RespuestaApi<PedidoOperacion[]>>('/api/OperacionesPedido/MisEntregas', { params: { codigoRepartidor } })).data
export const marcarEntregado = async (codigoPedido: number) => (await api.post<RespuestaApi<boolean>>(`/api/OperacionesPedido/MisEntregas/${codigoPedido}/Entregado`)).data
export const registrarRechazo = async (payload: { codigoPedido: number; motivo?: string; esParcial: boolean; detalles: { codigoPedidoDetalle: number; cantidadRechazada: number }[] }) => (await api.post<RespuestaApi<number>>('/api/OperacionesPedido/Rechazos', payload)).data
export const crearLiquidacion = async (payload: { codigoRepartidor?: number | null; codigoEmpleado?: number | null; fechaLiquidacion: string; pedidos: number[]; gastos: { codigoMotivoGasto?: number | null; descripcion: string; monto: number }[] }) => (await api.post<RespuestaApi<LiquidacionResultado>>('/api/OperacionesPedido/Liquidaciones', payload)).data
export const obtenerComisiones = async () => (await api.get<RespuestaApi<ComisionEntrega[]>>('/api/OperacionesPedido/Comisiones')).data
export const guardarComision = async (payload: ComisionEntrega) => (await api.post<RespuestaApi<boolean>>('/api/OperacionesPedido/Comisiones', payload)).data
export const reporteVentasVendedor = async (fechaDesde: string, fechaHasta: string) => (await api.get<RespuestaApi<ReporteVendedor[]>>('/api/OperacionesPedido/ReporteVentasVendedor', { params: { fechaDesde, fechaHasta } })).data
export const generarFEL = async (codigoPedido: number) => (await api.post<RespuestaApi<number>>(`/api/OperacionesPedido/FEL/Generar/${codigoPedido}`)).data
export const consultarFEL = async () => (await api.get<RespuestaApi<FacturaFEL[]>>('/api/OperacionesPedido/FEL')).data
