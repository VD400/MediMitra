import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect } from 'react';

// Fix for default marker icons in Leaflet with React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface Pharmacy {
  id: string;
  name: string;
  lat: number;
  lng: number;
  address?: string;
}

interface LeafletMapProps {
  center: [number, number];
  pharmacies: Pharmacy[];
  zoom?: number;
}

// Component to handle map center updates
function ChangeView({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

const LeafletMap = ({ center, pharmacies, zoom = 13 }: LeafletMapProps) => {
  return (
    <div className="h-full w-full rounded-2xl overflow-hidden border border-border shadow-inner">
      <MapContainer 
        center={center} 
        zoom={zoom} 
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        <ChangeView center={center} zoom={zoom} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* User Location Marker */}
        <Marker position={center}>
          <Popup>
            <div className="font-bold">Your Location</div>
          </Popup>
        </Marker>

        {/* Pharmacy Markers */}
        {pharmacies.map((pharmacy) => (
          <Marker key={pharmacy.id} position={[pharmacy.lat, pharmacy.lng]}>
            <Popup>
              <div className="p-1">
                <h4 className="font-bold text-primary">{pharmacy.name}</h4>
                {pharmacy.address && <p className="text-xs text-muted-foreground mt-1">{pharmacy.address}</p>}
                <button className="mt-2 text-[10px] bg-primary text-white px-2 py-1 rounded font-bold w-full">
                  Select Pharmacy
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default LeafletMap;
