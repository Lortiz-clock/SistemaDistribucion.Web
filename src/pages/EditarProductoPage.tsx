import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { buscarProducto, editarProducto } from '../services/productoServices'
import type { ProductoEditar } from '../interfaces/ProductoEditar'

export default function EditarProductoPage() {
  const { codigoProducto } = useParams()
  const navigate = useNavigate()

  const [producto, setProducto] = useState<ProductoEditar>({
    codigoProducto: 0,
    codigoCategoria: 0,
    codigoMarca: 0,
    nombre: '',
    unidadesCaja: 0,
    estado: true
  })

  const [mensaje, setMensaje] = useState('')
  const [exito, setExito] = useState<boolean | null>(null)
  const [cargando, setCargando] = useState(true)

  const cargarProducto = async () => {
    try {
      const respuesta = await buscarProducto(Number(codigoProducto))

      if (respuesta.exito && respuesta.datos) {
        setProducto({
          codigoProducto: respuesta.datos.codigoProducto,
          codigoCategoria: respuesta.datos.codigoCategoria,
          codigoMarca: respuesta.datos.codigoMarca,
          nombre: respuesta.datos.nombre,
          unidadesCaja: respuesta.datos.unidadesCaja,
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
    cargarProducto()
  }, [codigoProducto])

  const manejarCambio = (
    evento: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = evento.target

    setProducto({
      ...producto,
      [name]:
        name === 'codigoCategoria' || name === 'codigoMarca' || name === 'unidadesCaja'
          ? Number(value)
          : name === 'estado'
            ? value === 'true'
            : value
    })
  }

  const guardarProducto = async (evento: React.FormEvent) => {
    evento.preventDefault()

    try {
      const respuesta = await editarProducto(producto)

      setMensaje(respuesta.mensaje)
      setExito(respuesta.exito)

      if (respuesta.exito) {
        setTimeout(() => navigate('/dashboard/productos'), 1000)
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
        <p className="mt-2">Cargando datos del producto...</p>
      </div>
    )
  }

  return (
    <div className="agregar-producto-page">
      <div className="agregar-producto-container">
        <div className="agregar-producto-header">
          <h1 className="agregar-producto-title">Editar Producto</h1>
          <p className="agregar-producto-subtitle">
            Modifica la información del producto seleccionado.
          </p>
        </div>

        <div className="agregar-producto-card">
          <div className="agregar-producto-card-header">
            <h2>Información del Producto</h2>
          </div>

          {mensaje && (
            <div className={exito ? 'alert alert-success' : 'alert alert-danger'}>
              {mensaje}
            </div>
          )}

          <form onSubmit={guardarProducto}>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Nombre del Producto</label>
                <input
                  type="text"
                  className="form-control"
                  name="nombre"
                  value={producto.nombre}
                  onChange={manejarCambio}
                  required
                />
              </div>

              <div className="col-md-6 mb-3">
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
            </div>

            <div className="row">
              <div className="col-md-4 mb-3">
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

              <div className="col-md-4 mb-3">
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

              <div className="col-md-4 mb-3">
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

            <div className="agregar-producto-actions d-flex gap-2 justify-content-end">
              <Link to="/dashboard/productos" className="btn btn-secondary">
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