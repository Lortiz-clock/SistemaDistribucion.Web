import { useCallback, useEffect, useState } from 'react'
import { MapPin, Plus, RefreshCw, Calendar, Navigation } from 'lucide-react'
import { isAxiosError } from 'axios'
import {
  obtenerMisClientesDelDia,
  obtenerSemaforoUtilidad,
} from '../services/pedidosService'
import type { ClienteRutaPlan } from '../interfaces/ClienteRutaPlan'
import type { SemaforoUtilidad as SemaforoData } from '../interfaces/SemaforoUtilidad'
import { SemaforoUtilidad } from '../components/SemaforoUtilidad'
import { CrearPedidoModal } from '../components/CrearPedidoModal'
import MapaRuta from '../components/MapaRuta'
import { NoVisitaModal } from '../components/NoVisitaModal'

const DIAS = [
  { v: 1, n: 'Lunes' },
  { v: 2, n: 'Martes' },
  { v: 3, n: 'Miércoles' },
  { v: 4, n: 'Jueves' },
  { v: 5, n: 'Viernes' },
  { v: 6, n: 'Sábado' },
]

function diaDeHoy(): number {
  return new Date().getDay()
}

function urlWaze(lat: number, lng: number): string {
  return `https://www.waze.com/ul?ll=${lat},${lng}&navigate=yes`
}

function rangoSemanaActual(): { fechaDesde: string; fechaHasta: string } {
  const hoy = new Date()
  const d = hoy.getDay()
  const lunes = new Date(hoy)
  const diff = d === 0 ? -6 : 1 - d
  lunes.setDate(hoy.getDate() + diff)
  const sabado = new Date(lunes)
  sabado.setDate(lunes.getDate() + 5)
  const iso = (date: Date) => date.toISOString().split('T')[0]
  return { fechaDesde: iso(lunes), fechaHasta: iso(sabado) }
}

function extraerMensaje(error: unknown, fallback: string): string {
  if (isAxiosError(error) && error.response?.data?.mensaje) {
    return error.response.data.mensaje
  }
  return fallback
}

