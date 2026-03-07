using System;

namespace LevantACARS.Services.Hoppie;

/// <summary>
/// Represents the current connection state of the Hoppie ACARS client
/// </summary>
public enum ConnectionState
{
    Disconnected,
    Connecting,
    Connected,
    Reconnecting,
    Error
}

/// <summary>
/// Event args for connection state changes
/// </summary>
public class ConnectionStateChangedEventArgs : EventArgs
{
    public ConnectionState OldState { get; }
    public ConnectionState NewState { get; }
    public string Message { get; }
    public Exception Error { get; }

    public ConnectionStateChangedEventArgs(ConnectionState oldState, ConnectionState newState, string message = null, Exception error = null)
    {
        OldState = oldState;
        NewState = newState;
        Message = message;
        Error = error;
    }
}
