import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { buscarProducto, editarProducto } from '../services/productoService'
import type { ProductoEditar } from '../interfaces/ProductoEditar'
import { consultaCategoria } from '../services/categoriaServices'
import type { CategoriaConsulta } from '../interfaces/CategoriaConsulta'
import { consultarMarcas } from '../services/marcaService'
import type { MarcaConsulta } from '../interfaces/MarcaConsulta'

export default function EditarProductoPage() {
  const { codigoProducto } = useParams()
  const navigate = useNavigate()

  const [producto, setProducto] = useState<ProductoEditar>({
    codigoProducto: 0,
    codigoCategoria: 0,
    codigoMarca: 0,
    nombre: '',
    unidadesCaja: 0,
    estado: true,
  })

  const [mensaje, setMensaje] = useState('')
  const [exito, setExito] = useState<boolean | null>(null)
  const [cargando, setCargando] = useState(true)

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
    const cargarMarcas = async () => {
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

    cargarMarcas()
  }, [])

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
          estado: respuesta.datos.estado,
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

  // Llena el nombre de la categoría cuando ya cargaron el producto y la lista
  useEffect(() => {
    if (producto.codigoCategoria !== 0 && busquedaCategoria === '') {
      const categoria = categorias.find(
        (c) => c.codigoCategoria === producto.codigoCategoria
      )
      if (categoria) setBusquedaCategoria(categoria.nombre)
    }
  }, [categorias, producto.codigoCategoria, busquedaCategoria])

  // Llena el nombre de la marca cuando ya cargaron el producto y la lista
  useEffect(() => {
    if (producto.codigoMarca !== 0 && busquedaMarca === '') {
      const marca = marcas.find((m) => m.codigoMarca === producto.codigoMarca)
      if (marca) setBusquedaMarca(marca.nombre)
    }
  }, [marcas, producto.codigoMarca, busquedaMarca])

  const manejarCambio = (
    evento: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = evento.target

    setProducto({
      ...producto,
      [name]:
        name === 'codigoCategoria' ||
        name === 'codigoMarca' ||
        name === 'unidadesCaja'
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

  const manejarBusquedaMarca = (
    evento: React.ChangeEvent<HTMLInputElement>
  ) => {
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

  const categoriasFiltradas = categorias.filter((categoria) =>
    categoria.nombre.toLowerCase().includes(busquedaCategoria.toLowerCase())
  )

  const marcasFiltradas = marcas.filter((marca) =>
    marca.nombre.toLowerCase().includes(busquedaMarca.toLowerCase())
  )

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

              <div className="col-md-4 mb-3">
                <label className="form-label">Marca</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Escribe para buscar una marca"
                    value={busquedaMarca}
                    onChange={manejarBusquedaMarca}
                    onFocus={() => setMostrarMarcas(true)}
                    onBlur={() => setMostrarMarcas(false)}
                    autoComplete="off"
                  />

                  {mostrarMarcas && (
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
                      {marcasFiltradas.length === 0 ? (
                        <li className="list-group-item text-muted">
                          Sin resultados
                        </li>
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