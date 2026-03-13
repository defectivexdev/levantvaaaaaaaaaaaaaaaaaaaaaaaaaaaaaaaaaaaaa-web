/**
 * Email Notification System Types
 * Comprehensive notification management for all VA events
 */

// ============================================================================
// NOTIFICATION TYPES
// ============================================================================

export enum EmailNotificationType {
    // Registration & Account
    WELCOME = 'welcome',
    REGISTRATION_APPROVED = 'registration_approved',
    REGISTRATION_REJECTED = 'registration_rejected',
    ACCOUNT_BLACKLISTED = 'account_blacklisted',
    PASSWORD_RESET = 'password_reset',
    EMAIL_VERIFICATION = 'email_verification',
    
    // PIREP (Pilot Report)
    PIREP_SUBMITTED = 'pirep_submitted',
    PIREP_APPROVED = 'pirep_approved',
    PIREP_REJECTED = 'pirep_rejected',
    PIREP_UNDER_REVIEW = 'pirep_under_review',
    
    // Group Flights
    GROUP_FLIGHT_REMINDER_24H = 'group_flight_reminder_24h',
    GROUP_FLIGHT_REMINDER_1H = 'group_flight_reminder_1h',
    GROUP_FLIGHT_STARTED = 'group_flight_started',
    GROUP_FLIGHT_CANCELLED = 'group_flight_cancelled',
    GROUP_FLIGHT_JOINED = 'group_flight_joined',
    
    // Achievements & Progression
    BADGE_EARNED = 'badge_earned',
    RANK_PROMOTION = 'rank_promotion',
    MILESTONE_REACHED = 'milestone_reached',
    
    // Events & Competitions
    EVENT_INVITATION = 'event_invitation',
    EVENT_STARTING_SOON = 'event_starting_soon',
    EVENT_RESULTS = 'event_results',
    COMPETITION_WON = 'competition_won',
    
    // Leave of Absence
    LOA_REQUESTED = 'loa_requested',
    LOA_APPROVED = 'loa_approved',
    LOA_REJECTED = 'loa_rejected',
    LOA_EXPIRING_SOON = 'loa_expiring_soon',
    LOA_EXPIRED = 'loa_expired',
    
    // Financial
    PAYMENT_RECEIVED = 'payment_received',
    BONUS_AWARDED = 'bonus_awarded',
    
    // Administrative
    ADMIN_MESSAGE = 'admin_message',
    SYSTEM_ANNOUNCEMENT = 'system_announcement',
}

export enum EmailPriority {
    LOW = 'low',
    NORMAL = 'normal',
    HIGH = 'high',
    URGENT = 'urgent',
}

// ============================================================================
// EMAIL TEMPLATE DATA
// ============================================================================

export interface EmailTemplateData {
    // User data
    pilot_name: string;
    pilot_email: string;
    pilot_id: string;
    
    // Common
    va_name: string;
    va_logo_url?: string;
    support_email: string;
    dashboard_url: string;
    
    // Specific data per notification type
    [key: string]: any;
}

// ============================================================================
// NOTIFICATION SPECIFIC DATA
// ============================================================================

export interface WelcomeEmailData extends EmailTemplateData {
    activation_link?: string;
    getting_started_url: string;
}

export interface RegistrationApprovedData extends EmailTemplateData {
    approved_by: string;
    login_url: string;
    next_steps: string[];
}

export interface RegistrationRejectedData extends EmailTemplateData {
    rejection_reason: string;
    reapply_allowed: boolean;
    contact_email: string;
}

export interface AccountBlacklistedData extends EmailTemplateData {
    reason: string;
    blacklisted_by: string;
    blacklisted_at: Date;
    appeal_url?: string;
}

export interface PasswordResetData extends EmailTemplateData {
    reset_link: string;
    expires_in_minutes: number;
    ip_address?: string;
}

export interface PIREPApprovedData extends EmailTemplateData {
    flight_number: string;
    route: string;
    flight_date: Date;
    score: number;
    earnings: number;
    approved_by: string;
    view_pirep_url: string;
}

export interface PIREPRejectedData extends EmailTemplateData {
    flight_number: string;
    route: string;
    rejection_reason: string;
    rejected_by: string;
    can_resubmit: boolean;
}

export interface GroupFlightReminderData extends EmailTemplateData {
    event_name: string;
    event_id: string;
    departure: string;
    arrival: string;
    aircraft: string;
    scheduled_time: Date;
    time_until_departure: string;
    briefing_url: string;
    event_url: string;
}

export interface BadgeEarnedData extends EmailTemplateData {
    badge_name: string;
    badge_description: string;
    badge_icon: string;
    badge_rarity: string;
    cash_reward?: number;
    view_badges_url: string;
}

export interface RankPromotionData extends EmailTemplateData {
    old_rank: string;
    new_rank: string;
    new_hourly_rate: number;
    total_hours: number;
    total_flights: number;
    avg_score: number;
    congratulations_message: string;
}

export interface LOARequestedData extends EmailTemplateData {
    loa_id: string;
    start_date: Date;
    end_date: Date;
    reason: string;
    status: string;
}

export interface LOAApprovedData extends EmailTemplateData {
    loa_id: string;
    start_date: Date;
    end_date: Date;
    approved_by: string;
    return_date: Date;
}

