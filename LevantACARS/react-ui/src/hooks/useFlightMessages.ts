import { useState, useEffect } from 'react';

export interface FlightMessage {
  id: number;
  timestamp: string;
  type: 'ATC' | 'SYSTEM' | 'DISPATCH' | 'AIRLINE';
  sender: string;
  message: string;
  read?: boolean;
}

export function useFlightMessages() {
  const [messages, setMessages] = useState<FlightMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);
        
        // Fetch messages from ACARS API
        const response = await fetch('/api/acars?action=messages');
        
        if (!response.ok) {
          throw new Error('Failed to fetch messages');
        }

        const data = await response.json();
        
        if (data.messages && Array.isArray(data.messages)) {
          setMessages(data.messages);
        } else {
          setMessages([]);
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching flight messages:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch messages');
        setMessages([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
    
    // Poll for new messages every 10 seconds
    const interval = setInterval(fetchMessages, 10000);
    
    return () => clearInterval(interval);
  }, []);

  return { messages, loading, error };
}
