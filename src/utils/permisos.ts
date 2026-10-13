// src/utils/permisos.ts
import type { Modulo } from '../interfaces/UsuarioLogin'

export type Permiso = 'permiteConsultar' | 'permiteAgregar' | 'permiteEditar' | 'permiteAnular'

export function obtenerModulos(): Modulo[] {
  return JSON.parse(localStorage.getItem('modulos') ?? '[]')
}

// ¿Puede hacer X acción en el módulo con esa ruta?
export function tienePermiso(rutaModulo: string, permiso: Permiso): boolean {
  const modulo = obtenerModulos().find((m) => m.rutaFront === rutaModulo)
  return modulo ? modulo[permiso] : false
}

// ¿Tiene acceso al módulo (aunque sea solo verlo)?
export function tieneAcceso(rutaModulo: string): boolean {
  return obtenerModulos().some((m) => m.rutaFront === rutaModulo)
}