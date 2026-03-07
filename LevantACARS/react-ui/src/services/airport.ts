export interface Runway {
  le_ident: string;
  he_ident: string;
  length_ft: number | string;
  width_ft: number | string;
  surface: string;
  le_elevation_ft: number | string;
  he_elevation_ft: number | string;
}

export interface Frequency {
  type: string;
  description: string;
  frequency_mhz: string;
}

export interface Navaid {
  ident: string;
  name: string;
  type: string;
  frequency_khz: string;
}

export interface AirportDetails {
  ident: string;
  iata_code?: string;
  name: string;
  municipality: string;
  iso_country: string;
  elevation_ft: number | string;
  latitude_deg: number | string;
  longitude_deg: number | string;
  runways: Runway[];
  freqs: Frequency[];
  navaids: Navaid[];
}

const _pendingAirportRequests = new Map<string, (data: AirportDetails | null) => void>();

// Listen for airport details from C# (one-time setup)
if (window.chrome?.webview) {
  window.chrome.webview.addEventListener('message', (e: MessageEvent) => {
    try {
      const data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
      if (data.type === 'airportDetailsResult') {
        const key = `airportDetailsResult:${data.icao}`;
        const resolver = _pendingAirportRequests.get(key);
        if (resolver) {
          _pendingAirportRequests.delete(key);
          resolver(data.success ? (data.data as AirportDetails) : null);
        }
      }
    } catch { /* ignore */ }
  });
}

export function fetchAirportDetails(icao: string): Promise<AirportDetails | null> {
  const upper = icao.toUpperCase();
  
  // In dev browser, return dummy or null since we don't have API key on frontend
  if (!window.chrome?.webview) {
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    const key = `airportDetailsResult:${upper}`;

    // Timeout after 10s
    const timer = setTimeout(() => {
      _pendingAirportRequests.delete(key);
      resolve(null);
    }, 10000);

    _pendingAirportRequests.set(key, (data) => {
      clearTimeout(timer);
      resolve(data);
    });

    window.chrome!.webview!.postMessage(JSON.stringify({ action: 'requestAirportDetails', icao: upper }));
  });
}
