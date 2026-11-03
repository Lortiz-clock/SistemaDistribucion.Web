export interface MetaConsulta{
    codigoMeta: number
    codigoEmpleado: number
    utilidadSemanal: number
    vigenteDesde: string
    estado:boolean
}
 export interface MetaAgregar{
    codigoEmpleado: number
    utilidadSemanal: number
    vigenteDesde: string
    estado:boolean
 }

 export interface MetaEditar{
    codigoMeta: number
    estado:boolean
 }