import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { agregarClienteRuta, consultarClientesDisponibles } from '../services/clienteRutaServices'
import { consultarRutas } from '../services/rutaServices'
import type { ClienteRutaAgregar } from '../interfaces/ClienteRutaAgregar'
import type { ClienteDisponible } from '../interfaces/ClienteDisponible'
import type { RutaConsulta } from '../interfaces/RutaConsulta'
import './AgregarProveedorPage.css' // se reutilizan los estilos de Proveedores

// El error del servidor llega como "Procedimiento: ... | Mensaje: texto"; se muestra solo el texto
const extraerError = (error: any) => {
  const detalle: string = error?.response?.data?.detalle ?? ''
  const posicion = detalle.indexOf('Mensaje: ')
  if (posicion >= 0) return detalle.substring(posicion + 9)
  return error?.response?.data?.mensaje ?? 'No fue posible comunicarse con la API.'
}

const DIAS = ['', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
const nombreDia = (dia: number) => DIAS[dia] ?? '—'

const hoy = () => {
  const d = new Date()
  const mes = String(d.getMonth() + 1).padStart(2, '0')
  const dia = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mes}-${dia}`
}

export default function AgregarClienteRutaPage() {
  const navigate = useNavigate()

  const [rutas, setRutas] = useState<RutaConsulta[]>([])
  const [clientes, setClientes] = useState<ClienteDisponible[]>([])
  const [asignacion, setAsignacion] = useState<ClienteRutaAgregar>({
    codigoCliente: 0,
    codigoRuta: 0,
    ordenVisita: 0,
    fechaInicio: hoy()
  })
  const [mensaje, setMensaje] = useState('')
  const [exito, setExito] = useState<boolean | null>(null)

  useEffect(() => {
    const cargarCatalogos = async () => {
      try {
        const rr = await consultarRutas()
        if (rr.exito && Array.isArray(rr.datos)) setRutas(rr.datos.filter((r) => r.estado))

        const rc = await consultarClientesDisponibles()
        if (rc.exito && Array.isArray(rc.datos)) setClientes(rc.datos)
      } catch {
        setMensaje('No fue posible cargar las rutas o los clientes.')
        setExito(false)
      }
    }
    cargarCatalogos()
  }, [])

  const guardar = async (evento: React.FormEvent) => {
    evento.preventDefault()

    if (asignacion.codigoRuta === 0 || asignacion.codigoCliente === 0) {
      setMensaje('Selecciona la ruta y el cliente.')
      setExito(false)
      return
    }

    try {
      const respuesta = await agregarClienteRuta(asignacion)

      setMensaje(respuesta.mensaje)
      setExito(respuesta.exito)

      if (respuesta.exito) {
        setTimeout(() => navigate('/dashboard/asignacion-rutas'), 1000)
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
          <h1 className="agregar-proveedor-title">Asignar Cliente a una Ruta</h1>
          <p className="agregar-proveedor-subtitle">
            Elige la ruta, el cliente y en qué orden se visita.
          </p>
        </div>

        <div className="agregar-proveedor-card">
          <div className="agregar-proveedor-card-header">
            <h2>Información de la Asignación</h2>
          </div>

          {mensaje && (
            <div className={exito ? 'alert alert-success' : 'alert alert-danger'}>
              {mensaje}
            </div>
          )}

          <form onSubmit={guardar}>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Ruta</label>
                  <select
                    className="form-select"
                    value={asignacion.codigoRuta}
                    onChange={(e) => setAsignacion({ ...asignacion, codigoRuta: Number(e.target.value) })}
                    required
                  >
                    <option value={0}>Seleccione una ruta</option>
                    {rutas.map((r) => (
                      <option key={r.codigoRuta} value={r.codigoRuta}>
                        {nombreDia(r.diaSemana)} - {r.nombreVendedor}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">Cliente</label>
                  <select
                    className="form-select"
                    value={asignacion.codigoCliente}
                    onChange={(e) => setAsignacion({ ...asignacion, codigoCliente: Number(e.target.value) })}
                    required
                  >
                    <option value={0}>Seleccione un cliente</option>
                    {clientes.map((c) => (
                      <option key={c.codigoCliente} value={c.codigoCliente}>
                        {c.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="row">
                <div className="col-md-4 mb-3">
                  <label className="form-label">Orden de visita</label>
                  <input
                    type="number"
                    min={0}
                    className="form-control"
                    value={asignacion.ordenVisita}
                    onChange={(e) => setAsignacion({ ...asignacion, ordenVisita: Number(e.target.value) })}
                  />
                  <small className="text-muted">0 = al final de la ruta</small>
                </div>

                <div className="col-md-4 mb-3">
                  <label className="form-label">Fecha de inicio</label>
                  <input
                    type="date"
                    className="form-control"
                    value={asignacion.fechaInicio}
                    onChange={(e) => setAsignacion({ ...asignacion, fechaInicio: e.target.value })}
                    required
                  />
                </div>
              </div>

            <div className="agregar-proveedor-actions d-flex gap-2 justify-content-end">
              <Link to="/dashboard/asignacion-rutas" className="btn btn-secondary">
                Cancelar
              </Link>
              <button type="submit" className="btn btn-primary">
                Guardar Asignación
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
