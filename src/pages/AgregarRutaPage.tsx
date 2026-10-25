import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { agregarRuta } from '../services/rutaServices'
import { consultarVendedores } from '../services/vendedorServices'
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

export default function AgregarRutaPage() {
  const navigate = useNavigate()

  const [vendedores, setVendedores] = useState<VendedorConsulta[]>([])
  const [codigoVendedor, setCodigoVendedor] = useState(0)
  const [diaSemana, setDiaSemana] = useState(1)
  const [mensaje, setMensaje] = useState('')
  const [exito, setExito] = useState<boolean | null>(null)

  useEffect(() => {
    const cargar = async () => {
      try {
        const respuesta = await consultarVendedores()
        if (respuesta.exito && Array.isArray(respuesta.datos)) {
          setVendedores(respuesta.datos.filter((v) => v.estado))
        }
      } catch {
        setMensaje('No fue posible cargar los vendedores.')
        setExito(false)
      }
    }
    cargar()
  }, [])

  const guardar = async (evento: React.FormEvent) => {
    evento.preventDefault()

    if (codigoVendedor === 0) {
      setMensaje('Selecciona un vendedor.')
      setExito(false)
      return
    }

    try {
      const respuesta = await agregarRuta({ codigoVendedor, diaSemana })

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

  return (
    <div className="agregar-proveedor-page">
      <div className="agregar-proveedor-container">
        <div className="agregar-proveedor-header">
          <h1 className="agregar-proveedor-title">Agregar Ruta</h1>
          <p className="agregar-proveedor-subtitle">
            Asigna un vendedor a un día de la semana.
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

          <form onSubmit={guardar}>
            <div className="row">
              <div className="col-md-8 mb-3">
                <label className="form-label">Vendedor</label>
                <select
                  className="form-select"
                  value={codigoVendedor}
                  onChange={(e) => setCodigoVendedor(Number(e.target.value))}
                  required
                >
                  <option value={0}>Seleccione un vendedor</option>
                  {vendedores.map((v) => (
                    <option key={v.codigoVendedor} value={v.codigoVendedor}>
                      {v.nombreEmpleado}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-4 mb-3">
                <label className="form-label">Día de la semana</label>
                <select
                  className="form-select"
                  value={diaSemana}
                  onChange={(e) => setDiaSemana(Number(e.target.value))}
                >
                  {DIAS.map((d) => (
                    <option key={d.valor} value={d.valor}>{d.nombre}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="agregar-proveedor-actions d-flex gap-2 justify-content-end">
              <Link to="/dashboard/rutas" className="btn btn-secondary">
                Cancelar
              </Link>
              <button type="submit" className="btn btn-primary">
                Guardar Ruta
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
