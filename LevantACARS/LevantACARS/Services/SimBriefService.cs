using System.Net.Http;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.Extensions.Logging;

namespace LevantACARS.Services;

/// <summary>
/// Fetches flight plan data from SimBrief API.
/// </summary>
public sealed class SimBriefService
{
    private readonly ILogger<SimBriefService> _logger;
    private readonly HttpClient _http;

    public SimBriefService(ILogger<SimBriefService> logger)
    {
        _logger = logger;
        _http = new HttpClient
        {
            Timeout = TimeSpan.FromSeconds(15)
        };
    }

    /// <summary>
    /// Fetch flight plan from SimBrief using pilot's username or user ID.
    /// </summary>
    public async Task<SimBriefFlightPlan?> FetchFlightPlanAsync(string usernameOrId)
    {
        try
        {
            var apiUrl = $"https://www.simbrief.com/api/xml.fetcher.php?username={usernameOrId}&json=1";
            _logger.LogInformation("[SimBrief] Fetching flight plan for {User}", usernameOrId);

            var response = await _http.GetAsync(apiUrl);
            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning("[SimBrief] Failed to fetch flight plan: HTTP {Status}", response.StatusCode);
                return null;
            }

            var json = await response.Content.ReadAsStringAsync();
            var flightPlan = JsonSerializer.Deserialize<SimBriefFlightPlan>(json, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            if (flightPlan != null)
            {
                _logger.LogInformation("[SimBrief] Successfully fetched flight plan: {Origin} → {Dest}", 
                    flightPlan.Origin?.IcaoCode, flightPlan.Destination?.IcaoCode);
            }

            return flightPlan;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[SimBrief] Failed to fetch flight plan");
            return null;
        }
    }
}

/// <summary>
/// SimBrief flight plan data model.
/// </summary>
public sealed class SimBriefFlightPlan
{
    [JsonPropertyName("origin")]
    public SimBriefAirport? Origin { get; set; }

    [JsonPropertyName("destination")]
    public SimBriefAirport? Destination { get; set; }

    [JsonPropertyName("alternate")]
    public SimBriefAirport? Alternate { get; set; }

    [JsonPropertyName("general")]
    public SimBriefGeneral? General { get; set; }

    [JsonPropertyName("fuel")]
    public SimBriefFuel? Fuel { get; set; }

    [JsonPropertyName("weights")]
    public SimBriefWeights? Weights { get; set; }

    [JsonPropertyName("params")]
    public SimBriefParams? Params { get; set; }

    [JsonPropertyName("navlog")]
    public SimBriefNavlog? Navlog { get; set; }
}

public sealed class SimBriefAirport
{
    [JsonPropertyName("icao_code")]
    public string IcaoCode { get; set; } = "";

    [JsonPropertyName("name")]
    public string Name { get; set; } = "";

    [JsonPropertyName("plan_rwy")]
    public string PlanRunway { get; set; } = "";

    [JsonPropertyName("pos_lat")]
    public string Latitude { get; set; } = "";

    [JsonPropertyName("pos_long")]
    public string Longitude { get; set; } = "";
}

public sealed class SimBriefGeneral
{
    [JsonPropertyName("flight_number")]
    public string FlightNumber { get; set; } = "";

    [JsonPropertyName("icao_airline")]
    public string IcaoAirline { get; set; } = "";

    [JsonPropertyName("route")]
    public string Route { get; set; } = "";

    [JsonPropertyName("cruise_altitude")]
    public string CruiseAltitude { get; set; } = "";

    [JsonPropertyName("avg_wind_dir")]
    public string AvgWindDir { get; set; } = "";

    [JsonPropertyName("avg_wind_spd")]
    public string AvgWindSpeed { get; set; } = "";

    [JsonPropertyName("cost_index")]
    public string CostIndex { get; set; } = "";

    [JsonPropertyName("est_time_enroute")]
    public string EstTimeEnroute { get; set; } = "";
}

public sealed class SimBriefFuel
{
    [JsonPropertyName("plan_ramp")]
    public string PlanRamp { get; set; } = "";

    [JsonPropertyName("plan_takeoff")]
    public string PlanTakeoff { get; set; } = "";

    [JsonPropertyName("plan_landing")]
    public string PlanLanding { get; set; } = "";

    [JsonPropertyName("enroute_burn")]
    public string EnrouteBurn { get; set; } = "";
}

public sealed class SimBriefWeights
{
    [JsonPropertyName("est_zfw")]
    public string EstZfw { get; set; } = "";

    [JsonPropertyName("est_tow")]
    public string EstTow { get; set; } = "";

    [JsonPropertyName("est_ldw")]
    public string EstLdw { get; set; } = "";

    [JsonPropertyName("pax_count")]
    public string PaxCount { get; set; } = "";

    [JsonPropertyName("cargo")]
    public string Cargo { get; set; } = "";
}

public sealed class SimBriefParams
{
    [JsonPropertyName("units")]
    public string Units { get; set; } = "";
}

public sealed class SimBriefNavlog
{
    [JsonPropertyName("fix")]
    public List<SimBriefFix>? Fixes { get; set; }
}

public sealed class SimBriefFix
{
    [JsonPropertyName("ident")]
    public string Ident { get; set; } = "";

    [JsonPropertyName("type")]
    public string Type { get; set; } = "";

    [JsonPropertyName("pos_lat")]
    public string Latitude { get; set; } = "";

    [JsonPropertyName("pos_long")]
    public string Longitude { get; set; } = "";
}
