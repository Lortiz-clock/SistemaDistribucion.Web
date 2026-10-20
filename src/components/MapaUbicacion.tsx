import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow
})

interface Props {
  lat: number | null
  lng: number | null
  onChange: (lat: number, lng: number) => void
}

interface Resultado {
  lat: string
  lon: string
  display_name: string
}

function Clics({ onChange }: { onChange: Props['onChange'] }) {
  useMapEvents({
    click: (e) => onChange(e.latlng.lat, e.latlng.lng)
  })
  return null
}

function Centrar({ centro }: { centro: [number, number] | null }) {
  const map = useMap()
  useEffect(() => {
    if (centro) map.flyTo(centro, 17)
  }, [centro, map])
  return null
}

export default function MapaUbicacion({ lat, lng, onChange }: Props) {
  const [texto, setTexto] = useState('')
  const [resultados, setResultados] = useState<Resultado[]>([])
  const [buscando, setBuscando] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [centro, setCentro] = useState<[number, number] | null>(null)

  const buscar = async () => {
    if (!texto.trim()) return
    setBuscando(true)
    setMensaje('')
    setResultados([])
    try {
      const url =
        'https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&countrycodes=gt&q=' +
        encodeURIComponent(texto)
      const res = await fetch(url, { headers: { 'Accept-Language': 'es' } })
      const datos: Resultado[] = await res.json()
      if (datos.length === 0) {
        setMensaje('Sin resultados. Prueba con la zona o colonia y coloca el pin a mano.')
      }
      setResultados(datos)
    } catch {
      setMensaje('No se pudo realizar la búsqueda.')
    } finally {
      setBuscando(false)
    }
  }

  const elegir = (r: Resultado) => {
    const la = Number(r.lat)
    const lo = Number(r.lon)
    setCentro([la, lo])
    onChange(la, lo)
    setResultados([])
  }

  return (
    <div className="mt-3">
      <div className="d-flex gap-2 mb-2">
        <input
          type="text"
          className="form-control"
          placeholder="Buscar zona, colonia o lugar (ej: Zona 18, Ciudad de Guatemala)"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              buscar()
            }
          }}
        />
        <button type="button" className="btn btn-primary" onClick={buscar} disabled={buscando}>
          {buscando ? 'Buscando...' : 'Buscar'}
        </button>
      </div>

      {mensaje && <div className="text-danger small mb-2">{mensaje}</div>}

      {resultados.length > 0 && (
        <div className="list-group mb-2">
          {resultados.map((r, i) => (
            <button
              type="button"
              key={i}
              className="list-group-item list-group-item-action small"
              onClick={() => elegir(r)}
            >
              {r.display_name}
            </button>
          ))}
        </div>
      )}

      <MapContainer
        center={[lat ?? 14.6349, lng ?? -90.5069]}
        zoom={lat !== null ? 17 : 13}
        style={{ height: 380, width: '100%', borderRadius: 8 }}
      >
        <TileLayer
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap"
        />
        <Clics onChange={onChange} />
        <Centrar centro={centro} />
        {lat !== null && lng !== null && (
          <Marker
            position={[lat, lng]}
            draggable
            eventHandlers={{
              dragend: (e) => {
                const p = (e.target as L.Marker).getLatLng()
                onChange(p.lat, p.lng)
              }
            }}
          />
        )}
      </MapContainer>

      <small className="text-muted">
        Haz clic en el mapa para colocar el pin o arrástralo al punto exacto del negocio.
      </small>
    </div>
  )
}