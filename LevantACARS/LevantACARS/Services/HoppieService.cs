using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using LevantACARS.Services.Hoppie;
using Microsoft.Extensions.Logging;

namespace LevantACARS.Services;

public class HoppieMessageInfo
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    public string From { get; set; } = "";
    public string To { get; set; } = "";
    public string Type { get; set; } = "telex"; // telex, cpdlc, log
    public string Content { get; set; } = "";
    public bool IsInbound { get; set; }
}

public sealed class HoppieService : IDisposable
{
    private readonly ILogger<HoppieService> _logger;
    private AcarsClient? _client;
    private CancellationTokenSource? _pollingCts;
    
    // Using a ConcurrentBag to store messages/logs, could be an ObservableCollection in ViewModel instead.
    public event Action<HoppieMessageInfo>? OnMessageReceived;
    public event Action<HoppieMessageInfo>? OnLogEvent;

    public HoppieService(ILogger<HoppieService> logger)
    {
        _logger = logger;
    }

    /// <summary>
    /// Initialize Hoppie client without starting message polling (for network queries only)
    /// </summary>
    public void Initialize(string callsign, string logonCode)
    {
        if (string.IsNullOrWhiteSpace(callsign) || string.IsNullOrWhiteSpace(logonCode))
        {
            _logger.LogWarning("[Hoppie] Callsign or Logon Code is missing. Cannot initialize Hoppie service.");
            return;
        }

        // Only create client if it doesn't exist yet
        if (_client == null)
        {
            _logger.LogInformation("[Hoppie] Initializing Hoppie client for callsign: {Callsign}", callsign);
            _client = new AcarsClient(callsign, logonCode, false);
        }
    }

    /// <summary>
    /// Start Hoppie service with message polling (called when flight starts)
    /// </summary>
    public void Start(string callsign, string logonCode)
    {
        Stop();

        if (string.IsNullOrWhiteSpace(callsign) || string.IsNullOrWhiteSpace(logonCode))
        {
            _logger.LogWarning("[Hoppie] Callsign or Logon Code is missing. Cannot start Hoppie service.");
            return;
        }

        _logger.LogInformation("[Hoppie] Starting Hoppie service for callsign: {Callsign}", callsign);
        
        // Initialize the client (disable automatic polling to control it manually via our task)
        _client = new AcarsClient(callsign, logonCode, false);
        
        // Start polling
        _pollingCts = new CancellationTokenSource();
        _ = PollTaskAsync(_pollingCts.Token);
    }

    public void Stop()
    {
        if (_pollingCts != null)
        {
            _pollingCts.Cancel();
            _pollingCts.Dispose();
            _pollingCts = null;
        }

        if (_client != null)
        {
            _client.Dispose();
            _client = null;
        }
    }

    private async Task PollTaskAsync(CancellationToken token)
    {
        while (!token.IsCancellationRequested)
        {
            try
            {
                if (_client != null)
                {
                    LogEvent($"Polling Hoppie for messages...");
                    var messages = await _client.GetPendingMessages();
                    
                    if (messages != null && messages.Length > 0)
                    {
                        foreach (var msg in messages)
                        {
                            var type = msg.Type.ToString().ToLowerInvariant();
                            var info = new HoppieMessageInfo
                            {
                                From = msg.From,
                                To = _client.Callsign,
                                Content = msg.Data,
                                IsInbound = true,
                                Type = type
                            };
                            
                            OnMessageReceived?.Invoke(info);
                            LogEvent($"Received {type} from {msg.From}: {msg.Data}");
                        }
                    }
                    else
                    {
                        LogEvent($"No new messages");
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[Hoppie] Polling failed.");
                LogEvent($"Polling error: {ex.Message}");
            }

            // Wait before polling again
            try
            {
                await Task.Delay(TimeSpan.FromSeconds(30), token);
            }
            catch (TaskCanceledException)
            {
                break;
            }
        }
    }

    public async Task<bool> SendTelexAsync(string recipient, string message)
    {
        if (_client == null) return false;

        try
        {
            LogEvent($"Sending Telex to {recipient}: {message}");
            await _client.SendTelex(_client.Callsign, recipient, message);
            
            var info = new HoppieMessageInfo
            {
                From = _client.Callsign,
                To = recipient,
                Content = message,
                IsInbound = false,
                Type = "telex"
            };
            OnMessageReceived?.Invoke(info);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[Hoppie] Failed to send telex.");
            LogEvent($"Failed to send telex: {ex.Message}");
            return false;
        }
    }

    public async Task<bool> SendCpdlcAsync(string recipient, string message)
    {
        if (_client == null) return false;

        try
        {
            LogEvent($"Sending CPDLC to {recipient}: {message}");
            await _client.SendCPDLC(_client.Callsign, recipient, message);
            
            var info = new HoppieMessageInfo
            {
                From = _client.Callsign,
                To = recipient,
                Content = message,
                IsInbound = false,
                Type = "cpdlc"
            };
            OnMessageReceived?.Invoke(info);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[Hoppie] Failed to send CPDLC.");
            LogEvent($"Failed to send CPDLC: {ex.Message}");
            return false;
        }
    }

    public async Task<string[]> GetOnlineAtcAsync()
    {
        if (_client == null) return Array.Empty<string>();
        try
        {
            return await _client.GetAllAtcStationsOnline();
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "[Hoppie] Failed to get online ATC.");
            return Array.Empty<string>();
        }
    }

    public async Task<string[]> GetOnlineCallsignsAsync()
    {
        if (_client == null) return Array.Empty<string>();
        try
        {
            return await _client.GetAllCallsignsOnline();
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "[Hoppie] Failed to get online callsigns.");
            return Array.Empty<string>();
        }
    }

    private void LogEvent(string text)
    {
        var info = new HoppieMessageInfo
        {
            Type = "log",
            Content = text,
            Timestamp = DateTime.UtcNow
        };
        OnLogEvent?.Invoke(info);
    }

    public void Dispose()
    {
        Stop();
    }
}
