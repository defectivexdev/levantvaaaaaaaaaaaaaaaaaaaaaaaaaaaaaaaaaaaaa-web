'use client';

import { useState, useEffect } from 'react';
import { Save, Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import SettingsTabs from '@/components/admin/SettingsTabs';
import RankPayConfiguration from '@/components/admin/RankPayConfiguration';

interface GlobalConfigData {
    fuel_tax_percent: number;
    penalty_multiplier: number;
    ticket_price_per_nm: number;
    cargo_price_per_lb_nm: number;
    fuel_price_per_lb: number;
    base_landing_fee: number;
    rank_pay_rates: {
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
    };
    hard_landing_threshold: number;
    severe_damage_threshold: number;
    overspeed_damage_per_10s: number;
    gforce_high_threshold: number;
    gforce_low_threshold: number;
    grounded_health_threshold: number;
    store_to_airline_percent: number;
    cr_base_flight: number;
    cr_greaser_bonus: number;
    cr_firm_bonus: number;
    cr_hard_landing_penalty: number;
    cr_on_time_bonus: number;
    cr_fuel_efficiency_bonus: number;
    cr_first_flight_multiplier: number;
    cr_hub_to_hub_bonus: number;
    cr_event_multiplier: number;
    cr_long_haul_4h: number;
    cr_long_haul_8h: number;
    cr_new_route_bonus: number;
    cr_taxi_speed_penalty: number;
    cr_light_violation_penalty: number;
    cr_overspeed_penalty: number;
    cr_taxi_speed_limit: number;
    cr_group_flight_participation: number;
    location_based_fleet: boolean;
}

export default function AdminSettingsPage() {
    const [activeTab, setActiveTab] = useState('general');
    const [config, setConfig] = useState<GlobalConfigData | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        try {
            const res = await fetch('/api/admin/settings');
            if (!res.ok) throw new Error('Failed to fetch settings');
            const data = await res.json();
            setConfig(data.config);
        } catch (error) {
            toast.error('Failed to load settings');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const saveConfig = async (updates: Partial<GlobalConfigData>) => {
        setSaving(true);
        try {
            const res = await fetch('/api/admin/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...config, ...updates }),
            });

            if (!res.ok) throw new Error('Failed to save settings');
            
            const data = await res.json();
            setConfig(data.config);
            toast.success('Settings saved successfully');
        } catch (error) {
            toast.error('Failed to save settings');
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    const handleRankPaySave = async (rates: any) => {
        await saveConfig({ rank_pay_rates: rates });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (!config) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <p className="text-gray-600 dark:text-gray-400 mb-4">Failed to load configuration</p>
                    <button
                        onClick={fetchConfig}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        <RefreshCw className="w-4 h-4 inline mr-2" />
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Airline Settings</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                        Configure your virtual airline settings and parameters
                    </p>
                </div>

                <SettingsTabs activeTab={activeTab} onTabChange={setActiveTab} />

                {activeTab === 'general' && (
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">General Settings</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Airline name, logo, ICAO/IATA codes, and timezone configuration will be added here.
                            </p>
                        </div>
                    </div>
                )}

                {activeTab === 'pilot' && (
                    <div className="space-y-6">
                        <RankPayConfiguration
                            initialRates={config.rank_pay_rates}
                            onSave={handleRankPaySave}
                        />
                    </div>
                )}

                {activeTab === 'flight' && (
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Flight System</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Hard Landing Threshold (fpm)
                                    </label>
                                    <input
                                        type="number"
                                        value={config.hard_landing_threshold}
                                        onChange={(e) => setConfig({ ...config, hard_landing_threshold: parseFloat(e.target.value) })}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Severe Damage Threshold (fpm)
                                    </label>
                                    <input
                                        type="number"
                                        value={config.severe_damage_threshold}
                                        onChange={(e) => setConfig({ ...config, severe_damage_threshold: parseFloat(e.target.value) })}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    />
                                </div>
                            </div>
                            <button
                                onClick={() => saveConfig(config)}
                                disabled={saving}
                                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                            >
                                <Save className="w-4 h-4 inline mr-2" />
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === 'economy' && (
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Economy & Credits</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Base Flight Credits
                                    </label>
                                    <input
                                        type="number"
                                        value={config.cr_base_flight}
                                        onChange={(e) => setConfig({ ...config, cr_base_flight: parseFloat(e.target.value) })}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Greaser Bonus
                                    </label>
                                    <input
                                        type="number"
                                        value={config.cr_greaser_bonus}
                                        onChange={(e) => setConfig({ ...config, cr_greaser_bonus: parseFloat(e.target.value) })}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Event Multiplier
                                    </label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={config.cr_event_multiplier}
                                        onChange={(e) => setConfig({ ...config, cr_event_multiplier: parseFloat(e.target.value) })}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    />
                                </div>
                            </div>
                            <button
                                onClick={() => saveConfig(config)}
                                disabled={saving}
                                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                            >
                                <Save className="w-4 h-4 inline mr-2" />
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === 'acars' && (
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">ACARS Settings</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                ACARS connection settings and live tracking options will be configured here.
                            </p>
                        </div>
                    </div>
                )}

                {activeTab === 'achievements' && (
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Achievement System</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                                Manage badge achievements and configure thresholds.
                            </p>
                            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                                <p className="text-sm text-green-800 dark:text-green-200">
                                    ✅ Achievement system is active with 40+ badges configured
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
