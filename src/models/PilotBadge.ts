import mongoose, { Schema, Document } from 'mongoose';

export interface IPilotBadge extends Document {
    pilot_id: mongoose.Types.ObjectId;
    badge_id: string;
    earned_at: Date;
    progress?: number;
    metadata?: {
        flight_id?: string;
        location?: string;
        aircraft?: string;
        [key: string]: any;
    };
}

const PilotBadgeSchema = new Schema<IPilotBadge>({
    pilot_id: { type: Schema.Types.ObjectId, ref: 'Pilot', required: true, index: true },
    badge_id: { type: String, required: true, index: true },
    earned_at: { type: Date, default: Date.now },
    progress: { type: Number, default: 0 },
    metadata: { type: Schema.Types.Mixed }
}, {
    timestamps: true
});

PilotBadgeSchema.index({ pilot_id: 1, badge_id: 1 }, { unique: true });

const PilotBadge = mongoose.models.PilotBadge || mongoose.model<IPilotBadge>('PilotBadge', PilotBadgeSchema);
export default PilotBadge;
