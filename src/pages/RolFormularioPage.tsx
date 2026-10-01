import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { agregarRol, buscarRol, editarRol } from '../services/rolService'
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
  const [cargando, setCargando] = useState(esEdicion)

  // CARGA (solo edición): rol + todos los módulos con Asignado
  useEffect(() => {
    if (!esEdicion) return

    const cargarRol = async () => {
      try {
        const respuesta = await buscarRol(Number(codigoRol))

        if (respuesta.exito && respuesta.datos) {
          setNombre(respuesta.datos.nombre)
          setDescripcionRol(respuesta.datos.descripcionRol)
          setEstado(respuesta.datos.estado)
          setModulos(respuesta.datos.modulos)   // pre-llena los checkboxes
        } else {
          setMensaje(respuesta.mensaje || 'No se encontró el rol.')
          setExito(false)
        }
      } catch {
        setMensaje('No fue posible comunicarse con la API.')
        setExito(false)
      } finally {
        setCargando(false)
      }
    }

    cargarRol()
  }, [codigoRol, esEdicion])

  // Check maestro: asigna/desasigna el módulo completo
  const toggleAsignado = (codigoModulo: number) => {
    setModulos(modulos.map((m) =>
      m.codigoModulo === codigoModulo
        ? {
            ...m,
            asignado: !m.asignado,
            permiteConsultar: !m.asignado,   // al asignar, Consultar va por defecto
            permiteAgregar: false,
            permiteEditar: false,
            permiteAnular: false
          }
        : m
    ))
  }

  // Check individual de cada permiso
  const togglePermiso = (
    codigoModulo: number,
    campo: 'permiteConsultar' | 'permiteAgregar' | 'permiteEditar' | 'permiteAnular'
  ) => {
    setModulos(modulos.map((m) =>
      m.codigoModulo === codigoModulo ? { ...m, [campo]: !m[campo] } : m
    ))
  }

  // GUARDAR: solo se envían los módulos marcados
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
          <p className="text-muted">Cargando rol...</p>
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

            {/* DATOS GENERALES */}
            <div className="row mb-4">
              <div className="col-md-4 mb-3">
                <label className="form-label">Nombre del Rol</label>
                <input
                  type="text"
                  className="form-control"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                />
              </div>

              <div className="col-md-5 mb-3">
                <label className="form-label">Descripción</label>
                <input
                  type="text"
                  className="form-control"
                  value={descripcionRol}
                  onChange={(e) => setDescripcionRol(e.target.value)}
                />
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
              </div>
            </div>

            {/* ═══════ TABLA DE CHECKBOXES ═══════ */}
            <h5 className="mb-3">Módulos y Permisos</h5>

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
                  {modulos.map((modulo) => (
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
                  ))}
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