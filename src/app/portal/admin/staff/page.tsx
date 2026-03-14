'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Plus, Trash2, Shield, Edit, X, Search, Filter, Mail, MessageCircle, Crown, UserCog, Briefcase, Award } from 'lucide-react';
import { toast } from 'sonner';

interface StaffRole {
    _id: string;
    title: string;
    category: string;
    description: string;
    email: string;
    order: number;
    color: string;
}

interface StaffMember {
    _id: string;
    pilot_id: {
        _id: string;
        first_name: string;
        last_name: string;
        pilot_id: string;
        rank: string;
    };
    role_id: StaffRole;
    is_head: boolean;
    name?: string;
    callsign?: string;
    email?: string;
    picture?: string;
    discord?: string;
}

export default function AdminStaffPage() {
    const [members, setMembers] = useState<StaffMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState<string>('all');
    const [showAddModal, setShowAddModal] = useState(false);
    
    // New Staff Form State
    const [pilotIdInput, setPilotIdInput] = useState('');
    const [memberDetails, setMemberDetails] = useState({ 
        roleTitle: '', 
        name: '', 
        email: '', 
        discord: '' 
    });
    const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
    const [assigning, setAssigning] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);

    const categories = [
        { id: 'all', label: 'All Staff', icon: <Users size={16} /> },
        { id: 'Board of Governor', label: 'Board', icon: <Crown size={16} /> },
        { id: 'Director', label: 'Directors', icon: <Briefcase size={16} /> },
        { id: 'Chief Pilot', label: 'Chief Pilots', icon: <Award size={16} /> },
    ];

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/staff/members');
            const data = await res.json();
            if (data.success) {
                console.log('Staff members:', data.members);
                setMembers(data.members);
            }
        } catch (e) {
            console.error('Failed to fetch staff data', e);
        } finally {
            setLoading(false);
        }
    };

    const handleAddOrUpdateStaff = async (e: React.FormEvent) => {
        e.preventDefault();
        setAssigning(true);
        try {
            const url = editingMemberId 
                ? `/api/staff/members/${editingMemberId}` 
                : '/api/staff/members';
            const method = editingMemberId ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    pilotId: pilotIdInput, 
                    ...memberDetails
                })
            });
            const data = await res.json();
            if (data.success) {
                if (editingMemberId) {
                    setMembers(members.map(m => m._id === editingMemberId ? data.member : m));
                    toast.success('Staff member updated successfully');
                } else {
                    setMembers([data.member, ...members]);
                    toast.success('Staff member added successfully');
                }
                resetForm();
            } else {
                toast.error(data.error || 'Failed to process request');
            }
        } catch (e) {
            console.error(e);
            toast.error('An error occurred');
        } finally {
            setAssigning(false);
        }
    };

    const resetForm = () => {
        setPilotIdInput('');
        setMemberDetails({ 
            roleTitle: '', 
            name: '', 
            email: '', 
            discord: '' 
        });
        setEditingMemberId(null);
        setShowEditModal(false);
        setShowAddModal(false);
    };

    const getRoleCategory = (roleTitle: string): string => {
        if (['Chief Executive Officer', 'Chief Operations Officer', 'Executive Vice President'].includes(roleTitle)) {
            return 'Board of Governor';
        }
        if (roleTitle.includes('Director')) return 'Director';
        if (roleTitle.includes('Chief Pilot') || roleTitle === 'Senior Advisor') return 'Chief Pilot';
        return 'Other';
    };

    const filteredMembers = members.filter(member => {
        const matchesSearch = searchQuery === '' || 
            (member.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
             member.pilot_id?.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
             member.pilot_id?.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
             member.role_id?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
             member.pilot_id?.pilot_id?.toLowerCase().includes(searchQuery.toLowerCase()));
        
        const matchesCategory = activeCategory === 'all' || getRoleCategory(member.role_id?.title || '') === activeCategory;
        
        return matchesSearch && matchesCategory;
    });

    const handleEdit = (member: StaffMember) => {
        setEditingMemberId(member._id);
        setPilotIdInput(member.pilot_id?.pilot_id || '');
        setMemberDetails({
            roleTitle: member.role_id?.title || '',
            name: member.name || '',
            email: member.email || '',
            discord: member.discord || ''
        });
        setShowEditModal(true);
    };

    const handleDeleteMember = async (id: string, name: string) => {
        if (!confirm(`Remove ${name} from staff?`)) return;
        try {
            const res = await fetch(`/api/staff/members/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setMembers(members.filter(m => m._id !== id));
                toast.success('Staff member removed');
            } else {
                toast.error('Failed to remove staff member');
            }
        } catch (e) { 
            console.error(e);
            toast.error('An error occurred');
        }
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="bg-panel backdrop-blur-sm border border-white/5 rounded-2xl p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-accent-gold/10 flex items-center justify-center border border-accent-gold/20">
                            <Users className="text-accent-gold" size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white">Staff Management</h1>
                            <p className="text-gray-500 text-xs">Manage your organization's team members</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="px-5 py-2.5 rounded-xl text-sm font-bold bg-accent-gold hover:bg-amber-400 text-black shadow-lg shadow-accent-gold/20 transition-all flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Add Staff Member
                    </button>
                </div>
            </div>

            {/* Search & Filters */}
            <div className="bg-panel backdrop-blur-sm border border-white/5 rounded-2xl p-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Category Tabs */}
                    <div className="flex items-center gap-2 overflow-x-auto">
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                                    activeCategory === cat.id
                                        ? 'bg-accent-gold/10 text-accent-gold border border-accent-gold/20'
                                        : 'text-gray-400 hover:text-gray-300 hover:bg-white/5'
                                }`}
                            >
                                {cat.icon}
                                {cat.label}
                            </button>
                        ))}
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search staff..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-2 bg-black/40 border border-white/10 rounded-lg text-white text-sm focus:border-accent-gold/50 focus:outline-none transition-colors w-full md:w-64"
                        />
                    </div>
                </div>
            </div>

            {/* Staff Grid */}
            <div className="bg-panel backdrop-blur-sm border border-white/5 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <h2 className="text-lg font-bold text-white">Team Members</h2>
                        <span className="text-xs text-gray-500 font-mono bg-white/5 px-2 py-1 rounded-lg">
                            {filteredMembers.length} {filteredMembers.length === 1 ? 'member' : 'members'}
                        </span>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-20">
                        <div className="inline-block w-8 h-8 border-4 border-accent-gold/20 border-t-accent-gold rounded-full animate-spin"></div>
                        <p className="text-gray-500 text-sm mt-4">Loading staff...</p>
                    </div>
                ) : filteredMembers.length === 0 ? (
                    <div className="text-center py-20 border border-dashed border-white/5 rounded-2xl bg-white/[0.01]">
                        <Users className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                        <p className="text-gray-500 text-sm font-bold">
                            {searchQuery || activeCategory !== 'all' ? 'No staff members found' : 'No staff members yet'}
                        </p>
                        {!searchQuery && activeCategory === 'all' && (
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="mt-4 px-4 py-2 bg-accent-gold/10 hover:bg-accent-gold/20 text-accent-gold rounded-lg text-sm font-bold transition-all"
                            >
                                Add your first staff member
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <AnimatePresence mode="popLayout">
                            {filteredMembers.map(member => {
                                const memberName = member.name || 
                                    (member.pilot_id?.first_name && member.pilot_id?.last_name 
                                        ? `${member.pilot_id.first_name} ${member.pilot_id.last_name}` 
                                        : 'Staff Member');
                                
                                return (
                                    <motion.div
                                        key={member._id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 hover:border-white/10 hover:bg-white/[0.04] transition-all group"
                                    >
                                        <div className="flex items-start gap-4">
                                            {/* Avatar */}
                                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-gray-800 to-black p-0.5 flex-shrink-0">
                                                <div className="w-full h-full rounded-[10px] overflow-hidden bg-zinc-900 flex items-center justify-center">
                                                    {member.picture ? (
                                                        <img 
                                                            src={member.picture} 
                                                            alt="" 
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => {
                                                                e.currentTarget.style.display = 'none';
                                                                const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                                                                if (fallback) fallback.classList.remove('hidden');
                                                            }}
                                                        />
                                                    ) : member.discord ? (
                                                        <img 
                                                            src={`https://cdn.discordapp.com/embed/avatars/${parseInt(member.discord) % 5}.png`} 
                                                            alt="" 
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => {
                                                                e.currentTarget.style.display = 'none';
                                                                const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                                                                if (fallback) fallback.classList.remove('hidden');
                                                            }}
                                                        />
                                                    ) : null}
                                                    <span className={`text-xl font-bold text-gray-600 uppercase ${member.picture || member.discord ? 'hidden' : ''}`}>
                                                        {memberName[0]}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-bold text-white text-base leading-tight truncate">
                                                    {memberName}
                                                </h3>
                                                <p className={`text-xs font-bold uppercase tracking-wider mt-1 ${member.role_id?.color || 'text-gray-500'}`}>
                                                    {member.role_id?.title || 'No Role'}
                                                </p>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <span className="text-[10px] text-gray-600 font-mono bg-white/5 px-2 py-0.5 rounded">
                                                        {member.pilot_id?.pilot_id || 'N/A'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/5">
                                            {member.email && (
                                                <a
                                                    href={`mailto:${member.email}`}
                                                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-all text-xs font-bold"
                                                    title="Send email"
                                                >
                                                    <Mail size={14} />
                                                </a>
                                            )}
                                            <button
                                                onClick={() => handleEdit(member)}
                                                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg text-blue-400 hover:text-blue-300 transition-all text-xs font-bold"
                                            >
                                                <Edit size={14} />
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDeleteMember(member._id, memberName)}
                                                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 rounded-lg text-rose-400 hover:text-rose-300 transition-all text-xs font-bold"
                                            >
                                                <Trash2 size={14} />
                                                Remove
                                            </button>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            {/* Add Staff Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowAddModal(false)}>
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-panel backdrop-blur-sm border border-white/10 rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-400/10 flex items-center justify-center border border-emerald-400/20">
                                        <Plus className="text-emerald-400" size={20} />
                                    </div>
                                    <h2 className="text-2xl font-bold text-white">Add Staff Member</h2>
                                </div>
                                <button onClick={() => setShowAddModal(false)} className="text-gray-500 hover:text-white p-2 hover:bg-white/5 rounded-xl transition-all">
                                    <X size={24} />
                                </button>
                            </div>

                            <form onSubmit={handleAddOrUpdateStaff} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-[10px] text-gray-400 font-bold uppercase ml-1 tracking-widest">Pilot ID</label>
                                <input 
                                    type="text" placeholder="e.g. LVT001" 
                                    value={pilotIdInput} 
                                    onChange={(e) => setPilotIdInput(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-sm font-mono outline-none focus:border-emerald-500/50 transition-all placeholder:text-gray-700"
                                    required
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] text-gray-400 font-bold uppercase ml-1 tracking-widest">Display Name Override</label>
                                <input 
                                    type="text" placeholder="Optional" 
                                    value={memberDetails.name} onChange={e => setMemberDetails({...memberDetails, name: e.target.value})}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-sm focus:border-white/20 transition-all placeholder:text-gray-700"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] text-gray-400 font-bold uppercase ml-1 tracking-widest">Role Title</label>
                            <select 
                                value={memberDetails.roleTitle} onChange={e => setMemberDetails({...memberDetails, roleTitle: e.target.value})}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-sm outline-none focus:border-accent-gold/50 transition-all font-medium appearance-none cursor-pointer"
                                required
                            >
                                <option value="" className="text-black">Select Position...</option>
                                <optgroup label="Board of Governor" className="text-black">
                                    <option value="Chief Executive Officer">Chief Executive Officer</option>
                                    <option value="Chief Operations Officer">Chief Operations Officer</option>
                                    <option value="Executive Vice President">Executive Vice President</option>
                                </optgroup>
                                <optgroup label="Director" className="text-black">
                                    <option value="Operations Director">Operations Director</option>
                                    <option value="Human Resources Director">Human Resources Director</option>
                                    <option value="Marketing Director">Marketing Director</option>
                                    <option value="IT Director">IT Director</option>
                                    <option value="Events Director">Events Director</option>
                                </optgroup>
                                <optgroup label="Chief Pilot" className="text-black">
                                    <option value="Chief Pilot Training">Chief Pilot Training</option>
                                    <option value="Chief Pilot Recruitment">Chief Pilot Recruitment</option>
                                    <option value="Senior Advisor">Senior Advisor</option>
                                </optgroup>
                            </select>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/5">
                            <div className="space-y-1.5">
                                <label className="text-[10px] text-gray-400 font-bold uppercase ml-1 tracking-widest">Direct Email</label>
                                <input 
                                    type="email" placeholder="staff@levantva.com" 
                                    value={memberDetails.email} onChange={e => setMemberDetails({...memberDetails, email: e.target.value})}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-sm focus:border-white/20 transition-all placeholder:text-gray-700"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] text-gray-400 font-bold uppercase ml-1 tracking-widest">Discord User ID</label>
                                <input 
                                    type="text" placeholder="Discord User ID (for avatar)" 
                                    value={memberDetails.discord} onChange={e => setMemberDetails({...memberDetails, discord: e.target.value})}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-sm focus:border-[#5865F2]/50 transition-all placeholder:text-gray-700"
                                />
                            </div>
                        </div>

                            <div className="flex gap-4 pt-4">
                                <button 
                                    type="button" 
                                    onClick={() => setShowAddModal(false)} 
                                    className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-widest rounded-2xl transition-all"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    disabled={assigning} 
                                    className="flex-[2] py-4 bg-gradient-to-r from-emerald-600 to-teal-700 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 rounded-2xl text-white font-bold text-xs uppercase tracking-widest transition-all shadow-xl shadow-emerald-900/20"
                                >
                                    {assigning ? 'Adding...' : 'Add Staff Member'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
            </AnimatePresence>

            {/* Edit Modal */}
            {showEditModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowEditModal(false)}>
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-panel backdrop-blur-sm border border-white/10 rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-blue-400/10 flex items-center justify-center border border-blue-400/20">
                                    <Edit className="text-blue-400" size={20} />
                                </div>
                                <h2 className="text-2xl font-bold text-white">Edit Staff Member</h2>
                            </div>
                            <button onClick={() => setShowEditModal(false)} className="text-gray-500 hover:text-white p-2 hover:bg-white/5 rounded-xl transition-all">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleAddOrUpdateStaff} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] text-gray-400 font-bold uppercase ml-1 tracking-widest">Pilot ID</label>
                                    <input 
                                        type="text" 
                                        value={pilotIdInput} 
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-sm font-mono outline-none cursor-not-allowed opacity-50"
                                        disabled
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] text-gray-400 font-bold uppercase ml-1 tracking-widest">Display Name Override</label>
                                    <input 
                                        type="text" 
                                        placeholder="Optional" 
                                        value={memberDetails.name} 
                                        onChange={e => setMemberDetails({...memberDetails, name: e.target.value})}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-sm focus:border-white/20 transition-all placeholder:text-gray-700"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] text-gray-400 font-bold uppercase ml-1 tracking-widest">Role Title</label>
                                <select 
                                    value={memberDetails.roleTitle} 
                                    onChange={e => setMemberDetails({...memberDetails, roleTitle: e.target.value})}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-sm outline-none focus:border-accent-gold/50 transition-all font-medium appearance-none cursor-pointer"
                                    required
                                >
                                    <option value="" className="text-black">Select Position...</option>
                                    <optgroup label="Board of Governor" className="text-black">
                                        <option value="Chief Executive Officer">Chief Executive Officer</option>
                                        <option value="Chief Operations Officer">Chief Operations Officer</option>
                                        <option value="Executive Vice President">Executive Vice President</option>
                                    </optgroup>
                                    <optgroup label="Director" className="text-black">
                                        <option value="Operations Director">Operations Director</option>
                                        <option value="Human Resources Director">Human Resources Director</option>
                                        <option value="Marketing Director">Marketing Director</option>
                                        <option value="IT Director">IT Director</option>
                                        <option value="Events Director">Events Director</option>
                                    </optgroup>
                                    <optgroup label="Chief Pilot" className="text-black">
                                        <option value="Chief Pilot Training">Chief Pilot Training</option>
                                        <option value="Chief Pilot Recruitment">Chief Pilot Recruitment</option>
                                        <option value="Senior Advisor">Senior Advisor</option>
                                    </optgroup>
                                </select>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/5">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] text-gray-400 font-bold uppercase ml-1 tracking-widest">Direct Email</label>
                                    <input 
                                        type="email" 
                                        placeholder="staff@levantva.com" 
                                        value={memberDetails.email} 
                                        onChange={e => setMemberDetails({...memberDetails, email: e.target.value})}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-sm focus:border-white/20 transition-all placeholder:text-gray-700"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] text-gray-400 font-bold uppercase ml-1 tracking-widest">Discord User ID</label>
                                    <input 
                                        type="text" 
                                        placeholder="Discord User ID (for avatar)" 
                                        value={memberDetails.discord} 
                                        onChange={e => setMemberDetails({...memberDetails, discord: e.target.value})}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-sm focus:border-[#5865F2]/50 transition-all placeholder:text-gray-700"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button 
                                    type="button" 
                                    onClick={resetForm} 
                                    className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-widest rounded-2xl transition-all"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    disabled={assigning} 
                                    className="flex-[2] py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 rounded-2xl text-white font-bold text-xs uppercase tracking-widest transition-all shadow-xl shadow-blue-900/20"
                                >
                                    {assigning ? 'Updating...' : 'Update Member'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
}

