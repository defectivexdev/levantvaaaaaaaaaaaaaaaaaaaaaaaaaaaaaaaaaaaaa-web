import mongoose, { Schema, Document } from 'mongoose';

export interface IStoreItem extends Document {
    name: string;
    description?: string;
    price: number;
    category?: string;
    image?: string;
    download_url?: string;
    active: boolean;
    created_at: Date;
}

const StoreItemSchema = new Schema<IStoreItem>({
    name: { type: String, required: true },
    description: String,
    price: { type: Number, required: true, index: true },
    category: { type: String, index: true },
    image: String,
    download_url: String,
    active: { type: Boolean, default: true, index: true },
    created_at: { type: Date, default: Date.now },
});

const StoreItem = mongoose.models.StoreItem || mongoose.model<IStoreItem>('StoreItem', StoreItemSchema);
export default StoreItem;
