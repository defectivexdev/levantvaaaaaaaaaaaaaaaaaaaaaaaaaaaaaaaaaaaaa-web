import mongoose, { Schema, Document } from 'mongoose';

export interface ISecurityConfig extends Document {
    key: string;
    hwid_lock_enabled: boolean;
    country_block_enabled: boolean;
    blocked_login_countries: string[];
    updated_at: Date;
    updated_by?: string;
}

const SecurityConfigSchema = new Schema<ISecurityConfig>({
    key: { type: String, default: 'LVT_SECURITY', unique: true, index: true },
    hwid_lock_enabled: { type: Boolean, default: true },
    country_block_enabled: { type: Boolean, default: false },
    blocked_login_countries: { type: [String], default: [] },
    updated_at: { type: Date, default: Date.now },
    updated_by: { type: String },
});

const SecurityConfig = mongoose.models.SecurityConfig || mongoose.model<ISecurityConfig>('SecurityConfig', SecurityConfigSchema);
export default SecurityConfig;
