export interface ClienteRutaConsulta {
    codigoClienteRuta: number
    codigoCliente: number
    nombreCliente: string
    codigoRuta: number
    diaSemana: number
    nombreVendedor: string
    ordenVisita: number
    fechaInicio: string
    fechaFin: string | null
    vigente: boolean
}
