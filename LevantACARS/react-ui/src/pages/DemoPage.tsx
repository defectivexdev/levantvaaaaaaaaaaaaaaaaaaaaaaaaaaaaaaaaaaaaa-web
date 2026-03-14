import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components';
import { Card, CardHeader, CardTitle, CardContent } from '@/components';
import { PilotListPanel, FlightStatusCard, StatsCard } from '@/components';
import { usePilots } from '@/hooks';
import { Plane, Users, Activity, Clock } from 'lucide-react';

export default function DemoPage() {
  const { pilots } = usePilots();
  const selectedPilot = pilots[0];

  return (
    <div className="h-full p-6 overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="animate-slide-up">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-amber-100 to-white bg-clip-text text-transparent mb-2">
            Flight Operations Dashboard
          </h1>
          <p className="text-slate-400">Real-time flight tracking and monitoring system</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Active Flights"
            value={pilots.length}
            subtitle="Currently in the air"
            icon={Plane}
            color="amber"
            trend={{ value: 12, isPositive: true }}
          />
          <StatsCard
            title="Total Pilots"
            value="24"
            subtitle="Online pilots"
            icon={Users}
            color="emerald"
          />
          <StatsCard
            title="Flight Hours"
            value="1,234"
            subtitle="This month"
            icon={Clock}
            color="blue"
            trend={{ value: 8, isPositive: true }}
          />
          <StatsCard
            title="System Status"
            value="100%"
            subtitle="All systems operational"
            icon={Activity}
            color="purple"
          />
        </div>

        {/* Tabs Demo */}
        <Card variant="glass" className="animate-slide-up">
          <CardHeader>
            <CardTitle>Flight Management</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="pilots">Pilots</TabsTrigger>
                <TabsTrigger value="flights">Flights</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Active Pilots</h3>
                    <PilotListPanel pilots={pilots} />
                  </div>
                  {selectedPilot && (
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4">Flight Details</h3>
                      <FlightStatusCard pilot={selectedPilot} />
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="pilots">
                <div className="p-6 rounded-xl bg-slate-800/30 border border-slate-700/30">
                  <h3 className="text-lg font-semibold text-white mb-4">Pilot Management</h3>
                  <p className="text-slate-400">
                    View and manage all registered pilots, their statistics, and flight history.
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="flights">
                <div className="p-6 rounded-xl bg-slate-800/30 border border-slate-700/30">
                  <h3 className="text-lg font-semibold text-white mb-4">Flight Schedule</h3>
                  <p className="text-slate-400">
                    Browse available flights, create new routes, and manage flight bookings.
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="analytics">
                <div className="p-6 rounded-xl bg-slate-800/30 border border-slate-700/30">
                  <h3 className="text-lg font-semibold text-white mb-4">Analytics & Reports</h3>
                  <p className="text-slate-400">
                    View detailed analytics, performance metrics, and generate custom reports.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
