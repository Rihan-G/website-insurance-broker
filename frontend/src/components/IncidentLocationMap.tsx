import { useCallback, useEffect, useMemo, useRef } from "react";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import "leaflet/dist/leaflet.css";

import { DEFAULT_INCIDENT_CENTER, type IncidentPin } from "../types/incidentMap";

const defaultIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function MapClickHandler({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function FlyToPin({ pin }: { pin: IncidentPin | null }) {
  const map = useMap();
  const hadPin = useRef(false);
  useEffect(() => {
    if (!pin) {
      hadPin.current = false;
      return;
    }
    if (!hadPin.current) {
      hadPin.current = true;
      map.flyTo([pin.lat, pin.lng], Math.max(map.getZoom(), 14), { duration: 0.45 });
    }
  }, [pin, map]);
  return null;
}

export function IncidentLocationMap({
  value,
  onChange,
}: {
  value: IncidentPin | null;
  onChange: (next: IncidentPin | null) => void;
}) {
  const center = useMemo((): [number, number] => {
    if (value) return [value.lat, value.lng];
    return DEFAULT_INCIDENT_CENTER;
  }, [value]);

  const onPick = useCallback(
    (lat: number, lng: number) => {
      onChange({ lat, lng });
    },
    [onChange],
  );

  return (
    <div className="overflow-hidden rounded-xl border border-border/90 ring-1 ring-black/[0.04] dark:ring-white/[0.06]">
      <MapContainer
        center={center}
        zoom={value ? 14 : 12}
        className="z-0 h-[260px] w-full"
        scrollWheelZoom
        aria-label="Incident location map — click to place or move the pin"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapClickHandler onPick={onPick} />
        <FlyToPin pin={value} />
        {value && (
          <Marker
            icon={defaultIcon}
            position={[value.lat, value.lng]}
            draggable
            eventHandlers={{
              dragend: (e) => {
                const p = e.target.getLatLng();
                onChange({ lat: p.lat, lng: p.lng });
              },
            }}
          />
        )}
      </MapContainer>
    </div>
  );
}
