import mongoose, { Schema, Document } from 'mongoose';

export interface IMultiplayerEvent extends Document {
    title: string;
    description: string;
    eventType: 'group_flight';
    status: 'scheduled' | 'active' | 'completed' | 'cancelled';
    
    // Announcement Details
    localTime?: boolean; // If true, show time in user's local time
    reminderMinutes?: number; // Minutes before departure to remind pilots (default: 15)
    
    // Schedule
    startTime: Date;
    timezone: string;
    
    // Flight Details
    departureIcao: string;
    departureAirport?: string;
    arrivalIcao: string;
    arrivalAirport?: string;
    route?: string;
    aircraft?: string;
    cruiseAltitude?: number;
    estimatedFlightTime?: string; // Format: "2h 30m"
    
    // Participation
    maxParticipants?: number;
    participants: {
        pilotId: string;
        pilotName: string;
        joinedAt: Date;
        status: 'registered' | 'flying' | 'completed' | 'dnf';
        callsign?: string;
        flightId?: string;
    }[];
    
    // Scoring (for competitive events)
    scoringEnabled: boolean;
    scoringCriteria?: {
        landingRate: boolean;
        fuelEfficiency: boolean;
        onTimeArrival: boolean;
        smoothness: boolean;
    };
    
    // Leaderboard
    leaderboard: {
        pilotId: string;
        pilotName: string;
        score: number;
        landingRate?: number;
        fuelUsed?: number;
        flightTime?: string;
        completedAt: Date;
    }[];
    
    // Rewards
    rewards?: {
        first?: string;
        second?: string;
        third?: string;
        participation?: string;
    };
    
    // Credit Rewards
    creditRewards?: {
        enabled: boolean;
        participationCredits?: number;
    };
    
    // Settings
    requiresApproval: boolean;
    isPublic: boolean;
    discordWebhook?: string;
    bannerImage?: string;
    
    // Metadata
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}

const MultiplayerEventSchema = new Schema<IMultiplayerEvent>({
    title: { type: String, required: true },
    description: { type: String, required: true },
    eventType: { 
        type: String, 
        enum: ['group_flight'],
        default: 'group_flight',
        required: true 
    },
    status: { 
        type: String, 
        enum: ['scheduled', 'active', 'completed', 'cancelled'],
        default: 'scheduled'
    },
    
    startTime: { type: Date, required: true },
    timezone: { type: String, default: 'UTC' },
    
    departureIcao: { type: String, required: true },
    departureAirport: String,
    arrivalIcao: { type: String, required: true },
    arrivalAirport: String,
    route: String,
    aircraft: String,
    cruiseAltitude: Number,
    estimatedFlightTime: String,
    
    // Announcement Details
    localTime: { type: Boolean, default: true },
    reminderMinutes: { type: Number, default: 15 },
    
    maxParticipants: Number,
    participants: [{
        pilotId: { type: String, required: true },
        pilotName: { type: String, required: true },
        joinedAt: { type: Date, default: Date.now },
        status: { 
            type: String, 
            enum: ['registered', 'flying', 'completed', 'dnf'],
            default: 'registered'
        },
        callsign: String,
        flightId: String,
    }],
    
    scoringEnabled: { type: Boolean, default: false },
    scoringCriteria: {
        landingRate: { type: Boolean, default: true },
        fuelEfficiency: { type: Boolean, default: true },
        onTimeArrival: { type: Boolean, default: true },
        smoothness: { type: Boolean, default: true },
    },
    
    leaderboard: [{
        pilotId: { type: String, required: true },
        pilotName: { type: String, required: true },
        score: { type: Number, required: true },
        landingRate: Number,
        fuelUsed: Number,
        flightTime: String,
        completedAt: { type: Date, required: true },
    }],
    
    rewards: {
        first: String,
        second: String,
        third: String,
        participation: String,
    },
    
    creditRewards: {
        enabled: { type: Boolean, default: false },
        participationCredits: Number,
    },
    
    requiresApproval: { type: Boolean, default: false },
    isPublic: { type: Boolean, default: true },
    discordWebhook: String,
    bannerImage: String,
    
    createdBy: { type: String, required: true },
}, {
    timestamps: true,
});

// Indexes
MultiplayerEventSchema.index({ status: 1, startTime: 1 });
MultiplayerEventSchema.index({ 'participants.pilotId': 1 });
MultiplayerEventSchema.index({ eventType: 1 });

export default mongoose.models.MultiplayerEvent || mongoose.model<IMultiplayerEvent>('MultiplayerEvent', MultiplayerEventSchema);
