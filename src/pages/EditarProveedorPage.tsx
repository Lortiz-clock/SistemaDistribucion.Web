import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { buscarProveedor, editarProveedor } from '../services/proveedorServices'
import type { EditarProveedor } from '../interfaces/ProveedorEditar'
import './AgregarProveedorPage.css'

export default function EditarProveedorPage() {
  const { codigoProveedor } = useParams()
  const navigate = useNavigate()

  const [proveedor, setProveedor] = useState<EditarProveedor>({
    codigoProveedor: 0,
    nombre: '',
    nit: '',
    telefono: '',
    estado: true
  })

  const [mensaje, setMensaje] = useState('')
  const [exito, setExito] = useState<boolean | null>(null)
  const [cargando, setCargando] = useState(true)

  const cargarProveedor = async () => {
    try {
      const respuesta = await buscarProveedor(Number(codigoProveedor))

      if (respuesta.exito && respuesta.datos) {
        setProveedor({
          codigoProveedor: respuesta.datos.codigoProveedor,
          nombre: respuesta.datos.nombre,
          nit: respuesta.datos.nit,
          telefono: respuesta.datos.telefono,
          estado: respuesta.datos.estado
        })
      } else {
        setMensaje(respuesta.mensaje)
        setExito(false)
      }
    } catch {
      setMensaje('No fue posible comunicarse con la API.')
      setExito(false)
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargarProveedor()
  }, [codigoProveedor])

  const manejarCambio = (
    evento: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = evento.target

    setProveedor({
      ...proveedor,
      [name]: name === 'estado' ? value === 'true' : value
    })
  }

  const guardarProveedor = async (evento: React.FormEvent) => {
    evento.preventDefault()

    try {
      const respuesta = await editarProveedor(proveedor)

      setMensaje(respuesta.mensaje)
      setExito(respuesta.exito)

      if (respuesta.exito) {
        setTimeout(() => navigate('/dashboard/proveedores'), 1000)
      }
    } catch {
      setMensaje('No fue posible comunicarse con la API.')
      setExito(false)
    }
  }

  if (cargando) {
    return (
      <div className="text-center my-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <p className="mt-2">Cargando datos del proveedor...</p>
      </div>
    )
  }

  return (
    <div className="agregar-proveedor-page">
      <div className="agregar-proveedor-container">
        {/* ENCABEZADO */}
        <div className="agregar-proveedor-header">
          <h1 className="agregar-proveedor-title">Editar Proveedor</h1>
          <p className="agregar-proveedor-subtitle">
            Modifica los datos del proveedor seleccionado.
          </p>
        </div>

        {/* TARJETA */}
        <div className="agregar-proveedor-card">
          <div className="agregar-proveedor-card-header">
            <h2>Información del Proveedor</h2>
          </div>

          {/* ALERTA DE MENSAJE */}
          {mensaje && (
            <div className={exito ? 'alert alert-success' : 'alert alert-danger'}>
              {mensaje}
            </div>
          )}

          <form onSubmit={guardarProveedor}>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">NIT</label>
                <input
                  type="text"
                  className="form-control"
                  name="nit"
                  value={proveedor.nit}
                  onChange={manejarCambio}
                  placeholder="Ingrese el NIT"
                  required
                />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Nombre del Proveedor</label>
                <input
                  type="text"
                  className="form-control"
                  name="nombre"
                  value={proveedor.nombre}
                  onChange={manejarCambio}
                  placeholder="Ingrese el nombre"
                  required
                />
              </div>
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Teléfono</label>
                <input
                  type="text"
                  className="form-control"
                  name="telefono"
                  value={proveedor.telefono}
                  onChange={manejarCambio}
                  placeholder="Ingrese el teléfono"
                  required
                />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Estado</label>
                <select
                  className="form-select"
                  name="estado"
                  value={String(proveedor.estado)}
                  onChange={manejarCambio}
                >
                  <option value="true">Activo</option>
                  <option value="false">Inactivo</option>
                </select>
              </div>
            </div>

            {/* BOTONES DE ACCIÓN */}
            <div className="agregar-proveedor-actions d-flex gap-2 justify-content-end">
              <Link to="/dashboard/proveedores" className="btn btn-secondary">
                Cancelar
              </Link>
              <button type="submit" className="btn btn-primary">
                Guardar Cambios
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}