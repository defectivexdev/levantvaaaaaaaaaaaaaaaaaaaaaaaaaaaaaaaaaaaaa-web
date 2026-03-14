// API Types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

// Auth Types
export interface DeviceCodeResponse {
  device_code: string
  user_code: string
  verification_uri: string
  expires_in: number
  interval: number
}

export interface DeviceTokenResponse {
  access_token: string
  token_type: string
  expires_in: number
  refresh_token?: string
}

export interface AuthState {
  isAuthenticated: boolean
  deviceToken: string | null
  pilot: PilotProfile | null
}

// Pilot Types
export interface PilotProfile {
  id: string
  pilot_id: string
  name: string
  email?: string
  avatar_url?: string
  rank: PilotRank
  total_hours: number
  total_flights: number
  joined_date: string
  status: 'active' | 'inactive' | 'suspended'
}

export interface PilotRank {
  id: string
  name: string
  min_hours: number
  image_url?: string
}

// Flight Types
export interface Flight {
  id: string
  flight_number: string
  pilot_id: string
  pilot_name: string
  aircraft_type: string
  departure_icao: string
  arrival_icao: string
  departure_time?: string
  arrival_time?: string
  status: FlightStatus
  phase: FlightPhase
  latitude?: number
  longitude?: number
  altitude?: number
  ground_speed?: number
  heading?: number
  distance?: number
  fuel_remaining?: number
  created_at: string
  updated_at: string
}

export type FlightStatus = 
  | 'scheduled'
  | 'boarding'
  | 'departed'
  | 'in_flight'
  | 'arrived'
  | 'completed'
  | 'cancelled'

export type FlightPhase =
  | 'preflight'
  | 'taxi'
  | 'takeoff'
  | 'climb'
  | 'cruise'
  | 'descent'
  | 'approach'
  | 'landing'
  | 'landed'

// PIREP Types
export interface PIREP {
  id: string
  flight_id: string
  pilot_id: string
  flight_number: string
  aircraft_type: string
  departure_icao: string
  arrival_icao: string
  departure_time: string
  arrival_time: string
  flight_time: number
  distance: number
  fuel_used: number
  landing_rate: number
  score: number
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
}

// Statistics Types
export interface PilotStatistics {
  total_flights: number
  total_hours: number
  total_distance: number
  average_landing_rate: number
  average_score: number
  flights_by_month: MonthlyFlights[]
  top_aircraft: AircraftStats[]
  top_routes: RouteStats[]
}

export interface MonthlyFlights {
  month: string
  flights: number
  hours: number
}

export interface AircraftStats {
  aircraft_type: string
  flights: number
  hours: number
}

export interface RouteStats {
  route: string
  flights: number
  departure_icao: string
  arrival_icao: string
}

// Leaderboard Types
export interface LeaderboardEntry {
  rank: number
  pilot_id: string
  pilot_name: string
  avatar_url?: string
  total_hours?: number
  total_flights?: number
  average_score?: number
  value: number
}

export interface Leaderboard {
  type: 'hours' | 'flights' | 'score'
  entries: LeaderboardEntry[]
  updated_at: string
}
