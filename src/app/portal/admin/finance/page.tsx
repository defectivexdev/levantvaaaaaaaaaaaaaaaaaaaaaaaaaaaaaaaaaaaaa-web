'use client';

import { useState, useEffect } from 'react';
import { Landmark, ArrowUpRight, ArrowDownRight, ArrowRightLeft, Search, Plus, Minus, Gift, History, Loader2, AlertTriangle, X } from 'lucide-react';
import { toast } from 'sonner';

interface FinanceLog {
    _id: string;
    type: string;
    amount: number;
    description: string;
    created_at: string;
    pilot_id?: {
        first_name: string;
        last_name: string;
        pilot_id: string;
    };
}

interface VaultStats {
    balance: number;
    total_revenue: number;
    total_expenses: number;
}

export default function AdminFinancePage() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<VaultStats | null>(null);
    const [logs, setLogs] = useState<FinanceLog[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [includeFlights, setIncludeFlights] = useState(false);

    // Modals state
    const [activeModal, setActiveModal] = useState<'deposit' | 'withdraw' | 'bonus' | 'purchaseFuel' | 'purchaseCatering' | null>(null);
    const [amount, setAmount] = useState('');
    const [reason, setReason] = useState('');
    const [pilotId, setPilotId] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchFinanceData();
    }, [page, includeFlights]);

    const fetchFinanceData = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/finance?page=${page}&limit=20&includeFlights=${includeFlights}`);
            const data = await res.json();
            if (res.ok) {
                setStats(data.finance);
                setLogs(data.logs);
                setTotalPages(data.pagination?.pages || 1);
            }
        } catch (error) {
            console.error('Failed to fetch finance data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async () => {
        if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
            setError('Please enter a valid positive amount.');
            return;
        }

        if (activeModal === 'bonus' && !pilotId) {
            setError('Pilot ID is required for a bonus.');
            return;
        }

        setSubmitting(true);
        setError('');

        try {
            const isPurchase = activeModal === 'purchaseFuel' || activeModal === 'purchaseCatering';
            const actionType = isPurchase ? 'purchase' : activeModal;
            const itemType = activeModal === 'purchaseFuel' ? 'fuel' : activeModal === 'purchaseCatering' ? 'catering' : undefined;

            const res = await fetch('/api/admin/finance/actions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: actionType,
                    amount: Number(amount),
                    reason,
                    item: itemType,
                    pilotId: activeModal === 'bonus' ? pilotId.toUpperCase() : undefined
                })
            });

            const data = await res.json();

            if (res.ok) {
                toast.success(`Transaction successful!`);
                closeModal();
                fetchFinanceData();
            } else {
                setError(data.error || 'Transaction failed');
            }
        } catch (error) {
            setError('An unexpected error occurred');
        } finally {
            setSubmitting(false);
        }
    };

    const closeModal = () => {
        setActiveModal(null);
        setAmount('');
        setReason('');
        setPilotId('');
        setError('');
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Landmark className="text-cyan-400 w-8 h-8" />
                        Airline Vault
                    </h1>
                    <p className="text-gray-500 text-xs mt-0.5">Manage airline finances and view transaction history</p>
                </div>

                <div className="flex flex-wrap gap-2">
                    <button 
                        onClick={() => setActiveModal('deposit')}
                        className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors"
                    >
                        <Plus className="w-4 h-4" /> Deposit
                    </button>
                    <button 
                        onClick={() => setActiveModal('withdraw')}
                        className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors"
                    >
                        <Minus className="w-4 h-4" /> Withdraw
                    </button>
                    <button 
                        onClick={() => setActiveModal('bonus')}
                        className="px-4 py-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors"
                    >
                        <Gift className="w-4 h-4" /> Pilot Bonus
                    </button>
                    <div className="w-px h-8 bg-white/10 hidden md:block mx-1"></div>
                    <button 
                        onClick={() => setActiveModal('purchaseFuel')}
                        className="px-4 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors"
                    >
                        Buy Fuel
                    </button>
                    <button 
                        onClick={() => setActiveModal('purchaseCatering')}
                        className="px-4 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors"
                    >
                        Buy Catering
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[#0a0a0a] border border-white/[0.06] rounded-2xl p-6 relative overflow-hidden">
                    <div className="absolute -bottom-4 -right-4 opacity-5">
                        <Landmark className="w-32 h-32" />
                    </div>
                    <div className="relative">
                        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Total Vault Balance</div>
                        <div className="text-4xl font-black text-cyan-400 font-mono">
                            {loading ? '...' : stats?.balance?.toLocaleString() || '0'} <span className="text-xl text-cyan-500/50">Cr</span>
                        </div>
                    </div>
                </div>

                <div className="bg-[#0a0a0a] border border-white/[0.06] rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-2">
                        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Total Income</div>
                        <ArrowDownRight className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div className="text-2xl font-bold text-emerald-400 font-mono">
                        {loading ? '...' : stats?.total_revenue?.toLocaleString() || '0'} Cr
                    </div>
                </div>

                <div className="bg-[#0a0a0a] border border-white/[0.06] rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-2">
                        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Total Expenses</div>
                        <ArrowUpRight className="w-4 h-4 text-red-400" />
                    </div>
                    <div className="text-2xl font-bold text-red-400 font-mono">
                        {loading ? '...' : stats?.total_expenses?.toLocaleString() || '0'} Cr
                    </div>
                </div>
            </div>

            {/* Transaction Logs */}
            <div className="bg-[#0a0a0a] border border-white/[0.06] rounded-2xl overflow-hidden flex flex-col">
                <div className="px-5 py-4 border-b border-white/[0.04] flex flex-wrap items-center justify-between gap-4 bg-white/[0.02]">
                    <div className="flex items-center gap-2">
                        <History className="w-5 h-5 text-gray-400" />
                        <h2 className="font-bold text-white">Transaction Logs</h2>
                    </div>
                    <label className="flex items-center gap-2 text-sm cursor-pointer group">
                        <div className="relative inline-block w-10 h-5 align-middle select-none transition duration-200 ease-in">
                            <input type="checkbox" className="absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer checked:right-0 checked:border-cyan-500 transition-all z-10 opacity-0" 
                                checked={includeFlights} onChange={(e) => { setIncludeFlights(e.target.checked); setPage(1); }} />
                            <div className={`block h-5 rounded-full transition-colors ${includeFlights ? 'bg-cyan-500' : 'bg-gray-600'}`}></div>
                            <div className={`absolute left-0.5 top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${includeFlights ? 'translate-x-5' : ''}`}></div>
                        </div>
                        <span className="text-gray-400 group-hover:text-white transition-colors">Include Internal Flight Splits</span>
                    </label>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-white/[0.04] text-gray-500 text-left text-xs uppercase tracking-wider">
                                <th className="px-5 py-3 font-medium">Date</th>
                                <th className="px-5 py-3 font-medium">Type</th>
                                <th className="px-5 py-3 font-medium">Description / Associated Pilot</th>
                                <th className="px-5 py-3 font-medium text-right">Amount (Cr)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.02]">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="py-12 text-center">
                                        <Loader2 className="w-8 h-8 animate-spin text-cyan-400 mx-auto" />
                                    </td>
                                </tr>
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="py-12 text-center text-gray-500">
                                        No transactions found.
                                    </td>
                                </tr>
                            ) : (
                                logs.map((log) => (
                                    <tr key={log._id} className="hover:bg-white/[0.02] transition-colors">
                                        <td className="px-5 py-3 text-gray-400 whitespace-nowrap">
                                            {new Date(log.created_at).toLocaleString()}
                                        </td>
                                        <td className="px-5 py-3">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-white/5 border border-white/10 text-gray-300">
                                                {log.type}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3">
                                            <div className="text-white text-sm">{log.description}</div>
                                            {log.pilot_id && (
                                                <div className="text-xs text-gray-500 font-mono mt-0.5">
                                                    Pilot: {log.pilot_id.first_name} {log.pilot_id.last_name} ({log.pilot_id.pilot_id})
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-5 py-3 text-right whitespace-nowrap">
                                            <span className={`font-bold font-mono ${log.amount > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                                {log.amount > 0 ? '+' : ''}{log.amount.toLocaleString()}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 && (
                    <div className="px-5 py-3 border-t border-white/[0.04] flex items-center justify-between bg-white/[0.01]">
                        <button 
                            disabled={page === 1}
                            onClick={() => setPage(p => p - 1)}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white/5 hover:bg-white/10 text-white transition-colors disabled:opacity-30"
                        >
                            Previous
                        </button>
                        <span className="text-xs text-gray-500">Page {page} of {totalPages}</span>
                        <button 
                            disabled={page === totalPages}
                            onClick={() => setPage(p => p + 1)}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white/5 hover:bg-white/10 text-white transition-colors disabled:opacity-30"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>

            {/* Action Modals */}
            {activeModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-[#0c0c0c] border-2 border-white/[0.08] rounded-2xl w-full max-w-md shadow-2xl">
                        <div className="p-5 border-b border-white/[0.06] flex justify-between items-center bg-white/[0.02]">
                            <h2 className="text-white font-bold flex items-center gap-2">
                                {activeModal === 'deposit' && <Plus className="w-5 h-5 text-emerald-400" />}
                                {(activeModal === 'withdraw' || activeModal?.startsWith('purchase')) && <Minus className="w-5 h-5 text-red-400" />}
                                {activeModal === 'bonus' && <Gift className="w-5 h-5 text-purple-400" />}
                                {
                                    activeModal === 'deposit' ? 'Deposit Funds' : 
                                    activeModal === 'withdraw' ? 'Withdraw Funds' : 
                                    activeModal === 'purchaseFuel' ? 'Purchase Jet A1 Fuel' :
                                    activeModal === 'purchaseCatering' ? 'Purchase Catering' :
                                    'Award Pilot Bonus'
                                }
                            </h2>
                            <button onClick={closeModal} className="text-gray-500 hover:text-white transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <div className="p-6 space-y-4">
                            {error && (
                                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-red-400 text-sm">
                                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                                    {error}
                                </div>
                            )}

                            {activeModal === 'bonus' && (
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Pilot ID</label>
                                    <input 
                                        type="text" 
                                        value={pilotId} 
                                        onChange={(e) => setPilotId(e.target.value)}
                                        placeholder="e.g. LVT1234"
                                        className="w-full bg-black/40 border border-white/[0.08] rounded-xl px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 transition-colors uppercase font-mono"
                                    />
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Amount (Cr)</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">Cr</span>
                                    <input 
                                        type="number" 
                                        min="1"
                                        value={amount} 
                                        onChange={(e) => setAmount(e.target.value)}
                                        placeholder="0"
                                        className="w-full bg-black/40 border border-white/[0.08] rounded-xl pl-10 pr-4 py-2.5 text-white font-mono font-bold focus:outline-none focus:border-cyan-500/50 transition-colors"
                                    />
                                </div>
                                {(activeModal === 'withdraw' || activeModal?.startsWith('purchase') || activeModal === 'bonus') && (
                                    <p className="text-[10px] text-gray-500 mt-1">Available: {stats?.balance?.toLocaleString() || 0} Cr</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Reason / Description</label>
                                <input 
                                    type="text" 
                                    value={reason} 
                                    onChange={(e) => setReason(e.target.value)}
                                    placeholder={
                                        activeModal === 'bonus' ? "e.g. Event participation" : 
                                        activeModal === 'purchaseFuel' ? "e.g. 1000 lbs Jet A1" :
                                        activeModal === 'purchaseCatering' ? "e.g. 100 meal sets" :
                                        "Optional description"
                                    }
                                    className="w-full bg-black/40 border border-white/[0.08] rounded-xl px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 transition-colors"
                                />
                            </div>
                        </div>

                        <div className="p-5 bg-white/[0.02] border-t border-white/[0.06] flex justify-end gap-3">
                            <button 
                                onClick={closeModal}
                                className="px-4 py-2 text-sm font-bold text-gray-400 hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleAction}
                                disabled={submitting}
                                className={`px-6 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${
                                    activeModal === 'deposit' ? 'bg-emerald-500 text-white hover:bg-emerald-600' :
                                    activeModal === 'withdraw' ? 'bg-red-500 text-white hover:bg-red-600' :
                                    activeModal?.startsWith('purchase') ? 'bg-amber-500 text-white hover:bg-amber-600' :
                                    'bg-purple-500 text-white hover:bg-purple-600'
                                } disabled:opacity-50`}
                            >
                                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                Confirm {
                                    activeModal === 'deposit' ? 'Deposit' : 
                                    activeModal === 'withdraw' ? 'Withdrawal' : 
                                    activeModal?.startsWith('purchase') ? 'Purchase' :
                                    'Bonus'
                                }
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
