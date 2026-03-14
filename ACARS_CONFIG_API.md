# LevantACARS Configuration API Integration

## Overview
The web application exposes a public API endpoint that allows LevantACARS to read and update airline configuration settings in real-time.

## API Endpoint
```
Base URL: https://your-domain.com/api/config
```

## Authentication
All POST requests require an API key to be sent in the headers:
```
x-api-key: your-secret-api-key
```

Set the API key in your `.env.local` file:
```env
ACARS_API_KEY=your-secure-random-key-here
```

## Endpoints

### GET /api/config
Fetch current airline configuration (no authentication required for read access).

**Request:**
```http
GET /api/config HTTP/1.1
Host: your-domain.com
```

**Response:**
```json
{
  "success": true,
  "config": {
    "fuel_tax_percent": 10,
    "penalty_multiplier": 5,
    "ticket_price_per_nm": 0.8,
    "cargo_price_per_lb_nm": 0.002,
    "fuel_price_per_lb": 0.65,
    "base_landing_fee": 250,
    "pilot_pay_rate": 2500,
    "hard_landing_threshold": -400,
    "severe_damage_threshold": -700,
    "overspeed_damage_per_10s": 0.5,
    "gforce_high_threshold": 2.5,
    "gforce_low_threshold": -1.0,
    "grounded_health_threshold": 20,
    "store_to_airline_percent": 100,
    "salary_enabled": 1,
    "salary_cadet": 500,
    "salary_second_officer": 1000,
    "salary_first_officer": 1500,
    "salary_senior_first_officer": 2000,
    "salary_captain": 3000,
    "salary_senior_captain": 4000,
    "salary_check_airman": 5000,
    "cr_base_flight": 100,
    "cr_greaser_bonus": 50,
    "cr_firm_bonus": 25,
    "cr_hard_landing_penalty": -50,
    "cr_on_time_bonus": 20,
    "cr_fuel_efficiency_bonus": 30,
    "cr_first_flight_multiplier": 1.2,
    "cr_hub_to_hub_bonus": 50,
    "cr_event_multiplier": 2.0,
    "cr_long_haul_4h": 100,
    "cr_long_haul_8h": 250,
    "cr_new_route_bonus": 50,
    "cr_taxi_speed_penalty": -10,
    "cr_light_violation_penalty": -15,
    "cr_overspeed_penalty": -50,
    "cr_taxi_speed_limit": 30,
    "cr_group_flight_participation": 50,
    "location_based_fleet": 1
  },
  "timestamp": "2026-03-14T14:56:00.000Z"
}
```

### POST /api/config
Update airline configuration (requires API key).

**Request:**
```http
POST /api/config HTTP/1.1
Host: your-domain.com
Content-Type: application/json
x-api-key: your-secret-api-key

{
  "hard_landing_threshold": -450,
  "severe_damage_threshold": -750,
  "cr_greaser_bonus": 75
}
```

**Response:**
```json
{
  "success": true,
  "config": { /* full updated config */ },
  "updated_fields": [
    "hard_landing_threshold",
    "severe_damage_threshold",
    "cr_greaser_bonus"
  ]
}
```

## LevantACARS Integration Example (C#)

### Reading Configuration
```csharp
using System.Net.Http;
using System.Text.Json;

public class ConfigService
{
    private readonly HttpClient _httpClient;
    private const string API_BASE = "https://your-domain.com/api/config";

    public async Task<AirlineConfig> GetConfigAsync()
    {
        var response = await _httpClient.GetAsync(API_BASE);
        response.EnsureSuccessStatusCode();
        
        var json = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<ConfigResponse>(json);
        
        return result.Config;
    }
}

public class ConfigResponse
{
    public bool Success { get; set; }
    public AirlineConfig Config { get; set; }
    public string Timestamp { get; set; }
}

public class AirlineConfig
{
    public double FuelTaxPercent { get; set; }
    public double PenaltyMultiplier { get; set; }
    public double HardLandingThreshold { get; set; }
    public double SevereDamageThreshold { get; set; }
    public double CrGreaserBonus { get; set; }
    // ... add other fields as needed
}
```

### Updating Configuration
```csharp
public async Task<bool> UpdateConfigAsync(Dictionary<string, object> updates)
{
    var apiKey = Environment.GetEnvironmentVariable("ACARS_API_KEY");
    
    var request = new HttpRequestMessage(HttpMethod.Post, API_BASE)
    {
        Content = new StringContent(
            JsonSerializer.Serialize(updates),
            Encoding.UTF8,
            "application/json"
        )
    };
    
    request.Headers.Add("x-api-key", apiKey);
    
    var response = await _httpClient.SendAsync(request);
    return response.IsSuccessStatusCode;
}
```

