export interface SemaforoUtilidad {
  utilidadAcumulada: number
  metaSemanal: number
  porcentajeAcumulado: number
  proyeccionFinSemana: number
  porcentajeProyeccion: number
  diasTranscurridos: number
  diasTotales: number
  diasConVenta: number
  color: 'VERDE' | 'AMARILLO' | 'ROJO' | 'GRIS'
  utilidadDia: number
  metaDiaria: number
  porcentajeDia: number
  colorDia: 'VERDE' | 'AMARILLO' | 'ROJO' | 'GRIS'
}