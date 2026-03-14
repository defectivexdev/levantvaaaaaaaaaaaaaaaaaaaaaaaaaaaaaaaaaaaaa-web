using System;
using System.Collections.Generic;
using System.Linq;

namespace LevantACARS.Services.Hoppie;

/// <summary>
/// Represents a pending outbound message with retry logic
/// </summary>
public class PendingMessage
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string FromCallsign { get; set; } = string.Empty;
    public string ToCallsign { get; set; } = string.Empty;
    public AcarsClient.MessageType MessageType { get; set; }
    public string Data { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.Now;
    public int RetryCount { get; set; }
    public DateTime? LastAttempt { get; set; }
    public string LastError { get; set; } = string.Empty;
}

/// <summary>
/// Manages outbound message queue with retry logic
/// </summary>
public class OutboundMessageQueue
{
    private readonly Queue<PendingMessage> _queue = new Queue<PendingMessage>();
    private readonly object _lock = new object();

    /// <summary>
    /// Maximum number of retry attempts
    /// </summary>
    public int MaxRetries { get; set; } = 3;

    /// <summary>
    /// Delay between retry attempts
    /// </summary>
    public TimeSpan RetryDelay { get; set; } = TimeSpan.FromSeconds(5);

    /// <summary>
    /// Event triggered when a message fails after all retries
    /// </summary>
    public event EventHandler<PendingMessage>? OnMessageFailed;

    /// <summary>
    /// Event triggered when a message is successfully sent
    /// </summary>
    public event EventHandler<PendingMessage>? OnMessageSent;

    /// <summary>
    /// Number of pending messages in queue
    /// </summary>
    public int Count
    {
        get
        {
            lock (_lock)
            {
                return _queue.Count;
            }
        }
    }

    /// <summary>
    /// Add a message to the queue
    /// </summary>
    public void Enqueue(PendingMessage message)
    {
        lock (_lock)
        {
            _queue.Enqueue(message);
        }
    }

    /// <summary>
    /// Get the next message to send
    /// </summary>
    public PendingMessage? Dequeue()
    {
        lock (_lock)
        {
            return _queue.Count > 0 ? _queue.Dequeue() : null;
        }
    }

    /// <summary>
    /// Peek at the next message without removing it
    /// </summary>
    public PendingMessage? Peek()
    {
        lock (_lock)
        {
            return _queue.Count > 0 ? _queue.Peek() : null;
        }
    }

    /// <summary>
    /// Mark a message as failed and re-queue if retries remain
    /// </summary>
    public void MarkAsFailed(PendingMessage message, string error)
    {
        message.RetryCount++;
        message.LastAttempt = DateTime.Now;
        message.LastError = error;

        if (message.RetryCount < MaxRetries)
        {
            // Re-queue for retry
            lock (_lock)
            {
                _queue.Enqueue(message);
            }
        }
        else
        {
            // Max retries exceeded
            OnMessageFailed?.Invoke(this, message);
        }
    }

    /// <summary>
    /// Mark a message as successfully sent
    /// </summary>
    public void MarkAsSent(PendingMessage message)
    {
        OnMessageSent?.Invoke(this, message);
    }

    /// <summary>
    /// Clear all pending messages
    /// </summary>
    public void Clear()
    {
        lock (_lock)
        {
            _queue.Clear();
        }
    }

    /// <summary>
    /// Get all pending messages
    /// </summary>
    public PendingMessage[] GetAll()
    {
        lock (_lock)
        {
            return _queue.ToArray();
        }
    }
}
