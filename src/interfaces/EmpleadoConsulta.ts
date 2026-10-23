export interface EmpleadoConsulta {
    codigoEmpleado: number
    telefono: string
    fechaIngreso: string | null
    estado: boolean
    primerNombre: string
    segundoNombre: string
    primerApellido: string
    segundoApellido: string
    codigoPuesto: number | null
    nombrePuesto: string
    dpi: string
    fechaNacimiento: string | null
    codigoEstadoCivil: number | null
    nombreEstadoCivil: string
    profesion: string
    extendidoEn: string
    direccion: string
}
