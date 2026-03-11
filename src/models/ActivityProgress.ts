import mongoose, { Schema, Document } from 'mongoose';

export interface IActivityProgress extends Document {
    activity_id: mongoose.Types.ObjectId;
    pilot_id: string;
    legsComplete: number;
    percentComplete: number;
    completedLegIds: string[];
    startDate: Date;
    dateComplete?: Date;
    lastLegFlownDate?: Date;
    daysToComplete?: number;
}

const ActivityProgressSchema = new Schema<IActivityProgress>({
    activity_id: { type: Schema.Types.ObjectId, ref: 'Activity', required: true, index: true },
    pilot_id: { type: String, required: true, index: true },
    legsComplete: { type: Number, default: 0 },
    percentComplete: { type: Number, default: 0 },
    completedLegIds: [String],
    startDate: { type: Date, default: Date.now },
    dateComplete: Date,
    lastLegFlownDate: Date,
    daysToComplete: Number,
});

ActivityProgressSchema.index({ activity_id: 1, pilot_id: 1 }, { unique: true });

const ActivityProgress = mongoose.models.ActivityProgress || mongoose.model<IActivityProgress>('ActivityProgress', ActivityProgressSchema);
export default ActivityProgress;
