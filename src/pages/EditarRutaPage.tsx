import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { buscarRuta, editarRuta } from '../services/rutaServices'
import { consultarVendedores } from '../services/vendedorServices'
import type { RutaEditar } from '../interfaces/RutaEditar'
import type { VendedorConsulta } from '../interfaces/VendedorConsulta'
import './AgregarProveedorPage.css' // se reutilizan los estilos de Proveedores

// El error del servidor llega como "Procedimiento: ... | Mensaje: texto"; se muestra solo el texto
const extraerError = (error: any) => {
  const detalle: string = error?.response?.data?.detalle ?? ''
  const posicion = detalle.indexOf('Mensaje: ')
  if (posicion >= 0) return detalle.substring(posicion + 9)
  return error?.response?.data?.mensaje ?? 'No fue posible comunicarse con la API.'
}

const DIAS = [
  { valor: 1, nombre: 'Lunes' },
  { valor: 2, nombre: 'Martes' },
  { valor: 3, nombre: 'Miércoles' },
  { valor: 4, nombre: 'Jueves' },
  { valor: 5, nombre: 'Viernes' },
  { valor: 6, nombre: 'Sábado' },
  { valor: 7, nombre: 'Domingo' }
]

export default function EditarRutaPage() {
  const navigate = useNavigate()
  const { codigoRuta } = useParams()

  const [ruta, setRuta] = useState<RutaEditar | null>(null)
  const [vendedores, setVendedores] = useState<VendedorConsulta[]>([])
  const [mensaje, setMensaje] = useState('')
  const [exito, setExito] = useState<boolean | null>(null)

  useEffect(() => {
    const cargar = async () => {
      try {
        const respuestaVendedores = await consultarVendedores()
        if (respuestaVendedores.exito && Array.isArray(respuestaVendedores.datos)) {
          setVendedores(respuestaVendedores.datos)
        }

        const respuesta = await buscarRuta(Number(codigoRuta))

        if (respuesta.exito && respuesta.datos) {
          setRuta({
            codigoRuta: respuesta.datos.codigoRuta,
            codigoVendedor: respuesta.datos.codigoVendedor,
            diaSemana: respuesta.datos.diaSemana,
            estado: respuesta.datos.estado
          })
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
  }, [codigoRuta])

  const guardarCambios = async (evento: React.FormEvent) => {
    evento.preventDefault()
    if (!ruta) return

    try {
      const respuesta = await editarRuta(ruta)

      setMensaje(respuesta.mensaje)
      setExito(respuesta.exito)

      if (respuesta.exito) {
        setTimeout(() => navigate('/dashboard/rutas'), 1000)
      }
    } catch (error) {
      setMensaje(extraerError(error))
      setExito(false)
    }
  }

  // Solo vendedores activos, más el que ya tiene esta ruta
  const opciones = vendedores.filter(
    (v) => v.estado || (ruta && v.codigoVendedor === ruta.codigoVendedor)
  )

  return (
    <div className="agregar-proveedor-page">
      <div className="agregar-proveedor-container">
        <div className="agregar-proveedor-header">
          <h1 className="agregar-proveedor-title">Editar Ruta</h1>
          <p className="agregar-proveedor-subtitle">
            Modifica los datos de la ruta seleccionada.
          </p>
        </div>

        <div className="agregar-proveedor-card">
          <div className="agregar-proveedor-card-header">
            <h2>Información de la Ruta</h2>
          </div>

          {mensaje && (
            <div className={exito ? 'alert alert-success' : 'alert alert-danger'}>
              {mensaje}
            </div>
          )}

          {ruta && (
            <form onSubmit={guardarCambios}>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Vendedor</label>
                  <select
                    className="form-select"
                    value={ruta.codigoVendedor}
                    onChange={(e) => setRuta({ ...ruta, codigoVendedor: Number(e.target.value) })}
                    required
                  >
                    {opciones.map((v) => (
                      <option key={v.codigoVendedor} value={v.codigoVendedor}>
                        {v.nombreEmpleado}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-md-3 mb-3">
                  <label className="form-label">Día de la semana</label>
                  <select
                    className="form-select"
                    value={ruta.diaSemana}
                    onChange={(e) => setRuta({ ...ruta, diaSemana: Number(e.target.value) })}
                  >
                    {DIAS.map((d) => (
                      <option key={d.valor} value={d.valor}>{d.nombre}</option>
                    ))}
                  </select>
                </div>

                <div className="col-md-3 mb-3">
                  <label className="form-label">Estado</label>
                  <select
                    className="form-select"
                    value={ruta.estado ? '1' : '0'}
                    onChange={(e) => setRuta({ ...ruta, estado: e.target.value === '1' })}
                  >
                    <option value="1">Activa</option>
                    <option value="0">Inactiva</option>
                  </select>
                </div>
              </div>

              <div className="agregar-proveedor-actions d-flex gap-2 justify-content-end">
                <Link to="/dashboard/rutas" className="btn btn-secondary">
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
