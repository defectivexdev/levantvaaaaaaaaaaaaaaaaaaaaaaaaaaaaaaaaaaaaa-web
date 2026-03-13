/**
 * Economic Engine Types
 * Financial ledger, transactions, and wallet system
 */

// ============================================================================
// TRANSACTION TYPES
// ============================================================================

export enum TransactionType {
    // Revenue
    FLIGHT_REVENUE = 'flight_revenue',
    PASSENGER_REVENUE = 'passenger_revenue',
    CARGO_REVENUE = 'cargo_revenue',
    BONUS = 'bonus',
    EVENT_REWARD = 'event_reward',
    
    // Expenses
    FUEL_COST = 'fuel_cost',
    LANDING_FEE = 'landing_fee',
    AIRCRAFT_RENTAL = 'aircraft_rental',
    
    // Payroll
    PILOT_SALARY = 'pilot_salary',
    
    // Other
    ADJUSTMENT = 'adjustment',
    REFUND = 'refund',
}

export enum TransactionCategory {
    REVENUE = 'revenue',
    EXPENSE = 'expense',
    PAYROLL = 'payroll',
    ADJUSTMENT = 'adjustment',
}

export interface Transaction {
    id: string;
    pilotId: string;
    flightId?: string;
    eventId?: string;
    
    type: TransactionType;
    category: TransactionCategory;
    
    amount: number;              // Positive for revenue, negative for expenses
    balance_after: number;       // Running balance
    
    description: string;
    metadata?: {
        distance?: number;
        passengers?: number;
        fuel_burned?: number;
        landing_fee_base?: number;
        flight_hours?: number;
        hourly_rate?: number;
        [key: string]: any;
    };
    
    created_at: Date;
}

// ============================================================================
// WALLET SYSTEM
// ============================================================================

export interface PilotWallet {
    pilotId: string;
    current_balance: number;
    total_earnings: number;      // Lifetime revenue
    total_expenses: number;      // Lifetime expenses
    total_flights: number;
    
    // Statistics
    avg_flight_revenue: number;
    highest_earning_flight: number;
    total_bonuses: number;
    
    last_transaction_at: Date;
    updated_at: Date;
}

// ============================================================================
// FINANCIAL CALCULATIONS
// ============================================================================

export interface FlightFinancials {
    // Revenue
    distance_revenue: number;    // Distance × Rate per NM
    passenger_revenue: number;   // Passengers × Ticket price
    cargo_revenue: number;       // Cargo weight × Rate
    bonuses: number;             // On-time, fuel efficiency, etc.
    gross_revenue: number;       // Total revenue
    
    // Expenses
    fuel_cost: number;           // Fuel burned × Fuel price
    landing_fee: number;         // Based on airport size
    aircraft_rental: number;     // If applicable
    total_expenses: number;
    
    // Payroll
    pilot_salary: number;        // Flight hours × Hourly rate
    
    // Net
    net_profit: number;          // Revenue - Expenses - Salary
    pilot_earnings: number;      // What pilot receives
}

export interface RevenueCalculationParams {
    distance: number;            // Nautical miles
    passengers: number;
    cargo_weight?: number;       // kg
    flight_duration: number;     // hours
    
    // Rates (from VA Settings)
    rate_per_nm: number;
    ticket_price_per_pax: number;
    cargo_rate_per_kg: number;
    
    // Bonuses
    on_time_bonus?: number;
    fuel_efficiency_bonus?: number;
    perfect_flight_bonus?: number;
}

export interface ExpenseCalculationParams {
    fuel_burned: number;         // gallons
    fuel_price: number;          // $ per gallon
    
    landing_airport_size: 'small' | 'medium' | 'large' | 'hub';
    landing_fee_base: number;
    
    landing_rate: number;        // fpm
    max_g_force: number;
    flight_score: number;
    
    aircraft_rental_rate?: number;
    flight_duration: number;     // hours
}

// ============================================================================
// ECONOMIC SETTINGS
// ============================================================================

export interface EconomicSettings {
    // Revenue rates
    rate_per_nm: number;                    // $ per nautical mile
    ticket_price_per_pax: number;           // $ per passenger
    cargo_rate_per_kg: number;              // $ per kg
    
    // Bonuses
    on_time_bonus: number;
    fuel_efficiency_bonus: number;
    perfect_flight_bonus: number;
    butter_landing_bonus: number;
    
    // Fuel costs
    fuel_price_per_gallon: number;
    fuel_price_multiplier: number;
    
    // Landing fees by airport size
    landing_fees: {
        small: number;
        medium: number;
        large: number;
        hub: number;
    };
    
    // Aircraft rental (if applicable)
    aircraft_rental_per_hour: number;
    
    // Pilot pay rates by rank
    pilot_pay_rates: {
        [rank: string]: number;             // $ per hour
    };
}

export const DEFAULT_ECONOMIC_SETTINGS: EconomicSettings = {
    rate_per_nm: 2.5,
    ticket_price_per_pax: 150,
    cargo_rate_per_kg: 0.5,
    
    on_time_bonus: 100,
    fuel_efficiency_bonus: 150,
    perfect_flight_bonus: 200,
    butter_landing_bonus: 50,
    
    fuel_price_per_gallon: 5.0,
    fuel_price_multiplier: 1.0,
    
    landing_fees: {
        small: 50,
        medium: 150,
        large: 300,
        hub: 500,
    },
    
    aircraft_rental_per_hour: 0,
    
    pilot_pay_rates: {
        'Student Pilot': 25,
        'Private Pilot': 35,
        'Commercial Pilot': 50,
        'First Officer': 75,
        'Captain': 100,
        'Senior Captain': 125,
        'Training Captain': 150,
        'Chief Pilot': 200,
    },
};
