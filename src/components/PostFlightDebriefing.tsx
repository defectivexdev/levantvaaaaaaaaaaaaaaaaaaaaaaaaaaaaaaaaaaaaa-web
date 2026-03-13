/**
 * Post-Flight Debriefing Component
 * Comprehensive flight analysis with interactive graphs and telemetry replay
 */

'use client';

import { useState, useEffect } from 'react';
import {
    LineChart,
    Line,
    AreaChart,
    Area,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    ReferenceLine,
} from 'recharts';
import type { FlightAnalysisReport, FlightChartData } from '@/types/flightAnalysis';
import { formatDuration, formatVerticalSpeed } from '@/types/flightAnalysis';

interface PostFlightDebriefingProps {
    flightId: string;
    report: FlightAnalysisReport;
    chartData: FlightChartData;
    onClose: () => void;
}

export default function PostFlightDebriefing({
    flightId,
    report,
    chartData,
    onClose,
}: PostFlightDebriefingProps) {
    const [activeTab, setActiveTab] = useState<'overview' | 'landing' | 'fuel' | 'path' | 'phases' | 'replay'>('overview');

    return (
        <div className="fixed inset-0 bg-panel/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-3xl font-bold mb-2">Post-Flight Debriefing</h2>
                            <p className="text-blue-100">
                                {report.flight_number} • {report.departure} → {report.arrival}
                            </p>
                            <p className="text-sm text-blue-200 mt-1">
                                {report.aircraft} • {formatDuration(report.flight_duration)}
                            </p>
                        </div>
                        <div className="text-right">
                            <div className="text-5xl font-bold mb-1">{report.performance.flight_score.toFixed(0)}</div>
                            <div className="text-xl font-semibold">{report.performance.flight_grade}</div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="border-b bg-gray-50">
                    <div className="flex overflow-x-auto">
                        {[
                            { id: 'overview', label: '📊 Overview', icon: '📊' },
                            { id: 'landing', label: '🛬 Landing', icon: '🛬' },
                            { id: 'fuel', label: '⛽ Fuel', icon: '⛽' },
                            { id: 'path', label: '🗺️ Path', icon: '🗺️' },
                            { id: 'phases', label: '📈 Phases', icon: '📈' },
                            { id: 'replay', label: '▶️ Replay', icon: '▶️' },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`px-6 py-3 font-medium transition-colors whitespace-nowrap ${
                                    activeTab === tab.id
                                        ? 'border-b-2 border-blue-600 text-blue-600 bg-white'
                                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {activeTab === 'overview' && <OverviewTab report={report} chartData={chartData} />}
                    {activeTab === 'landing' && <LandingTab report={report} chartData={chartData} />}
                    {activeTab === 'fuel' && <FuelTab report={report} chartData={chartData} />}
                    {activeTab === 'path' && <PathTab report={report} />}
                    {activeTab === 'phases' && <PhasesTab report={report} />}
                    {activeTab === 'replay' && <ReplayTab flightId={flightId} />}
                </div>

                {/* Footer */}
                <div className="border-t p-4 bg-gray-50 flex justify-between items-center">
                    <div className="text-sm text-gray-600">
                        Generated {new Date(report.generated_at).toLocaleString()}
                    </div>
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

// ============================================================================
// OVERVIEW TAB
// ============================================================================

function OverviewTab({ report, chartData }: { report: FlightAnalysisReport; chartData: FlightChartData }) {
    return (
        <div className="space-y-6">
            {/* Score Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <ScoreCard
                    label="Landing"
                    score={report.performance.landing_score}
                    icon="🛬"
                    color="blue"
                />
                <ScoreCard
                    label="Fuel Efficiency"
                    score={report.performance.fuel_efficiency_score}
                    icon="⛽"
                    color="green"
                />
                <ScoreCard
                    label="Route Adherence"
                    score={report.performance.route_adherence_score}
                    icon="🗺️"
                    color="purple"
                />
                <ScoreCard
                    label="Smoothness"
                    score={report.performance.smoothness_score}
                    icon="✨"
                    color="pink"
                />
                <ScoreCard
                    label="Autopilot Usage"
                    score={report.performance.autopilot_usage_score}
                    icon="🤖"
                    color="indigo"
                />
            </div>

            {/* Altitude Profile */}
            <div className="bg-white rounded-lg border p-6">
                <h3 className="text-lg font-semibold mb-4">Altitude Profile</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={chartData.altitude_chart.time.map((t, i) => ({
                        time: t / 60,
                        altitude: chartData.altitude_chart.altitude[i],
                    }))}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" label={{ value: 'Time (minutes)', position: 'insideBottom', offset: -5 }} />
                        <YAxis label={{ value: 'Altitude (ft)', angle: -90, position: 'insideLeft' }} />
                        <Tooltip />
                        <Area type="monotone" dataKey="altitude" stroke="#3b82f6" fill="#93c5fd" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Speed Profile */}
            <div className="bg-white rounded-lg border p-6">
                <h3 className="text-lg font-semibold mb-4">Speed Profile</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData.speed_chart.time.map((t, i) => ({
                        time: t / 60,
                        ias: chartData.speed_chart.indicated_airspeed[i],
                        gs: chartData.speed_chart.ground_speed[i],
                    }))}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" label={{ value: 'Time (minutes)', position: 'insideBottom', offset: -5 }} />
                        <YAxis label={{ value: 'Speed (knots)', angle: -90, position: 'insideLeft' }} />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="ias" stroke="#3b82f6" name="IAS" dot={false} />
                        <Line type="monotone" dataKey="gs" stroke="#10b981" name="Ground Speed" dot={false} />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Strengths & Improvements */}
            <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-green-900 mb-4">✅ Strengths</h3>
                    <ul className="space-y-2">
                        {report.strengths.map((strength, i) => (
                            <li key={i} className="flex items-start">
                                <span className="text-green-600 mr-2">•</span>
                                <span className="text-green-800">{strength}</span>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-orange-900 mb-4">📈 Areas for Improvement</h3>
                    <ul className="space-y-2">
                        {report.areas_for_improvement.map((area, i) => (
                            <li key={i} className="flex items-start">
                                <span className="text-orange-600 mr-2">•</span>
                                <span className="text-orange-800">{area}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}

// ============================================================================
// LANDING TAB
// ============================================================================

function LandingTab({ report, chartData }: { report: FlightAnalysisReport; chartData: FlightChartData }) {
    const landing = report.landing;

    return (
        <div className="space-y-6">
            {/* Landing Grade */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-8 text-center">
                <div className="text-6xl mb-4">{getLandingEmoji(landing.touchdown_rate)}</div>
                <div className="text-4xl font-bold mb-2">{landing.landing_grade}</div>
                <div className="text-2xl">{landing.touchdown_rate.toFixed(0)} fpm</div>
            </div>

            {/* Landing Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <MetricCard label="Touchdown Rate" value={`${landing.touchdown_rate.toFixed(0)} fpm`} />
                <MetricCard label="Touchdown Speed" value={`${landing.touchdown_speed.toFixed(0)} kts`} />
                <MetricCard label="G-Force" value={landing.touchdown_g_force.toFixed(2)} />
                <MetricCard label="Bank Angle" value={`${landing.touchdown_bank.toFixed(1)}°`} />
            </div>

            {/* Score Breakdown */}
            <div className="bg-white rounded-lg border p-6">
                <h3 className="text-lg font-semibold mb-4">Score Breakdown</h3>
                <div className="space-y-4">
                    <ScoreBar label="Landing Rate" score={landing.rate_score} />
                    <ScoreBar label="Speed Control" score={landing.speed_score} />
                    <ScoreBar label="Alignment" score={landing.alignment_score} />
                    <ScoreBar label="Smoothness" score={landing.smoothness_score} />
                </div>
            </div>

            {/* Vertical Speed Chart */}
            <div className="bg-white rounded-lg border p-6">
                <h3 className="text-lg font-semibold mb-4">Vertical Speed (Final Approach)</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData.vertical_speed_chart.time.slice(-180).map((t, i) => ({
                        time: t / 60,
                        vs: chartData.vertical_speed_chart.vertical_speed[chartData.vertical_speed_chart.vertical_speed.length - 180 + i],
                    }))}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" label={{ value: 'Time (minutes)', position: 'insideBottom', offset: -5 }} />
                        <YAxis label={{ value: 'Vertical Speed (fpm)', angle: -90, position: 'insideLeft' }} />
                        <Tooltip />
                        <ReferenceLine y={-700} stroke="red" strokeDasharray="3 3" label="Target" />
                        <Line type="monotone" dataKey="vs" stroke="#ef4444" dot={false} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

// ============================================================================
// FUEL TAB
// ============================================================================

function FuelTab({ report, chartData }: { report: FlightAnalysisReport; chartData: FlightChartData }) {
    const fuel = report.fuel_efficiency;

    return (
        <div className="space-y-6">
            {/* Efficiency Grade */}
            <div className={`rounded-lg p-8 text-center text-white ${getEfficiencyColor(fuel.efficiency_grade)}`}>
                <div className="text-6xl mb-4">⛽</div>
                <div className="text-4xl font-bold mb-2">{fuel.efficiency_grade}</div>
                <div className="text-2xl">{fuel.efficiency_score.toFixed(0)}/100</div>
            </div>

            {/* Fuel Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <MetricCard label="Total Used" value={`${fuel.total_fuel_used.toFixed(0)} gal`} />
                <MetricCard label="Per NM" value={`${fuel.fuel_per_nm.toFixed(2)} gal/nm`} />
                <MetricCard label="Per Hour" value={`${fuel.fuel_per_hour.toFixed(0)} gal/hr`} />
                <MetricCard
                    label="Savings"
                    value={`${fuel.fuel_savings > 0 ? '+' : ''}${fuel.fuel_savings.toFixed(0)} gal`}
                    valueColor={fuel.fuel_savings > 0 ? 'text-green-600' : 'text-red-600'}
                />
            </div>

            {/* Phase Breakdown */}
            <div className="bg-white rounded-lg border p-6">
                <h3 className="text-lg font-semibold mb-4">Fuel Usage by Phase</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={fuel.phase_breakdown}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="phase" />
                        <YAxis label={{ value: 'Fuel Used (gal)', angle: -90, position: 'insideLeft' }} />
                        <Tooltip />
                        <Bar dataKey="fuel_used" fill="#10b981" />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Fuel Flow Chart */}
            <div className="bg-white rounded-lg border p-6">
                <h3 className="text-lg font-semibold mb-4">Fuel Flow Over Time</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={fuel.fuel_flow_data.map(d => ({
                        time: d.timestamp / 60,
                        flow: d.fuel_flow,
                        remaining: d.fuel_remaining,
                    }))}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" label={{ value: 'Time (minutes)', position: 'insideBottom', offset: -5 }} />
                        <YAxis yAxisId="left" label={{ value: 'Fuel Flow (gal/hr)', angle: -90, position: 'insideLeft' }} />
                        <YAxis yAxisId="right" orientation="right" label={{ value: 'Remaining (gal)', angle: 90, position: 'insideRight' }} />
                        <Tooltip />
                        <Legend />
                        <Line yAxisId="left" type="monotone" dataKey="flow" stroke="#3b82f6" name="Flow" dot={false} />
                        <Line yAxisId="right" type="monotone" dataKey="remaining" stroke="#10b981" name="Remaining" dot={false} />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Recommendations */}
            {fuel.recommendations.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-blue-900 mb-4">💡 Recommendations</h3>
                    <ul className="space-y-2">
                        {fuel.recommendations.map((rec, i) => (
                            <li key={i} className="flex items-start">
                                <span className="text-blue-600 mr-2">•</span>
                                <span className="text-blue-800">{rec}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

// ============================================================================
// PATH TAB
// ============================================================================

function PathTab({ report }: { report: FlightAnalysisReport }) {
    const path = report.flight_path;

    return (
        <div className="space-y-6">
            {/* Route Efficiency */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg p-8 text-center">
                <div className="text-6xl mb-4">🗺️</div>
                <div className="text-4xl font-bold mb-2">{path.route_efficiency.toFixed(1)}%</div>
                <div className="text-xl">Route Efficiency</div>
            </div>

            {/* Path Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <MetricCard label="Planned Distance" value={`${path.planned_distance.toFixed(0)} NM`} />
                <MetricCard label="Actual Distance" value={`${path.actual_distance.toFixed(0)} NM`} />
                <MetricCard label="Direct Distance" value={`${path.direct_distance.toFixed(0)} NM`} />
                <MetricCard label="Deviation" value={`${path.distance_deviation.toFixed(0)} NM`} />
            </div>

            {/* Cross-Track Error */}
            <div className="grid md:grid-cols-2 gap-4">
                <MetricCard label="Max Cross-Track Error" value={`${path.max_cross_track_error.toFixed(2)} NM`} />
                <MetricCard label="Avg Cross-Track Error" value={`${path.avg_cross_track_error.toFixed(2)} NM`} />
            </div>

            {/* Map would go here */}
            <div className="bg-white rounded-lg border p-6">
                <h3 className="text-lg font-semibold mb-4">Flight Path Map</h3>
                <div className="bg-gray-100 rounded-lg h-96 flex items-center justify-center text-gray-500">
                    Map visualization would be rendered here using Leaflet/MapboxGL
                </div>
            </div>
        </div>
    );
}

// ============================================================================
// PHASES TAB
// ============================================================================

function PhasesTab({ report }: { report: FlightAnalysisReport }) {
    return (
        <div className="space-y-6">
            {report.phase_breakdown.map((phase, i) => (
                <div key={i} className="bg-white rounded-lg border p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-semibold capitalize">{phase.phase.replace('_', ' ')}</h3>
                        <div className="text-2xl font-bold text-blue-600">{phase.phase_score.toFixed(0)}/100</div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <MetricCard label="Duration" value={formatDuration(phase.duration)} />
                        <MetricCard label="Avg Altitude" value={`${phase.avg_altitude.toFixed(0)} ft`} />
                        <MetricCard label="Avg Speed" value={`${phase.avg_speed.toFixed(0)} kts`} />
                        <MetricCard label="Fuel Used" value={`${phase.fuel_used.toFixed(0)} gal`} />
                        <MetricCard label="Max G-Force" value={phase.max_g_force.toFixed(2)} />
                        <MetricCard label="Autopilot" value={`${phase.autopilot_percentage.toFixed(0)}%`} />
                    </div>
                </div>
            ))}
        </div>
    );
}

// ============================================================================
// REPLAY TAB
// ============================================================================

function ReplayTab({ flightId }: { flightId: string }) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);
    const [currentTime, setCurrentTime] = useState(0);

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-lg border p-6">
                <h3 className="text-lg font-semibold mb-4">Flight Path Replay</h3>
                <div className="bg-gray-100 rounded-lg h-96 flex items-center justify-center text-gray-500 mb-4">
                    3D Flight Path Replay would be rendered here
                </div>
                
                {/* Playback Controls */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        {isPlaying ? '⏸️ Pause' : '▶️ Play'}
                    </button>
                    <select
                        value={playbackSpeed}
                        onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
                        className="px-3 py-2 border rounded-lg"
                    >
                        <option value={0.5}>0.5x</option>
                        <option value={1}>1x</option>
                        <option value={2}>2x</option>
                        <option value={5}>5x</option>
                        <option value={10}>10x</option>
                    </select>
                    <input
                        type="range"
                        min={0}
                        max={100}
                        value={currentTime}
                        onChange={(e) => setCurrentTime(Number(e.target.value))}
                        className="flex-1"
                    />
                    <span className="text-sm text-gray-600">{currentTime}%</span>
                </div>
            </div>
        </div>
    );
}

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

function ScoreCard({ label, score, icon, color }: { label: string; score: number; icon: string; color: string }) {
    const colorClasses = {
        blue: 'from-blue-500 to-blue-600',
        green: 'from-green-500 to-green-600',
        purple: 'from-purple-500 to-purple-600',
        pink: 'from-pink-500 to-pink-600',
        indigo: 'from-indigo-500 to-indigo-600',
    };

    return (
        <div className={`bg-gradient-to-br ${colorClasses[color as keyof typeof colorClasses]} text-white rounded-lg p-4 text-center`}>
            <div className="text-3xl mb-2">{icon}</div>
            <div className="text-2xl font-bold mb-1">{score.toFixed(0)}</div>
            <div className="text-sm opacity-90">{label}</div>
        </div>
    );
}

function MetricCard({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
    return (
        <div className="bg-gray-50 rounded-lg p-4 border">
            <div className="text-sm text-gray-600 mb-1">{label}</div>
            <div className={`text-xl font-semibold ${valueColor || 'text-gray-900'}`}>{value}</div>
        </div>
    );
}

function ScoreBar({ label, score }: { label: string; score: number }) {
    const getColor = (s: number) => {
        if (s >= 90) return 'bg-green-500';
        if (s >= 70) return 'bg-blue-500';
        if (s >= 50) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    return (
        <div>
            <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">{label}</span>
                <span className="text-sm font-semibold">{score.toFixed(0)}/100</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                    className={`h-3 rounded-full transition-all ${getColor(score)}`}
                    style={{ width: `${score}%` }}
                />
            </div>
        </div>
    );
}

function getLandingEmoji(rate: number): string {
    const absRate = Math.abs(rate);
    if (absRate <= 50) return '🌟';
    if (absRate <= 100) return '✨';
    if (absRate <= 200) return '👍';
    if (absRate <= 400) return '👌';
    if (absRate <= 600) return '⚠️';
    return '💥';
}

function getEfficiencyColor(grade: string): string {
    const colors = {
        Excellent: 'bg-gradient-to-r from-green-500 to-green-600',
        Good: 'bg-gradient-to-r from-blue-500 to-blue-600',
        Average: 'bg-gradient-to-r from-yellow-500 to-yellow-600',
        Poor: 'bg-gradient-to-r from-red-500 to-red-600',
    };
    return colors[grade as keyof typeof colors] || colors.Average;
}
