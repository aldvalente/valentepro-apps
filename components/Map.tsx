'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon
const icon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface Location {
  id: string;
  latitude: number;
  longitude: number;
  title: string;
  dailyPrice: number;
}

interface MapProps {
  locations: Location[];
  center?: [number, number];
  zoom?: number;
  onMarkerClick?: (id: string) => void;
}

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  
  return null;
}

export default function Map({
  locations,
  center = [45.4642, 9.1900], // Default to Milan
  zoom = 6,
  onMarkerClick,
}: MapProps) {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      className="h-full w-full rounded-lg"
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapUpdater center={center} />
      {locations.map((location) => (
        <Marker
          key={location.id}
          position={[location.latitude, location.longitude]}
          icon={icon}
          eventHandlers={{
            click: () => onMarkerClick?.(location.id),
          }}
        >
          <Popup>
            <div className="p-2">
              <h3 className="font-semibold">{location.title}</h3>
              <p className="text-sm text-gray-600">
                €{location.dailyPrice}/day
              </p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
