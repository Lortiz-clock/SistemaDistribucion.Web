import { useState, useEffect } from 'react'
import { agregarProducto } from '../services/productoService'
import type { ProductoAgregar } from '../interfaces/ProductoAgregar'
import './AgregarProductoPage.css'
import { useNavigate } from 'react-router-dom'
import { consultaCategoria } from '../services/categoriaServices'
import type { CategoriaConsulta } from '../interfaces/CategoriaConsulta'
import { consultarMarcas } from '../services/marcaService'
import type { MarcaConsulta } from '../interfaces/MarcaConsulta'

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

  const [categorias, setCategorias] = useState<CategoriaConsulta[]>([])
  const [busquedaCategoria, setBusquedaCategoria] = useState('')
  const [mostrarCategorias, setMostrarCategorias] = useState(false)

  const [marcas, setMarcas] = useState<MarcaConsulta[]>([])
  const [busquedaMarca, setBusquedaMarca] = useState('')
  const [mostrarMarcas, setMostrarMarcas] = useState(false)


  useEffect(() => {
    const cargarCategorias = async () => {
      try {
        const respuesta = await consultaCategoria()

        if (respuesta.exito && respuesta.datos) {
          setCategorias(respuesta.datos)
        }
      } catch {
        setMensaje('No fue posible cargar las categorias')
        setExito(false)
      }
    }

    cargarCategorias()
  }, [])

  useEffect(() => {
    const cargarMarcasas = async () => {
      try {
        const respuesta = await consultarMarcas()

        if (respuesta.exito && respuesta.datos) {
          setMarcas(respuesta.datos)
        }
      } catch {
        setMensaje('No fue posible cargar las marcas')
        setExito(false)
      }
    }

    cargarMarcasas()
  }, [])

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

  const manejarBusquedaCategoria = (
    evento: React.ChangeEvent<HTMLInputElement>
  ) => {
    setBusquedaCategoria(evento.target.value)
    setProducto({ ...producto, codigoCategoria: 0 })
    setMostrarCategorias(true)
  }

  const seleccionarCategoria = (categoria: CategoriaConsulta) => {
    setProducto({ ...producto, codigoCategoria: categoria.codigoCategoria })
    setBusquedaCategoria(categoria.nombre)
    setMostrarCategorias(false)
  }

  const manejarBusquedaMarca = (evento: React.ChangeEvent<HTMLInputElement>) => {
  setBusquedaMarca(evento.target.value)
  setProducto({ ...producto, codigoMarca: 0 })
  setMostrarMarcas(true)
}

const seleccionarMarca = (marca: MarcaConsulta) => {
  setProducto({ ...producto, codigoMarca: marca.codigoMarca })
  setBusquedaMarca(marca.nombre)
  setMostrarMarcas(false)
}


  const guardarProducto = async (evento: React.FormEvent) => {
    evento.preventDefault()

    if (producto.codigoCategoria === 0) {
      setMensaje('Se debe seleccionar una categoría de la lista')
      setExito(false)
      return
    }

    if (producto.codigoMarca === 0) {
      setMensaje('Se debe seleccionar una marca de la lista')
      setExito(false)
      return
}


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
        setBusquedaCategoria('')
        setBusquedaMarca('')
      }
    } catch {
      setMensaje('No fue posible comunicarse con la API.')
      setExito(false)
    }
  }

  const categoriasFiltradas = categorias.filter((categoria) =>
    categoria.nombre.toLowerCase().includes(busquedaCategoria.toLowerCase())
  )

  const marcasFiltradas = marcas.filter((marca) =>
  marca.nombre.toLowerCase().includes(busquedaMarca.toLowerCase())
)


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
                <label className="form-label">Categoría</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Escribe para buscar una categoría"
                    value={busquedaCategoria}
                    onChange={manejarBusquedaCategoria}
                    onFocus={() => setMostrarCategorias(true)}
                    onBlur={() => setMostrarCategorias(false)}
                    autoComplete="off"
                  />

                  {mostrarCategorias && (
                    <ul
                      className="list-group"
                      style={{
                        position: 'absolute',
                        width: '100%',
                        maxHeight: '200px',
                        overflowY: 'auto',
                        zIndex: 10,
                      }}
                    >
                      {categoriasFiltradas.length === 0 ? (
                        <li className="list-group-item text-muted">
                          Sin resultados
                        </li>
                      ) : (
                        categoriasFiltradas.map((categoria) => (
                          <li
                            key={categoria.codigoCategoria}
                            className="list-group-item list-group-item-action"
                            style={{ cursor: 'pointer' }}
                            onMouseDown={() => seleccionarCategoria(categoria)}
                          >
                            {categoria.nombre}
                          </li>
                        ))
                      )}
                    </ul>
                  )}
                </div>
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Marca</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Escribe para buscar una marca"
                  value={busquedaMarca}
                  onChange={manejarBusquedaMarca}
                  onFocus={() => setMostrarMarcas(true)}
                  onBlur={() => setMostrarMarcas(false)}
                  autoComplete='off'
                /> 
                {mostrarMarcas &&(
                  <ul 
                  className= "list-group"
                  style={{
                    position:'absolute',
                    width: '100%',
                    maxHeight: '200px',
                    overflowY: 'auto',
                    zIndex: 10,
                  }}
                       >
                    {marcasFiltradas.length === 0 ? (
                      <li className="list-group-item text-muted">Sin resultados</li>
                    ) : (
                      marcasFiltradas.map((marca) => (
                        <li
                          key={marca.codigoMarca}
                          className="list-group-item list-group-item-action"
                          style={{ cursor: 'pointer' }}
                          onMouseDown={() => seleccionarMarca(marca)}
                        >
                          {marca.nombre}
                        </li>
                      ))
                    )}
                  </ul>
                )}
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