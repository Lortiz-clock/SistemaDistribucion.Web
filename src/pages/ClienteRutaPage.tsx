import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { consultarClientesRuta, finalizarClienteRuta } from '../services/clienteRutaServices'
import type { ClienteRutaConsulta } from '../interfaces/ClienteRutaConsulta'
import './ProveedorPage.css' // se reutilizan los estilos de Proveedores

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

export default function ClienteRutaPage() {
  const [asignaciones, setAsignaciones] = useState<ClienteRutaConsulta[]>([])
  const [mensaje, setMensaje] = useState('')
  const [exito, setExito] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [soloVigentes, setSoloVigentes] = useState(true)

  const navigate = useNavigate()

  const filtradas = asignaciones.filter(
    (item) =>
      (!soloVigentes || item.vigente) &&
      (item.nombreCliente?.toLowerCase().includes(busqueda.toLowerCase()) ||
        item.nombreVendedor?.toLowerCase().includes(busqueda.toLowerCase()) ||
        nombreDia(item.diaSemana).toLowerCase().includes(busqueda.toLowerCase()))
  )

  const cargar = async () => {
    try {
      const respuesta = await consultarClientesRuta()

      if (respuesta.exito && Array.isArray(respuesta.datos)) {
        setAsignaciones(respuesta.datos)
      } else {
        setAsignaciones([])
      }
      setMensaje(respuesta.mensaje)
      setExito(respuesta.exito)
    } catch {
      setAsignaciones([])
      setMensaje('No fue posible comunicarse con la API.')
      setExito(false)
    }
  }

  const finalizar = async (codigoClienteRuta: number) => {
    if (!window.confirm('¿Finalizar esta asignación? El cliente dejará de visitarse en esta ruta, pero se conserva el historial.')) return

    try {
      const respuesta = await finalizarClienteRuta(codigoClienteRuta)
      setMensaje(respuesta.mensaje)
      setExito(respuesta.exito)
      if (respuesta.exito) await cargar()
    } catch (error) {
      setMensaje(extraerError(error))
      setExito(false)
    }
  }

  useEffect(() => {
    cargar()
  }, [])

  return (
    <div className="proveedor-page pagina-lista">
      <div className="proveedor-container pagina-lista-interna">
        <div className="proveedor-header">
          <h1 className="proveedor-title">Clientes por Ruta</h1>
          <p className="proveedor-subtitle">
            Qué clientes visita cada ruta y en qué orden.
          </p>
        </div>

        <div className="proveedor-card tarjeta-lista">
          <div className="proveedor-card-header">
            <h2 className="proveedor-card-title">Asignaciones</h2>
            <div className="d-flex align-items-center gap-3">
              <span className="proveedor-total">Total: {filtradas.length}</span>
              <Link to="/dashboard/asignacion-rutas/agregar" className="btn btn-primary btn-sm">
                + Asignar Cliente
              </Link>
            </div>
          </div>

          {mensaje && (
            <div className={`alert ${exito ? 'alert-info' : 'alert-danger'} proveedor-mensaje`} role="alert">
              {mensaje}
            </div>
          )}

          <div className="mb-3 flex-shrink-0 d-flex gap-3 align-items-center">
            <input
              type="text"
              className="form-control"
              placeholder="Buscar por cliente, vendedor o día..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
            <div className="form-check text-nowrap">
              <input
                className="form-check-input"
                type="checkbox"
                id="soloVigentes"
                checked={soloVigentes}
                onChange={(e) => setSoloVigentes(e.target.checked)}
              />
              <label className="form-check-label" htmlFor="soloVigentes">
                Solo vigentes
              </label>
            </div>
          </div>

          <div className="proveedor-table-container tabla-scroll">
            <table className="table table-bordered proveedor-table">
              <thead>
                <tr>
                  <th>Día</th>
                  <th>Vendedor</th>
                  <th>Orden</th>
                  <th>Cliente</th>
                  <th>Desde</th>
                  <th>Hasta</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {filtradas.length > 0 ? (
                  filtradas.map((item) => (
                    <tr key={item.codigoClienteRuta}>
                      <td>{nombreDia(item.diaSemana)}</td>
                      <td>{item.nombreVendedor}</td>
                      <td>{item.ordenVisita}</td>
                      <td>{item.nombreCliente}</td>
                      <td>{verFecha(item.fechaInicio)}</td>
                      <td>{verFecha(item.fechaFin)}</td>
                      <td>
                        <span className={`badge ${item.vigente ? 'bg-success' : 'bg-secondary'}`}>
                          {item.vigente ? 'Vigente' : 'Finalizada'}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex gap-2 justify-content-center">
                          <button
                            className="btn btn-sm btn-outline-warning"
                            onClick={() =>
                              navigate(`/dashboard/asignacion-rutas/editar/${item.codigoClienteRuta}`)
                            }
                          >
                            Editar
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => finalizar(item.codigoClienteRuta)}
                            disabled={!item.vigente}
                            title={item.vigente ? 'Finalizar asignación' : 'Ya está finalizada'}
                          >
                            Finalizar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="sin-registros text-center">
                      No existen asignaciones registradas.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
