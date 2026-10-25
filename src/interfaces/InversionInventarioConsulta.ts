export interface InversionBodegaConsulta {
  codigoBodega: number
  nombre: string
  inversion: number
}

export interface InversionInventarioConsulta {
  inversionTotal: number
  porBodega: InversionBodegaConsulta[]
}