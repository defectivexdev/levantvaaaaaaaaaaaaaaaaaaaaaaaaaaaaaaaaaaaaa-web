/**
 * Flight Analysis Button Component
 * Trigger to view post-flight debriefing from PIREP pages
 */

'use client';

import { useState } from 'react';
import PostFlightDebriefing from './PostFlightDebriefing';
import type { FlightAnalysisReport, FlightChartData } from '@/types/flightAnalysis';

interface FlightAnalysisButtonProps {
    flightId: string;
    variant?: 'primary' | 'secondary' | 'outline';
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export default function FlightAnalysisButton({
    flightId,
    variant = 'primary',
    size = 'md',
    className = '',
}: FlightAnalysisButtonProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [showDebriefing, setShowDebriefing] = useState(false);
    const [report, setReport] = useState<FlightAnalysisReport | null>(null);
    const [chartData, setChartData] = useState<FlightChartData | null>(null);
    const [error, setError] = useState<string | null>(null);

    const loadAnalysis = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/flight-analysis/${flightId}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to load flight analysis');
            }

            setReport(data.report);
            setChartData(data.chartData);
            setShowDebriefing(true);
        } catch (err: any) {
            console.error('Error loading flight analysis:', err);
            setError(err.message);
            alert(`Error: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const variantClasses = {
        primary: 'bg-blue-600 hover:bg-blue-700 text-white',
        secondary: 'bg-gray-600 hover:bg-gray-700 text-white',
        outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50',
    };

    const sizeClasses = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-6 py-3 text-lg',
    };

    return (
        <>
            <button
                onClick={loadAnalysis}
                disabled={isLoading}
                className={`
                    ${variantClasses[variant]}
                    ${sizeClasses[size]}
                    ${className}
                    rounded-lg font-medium transition-colors
                    disabled:opacity-50 disabled:cursor-not-allowed
                    flex items-center gap-2
                `}
            >
                {isLoading ? (
                    <>
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                            <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                                fill="none"
                            />
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                        </svg>
                        <span>Loading Analysis...</span>
                    </>
                ) : (
                    <>
                        <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                            />
                        </svg>
                        <span>View Flight Analysis</span>
                    </>
                )}
            </button>

            {showDebriefing && report && chartData && (
                <PostFlightDebriefing
                    flightId={flightId}
                    report={report}
                    chartData={chartData}
                    onClose={() => setShowDebriefing(false)}
                />
            )}
        </>
    );
}