## Available Configuration Fields

### Economy & Revenue
- `fuel_tax_percent` - Fuel tax percentage (0-100)
- `penalty_multiplier` - Penalty multiplier for poor performance
- `ticket_price_per_nm` - Ticket price per nautical mile
- `cargo_price_per_lb_nm` - Cargo price per pound per nautical mile
- `fuel_price_per_lb` - Fuel cost per pound
- `base_landing_fee` - Base landing fee
- `pilot_pay_rate` - Pilot pay rate per hour
- `store_to_airline_percent` - Store revenue percentage to airline vault

### Flight Operations & Damage
- `hard_landing_threshold` - Hard landing threshold in FPM (negative value)
- `severe_damage_threshold` - Severe damage threshold in FPM (negative value)
- `overspeed_damage_per_10s` - Damage percentage per 10 seconds of overspeed
- `gforce_high_threshold` - High G-force threshold
- `gforce_low_threshold` - Low G-force threshold (negative value)
- `grounded_health_threshold` - Aircraft grounding health threshold percentage

### Pilot Salaries
- `salary_enabled` - Enable/disable salary system (0 or 1)
- `salary_cadet` - Weekly salary for Cadet rank
- `salary_second_officer` - Weekly salary for Second Officer
- `salary_first_officer` - Weekly salary for First Officer
- `salary_senior_first_officer` - Weekly salary for Senior First Officer
- `salary_captain` - Weekly salary for Captain
- `salary_senior_captain` - Weekly salary for Senior Captain
- `salary_check_airman` - Weekly salary for Check Airman

### Credit System
- `cr_base_flight` - Base credits per flight
- `cr_greaser_bonus` - Bonus for greaser landing (< 150 fpm)
- `cr_firm_bonus` - Bonus for firm landing
- `cr_hard_landing_penalty` - Penalty for hard landing
- `cr_on_time_bonus` - Bonus for on-time arrival
- `cr_fuel_efficiency_bonus` - Bonus for fuel efficiency
- `cr_first_flight_multiplier` - Multiplier for first flight of day
- `cr_hub_to_hub_bonus` - Bonus for hub-to-hub flights
- `cr_event_multiplier` - Multiplier for event flights
- `cr_long_haul_4h` - Bonus for 4-8 hour flights
- `cr_long_haul_8h` - Bonus for 8+ hour flights
- `cr_new_route_bonus` - Bonus for new route discovery
- `cr_taxi_speed_penalty` - Penalty for taxi speed violations
- `cr_light_violation_penalty` - Penalty for light violations
- `cr_overspeed_penalty` - Penalty for overspeed violations
- `cr_taxi_speed_limit` - Taxi speed limit in knots
- `cr_group_flight_participation` - Credits for group flight participation

### Fleet Operations
- `location_based_fleet` - Enable/disable location-based fleet (0 or 1)

## Security Notes

1. **API Key Storage**: Store the API key securely in environment variables, never hardcode it
2. **HTTPS Only**: Always use HTTPS in production to encrypt API key transmission
3. **Rate Limiting**: Consider implementing rate limiting if needed
4. **Validation**: All numeric values are validated on the server side
5. **Audit Trail**: All updates are logged with timestamp and source (ACARS)

## Error Handling

### 401 Unauthorized
```json
{
  "success": false,
  "error": "Invalid or missing API key"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Internal server error"
}
```

## Testing

### Using cURL
```bash
# Get configuration
curl https://your-domain.com/api/config

# Update configuration
curl -X POST https://your-domain.com/api/config \
  -H "Content-Type: application/json" \
  -H "x-api-key: your-secret-key" \
  -d '{"hard_landing_threshold": -450}'
```

### Using Postman
1. Create a new POST request to `https://your-domain.com/api/config`
2. Add header: `x-api-key: your-secret-key`
3. Set body to JSON with the fields you want to update
4. Send request

## Sync Frequency Recommendations

- **On ACARS Startup**: Fetch full configuration
- **Periodic Sync**: Poll every 5-10 minutes for updates
- **On Admin Change**: Web app updates are immediate
- **Cache Locally**: Cache config in ACARS to reduce API calls

## Support

For issues or questions, contact the development team or refer to the main documentation.
