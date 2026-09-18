import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { consultarProveedor } from '../services/proveedorServices'
import type { ProveedorConsulta } from '../interfaces/ProveedorConsulta'
import './ProveedorPage.css'

export default function ProveedorPage() {
  const [proveedores, setProveedores] = useState<ProveedorConsulta[]>([])
  const [mensaje, setMensaje] = useState('')
  const [busqueda, setBusqueda] = useState('')

  const [proveedorSeleccionado, setProveedorSeleccionado] =
    useState<ProveedorConsulta | null>(null)
  const [mostrarModal, setMostrarModal] = useState(false)

  const navigate = useNavigate()

  // Filtro que busca por código, nombre o nit
  const proveedoresFiltrados = proveedores.filter(
    (item) =>
      item.codigoProveedor?.toString().includes(busqueda) ||
      item.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      item.nit?.toLowerCase().includes(busqueda.toLowerCase())
  )

  const verDetalle = (item: ProveedorConsulta) => {
    setProveedorSeleccionado(item)
    setMostrarModal(true)
  }

  const cerrarModal = () => {
    setMostrarModal(false)
    setProveedorSeleccionado(null)
  }

  const editarProveedor = (codigoProveedor: number) => {
    navigate(`/dashboard/proveedores/editar/${codigoProveedor}`)
  }

  const cargarProveedores = async () => {
    try {
      const respuesta = await consultarProveedor()

      if (respuesta.exito && Array.isArray(respuesta.datos)) {
        setProveedores(respuesta.datos)
        setMensaje(respuesta.mensaje)
      } else {
        setProveedores([])
        setMensaje(respuesta.mensaje)
      }
    } catch {
      setProveedores([])
      setMensaje('No fue posible comunicarse con la API.')
    }
  }

  useEffect(() => {
    cargarProveedores()
  }, [])

  return (
    <div className="proveedor-page">
      <div className="proveedor-container">
        {/* ENCABEZADO */}
        <div className="proveedor-header">
          <h1 className="proveedor-title">Consulta de Proveedores</h1>
          <p className="proveedor-subtitle">
            Consulta los proveedores registrados en el sistema.
          </p>
        </div>

        {/* TARJETA */}
        <div className="proveedor-card">
          <div className="proveedor-card-header">
            <h2 className="proveedor-card-title">Proveedores registrados</h2>
            <div className="d-flex align-items-center gap-3">
              <span className="proveedor-total">
                Total: {proveedores.length}
              </span>
              <Link
                to="/dashboard/proveedores/agregar"
                className="btn btn-primary btn-sm"
              >
                + Agregar Proveedor
              </Link>
            </div>
          </div>

          {/* MENSAJE */}
          {mensaje && (
            <div className="alert alert-info proveedor-mensaje" role="alert">
              {mensaje}
            </div>
          )}

          {/* BUSCADOR */}
          <div className="mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Buscar por código, nombre o NIT..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          {/* TABLA */}
          <div className="proveedor-table-container">
            <table className="table table-bordered proveedor-table">
              <thead>
                <tr>
                  <th className="col-codigo">Código</th>
                  <th className="col-nombre">Nombre</th>
                  <th className="col-nit">NIT</th>
                  <th className="col-telefono">Teléfono</th>
                  <th className="col-estado">Estado</th>
                  <th className="col-acciones">Acciones</th>
                </tr>
              </thead>

              <tbody>
                {proveedoresFiltrados.length > 0 ? (
                  proveedoresFiltrados.map((item) => (
                    <tr key={item.codigoProveedor}>
                      <td className="col-codigo">{item.codigoProveedor}</td>
                      <td className="col-nombre">{item.nombre}</td>
                      <td className="col-nit">{item.nit}</td>
                      <td className="col-telefono">{item.telefono}</td>
                      <td className="col-estado">
                        <span
                          className={`badge ${
                            item.estado ? 'bg-success' : 'bg-danger'
                          }`}
                        >
                          {item.estado ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="col-acciones">
                        <div className="d-flex gap-2 justify-content-center">
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => verDetalle(item)}
                            title="Ver Detalle"
                          >
                            Detalle
                          </button>
                          <button
                            className="btn btn-sm btn-outline-warning"
                            onClick={() => editarProveedor(item.codigoProveedor)}
                            title="Editar Proveedor"
                          >
                            Editar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="sin-registros text-center">
                      No existen proveedores registrados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL DETALLE */}
      {mostrarModal && proveedorSeleccionado && (
        <div
          className="modal d-block"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        >
          <div className="modal-dialog">
            <div className="modal-content p-3">
              <h5>Detalle del proveedor</h5>
              <hr />
              <p>
                <strong>Código Proveedor:</strong>{' '}
                {proveedorSeleccionado.codigoProveedor}
              </p>
              <p>
                <strong>Nombre:</strong> {proveedorSeleccionado.nombre}
              </p>
              <p>
                <strong>NIT:</strong> {proveedorSeleccionado.nit}
              </p>
              <p>
                <strong>Teléfono:</strong> {proveedorSeleccionado.telefono}
              </p>
              <p>
                <strong>Estado:</strong>{' '}
                {proveedorSeleccionado.estado ? 'Activo' : 'Inactivo'}
              </p>
              <div className="text-end mt-3">
                <button className="btn btn-secondary" onClick={cerrarModal}>
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}