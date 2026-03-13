import { useEffect, useState } from 'react';
import { Trophy, TrendingUp, Bell } from 'lucide-react';

interface Notification {
    id: string;
    type: 'badge_earned' | 'rank_promotion' | 'system';
    title: string;
    message: string;
    timestamp: Date;
    read: boolean;
}

export default function NotificationsWidget() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            // This would fetch from your notifications API
            // For now, showing placeholder structure
            setNotifications([]);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'badge_earned':
                return <Trophy className="w-4 h-4 text-accent-gold" />;
            case 'rank_promotion':
                return <TrendingUp className="w-4 h-4 text-accent" />;
            default:
                return <Bell className="w-4 h-4 text-txt-secondary" />;
        }
    };

    return (
        <div className="glass-panel rounded-xl border border-white/[0.06] overflow-hidden">
            <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-accent-gold" />
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Notifications</h3>
                </div>
                {notifications.length > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-accent-gold/20 text-accent-gold text-[10px] font-bold">
                        {notifications.filter(n => !n.read).length}
                    </span>
                )}
            </div>

            <div className="max-h-64 overflow-y-auto">
                {loading ? (
                    <div className="p-6 text-center">
                        <div className="animate-pulse space-y-2">
                            <div className="h-12 bg-surface-elevated rounded"></div>
                            <div className="h-12 bg-surface-elevated rounded"></div>
                        </div>
                    </div>
                ) : notifications.length > 0 ? (
                    <div className="divide-y divide-white/[0.04]">
                        {notifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={`p-4 hover:bg-white/[0.02] transition-colors cursor-pointer ${
                                    !notification.read ? 'bg-accent-gold/5' : ''
                                }`}
                            >
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-surface-elevated flex items-center justify-center flex-shrink-0">
                                        {getIcon(notification.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold text-white mb-0.5">
                                            {notification.title}
                                        </p>
                                        <p className="text-[10px] text-txt-secondary line-clamp-2">
                                            {notification.message}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-8 text-center">
                        <Bell className="w-10 h-10 text-txt-disabled mx-auto mb-2 opacity-30" />
                        <p className="text-xs text-txt-disabled">No new notifications</p>
                    </div>
                )}
            </div>
        </div>
    );
}
