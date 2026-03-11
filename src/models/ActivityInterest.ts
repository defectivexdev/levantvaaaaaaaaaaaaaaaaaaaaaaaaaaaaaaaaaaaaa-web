import mongoose, { Schema, Document } from 'mongoose';

export interface IActivityInterest extends Document {
    activity_id: mongoose.Types.ObjectId;
    pilot_id: string;
    created_at: Date;
}

const ActivityInterestSchema = new Schema<IActivityInterest>({
    activity_id: { type: Schema.Types.ObjectId, ref: 'Activity', required: true, index: true },
    pilot_id: { type: String, required: true, index: true },
    created_at: { type: Date, default: Date.now },
});

ActivityInterestSchema.index({ activity_id: 1, pilot_id: 1 }, { unique: true });

const ActivityInterest = mongoose.models.ActivityInterest || mongoose.model<IActivityInterest>('ActivityInterest', ActivityInterestSchema);
export default ActivityInterest;
