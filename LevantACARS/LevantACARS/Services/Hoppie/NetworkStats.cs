using System;

namespace LevantACARS.Services.Hoppie;

/// <summary>
/// Tracks network statistics and connection quality for Hoppie ACARS
/// </summary>
public class NetworkStats
{
    /// <summary>
    /// Total number of messages sent
    /// </summary>
    public int MessagesSent { get; set; }

    /// <summary>
    /// Total number of messages received
    /// </summary>
    public int MessagesReceived { get; set; }

    /// <summary>
    /// Number of failed message attempts
    /// </summary>
    public int FailedMessages { get; set; }

    /// <summary>
    /// Average response time for messages
    /// </summary>
    public TimeSpan AverageResponseTime { get; set; }

    /// <summary>
    /// Last successful poll time
    /// </summary>
    public DateTime LastSuccessfulPoll { get; set; }

    /// <summary>
    /// Last error that occurred
    /// </summary>
    public string LastError { get; set; }

    /// <summary>
    /// When the last error occurred
    /// </summary>
    public DateTime? LastErrorTime { get; set; }

    /// <summary>
    /// Number of reconnection attempts
    /// </summary>
    public int ReconnectionAttempts { get; set; }

    /// <summary>
    /// Connection uptime
    /// </summary>
    public TimeSpan Uptime { get; set; }

    /// <summary>
    /// Calculate success rate
    /// </summary>
    public double SuccessRate
    {
        get
        {
            int total = MessagesSent + FailedMessages;
            return total > 0 ? (double)MessagesSent / total * 100 : 0;
        }
    }

    /// <summary>
    /// Reset all statistics
    /// </summary>
    public void Reset()
    {
        MessagesSent = 0;
        MessagesReceived = 0;
        FailedMessages = 0;
        AverageResponseTime = TimeSpan.Zero;
        LastError = null;
        LastErrorTime = null;
        ReconnectionAttempts = 0;
        Uptime = TimeSpan.Zero;
    }
}
