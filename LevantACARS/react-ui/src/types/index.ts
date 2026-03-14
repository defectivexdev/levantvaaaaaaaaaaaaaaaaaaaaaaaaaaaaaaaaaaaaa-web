export interface Pilot {
  id: string;
  callsign: string;
  latitude: number;
  longitude: number;
  altitude: number;
  heading: number;
  groundSpeed: number;
  aircraft: string;
  departure: string;
  arrival: string;
  route?: string;
  status: 'boarding' | 'taxiing' | 'departing' | 'enroute' | 'descending' | 'landing' | 'arrived';
}

export interface FlightRoute {
  waypoints: [number, number][];
}
