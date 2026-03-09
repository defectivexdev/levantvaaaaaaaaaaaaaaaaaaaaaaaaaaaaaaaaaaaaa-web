using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using Microsoft.Extensions.Logging;
using LevantACARS.Services;
using System.Windows;

namespace LevantACARS.ViewModels;

/// <summary>
/// ViewModel for SimBrief Dispatch view - handles flight plan import from SimBrief.
/// </summary>
public partial class DispatchViewModel : ObservableObject
{
    private readonly ILogger<DispatchViewModel> _logger;
    private readonly SimBriefService _simBrief;
    private readonly FlightManager _flightManager;

    [ObservableProperty] private bool _isLoading;
    [ObservableProperty] private bool _hasFlightPlan;
    [ObservableProperty] private string _errorMessage = "";
    [ObservableProperty] private string _activeTab = "overview";

    // Origin
    [ObservableProperty] private string _originIcao = "";
    [ObservableProperty] private string _originName = "";
    [ObservableProperty] private string _originRunway = "";

    // Destination
    [ObservableProperty] private string _destinationIcao = "";
    [ObservableProperty] private string _destinationName = "";
    [ObservableProperty] private string _destinationRunway = "";

    // Alternate
    [ObservableProperty] private string _alternateIcao = "";
    [ObservableProperty] private string _alternateName = "";

    // Flight Info
    [ObservableProperty] private string _flightNumber = "";
    [ObservableProperty] private string _ete = "";
    [ObservableProperty] private string _cruiseAltitude = "";
    [ObservableProperty] private string _avgWind = "";
    [ObservableProperty] private string _costIndex = "";
    [ObservableProperty] private string _route = "";

    // Fuel
    [ObservableProperty] private string _blockFuel = "";
    [ObservableProperty] private string _tripFuel = "";
    [ObservableProperty] private string _landingFuel = "";

    // Weights
    [ObservableProperty] private string _zfw = "";
    [ObservableProperty] private string _tow = "";
    [ObservableProperty] private string _ldw = "";

    // Payload
    [ObservableProperty] private string _passengers = "";
    [ObservableProperty] private string _cargo = "";

    private SimBriefFlightPlan? _currentFlightPlan;

    public DispatchViewModel(
        ILogger<DispatchViewModel> logger,
        SimBriefService simBrief,
        FlightManager flightManager)
    {
        _logger = logger;
        _simBrief = simBrief;
        _flightManager = flightManager;
    }

    [RelayCommand]
    private async Task RefreshFlightPlanAsync()
    {
        IsLoading = true;
        ErrorMessage = "";
        HasFlightPlan = false;

        try
        {
            var config = AppConfig.Current;
            var username = config.SimBriefUsername;

            if (string.IsNullOrWhiteSpace(username))
            {
                ErrorMessage = "SimBrief username not configured. Please set it in settings.";
                _logger.LogWarning("[Dispatch] SimBrief username not configured");
                return;
            }

            _logger.LogInformation("[Dispatch] Fetching flight plan for {Username}", username);
            var flightPlan = await _simBrief.FetchFlightPlanAsync(username);

            if (flightPlan == null)
            {
                ErrorMessage = "Failed to fetch flight plan from SimBrief. Please check your username and try again.";
                return;
            }

            _currentFlightPlan = flightPlan;
            PopulateFlightPlanData(flightPlan);
            HasFlightPlan = true;

            _logger.LogInformation("[Dispatch] Flight plan loaded: {Origin} → {Dest}", OriginIcao, DestinationIcao);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[Dispatch] Error fetching flight plan");
            ErrorMessage = $"Error: {ex.Message}";
        }
        finally
        {
            IsLoading = false;
        }
    }

