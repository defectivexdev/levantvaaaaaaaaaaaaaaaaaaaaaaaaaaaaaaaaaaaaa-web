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
        if (pilot.rank !== currentRankConfig.name) {
            const oldRank = pilot.rank;
            pilot.rank = currentRankConfig.name;
            await pilot.save();

            // Send notification about rank promotion
            await createNotification({
                pilotId: new mongoose.Types.ObjectId(pilotId),
                type: 'system',
                title: `Rank Promotion: ${currentRankConfig.name}`,
                message: `Congratulations! You've been promoted to ${currentRankConfig.name} with ${Math.floor(totalHours)} flight hours.`
            });

            return {
                updated: true,
                oldRank,
                newRank: currentRankConfig.name
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
        const currentIndex = PILOT_RANKS.findIndex(r => r.id === currentRank.id);
        const nextRank = currentIndex < PILOT_RANKS.length - 1 ? PILOT_RANKS[currentIndex + 1] : null;
        
        // Calculate progress to next rank
        let progress = 100;
        let hoursToNext = 0;
        
        if (nextRank) {
            const hoursInCurrentRank = totalHours - currentRank.minHours;
            const hoursNeededForNext = nextRank.minHours - currentRank.minHours;
            progress = Math.min((hoursInCurrentRank / hoursNeededForNext) * 100, 100);
            hoursToNext = nextRank.minHours - totalHours;
        }

        return {
            currentRank: {
                id: currentRank.id,
                name: currentRank.name,
                image: currentRank.image,
                minHours: currentRank.minHours,
                maxHours: currentRank.maxHours
            },
            nextRank: nextRank ? {
                id: nextRank.id,
                name: nextRank.name,
                image: nextRank.image,
                minHours: nextRank.minHours
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
