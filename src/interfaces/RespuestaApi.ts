export interface RespuestaApi<T> {
  exito: boolean
  mensaje: string
  datos: T
  detalle: string | null
}
