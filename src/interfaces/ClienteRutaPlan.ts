export interface ClienteRutaPlan {
  codigoRuta: number
  codigoClienteRuta: number
  codigoCliente: number
  nombreCliente: string
  direccion: string
  ordenVisita: number
  latitud: number | null  
  longitud: number | null
}