'use client';

import { useEffect } from 'react';
import Pusher from 'pusher-js';

// Initialize Pusher client
let pusher: Pusher | null = null;

function getPusher() {
    if (!pusher && typeof window !== 'undefined') {
        pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY || '', {
            cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'eu',
        });
    }
    return pusher;
}

/**
 * Hook to listen for real-time flight updates via Pusher
 * @param onUpdate - Callback when flight data is updated
 * @param onComplete - Optional callback when flight is completed/landed
 */
export function useFlightSocket(
    onUpdate: (data: any) => void,
    onComplete?: (data: any) => void
) {
    useEffect(() => {
        const pusherClient = getPusher();
        if (!pusherClient) return;

        const channel = pusherClient.subscribe('flights');

        // Listen for flight updates
        channel.bind('flight-update', (data: any) => {
            onUpdate(data);
        });

        // Listen for flight completion
        if (onComplete) {
            channel.bind('flight-complete', (data: any) => {
                onComplete(data);
            });
        }

        // Cleanup
        return () => {
            channel.unbind_all();
            channel.unsubscribe();
        };
    }, [onUpdate, onComplete]);
}
