import { useState, useEffect } from 'react';
import { Pilot } from '@/types';
import { pilotsApi } from '@/services/api';

const MOCK_PILOTS: Pilot[] = [
  {
    id: '1',
    callsign: 'LVT001',
    latitude: 33.9425,
    longitude: -118.408,
    altitude: 15000,
    heading: 270,
    groundSpeed: 450,
    aircraft: 'Boeing 737-800',
    departure: 'KLAX',
    arrival: 'KSFO',
    route: 'KLAX BASET3 BASET J501 AVE BDEGA2 KSFO',
    status: 'enroute',
  },
  {
    id: '2',
    callsign: 'LVT002',
    latitude: 40.6413,
    longitude: -73.7781,
    altitude: 3000,
    heading: 90,
    groundSpeed: 180,
    aircraft: 'Airbus A320',
    departure: 'KJFK',
    arrival: 'KBOS',
    status: 'departing',
  },
  {
    id: '3',
    callsign: 'LVT003',
    latitude: 51.4700,
    longitude: -0.4543,
    altitude: 28000,
    heading: 45,
    groundSpeed: 480,
    aircraft: 'Boeing 777-300ER',
    departure: 'EGLL',
    arrival: 'KJFK',
    route: 'EGLL DVR UL9 KONAN NATW MUSVA ALLRY KJFK',
    status: 'enroute',
  },
];

export function usePilots() {
  const [pilots, setPilots] = useState<Pilot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useMockData, setUseMockData] = useState(false);

  useEffect(() => {
    const fetchPilots = async () => {
      try {
        setLoading(true);
        
        // Try to fetch from API
        try {
          const data = await pilotsApi.getActive();
          setPilots(data);
          setUseMockData(false);
          setError(null);
        } catch (apiError) {
          // Fallback to mock data if API fails
          console.warn('API unavailable, using mock data:', apiError);
          setPilots(MOCK_PILOTS);
          setUseMockData(true);
          setError(null);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch pilots');
        setPilots(MOCK_PILOTS);
        setUseMockData(true);
      } finally {
        setLoading(false);
      }
    };

    fetchPilots();
    
    // Poll for updates every 5 seconds
    const interval = setInterval(fetchPilots, 5000);
    
    return () => clearInterval(interval);
  }, []);

  return { pilots, loading, error, useMockData };
}
