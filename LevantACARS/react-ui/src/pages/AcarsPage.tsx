import { useState, useEffect } from 'react';
import { Overview } from '../components/acars/Overview';
import { AircraftData } from '../components/acars/AircraftData';
import { CommunicationLog } from '../components/acars/CommunicationLog';
import { FlightPlan } from '../components/acars/FlightPlan';
import { SystemStatus } from '../components/acars/SystemStatus';
import { WeatherInfo } from '../components/acars/WeatherInfo';
import { Reports } from '../components/acars/Reports';
import { Sidebar } from '../components/acars/AcarsSidebar';

// Mock data - will be replaced with real API calls
const mockMessages = [
  { id: 1, timestamp: "14:23:45", type: "ATC" as const, sender: "KJFK Tower", message: "VA123, cleared for takeoff runway 22L, winds 240 at 12 knots." },
  { id: 2, timestamp: "14:25:12", type: "SYSTEM" as const, sender: "ACARS", message: "Takeoff data transmitted to operations center." },
  { id: 3, timestamp: "14:28:34", type: "DISPATCH" as const, sender: "OCC Dispatcher", message: "VA123, weather update: Arrival airport EGLL expecting -RA BKN015." },
  { id: 4, timestamp: "14:32:01", type: "ATC" as const, sender: "New York Center", message: "VA123, climb and maintain FL350, direct DIETZ." },
];

const mockWaypoints = [
  { name: "KJFK", type: "ARPT", altitude: "13 ft", eta: "14:23", distance: "0 NM", passed: true },
  { name: "MERIT", type: "FIX", altitude: "15,000 ft", eta: "14:31", distance: "45 NM", passed: true },
  { name: "DIETZ", type: "FIX", altitude: "35,000 ft", eta: "14:38", distance: "128 NM", passed: true },
  { name: "STAFA", type: "FIX", altitude: "35,000 ft", eta: "15:12", distance: "342 NM", passed: false },
  { name: "EGLL", type: "ARPT", altitude: "80 ft", eta: "20:42", distance: "1,523 NM", passed: false },
];

const mockSystems = [
  { name: "ACARS Datalink", status: "OPERATIONAL" as const, value: "Signal: Strong" },
  { name: "GPS Navigation", status: "OPERATIONAL" as const, value: "Accuracy: ±3m" },
  { name: "Autopilot", status: "OPERATIONAL" as const, value: "Mode: NAV/VNAV" },
];

const mockDeparture = {
  location: "KJFK",
  locationName: "John F. Kennedy International Airport",
  condition: "Clear",
  temperature: 18,
  dewpoint: 9,
  visibility: "10 SM",
  clouds: "FEW 250",
  pressure: "1013 hPa",
  humidity: 65,
  windSpeed: 12,
  windDir: 240,
  metar: "KJFK 141851Z 24012KT 10SM FEW250 18/09 A2992",
  taf: "TAF KJFK 141720Z 1418/1524 24012KT P6SM SKC",
};

const mockArrival = {
  location: "EGLL",
  locationName: "London Heathrow Airport",
  condition: "Light Rain",
  temperature: 12,
  dewpoint: 10,
  visibility: "6000 M",
  clouds: "BKN 015 OVC 025",
  pressure: "1008 hPa",
  humidity: 82,
  windSpeed: 15,
  windDir: 270,
  gusts: 28,
  metar: "EGLL 141850Z 27015G28KT 6000 -RA BKN015 OVC025 12/10 Q1008",
  taf: "TAF EGLL 141700Z 1418/1524 27015KT 8000 -RA BKN015",
};

export default function AcarsPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [utcTime, setUtcTime] = useState(new Date().toUTCString().slice(17, 25));
  const [flightTime, setFlightTime] = useState("02:23:45");

  const [aircraft, setAircraft] = useState({
    altitude: 35000,
    speed: 485,
    heading: 67,
    verticalSpeed: 0,
    fuel: 68,
    fuelKg: 68200,
    temperature: -45,
    windSpeed: 85,
    windDirection: 280,
    mach: 0.82,
    grossWeight: 245800,
    passengers: 287,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setUtcTime(new Date().toUTCString().slice(17, 25));
      // Simulate flight time increment
      const [h, m, s] = flightTime.split(':').map(Number);
      let newS = s + 1;
      let newM = m;
      let newH = h;
      if (newS >= 60) { newS = 0; newM++; }
      if (newM >= 60) { newM = 0; newH++; }
      setFlightTime(`${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}:${String(newS).padStart(2, '0')}`);
    }, 1000);

    return () => clearInterval(timer);
  }, [flightTime]);

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <Overview
            flightNumber="VA123"
            aircraft="Boeing 787-9 Dreamliner"
            departure="KJFK"
            departureName="John F. Kennedy Intl"
            arrival="EGLL"
            arrivalName="London Heathrow"
            pilot="John Smith"
            coPilot="Jane Doe"
            eta="20:42 UTC"
            ete="6h 19m"
            altitude={aircraft.altitude}
            speed={aircraft.speed}
            fuel={aircraft.fuel}
            fuelKg={aircraft.fuelKg}
            distance="1,523 NM"
            distanceToGo="1,195 NM"
            flightTime={flightTime}
            heading={aircraft.heading}
            verticalSpeed={aircraft.verticalSpeed}
            temperature={aircraft.temperature}
            windSpeed={aircraft.windSpeed}
            windDirection={aircraft.windDirection}
            mach={aircraft.mach}
            grossWeight={aircraft.grossWeight}
            passengers={aircraft.passengers}
            phase="CRUISE"
            progress={22}
          />
        );
      case "instruments":
        return <AircraftData {...aircraft} phase="CRUISE" />;
      case "communications":
        return <CommunicationLog messages={mockMessages} />;
      case "flightplan":
        return (
          <FlightPlan
            waypoints={mockWaypoints}
            departure="KJFK"
            arrival="EGLL"
            route="MERIT DIETZ STAFA GOMUP SONEX BRAIN"
            cruiseAltitude="FL370"
            cruiseSpeed="M0.82"
          />
        );
      case "weather":
        return <WeatherInfo departure={mockDeparture} arrival={mockArrival} />;
      case "systems":
        return <SystemStatus systems={mockSystems} />;
      case "reports":
        return <Reports flightNumber="VA123" />;
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-white">
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        altitude={aircraft.altitude}
        speed={aircraft.speed}
        fuel={aircraft.fuel}
        phase="CRUISE"
        unreadComms={2}
      />
      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-[1600px] mx-auto">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">ACARS Flight Monitoring System</h1>
              <p className="text-slate-400 text-sm">Real-time aircraft communication and reporting</p>
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
