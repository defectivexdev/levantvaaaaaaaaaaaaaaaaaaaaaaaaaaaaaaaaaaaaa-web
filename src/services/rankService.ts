import Pilot from '@/models/Pilot';
import { getRankByHours, PILOT_RANKS } from '@/config/ranks';
import { createNotification } from '@/lib/notifications';
import mongoose from 'mongoose';

export async function updatePilotRank(pilotId: string): Promise<{ updated: boolean; oldRank?: string; newRank?: string }> {
    try {
        const pilot = await Pilot.findById(pilotId);
        if (!pilot) {
            return { updated: false };
        }

        const totalHours = pilot.total_hours + (pilot.transfer_hours || 0);
        const currentRankConfig = getRankByHours(totalHours);
        
        // Check if rank needs updating
        if (pilot.rank !== currentRankConfig.rank_name) {
            const oldRank = pilot.rank;
            pilot.rank = currentRankConfig.rank_name;
            await pilot.save();

            // Send notification about rank promotion
            await createNotification({
                pilotId: new mongoose.Types.ObjectId(pilotId),
                type: 'system',
                title: `Rank Promotion: ${currentRankConfig.rank_name}`,
                message: `Congratulations! You've been promoted to ${currentRankConfig.rank_name} with ${Math.floor(totalHours)} flight hours.`
            });

            return {
                updated: true,
                oldRank,
                newRank: currentRankConfig.rank_name
            };
        }

        return { updated: false };
    } catch (error) {
        console.error('Error updating pilot rank:', error);
        return { updated: false };
    }
}

export async function getPilotRankInfo(pilotId: string) {
    try {
        const pilot = await Pilot.findById(pilotId);
        if (!pilot) return null;

        const totalHours = pilot.total_hours + (pilot.transfer_hours || 0);
        const currentRank = getRankByHours(totalHours);
        
        // Find next rank
        const currentRankIndex = PILOT_RANKS.findIndex(r => r.rank_id === currentRank.rank_id);
        const nextRank = currentRankIndex < PILOT_RANKS.length - 1 ? PILOT_RANKS[currentRankIndex + 1] : null;
        
        // Calculate progress to next rank
        let progress = 100;
        let hoursToNext = 0;
        
        if (nextRank) {
            const hoursInCurrentRank = totalHours - currentRank.required_hours;
            const hoursNeededForNext = nextRank.required_hours - currentRank.required_hours;
            progress = Math.min((hoursInCurrentRank / hoursNeededForNext) * 100, 100);
            hoursToNext = nextRank.required_hours - totalHours;
        }

        return {
            currentRank: {
                id: currentRank.rank_id,
                name: currentRank.rank_name,
                image: currentRank.rank_image,
                minHours: currentRank.required_hours,
                maxHours: currentRank.required_hours /* TODO maxHours? */
            },
            nextRank: nextRank ? {
                id: nextRank.rank_id,
                name: nextRank.rank_name,
                image: nextRank.rank_image,
                minHours: nextRank.required_hours
            } : null,
            totalHours,
            progress,
            hoursToNext: Math.max(hoursToNext, 0)
        };
    } catch (error) {
        console.error('Error getting pilot rank info:', error);
        return null;
    }
}

export function getTierByHours(totalHours: number): 'bronze' | 'silver' | 'gold' | 'diamond' {
    if (totalHours < 150) return 'bronze';
    if (totalHours < 1000) return 'silver';
    if (totalHours < 5000) return 'gold';
    return 'diamond';
}

export function getTierBadge(tier: 'bronze' | 'silver' | 'gold' | 'diamond'): string {
    const badges = {
        bronze: '🥉',
        silver: '🥈',
        gold: '🥇',
        diamond: '💎'
    };
    return badges[tier];
}

export function getTierName(tier: 'bronze' | 'silver' | 'gold' | 'diamond'): string {
    const names = {
        bronze: 'Beginner',
        silver: 'Intermediate',
        gold: 'Expert',
        diamond: 'Elite'
    };
    return names[tier];
}