export default function PedidosPage() {
  const [dia, setDia] = useState<number | null>(null)
  const [mostrarSelectorDia, setMostrarSelectorDia] = useState(true)
  const [clientes, setClientes] = useState<ClienteRutaPlan[]>([])
  const [semaforo, setSemaforo] = useState<SemaforoData | null>(null)
  const [cargando, setCargando] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [modalAbierto, setModalAbierto] = useState(false)
  const [clienteSeleccionado, setClienteSeleccionado] = useState<ClienteRutaPlan | null>(null)
  const [modalNoVisitaAbierto, setModalNoVisitaAbierto] = useState(false)
  const [clienteNoVisita, setClienteNoVisita] = useState<ClienteRutaPlan | null>(null)

  const cargarDatos = useCallback(async (diaSemana: number) => {
    setCargando(true)
    setMensaje('')

    const { fechaDesde, fechaHasta } = rangoSemanaActual()

    try {
      const [resClientes, resSemaforo] = await Promise.all([
        obtenerMisClientesDelDia(diaSemana),
        obtenerSemaforoUtilidad(fechaDesde, fechaHasta),
      ])

      if (resClientes.exito && resClientes.datos) {
        setClientes(resClientes.datos)
        setMensaje(
          resClientes.datos.length === 0
            ? `No tienes clientes asignados para ${DIAS.find((d) => d.v === diaSemana)?.n}.`
            : resClientes.mensaje
        )
      } else {
        setClientes([])
        setMensaje(resClientes.mensaje)
      }

      if (resSemaforo.exito && resSemaforo.datos) {
        setSemaforo(resSemaforo.datos)
      }
    } catch (error) {
      setMensaje(extraerMensaje(error, 'No se pudieron cargar los datos. Revisa tu conexión.'))
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => {
    const hoy = diaDeHoy()
    if (hoy >= 1 && hoy <= 6) {
      setDia(hoy)
      setMostrarSelectorDia(false)
      void cargarDatos(hoy)
    } else {
      setMostrarSelectorDia(true)
    }
  }, [cargarDatos])

  function seleccionarDia(diaSemana: number) {
    setDia(diaSemana)
    setMostrarSelectorDia(false)
    void cargarDatos(diaSemana)
  }

  function abrirCrearPedido(cliente: ClienteRutaPlan) {
    setClienteSeleccionado(cliente)
    setModalAbierto(true)
  }

  function cerrarCrearPedido() {
    setModalAbierto(false)
    setClienteSeleccionado(null)
  }

  function onPedidoCreado() {
    cerrarCrearPedido()
    if (dia) void cargarDatos(dia)
    setMensaje('Pedido creado correctamente. El semáforo se actualizó.')
  }

  function abrirNoVisita(cliente: ClienteRutaPlan) {
  setClienteNoVisita(cliente)
  setModalNoVisitaAbierto(true)
}

function cerrarNoVisita() {
  setModalNoVisitaAbierto(false)
  setClienteNoVisita(null)
}

function onNoVisitaRegistrada() {
  cerrarNoVisita()
  setMensaje('No visita registrada correctamente.')
}

  const nombreDia = DIAS.find((d) => d.v === dia)?.n ?? ''

  return (
    <div className="pedidos-page pagina-lista">
      <div className="pagina-lista-interna">
        <div className="mb-3 d-flex justify-content-between align-items-center">
          <div>
            <h1>Pedidos</h1>
            {dia && (
              <p className="d-flex align-items-center gap-1">
                <Calendar size={14} />
                Día de ruta: <strong className="mx-1">{nombreDia}</strong>
                <button
                  className="btn btn-sm btn-link p-0 ms-1"
                  onClick={() => setMostrarSelectorDia(true)}
                >
                  (cambiar)
                </button>
              </p>
            )}
          </div>
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={() => dia && cargarDatos(dia)}
            disabled={cargando}
          >
            <RefreshCw size={14} className={cargando ? 'spin' : ''} />
          </button>
        </div>

        {mensaje && (
          <div className="alert alert-info alert-dismissible fade show" role="alert">
            {mensaje}
            <button type="button" className="btn-close" onClick={() => setMensaje('')} />
          </div>
        )}

        <SemaforoUtilidad datos={semaforo} />

        <div className="row g-3">
          <div className="col-lg-6">
            <div className="tarjeta-lista">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h2 className="h5 m-0">
                  Clientes del {nombreDia}{' '}
                  <span className="badge bg-primary">{clientes.length}</span>
                </h2>
              </div>

              {cargando ? (
                <div className="text-center text-muted py-4">
                  <span className="spinner-border spinner-border-sm me-2" />
                  Cargando clientes…
                </div>
              ) : clientes.length === 0 ? (
                <div className="text-center text-muted py-4">
                  No hay clientes asignados para este día.
                  <br />
                  <small>El administrador puede asignarlos desde el planificador de rutas.</small>
                </div>
              ) : (
                <ul className="list-group">
                  {clientes.map((c, i) => (
                  <li
                  key={c.codigoClienteRuta}
                  className="list-group-item d-flex align-items-center gap-2"
                >
                  <span className="badge bg-dark rounded-pill">{i + 1}</span>
                  <div className="flex-grow-1" style={{ minWidth: 0 }}>
                    <div className="fw-semibold">{c.nombreCliente}</div>
                    <small className="d-flex align-items-center gap-1" style={{ color: '#94a3b8' }}>
                      <MapPin size={12} className="flex-shrink-0" />
                      <span>{c.direccion || 'Sin dirección'}</span>
                    </small>
                  </div>

                  {/* Botón Navegar con Waze — solo si tiene coordenadas */}
                  {c.latitud != null && c.longitud != null && (
                    <a
                      href={urlWaze(c.latitud, c.longitud)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-sm btn-outline-info"
                      title="Navegar con Waze"
                    >
                      <Navigation size={14} />
                    </a>
                  )}

                  <button
                    className="btn btn-sm btn-outline-warning"
                    onClick={() => abrirNoVisita(c)}
                    title="Registrar no visita"
                  >
                    No visita
                  </button>
                  <button
                    className="btn btn-sm btn-success"
                    onClick={() => abrirCrearPedido(c)}
                  >
                    <Plus size={14} className="me-1" />
                    Pedido
                  </button>
                </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="col-lg-6">
            <div className="tarjeta-lista">
              <h2 className="h5 mb-3">Mapa de la ruta</h2>
              <MapaRuta clientes={clientes} onSeleccionar={(cod) => {
                const c = clientes.find((x) => x.codigoCliente === cod)
                if (c) abrirCrearPedido(c)
              }} />
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Selector de día al entrar */}
      {mostrarSelectorDia && (
        <div className="modal d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">¿Qué día vas a visitar?</h5>
              </div>
              <div className="modal-body">
                <p className="text-muted small">
                  Selecciona el día de ruta para ver tus clientes asignados.
                </p>
                <div className="d-grid gap-2">
                  {DIAS.map((d) => (
                    <button
                    key={d.v}
                    className={`btn ${dia === d.v ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => seleccionarDia(d.v)}
                  >
                      {d.n}
                      {diaDeHoy() === d.v && (
                        <span className="badge bg-success ms-2">hoy</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Crear pedido */}
      {modalAbierto && clienteSeleccionado && (
        <CrearPedidoModal
          codigoCliente={clienteSeleccionado.codigoCliente}
          nombreCliente={clienteSeleccionado.nombreCliente}
          onClose={cerrarCrearPedido}
          onExito={onPedidoCreado}
        />
        )}
        {modalNoVisitaAbierto && clienteNoVisita && (
  <NoVisitaModal
    codigoCliente={clienteNoVisita.codigoCliente}
    nombreCliente={clienteNoVisita.nombreCliente}
    onClose={cerrarNoVisita}
    onExito={onNoVisitaRegistrada}
  />
)}
    </div>
  )
}