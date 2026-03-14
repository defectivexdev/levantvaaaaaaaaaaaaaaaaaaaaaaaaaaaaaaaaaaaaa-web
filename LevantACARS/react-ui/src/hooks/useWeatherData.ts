import { useState, useEffect } from 'react';

export interface WeatherData {
  location: string;
  locationName: string;
  condition: string;
  temperature: number;
  dewpoint: number;
  visibility: string;
  clouds: string;
  pressure: string;
  humidity: number;
  windSpeed: number;
  windDir: number;
  gusts?: number;
  metar: string;
  taf: string;
}

export function useWeatherData(departure?: string, arrival?: string) {
  const [departureWeather, setDepartureWeather] = useState<WeatherData | null>(null);
  const [arrivalWeather, setArrivalWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!departure && !arrival) {
      setLoading(false);
      return;
    }

    const fetchWeather = async () => {
      try {
        setLoading(true);
        
        // Fetch departure weather
        if (departure) {
          const depResponse = await fetch(`/api/weather/metar?icao=${departure}`);
          if (depResponse.ok) {
            const depData = await depResponse.json();
            setDepartureWeather(depData.weather || null);
          }
        }
        
        // Fetch arrival weather
        if (arrival) {
          const arrResponse = await fetch(`/api/weather/metar?icao=${arrival}`);
          if (arrResponse.ok) {
            const arrData = await arrResponse.json();
            setArrivalWeather(arrData.weather || null);
          }
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching weather data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch weather');
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
    
    // Poll for updates every 5 minutes
    const interval = setInterval(fetchWeather, 300000);
    
    return () => clearInterval(interval);
  }, [departure, arrival]);

  return { departureWeather, arrivalWeather, loading, error };
}
