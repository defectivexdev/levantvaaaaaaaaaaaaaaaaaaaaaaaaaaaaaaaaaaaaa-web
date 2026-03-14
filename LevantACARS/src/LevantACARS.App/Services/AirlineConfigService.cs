using System.Net.Http;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace LevantACARS.Services;

/// <summary>
/// Fetches and caches airline configuration from the web API.
/// Used by ScoringEngine, FlightManager, and other services to use dynamic settings.
/// </summary>
public sealed class AirlineConfigService
{
    private static readonly HttpClient _httpClient = new();
    private static AirlineSettings? _cachedSettings;
    private static DateTime _lastFetch = DateTime.MinValue;
    private static readonly TimeSpan CacheExpiry = TimeSpan.FromMinutes(5);
    private static readonly object _lock = new();

    /// <summary>
    /// Get current airline settings (cached for 5 minutes).
    /// </summary>
    public static async Task<AirlineSettings> GetSettingsAsync()
    {
        lock (_lock)
        {
            if (_cachedSettings != null && DateTime.UtcNow - _lastFetch < CacheExpiry)
                return _cachedSettings;
        }

        try
        {
            var apiUrl = AppConfig.Current.ApiBaseUrl.Replace("/api/acars/", "/api/config");
            var response = await _httpClient.GetAsync(apiUrl);
            response.EnsureSuccessStatusCode();

            var json = await response.Content.ReadAsStringAsync();
            var result = JsonSerializer.Deserialize<ConfigResponse>(json);

            if (result?.Success == true && result.Config != null)
            {
                lock (_lock)
                {
                    _cachedSettings = result.Config;
                    _lastFetch = DateTime.UtcNow;
                }
                return result.Config;
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[AirlineConfig] Failed to fetch settings: {ex.Message}");
        }

        // Return defaults if API fails
        lock (_lock)
        {
            _cachedSettings ??= AirlineSettings.Defaults;
            return _cachedSettings;
        }
    }

    /// <summary>
    /// Force refresh settings from API.
    /// </summary>
    public static async Task RefreshAsync()
    {
        lock (_lock)
        {
            _lastFetch = DateTime.MinValue;
        }
        await GetSettingsAsync();
    }

    private class ConfigResponse
    {
        [JsonPropertyName("success")]
        public bool Success { get; set; }

        [JsonPropertyName("config")]
        public AirlineSettings? Config { get; set; }
    }
}

/// <summary>
/// Airline configuration settings synced from web API.
/// </summary>
public sealed class AirlineSettings
{
    // Economy & Revenue
    [JsonPropertyName("fuel_tax_percent")]
    public double FuelTaxPercent { get; set; } = 10;

    [JsonPropertyName("penalty_multiplier")]
    public double PenaltyMultiplier { get; set; } = 5;

    [JsonPropertyName("ticket_price_per_nm")]
    public double TicketPricePerNm { get; set; } = 0.8;

    [JsonPropertyName("cargo_price_per_lb_nm")]
    public double CargoPricePerLbNm { get; set; } = 0.002;

    [JsonPropertyName("fuel_price_per_lb")]
    public double FuelPricePerLb { get; set; } = 0.65;

    [JsonPropertyName("base_landing_fee")]
    public double BaseLandingFee { get; set; } = 250;

    [JsonPropertyName("pilot_pay_rate")]
    public double PilotPayRate { get; set; } = 2500;

    // Flight Operations & Damage
    [JsonPropertyName("hard_landing_threshold")]
    public double HardLandingThreshold { get; set; } = -400;

    [JsonPropertyName("severe_damage_threshold")]
    public double SevereDamageThreshold { get; set; } = -700;

    [JsonPropertyName("overspeed_damage_per_10s")]
    public double OverspeedDamagePer10s { get; set; } = 0.5;

    [JsonPropertyName("gforce_high_threshold")]
    public double GForceHighThreshold { get; set; } = 2.5;

    [JsonPropertyName("gforce_low_threshold")]
    public double GForceLowThreshold { get; set; } = -1.0;

    [JsonPropertyName("grounded_health_threshold")]
    public double GroundedHealthThreshold { get; set; } = 20;

    [JsonPropertyName("store_to_airline_percent")]
    public double StoreToAirlinePercent { get; set; } = 100;

    // Pilot Salaries
    [JsonPropertyName("salary_enabled")]
    public int SalaryEnabled { get; set; } = 1;

    [JsonPropertyName("salary_cadet")]
    public double SalaryCadet { get; set; } = 500;

    [JsonPropertyName("salary_second_officer")]
    public double SalarySecondOfficer { get; set; } = 1000;

    [JsonPropertyName("salary_first_officer")]
    public double SalaryFirstOfficer { get; set; } = 1500;

    [JsonPropertyName("salary_senior_first_officer")]
    public double SalarySeniorFirstOfficer { get; set; } = 2000;

    [JsonPropertyName("salary_captain")]
    public double SalaryCaptain { get; set; } = 3000;

    [JsonPropertyName("salary_senior_captain")]
    public double SalarySeniorCaptain { get; set; } = 4000;

    [JsonPropertyName("salary_check_airman")]
    public double SalaryCheckAirman { get; set; } = 5000;

    // Credit System
    [JsonPropertyName("cr_base_flight")]
    public double CrBaseFlight { get; set; } = 100;

    [JsonPropertyName("cr_greaser_bonus")]
    public double CrGreaserBonus { get; set; } = 50;

    [JsonPropertyName("cr_firm_bonus")]
    public double CrFirmBonus { get; set; } = 25;

    [JsonPropertyName("cr_hard_landing_penalty")]
    public double CrHardLandingPenalty { get; set; } = -50;

    [JsonPropertyName("cr_on_time_bonus")]
    public double CrOnTimeBonus { get; set; } = 20;

    [JsonPropertyName("cr_fuel_efficiency_bonus")]
    public double CrFuelEfficiencyBonus { get; set; } = 30;

    [JsonPropertyName("cr_first_flight_multiplier")]
    public double CrFirstFlightMultiplier { get; set; } = 1.2;

    [JsonPropertyName("cr_hub_to_hub_bonus")]
    public double CrHubToHubBonus { get; set; } = 50;

    [JsonPropertyName("cr_event_multiplier")]
    public double CrEventMultiplier { get; set; } = 2.0;

    [JsonPropertyName("cr_long_haul_4h")]
    public double CrLongHaul4h { get; set; } = 100;

    [JsonPropertyName("cr_long_haul_8h")]
    public double CrLongHaul8h { get; set; } = 250;

    [JsonPropertyName("cr_new_route_bonus")]
    public double CrNewRouteBonus { get; set; } = 50;

    [JsonPropertyName("cr_taxi_speed_penalty")]
    public double CrTaxiSpeedPenalty { get; set; } = -10;

    [JsonPropertyName("cr_light_violation_penalty")]
    public double CrLightViolationPenalty { get; set; } = -15;

    [JsonPropertyName("cr_overspeed_penalty")]
    public double CrOverspeedPenalty { get; set; } = -50;

    [JsonPropertyName("cr_taxi_speed_limit")]
    public double CrTaxiSpeedLimit { get; set; } = 30;

    [JsonPropertyName("cr_group_flight_participation")]
    public double CrGroupFlightParticipation { get; set; } = 50;

    // Fleet Operations
    [JsonPropertyName("location_based_fleet")]
    public int LocationBasedFleet { get; set; } = 1;

    /// <summary>
    /// Default settings (fallback if API is unavailable).
    /// </summary>
    public static AirlineSettings Defaults => new();
}
