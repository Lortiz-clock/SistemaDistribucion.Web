export interface AgregarCliente {
     nombre: string
    nit: string
    telefono?: string | null
    direccion: string
    referencia: string
    latitud: number | null
    longitud: number | null
    estado: boolean
}