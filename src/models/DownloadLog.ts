import mongoose, { Schema, Document } from 'mongoose';

export interface IDownloadLog extends Document {
    pilot_id?: string;
    file_name: string;
    file_size?: number;
    ip_address?: string;
    user_agent?: string;
    downloaded_at: Date;
}

const DownloadLogSchema = new Schema<IDownloadLog>({
    pilot_id: { type: String, index: true },
    file_name: { type: String, required: true, index: true },
    file_size: Number,
    ip_address: String,
    user_agent: String,
    downloaded_at: { type: Date, default: Date.now, index: true },
});

const DownloadLog = mongoose.models.DownloadLog || mongoose.model<IDownloadLog>('DownloadLog', DownloadLogSchema);
export { DownloadLog };
export default DownloadLog;
