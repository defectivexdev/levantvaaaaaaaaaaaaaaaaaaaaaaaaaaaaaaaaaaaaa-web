using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.Json;

namespace LevantACARS.Services.Hoppie;

/// <summary>
/// Handles logging and persistence of ACARS messages
/// </summary>
public class MessageLogger
{
    private readonly string _logDirectory;

    public MessageLogger(string logDirectory = null)
    {
        _logDirectory = logDirectory ?? Path.Combine(
            Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData),
            "LevantACARS",
            "HoppieLogs"
        );

        if (!Directory.Exists(_logDirectory))
        {
            Directory.CreateDirectory(_logDirectory);
        }
    }

    /// <summary>
    /// Save message history to a JSON file
    /// </summary>
    public void SaveMessageHistory(List<AcarsMessage> messages, string filename = null)
    {
        try
        {
            filename ??= $"acars_history_{DateTime.Now:yyyyMMdd_HHmmss}.json";
            string filePath = Path.Combine(_logDirectory, filename);

            var options = new JsonSerializerOptions
            {
                WriteIndented = true,
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            };

            string json = JsonSerializer.Serialize(messages, options);
            File.WriteAllText(filePath, json);
        }
        catch (Exception ex)
        {
            throw new Exception($"Failed to save message history: {ex.Message}", ex);
        }
    }

    /// <summary>
    /// Load message history from a JSON file
    /// </summary>
    public List<AcarsMessage> LoadMessageHistory(string filename)
    {
        try
        {
            string filePath = Path.Combine(_logDirectory, filename);
            if (!File.Exists(filePath))
            {
                throw new FileNotFoundException($"Message history file not found: {filename}");
            }

            string json = File.ReadAllText(filePath);
            var options = new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            };

            return JsonSerializer.Deserialize<List<AcarsMessage>>(json, options) ?? new List<AcarsMessage>();
        }
        catch (Exception ex)
        {
            throw new Exception($"Failed to load message history: {ex.Message}", ex);
        }
    }

    /// <summary>
    /// Export messages to a human-readable text file
    /// </summary>
    public void ExportToText(List<AcarsMessage> messages, string filename = null)
    {
        try
        {
            filename ??= $"acars_export_{DateTime.Now:yyyyMMdd_HHmmss}.txt";
            string filePath = Path.Combine(_logDirectory, filename);

            using (var writer = new StreamWriter(filePath))
            {
                writer.WriteLine("=".PadRight(80, '='));
                writer.WriteLine($"HOPPIE ACARS MESSAGE LOG - {DateTime.Now:yyyy-MM-dd HH:mm:ss}");
                writer.WriteLine("=".PadRight(80, '='));
                writer.WriteLine();

                foreach (var msg in messages.OrderBy(m => m.RecievedAt))
                {
                    writer.WriteLine($"[{msg.RecievedAt:yyyy-MM-dd HH:mm:ss}] {msg.Type} - Priority: {msg.Priority}");
                    writer.WriteLine($"From: {msg.From} → To: {msg.To}");
                    writer.WriteLine($"Data: {msg.Data}");
                    writer.WriteLine($"Read: {(msg.IsRead ? $"Yes ({msg.ReadAt:HH:mm:ss})" : "No")}");
                    if (msg.RequiresResponse)
                    {
                        writer.WriteLine($"Response: {(msg.RespondedAt.HasValue ? $"Sent ({msg.RespondedAt:HH:mm:ss})" : "Pending")}");
                    }
                    writer.WriteLine("-".PadRight(80, '-'));
                }

                writer.WriteLine();
                writer.WriteLine($"Total Messages: {messages.Count}");
                writer.WriteLine($"Unread: {messages.Count(m => !m.IsRead)}");
                writer.WriteLine($"Pending Response: {messages.Count(m => m.RequiresResponse && !m.RespondedAt.HasValue)}");
            }
        }
        catch (Exception ex)
        {
            throw new Exception($"Failed to export messages to text: {ex.Message}", ex);
        }
    }

    /// <summary>
    /// Append a single message to the daily log file
    /// </summary>
    public void AppendToLog(AcarsMessage message)
    {
        try
        {
            string filename = $"acars_log_{DateTime.Now:yyyyMMdd}.txt";
            string filePath = Path.Combine(_logDirectory, filename);

            using (var writer = new StreamWriter(filePath, append: true))
            {
                writer.WriteLine($"[{message.RecievedAt:HH:mm:ss}] {message.Type} | {message.From} → {message.To} | {message.Data}");
            }
        }
        catch
        {
            // Silent fail for logging
        }
    }

    /// <summary>
    /// Get list of all saved log files
    /// </summary>
    public string[] GetLogFiles()
    {
        return Directory.GetFiles(_logDirectory, "*.json")
            .Concat(Directory.GetFiles(_logDirectory, "*.txt"))
            .Select(Path.GetFileName)
            .ToArray();
    }

    /// <summary>
    /// Delete old log files older than specified days
    /// </summary>
    public void CleanupOldLogs(int daysToKeep = 30)
    {
        try
        {
            var cutoffDate = DateTime.Now.AddDays(-daysToKeep);
            var files = Directory.GetFiles(_logDirectory);

            foreach (var file in files)
            {
                var fileInfo = new FileInfo(file);
                if (fileInfo.LastWriteTime < cutoffDate)
                {
                    File.Delete(file);
                }
            }
        }
        catch
        {
            // Silent fail for cleanup
        }
    }
}
