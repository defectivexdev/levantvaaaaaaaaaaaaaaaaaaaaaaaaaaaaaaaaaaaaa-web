import mongoose, { Schema, Document } from 'mongoose';

export interface IIVAOVerification extends Document {
    pilot_id: string;
    ivao_vid: string;
    atc_rating: number;
    pilot_rating: number;
    division: string;
    verified_at: Date;
    last_sync: Date;
    discord_roles_assigned: boolean;
}

const IVAOVerificationSchema = new Schema<IIVAOVerification>({
    pilot_id: { type: String, required: true, unique: true, index: true },
    ivao_vid: { type: String, required: true, index: true },
    atc_rating: { type: Number, default: 1 },
    pilot_rating: { type: Number, default: 2 },
    division: { type: String, default: '' },
    verified_at: { type: Date, default: Date.now },
    last_sync: { type: Date, default: Date.now },
    discord_roles_assigned: { type: Boolean, default: false },
}, {
    timestamps: true,
});

const IVAOVerification = mongoose.models.IVAOVerification || mongoose.model<IIVAOVerification>('IVAOVerification', IVAOVerificationSchema);
export default IVAOVerification;
