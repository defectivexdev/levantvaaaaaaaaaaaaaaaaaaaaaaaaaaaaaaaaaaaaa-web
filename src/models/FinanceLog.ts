import mongoose, { Schema, Document } from 'mongoose';

export interface IFinanceLog extends Document {
    pilot_id: string;
    type: string;
    amount: number;
    description?: string;
    reference_id?: string;
    created_at: Date;
}

const FinanceLogSchema = new Schema<IFinanceLog>({
    pilot_id: { type: String, required: true, index: true },
    type: { type: String, required: true, index: true },
    amount: { type: Number, required: true },
    description: String,
    reference_id: String,
    created_at: { type: Date, default: Date.now, index: true },
});

const FinanceLog = mongoose.models.FinanceLog || mongoose.model<IFinanceLog>('FinanceLog', FinanceLogSchema);
export default FinanceLog;
