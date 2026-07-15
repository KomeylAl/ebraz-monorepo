"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const customIcon = new L.Icon({
  iconUrl: "/images/marker.svg",
  iconSize: [50, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export default function ClinicMap({
  lat,
  long,
}: {
  lat: number;
  long: number;
}) {
  const position: [number, number] = [lat, long];

  return (
    <div className="w-full h-[400px] rounded-lg overflow-hidden z-0">
      <MapContainer center={position} zoom={15} className="w-full h-full z-0">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OSM</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position} icon={customIcon}>
          <Popup>اینجا کلینیک ابراز هست 🌿</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
