import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { agregarProveedor } from '../services/proveedorServices'
import type { ProveedorAgregar } from '../interfaces/ProveedorAgregar'
import './AgregarProveedorPage.css'

export default function AgregarProveedorPage() {
  const navigate = useNavigate()

  const [proveedor, setProveedor] = useState<ProveedorAgregar>({
    nombre: '',
    nit: '',
    telefono: '',
    estado: true
  })

  const [mensaje, setMensaje] = useState('')
  const [exito, setExito] = useState<boolean | null>(null)

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
      const respuesta = await agregarProveedor(proveedor)

      setMensaje(respuesta.mensaje)
      setExito(respuesta.exito)

      if (respuesta.exito) {
        setProveedor({
          nombre: '',
          nit: '',
          telefono: '',
          estado: true
        })
        setTimeout(() => navigate('/dashboard/proveedores'), 1000)
      }
    } catch {
      setMensaje('No fue posible comunicarse con la API.')
      setExito(false)
    }
  }

  return (
    <div className="agregar-proveedor-page">
      <div className="agregar-proveedor-container">
        {/* ENCABEZADO */}
        <div className="agregar-proveedor-header">
          <h1 className="agregar-proveedor-title">Agregar Proveedor</h1>
          <p className="agregar-proveedor-subtitle">
            Registra un nuevo proveedor en el sistema.
          </p>
        </div>

        {/* TARJETA */}
        <div className="agregar-proveedor-card">
          <div className="agregar-proveedor-card-header">
            <h2>Información del Proveedor</h2>
          </div>

          {/* MENSAJE DE ALERTA */}
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
                Guardar Proveedor
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}