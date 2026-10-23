import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { buscarCliente, editarCliente } from '../services/clienteService'
import type { EditarCliente } from '../interfaces/ClientesEditar'
import MapaUbicacion from '../components/MapaUbicacion'
import './AgregarClientePage.css'

const dentroDeGuatemala = (lat: number, lng: number) =>
  lat >= 13.5 && lat <= 18 && lng >= -92.5 && lng <= -88

export default function EditarClientePage() {
  const navigate = useNavigate()
  const { codigoCliente } = useParams()

  const [nombre, setNombre] = useState('')
  const [nit, setNit] = useState('')
  const [direccion, setDireccion] = useState('')
  const [referencia, setReferencia] = useState('')
  const [latitud, setLatitud] = useState('')
  const [longitud, setLongitud] = useState('')
  const [estado, setEstado] = useState(true)

  const [precision, setPrecision] = useState<number | null>(null)
  const [obteniendo, setObteniendo] = useState(false)
  const [mostrarMapa, setMostrarMapa] = useState(false)
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    const cargar = async () => {
      try {
        const respuesta = await buscarCliente(Number(codigoCliente))
        if (respuesta.exito && respuesta.datos) {
          const c = respuesta.datos
          setNombre(c.nombre ?? '')
          setNit(c.nit ?? '')
          setDireccion(c.direccion ?? '')
          setReferencia(c.referencia ?? '')
          setLatitud(c.latitud != null ? String(c.latitud) : '')
          setLongitud(c.longitud != null ? String(c.longitud) : '')
          setEstado(c.estado)
        } else {
          setError(respuesta.mensaje || 'No se encontró el cliente.')
        }
      } catch {
        setError('No fue posible comunicarse con la API.')
      } finally {
        setCargando(false)
      }
    }
    cargar()
  }, [codigoCliente])

  const latNumero =
    latitud !== '' && !isNaN(Number(latitud)) ? Number(latitud) : null
  const lngNumero =
    longitud !== '' && !isNaN(Number(longitud)) ? Number(longitud) : null

  const usarMiUbicacion = () => {
    if (!navigator.geolocation) {
      setError('Tu navegador no soporta geolocalización.')
      return
    }
    setError('')
    setObteniendo(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitud(pos.coords.latitude.toFixed(6))
        setLongitud(pos.coords.longitude.toFixed(6))
        setPrecision(Math.round(pos.coords.accuracy))
        setObteniendo(false)
      },
      () => {
        setError('No se pudo obtener la ubicación. Revisa el permiso del navegador.')
        setObteniendo(false)
      },
      { enableHighAccuracy: true, timeout: 15000 }
    )
  }

  const ubicacionDesdeMapa = (lat: number, lng: number) => {
    setLatitud(lat.toFixed(6))
    setLongitud(lng.toFixed(6))
    setPrecision(null)
  }

  const guardar = async (e: React.SyntheticEvent) => {
    e.preventDefault()
    setError('')

    if (!nombre.trim()) {
      setError('El nombre es obligatorio.')
      return
    }

    const hayLat = latitud.trim() !== ''
    const hayLng = longitud.trim() !== ''

    if (hayLat !== hayLng) {
      setError('Debes llenar latitud y longitud juntas, o dejar las dos vacías.')
      return
    }

    let lat: number | null = null
    let lng: number | null = null

    if (hayLat && hayLng) {
      lat = Number(latitud)
      lng = Number(longitud)

      if (isNaN(lat) || isNaN(lng)) {
        setError('Latitud y longitud deben ser números decimales.')
        return
      }
      if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        setError('Coordenadas fuera de rango.')
        return
      }
      if (!dentroDeGuatemala(lat, lng)) {
        const seguir = window.confirm(
          'Estas coordenadas quedan fuera de Guatemala. ¿Guardar de todos modos?'
        )
        if (!seguir) return
      }
    }

    const dto: EditarCliente = {
      codigoCliente: Number(codigoCliente),
      nombre: nombre.trim(),
      nit: nit.trim(),
      direccion: direccion.trim(),
      referencia: referencia.trim(),
      latitud: lat,
      longitud: lng,
      estado
    }

    try {
      setGuardando(true)
      const respuesta = await editarCliente(dto)
      if (respuesta.exito) {
        navigate('/dashboard/clientes')
      } else {
        setError(respuesta.mensaje || 'No se pudo actualizar el cliente.')
      }
    } catch {
      setError('No fue posible comunicarse con la API.')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="agregar-cliente-page">
      <div className="agregar-cliente-container">
        <div className="agregar-cliente-header">
          <h1 className="agregar-cliente-title">Editar cliente</h1>
          <p className="agregar-cliente-subtitle">
            Modifica los datos del cliente y su ubicación.
          </p>
        </div>

        <div className="agregar-cliente-card">
          {cargando ? (
            <p className="mb-0">Cargando...</p>
          ) : (
            <form onSubmit={guardar}>
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}

              <div className="row g-3">
                {/* ═══ DATOS DEL CLIENTE ═══ */}
                <div className="col-12">
                  <h5 className="fw-bold mb-0">Datos del cliente</h5>
                  <hr className="mt-2" />
                </div>

                <div className="col-md-8">
                  <label className="form-label fw-bold">Nombre *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label fw-bold">NIT</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Vacío = CF"
                    value={nit}
                    onChange={(e) => setNit(e.target.value)}
                  />
                </div>

                <div className="col-md-8">
                  <label className="form-label fw-bold">Dirección</label>
                  <input
                    type="text"
                    className="form-control"
                    value={direccion}
                    onChange={(e) => setDireccion(e.target.value)}
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label fw-bold">Estado</label>
                  <select
                    className="form-select"
                    value={estado ? '1' : '0'}
                    onChange={(e) => setEstado(e.target.value === '1')}
                  >
                    <option value="1">Activo</option>
                    <option value="0">Inactivo</option>
                  </select>
                </div>

                <div className="col-12">
                  <label className="form-label fw-bold">Referencia</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Ej: frente a la tienda X, portón verde"
                    value={referencia}
                    onChange={(e) => setReferencia(e.target.value)}
                  />
                </div>

                {/* ═══ UBICACIÓN ═══ */}
                <div className="col-12 mt-3">
                  <h5 className="fw-bold mb-0">Ubicación</h5>
                  <hr className="mt-2" />
                </div>

                <div className="col-md-3">
                  <label className="form-label fw-bold">Latitud</label>
                  <input
                    type="number"
                    step="any"
                    className="form-control"
                    placeholder="14.634915"
                    value={latitud}
                    onChange={(e) => setLatitud(e.target.value)}
                  />
                </div>

                <div className="col-md-3">
                  <label className="form-label fw-bold">Longitud</label>
                  <input
                    type="number"
                    step="any"
                    className="form-control"
                    placeholder="-90.506882"
                    value={longitud}
                    onChange={(e) => setLongitud(e.target.value)}
                  />
                </div>

                <div className="col-md-3 d-flex align-items-end">
                  <button
                    type="button"
                    className="btn btn-outline-primary w-100"
                    onClick={usarMiUbicacion}
                    disabled={obteniendo}
                  >
                    {obteniendo ? 'Obteniendo...' : 'Usar mi ubicación'}
                  </button>
                </div>

                <div className="col-md-3 d-flex align-items-end">
                  <button
                    type="button"
                    className="btn btn-outline-secondary w-100"
                    onClick={() => setMostrarMapa(!mostrarMapa)}
                  >
                    {mostrarMapa ? 'Ocultar mapa' : 'Buscar en el mapa'}
                  </button>
                </div>

                {precision !== null && (
                  <div className="col-12">
                    <small className={precision > 100 ? 'text-danger' : 'text-success'}>
                      Precisión: {precision} m
                      {precision > 100 && ' — es poco precisa, conviene volver a capturarla.'}
                    </small>
                  </div>
                )}

                {mostrarMapa && (
                  <div className="col-12">
                    <MapaUbicacion
                      lat={latNumero}
                      lng={lngNumero}
                      onChange={ubicacionDesdeMapa}
                    />
                  </div>
                )}
              </div>

              <div className="d-flex justify-content-end gap-2 mt-4">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => navigate('/dashboard/clientes')}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" disabled={guardando}>
                  {guardando ? 'Guardando...' : 'Guardar cambios'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}