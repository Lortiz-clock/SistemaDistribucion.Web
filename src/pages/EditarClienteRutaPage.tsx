import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import {
  buscarClienteRuta,
  editarClienteRuta,
  consultarClientesDisponibles
} from '../services/clienteRutaServices'
import { consultarRutas } from '../services/rutaServices'
import type { ClienteRutaEditar } from '../interfaces/ClienteRutaEditar'
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
const soloFecha = (fecha: string | null) => (fecha ? fecha.substring(0, 10) : null)
const verFecha = (fecha: string | null) => {
  if (!fecha) return '—'
  const [anio, mes, dia] = fecha.substring(0, 10).split('-')
  return `${dia}/${mes}/${anio}`
}

export default function EditarClienteRutaPage() {
  const navigate = useNavigate()
  const { codigoClienteRuta } = useParams()

  const [rutas, setRutas] = useState<RutaConsulta[]>([])
  const [clientes, setClientes] = useState<ClienteDisponible[]>([])
  const [asignacion, setAsignacion] = useState<ClienteRutaEditar | null>(null)
  const [mensaje, setMensaje] = useState('')
  const [exito, setExito] = useState<boolean | null>(null)

  useEffect(() => {
    const cargar = async () => {
      try {
        const rr = await consultarRutas()
        if (rr.exito && Array.isArray(rr.datos)) setRutas(rr.datos)

        const rc = await consultarClientesDisponibles()
        if (rc.exito && Array.isArray(rc.datos)) setClientes(rc.datos)

        const respuesta = await buscarClienteRuta(Number(codigoClienteRuta))

        if (respuesta.exito && respuesta.datos) {
          const d = respuesta.datos
          setAsignacion({
            codigoClienteRuta: d.codigoClienteRuta,
            codigoCliente: d.codigoCliente,
            codigoRuta: d.codigoRuta,
            ordenVisita: d.ordenVisita,
            fechaInicio: soloFecha(d.fechaInicio) ?? '',
            fechaFin: soloFecha(d.fechaFin)
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
  }, [codigoClienteRuta])

  const guardarCambios = async (evento: React.FormEvent) => {
    evento.preventDefault()
    if (!asignacion) return

    try {
      const respuesta = await editarClienteRuta(asignacion)

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
          <h1 className="agregar-proveedor-title">Editar Asignación</h1>
          <p className="agregar-proveedor-subtitle">
            Modifica la ruta, el orden o las fechas de la asignación.
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

          {asignacion && (
            <form onSubmit={guardarCambios}>
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
                    min={1}
                    className="form-control"
                    value={asignacion.ordenVisita}
                    onChange={(e) => setAsignacion({ ...asignacion, ordenVisita: Number(e.target.value) })}
                  />
                  
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

                <div className="col-md-4 mb-3">
                  <label className="form-label">Fecha fin (opcional)</label>
                  <input
                    type="date"
                    className="form-control"
                    value={asignacion.fechaFin ?? ''}
                    onChange={(e) => setAsignacion({ ...asignacion, fechaFin: e.target.value || null })}
                  />
                  <small className="text-muted">Vacía = sigue vigente</small>
                </div>
              </div>

              <div className="agregar-proveedor-actions d-flex gap-2 justify-content-end">
                <Link to="/dashboard/asignacion-rutas" className="btn btn-secondary">
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