    [RelayCommand]
    private async Task ImportFlightPlanAsync()
    {
        if (_currentFlightPlan == null || !HasFlightPlan)
        {
            MessageBox.Show("No flight plan loaded. Please refresh first.", "Import Error", MessageBoxButton.OK, MessageBoxImage.Warning);
            return;
        }

        try
        {
            var config = AppConfig.Current;
            var pilotId = config.PilotId;

            if (string.IsNullOrWhiteSpace(pilotId))
            {
                MessageBox.Show("You must be logged in to import a flight plan.", "Not Logged In", MessageBoxButton.OK, MessageBoxImage.Warning);
                return;
            }

            // Start flight with SimBrief data
            var startParams = new FlightManager.StartFlightParams(
                pilotId,
                FlightNumber,
                FlightNumber, // Callsign
                OriginIcao,
                DestinationIcao,
                Route,
                "A320", // TODO: Extract from SimBrief if available
                "", // Aircraft Registration
                int.TryParse(Passengers, out var pax) ? pax : 0,
                int.TryParse(Cargo.Replace(" kg", ""), out var cargo) ? cargo : 0
            );

            var success = await _flightManager.StartFlightAsync(startParams);

            if (success)
            {
                MessageBox.Show($"Flight plan imported successfully!\n\n{OriginIcao} → {DestinationIcao}", 
                    "Import Successful", MessageBoxButton.OK, MessageBoxImage.Information);
                
                _logger.LogInformation("[Dispatch] Flight plan imported and flight started");
            }
            else
            {
                MessageBox.Show("Failed to start flight. Please check the logs.", 
                    "Import Failed", MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[Dispatch] Error importing flight plan");
            MessageBox.Show($"Error importing flight plan: {ex.Message}", 
                "Import Error", MessageBoxButton.OK, MessageBoxImage.Error);
        }
    }

    [RelayCommand]
    private void SetActiveTab(string tab)
    {
        ActiveTab = tab;
    }

    private void PopulateFlightPlanData(SimBriefFlightPlan plan)
    {
        // Origin
        OriginIcao = plan.Origin?.IcaoCode ?? "";
        OriginName = plan.Origin?.Name ?? "";
        OriginRunway = plan.Origin?.PlanRunway ?? "";

        // Destination
        DestinationIcao = plan.Destination?.IcaoCode ?? "";
        DestinationName = plan.Destination?.Name ?? "";
        DestinationRunway = plan.Destination?.PlanRunway ?? "";

        // Alternate
        AlternateIcao = plan.Alternate?.IcaoCode ?? "";
        AlternateName = plan.Alternate?.Name ?? "";

        // Flight Info
        FlightNumber = plan.General?.FlightNumber ?? "";
        Ete = FormatTimeEnroute(plan.General?.EstTimeEnroute ?? "");
        CruiseAltitude = plan.General?.CruiseAltitude ?? "";
        AvgWind = $"{plan.General?.AvgWindDir}/{plan.General?.AvgWindSpeed}kt";
        CostIndex = plan.General?.CostIndex ?? "";
        Route = plan.General?.Route ?? "";

        // Fuel (convert to kg if needed)
        BlockFuel = FormatWeight(plan.Fuel?.PlanRamp ?? "0");
        TripFuel = FormatWeight(plan.Fuel?.EnrouteBurn ?? "0");
        LandingFuel = FormatWeight(plan.Fuel?.PlanLanding ?? "0");

        // Weights
        Zfw = FormatWeight(plan.Weights?.EstZfw ?? "0");
        Tow = FormatWeight(plan.Weights?.EstTow ?? "0");
        Ldw = FormatWeight(plan.Weights?.EstLdw ?? "0");

        // Payload
        Passengers = plan.Weights?.PaxCount ?? "0";
        Cargo = FormatWeight(plan.Weights?.Cargo ?? "0");
    }

    private string FormatTimeEnroute(string seconds)
    {
        if (int.TryParse(seconds, out var sec))
        {
            var hours = sec / 3600;
            var minutes = (sec % 3600) / 60;
            return $"{hours}h {minutes}m";
        }
        return seconds;
    }

    private string FormatWeight(string weight)
    {
        if (double.TryParse(weight, out var w))
        {
            return $"{w:N0} kg";
        }
        return weight;
    }
}
