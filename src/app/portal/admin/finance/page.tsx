'use client';

import { useState, useEffect } from 'react';
import { Landmark, ArrowUpRight, ArrowDownRight, ArrowRightLeft, Search, Plus, Minus, Gift, History, Loader2, AlertTriangle, X, DollarSign, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
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
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">Finance Dashboard</h1>
                    <p className="text-gray-500 text-sm mt-1 flex items-center gap-2">
                        <Landmark size={14} className="text-accent-gold" />
                        Manage airline vault and transaction history
                    </p>
                </div>

                <div className="flex flex-wrap gap-2">
                    <button 
                        onClick={() => setActiveModal('deposit')}
                        className="px-4 py-2.5 bg-gradient-to-r from-emerald-500/10 to-emerald-600/5 hover:from-emerald-500/20 hover:to-emerald-600/10 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20"
                    >
                        <Plus className="w-4 h-4" /> Deposit
                    </button>
                    <button 
                        onClick={() => setActiveModal('withdraw')}
                        className="px-4 py-2.5 bg-gradient-to-r from-red-500/10 to-red-600/5 hover:from-red-500/20 hover:to-red-600/10 text-red-400 border border-red-500/30 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-lg shadow-red-500/10 hover:shadow-red-500/20"
                    >
                        <Minus className="w-4 h-4" /> Withdraw
                    </button>
                    <button 
                        onClick={() => setActiveModal('bonus')}
                        className="px-4 py-2.5 bg-gradient-to-r from-purple-500/10 to-purple-600/5 hover:from-purple-500/20 hover:to-purple-600/10 text-purple-400 border border-purple-500/30 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-lg shadow-purple-500/10 hover:shadow-purple-500/20"
                    >
                        <Gift className="w-4 h-4" /> Pilot Bonus
                    </button>
                    <div className="w-px h-8 bg-white/10 hidden md:block mx-1"></div>
                    <button 
                        onClick={() => setActiveModal('purchaseFuel')}
                        className="px-4 py-2.5 bg-gradient-to-r from-amber-500/10 to-amber-600/5 hover:from-amber-500/20 hover:to-amber-600/10 text-amber-400 border border-amber-500/30 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-lg shadow-amber-500/10 hover:shadow-amber-500/20"
                    >
                        Buy Fuel
                    </button>
                    <button 
                        onClick={() => setActiveModal('purchaseCatering')}
                        className="px-4 py-2.5 bg-gradient-to-r from-amber-500/10 to-amber-600/5 hover:from-amber-500/20 hover:to-amber-600/10 text-amber-400 border border-amber-500/30 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-lg shadow-amber-500/10 hover:shadow-amber-500/20"
                    >
                        Buy Catering
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-[#0a0a0a] to-[#0d0d0d] border border-white/[0.08] rounded-2xl p-6 relative overflow-hidden shadow-2xl shadow-black/30 hover:border-cyan-500/30 transition-all group">
                    <div className="absolute -bottom-4 -right-4 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
                        <Wallet className="w-32 h-32" />
                    </div>
                    <div className="relative">
                        <div className="flex items-center justify-between mb-3">
                            <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Vault Balance</div>
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 flex items-center justify-center border border-cyan-500/30">
                                <Wallet className="w-5 h-5 text-cyan-400" />
                            </div>
                        </div>
                        <div className="text-4xl font-black text-cyan-400 font-mono mb-1">
                            {loading ? '...' : stats?.balance?.toLocaleString() || '0'}
                        </div>
                        <div className="text-xs text-cyan-500/50 font-bold">Credits</div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-[#0a0a0a] to-[#0d0d0d] border border-white/[0.08] rounded-2xl p-6 shadow-2xl shadow-black/30 hover:border-emerald-500/30 transition-all group">
                    <div className="flex items-center justify-between mb-3">
                        <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Total Income</div>
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 flex items-center justify-center border border-emerald-500/30">
                            <TrendingUp className="w-5 h-5 text-emerald-400" />
                        </div>
                    </div>
                    <div className="text-3xl font-black text-emerald-400 font-mono mb-1">
                        {loading ? '...' : stats?.total_revenue?.toLocaleString() || '0'}
                    </div>
                    <div className="text-xs text-emerald-500/50 font-bold">Credits</div>
                </div>

                <div className="bg-gradient-to-br from-[#0a0a0a] to-[#0d0d0d] border border-white/[0.08] rounded-2xl p-6 shadow-2xl shadow-black/30 hover:border-red-500/30 transition-all group">
                    <div className="flex items-center justify-between mb-3">
                        <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Total Expenses</div>
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500/20 to-red-600/10 flex items-center justify-center border border-red-500/30">
                            <TrendingDown className="w-5 h-5 text-red-400" />
                        </div>
                    </div>
                    <div className="text-3xl font-black text-red-400 font-mono mb-1">
                        {loading ? '...' : stats?.total_expenses?.toLocaleString() || '0'}
                    </div>
                    <div className="text-xs text-red-500/50 font-bold">Credits</div>
                </div>
            </div>

            {/* Transaction Logs */}
            <div className="bg-gradient-to-br from-[#0a0a0a] to-[#0d0d0d] border border-white/[0.08] rounded-2xl overflow-hidden flex flex-col shadow-2xl shadow-black/30">
                <div className="px-6 py-4 border-b border-white/[0.06] flex flex-wrap items-center justify-between gap-4 bg-gradient-to-r from-[#0c0c0c] to-[#0a0a0a]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-accent-gold/10 flex items-center justify-center border border-accent-gold/20">
                            <History className="w-5 h-5 text-accent-gold" />
                        </div>
                        <div>
                            <h2 className="font-bold text-white text-lg">Transaction History</h2>
                            <p className="text-xs text-gray-500">All financial activities</p>
                        </div>
                    </div>
                    <label className="flex items-center gap-3 text-sm cursor-pointer group">
                        <div className="relative inline-block w-11 h-6 align-middle select-none transition duration-200 ease-in">
                            <input type="checkbox" className="absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer checked:right-0 checked:border-cyan-500 transition-all z-10 opacity-0" 
                                checked={includeFlights} onChange={(e) => { setIncludeFlights(e.target.checked); setPage(1); }} />
                            <div className={`block h-6 rounded-full transition-colors shadow-inner ${includeFlights ? 'bg-gradient-to-r from-cyan-500 to-cyan-600' : 'bg-gray-700'}`}></div>
                            <div className={`absolute left-0.5 top-0.5 w-5 h-5 rounded-full bg-white shadow-lg transition-transform ${includeFlights ? 'translate-x-5' : ''}`}></div>
                        </div>
                        <span className="text-gray-400 group-hover:text-white transition-colors text-xs font-medium">Include Flight Splits</span>
                    </label>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gradient-to-r from-[#0c0c0c] to-[#0a0a0a] border-b border-white/[0.06]">
                            <tr className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                                <th className="px-6 py-4 text-left">Date & Time</th>
                                <th className="px-6 py-4 text-left">Type</th>
                                <th className="px-6 py-4 text-left">Description</th>
                                <th className="px-6 py-4 text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.04]">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="py-16 text-center">
                                        <Loader2 className="w-10 h-10 animate-spin text-cyan-400 mx-auto mb-3" />
                                        <p className="text-sm text-gray-500 font-medium">Loading transactions...</p>
                                    </td>
                                </tr>
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="py-20 text-center">
                                        <History className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                                        <p className="text-sm font-medium text-gray-500">No transactions found.</p>
                                    </td>
                                </tr>
                            ) : (
                                logs.map((log) => (
                                    <tr key={log._id} className="hover:bg-gradient-to-r hover:from-accent-gold/5 hover:to-transparent transition-all group border-l-2 border-transparent hover:border-accent-gold/30">
                                        <td className="px-6 py-4">
                                            <p className="text-xs text-gray-400 font-mono">{new Date(log.created_at).toLocaleDateString()}</p>
                                            <p className="text-[10px] text-gray-600 font-mono">{new Date(log.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-lg text-[10px] font-bold border ${
                                                log.type.toLowerCase().includes('deposit') || log.type.toLowerCase().includes('revenue') ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
                                                log.type.toLowerCase().includes('withdraw') || log.type.toLowerCase().includes('expense') || log.type.toLowerCase().includes('purchase') ? 'bg-red-500/10 border-red-500/30 text-red-400' :
                                                log.type.toLowerCase().includes('bonus') ? 'bg-purple-500/10 border-purple-500/30 text-purple-400' :
                                                'bg-white/5 border-white/10 text-gray-300'
                                            }`}>
                                                {log.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-white text-sm font-medium group-hover:text-accent-gold transition-colors">{log.description}</div>
                                            {log.pilot_id && (
                                                <div className="text-xs text-gray-500 font-mono mt-1 flex items-center gap-1.5">
                                                    <span className="text-gray-600">Pilot:</span>
                                                    <span>{log.pilot_id.first_name} {log.pilot_id.last_name}</span>
                                                    <span className="text-gray-600">•</span>
                                                    <span className="text-accent-gold/70">{log.pilot_id.pilot_id}</span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className={`inline-flex items-center gap-1.5 font-bold font-mono text-sm ${
                                                log.amount > 0 ? 'text-emerald-400' : 'text-red-400'
                                            }`}>
                                                {log.amount > 0 ? (
                                                    <TrendingUp size={14} className="text-emerald-500" />
                                                ) : (
                                                    <TrendingDown size={14} className="text-red-500" />
                                                )}
                                                {log.amount > 0 ? '+' : ''}{log.amount.toLocaleString()}
                                            </div>
                                            <p className="text-[10px] text-gray-600 mt-0.5">Credits</p>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-white/[0.06] flex items-center justify-between bg-gradient-to-r from-[#0c0c0c] to-[#0a0a0a]">
                        <button 
                            disabled={page === 1}
                            onClick={() => setPage(p => p - 1)}
                            className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-white/5 to-white/[0.02] hover:from-white/10 hover:to-white/5 text-white border border-white/[0.08] transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-lg"
                        >
                            Previous
                        </button>
                        <span className="text-xs text-gray-500 font-mono font-bold">Page {page} of {totalPages}</span>
                        <button 
                            disabled={page === totalPages}
                            onClick={() => setPage(p => p + 1)}
                            className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-white/5 to-white/[0.02] hover:from-white/10 hover:to-white/5 text-white border border-white/[0.08] transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-lg"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>

            {/* Action Modals */}
            {activeModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
                    <div className="bg-gradient-to-br from-[#0a0a0a] to-[#0d0d0d] border border-accent-gold/[0.15] rounded-2xl w-full max-w-md shadow-2xl shadow-accent-gold/10 animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-white/[0.08] flex justify-between items-center bg-gradient-to-r from-[#0c0c0c] to-[#0a0a0a]">
                            <h2 className="text-white font-bold text-lg flex items-center gap-3">
                                {activeModal === 'deposit' && (
                                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                                        <Plus className="w-5 h-5 text-emerald-400" />
                                    </div>
                                )}
                                {(activeModal === 'withdraw' || activeModal?.startsWith('purchase')) && (
                                    <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center border border-red-500/30">
                                        <Minus className="w-5 h-5 text-red-400" />
                                    </div>
                                )}
                                {activeModal === 'bonus' && (
                                    <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
                                        <Gift className="w-5 h-5 text-purple-400" />
                                    </div>
                                )}
                                {
                                    activeModal === 'deposit' ? 'Deposit Funds' : 
                                    activeModal === 'withdraw' ? 'Withdraw Funds' : 
                                    activeModal === 'purchaseFuel' ? 'Purchase Jet A1 Fuel' :
                                    activeModal === 'purchaseCatering' ? 'Purchase Catering' :
                                    'Award Pilot Bonus'
                                }
                            </h2>
                            <button onClick={closeModal} className="text-gray-500 hover:text-white transition-colors text-2xl leading-none">
                                ×
                            </button>
                        </div>
                        
                        <div className="p-6 space-y-5">
                            {error && (
                                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3 text-red-400 text-sm shadow-lg shadow-red-500/10">
                                    <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                                    <span className="font-medium">{error}</span>
                                </div>
                            )}

                            {activeModal === 'bonus' && (
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Pilot ID</label>
                                    <input 
                                        type="text" 
                                        value={pilotId} 
                                        onChange={(e) => setPilotId(e.target.value)}
                                        placeholder="e.g. LVT1234"
                                        className="w-full bg-gradient-to-br from-[#0a0a0a] to-[#0d0d0d] border border-white/[0.08] rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-accent-gold/40 focus:ring-2 focus:ring-accent-gold/10 transition-all uppercase font-mono shadow-lg shadow-black/20"
                                    />
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Amount (Cr)</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 w-5 h-5" />
                                    <input 
                                        type="number" 
                                        min="1"
                                        value={amount} 
                                        onChange={(e) => setAmount(e.target.value)}
                                        placeholder="0"
                                        className="w-full bg-gradient-to-br from-[#0a0a0a] to-[#0d0d0d] border border-white/[0.08] rounded-xl pl-12 pr-4 py-3 text-white font-mono font-bold text-lg focus:outline-none focus:border-accent-gold/40 focus:ring-2 focus:ring-accent-gold/10 transition-all shadow-lg shadow-black/20"
                                    />
                                </div>
                                {(activeModal === 'withdraw' || activeModal?.startsWith('purchase') || activeModal === 'bonus') && (
                                    <p className="text-xs text-gray-500 mt-2 font-mono">Available: <span className="text-cyan-400 font-bold">{stats?.balance?.toLocaleString() || 0}</span> Cr</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Reason / Description</label>
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
                                    className="w-full bg-gradient-to-br from-[#0a0a0a] to-[#0d0d0d] border border-white/[0.08] rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-accent-gold/40 focus:ring-2 focus:ring-accent-gold/10 transition-all shadow-lg shadow-black/20"
                                />
                            </div>
                        </div>

                        <div className="p-6 bg-gradient-to-r from-[#0c0c0c] to-[#0a0a0a] border-t border-white/[0.08] flex justify-end gap-3">
                            <button 
                                onClick={closeModal}
                                className="px-5 py-2.5 text-sm font-bold text-gray-400 hover:text-white bg-gradient-to-br from-[#0a0a0a] to-[#0d0d0d] border border-white/[0.08] rounded-xl transition-all hover:border-white/[0.15]"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleAction}
                                disabled={submitting}
                                className={`px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-lg ${
                                    activeModal === 'deposit' ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-emerald-500/20 hover:shadow-emerald-500/40' :
                                    activeModal === 'withdraw' ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-red-500/20 hover:shadow-red-500/40' :
                                    activeModal?.startsWith('purchase') ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-amber-500/20 hover:shadow-amber-500/40' :
                                    'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-purple-500/20 hover:shadow-purple-500/40'
                                } disabled:opacity-50 disabled:cursor-not-allowed`}
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
