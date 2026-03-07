/**
 * PIREP Analysis Card Component
 * Display flight analysis summary in PIREP list/detail views
 */

'use client';

import FlightAnalysisButton from './FlightAnalysisButton';

interface PIREPAnalysisCardProps {
    flightId: string;
    flightNumber: string;
    route: string;
    score?: number;
    landingRate?: number;
    fuelEfficiency?: string;
    hasAnalysis?: boolean;
    compact?: boolean;
}

export default function PIREPAnalysisCard({
    flightId,
    flightNumber,
    route,
    score,
    landingRate,
    fuelEfficiency,
    hasAnalysis = false,
    compact = false,
}: PIREPAnalysisCardProps) {
    if (compact) {
        return (
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                <div className="flex items-center gap-3">
                    <div className="text-2xl">📊</div>
                    <div>
                        <div className="font-medium text-sm">Flight Analysis</div>
                        {hasAnalysis && score && (
                            <div className="text-xs text-gray-600">
                                Score: {score.toFixed(0)}/100 • Landing: {landingRate?.toFixed(0)} fpm
                            </div>
                        )}
                    </div>
                </div>
                <FlightAnalysisButton flightId={flightId} size="sm" />
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg border p-6 shadow-sm">
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h3 className="text-lg font-semibold mb-1">Post-Flight Analysis</h3>
                    <p className="text-sm text-gray-600">
                        {flightNumber} • {route}
                    </p>
                </div>
                <div className="text-3xl">📊</div>
            </div>

            {hasAnalysis && score ? (
                <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="bg-blue-50 rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-blue-600">
                            {score.toFixed(0)}
                        </div>
                        <div className="text-xs text-gray-600 mt-1">Overall Score</div>
                    </div>
                    {landingRate !== undefined && (
                        <div className="bg-green-50 rounded-lg p-3 text-center">
                            <div className="text-2xl font-bold text-green-600">
                                {landingRate.toFixed(0)}
                            </div>
                            <div className="text-xs text-gray-600 mt-1">Landing (fpm)</div>
                        </div>
                    )}
                    {fuelEfficiency && (
                        <div className="bg-purple-50 rounded-lg p-3 text-center">
                            <div className="text-2xl font-bold text-purple-600">
                                {fuelEfficiency}
                            </div>
                            <div className="text-xs text-gray-600 mt-1">Fuel Efficiency</div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="bg-gray-50 rounded-lg p-4 mb-4 text-center text-gray-600">
                    <p className="text-sm">
                        Detailed flight analysis available with telemetry data
                    </p>
                </div>
            )}

            <FlightAnalysisButton flightId={flightId} variant="primary" className="w-full" />
        </div>
    );
}
