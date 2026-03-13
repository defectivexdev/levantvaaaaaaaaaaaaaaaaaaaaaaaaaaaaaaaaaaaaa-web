'use client';

import { useState } from 'react';
import { PILOT_RANKS } from '@/config/ranks';
import { Save, DollarSign } from 'lucide-react';

interface RankPayRates {
    cadet: number;
    student_pilot: number;
    amateur_pilot: number;
    private_pilot: number;
    first_officer: number;
    senior_first_officer: number;
    captain: number;
    flight_captain: number;
    senior_flight_captain: number;
    commercial_captain: number;
    instructor: number;
}

interface RankPayConfigurationProps {
    initialRates: RankPayRates;
    onSave: (rates: RankPayRates) => Promise<void>;
}

export default function RankPayConfiguration({ initialRates, onSave }: RankPayConfigurationProps) {
    const [rates, setRates] = useState<RankPayRates>(initialRates);
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        try {
            await onSave(rates);
        } finally {
            setSaving(false);
        }
    };

    const updateRate = (rankId: keyof RankPayRates, value: number) => {
        setRates(prev => ({ ...prev, [rankId]: value }));
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <DollarSign className="w-5 h-5" />
                        Rank Pay Rates (Per Hour)
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Configure hourly pay rate for each pilot rank
                    </p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <Save className="w-4 h-4" />
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {PILOT_RANKS.map((rank) => (
                    <div key={rank.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                                {rank.order}
                            </div>
                            <div className="flex-1">
                                <h4 className="font-medium text-gray-900 dark:text-white">{rank.name}</h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {rank.minHours}–{rank.maxHours === Infinity ? '∞' : rank.maxHours} hours
                                </p>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="text-gray-500 dark:text-gray-400">$</span>
                            </div>
                            <input
                                type="number"
                                value={rates[rank.id as keyof RankPayRates]}
                                onChange={(e) => updateRate(rank.id as keyof RankPayRates, parseFloat(e.target.value) || 0)}
                                className="w-full pl-7 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                step="0.01"
                                min="0"
                            />
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                <span className="text-xs text-gray-400">/hr</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>Note:</strong> These rates are used to calculate pilot pay after each completed flight based on flight hours and current rank.
                </p>
            </div>
        </div>
    );
}
