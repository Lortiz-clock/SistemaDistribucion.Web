import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { consultarVendedores, desactivarVendedor } from '../services/vendedorServices'
import type { VendedorConsulta } from '../interfaces/VendedorConsulta'
import './ProveedorPage.css' // se reutilizan los estilos de Proveedores

export default function VendedorPage() {
  const [vendedores, setVendedores] = useState<VendedorConsulta[]>([])
  const [mensaje, setMensaje] = useState('')
  const [busqueda, setBusqueda] = useState('')

  const navigate = useNavigate()

  const filtrados = vendedores.filter(
    (item) =>
      item.codigoVendedor?.toString().includes(busqueda) ||
      item.nombreEmpleado?.toLowerCase().includes(busqueda.toLowerCase()) ||
      item.telefono?.toLowerCase().includes(busqueda.toLowerCase())
  )

  const cargar = async () => {
    try {
      const respuesta = await consultarVendedores()

      if (respuesta.exito && Array.isArray(respuesta.datos)) {
        setVendedores(respuesta.datos)
      } else {
        setVendedores([])
      }
      setMensaje(respuesta.mensaje)
    } catch {
      setVendedores([])
      setMensaje('No fue posible comunicarse con la API.')
    }
  }

  const desactivar = async (codigoVendedor: number) => {
    if (!window.confirm('¿Desactivar este vendedor? Quedará inactivo, pero se conserva su historial.')) return

    try {
      const respuesta = await desactivarVendedor(codigoVendedor)
      setMensaje(respuesta.mensaje)
      if (respuesta.exito) await cargar()
    } catch {
      setMensaje('No se pudo desactivar el vendedor.')
    }
  }

  useEffect(() => {
    cargar()
  }, [])

  return (
    <div className="proveedor-page pagina-lista">
      <div className="proveedor-container pagina-lista-interna">
        <div className="proveedor-header">
          <h1 className="proveedor-title">Consulta de Vendedores</h1>
          <p className="proveedor-subtitle">
            Consulta los vendedores registrados en el sistema.
          </p>
        </div>

        <div className="proveedor-card tarjeta-lista">
          <div className="proveedor-card-header">
            <h2 className="proveedor-card-title">Vendedores registrados</h2>
            <div className="d-flex align-items-center gap-3">
              <span className="proveedor-total">Total: {vendedores.length}</span>
              <Link to="/dashboard/vendedores/agregar" className="btn btn-primary btn-sm">
                + Agregar Vendedor
              </Link>
            </div>
          </div>

          {mensaje && (
            <div className="alert alert-info proveedor-mensaje" role="alert">
              {mensaje}
            </div>
          )}

          <div className="mb-3 flex-shrink-0">
            <input
              type="text"
              className="form-control"
              placeholder="Buscar por código, nombre o teléfono..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          <div className="proveedor-table-container tabla-scroll">
            <table className="table table-bordered proveedor-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Empleado</th>
                  <th>Teléfono</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {filtrados.length > 0 ? (
                  filtrados.map((item) => (
                    <tr key={item.codigoVendedor}>
                      <td>{item.codigoVendedor}</td>
                      <td>{item.nombreEmpleado}</td>
                      <td>{item.telefono}</td>
                      <td>
                        <span className={`badge ${item.estado ? 'bg-success' : 'bg-secondary'}`}>
                          {item.estado ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex gap-2 justify-content-center">
                          <button
                            className="btn btn-sm btn-outline-warning"
                            onClick={() =>
                              navigate(`/dashboard/vendedores/editar/${item.codigoVendedor}`)
                            }
                          >
                            Editar
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => desactivar(item.codigoVendedor)}
                            disabled={!item.estado}
                            title={item.estado ? 'Desactivar vendedor' : 'Ya está inactivo'}
                          >
                            Desactivar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="sin-registros text-center">
                      No existen vendedores registrados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
