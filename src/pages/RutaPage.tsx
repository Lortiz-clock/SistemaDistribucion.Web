import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { consultarRutas, desactivarRuta } from '../services/rutaServices'
import type { RutaConsulta } from '../interfaces/RutaConsulta'
import './ProveedorPage.css' // se reutilizan los estilos de Proveedores

const DIAS = [
  { valor: 1, nombre: 'Lunes' },
  { valor: 2, nombre: 'Martes' },
  { valor: 3, nombre: 'Miércoles' },
  { valor: 4, nombre: 'Jueves' },
  { valor: 5, nombre: 'Viernes' },
  { valor: 6, nombre: 'Sábado' },
  { valor: 7, nombre: 'Domingo' }
]

export default function RutaPage() {
  const [rutas, setRutas] = useState<RutaConsulta[]>([])
  const [mensaje, setMensaje] = useState('')
  const [busqueda, setBusqueda] = useState('')

  const navigate = useNavigate()

  const nombreDia = (dia: number) => DIAS.find((d) => d.valor === dia)?.nombre ?? '—'

  const filtradas = rutas.filter(
    (item) =>
      item.codigoRuta?.toString().includes(busqueda) ||
      item.nombreVendedor?.toLowerCase().includes(busqueda.toLowerCase()) ||
      nombreDia(item.diaSemana).toLowerCase().includes(busqueda.toLowerCase())
  )

  const cargar = async () => {
    try {
      const respuesta = await consultarRutas()

      if (respuesta.exito && Array.isArray(respuesta.datos)) {
        setRutas(respuesta.datos)
      } else {
        setRutas([])
      }
      setMensaje(respuesta.mensaje)
    } catch {
      setRutas([])
      setMensaje('No fue posible comunicarse con la API.')
    }
  }

  const desactivar = async (codigoRuta: number) => {
    if (!window.confirm('¿Desactivar esta ruta? Quedará inactiva, pero se conserva su historial.')) return

    try {
      const respuesta = await desactivarRuta(codigoRuta)
      setMensaje(respuesta.mensaje)
      if (respuesta.exito) await cargar()
    } catch {
      setMensaje('No se pudo desactivar la ruta.')
    }
  }

  useEffect(() => {
    cargar()
  }, [])

  return (
    <div className="proveedor-page pagina-lista">
      <div className="proveedor-container pagina-lista-interna">
        <div className="proveedor-header">
          <h1 className="proveedor-title">Consulta de Rutas</h1>
          <p className="proveedor-subtitle">
            Rutas de visita por vendedor y día de la semana.
          </p>
        </div>

        <div className="proveedor-card tarjeta-lista">
          <div className="proveedor-card-header">
            <h2 className="proveedor-card-title">Rutas registradas</h2>
            <div className="d-flex align-items-center gap-3">
              <span className="proveedor-total">Total: {rutas.length}</span>
              <Link to="/dashboard/rutas/agregar" className="btn btn-primary btn-sm">
                + Agregar Ruta
              </Link>
            </div>
          </div>

          {mensaje && (
            <div className="alert alert-info proveedor-mensaje" role="alert">
              {mensaje}
            </div>
          )}

          <div className="mb-3 flex-shrink-0">
            <input
              type="text"
              className="form-control"
              placeholder="Buscar por código, vendedor o día..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          <div className="proveedor-table-container tabla-scroll">
            <table className="table table-bordered proveedor-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Vendedor</th>
                  <th>Día</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {filtradas.length > 0 ? (
                  filtradas.map((item) => (
                    <tr key={item.codigoRuta}>
                      <td>{item.codigoRuta}</td>
                      <td>{item.nombreVendedor}</td>
                      <td>{nombreDia(item.diaSemana)}</td>
                      <td>
                        <span className={`badge ${item.estado ? 'bg-success' : 'bg-secondary'}`}>
                          {item.estado ? 'Activa' : 'Inactiva'}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex gap-2 justify-content-center">
                          <button
                            className="btn btn-sm btn-outline-warning"
                            onClick={() => navigate(`/dashboard/rutas/editar/${item.codigoRuta}`)}
                          >
                            Editar
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => desactivar(item.codigoRuta)}
                            disabled={!item.estado}
                            title={item.estado ? 'Desactivar ruta' : 'Ya está inactiva'}
                          >
                            Desactivar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="sin-registros text-center">
                      No existen rutas registradas.
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
