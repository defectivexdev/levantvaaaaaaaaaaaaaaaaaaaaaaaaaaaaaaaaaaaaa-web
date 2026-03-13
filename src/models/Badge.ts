import mongoose, { Schema, Document } from 'mongoose';

export type BadgeTier = 'bronze' | 'silver' | 'gold' | 'diamond';
export type BadgeCategory = 'flight_count' | 'hours' | 'landing' | 'special' | 'location' | 'time' | 'aircraft' | 'network' | 'event';

export interface IBadge extends Document {
    badge_id: string;
    name: string;
    description: string;
    category: BadgeCategory;
    tier: BadgeTier;
    icon: string;
    image?: string;
    requirement: {
        type: string;
        value: number | string;
        condition?: string;
    };
    points: number;
    order: number;
    active: boolean;
    created_at: Date;
}

const BadgeSchema = new Schema<IBadge>({
    badge_id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    category: { 
        type: String, 
        enum: ['flight_count', 'hours', 'landing', 'special', 'location', 'time', 'aircraft', 'network', 'event'],
        required: true 
    },
    tier: { 
        type: String, 
        enum: ['bronze', 'silver', 'gold', 'diamond'],
        required: true 
    },
    icon: { type: String, required: true },
    requirement: {
        type: { type: String, required: true },
        value: { type: Schema.Types.Mixed, required: true },
        condition: String
    },
    points: { type: Number, default: 0 },
    order: { type: Number, default: 0 },
    active: { type: Boolean, default: true }
}, {
    timestamps: true
});

const Badge = mongoose.models.Badge || mongoose.model<IBadge>('Badge', BadgeSchema);
export default Badge;
