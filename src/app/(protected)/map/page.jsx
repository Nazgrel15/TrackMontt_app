"use client";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

// ------------ Íconos mock (bus y parada) ------------
const busIcon = new L.Icon({
  iconUrl: "/images/location.png", // Asegúrate de tener este ícono en public/bus-icon.png
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

const stopIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/252/252025.png",
  iconSize: [28, 28],
  iconAnchor: [14, 28],
});

// ------------ Datos mock ------------
const MOCK_BUSES = [
  { id: "B1", lat: -41.4717, lng: -72.9360, eta: "5 min" }, // bus en movimiento
  { id: "B2", lat: -41.4800, lng: -72.9500, eta: "12 min" },
];

const MOCK_STOPS = [
  { id: "S1", name: "Terminal Puerto Montt", lat: -41.4710, lng: -72.9420 },
  { id: "S2", name: "Planta Chincui", lat: -41.4850, lng: -72.9550 },
];

export default function MapPage() {
  return (
    <div className="mx-auto h-[80vh] w-full max-w-6xl overflow-hidden rounded-2xl border shadow-[0_8px_24px_rgba(0,0,0,.06)]">
      <MapContainer
        center={[-41.4717, -72.9360]} // Puerto Montt aprox
        zoom={13}
        className="h-full w-full"
      >
        {/* Capa base (OpenStreetMap; se puede cambiar a Mapbox/Google más adelante) */}
        <TileLayer
          attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Markers de buses */}
        {MOCK_BUSES.map((b) => (
          <Marker key={b.id} position={[b.lat, b.lng]} icon={busIcon}>
            <Popup>
              <div className="text-sm">
                <strong>Bus {b.id}</strong>
                <br />
                ETA: {b.eta} ⏱️
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Markers de paradas */}
        {MOCK_STOPS.map((s) => (
          <Marker key={s.id} position={[s.lat, s.lng]} icon={stopIcon}>
            <Popup>
              <div className="text-sm">
                <strong>{s.name}</strong>
                <br />
                Parada oficial 🅿️
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
