'use client';

import { useState, useEffect } from 'react';
import { ShoppingBag, CheckCircle, AlertCircle, Package, ArrowRight, Sparkles, Zap, Star, RefreshCw } from 'lucide-react';

interface StoreItem {
    _id: string;
    name: string;
    description: string;
    price: number;
    category: 'Badge' | 'Perk' | 'Skin' | 'Other';
    image?: string;
    download_url?: string;
    active: boolean;
}

export default function StorePage() {
    const [items, setItems] = useState<StoreItem[]>([]);
    const [balance, setBalance] = useState(0);
    const [ownedItems, setOwnedItems] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [purchasing, setPurchasing] = useState<string | null>(null);
    const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
    const [activeTab, setActiveTab] = useState<'all'>('all');

    const fetchStoreData = async () => {
        try {
            const [storeRes, authRes] = await Promise.all([
                fetch('/api/portal/store/fetch'),
                fetch('/api/auth/me')
            ]);
            
            const storeData = await storeRes.json();
            const authData = await authRes.json();

            if (storeRes.ok) {
                setItems(storeData.items || []);
            }
            if (authRes.ok) {
                setBalance(authData.user?.balance || 0);
                setOwnedItems(authData.user?.inventory || []);
            }
        } catch (error) {
            console.error('Failed to fetch store data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStoreData();
    }, []);

    const handlePurchase = async (itemId: string) => {
        setPurchasing(itemId);
        setMessage(null);
        try {
            const res = await fetch('/api/portal/store/purchase', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ itemId }),
            });
            const data = await res.json();
            if (res.ok) {
                setMessage({ text: data.message, type: 'success' });
                setBalance(data.newBalance);
                setOwnedItems([...ownedItems, itemId]);
            } else {
                setMessage({ text: data.error, type: 'error' });
            }
        } catch (error) {
            setMessage({ text: 'Failed to process purchase', type: 'error' });
        } finally {
            setPurchasing(null);
        }
    };

    const getCategoryStyles = (category: string) => {
        switch (category) {
            case 'Badge': return 'from-purple-500/20 to-pink-500/20 text-purple-400 border-purple-500/30';
            case 'Perk': return 'from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30';
            default: return 'from-gray-500/20 to-slate-500/20 text-gray-400 border-gray-500/30';
        }
    };

    const filteredItems = items;

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Premium Hero Section */}
            <div className="relative overflow-hidden rounded-3xl bg-[#0a0a0a] border border-white/[0.06] p-8 md:p-12 shadow-2xl">
                {/* Background Decoration */}
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-accent-gold/5 rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-primary-500/5 rounded-full blur-[100px] pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="text-center md:text-left">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent-gold/10 border border-accent-gold/20 mb-4">
                            <Sparkles className="w-3.5 h-3.5 text-accent-gold" />
                            <span className="text-xs font-bold text-accent-gold uppercase tracking-wider">Pilot Store</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-white mb-3 tracking-tight">
                            Exclusive Items
                        </h1>
                        <p className="text-gray-400 text-lg max-w-xl">
                            Unlock badges, perks, and exclusive content with your hard-earned credits
                        </p>
                    </div>
                    <button
                        onClick={() => { setLoading(true); fetchStoreData(); }}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-gray-300 transition-all disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        <span className="text-sm font-bold">Refresh</span>
                    </button>
                    <div className="flex flex-col items-center">
                        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/[0.08] shadow-xl flex flex-col items-center min-w-[240px]">
                            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-2">Current Balance</p>
                            <div className="flex items-center gap-3">
                                <span className="text-4xl font-display font-bold text-white tracking-widest leading-none">
                                    {balance.toLocaleString()}
                                </span>
                                <div className="w-8 h-8 rounded-full bg-accent-gold flex items-center justify-center shadow-[0_0_20px_rgba(251,191,36,0.3)]">
                                    <Zap className="w-4 h-4 text-dark-900 fill-current" />
                                </div>
                            </div>
                            <div className="mt-3 text-[10px] text-gray-500 font-mono">Spendable Credits</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Status Messages */}
            <div className="flex flex-wrap items-center justify-end gap-4">
                {message && (
                    <div className={`px-4 py-2.5 rounded-xl border flex items-center gap-3 animate-in fade-in slide-in-from-right-4 duration-300 ${
                        message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                    }`}>
                        {message.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                        <span className="text-sm font-bold">{message.text}</span>
                    </div>
                )}
            </div>

            {/* Store List */}
            {loading ? (
                <div className="flex flex-col gap-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-24 rounded-2xl bg-[#0a0a0a] border border-white/[0.06] animate-pulse" />
                    ))}
                </div>
            ) : filteredItems.length === 0 ? (
                <div className="h-48 rounded-3xl border border-dashed border-white/10 flex flex-col items-center justify-center gap-4 text-gray-500">
                    <Package className="w-12 h-12 opacity-20" />
                    <p className="font-medium">No items found in this collection</p>
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    {filteredItems.map((item) => (
                        <div key={item._id} className="relative group flex items-center p-4 md:p-6 rounded-2xl bg-[#0a0a0a] border border-white/[0.06] hover:border-white/10 transition-all duration-300 shadow-lg">
                            {/* Glow Effect */}
                            <div className={`absolute -inset-0.5 bg-gradient-to-r opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none rounded-2xl ${getCategoryStyles(item.category)}`} />

                            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6 w-full">
                                {/* Left: Media/Icon */}
                                <div className="flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-xl bg-gradient-to-br from-dark-700/50 to-dark-900/50 flex items-center justify-center relative border border-white/5">
                                    <span className="text-3xl md:text-4xl group-hover:scale-110 transition-transform duration-500 drop-shadow-xl">
                                        {item.category === 'Badge' ? '🎖️' : item.category === 'Perk' ? '⚡' : item.category === 'Skin' ? '🎨' : '📦'}
                                    </span>
                                </div>

                                {/* Middle: Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-1">
                                        <h3 className="text-lg md:text-xl font-bold text-white group-hover:text-accent-gold transition-colors truncate">
                                            {item.name}
                                        </h3>
                                        <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-black tracking-widest border ${getCategoryStyles(item.category)}`}>
                                            {item.category}
                                        </span>
                                    </div>
                                    <p className="text-gray-400 text-xs md:text-sm leading-relaxed max-w-3xl line-clamp-2 md:line-clamp-none">
                                        {item.description}
                                    </p>
                                </div>

                                {/* Right: Price and Action */}
                                <div className="flex items-center gap-6 md:gap-8 w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-white/[0.06]">
                                    <div className="flex flex-col flex-shrink-0">
                                        <span className="text-gray-500 text-[9px] uppercase font-bold tracking-[0.2em] mb-1">Price</span>
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-xl font-display font-bold text-white font-mono group-hover:text-accent-gold transition-colors">
                                                {item.price.toLocaleString()}
                                            </span>
                                            <Star className="w-3.5 h-3.5 text-accent-gold fill-current" />
                                        </div>
                                    </div>

                                    <div className="flex-shrink-0 ml-auto md:ml-0">
                                        {ownedItems.includes(item._id) ? (
                                            <div className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-5 py-2.5 rounded-xl flex items-center gap-2 text-xs font-black uppercase tracking-widest">
                                                <CheckCircle className="w-4 h-4 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                                                Acquired
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => handlePurchase(item._id)}
                                                disabled={purchasing === item._id || balance < item.price}
                                                className="relative overflow-hidden group/btn px-6 py-2.5 rounded-xl bg-white text-dark-950 font-black text-xs uppercase tracking-widest hover:bg-accent-gold transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed shadow-[0_4px_20px_rgba(255,255,255,0.05)]"
                                            >
                                                <span className="relative z-10 flex items-center gap-2">
                                                    {purchasing === item._id ? 'Processing...' : 'Purchase'}
                                                    {!purchasing && <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />}
                                                </span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

        </div>
    );
}
