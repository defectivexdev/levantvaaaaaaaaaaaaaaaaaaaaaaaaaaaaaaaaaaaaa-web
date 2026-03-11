import mongoose, { Schema, Document } from 'mongoose';

export interface ITourProgress extends Document {
    tour_id: mongoose.Types.ObjectId;
    pilot_id: string;
    current_leg: number;
    completed_legs: number[];
    started_at: Date;
    completed_at?: Date;
}

const TourProgressSchema = new Schema<ITourProgress>({
    tour_id: { type: Schema.Types.ObjectId, ref: 'Tour', required: true, index: true },
    pilot_id: { type: String, required: true, index: true },
    current_leg: { type: Number, default: 0 },
    completed_legs: [Number],
    started_at: { type: Date, default: Date.now },
    completed_at: Date,
});

TourProgressSchema.index({ tour_id: 1, pilot_id: 1 }, { unique: true });

const TourProgress = mongoose.models.TourProgress || mongoose.model<ITourProgress>('TourProgress', TourProgressSchema);
export default TourProgress;
