import { useState } from 'react'
import { agregarProducto } from '../services/productoServices'
import type { ProductoAgregar } from '../interfaces/ProductoAgregar'
import './AgregarProductoPage.css'
import { useNavigate } from 'react-router-dom'

export default function AgregarProductoPage() {
  const [producto, setProducto] = useState<ProductoAgregar>({
    codigoCategoria: 0,
    codigoMarca: 0,
    nombre: '',
    unidadesCaja: 0,
    estado: true,
  })

  const navigate = useNavigate()
  const [mensaje, setMensaje] = useState('')
  const [exito, setExito] = useState<boolean | null>(null)

  const manejarCambio = (
    evento: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = evento.target

    setProducto({
      ...producto,
      [name]:
        name === 'codigoCategoria' || name === 'codigoMarca' || name === 'unidadesCaja'
          ? Number(value)
          : name === 'estado'
          ? value === 'true'
          : value,
    })
  }

  const guardarProducto = async (evento: React.FormEvent) => {
    evento.preventDefault()

    try {
      const respuesta = await agregarProducto(producto)

      setMensaje(respuesta.mensaje)
      setExito(respuesta.exito)

      if (respuesta.exito) {
        setProducto({
          codigoCategoria: 0,
          codigoMarca: 0,
          nombre: '',
          unidadesCaja: 0,
          estado: true,
        })
      }
    } catch {
      setMensaje('No fue posible comunicarse con la API.')
      setExito(false)
    }
  }

  return (
    <div className="agregar-producto-page">
      <div className="agregar-producto-container">
        <div className="agregar-producto-header">
          <h1 className="agregar-producto-title">Agregar Producto</h1>
          <p className="agregar-producto-subtitle">
            Registra un nuevo producto en el catálogo.
          </p>
        </div>

        <div className="agregar-producto-card">
          <div className="agregar-producto-card-header">
            <h2>Información del Producto</h2>
          </div>

          {mensaje && (
            <div
              className={
                exito ? 'alert alert-success' : 'alert alert-danger'
              }
            >
              {mensaje}
            </div>
          )}

          <form onSubmit={guardarProducto}>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Código Categoría</label>
                <input
                  type="number"
                  className="form-control"
                  name="codigoCategoria"
                  value={producto.codigoCategoria}
                  onChange={manejarCambio}
                  min="1"
                  required
                />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Código Marca</label>
                <input
                  type="number"
                  className="form-control"
                  name="codigoMarca"
                  value={producto.codigoMarca}
                  onChange={manejarCambio}
                  min="1"
                  required
                />
              </div>
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Nombre del Producto</label>
                <input
                  type="text"
                  className="form-control"
                  name="nombre"
                  value={producto.nombre}
                  onChange={manejarCambio}
                  maxLength={100}
                  required
                />
              </div>

              <div className="col-md-3 mb-3">
                <label className="form-label">Unidades por Caja</label>
                <input
                  type="number"
                  className="form-control"
                  name="unidadesCaja"
                  value={producto.unidadesCaja}
                  onChange={manejarCambio}
                  min="1"
                  required
                />
              </div>

              <div className="col-md-3 mb-3">
                <label className="form-label">Estado</label>
                <select
                  className="form-select"
                  name="estado"
                  value={String(producto.estado)}
                  onChange={manejarCambio}
                >
                  <option value="true">Activo</option>
                  <option value="false">Inactivo</option>
                </select>
              </div>
            </div>

            <div className="agregar-producto-actions">
              <button type="submit" className="btn btn-primary">
                Guardar Producto
              </button>

              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate('/dashboard/productos')}
              >
                Regresar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}