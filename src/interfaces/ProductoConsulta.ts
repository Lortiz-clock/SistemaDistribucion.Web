export interface ProductoConsulta {
    codigoProducto : number
    nombre : string
    costo : number
    margenMinimo : number
    precioMinimo : number
    stockMinimo : number
    estado : boolean
    codigoCategoria : number
    fechaVencimiento : string
    diasVencimiento : number
    unidadesPorCaja : number
}