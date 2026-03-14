import { useState, useEffect } from 'react';

interface FlightData {
  flightNumber: string;
  aircraft: string;
  departure: string;
  departureName: string;
  arrival: string;
  arrivalName: string;
  pilot: string;
  coPilot: string;
  eta: string;
  ete: string;
  altitude: number;
  speed: number;
  heading: number;
  verticalSpeed: number;
  fuel: number;
  fuelKg: number;
  temperature: number;
  windSpeed: number;
  windDirection: number;
  mach: number;
  grossWeight: number;
  passengers: number;
  phase: string;
  progress: number;
  distance: string;
  distanceToGo: string;
  flightTime: string;
}

export function useAcarsFlightData() {
  const [flightData, setFlightData] = useState<FlightData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFlightData = async () => {
      try {
        setLoading(true);
        
        // Fetch current flight from ACARS API
        const response = await fetch('/api/acars?action=traffic');
        
        if (!response.ok) {
          throw new Error('Failed to fetch flight data');
        }

        const data = await response.json();
        
        // Get the first active flight or user's current flight
        const activeFlight = data.flights?.[0];
        
        if (activeFlight) {
          setFlightData({
            flightNumber: activeFlight.callsign || 'N/A',
            aircraft: activeFlight.aircraft || 'Unknown Aircraft',
            departure: activeFlight.departure || 'N/A',
            departureName: activeFlight.departureName || '',
            arrival: activeFlight.arrival || 'N/A',
            arrivalName: activeFlight.arrivalName || '',
            pilot: activeFlight.pilot || 'Unknown',
            coPilot: activeFlight.coPilot || '',
            eta: activeFlight.eta || 'N/A',
            ete: activeFlight.ete || 'N/A',
            altitude: activeFlight.altitude || 0,
            speed: activeFlight.groundSpeed || 0,
            heading: activeFlight.heading || 0,
            verticalSpeed: activeFlight.verticalSpeed || 0,
            fuel: activeFlight.fuelPercent || 0,
            fuelKg: activeFlight.fuelRemaining || 0,
            temperature: activeFlight.temperature || 0,
            windSpeed: activeFlight.windSpeed || 0,
            windDirection: activeFlight.windDirection || 0,
            mach: activeFlight.mach || 0,
            grossWeight: activeFlight.grossWeight || 0,
            passengers: activeFlight.passengers || 0,
            phase: activeFlight.phase || 'CRUISE',
            progress: activeFlight.progress || 0,
            distance: activeFlight.distance || '0 NM',
            distanceToGo: activeFlight.distanceToGo || '0 NM',
            flightTime: activeFlight.flightTime || '00:00:00',
          });
        } else {
          setFlightData(null);
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching ACARS flight data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch flight data');
        setFlightData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchFlightData();
    
    // Poll for updates every 5 seconds
    const interval = setInterval(fetchFlightData, 5000);
    
    return () => clearInterval(interval);
  }, []);

  return { flightData, loading, error };
}
