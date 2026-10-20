import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { buscarCategoria, editarCategoria } from '../services/categoriaServices'
import type { CategoriaEditar } from '../interfaces/CategoriaEditar'
import './AgregarProveedorPage.css' // se reutilizan los estilos de Proveedores

export default function EditarCategoriaPage() {
  const navigate = useNavigate()
  const { codigoCategoria } = useParams()

  const [categoria, setCategoria] = useState<CategoriaEditar | null>(null)
  const [mensaje, setMensaje] = useState('')
  const [exito, setExito] = useState<boolean | null>(null)

  useEffect(() => {
    const cargar = async () => {
      try {
        const respuesta = await buscarCategoria(Number(codigoCategoria))

        if (respuesta.exito && respuesta.datos) {
          setCategoria(respuesta.datos)
        } else {
          setMensaje(respuesta.mensaje)
          setExito(false)
        }
      } catch {
        setMensaje('No fue posible comunicarse con la API.')
        setExito(false)
      }
    }
    cargar()
  }, [codigoCategoria])

  const manejarCambio = (
    evento: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (!categoria) return
    const { name, value } = evento.target
    setCategoria({ ...categoria, [name]: value })
  }

  const guardarCambios = async (evento: React.FormEvent) => {
    evento.preventDefault()
    if (!categoria) return

    try {
      const respuesta = await editarCategoria(categoria)

      setMensaje(respuesta.mensaje)
      setExito(respuesta.exito)

      if (respuesta.exito) {
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
          <h1 className="agregar-proveedor-title">Editar Categoría</h1>
          <p className="agregar-proveedor-subtitle">
            Modifica los datos de la categoría seleccionada.
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

          {categoria && (
            <form onSubmit={guardarCambios}>
              <div className="row">
                <div className="col-md-12 mb-3">
                  <label className="form-label">Nombre</label>
                  <input type="text" className="form-control" name="nombre"
                    value={categoria.nombre ?? ''} onChange={manejarCambio}
                    maxLength={100} required />
                </div>
              </div>

              <div className="row">
                <div className="col-md-12 mb-3">
                  <label className="form-label">Descripción</label>
                  <textarea className="form-control" name="descripcion" rows={3}
                    value={categoria.descripcion ?? ''} onChange={manejarCambio}
                    maxLength={255} />
                </div>
              </div>

              <div className="agregar-proveedor-actions d-flex gap-2 justify-content-end">
                <Link to="/dashboard/categorias" className="btn btn-secondary">
                  Cancelar
                </Link>
                <button type="submit" className="btn btn-primary">
                  Guardar Cambios
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
