import { useState, useEffect } from 'react';

export interface Waypoint {
  name: string;
  type: string;
  altitude: string;
  eta: string;
  distance: string;
  distanceToGo?: string;
  fuelEst?: string;
  passed: boolean;
  wind?: string;
}

export interface FlightPlanData {
  waypoints: Waypoint[];
  departure: string;
  arrival: string;
  route: string;
  cruiseAltitude: string;
  cruiseSpeed: string;
}

export function useFlightPlanData() {
  const [flightPlan, setFlightPlan] = useState<FlightPlanData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFlightPlan = async () => {
      try {
        setLoading(true);
        
        // Fetch flight plan from ACARS API
        const response = await fetch('/api/acars?action=flightplan');
        
        if (!response.ok) {
          throw new Error('Failed to fetch flight plan');
        }

        const data = await response.json();
        
        if (data.flightPlan) {
          setFlightPlan({
            waypoints: data.flightPlan.waypoints || [],
            departure: data.flightPlan.departure || '',
            arrival: data.flightPlan.arrival || '',
            route: data.flightPlan.route || '',
            cruiseAltitude: data.flightPlan.cruiseAltitude || '',
            cruiseSpeed: data.flightPlan.cruiseSpeed || '',
          });
        } else {
          setFlightPlan(null);
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching flight plan:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch flight plan');
        setFlightPlan(null);
      } finally {
        setLoading(false);
      }
    };

    fetchFlightPlan();
    
    // Poll for updates every 30 seconds
    const interval = setInterval(fetchFlightPlan, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return { flightPlan, loading, error };
}
