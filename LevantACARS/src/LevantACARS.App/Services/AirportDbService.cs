using System.Collections.Concurrent;
using System.Net.Http;
using System.Text.Json;
using Microsoft.Extensions.Logging;

namespace LevantACARS.Services;

/// <summary>
/// Fetches and caches airport information from AirportDB.io API.
/// Provides rich airport details (name, city, country) for Discord presence and UI.
/// </summary>
public sealed class AirportDbService
{
    private readonly ILogger<AirportDbService> _logger;
    private readonly HttpClient _http;
    private readonly ConcurrentDictionary<string, AirportInfo> _cache = new();

    public AirportDbService(ILogger<AirportDbService> logger)
    {
        _logger = logger;
        _http = new HttpClient
        {
            Timeout = TimeSpan.FromSeconds(10)
        };
    }

    /// <summary>
    /// Get airport information by ICAO code. Returns cached data if available.
    /// </summary>
    public async Task<AirportInfo?> GetAirportInfoAsync(string icao)
    {
        if (string.IsNullOrWhiteSpace(icao)) return null;

        var upper = icao.ToUpperInvariant();

        // Return cached if available
        if (_cache.TryGetValue(upper, out var cached))
        {
            return cached;
        }

        try
        {
            var token = AppConfig.Current.AirportDbApiToken;
            if (string.IsNullOrEmpty(token))
            {
                _logger.LogWarning("[AirportDB] API token not configured");
                return null;
            }

            var apiUrl = $"https://airportdb.io/api/v1/airport/{upper}?apiToken={token}";
            var response = await _http.GetAsync(apiUrl);

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning("[AirportDB] Failed to fetch {Icao}: HTTP {Status}", upper, response.StatusCode);
                return null;
            }

            var json = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(json);
            var root = doc.RootElement;

            var info = new AirportInfo
            {
                Icao = upper,
                Name = root.GetProperty("name").GetString() ?? upper,
                City = root.TryGetProperty("municipality", out var city) ? city.GetString() : null,
                Country = root.TryGetProperty("iso_country", out var country) ? country.GetString() : null,
                CountryName = root.TryGetProperty("country_name", out var countryName) ? countryName.GetString() : null,
                Latitude = root.TryGetProperty("latitude_deg", out var lat) ? lat.GetDouble() : 0,
                Longitude = root.TryGetProperty("longitude_deg", out var lon) ? lon.GetDouble() : 0
            };

            // Cache the result
            _cache[upper] = info;
            _logger.LogDebug("[AirportDB] Cached {Icao}: {Name}, {City}, {Country}", upper, info.Name, info.City, info.CountryName);

            return info;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "[AirportDB] Failed to fetch airport info for {Icao}", upper);
            return null;
        }
    }

    /// <summary>
    /// Get formatted location string for Discord presence (e.g., "Dubai Intl (OMDB), UAE").
    /// </summary>
    public async Task<string> GetFormattedLocationAsync(string icao)
    {
        var info = await GetAirportInfoAsync(icao);
        if (info == null) return icao;

        return info.GetFormattedLocation();
    }

    /// <summary>
    /// Preload airport info for common airports (departure/arrival).
    /// </summary>
    public async Task PreloadAirportsAsync(params string[] icaoCodes)
    {
        var tasks = icaoCodes
            .Where(icao => !string.IsNullOrWhiteSpace(icao))
            .Select(icao => GetAirportInfoAsync(icao));

        await Task.WhenAll(tasks);
    }

    /// <summary>
    /// Clear the cache (useful for memory management or testing).
    /// </summary>
    public void ClearCache()
    {
        _cache.Clear();
        _logger.LogInformation("[AirportDB] Cache cleared");
    }
}

/// <summary>
/// Airport information from AirportDB.io.
/// </summary>
public sealed class AirportInfo
{
    public string Icao { get; set; } = "";
    public string Name { get; set; } = "";
    public string? City { get; set; }
    public string? Country { get; set; }
    public string? CountryName { get; set; }
    public double Latitude { get; set; }
    public double Longitude { get; set; }

    /// <summary>
    /// Get formatted location string for Discord presence.
    /// Examples:
    /// - "Dubai Intl (OMDB), UAE"
    /// - "London Heathrow (EGLL), United Kingdom"
    /// - "JFK Intl (KJFK), United States"
    /// </summary>
    public string GetFormattedLocation()
    {
        // Shorten common airport name patterns
        var shortName = Name
            .Replace(" International Airport", " Intl")
            .Replace(" Airport", "")
            .Replace(" Regional", "");

        // Build location string
        var parts = new List<string> { $"{shortName} ({Icao})" };

        if (!string.IsNullOrEmpty(CountryName))
        {
            parts.Add(CountryName);
        }
        else if (!string.IsNullOrEmpty(Country))
        {
            parts.Add(Country);
        }

        return string.Join(", ", parts);
    }

    /// <summary>
    /// Get city/country context for "over" text in Discord presence.
    /// Examples: "Dubai, UAE" or "London, UK"
    /// </summary>
    public string GetCityContext()
    {
        var parts = new List<string>();

        if (!string.IsNullOrEmpty(City))
        {
            parts.Add(City);
        }

        if (!string.IsNullOrEmpty(Country))
        {
            parts.Add(Country);
        }
        else if (!string.IsNullOrEmpty(CountryName))
        {
            parts.Add(CountryName);
        }

        return parts.Count > 0 ? string.Join(", ", parts) : Icao;
    }
}
