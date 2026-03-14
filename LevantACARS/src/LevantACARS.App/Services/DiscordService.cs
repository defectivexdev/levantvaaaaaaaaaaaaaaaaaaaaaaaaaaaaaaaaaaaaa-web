using DiscordRPC;
using Microsoft.Extensions.Logging;
using LevantACARS.Models;

namespace LevantACARS.Services;

/// <summary>
/// Manages Discord Rich Presence for Levant VA ACARS.
/// Shows flight status, phase, and route in the pilot's Discord profile.
/// </summary>
public sealed class DiscordService : IDisposable
{
    private readonly ILogger<DiscordService> _logger;
    private DiscordRpcClient? _client;
    private bool _initialized;
    private Timestamps? _flightStartTimestamp; // Track flight start time for elapsed duration

    public DiscordService(ILogger<DiscordService> logger)
    {
        _logger = logger;
    }

    /// <summary>Initialize the Discord RPC connection.</summary>
    public void Initialize()
    {
        var clientId = AppConfig.Current.DiscordClientId;
        if (string.IsNullOrEmpty(clientId))
        {
            _logger.LogWarning("[Discord] DISCORD_CLIENT_ID not set in .env — Rich Presence disabled");
            return;
        }

        try
        {
            _client = new DiscordRpcClient(clientId)
            {
                Logger = new DiscordRPC.Logging.ConsoleLogger() { Level = DiscordRPC.Logging.LogLevel.Warning }
            };

            _client.OnReady += (_, e) =>
                _logger.LogInformation("[Discord] Connected as {User}", e.User.Username);

            _client.OnError += (_, e) =>
                _logger.LogWarning("[Discord] Error: {Message}", e.Message);

            _client.Initialize();
            _initialized = true;

            SetIdle();
            _logger.LogInformation("[Discord] Rich Presence initialized");
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "[Discord] Failed to initialize Rich Presence");
        }
    }

    /// <summary>Set presence to idle (no active flight).</summary>
    public void SetIdle()
    {
        if (!_initialized || _client == null) return;

        _flightStartTimestamp = null; // Clear flight timer

        _client.SetPresence(new RichPresence
        {
            Details = "Levant Virtual Airlines",
            State = "ACARS Online — Idle",
            Assets = new Assets
            {
                LargeImageKey = "logo_large",
                LargeImageText = "Levant Virtual Airlines",
                SmallImageKey = "status_online",
                SmallImageText = "Connected"
            },
            Timestamps = Timestamps.Now
        });
    }

    /// <summary>Update presence with active flight data.</summary>
    public void SetFlightActive(
        string flightNumber, 
        string departure, 
        string arrival, 
        FlightPhase phase,
        string departureFormatted = "",
        string arrivalFormatted = "")
    {
        if (!_initialized || _client == null) return;

        _flightStartTimestamp = Timestamps.Now; // Start flight timer

        // Use formatted names if available, otherwise fall back to ICAO
        var depDisplay = !string.IsNullOrEmpty(departureFormatted) ? departureFormatted : departure;
        var arrDisplay = !string.IsNullOrEmpty(arrivalFormatted) ? arrivalFormatted : arrival;

        string stateText;
        if (phase is FlightPhase.Preflight or FlightPhase.Boarding or FlightPhase.Pushback)
        {
            stateText = $"Currently at {depDisplay}";
        }
        else if (phase is FlightPhase.Arrived or FlightPhase.Shutdown or FlightPhase.TaxiIn)
        {
            stateText = $"Currently at {arrDisplay}";
        }
        else
        {
            stateText = $"Phase: {phase}";
        }

        _client.SetPresence(new RichPresence
        {
            Details = $"{flightNumber} — {departure} → {arrival}",
            State = stateText,
            Assets = new Assets
            {
                LargeImageKey = "logo_large",
                LargeImageText = "Levant Virtual Airlines",
                SmallImageKey = "status_flying",
                SmallImageText = $"Flying {flightNumber}"
            },
            Timestamps = _flightStartTimestamp
        });
    }

    /// <summary>Update just the flight phase.</summary>
    public void UpdatePhase(FlightPhase phase)
    {
        if (!_initialized || _client == null) return;

        var current = _client.CurrentPresence;
        if (current != null)
        {
            // If we only have the phase update, we can't easily rebuild the full state text with airport ICAO
            // unless we parse it from Details or store it.
            // But this method is usually quickly followed by UpdateFlightDetails which has all info.
            // Just let it be or extract ICAO from Details.
            var details = current.Details ?? "";
            string stateText = $"Phase: {phase}";

            if (details.Contains(" — ") && details.Contains(" → "))
            {
                var parts = details.Split(" — ")[1].Split(" → ");
                var departure = parts[0].Trim();
                var arrival = parts[1].Trim();

                if (phase is FlightPhase.Preflight or FlightPhase.Boarding or FlightPhase.Pushback)
                {
                    stateText = $"Currently at {departure}";
                }
                else if (phase is FlightPhase.Arrived or FlightPhase.Shutdown or FlightPhase.TaxiIn)
                {
                    stateText = $"Currently at {arrival}";
                }
            }

            current.State = stateText;
            current.Timestamps = _flightStartTimestamp; // Preserve flight start time
            _client.SetPresence(current);
        }
    }

    /// <summary>Show flight completed state.</summary>
    public void SetFlightCompleted(string flightNumber, int score)
    {
        if (!_initialized || _client == null) return;

        _client.SetPresence(new RichPresence
        {
            Details = $"Completed {flightNumber}",
            State = $"Score: {score}%",
            Assets = new Assets
            {
                LargeImageKey = "logo_large",
                LargeImageText = "Levant Virtual Airlines",
                SmallImageKey = "status_online",
                SmallImageText = "Flight Complete"
            },
            Timestamps = _flightStartTimestamp // Show total flight duration
        });

        _flightStartTimestamp = null; // Clear after showing completion
    }

    /// <summary>Update presence with live flight details (altitude, speed, phase, aircraft, location).</summary>
    public void UpdateFlightDetails(
        string flightNumber, 
        string departure, 
        string arrival, 
        FlightPhase phase, 
        int altitude, 
        int groundSpeed,
        string aircraftType = "",
        int distanceRemaining = 0,
        string networkStatus = "",
        string locationContext = "",
        string departureFormatted = "",
        string arrivalFormatted = "")
    {
        if (!_initialized || _client == null) return;

        // Initialize timestamp if not set (shouldn't happen, but safety check)
        if (_flightStartTimestamp == null)
        {
            _flightStartTimestamp = Timestamps.Now;
        }

        // Use formatted names if available, otherwise fall back to ICAO
        var depDisplay = !string.IsNullOrEmpty(departureFormatted) ? departureFormatted : departure;
        var arrDisplay = !string.IsNullOrEmpty(arrivalFormatted) ? arrivalFormatted : arrival;

        string stateText;
        if (phase is FlightPhase.Preflight or FlightPhase.Boarding or FlightPhase.Pushback)
        {
            stateText = $"Currently at {depDisplay}";
        }
        else if (phase is FlightPhase.Arrived or FlightPhase.Shutdown or FlightPhase.TaxiIn)
        {
            stateText = $"Currently at {arrDisplay}";
        }
        else
        {
            string altText = altitude >= 18000 ? $"FL{altitude / 100:D3}" : $"{altitude:N0} ft";
            
            // Build state text with optional components
            var stateParts = new List<string> { $"{phase}", altText, $"{groundSpeed}kt" };
            
            // Add distance if available
            if (distanceRemaining > 0)
            {
                stateParts.Add($"{distanceRemaining}nm to go");
            }
            
            // Add location context if available (e.g., "Dubai, UAE" or "Mediterranean Sea")
            if (!string.IsNullOrEmpty(locationContext))
            {
                stateParts.Add($"over {locationContext}");
            }
            
            // Add network badge if flying on network
            if (!string.IsNullOrEmpty(networkStatus))
            {
                stateParts.Add($"🌐 {networkStatus}");
            }
            
            stateText = string.Join(" · ", stateParts);
        }

        // Build details with aircraft type if available
        string details = string.IsNullOrEmpty(aircraftType)
            ? $"{flightNumber} — {departure} → {arrival}"
            : $"{flightNumber} — {departure} → {arrival} • {aircraftType}";

        _client.SetPresence(new RichPresence
        {
            Details = details,
            State = stateText,
            Assets = new Assets
            {
                LargeImageKey = "logo_large",
                LargeImageText = "Levant Virtual Airlines",
                SmallImageKey = "status_flying",
                SmallImageText = $"Flying {flightNumber}"
            },
            Timestamps = _flightStartTimestamp // Always use the stored timestamp
        });
    }

    /// <summary>Set presence when sim is connected but no flight active.</summary>
    public void SetConnected()
    {
        if (!_initialized || _client == null) return;

        _client.SetPresence(new RichPresence
        {
            Details = "Levant Virtual Airlines",
            State = "ACARS Online — Connected to Sim",
            Assets = new Assets
            {
                LargeImageKey = "logo_large",
                LargeImageText = "Levant Virtual Airlines",
                SmallImageKey = "status_online",
                SmallImageText = "Connected"
            },
            Timestamps = Timestamps.Now
        });
    }

    /// <summary>Set presence when sim disconnects.</summary>
    public void SetDisconnected()
    {
        if (!_initialized || _client == null) return;

        _client.SetPresence(new RichPresence
        {
            Details = "Levant Virtual Airlines",
            State = "ACARS Online — No Simulator",
            Assets = new Assets
            {
                LargeImageKey = "logo_large",
                LargeImageText = "Levant Virtual Airlines",
                SmallImageKey = "status_online",
                SmallImageText = "Disconnected"
            },
            Timestamps = Timestamps.Now
        });
    }

    public void Dispose()
    {
        if (_client != null)
        {
            _client.ClearPresence();
            _client.Dispose();
            _client = null;
            _initialized = false;
            _flightStartTimestamp = null;
            _logger.LogInformation("[Discord] Rich Presence disposed");
        }
    }
}