export interface EventResultsData extends EmailTemplateData {
    event_name: string;
    your_position: number;
    total_participants: number;
    your_score: number;
    winner_name: string;
    winner_score: number;
    reward_earned?: {
        cash?: number;
        badge?: string;
    };
    leaderboard_url: string;
}

// ============================================================================
// EMAIL NOTIFICATION RECORD
// ============================================================================

export interface EmailNotification {
    id: string;
    pilot_id: string;
    pilot_email: string;
    
    type: EmailNotificationType;
    priority: EmailPriority;
    
    subject: string;
    template_data: EmailTemplateData;
    
    // Delivery status
    status: 'pending' | 'sent' | 'failed' | 'bounced';
    sent_at?: Date;
    failed_at?: Date;
    error_message?: string;
    retry_count: number;
    
    // Tracking
    opened_at?: Date;
    clicked_at?: Date;
    
    created_at: Date;
}

// ============================================================================
// EMAIL PREFERENCES
// ============================================================================

export interface EmailPreferences {
    pilot_id: string;
    
    // Global
    email_enabled: boolean;
    
    // Category preferences
    pirep_notifications: boolean;
    group_flight_notifications: boolean;
    achievement_notifications: boolean;
    event_notifications: boolean;
    loa_notifications: boolean;
    financial_notifications: boolean;
    admin_notifications: boolean;
    
    // Specific preferences
    group_flight_reminder_24h: boolean;
    group_flight_reminder_1h: boolean;
    marketing_emails: boolean;
    
    updated_at: Date;
}

export const DEFAULT_EMAIL_PREFERENCES: Omit<EmailPreferences, 'pilot_id' | 'updated_at'> = {
    email_enabled: true,
    pirep_notifications: true,
    group_flight_notifications: true,
    achievement_notifications: true,
    event_notifications: true,
    loa_notifications: true,
    financial_notifications: true,
    admin_notifications: true,
    group_flight_reminder_24h: true,
    group_flight_reminder_1h: true,
    marketing_emails: false,
};

// ============================================================================
// EMAIL QUEUE
// ============================================================================

export interface EmailQueueItem {
    id: string;
    notification_id: string;
    
    to: string;
    subject: string;
    html: string;
    text: string;
    
    priority: EmailPriority;
    scheduled_for?: Date;
    
    status: 'queued' | 'processing' | 'sent' | 'failed';
    attempts: number;
    max_attempts: number;
    
    created_at: Date;
    processed_at?: Date;
}

// ============================================================================
// EMAIL TEMPLATE
// ============================================================================

export interface EmailTemplate {
    type: EmailNotificationType;
    subject_template: string;
    html_template: string;
    text_template: string;
    
    // Template variables
    required_variables: string[];
    optional_variables: string[];
    
    // Settings
    priority: EmailPriority;
    category: string;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function shouldSendEmail(
    type: EmailNotificationType,
    preferences: EmailPreferences
): boolean {
    if (!preferences.email_enabled) return false;
    
    const categoryMap: Record<string, keyof EmailPreferences> = {
        [EmailNotificationType.PIREP_APPROVED]: 'pirep_notifications',
        [EmailNotificationType.PIREP_REJECTED]: 'pirep_notifications',
        [EmailNotificationType.GROUP_FLIGHT_REMINDER_24H]: 'group_flight_reminder_24h',
        [EmailNotificationType.GROUP_FLIGHT_REMINDER_1H]: 'group_flight_reminder_1h',
        [EmailNotificationType.GROUP_FLIGHT_STARTED]: 'group_flight_notifications',
        [EmailNotificationType.BADGE_EARNED]: 'achievement_notifications',
        [EmailNotificationType.RANK_PROMOTION]: 'achievement_notifications',
        [EmailNotificationType.EVENT_INVITATION]: 'event_notifications',
        [EmailNotificationType.EVENT_RESULTS]: 'event_notifications',
        [EmailNotificationType.LOA_APPROVED]: 'loa_notifications',
        [EmailNotificationType.LOA_REJECTED]: 'loa_notifications',
        [EmailNotificationType.PAYMENT_RECEIVED]: 'financial_notifications',
        [EmailNotificationType.ADMIN_MESSAGE]: 'admin_notifications',
    };
    
    const preferenceKey = categoryMap[type];
    if (preferenceKey) {
        return preferences[preferenceKey] as boolean;
    }
    
    // Always send critical emails
    const criticalTypes = [
        EmailNotificationType.PASSWORD_RESET,
        EmailNotificationType.ACCOUNT_BLACKLISTED,
        EmailNotificationType.REGISTRATION_APPROVED,
        EmailNotificationType.EMAIL_VERIFICATION,
    ];
    
    return criticalTypes.includes(type);
}

export function getEmailPriorityLevel(type: EmailNotificationType): EmailPriority {
    const urgentTypes = [
        EmailNotificationType.PASSWORD_RESET,
        EmailNotificationType.ACCOUNT_BLACKLISTED,
        EmailNotificationType.GROUP_FLIGHT_REMINDER_1H,
    ];
    
    const highTypes = [
        EmailNotificationType.REGISTRATION_APPROVED,
        EmailNotificationType.PIREP_APPROVED,
        EmailNotificationType.RANK_PROMOTION,
        EmailNotificationType.COMPETITION_WON,
    ];
    
    if (urgentTypes.includes(type)) return EmailPriority.URGENT;
    if (highTypes.includes(type)) return EmailPriority.HIGH;
    
    return EmailPriority.NORMAL;
}
