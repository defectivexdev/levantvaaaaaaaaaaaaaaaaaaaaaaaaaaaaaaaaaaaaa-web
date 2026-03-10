'use client';
import { useState, useEffect, useRef } from 'react';
import { Plus, Edit, Trash2, ShoppingBag, X, Check, AlertCircle, Upload, FileText, Image as ImageIcon, Loader2, Package, Search } from 'lucide-react';

interface StoreItem {
    _id: string;
    name: string;
    description: string;
    price: number;
    category: 'Badge' | 'Perk' | 'Skin' | 'Other';
    active: boolean;
    image?: string;
    download_url?: string;
}

export default function AdminStorePage() {
    const [items, setItems] = useState<StoreItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<StoreItem | null>(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Form state
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [category, setCategory] = useState<StoreItem['category']>('Other');
    const [active, setActive] = useState(true);
    const [downloadUrl, setDownloadUrl] = useState('');
    const [imageUrl, setImageUrl] = useState('');

    // Upload state
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);

    const fetchItems = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/store');
            const data = await res.json();
            if (res.ok) {
                setItems(data.items || []);
            }
        } catch (error) {
            console.error('Failed to fetch items:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
    }, []);

    const resetForm = () => {
        setName('');
        setDescription('');
        setPrice('');
        setCategory('Other');
        setActive(true);
        setDownloadUrl('');
        setImageUrl('');
        setEditing(null);
        setError(null);
        setUploadProgress(0);
    };

    const handleOpenModal = (item?: StoreItem) => {
        if (item) {
            setEditing(item);
            setName(item.name);
            setDescription(item.description);
            setPrice(item.price.toString());
            setCategory(item.category);
            // Default to true if active is undefined (older records)
            setActive(item.active !== false);
            setDownloadUrl(item.download_url || '');
            setImageUrl(item.image || '');
        } else {
            resetForm();
        }
        setShowModal(true);
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: 'zip' | 'image') => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validation
        if (type === 'zip' && !file.name.endsWith('.zip')) {
            setError('Please upload a .zip file for skins');
            return;
        }

        setIsUploading(true);
        setError(null);
        setUploadProgress(0);

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('type', type);
            formData.append('name', name || 'store_item');

            const res = await fetch('/api/cloudinary/store-upload', {
                method: 'POST',
                body: formData,
            });

            const data = await res.json();
            if (res.ok && data.url) {
                if (type === 'image') {
                    setImageUrl(data.url);
                } else {
                    setDownloadUrl(data.url);
                }
            } else {
                throw new Error(data.error || 'Upload failed');
            }
        } catch (err: any) {
            console.error('Upload failed:', err);
            setError(err.message || 'File upload failed. Please try again.');
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
        }
    };

    const handleSave = async () => {
        if (!name || !description || !price) {
            setError('Please fill in all required fields');
            return;
        }

        setSaving(true);
        try {
            const body = {
                ...(editing && { id: editing._id }),
                name,
                description,
                price: parseInt(price),
                category,
                active,
                download_url: downloadUrl,
                image: imageUrl
            };

            const res = await fetch('/api/admin/store', {
                method: editing ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            if (res.ok) {
                setShowModal(false);
                fetchItems();
            } else {
                const data = await res.json();
                setError(data.error || 'Failed to save item');
            }
        } catch (error) {
            setError('Connection error');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this item?')) return;
        
        try {
            const res = await fetch(`/api/admin/store?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchItems();
            }
        } catch (error) {
            console.error('Delete failed:', error);
        }
    };

    const getCategoryStyles = (cat: string) => {
        switch (cat) {
            case 'Badge': return 'from-purple-500/20 to-pink-500/20 text-purple-400 border-purple-500/30';
            case 'Perk': return 'from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30';
            case 'Skin': return 'from-blue-500/20 to-cyan-500/20 text-blue-400 border-blue-500/30';
            default: return 'from-gray-500/20 to-slate-500/20 text-gray-400 border-gray-500/30';
        }
    };

    const filteredItems = items.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="relative overflow-hidden rounded-3xl bg-[#0a0a0a] border border-white/[0.06] p-8 shadow-2xl">
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-accent-gold/5 rounded-full blur-[100px] pointer-events-none" />
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-accent-gold/10 border border-accent-gold/20 flex items-center justify-center">
                            <ShoppingBag className="w-7 h-7 text-accent-gold" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-white tracking-tight">Store Management</h1>
                            <p className="text-gray-400 text-sm mt-1">Manage items available in the Pilot Store</p>
                        </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row w-full md:w-auto gap-4">
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <input
                                type="text"
                                placeholder="Search items..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-accent-gold/50 transition-all placeholder:text-gray-600"
                            />
                        </div>
                        <button
                            onClick={() => handleOpenModal()}
                            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-accent-gold text-dark-950 rounded-xl font-bold text-sm hover:bg-white transition-all shadow-lg shadow-accent-gold/10 flex-shrink-0"
                        >
                            <Plus className="w-4 h-4" />
                            Add Item
                        </button>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            {loading ? (
                <div className="flex flex-col gap-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-24 rounded-2xl bg-[#0a0a0a] border border-white/[0.06] animate-pulse" />
                    ))}
                </div>
            ) : filteredItems.length === 0 ? (
                <div className="h-64 rounded-3xl border border-dashed border-white/10 flex flex-col items-center justify-center gap-4 text-gray-500 bg-[#0a0a0a]">
                    <Package className="w-12 h-12 opacity-20" />
                    <p className="font-medium">No items found.</p>
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    {filteredItems.map((item) => (
                        <div key={item._id} className="group flex flex-col sm:flex-row items-start sm:items-center p-5 rounded-2xl bg-[#0a0a0a] border border-white/[0.06] hover:border-white/10 transition-all duration-300 shadow-lg gap-6">
                            
                            {/* Left: Icon/Image */}
                            <div className="flex-shrink-0 w-16 h-16 rounded-xl bg-gradient-to-br from-dark-700/50 to-dark-900/50 flex items-center justify-center relative border border-white/5 overflow-hidden">
                                {item.image ? (
                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                ) : (
                                    <span className="text-3xl group-hover:scale-110 transition-transform duration-500">
                                        {item.category === 'Badge' ? '🎖️' : item.category === 'Perk' ? '⚡' : item.category === 'Skin' ? '🎨' : '📦'}
                                    </span>
                                )}
                            </div>

                            {/* Middle: Details */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-1">
                                    <h3 className="text-lg font-bold text-white truncate">{item.name}</h3>
                                    <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-black tracking-widest border bg-gradient-to-r ${getCategoryStyles(item.category)}`}>
                                        {item.category}
                                    </span>
                                    {item.active !== false ? (
                                        <span className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                                            <Check className="w-3 h-3" /> Active
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                                            <X className="w-3 h-3" /> Hidden
                                        </span>
                                    )}
                                </div>
                                <p className="text-gray-400 text-sm truncate max-w-2xl">{item.description}</p>
                            </div>

                            {/* Right: Price & Actions */}
                            <div className="flex items-center gap-6 sm:gap-8 w-full sm:w-auto pt-4 sm:pt-0 border-t sm:border-t-0 border-white/[0.06]">
                                <div className="flex flex-col flex-shrink-0">
                                    <span className="text-gray-500 text-[9px] uppercase font-bold tracking-[0.2em] mb-1">Price</span>
                                    <div className="text-lg font-display font-bold text-accent-gold font-mono">
                                        {item.price.toLocaleString()} Cr
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 ml-auto sm:ml-0">
                                    <button
                                        onClick={() => handleOpenModal(item)}
                                        className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-accent-gold hover:bg-accent-gold/10 hover:border-accent-gold/30 transition-all"
                                        title="Edit Item"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(item._id)}
                                        className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-rose-500 hover:bg-rose-500/10 hover:border-rose-500/30 transition-all"
                                        title="Delete Item"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-[#0a0a0a] rounded-3xl w-full max-w-2xl border border-white/[0.08] shadow-[0_0_80px_rgba(0,0,0,0.5)] overflow-hidden max-h-[90vh] flex flex-col animate-in zoom-in-95 slide-in-from-bottom-4 duration-400">
                        {/* Header with gradient accent */}
                        <div className="relative p-6 border-b border-white/10 flex justify-between items-center overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-accent-gold/5 via-transparent to-transparent pointer-events-none" />
                            <div className="relative flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-accent-gold/10 border border-accent-gold/20 flex items-center justify-center">
                                    {editing ? <Edit className="w-5 h-5 text-accent-gold" /> : <Plus className="w-5 h-5 text-accent-gold" />}
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-white">{editing ? 'Edit Item' : 'Create New Item'}</h2>
                                    <p className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">Store Management</p>
                                </div>
                            </div>
                            <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-xl bg-white/5 border border-white/[0.08] flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/10 transition-all">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="p-6 space-y-5 overflow-y-auto flex-1">
                            {error && (
                                <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-3.5 rounded-xl text-sm flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                    {error}
                                </div>
                            )}

                            <div className="grid md:grid-cols-2 gap-6">
                                {/* Left Column — Item Details */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-gray-400 text-[10px] uppercase font-bold tracking-widest mb-2 ml-0.5">Item Name <span className="text-accent-gold">*</span></label>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={e => setName(e.target.value)}
                                            className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent-gold/50 focus:ring-1 focus:ring-accent-gold/20 transition-all placeholder:text-gray-600"
                                            placeholder="e.g. Gold Wings Badge"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-gray-400 text-[10px] uppercase font-bold tracking-widest mb-2 ml-0.5">Price (Cr) <span className="text-accent-gold">*</span></label>
                                            <input
                                                type="number"
                                                value={price}
                                                onChange={e => setPrice(e.target.value)}
                                                className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent-gold/50 focus:ring-1 focus:ring-accent-gold/20 transition-all font-mono placeholder:text-gray-600"
                                                placeholder="500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-gray-400 text-[10px] uppercase font-bold tracking-widest mb-2 ml-0.5">Category</label>
                                            <select
                                                value={category}
                                                onChange={e => setCategory(e.target.value as any)}
                                                className="w-full bg-[#111] border border-white/[0.08] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent-gold/50 transition-all appearance-none cursor-pointer"
                                            >
                                                <option value="Badge">Badge</option>
                                                <option value="Perk">Perk</option>
                                                <option value="Skin">Skins (ACARS)</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-gray-400 text-[10px] uppercase font-bold tracking-widest mb-2 ml-0.5">Description <span className="text-accent-gold">*</span></label>
                                        <textarea
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            rows={4}
                                            className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent-gold/50 focus:ring-1 focus:ring-accent-gold/20 transition-all resize-none placeholder:text-gray-600"
                                            placeholder="What does this item do? Why should pilots want it?"
                                        >
                                        </textarea>
                                    </div>

                                    {/* Active Toggle */}
                                    <div className="flex items-center justify-between p-4 bg-white/[0.02] rounded-xl border border-white/[0.06]">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-2 h-2 rounded-full ${active ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]' : 'bg-rose-500'}`} />
                                            <label htmlFor="active" className="text-gray-300 text-sm font-bold cursor-pointer">{active ? 'Published (Visible)' : 'Hidden (Draft)'}</label>
                                        </div>
                                        <div className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" id="active" checked={active} onChange={e => setActive(e.target.checked)} className="sr-only peer" />
                                            <div className="w-11 h-6 bg-[#111] border border-white/[0.08] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500" />
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column — Media & Files */}
                                <div className="space-y-5">
                                    {/* Image Upload */}
                                    <div>
                                        <label className="block text-gray-400 text-[10px] uppercase font-bold tracking-widest mb-2 ml-0.5">Thumbnail</label>
                                        <div className="relative group cursor-pointer" onClick={() => imageInputRef.current?.click()}>
                                            <div className="w-full h-36 rounded-2xl bg-gradient-to-br from-white/[0.02] to-white/[0.05] border border-dashed border-white/10 overflow-hidden flex items-center justify-center transition-all group-hover:border-accent-gold/40 group-hover:from-accent-gold/[0.02] group-hover:to-accent-gold/[0.05]">
                                                {imageUrl ? (
                                                    <img src={imageUrl} alt="Preview" className="w-full h-full object-cover group-hover:opacity-70 transition-opacity rounded-2xl" />
                                                ) : (
                                                    <div className="flex flex-col items-center gap-2 text-gray-500 group-hover:text-accent-gold transition-colors">
                                                        <ImageIcon size={28} className="opacity-50" />
                                                        <span className="text-[10px] font-bold uppercase tracking-widest">Click to Upload Image</span>
                                                    </div>
                                                )}
                                            </div>
                                            {isUploading && (
                                                <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center text-white text-xs font-bold gap-2 rounded-2xl">
                                                    <Loader2 className="animate-spin" size={20} />
                                                    <span className="text-accent-gold">Uploading...</span>
                                                </div>
                                            )}
                                        </div>
                                        <input type="file" ref={imageInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'image')} />
                                        <input 
                                            type="text" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)}
                                            className="mt-2 w-full bg-white/[0.02] border border-white/[0.06] rounded-lg px-3 py-1.5 text-xs text-gray-500 font-mono focus:outline-none focus:border-accent-gold/30 transition-all"
                                            placeholder="Or paste image URL..."
                                        />
                                    </div>

                                    {/* Content Link / Zip Upload */}
                                    <div>
                                        <label className="block text-gray-400 text-[10px] uppercase font-bold tracking-widest mb-2 ml-0.5">
                                            {category === 'Skin' ? 'Skin Package (.ZIP)' : 'Content File / Link'}
                                        </label>
                                        
                                        <div className="space-y-2">
                                            <button 
                                                onClick={() => fileInputRef.current?.click()}
                                                disabled={isUploading}
                                                className="w-full py-3.5 rounded-xl bg-white/[0.02] border border-dashed border-white/10 hover:bg-accent-gold/5 hover:border-accent-gold/30 transition-all flex items-center justify-center gap-2 text-gray-400 hover:text-accent-gold disabled:opacity-50"
                                            >
                                                {isUploading ? <Loader2 className="animate-spin" size={16} /> : <Upload size={16} />}
                                                <span className="text-[10px] font-bold uppercase tracking-widest">
                                                    {isUploading ? 'Uploading...' : `Upload ${category === 'Skin' ? 'Skin Zip' : 'File'}`}
                                                </span>
                                            </button>
                                            <div className="relative">
                                                <FileText size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
                                                <input
                                                    type="text" value={downloadUrl} onChange={e => setDownloadUrl(e.target.value)}
                                                    className="w-full bg-white/[0.02] border border-white/[0.06] rounded-xl pl-9 pr-4 py-2.5 text-white focus:outline-none focus:border-accent-gold/30 transition-all text-xs font-mono placeholder:text-gray-600"
                                                    placeholder="https://..."
                                                />
                                            </div>
                                        </div>
                                        <input type="file" ref={fileInputRef} className="hidden" accept={category === 'Skin' ? ".zip" : "*"} onChange={(e) => handleFileUpload(e, 'zip')} />
                                    </div>

                                    {/* Live Preview Card */}
                                    {name && (
                                        <div className="p-4 bg-white/[0.02] rounded-xl border border-white/[0.06]">
                                            <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mb-2">Preview</p>
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-accent-gold/10 border border-accent-gold/20 flex items-center justify-center text-lg">
                                                    {category === 'Badge' ? '🎖️' : category === 'Perk' ? '⚡' : category === 'Skin' ? '🎨' : '📦'}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-white font-bold text-sm truncate">{name}</p>
                                                    <p className="text-gray-500 text-[10px] font-mono">{price ? `${parseInt(price).toLocaleString()} Cr` : '0 Cr'} · {category}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="p-5 border-t border-white/10 flex justify-between items-center bg-white/[0.01]">
                            <p className="text-[9px] text-gray-600 font-mono uppercase tracking-widest">
                                {editing ? `Editing: ${editing.name}` : 'New item will be added to the store'}
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="px-5 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all font-bold text-xs uppercase tracking-widest border border-transparent hover:border-white/10"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={saving || isUploading || !name || !description || !price}
                                    className="bg-accent-gold text-dark-950 px-8 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-white transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-accent-gold/10"
                                >
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                    {editing ? 'Save Changes' : 'Create Item'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
