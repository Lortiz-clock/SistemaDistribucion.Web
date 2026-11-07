import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
import type { ClienteRutaPlan } from '../interfaces/ClienteRutaPlan'

L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
})

interface Props {
  clientes: ClienteRutaPlan[]
  onSeleccionar?: (codigoCliente: number) => void
}

function iconoNumerado(num: number): L.DivIcon {
  return L.divIcon({
    className: 'pin-numerado',
    html: `<div style="
      background: #3b82f6;
      color: white;
      border-radius: 50%;
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 13px;
      border: 2px solid white;
      box-shadow: 0 0 8px rgba(59,130,246,0.6);
    ">${num}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  })
}

export default function MapaRuta({ clientes, onSeleccionar }: Props) {
  const conCoordenadas = clientes.filter(
    (c) => c.latitud != null && c.longitud != null
  )

  if (conCoordenadas.length === 0) {
    return (
      <div
        className="border rounded d-flex align-items-center justify-content-center text-muted"
        style={{ minHeight: 400 }}
      >
        <div className="text-center p-4">
          <small>
            Los clientes no tienen coordenadas registradas.
            <br />
            Agrégalas desde el módulo de Clientes para verlos en el mapa.
          </small>
        </div>
      </div>
    )
  }

  const centro: [number, number] = [conCoordenadas[0].latitud!, conCoordenadas[0].longitud!]

  return (
    <MapContainer center={centro} zoom={13} style={{ height: 400, width: '100%', borderRadius: 8 }}>
      <TileLayer
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap"
      />
      {conCoordenadas.map((c) => (
        <Marker
          key={c.codigoCliente}
          position={[c.latitud!, c.longitud!]}
          icon={iconoNumerado(c.ordenVisita)}
          eventHandlers={{
            click: () => onSeleccionar?.(c.codigoCliente),
          }}
        >
          <Popup>
            <strong>{c.ordenVisita}. {c.nombreCliente}</strong>
            <br />
            <small>{c.direccion || 'Sin dirección'}</small>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}