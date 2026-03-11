import mongoose, { Schema, Document } from 'mongoose';

export interface IPilotAward extends Document {
    pilot_id: string;
    award_id: mongoose.Types.ObjectId;
    earned_at: Date;
    seen: boolean;
}

const PilotAwardSchema = new Schema<IPilotAward>({
    pilot_id: { type: String, required: true, index: true },
    award_id: { type: Schema.Types.ObjectId, ref: 'Award', required: true, index: true },
    earned_at: { type: Date, default: Date.now },
    seen: { type: Boolean, default: false },
});

// Compound indexes
PilotAwardSchema.index({ pilot_id: 1, award_id: 1 }, { unique: true });
PilotAwardSchema.index({ pilot_id: 1, earned_at: -1 });
PilotAwardSchema.index({ pilot_id: 1, seen: 1, earned_at: -1 });

const PilotAward = mongoose.models.PilotAward || mongoose.model<IPilotAward>('PilotAward', PilotAwardSchema);
export default PilotAward;
