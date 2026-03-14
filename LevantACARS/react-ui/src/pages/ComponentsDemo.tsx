import { useState } from 'react';
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
  Input,
  Spinner,
  PilotListPanel,
  FlightStatusCard,
  TelemetryDisplay,
  MapControls,
  ToastContainer,
} from '@/components';
import { useToast } from '@/hooks/useToast';
import { usePilots } from '@/hooks/usePilots';
import { Pilot } from '@/types';

export default function ComponentsDemo() {
  const { toasts, success, error, warning, info } = useToast();
  const { pilots, loading } = usePilots();
  const [selectedPilot, setSelectedPilot] = useState<Pilot | null>(null);

  return (
    <div className="min-h-full bg-transparent p-8 space-y-8 overflow-y-auto">
      <ToastContainer toasts={toasts} />

      <div className="max-w-7xl mx-auto">
        <div className="mb-10 text-center">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-white via-amber-100 to-white bg-clip-text text-transparent mb-3">
            LevantACARS Component Library
          </h1>
          <p className="text-slate-300 text-lg font-medium">
            Beautiful UI components for flight tracking and monitoring
          </p>
          <div className="mt-4 flex items-center justify-center gap-3">
            <Badge variant="glow" pulse>17 Components</Badge>
            <Badge variant="success">Production Ready</Badge>
            <Badge variant="info">TypeScript</Badge>
          </div>
        </div>

        {/* Buttons Section */}
        <Card variant="glass" className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              Buttons
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="danger">Danger</Button>
              <Button variant="gradient">Gradient</Button>
              <Button variant="primary" size="sm">Small</Button>
              <Button variant="primary" size="lg">Large</Button>
              <Button variant="primary" disabled>Disabled</Button>
            </div>
          </CardContent>
        </Card>

        {/* Badges Section */}
        <Card variant="glass" className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              Badges
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Badge variant="default">Default</Badge>
              <Badge variant="success">Success</Badge>
              <Badge variant="warning">Warning</Badge>
              <Badge variant="danger">Danger</Badge>
              <Badge variant="info">Info</Badge>
              <Badge variant="glow">Glow</Badge>
              <Badge variant="success" pulse>Pulse</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Input Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Input Fields</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-w-md">
              <Input placeholder="Normal input" />
              <Input placeholder="Error state" error />
              <Input placeholder="Disabled" disabled />
            </div>
          </CardContent>
        </Card>

        {/* Toast Notifications */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Toast Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => success('Success!', 'Operation completed successfully')}>
                Success Toast
              </Button>
              <Button onClick={() => error('Error!', 'Something went wrong')}>
                Error Toast
              </Button>
              <Button onClick={() => warning('Warning!', 'Please check your input')}>
                Warning Toast
              </Button>
              <Button onClick={() => info('Info', 'Here is some information')}>
                Info Toast
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Spinner */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Loading Spinners</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <Spinner size="sm" />
              <Spinner size="md" />
              <Spinner size="lg" />
            </div>
          </CardContent>
        </Card>

        {/* Telemetry Display */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Telemetry Display</CardTitle>
          </CardHeader>
          <CardContent>
            <TelemetryDisplay
              altitude={15000}
              groundSpeed={450}
              heading={270}
              verticalSpeed={1200}
              indicatedAirspeed={280}
            />
          </CardContent>
        </Card>

        {/* Map Controls */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Map Controls</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative h-64 bg-slate-800 rounded-lg">
              <MapControls
                onZoomIn={() => info('Zoom In', 'Zooming in on map')}
                onZoomOut={() => info('Zoom Out', 'Zooming out on map')}
                onFitBounds={() => info('Fit Bounds', 'Fitting all pilots in view')}
                onToggleLayers={() => info('Layers', 'Toggling map layers')}
                onToggleFilters={() => info('Filters', 'Toggling filters')}
              />
            </div>
          </CardContent>
        </Card>

        {/* Flight Components */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pilot List */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              {loading ? (
                <Card className="h-96 flex items-center justify-center">
                  <Spinner size="lg" />
                </Card>
              ) : (
                <div className="h-96">
                  <PilotListPanel
                    pilots={pilots}
                    selectedPilotId={selectedPilot?.id}
                    onPilotSelect={setSelectedPilot}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Flight Status Card */}
          <div className="lg:col-span-2">
            {selectedPilot ? (
              <FlightStatusCard pilot={selectedPilot} />
            ) : (
              <Card className="h-96 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-slate-400 mb-2">Select a pilot to view details</p>
                  <Badge variant="info">Click on a pilot from the list</Badge>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
