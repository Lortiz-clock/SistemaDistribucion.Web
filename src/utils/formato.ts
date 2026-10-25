export const formatoQuetzales = (valor: number) =>
  `Q ${valor.toLocaleString('es-GT', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`

export const formatoFecha = (fecha: string | null) =>
  fecha ? new Date(fecha).toLocaleDateString('es-GT') : 'N/A'