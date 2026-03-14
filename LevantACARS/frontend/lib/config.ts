import { parseIni } from './ini-parser'

export interface AppConfig {
  apiBaseUrl: string
  deviceName: string
  version: string
  autoRefreshInterval: number
  features: {
    liveFlights: boolean
    statistics: boolean
    leaderboards: boolean
  }
}

let cachedConfig: AppConfig | null = null

export async function loadConfig(): Promise<AppConfig> {
  if (cachedConfig) {
    return cachedConfig
  }

  try {
    const response = await fetch('/config.ini')
    if (!response.ok) {
      throw new Error('Failed to load config')
    }
    
    const iniContent = await response.text()
    const parsed = parseIni(iniContent)
    
    // Map INI structure to AppConfig
    cachedConfig = {
      apiBaseUrl: (parsed.API?.BaseUrl as string) || 'https://levant-va.com',
      deviceName: (parsed.Application?.DeviceName as string) || 'LevantACARS',
      version: (parsed.Application?.Version as string) || '1.0.0',
      autoRefreshInterval: (parsed.Application?.AutoRefreshInterval as number) || 15000,
      features: {
        liveFlights: (parsed.Features?.LiveFlights as boolean) ?? true,
        statistics: (parsed.Features?.Statistics as boolean) ?? true,
        leaderboards: (parsed.Features?.Leaderboards as boolean) ?? true,
      },
    }
    
    return cachedConfig!
  } catch (error) {
    console.error('Failed to load config, using defaults:', error)
    // Fallback to defaults
    cachedConfig = {
      apiBaseUrl: 'https://levant-va.com',
      deviceName: 'LevantACARS',
      version: '1.0.0',
      autoRefreshInterval: 15000,
      features: {
        liveFlights: true,
        statistics: true,
        leaderboards: true,
      },
    }
    return cachedConfig
  }
}

export function getConfig(): AppConfig {
  if (!cachedConfig) {
    throw new Error('Config not loaded. Call loadConfig() first.')
  }
  return cachedConfig
}

export function clearConfigCache(): void {
  cachedConfig = null
}
