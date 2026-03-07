/**
 * LiveMap Component
 * Enterprise-grade live flight tracking map with smooth interpolation
 * Features: Great Circle routes, Day/Night terminator, lazy loading
 */

'use client';

import { useEffect, useRef, useState, lazy, Suspense } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useFlightTracking } from '@/hooks/useFlightTracking';
import type { LiveFlight } from '@/types/flight';
import { Loader2, Plane } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Lazy load heavy components
const GreatCircleRoute = lazy(() => import('./map/GreatCircleRoute'));
const DayNightTerminator = lazy(() => import('./map/DayNightTerminator'));

// ============================================================================
// AIRCRAFT ICON
// ============================================================================

function createAircraftIcon(heading: number, isSelected: boolean = false): L.DivIcon {
    return L.divIcon({
        className: 'aircraft-marker',
        html: `
            <div class="aircraft-icon ${isSelected ? 'selected' : ''}" style="transform: rotate(${heading}deg)">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L14 10H22L16 14L18 22L12 18L6 22L8 14L2 10H10L12 2Z" 
                          fill="${isSelected ? '#FFD700' : '#3B82F6'}" 
                          stroke="${isSelected ? '#FFA500' : '#1E40AF'}" 
                          stroke-width="1"/>
                </svg>
            </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
    });
}

// ============================================================================
// SMOOTH MARKER COMPONENT
// ============================================================================

interface SmoothMarkerProps {
    flight: LiveFlight;
    isSelected: boolean;
    onClick: () => void;
}

function SmoothMarker({ flight, isSelected, onClick }: SmoothMarkerProps) {
    const markerRef = useRef<L.Marker>(null);
    const [position, setPosition] = useState<[number, number]>([
        flight.telemetry.lat,
        flight.telemetry.lng,
    ]);

    // Smooth position updates with CSS transitions
    useEffect(() => {
        if (flight.telemetry) {
            setPosition([flight.telemetry.lat, flight.telemetry.lng]);
        }
    }, [flight.telemetry]);

    const icon = createAircraftIcon(flight.telemetry.heading, isSelected);

    return (
        <Marker
            ref={markerRef}
            position={position}
            icon={icon}
            eventHandlers={{ click: onClick }}
        >
            <Popup>
                <div className="p-2 min-w-[200px]">
                    <div className="font-bold text-lg mb-2">{flight.callsign}</div>
                    <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Pilot:</span>
                            <span className="font-medium">{flight.pilotName}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Route:</span>
                            <span className="font-mono">{flight.departure} → {flight.arrival}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Altitude:</span>
                            <span className="font-mono">{flight.telemetry.alt.toLocaleString()} ft</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Speed:</span>
                            <span className="font-mono">{flight.telemetry.groundspeed || 0} kts</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Heading:</span>
                            <span className="font-mono">{Math.round(flight.telemetry.heading)}°</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">V/S:</span>
                            <span className="font-mono">{flight.telemetry.v_speed > 0 ? '+' : ''}{flight.telemetry.v_speed} fpm</span>
                        </div>
                    </div>
                </div>
            </Popup>
        </Marker>
    );
}

// ============================================================================
// MAP CONTROLLER
// ============================================================================

interface MapControllerProps {
    selectedFlight: LiveFlight | null;
    autoFollow: boolean;
}

function MapController({ selectedFlight, autoFollow }: MapControllerProps) {
    const map = useMap();

    useEffect(() => {
        if (selectedFlight && autoFollow && selectedFlight.telemetry) {
            map.setView(
                [selectedFlight.telemetry.lat, selectedFlight.telemetry.lng],
                map.getZoom(),
                { animate: true, duration: 1 }
            );
        }
    }, [selectedFlight, autoFollow, map]);

    return null;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export interface LiveMapProps {
    height?: string;
    showRoutes?: boolean;
    showTerminator?: boolean;
    initialZoom?: number;
    onFlightSelect?: (flight: LiveFlight | null) => void;
}

export default function LiveMap({
    height = '600px',
    showRoutes = true,
    showTerminator = true,
    initialZoom = 3,
    onFlightSelect,
}: LiveMapProps) {
    const { flights, isLoading, totalActive } = useFlightTracking({
        refetchInterval: 5000,
        smoothInterpolation: true,
    });

    const [selectedFlight, setSelectedFlight] = useState<LiveFlight | null>(null);
    const [autoFollow, setAutoFollow] = useState(false);
    const [mapReady, setMapReady] = useState(false);

    const handleFlightClick = (flight: LiveFlight) => {
        setSelectedFlight(flight);
        setAutoFollow(true);
        onFlightSelect?.(flight);
    };

    const handleMapClick = () => {
        setSelectedFlight(null);
        setAutoFollow(false);
        onFlightSelect?.(null);
    };

    if (isLoading && flights.length === 0) {
        return (
            <div className="flex items-center justify-center bg-[#0a0a0a] rounded-xl border border-white/10" style={{ height }}>
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-accent-gold mx-auto mb-2" />
                    <p className="text-gray-400 text-sm">Loading live map...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative rounded-xl overflow-hidden border border-white/10" style={{ height }}>
            {/* Map Header */}
            <div className="absolute top-4 left-4 z-[1000] bg-black/80 backdrop-blur-md rounded-lg px-4 py-2 border border-white/10">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-white font-bold">{totalActive}</span>
                        <span className="text-gray-400 text-sm">Active Flights</span>
                    </div>
                    {selectedFlight && (
                        <>
                            <div className="w-px h-4 bg-white/20" />
                            <div className="flex items-center gap-2">
                                <Plane className="w-4 h-4 text-accent-gold" />
                                <span className="text-white font-mono text-sm">{selectedFlight.callsign}</span>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Map Controls */}
            {selectedFlight && (
                <div className="absolute top-4 right-4 z-[1000] bg-black/80 backdrop-blur-md rounded-lg px-3 py-2 border border-white/10">
                    <button
                        onClick={() => setAutoFollow(!autoFollow)}
                        className={`text-xs font-medium transition-colors ${
                            autoFollow ? 'text-accent-gold' : 'text-gray-400 hover:text-white'
                        }`}
                    >
                        {autoFollow ? '📍 Following' : '📍 Follow'}
                    </button>
                </div>
            )}

            {/* Leaflet Map */}
            <MapContainer
                center={[20, 0]}
                zoom={initialZoom}
                style={{ height: '100%', width: '100%' }}
                className="z-0"
                whenReady={() => setMapReady(true)}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />

                {/* Day/Night Terminator */}
                {showTerminator && mapReady && (
                    <Suspense fallback={null}>
                        <DayNightTerminator />
                    </Suspense>
                )}

                {/* Aircraft Markers */}
                {flights.map((flight) => (
                    <SmoothMarker
                        key={flight._id}
                        flight={flight}
                        isSelected={selectedFlight?._id === flight._id}
                        onClick={() => handleFlightClick(flight)}
                    />
                ))}

                {/* Great Circle Routes */}
                {showRoutes && selectedFlight && mapReady && (
                    <Suspense fallback={null}>
                        <GreatCircleRoute
                            departure={selectedFlight.departure}
                            arrival={selectedFlight.arrival}
                        />
                    </Suspense>
                )}

                {/* Map Controller */}
                <MapController selectedFlight={selectedFlight} autoFollow={autoFollow} />
            </MapContainer>

            {/* CSS for smooth transitions */}
            <style jsx global>{`
                .aircraft-marker {
                    transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
                }
                
                .aircraft-icon {
                    transition: all 0.3s ease;
                }
                
                .aircraft-icon.selected {
                    filter: drop-shadow(0 0 8px rgba(255, 215, 0, 0.6));
                    transform: scale(1.2);
                }
                
                .leaflet-marker-icon {
                    transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1) !important;
                }
            `}</style>
        </div>
    );
}
