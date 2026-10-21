export interface InventarioLote {
    codigoProductoBodega: number
    producto: string
    bodega: string
    codigoDetalle: number
    cantidad: number
    fechaVencimiento: string | null
    precioCosto: number
    estado: string
}

export interface InventarioHistorial {
    codigoAjuste: number
    codigoProductoBodega: number
    producto: string
    bodega: string
    tipoAjuste: string
    cantidad: number
    cantidadAnterior: number
    cantidadNueva: number
    motivo: string
    usuario: string
    fechaAjuste: string
}

export interface InventarioAjustar {
    codigoProductoBodega: number
    tipoAjuste: 'Descuento' | 'Incremento'
    cantidad: number
    motivo: string
    codigoUsuario: number | null
}