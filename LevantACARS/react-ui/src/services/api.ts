import { Pilot } from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new ApiError(response.status, `API Error: ${response.statusText}`);
  }

  return response.json();
}

export const pilotsApi = {
  getAll: () => fetchApi<Pilot[]>('/pilots'),
  getById: (id: string) => fetchApi<Pilot>(`/pilots/${id}`),
  getActive: () => fetchApi<Pilot[]>('/pilots/active'),
};

export const flightsApi = {
  getAll: () => fetchApi('/flights'),
  getById: (id: string) => fetchApi(`/flights/${id}`),
  create: (data: any) => fetchApi('/flights', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: any) => fetchApi(`/flights/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
};

export const telemetryApi = {
  getCurrent: (pilotId: string) => fetchApi(`/telemetry/${pilotId}`),
  getHistory: (pilotId: string, limit = 100) => 
    fetchApi(`/telemetry/${pilotId}/history?limit=${limit}`),
};

export const statsApi = {
  getPilotStats: (pilotId: string) => fetchApi(`/stats/pilot/${pilotId}`),
  getSystemStats: () => fetchApi('/stats/system'),
};

export { ApiError };
