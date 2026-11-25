export interface ClientesConsulta {
    codigoCliente: number
    nombre: string
    nit: string
    telefono?: string | null
    direccion: string
    referencia: string
    latitud: number
    longitud: number
    estado: number
}