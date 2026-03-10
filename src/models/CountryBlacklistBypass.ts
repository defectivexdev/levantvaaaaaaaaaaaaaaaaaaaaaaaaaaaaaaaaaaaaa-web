import mongoose, { Schema, Document } from 'mongoose';

export interface ICountryBlacklistBypass extends Document {
    pilot_id: string;
    country_code: string;
    reason?: string;
    added_by: string;
    created_at: Date;
}

const CountryBlacklistBypassSchema = new Schema<ICountryBlacklistBypass>({
    pilot_id: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true,
    },
    country_code: {
        type: String,
        required: true,
        uppercase: true,
        trim: true,
    },
    reason: {
        type: String,
        trim: true,
    },
    added_by: {
        type: String,
        required: true,
    },
    created_at: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.models.CountryBlacklistBypass || mongoose.model<ICountryBlacklistBypass>('CountryBlacklistBypass', CountryBlacklistBypassSchema);
