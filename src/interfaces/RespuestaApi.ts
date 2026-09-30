export interface RespuestaApi<T> {
  exito: boolean
  mensaje: string
  datos: T | null
  detalle: string | null
}
