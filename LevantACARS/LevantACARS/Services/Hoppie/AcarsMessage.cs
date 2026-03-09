using System;
using static LevantACARS.Services.Hoppie.AcarsClient;

namespace LevantACARS.Services.Hoppie;

public enum MessagePriority
{
    Normal,
    High,
    Urgent,
    Emergency
}

/// <summary>
/// Class containing a single ACARS message
/// </summary>
public class AcarsMessage
{
    public Guid Id { get; private set; }
    /// <summary>
    /// When the message was recieved by the client (not when it was created or sent from the sender station)
    /// </summary>
    public DateTime RecievedAt { get; private set; }

    /// <summary>
    /// Callsign from which the message was recieved
    /// </summary>
    public string From { get; private set; } = string.Empty;

    /// <summary>
    /// Callsign to which the message was addressed
    /// </summary>
    public string To { get; private set; } = string.Empty;

    /// <summary>
    /// Type of ACARS message
    /// </summary>
    public MessageType Type { get; private set; }

    /// <summary>
    /// Data contained in the message
    /// </summary>
    public string Data { get; private set; } = string.Empty;

    /// <summary>
    /// Message priority level
    /// </summary>
    public MessagePriority Priority { get; set; } = MessagePriority.Normal;

    /// <summary>
    /// Whether the message has been read by the user
    /// </summary>
    public bool IsRead { get; set; }

    /// <summary>
    /// When the message was marked as read
    /// </summary>
    public DateTime? ReadAt { get; set; }

    /// <summary>
    /// Whether this message requires a response
    /// </summary>
    public bool RequiresResponse { get; set; }

    /// <summary>
    /// When a response was sent
    /// </summary>
    public DateTime? RespondedAt { get; set; }

    /// <summary>
    /// ID of the response message if one was sent
    /// </summary>
    public string ResponseMessageId { get; set; } = string.Empty;

    /// <summary>
    /// Use to create a generic ACARS message
    /// </summary>
    /// <param name="recievedAt">When the message was recieved by the client (not when it was created or sent from the sender station)</param>
    /// <param name="from">Callsign from which the message was recieved</param>
    /// <param name="to">Callsign to which the message was addressed</param>
    /// <param name="type">Type of ACARS message</param>
    /// <param name="data">Data contained in the message</param>
    public AcarsMessage(
        DateTime recievedAt,
        string from,
        string to,
        MessageType type,
        string data)
    {
        RecievedAt = recievedAt;
        From = from;
        To = to;
        Type = type;
        Data = data;
        Id = Guid.NewGuid();
    }

    /// <summary>
    /// Mark this message as read
    /// </summary>
    public void MarkAsRead()
    {
        IsRead = true;
        ReadAt = DateTime.Now;
    }

    /// <summary>
    /// Mark this message as responded to
    /// </summary>
    public void MarkAsResponded(string responseMessageId)
    {
        RespondedAt = DateTime.Now;
        ResponseMessageId = responseMessageId;
    }

    public override string ToString()
    {
        return string.Format("From: {0}, To: {1}, Type: {2}, Priority: {3}, Data: {4}", From, To, Type.ToString(), Priority, Data);
    }
}
