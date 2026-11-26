import api from './api'
import type { RespuestaApi } from '../interfaces/RespuestaApi'
import type { PedidoOperacion, ComisionEntrega, ReporteVendedor, DashboardVendedorItem, FacturaFEL, FacturaFELImpresion, LiquidacionResultado, DespachoPendienteLiquidacion, LiquidacionDespachoDetalle, LiquidacionHistorial, LiquidacionDetalle } from '../interfaces/OperacionesPedido'

export const obtenerPreparacion = async () => (await api.get<RespuestaApi<PedidoOperacion[]>>('/api/OperacionesPedido/Preparacion')).data
export const confirmarPreparado = async (codigoPedido: number) => (await api.post<RespuestaApi<boolean>>(`/api/OperacionesPedido/Preparacion/${codigoPedido}/Confirmar`)).data
export const obtenerCarga = async () => (await api.get<RespuestaApi<PedidoOperacion[]>>('/api/OperacionesPedido/Carga')).data
export const asignarDespacho = async (payload: { codigoRepartidor: number; pedidos: number[] }) => (await api.post<RespuestaApi<number>>('/api/OperacionesPedido/Despacho/Asignar', payload)).data
export const confirmarCargaDespacho = async (codigoDespacho: number) => (await api.post<RespuestaApi<number>>(`/api/OperacionesPedido/Despacho/${codigoDespacho}/ConfirmarCarga`)).data
export const obtenerMiRepartidor = async () => (await api.get<RespuestaApi<number | null>>('/api/OperacionesPedido/MiRepartidor')).data
export const obtenerMisEntregas = async (codigoRepartidor?: number) => (await api.get<RespuestaApi<PedidoOperacion[]>>('/api/OperacionesPedido/MisEntregas', { params: codigoRepartidor ? { codigoRepartidor } : undefined })).data
export const marcarEntregado = async (codigoPedido: number) => (await api.post<RespuestaApi<boolean>>(`/api/OperacionesPedido/MisEntregas/${codigoPedido}/Entregado`)).data
export const revertirAEntregado = async (codigoPedido: number) => (await api.post<RespuestaApi<boolean>>(`/api/OperacionesPedido/MisEntregas/${codigoPedido}/RevertirAEntregado`)).data
export const registrarRechazo = async (payload: { codigoPedido: number; motivo?: string; esParcial: boolean; detalles: { codigoPedidoDetalle: number; cantidadRechazada: number }[] }) => (await api.post<RespuestaApi<number>>('/api/OperacionesPedido/Rechazos', payload)).data
export const crearLiquidacion = async (payload: { codigoRepartidor?: number | null; codigoEmpleado?: number | null; codigoDespacho?: number | null; fechaLiquidacion: string; pedidos: number[]; gastos: { codigoMotivoGasto?: number | null; descripcion: string; monto: number }[]; efectivo: { denominacion: number; tipo: string; cantidad: number }[]; depositos: { banco: string; numeroBoleta: string; monto: number }[] }) => (await api.post<RespuestaApi<LiquidacionResultado>>('/api/OperacionesPedido/Liquidaciones', payload)).data
export const obtenerComisiones = async () => (await api.get<RespuestaApi<ComisionEntrega[]>>('/api/OperacionesPedido/Comisiones')).data
export const guardarComision = async (payload: ComisionEntrega) => (await api.post<RespuestaApi<boolean>>('/api/OperacionesPedido/Comisiones', payload)).data
export const reporteVentasVendedor = async (fechaDesde: string, fechaHasta: string) => (await api.get<RespuestaApi<ReporteVendedor[]>>('/api/OperacionesPedido/ReporteVentasVendedor', { params: { fechaDesde, fechaHasta } })).data
export const generarFEL = async (codigoPedido: number) => (await api.post<RespuestaApi<number>>(`/api/OperacionesPedido/FEL/Generar/${codigoPedido}`)).data
export const consultarFEL = async () => (await api.get<RespuestaApi<FacturaFEL[]>>('/api/OperacionesPedido/FEL')).data
export const obtenerFELImpresion = async (codigoFacturaFEL: number) => (await api.get<RespuestaApi<FacturaFELImpresion>>(`/api/OperacionesPedido/FEL/${codigoFacturaFEL}/Impresion`)).data

export const dashboardVendedores = (desde: string, hasta: string) => api.get<RespuestaApi<DashboardVendedorItem[]>>('/api/OperacionesPedido/DashboardVendedores', { params: { fechaDesde: desde, fechaHasta: hasta } }).then(r => r.data)

export const despachosPendientesLiquidacion = async () => (await api.get<RespuestaApi<DespachoPendienteLiquidacion[]>>('/api/OperacionesPedido/Liquidaciones/DespachosPendientes')).data
export const detalleDespachoLiquidacion = async (codigoDespacho: number) => (await api.get<RespuestaApi<LiquidacionDespachoDetalle>>(`/api/OperacionesPedido/Liquidaciones/Despachos/${codigoDespacho}/Detalle`)).data
export const historialLiquidaciones = async () => (await api.get<RespuestaApi<LiquidacionHistorial[]>>('/api/OperacionesPedido/Liquidaciones/Historial')).data

export const obtenerLiquidacionDetalle = async (codigoLiquidacion: number) => (await api.get<RespuestaApi<LiquidacionDetalle>>(`/api/OperacionesPedido/Liquidaciones/${codigoLiquidacion}/Detalle`)).data
