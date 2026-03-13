import PilotBadge from '@/models/PilotBadge';
import Pilot from '@/models/Pilot';
import Flight from '@/models/Flight';
import { BADGE_DEFINITIONS, getBadgeById } from '@/config/badges';
import { createNotification } from '@/lib/notifications';
import mongoose from 'mongoose';

export async function checkAndAwardBadges(pilotId: string, flightId?: string): Promise<string[]> {
    const awardedBadges: string[] = [];
    
    try {
        const pilot = await Pilot.findById(pilotId);
        if (!pilot) return awardedBadges;

        const totalHours = pilot.total_hours + (pilot.transfer_hours || 0);
        const existingBadges = await PilotBadge.find({ pilot_id: pilotId }).select('badge_id');
        const earnedBadgeIds = new Set(existingBadges.map(b => b.badge_id));

        for (const badgeDef of BADGE_DEFINITIONS) {
            if (earnedBadgeIds.has(badgeDef.badge_id)) continue;

            const earned = await checkBadgeRequirement(pilot, badgeDef, totalHours, flightId);
            
            if (earned) {
                await PilotBadge.create({
                    pilot_id: pilotId,
                    badge_id: badgeDef.badge_id,
                    earned_at: new Date(),
                    metadata: flightId ? { flight_id: flightId } : {}
                });

                await createNotification({
                    pilotId: new mongoose.Types.ObjectId(pilotId),
                    type: 'badge_earned',
                    title: `Badge Earned: ${badgeDef.name}`,
                    message: badgeDef.description
                });

                awardedBadges.push(badgeDef.badge_id);
            }
        }

        return awardedBadges;
    } catch (error) {
        console.error('Error checking badges:', error);
        return awardedBadges;
    }
}

async function checkBadgeRequirement(
    pilot: any,
    badgeDef: any,
    totalHours: number,
    flightId?: string
): Promise<boolean> {
    const { type, value } = badgeDef.requirement;

    switch (type) {
        case 'total_flights':
            return (pilot.total_flights || 0) >= value;

        case 'total_hours':
            return totalHours >= value;

        case 'combined':
            if (value === '5000h_2000f') {
                return totalHours >= 5000 && pilot.total_flights >= 2000;
            }
            return false;

        case 'landing_rate':
            if (!flightId) return false;
            const flight = await Flight.findById(flightId);
            if (!flight || !flight.landing_rate) return false;
            
            if (value === '-50_-150') {
                return flight.landing_rate >= -150 && flight.landing_rate <= -50;
            }
            if (value === '-500+') {
                return flight.landing_rate <= -500;
            }
            return false;

        case 'butter_landings':
            const butterCount = await Flight.countDocuments({
                pilot_id: pilot._id,
                landing_rate: { $gte: -150, $lte: -50 }
            });
            return butterCount >= value;

        case 'night_flights':
            const nightCount = await Flight.countDocuments({
                pilot_id: pilot._id,
                is_night_flight: true
            });
            return nightCount >= value;

        case 'flight_duration':
            if (!flightId) return false;
            const longFlight = await Flight.findById(flightId);
            if (!longFlight || !longFlight.flight_time) return false;
            return (longFlight.flight_time / 60) >= value;

        case 'airport':
            if (!flightId) return false;
            const airportFlight = await Flight.findById(flightId);
            return airportFlight?.arrival === value;

        case 'unique_countries':
            const uniqueCountries = await Flight.distinct('arrival_country', {
                pilot_id: pilot._id
            });
            return uniqueCountries.length >= value;

        case 'domestic_flights':
            const domesticCount = await Flight.countDocuments({
                pilot_id: pilot._id,
                is_domestic: true
            });
            return domesticCount >= value;

        case 'international_flights':
            const intlCount = await Flight.countDocuments({
                pilot_id: pilot._id,
                is_domestic: false
            });
            return intlCount >= value;

        case 'network_flights':
            const networkCount = await Flight.countDocuments({
                pilot_id: pilot._id,
                network: { $in: ['vatsim', 'ivao'] }
            });
            return networkCount >= value;

        case 'aircraft_flights':
            if (value.startsWith('A350_')) {
                const count = parseInt(value.split('_')[1]);
                const a350Count = await Flight.countDocuments({
                    pilot_id: pilot._id,
                    aircraft: { $regex: /A350/i }
                });
                return a350Count >= count;
            }
            return false;

        default:
            return false;
    }
}

export async function getPilotBadges(pilotId: string) {
    const pilotBadges = await PilotBadge.find({ pilot_id: pilotId }).sort({ earned_at: -1 });
    
    return pilotBadges.map(pb => {
        const badgeDef = getBadgeById(pb.badge_id);
        return {
            ...pb.toObject(),
            ...badgeDef
        };
    });
}

export async function getBadgeProgress(pilotId: string) {
    const pilot = await Pilot.findById(pilotId);
    if (!pilot) return [];

    const earnedBadges = await PilotBadge.find({ pilot_id: pilotId }).select('badge_id');
    const earnedBadgeIds = new Set(earnedBadges.map(b => b.badge_id));

    const progress = [];
    for (const badgeDef of BADGE_DEFINITIONS) {
        if (earnedBadgeIds.has(badgeDef.badge_id)) {
            progress.push({
                ...badgeDef,
                earned: true,
                progress: 100
            });
        } else {
            const currentProgress = await calculateBadgeProgress(pilot, badgeDef);
            progress.push({
                ...badgeDef,
                earned: false,
                progress: currentProgress
            });
        }
    }

    return progress;
}

async function calculateBadgeProgress(pilot: any, badgeDef: any): Promise<number> {
    const { type, value } = badgeDef.requirement;
    const totalHours = pilot.total_hours + (pilot.transfer_hours || 0);

    switch (type) {
        case 'total_flights':
            return Math.min((pilot.total_flights / value) * 100, 100);
        
        case 'total_hours':
            return Math.min((totalHours / value) * 100, 100);
        
        case 'butter_landings':
            const butterCount = await Flight.countDocuments({
                pilot_id: pilot._id,
                landing_rate: { $gte: -150, $lte: -50 }
            });
            return Math.min((butterCount / value) * 100, 100);
        
        case 'night_flights':
            const nightCount = await Flight.countDocuments({
                pilot_id: pilot._id,
                is_night_flight: true
            });
            return Math.min((nightCount / value) * 100, 100);

        case 'unique_countries':
            const uniqueCountries = await Flight.distinct('arrival_country', {
                pilot_id: pilot._id
            });
            return Math.min((uniqueCountries.length / value) * 100, 100);

        default:
            return 0;
    }
}
