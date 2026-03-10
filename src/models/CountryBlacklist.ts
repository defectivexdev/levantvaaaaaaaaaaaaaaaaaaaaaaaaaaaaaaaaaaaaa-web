import mongoose, { Schema, Document } from 'mongoose';

export interface ICountryBlacklist extends Document {
    country_code: string;
    country_name: string;
    reason?: string;
    added_by: string;
    created_at: Date;
}

const CountryBlacklistSchema = new Schema<ICountryBlacklist>({
    country_code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true,
    },
    country_name: {
        type: String,
        required: true,
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

export default mongoose.models.CountryBlacklist || mongoose.model<ICountryBlacklist>('CountryBlacklist', CountryBlacklistSchema);
