import { useState, useEffect } from 'react';

export interface SystemStatus {
  name: string;
  status: 'OPERATIONAL' | 'WARNING' | 'CRITICAL' | 'OFFLINE' | 'STANDBY';
  value: string;
}

export function useSystemStatus() {
  const [systems, setSystems] = useState<SystemStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSystemStatus = async () => {
      try {
        setLoading(true);
        
        // Fetch system status from ACARS API
        const response = await fetch('/api/acars?action=systems');
        
        if (!response.ok) {
          throw new Error('Failed to fetch system status');
        }

        const data = await response.json();
        
        if (data.systems && Array.isArray(data.systems)) {
          setSystems(data.systems);
        } else {
          setSystems([]);
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching system status:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch system status');
        setSystems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSystemStatus();
    
    // Poll for updates every 15 seconds
    const interval = setInterval(fetchSystemStatus, 15000);
    
    return () => clearInterval(interval);
  }, []);

  return { systems, loading, error };
}
