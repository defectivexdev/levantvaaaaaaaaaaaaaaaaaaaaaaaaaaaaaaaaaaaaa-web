import { useState, useEffect } from 'react';
import { Overview } from '../components/acars/Overview';
import { AircraftData } from '../components/acars/AircraftData';
import { CommunicationLog } from '../components/acars/CommunicationLog';
import { FlightPlan } from '../components/acars/FlightPlan';
import { SystemStatus } from '../components/acars/SystemStatus';
import { WeatherInfo } from '../components/acars/WeatherInfo';
import { Reports } from '../components/acars/Reports';
import { Sidebar } from '../components/acars/AcarsSidebar';
import { useAcarsFlightData } from '../hooks/useAcarsFlightData';
import { useFlightMessages } from '../hooks/useFlightMessages';
import { useFlightPlanData } from '../hooks/useFlightPlanData';
import { useSystemStatus } from '../hooks/useSystemStatus';
import { useWeatherData } from '../hooks/useWeatherData';

export default function AcarsPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [utcTime, setUtcTime] = useState(new Date().toUTCString().slice(17, 25));

  // Real data hooks
  const { flightData, loading: flightLoading, error: flightError } = useAcarsFlightData();
  const { messages, loading: messagesLoading } = useFlightMessages();
  const { flightPlan, loading: planLoading } = useFlightPlanData();
  const { systems, loading: systemsLoading } = useSystemStatus();
  const { departureWeather, arrivalWeather, loading: weatherLoading } = useWeatherData(
    flightData?.departure,
    flightData?.arrival
  );

  // Update UTC time
  useEffect(() => {
    const timer = setInterval(() => {
      setUtcTime(new Date().toUTCString().slice(17, 25));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Show loading state
  if (flightLoading) {
    return (
      <div className="flex min-h-screen bg-slate-950 text-white items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading flight data...</p>
        </div>
      </div>
    );
  }

  // Show error or no flight state
  if (flightError || !flightData) {
    return (
      <div className="flex min-h-screen bg-slate-950 text-white items-center justify-center">
        <div className="text-center max-w-md">
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-8">
            <h2 className="text-xl font-bold text-white mb-2">No Active Flight</h2>
            <p className="text-slate-400 mb-4">
              {flightError || 'No flight data available. Please start a flight in the ACARS client.'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <Overview
            flightNumber={flightData.flightNumber}
            aircraft={flightData.aircraft}
            departure={flightData.departure}
            departureName={flightData.departureName}
            arrival={flightData.arrival}
            arrivalName={flightData.arrivalName}
            pilot={flightData.pilot}
            coPilot={flightData.coPilot}
            eta={flightData.eta}
            ete={flightData.ete}
            altitude={flightData.altitude}
            speed={flightData.speed}
            fuel={flightData.fuel}
            fuelKg={flightData.fuelKg}
            distance={flightData.distance}
            distanceToGo={flightData.distanceToGo}
            flightTime={flightData.flightTime}
            heading={flightData.heading}
            verticalSpeed={flightData.verticalSpeed}
            temperature={flightData.temperature}
            windSpeed={flightData.windSpeed}
            windDirection={flightData.windDirection}
            mach={flightData.mach}
            grossWeight={flightData.grossWeight}
            passengers={flightData.passengers}
            phase={flightData.phase}
            progress={flightData.progress}
          />
        );
      
      case "instruments":
        return (
          <AircraftData
            altitude={flightData.altitude}
            speed={flightData.speed}
            heading={flightData.heading}
            verticalSpeed={flightData.verticalSpeed}
            fuel={flightData.fuel}
            fuelKg={flightData.fuelKg}
            temperature={flightData.temperature}
            windSpeed={flightData.windSpeed}
            windDirection={flightData.windDirection}
            mach={flightData.mach}
            n1={0}
            n2={0}
            egt={0}
            fuelFlowPerEngine={0}
            grossWeight={flightData.grossWeight}
          />
        );
      
      case "communications":
        if (messagesLoading) {
          return <div className="text-center text-slate-400 py-8">Loading messages...</div>;
        }
        return <CommunicationLog messages={messages} />;
      
      case "flightplan":
        if (planLoading) {
          return <div className="text-center text-slate-400 py-8">Loading flight plan...</div>;
        }
        return flightPlan ? <FlightPlan waypoints={flightPlan.waypoints} /> : (
          <div className="text-center text-slate-400 py-8">No flight plan available</div>
        );
      
      case "weather":
        if (weatherLoading) {
          return <div className="text-center text-slate-400 py-8">Loading weather data...</div>;
        }
        return (departureWeather || arrivalWeather) ? (
          <WeatherInfo 
            departure={departureWeather || undefined} 
            arrival={arrivalWeather || undefined} 
          />
        ) : (
          <div className="text-center text-slate-400 py-8">No weather data available</div>
        );
      
      case "systems":
        if (systemsLoading) {
          return <div className="text-center text-slate-400 py-8">Loading system status...</div>;
        }
        return <SystemStatus systems={systems} />;
      
      case "reports":
        return <Reports />;
      
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-white">
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        altitude={flightData.altitude}
        speed={flightData.speed}
        fuel={flightData.fuel}
        phase={flightData.phase}
        unreadComms={messages.filter(m => !m.read).length || 0}
      />
      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-[1600px] mx-auto">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">ACARS Flight Monitoring System</h1>
              <p className="text-slate-400 text-sm">Real-time aircraft communication and reporting - {flightData.flightNumber}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500">UTC Time</p>
              <p className="text-lg font-mono font-bold text-blue-400">{utcTime}</p>
            </div>
          </div>
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
