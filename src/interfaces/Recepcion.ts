// Encabezado de la recepción (lo que devuelve BuscarRecepcion)
export interface RecepcionConsulta {
  codigoRecepcion: number
  codigoCompra: number
  bodega: string
  nombreEmpleado: string
  fechaRecepcion: string
  estado: string
}

// Cada línea del detalle (lo que devuelve BuscarRecepcionDetalle)
export interface RecepcionDetalleConsulta {
  codigoRecepcionDetalle: number
  codigoDetalle: number
  producto: string
  unidadesCaja: number
  cantidadPedida: number
  cantidadRecibidaUnidades: number
  precioAcordado: number
  precioFacturado: number
  fechaVencimiento: string | null
  comentario: string | null
  estadoDetalle: string
}

// Lo que envía el botón "Abrir Recepción"
export interface RecepcionAbrir {
  codigoCompra: number
  codigoEmpleado: number
  codigoBodega: number
}

// Lo que envía el bodeguero por cada producto
export interface RecepcionDetalleAgregar {
  codigoRecepcion: number
  codigoDetalle: number
  cantidadRecibidaUnidades: number
  precioFacturado: number
  fechaVencimiento?: string
  comentario?: string
}

// Lo que envía el admin al resolver
export interface RecepcionResolver {
  codigoRecepcionDetalle: number
  autorizado: boolean
  nuevoPrecioCosto?: number
}

// La respuesta inmediata al registrar (para la alerta)
export interface RecepcionDetalleRespuesta {
  estadoDetalle: string
  precioAcordado: number
  requiereAutorizacion: boolean
}