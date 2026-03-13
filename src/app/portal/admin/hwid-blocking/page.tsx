'use client';

import { useEffect, useState } from 'react';
import { ShieldAlert, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface SecurityState {
    hwidLockEnabled: boolean;
    countryBlockEnabled: boolean;
    blockedCountriesText: string;
}

const defaultState: SecurityState = {
    hwidLockEnabled: true,
    countryBlockEnabled: false,
    blockedCountriesText: '',
};

export default function HwidBlockingPage() {
    const [state, setState] = useState<SecurityState>(defaultState);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const load = async () => {
            try {
                const res = await fetch('/api/admin/security');
                const data = await res.json();
                if (!res.ok || !data.success) {
                    throw new Error(data.error || 'Failed to load security settings');
                }
                const cfg = data.config;
                setState({
                    hwidLockEnabled: cfg.hwid_lock_enabled ?? true,
                    countryBlockEnabled: cfg.country_block_enabled ?? false,
                    blockedCountriesText: (cfg.blocked_login_countries || []).join(', '),
                });
            } catch (err: any) {
                console.error('Load security settings error:', err);
                toast.error(err.message || 'Failed to load security settings');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch('/api/admin/security', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    hwidLockEnabled: state.hwidLockEnabled,
                    countryBlockEnabled: state.countryBlockEnabled,
                    blockedCountries: state.blockedCountriesText,
                }),
            });
            const data = await res.json();
            if (!res.ok || !data.success) {
                throw new Error(data.error || 'Failed to save security settings');
            }
            toast.success('Security settings saved');
        } catch (err: any) {
            console.error('Save security settings error:', err);
            toast.error(err.message || 'Failed to save');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-accent-gold" />
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center">
                    <ShieldAlert className="w-5 h-5 text-rose-400" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-white">Security — HWID & Country Blocking</h1>
                    <p className="text-xs text-gray-500">
                        Control device locking and which countries are allowed to access the portal.
                    </p>
                </div>
            </div>

            <div className="bg-panel backdrop-blur-sm border border-white/5 rounded-2xl p-5 space-y-5">
                <div className="flex items-center gap-3 p-3 rounded-xl border border-white/5 bg-white/[0.01]">
                    <div>
                        <p className="text-xs font-bold text-gray-200">HWID Lock</p>
                        <p className="text-[11px] text-gray-500">
                            When enabled, each pilot account is locked to the first device (HWID) that logs in. New devices are blocked.
                        </p>
                    </div>
                    <button
                        onClick={() => setState(s => ({ ...s, hwidLockEnabled: !s.hwidLockEnabled }))}
                        className={`ml-auto relative w-11 h-6 rounded-full transition-colors ${state.hwidLockEnabled ? 'bg-green-500' : 'bg-gray-700'}`}
                    >
                        <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${state.hwidLockEnabled ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
                    </button>
                    <span className={`text-[10px] font-bold ${state.hwidLockEnabled ? 'text-green-400' : 'text-gray-600'}`}>
                        {state.hwidLockEnabled ? 'ENABLED' : 'DISABLED'}
                    </span>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl border border-white/5 bg-white/[0.01]">
                    <div className="flex-1 space-y-2">
                        <p className="text-xs font-bold text-gray-200">Country Blocking</p>
                        <p className="text-[11px] text-gray-500">
                            When enabled, login from the countries listed below will be blocked according to your security rules
                            (including VPN/DNS detection).
                        </p>
                        <textarea
                            value={state.blockedCountriesText}
                            onChange={e => setState(s => ({ ...s, blockedCountriesText: e.target.value }))}
                            rows={3}
                            className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm font-mono focus:border-rose-500/50 focus:outline-none"
                            placeholder="Example: SY, IR, RU"
                        />
                        <p className="text-[10px] text-gray-600">
                            Use ISO country codes separated by commas or spaces. Example: <span className="text-gray-300">SY, IR, RU</span>
                        </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <button
                            onClick={() => setState(s => ({ ...s, countryBlockEnabled: !s.countryBlockEnabled }))}
                            className={`relative w-11 h-6 rounded-full transition-colors ${state.countryBlockEnabled ? 'bg-rose-500' : 'bg-gray-700'}`}
                        >
                            <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${state.countryBlockEnabled ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
                        </button>
                        <span className={`text-[10px] font-bold ${state.countryBlockEnabled ? 'text-rose-400' : 'text-gray-600'}`}>
                            {state.countryBlockEnabled ? 'BLOCKING ON' : 'BLOCKING OFF'}
                        </span>
                    </div>
                </div>

                <div className="flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className={`px-5 py-2 rounded-xl text-sm font-bold flex items-center gap-2 ${saving ? 'bg-gray-700 text-gray-400' : 'bg-accent-gold hover:bg-amber-400 text-black shadow-lg shadow-accent-gold/20'}`}
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
}

