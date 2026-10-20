import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { agregarCategoria } from '../services/categoriaServices'
import type { CategoriaAgregar } from '../interfaces/CategoriaAgregar'
import './AgregarProveedorPage.css' // se reutilizan los estilos de Proveedores

export default function AgregarCategoriaPage() {
  const navigate = useNavigate()

  const [categoria, setCategoria] = useState<CategoriaAgregar>({
    nombre: '',
    descripcion: ''
  })

  const [mensaje, setMensaje] = useState('')
  const [exito, setExito] = useState<boolean | null>(null)

  const manejarCambio = (
    evento: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = evento.target
    setCategoria({ ...categoria, [name]: value })
  }

  const guardarCategoria = async (evento: React.FormEvent) => {
    evento.preventDefault()

    try {
      const respuesta = await agregarCategoria(categoria)

      setMensaje(respuesta.mensaje)
      setExito(respuesta.exito)

      if (respuesta.exito) {
        setCategoria({ nombre: '', descripcion: '' })
        setTimeout(() => navigate('/dashboard/categorias'), 1000)
      }
    } catch {
      setMensaje('No fue posible comunicarse con la API.')
      setExito(false)
    }
  }

  return (
    <div className="agregar-proveedor-page">
      <div className="agregar-proveedor-container">
        <div className="agregar-proveedor-header">
          <h1 className="agregar-proveedor-title">Agregar Categoría</h1>
          <p className="agregar-proveedor-subtitle">
            Registra una nueva categoría en el sistema.
          </p>
        </div>

        <div className="agregar-proveedor-card">
          <div className="agregar-proveedor-card-header">
            <h2>Información de la Categoría</h2>
          </div>

          {mensaje && (
            <div className={exito ? 'alert alert-success' : 'alert alert-danger'}>
              {mensaje}
            </div>
          )}

          <form onSubmit={guardarCategoria}>
            <div className="row">
              <div className="col-md-12 mb-3">
                <label className="form-label">Nombre</label>
                <input type="text" className="form-control" name="nombre"
                  value={categoria.nombre} onChange={manejarCambio}
                  placeholder="Ingrese el nombre" maxLength={100} required />
              </div>
            </div>

            <div className="row">
              <div className="col-md-12 mb-3">
                <label className="form-label">Descripción</label>
                <textarea className="form-control" name="descripcion" rows={3}
                  value={categoria.descripcion} onChange={manejarCambio}
                  placeholder="Ingrese la descripción" maxLength={255} />
              </div>
            </div>

            <div className="agregar-proveedor-actions d-flex gap-2 justify-content-end">
              <Link to="/dashboard/categorias" className="btn btn-secondary">
                Cancelar
              </Link>
              <button type="submit" className="btn btn-primary">
                Guardar Categoría
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
