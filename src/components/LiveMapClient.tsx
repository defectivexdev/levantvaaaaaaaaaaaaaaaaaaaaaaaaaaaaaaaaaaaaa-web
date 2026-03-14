'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import FlightStatusBadge from './FlightStatusBadge';
import { Plane } from 'lucide-react';

interface FlightData {
  _id: string;
  pilot_id: string;
  pilot_name?: string;
  flight_number: string;
  callsign: string;
  aircraft_type?: string;
  departure_icao?: string;
  arrival_icao?: string;
  latitude: number;
  longitude: number;
  altitude: number;
  ground_speed: number;
  heading: number;
  phase: string;
  status: string;
  last_update: string;
}

export default function LiveMapClient() {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const [flights, setFlights] = useState<FlightData[]>([]);
  const [selectedFlight, setSelectedFlight] = useState<FlightData | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [33.8547, 35.8623],
      zoom: 6,
      zoomControl: true,
      preferCanvas: true
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20
    }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  const createAircraftIcon = (heading: number, status: string) => {
    const statusColors: Record<string, string> = {
      boarding: '#60a5fa',
      preflight: '#60a5fa',
      taxi: '#facc15',
      takeoff: '#fb923c',
      climb: '#60a5fa',
      cruise: '#4ade80',
      descent: '#fb923c',
      approach: '#f87171',
      landed: '#9ca3af',
      completed: '#9ca3af'
    };

    const color = statusColors[status.toLowerCase()] || '#60a5fa';

    return L.divIcon({
      html: `
        <div style="transform: rotate(${heading}deg); width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L4 20L12 17L20 20L12 2Z" fill="${color}" stroke="#000" stroke-width="1" stroke-linejoin="round"/>
            <circle cx="12" cy="12" r="2" fill="#fff" opacity="0.9"/>
          </svg>
        </div>
      `,
      className: 'aircraft-marker',
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });
  };

  const updateAircraftMarker = (flight: FlightData) => {
    if (!mapRef.current) return;

    const key = flight.pilot_id;
    let marker = markersRef.current.get(key);

    const icon = createAircraftIcon(flight.heading, flight.status);

    if (marker) {
      const currentLatLng = marker.getLatLng();
      const newLatLng = L.latLng(flight.latitude, flight.longitude);
      
      if (currentLatLng.lat !== newLatLng.lat || currentLatLng.lng !== newLatLng.lng) {
        marker.setLatLng(newLatLng);
      }
      
      marker.setIcon(icon);
    } else {
      marker = L.marker([flight.latitude, flight.longitude], { icon })
        .addTo(mapRef.current);
      
      markersRef.current.set(key, marker);
    }

    marker.off('click');
    marker.on('click', () => {
      setSelectedFlight(flight);
    });

    const popupContent = `
      <div class="text-white bg-[#0B0B0F] p-4 rounded-lg border border-white/10 min-w-[250px]">
        <div class="font-bold text-lg mb-2">${flight.callsign}</div>
        <div class="space-y-1 text-sm">
          <div class="flex justify-between">
            <span class="text-gray-400">Pilot:</span>
            <span class="font-semibold">${flight.pilot_name || flight.pilot_id}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-400">Flight:</span>
            <span class="font-semibold">${flight.flight_number}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-400">Aircraft:</span>
            <span class="font-semibold">${flight.aircraft_type || 'N/A'}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-400">Route:</span>
            <span class="font-semibold">${flight.departure_icao || '????'} → ${flight.arrival_icao || '????'}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-400">Altitude:</span>
            <span class="font-semibold">${Math.round(flight.altitude).toLocaleString()} ft</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-400">Speed:</span>
            <span class="font-semibold">${Math.round(flight.ground_speed)} kts</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-400">Heading:</span>
            <span class="font-semibold">${Math.round(flight.heading)}°</span>
          </div>
          <div class="mt-3">
            <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getStatusStyle(flight.status)}">
              ${flight.status}
            </span>
          </div>
        </div>
      </div>
    `;

    marker.bindPopup(popupContent, {
      className: 'custom-popup',
      closeButton: true,
      maxWidth: 300
    });
  };

  const getStatusStyle = (status: string) => {
    const styles: Record<string, string> = {
      boarding: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
      preflight: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
      taxi: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
      takeoff: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
      climb: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
      cruise: 'text-green-400 bg-green-500/10 border-green-500/20',
      descent: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
      approach: 'text-red-400 bg-red-500/10 border-red-500/20',
      landed: 'text-gray-400 bg-gray-500/10 border-gray-500/20',
      completed: 'text-gray-400 bg-gray-500/10 border-gray-500/20'
    };
    return styles[status.toLowerCase()] || styles.boarding;
  };

  const focusOnFlight = (flight: FlightData) => {
    if (!mapRef.current) return;
    mapRef.current.setView([flight.latitude, flight.longitude], 10, {
      animate: true,
      duration: 1
    });
    setSelectedFlight(flight);
    const marker = markersRef.current.get(flight.pilot_id);
    if (marker) {
      marker.openPopup();
    }
  };

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainerRef} className="w-full h-full rounded-2xl overflow-hidden border border-white/10" />
      
      <div className="absolute top-4 right-4 z-[1000] bg-panel backdrop-blur-sm border border-white/10 rounded-xl p-3 shadow-2xl">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            {isConnected ? 'Live' : 'Disconnected'}
          </span>
          <span className="text-xs text-gray-400">
            {flights.length} {flights.length === 1 ? 'flight' : 'flights'}
          </span>
        </div>
      </div>

      <div className="absolute top-4 left-4 z-[1000] bg-panel backdrop-blur-sm border border-white/10 rounded-xl p-4 shadow-2xl max-h-[calc(100vh-200px)] overflow-y-auto max-w-sm">
        <div className="flex items-center gap-2 mb-4">
          <Plane className="w-4 h-4 text-accent-gold" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Active Flights</h3>
        </div>
        
        {flights.length === 0 ? (
          <p className="text-gray-500 text-xs">No active flights</p>
        ) : (
          <div className="space-y-2">
            {flights.map(flight => (
              <button
                key={flight.pilot_id}
                onClick={() => focusOnFlight(flight)}
                className="w-full text-left bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg p-3 transition-all group"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="text-white font-bold text-sm">{flight.callsign}</div>
                    <div className="text-gray-400 text-xs">{flight.pilot_name || flight.pilot_id}</div>
                  </div>
                  <FlightStatusBadge status={flight.status} className="text-[10px] px-2 py-0.5" />
                </div>
                <div className="text-xs text-gray-500">
                  {flight.departure_icao || '????'} → {flight.arrival_icao || '????'}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {Math.round(flight.altitude).toLocaleString()} ft • {Math.round(flight.ground_speed)} kts
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <style jsx global>{`
        .aircraft-marker {
          background: transparent !important;
          border: none !important;
        }
        
        .leaflet-popup-content-wrapper {
          background: #0B0B0F !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          border-radius: 12px !important;
          padding: 0 !important;
        }
        
        .leaflet-popup-content {
          margin: 0 !important;
        }
        
        .leaflet-popup-tip {
          background: #0B0B0F !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
        }
      `}</style>
    </div>
  );
}
