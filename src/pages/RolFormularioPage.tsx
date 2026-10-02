import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { agregarRol, buscarRol, editarRol } from '../services/rolService'
import { consultarModulos } from '../services/moduloService'   // 👈 NUEVO
import type { ModuloPermiso, RolGuardar } from '../interfaces/Rol'
import './RolesPage.css'

function RolFormularioPage() {

  const navigate = useNavigate()
  const { codigoRol } = useParams()
  const esEdicion = !!codigoRol

  const [nombre, setNombre] = useState('')
  const [descripcionRol, setDescripcionRol] = useState('')
  const [estado, setEstado] = useState(true)
  const [modulos, setModulos] = useState<ModuloPermiso[]>([])

  const [mensaje, setMensaje] = useState('')
  const [exito, setExito] = useState<boolean | null>(null)
  const [cargando, setCargando] = useState(true)   // 👈 ahora carga en AMBOS modos

  useEffect(() => {
    const cargar = async () => {
      try {
        if (esEdicion) {
          // ═══ MODO EDITAR: el rol trae sus módulos con Asignado pre-marcado ═══
          const respuesta = await buscarRol(Number(codigoRol))

          if (respuesta.exito && respuesta.datos) {
            setNombre(respuesta.datos.nombre)
            setDescripcionRol(respuesta.datos.descripcionRol)
            setEstado(respuesta.datos.estado)
            setModulos(respuesta.datos.modulos)
          } else {
            setMensaje(respuesta.mensaje || 'No se encontró el rol.')
            setExito(false)
          }
        } else {
          // ═══ MODO AGREGAR: catálogo completo, todo sin asignar ═══
          const respuesta = await consultarModulos()

          if (respuesta.exito && respuesta.datos) {
            setModulos(
              respuesta.datos
                .filter((m) => m.estado)   // solo módulos activos son asignables
                .map((m) => ({
                  codigoModulo: m.codigoModulo,
                  nombre: m.nombre,
                  rutaFront: m.rutaFront,
                  icono: m.icono,
                  asignado: false,
                  permiteConsultar: false,
                  permiteAgregar: false,
                  permiteEditar: false,
                  permiteAnular: false
                }))
            )
          } else {
            setMensaje(respuesta.mensaje || 'No se pudieron cargar los módulos.')
            setExito(false)
          }
        }
      } catch {
        setMensaje('No fue posible comunicarse con la API.')
        setExito(false)
      } finally {
        setCargando(false)
      }
    }

    cargar()
  }, [codigoRol, esEdicion])

  // ... toggleAsignado, togglePermiso y guardarRol IGUAL que antes ...
  const toggleAsignado = (codigoModulo: number) => {
    setModulos(modulos.map((m) =>
      m.codigoModulo === codigoModulo
        ? {
            ...m,
            asignado: !m.asignado,
            permiteConsultar: !m.asignado,
            permiteAgregar: false,
            permiteEditar: false,
            permiteAnular: false
          }
        : m
    ))
  }

  const togglePermiso = (
    codigoModulo: number,
    campo: 'permiteConsultar' | 'permiteAgregar' | 'permiteEditar' | 'permiteAnular'
  ) => {
    setModulos(modulos.map((m) =>
      m.codigoModulo === codigoModulo ? { ...m, [campo]: !m[campo] } : m
    ))
  }

  const guardarRol = async (evento: React.FormEvent) => {
    evento.preventDefault()

    const asignados = modulos.filter((m) => m.asignado)

    if (asignados.length === 0) {
      setMensaje('Debes asignar al menos un módulo al rol.')
      setExito(false)
      return
    }

    const payload: RolGuardar = {
      codigoRol: esEdicion ? Number(codigoRol) : 0,
      nombre,
      descripcionRol,
      estado,
      modulos: asignados.map((m) => ({
        codigoModulo: m.codigoModulo,
        permiteConsultar: m.permiteConsultar,
        permiteAgregar: m.permiteAgregar,
        permiteEditar: m.permiteEditar,
        permiteAnular: m.permiteAnular
      }))
    }

    try {
      const respuesta = esEdicion ? await editarRol(payload) : await agregarRol(payload)

      setMensaje(respuesta.mensaje)
      setExito(respuesta.exito)

      if (respuesta.exito) {
        setTimeout(() => navigate('/dashboard/roles'), 1200)
      }
    } catch {
      setMensaje('No fue posible comunicarse con la API.')
      setExito(false)
    }
  }

  if (cargando) {
    return (
      <div className="roles-page">
        <div className="roles-container">
          <p className="text-muted">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="roles-page">
      <div className="roles-container">

        <div className="roles-header">
          <h1 className="roles-title">
            {esEdicion ? 'Editar Rol' : 'Agregar Rol'}
          </h1>
          <p className="roles-subtitle">
            {esEdicion
              ? 'Modifica la información y los permisos del rol.'
              : 'Registra un nuevo rol con sus módulos y permisos.'}
          </p>
        </div>

        <div className="roles-card roles-form-card">

          {mensaje && (
            <div className={exito ? 'alert alert-success mx-3 mt-3' : 'alert alert-danger mx-3 mt-3'}>
              {mensaje}
            </div>
          )}

          <form onSubmit={guardarRol} className="p-3">

            {/* ═══ DATOS GENERALES ═══ */}
            <div className="row mb-4">
              <div className="col-md-4 mb-3">
                <label className="form-label">Nombre del Rol *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Nombre"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                />
                <small className="text-muted"></small>
              </div>

              <div className="col-md-5 mb-3">
                <label className="form-label">Descripción</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Descripcion"
                  value={descripcionRol}
                  onChange={(e) => setDescripcionRol(e.target.value)}
                />
                <small className="text-muted"></small>
              </div>

              <div className="col-md-3 mb-3">
                <label className="form-label">Estado</label>
                <select
                  className="form-select"
                  value={String(estado)}
                  onChange={(e) => setEstado(e.target.value === 'true')}
                >
                  <option value="true">Activo</option>
                  <option value="false">Inactivo</option>
                </select>
                <small className="text-muted"></small>
              </div>
            </div>

            {/* ═══ TABLA DE CHECKBOXES ═══ */}
            <h5 className="mb-1">Módulos y Permisos</h5>
            <p className="text-muted mb-3" style={{ fontSize: '13px' }}>
              Marca y <strong>Asigna</strong> los módulos para el rol
            </p>

            <div className="table-responsive mb-4">
              <table className="table table-bordered align-middle permisos-table">
                <thead className="table-dark">
                  <tr>
                    <th style={{ width: '90px' }} className="text-center">Asignar</th>
                    <th>Módulo</th>
                    <th className="text-center">Consultar</th>
                    <th className="text-center">Agregar</th>
                    <th className="text-center">Editar</th>
                    <th className="text-center">Anular</th>
                  </tr>
                </thead>
                <tbody>
                  {modulos.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center text-muted py-4">
                        No hay módulos activos para asignar.
                      </td>
                    </tr>
                  ) : (
                    modulos.map((modulo) => (
                      <tr
                        key={modulo.codigoModulo}
                        className={modulo.asignado ? '' : 'fila-no-asignada'}
                      >
                        <td className="text-center">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={modulo.asignado}
                            onChange={() => toggleAsignado(modulo.codigoModulo)}
                            title="Marcar para que este rol vea el módulo en su menú"
                          />
                        </td>
                        <td>{modulo.nombre}</td>
                        <td className="text-center">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={modulo.permiteConsultar}
                            disabled={!modulo.asignado}
                            onChange={() => togglePermiso(modulo.codigoModulo, 'permiteConsultar')}
                          />
                        </td>
                        <td className="text-center">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={modulo.permiteAgregar}
                            disabled={!modulo.asignado}
                            onChange={() => togglePermiso(modulo.codigoModulo, 'permiteAgregar')}
                          />
                        </td>
                        <td className="text-center">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={modulo.permiteEditar}
                            disabled={!modulo.asignado}
                            onChange={() => togglePermiso(modulo.codigoModulo, 'permiteEditar')}
                          />
                        </td>
                        <td className="text-center">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={modulo.permiteAnular}
                            disabled={!modulo.asignado}
                            onChange={() => togglePermiso(modulo.codigoModulo, 'permiteAnular')}
                          />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="d-flex justify-content-end gap-2 roles-actions">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => navigate('/dashboard/roles')}
              >
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary">
                💾 Guardar Rol
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  )
}

export default RolFormularioPage