import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Plane, Clock, MapPin, User } from "lucide-react";

interface FlightStatusProps {
  flightNumber: string;
  aircraft: string;
  departure: string;
  departureName: string;
  arrival: string;
  arrivalName: string;
  status: string;
  pilot: string;
  eta: string;
}

export function FlightStatus({ 
  flightNumber, 
  aircraft, 
  departure,
  departureName, 
  arrival,
  arrivalName, 
  status, 
  pilot, 
  eta 
}: FlightStatusProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-500';
      case 'BOARDING':
        return 'bg-blue-500';
      case 'DELAYED':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl text-white flex items-center gap-2">
            <Plane className="w-6 h-6 text-blue-400" />
            {flightNumber}
          </CardTitle>
          <Badge className={`${getStatusColor(status)} text-white`}>
            {status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-slate-400">Aircraft Type</p>
            <p className="text-lg text-white font-mono">{aircraft}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-slate-400 flex items-center gap-1">
              <User className="w-4 h-4" />
              Pilot in Command
            </p>
            <p className="text-lg text-white">{pilot}</p>
          </div>
        </div>
        
        <div className="flex items-center justify-between py-4">
          <div className="flex flex-col items-center">
            <MapPin className="w-5 h-5 text-blue-400 mb-2" />
            <p className="text-2xl font-bold text-white">{departure}</p>
            <p className="text-xs text-slate-400">{departureName}</p>
          </div>
          
          <div className="flex-1 mx-4 relative">
            <div className="h-0.5 bg-slate-600 relative">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <Plane className="w-6 h-6 text-blue-400 rotate-90" />
              </div>
            </div>
          </div>
          
          <div className="flex flex-col items-center">
            <MapPin className="w-5 h-5 text-green-400 mb-2" />
            <p className="text-2xl font-bold text-white">{arrival}</p>
            <p className="text-xs text-slate-400">{arrivalName}</p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 text-slate-300">
          <Clock className="w-4 h-4" />
          <span className="text-sm">ETA: {eta}</span>
        </div>
      </CardContent>
    </Card>
  );
}
