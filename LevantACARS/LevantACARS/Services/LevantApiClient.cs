    using System.Collections.Concurrent;
using System.IO;
using System.Net.Http;
using System.Net.Http.Json;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Threading;
using Microsoft.Extensions.Logging;
using LevantACARS.Models;

namespace LevantACARS.Services;

/// <summary>
    /// Typed HttpClient for the Levant VA REST API at levant-va.com/api/acars.
    /// Injected via DI with automatic retry/resilience from Microsoft.Extensions.Http.Resilience.
    /// Replaces the Electron axios-based apiService.ts.
    /// </summary>
    public sealed class LevantApiClient
    {
        private readonly HttpClient _http;
        private readonly ILogger<LevantApiClient> _logger;
        private bool _restApiConnected;
        private long _lastRestSuccess;

        // Bounded backlog of position updates to improve reliability across short outages
        private readonly ConcurrentQueue<PositionUpdate> _positionBacklog = new();
        private const int MaxPositionBacklog = 50;

        private static readonly JsonSerializerOptions JsonOpts = new()
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            WriteIndented = false,
        };

        public bool IsConnected => _restApiConnected;

        public int PendingPositionBacklogCount => _positionBacklog.Count;\n\n        private DateTimeOffset _lastPositionUpdate = DateTimeOffset.MinValue;\n        private readonly TimeSpan _minPositionUpdateInterval = TimeSpan.FromSeconds(15);

        public LevantApiClient(HttpClient http, ILogger<LevantApiClient> logger)
        {
            _http = http;
            _logger = logger;
        }

        /// <summary>Probe the API on startup to verify reachability.</summary>
        public async Task BootstrapAsync()
        {
            try
            {
                var probe = await _http.PostAsJsonAsync("ping", new { action = "ping" }, JsonOpts);
                _restApiConnected = true;
                _lastRestSuccess = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
                _logger.LogInformation("[DataLink] REST API reachable");
            }
            catch (HttpRequestException ex)
            {
                // Server responded (even with error) = reachable
                _restApiConnected = true;
                _lastRestSuccess = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
                _logger.LogInformation("[DataLink] REST API reachable (server responded: {Msg})", ex.Message);
            }
            catch (Exception ex)
            {
                _restApiConnected = false;
                _logger.LogWarning("[DataLink] REST API not reachable on startup: {Msg}", ex.Message);
            }
        }

        /// <summary>
        /// Send a live position update to the tracking API.
        /// On failure, the payload is queued in a small in-memory backlog and retried on subsequent calls.
        /// </summary>
        public async Task<bool> SendPositionUpdateAsync(PositionUpdate payload, CancellationToken cancellationToken = default)
        {
            // First, opportunistically flush any pending updates from previous failures
            await FlushPendingPositionUpdatesAsync(cancellationToken).ConfigureAwait(false);

            var success = await TrySendPositionUpdateOnceAsync(payload, cancellationToken).ConfigureAwait(false);
            if (!success)
            {
                EnqueuePendingPosition(payload);
            }

            return success;
        }

        private void EnqueuePendingPosition(PositionUpdate payload)
        {
            // Ensure backlog stays bounded
            while (_positionBacklog.Count >= MaxPositionBacklog && _positionBacklog.TryDequeue(out _))
            {
            }

            _positionBacklog.Enqueue(payload);
        }

        private async Task FlushPendingPositionUpdatesAsync(CancellationToken cancellationToken)
        {
            if (_positionBacklog.IsEmpty)
                return;

            // Try to send queued items in FIFO order; stop on first failure and requeue it
            var toRetry = new List<PositionUpdate>();

            while (_positionBacklog.TryDequeue(out var pending))
            {
                var ok = await TrySendPositionUpdateOnceAsync(pending, cancellationToken).ConfigureAwait(false);
                if (!ok)
                {
                    toRetry.Add(pending);
                    break;
                }
            }

            foreach (var p in toRetry)
            {
                _positionBacklog.Enqueue(p);
            }
        }

        private async Task<bool> TrySendPositionUpdateOnceAsync(PositionUpdate payload, CancellationToken cancellationToken)
        {
            try
            {
                var response = await _http.PostAsJsonAsync("position", payload, JsonOpts, cancellationToken).ConfigureAwait(false);
                if (!response.IsSuccessStatusCode)
                {
                    var body = await response.Content.ReadAsStringAsync(cancellationToken).ConfigureAwait(false);
                    _logger.LogWarning("[API] Position update {Status}: {Body} (url={Url})",
                        (int)response.StatusCode, body, _http.BaseAddress);
                }
                response.EnsureSuccessStatusCode();
                _restApiConnected = true;
                _lastRestSuccess = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
                return true;
            }
            catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
            {
                // Let callers observe cancellation explicitly
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError("[API] Position update failed: {Msg} (url={Url})", ex.Message, _http.BaseAddress);
                _restApiConnected = false;
                return false;
            }
        }

        /// <summary>Submit a completed PIREP to the VA backend.</summary>
        public async Task<bool> SubmitPirepAsync(PirepData pirep, CancellationToken cancellationToken = default)
        {
            try
            {
                // HMAC-SHA256 signing required by server
                var timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
                var appKey = AppConfig.Current.AppKey;
                var dataString = $"{pirep.PilotId}:{pirep.LandingRate}:{timestamp}";
                // Always sign — fall back to the known default key if config is empty
                var signingKey = !string.IsNullOrEmpty(appKey) ? appKey : "LEVANT_HMAC_KEYGENDONOTSHARE";
                string signature;
                using (var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(signingKey)))
                {
                    var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(dataString));
                    signature = Convert.ToHexString(hash).ToLowerInvariant();
                }

                var payload = new
                {
                    action = "pirep",
                    pirep.PilotId,
                    pirep.FlightNumber,
                    pirep.Callsign,
                    pirep.DepartureIcao,
                    pirep.ArrivalIcao,
                    pirep.Route,
                    pirep.AircraftType,
                    pirep.AircraftRegistration,
                    pirep.LandingRate,
                    pirep.GForce,
                    pirep.FuelUsed,
                    pirep.DistanceNm,
                    pirep.FlightTimeMinutes,
                    pirep.Score,
                    pirep.LandingGradeStr,
                    pirep.XpEarned,
                    pirep.ComfortScore,
                    pirep.Pax,
                    pirep.Cargo,
                    pirep.Status,
                    pirep.AcarsVersion,
                    pirep.ExceedanceCount,
                    timestamp,
                    signature,
                    pirep.FlightSessionId,
                };

                var response = await _http.PostAsJsonAsync("pirep", payload, JsonOpts, cancellationToken).ConfigureAwait(false);
                if (!response.IsSuccessStatusCode)
                {
                    var body = await response.Content.ReadAsStringAsync(cancellationToken).ConfigureAwait(false);
                    _logger.LogError("[API] PIREP rejected: {Status} — {Body}", (int)response.StatusCode, body);
                }
                response.EnsureSuccessStatusCode();
                _restApiConnected = true;
                _lastRestSuccess = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
                _logger.LogInformation("[API] PIREP submitted: {Flight}, Landing: {Rate}fpm", pirep.FlightNumber, pirep.LandingRate);
                return true;
            }
            catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
            {
                // Let callers cancel explicit PIREP submissions on shutdown
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError("[API] PIREP submission failed: {Msg}", ex.Message);
                _restApiConnected = false;
                return false;
            }
        }

        /// <summary>Send a heartbeat ping to keep the data link alive.</summary>
        public async Task PingAsync(string pilotId, string callsign = "")
        {
            try
            {
                var payload = new { pilotId, callsign, timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds() };
                var response = await _http.PostAsJsonAsync("ping", payload, JsonOpts);
                _restApiConnected = true;
                _lastRestSuccess = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
            }
            catch (Exception ex)
            {
                _restApiConnected = false;
                _logger.LogWarning("[Heartbeat] Ping failed: {Msg}", ex.Message);
            }
        }

        /// <summary>Notify flight start to the API.</summary>
        public async Task<bool> NotifyFlightStartAsync(
            string pilotId,
            string flightNumber,
            string callsign,
            string departureIcao,
            string arrivalIcao,
            string aircraftType,
            string? flightSessionId = null,
            CancellationToken cancellationToken = default)
        {
            try
            {
                var payload = new
                {
                    action = "start",
                    pilotId,
                    flightNumber,
                    callsign,
                    departureIcao,
                    arrivalIcao,
                    aircraftType,
                    flightSessionId,
                };

                var response = await _http.PostAsJsonAsync("start", payload, JsonOpts, cancellationToken).ConfigureAwait(false);
                if (!response.IsSuccessStatusCode)
                {
                    var body = await response.Content.ReadAsStringAsync(cancellationToken).ConfigureAwait(false);
                    _logger.LogError("[API] Flight start rejected: {Status} — {Body}", (int)response.StatusCode, body);
                }
                response.EnsureSuccessStatusCode();
                _restApiConnected = true;
                _lastRestSuccess = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
                _logger.LogInformation("[API] Flight started: {Cs} ({Dep}→{Arr})", callsign, departureIcao, arrivalIcao);
                return true;
            }
            catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
            {
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError("[API] Flight start notification failed: {Msg} (url={Url})", ex.Message, _http.BaseAddress);
                _restApiConnected = false;
                return false;
            }
        }

        /// <summary>Notify flight end / cancellation to the API.</summary>
        public async Task NotifyFlightEndAsync(
            string pilotId,
            string status = "ended",
            string callsign = "",
            string? flightSessionId = null,
            CancellationToken cancellationToken = default)
        {
            try
            {
                var payload = new { action = "end", pilotId, callsign, status, flightSessionId };
                await _http.PostAsJsonAsync("end", payload, JsonOpts, cancellationToken).ConfigureAwait(false);
            }
            catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
            {
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogWarning("[API] Flight end notification failed: {Msg}", ex.Message);
            }
        }

        /// <summary>Cancel the pilot's active bid.</summary>
        public async Task<bool> CancelBidAsync(string pilotId)
        {
            try
            {
                var payload = new { action = "cancel-bid", pilotId };
                var response = await _http.PostAsJsonAsync("bid", payload, JsonOpts);
                return response.IsSuccessStatusCode;
            }
            catch (Exception ex)
            {
                _logger.LogWarning("[API] CancelBid failed: {Msg}", ex.Message);
                return false;
            }
        }

        /// <summary>Fetch the pilot's active bid (flight plan) from the API.</summary>
        public async Task<JsonElement?> FetchBidAsync(string pilotId)
        {
            var logsDir = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "Logs");
            Directory.CreateDirectory(logsDir); // Ensure Logs folder exists
            
            var logFile = Path.Combine(logsDir, "bid-fetch-debug.log");
            
            // Rotate log if it exceeds 10MB
            if (File.Exists(logFile) && new FileInfo(logFile).Length > 10 * 1024 * 1024)
            {
                var archiveName = $"bid-fetch-debug.log.{DateTime.Now:yyyy-MM-dd-HHmmss}";
                File.Move(logFile, Path.Combine(logsDir, archiveName));
            }
            
            var timestamp = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss");
            
            try
            {
                File.AppendAllText(logFile, $"\n[{timestamp}] ========== BID FETCH START ==========\n");
                File.AppendAllText(logFile, $"[{timestamp}] Pilot ID: {pilotId}\n");
                
                var payload = new { action = "bid", pilotId };
                File.AppendAllText(logFile, $"[{timestamp}] Payload: {JsonSerializer.Serialize(payload)}\n");
                
                var response = await _http.PostAsJsonAsync("bid", payload, JsonOpts);
                File.AppendAllText(logFile, $"[{timestamp}] HTTP Status: {(int)response.StatusCode} {response.StatusCode}\n");

                var json = await response.Content.ReadAsStringAsync();
                File.AppendAllText(logFile, $"[{timestamp}] Response Length: {json.Length} bytes\n");
                File.AppendAllText(logFile, $"[{timestamp}] Response Body: {json}\n");

                if (!response.IsSuccessStatusCode)
                {
                    _logger.LogWarning("[API] FetchBid HTTP error {Status} for pilot {Pilot}: {Body}",
                        (int)response.StatusCode, pilotId, json.Length > 300 ? json[..300] : json);
                    File.AppendAllText(logFile, $"[{timestamp}] ERROR: HTTP {response.StatusCode}\n");
                    File.AppendAllText(logFile, $"[{timestamp}] ========== BID FETCH END (FAILED) ==========\n\n");
                    return null;
                }

                using var doc = JsonDocument.Parse(json);
                var root = doc.RootElement;

                if (root.TryGetProperty("bid", out var bid) && bid.ValueKind == JsonValueKind.Object)
                {
                    File.AppendAllText(logFile, $"[{timestamp}] SUCCESS: Bid found\n");
                    File.AppendAllText(logFile, $"[{timestamp}] Bid Data: {bid.GetRawText()}\n");
                    File.AppendAllText(logFile, $"[{timestamp}] ========== BID FETCH END (SUCCESS) ==========\n\n");
                    // Return a clone since the doc will be disposed
                    return JsonSerializer.Deserialize<JsonElement>(bid.GetRawText());
                }

                _logger.LogWarning("[API] FetchBid: no bid object in response for pilot {Pilot}. Response: {Json}",
                    pilotId, json.Length > 300 ? json[..300] : json);
                File.AppendAllText(logFile, $"[{timestamp}] WARNING: No bid object in response\n");
                File.AppendAllText(logFile, $"[{timestamp}] ========== BID FETCH END (NO BID) ==========\n\n");
                return null;
            }
            catch (Exception ex)
            {
                _logger.LogWarning("[API] FetchBid failed for pilot {Pilot}: {Msg}", pilotId, ex.Message);
                File.AppendAllText(logFile, $"[{timestamp}] EXCEPTION: {ex.Message}\n");
                File.AppendAllText(logFile, $"[{timestamp}] Stack Trace: {ex.StackTrace}\n");
                File.AppendAllText(logFile, $"[{timestamp}] ========== BID FETCH END (EXCEPTION) ==========\n\n");
                return null;
            }
        }

        public (bool Connected, long LastSuccess) GetDataLinkDetails()
            => (_restApiConnected, _lastRestSuccess);
    }
