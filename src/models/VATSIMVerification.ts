import mongoose, { Schema, Document } from 'mongoose';

export interface IVATSIMVerification extends Document {
    pilot_id: string;
    vatsim_cid: string;
    rating: number;
    pilotrating: number;
    division: string;
    region: string;
    subdivision: string;
    verified_at: Date;
    last_sync: Date;
    discord_roles_assigned: boolean;
}

const VATSIMVerificationSchema = new Schema<IVATSIMVerification>({
    pilot_id: { type: String, required: true, unique: true, index: true },
    vatsim_cid: { type: String, required: true, index: true },
    rating: { type: Number, default: 1 },
    pilotrating: { type: Number, default: 0 },
    division: { type: String, default: '' },
    region: { type: String, default: '' },
    subdivision: { type: String, default: '' },
    verified_at: { type: Date, default: Date.now },
    last_sync: { type: Date, default: Date.now },
    discord_roles_assigned: { type: Boolean, default: false },
}, {
    timestamps: true,
});

const VATSIMVerification = mongoose.models.VATSIMVerification || mongoose.model<IVATSIMVerification>('VATSIMVerification', VATSIMVerificationSchema);
export default VATSIMVerification;
