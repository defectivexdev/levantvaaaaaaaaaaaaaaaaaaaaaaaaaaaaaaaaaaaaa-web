/**
 * Financial Ledger Service
 * Double-entry accounting system for virtual airline economy
 */

import {
    TransactionType,
    TransactionCategory,
    DEFAULT_ECONOMIC_SETTINGS,
} from '@/types/economy';
import type {
    Transaction,
    FlightFinancials,
    RevenueCalculationParams,
    ExpenseCalculationParams,
    PilotWallet,
} from '@/types/economy';

// ============================================================================
// REVENUE CALCULATION ENGINE
// ============================================================================

export class RevenueEngine {
    constructor(private settings: typeof DEFAULT_ECONOMIC_SETTINGS) {}

    /**
     * Calculate gross revenue from a flight
     * Formula: Gross_Earnings = (Distance × Rate_Per_NM) + (Passenger_Count × Ticket_Price)
     */
    calculateFlightRevenue(params: RevenueCalculationParams): {
        distance_revenue: number;
        passenger_revenue: number;
        cargo_revenue: number;
        bonuses: number;
        gross_revenue: number;
    } {
        // Distance-based revenue
        const distance_revenue = params.distance * params.rate_per_nm;

        // Passenger revenue
        const passenger_revenue = params.passengers * params.ticket_price_per_pax;

        // Cargo revenue
        const cargo_revenue = (params.cargo_weight || 0) * params.cargo_rate_per_kg;

        // Bonuses
        let bonuses = 0;
        if (params.on_time_bonus) bonuses += params.on_time_bonus;
        if (params.fuel_efficiency_bonus) bonuses += params.fuel_efficiency_bonus;
        if (params.perfect_flight_bonus) bonuses += params.perfect_flight_bonus;

        const gross_revenue = distance_revenue + passenger_revenue + cargo_revenue + bonuses;

        return {
            distance_revenue,
            passenger_revenue,
            cargo_revenue,
            bonuses,
            gross_revenue,
        };
    }
}

// ============================================================================
// EXPENSE CALCULATION ENGINE
// ============================================================================

export class ExpenseEngine {
    constructor(private settings: typeof DEFAULT_ECONOMIC_SETTINGS) {}

    /**
     * Calculate flight expenses
     * Includes: Fuel, Landing Fees, Maintenance (based on G-force/landing hardness)
     */
    calculateFlightExpenses(params: ExpenseCalculationParams): {
        fuel_cost: number;
        landing_fee: number;
        maintenance_cost: number;
        aircraft_rental: number;
        total_expenses: number;
    } {
        // Fuel cost
        const fuel_cost = params.fuel_burned * params.fuel_price * this.settings.fuel_price_multiplier;

        // Landing fee (based on airport size)
        const landing_fee = this.settings.landing_fees[params.landing_airport_size];

        // Maintenance cost (based on G-force and landing rate)
        let maintenance_cost = this.settings.maintenance_base_cost;

        // Additional cost for excessive G-force
        if (params.max_g_force > 1.5) {
            const excessG = params.max_g_force - 1.5;
            maintenance_cost += excessG * this.settings.maintenance_per_g_force;
        }

        // Penalty for hard landing
        if (Math.abs(params.landing_rate) > 600) {
            maintenance_cost += this.settings.maintenance_hard_landing_penalty;
        } else if (Math.abs(params.landing_rate) > 400) {
            maintenance_cost += this.settings.maintenance_hard_landing_penalty * 0.5;
        }

        // Reduced maintenance for perfect flights
        if (params.flight_score >= 95) {
            maintenance_cost *= 0.8; // 20% discount for excellent performance
        }

        // Aircraft rental (if applicable)
        const aircraft_rental = (params.aircraft_rental_rate || 0) * params.flight_duration;

        const total_expenses = fuel_cost + landing_fee + maintenance_cost + aircraft_rental;

        return {
            fuel_cost,
            landing_fee,
            maintenance_cost,
            aircraft_rental,
            total_expenses,
        };
    }
}

// ============================================================================
// PAYROLL ENGINE
// ============================================================================

export class PayrollEngine {
    constructor(private settings: typeof DEFAULT_ECONOMIC_SETTINGS) {}

    /**
     * Calculate pilot salary
     * Formula: Net_Salary = Flight_Hours × Hourly_Rate
     */
    calculatePilotSalary(flight_hours: number, pilot_rank: string): number {
        const hourly_rate = this.settings.pilot_pay_rates[pilot_rank] || 25;
        return flight_hours * hourly_rate;
    }
}

// ============================================================================
// FINANCIAL LEDGER SERVICE
// ============================================================================

export class FinancialLedgerService {
    private revenueEngine: RevenueEngine;
    private expenseEngine: ExpenseEngine;
    private payrollEngine: PayrollEngine;

    constructor(settings: typeof DEFAULT_ECONOMIC_SETTINGS) {
        this.revenueEngine = new RevenueEngine(settings);
        this.expenseEngine = new ExpenseEngine(settings);
        this.payrollEngine = new PayrollEngine(settings);
    }

    /**
     * Calculate complete flight financials
     */
    calculateFlightFinancials(
        revenueParams: RevenueCalculationParams,
        expenseParams: ExpenseCalculationParams,
        pilotRank: string
    ): FlightFinancials {
        // Calculate revenue
        const revenue = this.revenueEngine.calculateFlightRevenue(revenueParams);

        // Calculate expenses
        const expenses = this.expenseEngine.calculateFlightExpenses(expenseParams);

        // Calculate pilot salary
        const pilot_salary = this.payrollEngine.calculatePilotSalary(
            revenueParams.flight_duration,
            pilotRank
        );

        // Calculate net profit and pilot earnings
        const net_profit = revenue.gross_revenue - expenses.total_expenses - pilot_salary;
        const pilot_earnings = pilot_salary;

        return {
            ...revenue,
            ...expenses,
            pilot_salary,
            net_profit,
            pilot_earnings,
        };
    }

    /**
     * Create transaction record
     */
    createTransaction(
        pilotId: string,
        type: TransactionType,
        category: TransactionCategory,
        amount: number,
        currentBalance: number,
        description: string,
        metadata?: any,
        flightId?: string,
        eventId?: string
    ): Omit<Transaction, 'id' | 'created_at'> {
        return {
            pilotId,
            flightId,
            eventId,
            type,
            category,
            amount,
            balance_after: currentBalance + amount,
            description,
            metadata,
        };
    }

    /**
     * Generate all transactions for a completed flight
     */
    generateFlightTransactions(
        pilotId: string,
        flightId: string,
        financials: FlightFinancials,
        currentBalance: number
    ): Omit<Transaction, 'id' | 'created_at'>[] {
        const transactions: Omit<Transaction, 'id' | 'created_at'>[] = [];
        let runningBalance = currentBalance;

        // Revenue transactions
        if (financials.distance_revenue > 0) {
            transactions.push(
                this.createTransaction(
                    pilotId,
                    TransactionType.FLIGHT_REVENUE,
                    TransactionCategory.REVENUE,
                    financials.distance_revenue,
                    runningBalance,
                    'Flight distance revenue',
                    { distance_revenue: financials.distance_revenue },
                    flightId
                )
            );
            runningBalance += financials.distance_revenue;
        }

        if (financials.passenger_revenue > 0) {
            transactions.push(
                this.createTransaction(
                    pilotId,
                    TransactionType.PASSENGER_REVENUE,
                    TransactionCategory.REVENUE,
                    financials.passenger_revenue,
                    runningBalance,
                    'Passenger ticket revenue',
                    { passenger_revenue: financials.passenger_revenue },
                    flightId
                )
            );
            runningBalance += financials.passenger_revenue;
        }

        if (financials.bonuses > 0) {
            transactions.push(
                this.createTransaction(
                    pilotId,
                    TransactionType.BONUS,
                    TransactionCategory.REVENUE,
                    financials.bonuses,
                    runningBalance,
                    'Flight performance bonuses',
                    { bonuses: financials.bonuses },
                    flightId
                )
            );
            runningBalance += financials.bonuses;
        }

        // Expense transactions (negative amounts)
        if (financials.fuel_cost > 0) {
            transactions.push(
                this.createTransaction(
                    pilotId,
                    TransactionType.FUEL_COST,
                    TransactionCategory.EXPENSE,
                    -financials.fuel_cost,
                    runningBalance,
                    'Fuel cost',
                    { fuel_cost: financials.fuel_cost },
                    flightId
                )
            );
            runningBalance -= financials.fuel_cost;
        }

        if (financials.landing_fee > 0) {
            transactions.push(
                this.createTransaction(
                    pilotId,
                    TransactionType.LANDING_FEE,
                    TransactionCategory.EXPENSE,
                    -financials.landing_fee,
                    runningBalance,
                    'Landing fee',
                    { landing_fee: financials.landing_fee },
                    flightId
                )
            );
            runningBalance -= financials.landing_fee;
        }

        if (financials.maintenance_cost > 0) {
            transactions.push(
                this.createTransaction(
                    pilotId,
                    TransactionType.MAINTENANCE,
                    TransactionCategory.EXPENSE,
                    -financials.maintenance_cost,
                    runningBalance,
                    'Maintenance and wear',
                    { maintenance_cost: financials.maintenance_cost },
                    flightId
                )
            );
            runningBalance -= financials.maintenance_cost;
        }

        // Payroll transaction
        if (financials.pilot_salary > 0) {
            transactions.push(
                this.createTransaction(
                    pilotId,
                    TransactionType.PILOT_SALARY,
                    TransactionCategory.PAYROLL,
                    financials.pilot_salary,
                    runningBalance,
                    'Pilot salary',
                    { pilot_salary: financials.pilot_salary },
                    flightId
                )
            );
            runningBalance += financials.pilot_salary;
        }

        return transactions;
    }

    /**
     * Update pilot wallet after transactions
     */
    updateWallet(
        currentWallet: PilotWallet,
        transactions: Transaction[]
    ): Partial<PilotWallet> {
        let total_earnings = currentWallet.total_earnings;
        let total_expenses = currentWallet.total_expenses;
        let current_balance = currentWallet.current_balance;

        transactions.forEach(tx => {
            current_balance = tx.balance_after;

            if (tx.category === TransactionCategory.REVENUE || tx.category === TransactionCategory.PAYROLL) {
                total_earnings += tx.amount;
            } else if (tx.category === TransactionCategory.EXPENSE) {
                total_expenses += Math.abs(tx.amount);
            }
        });

        const total_flights = currentWallet.total_flights + 1;
        const avg_flight_revenue = total_earnings / total_flights;

        return {
            current_balance,
            total_earnings,
            total_expenses,
            total_flights,
            avg_flight_revenue,
            last_transaction_at: new Date(),
            updated_at: new Date(),
        };
    }
}

// ============================================================================
// WALLET UTILITIES
// ============================================================================

export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

export function getTransactionColor(category: TransactionCategory): string {
    const colors: Record<TransactionCategory, string> = {
        [TransactionCategory.REVENUE]: '#10B981',
        [TransactionCategory.EXPENSE]: '#EF4444',
        [TransactionCategory.PAYROLL]: '#3B82F6',
        [TransactionCategory.ADJUSTMENT]: '#F59E0B',
    };
    return colors[category];
}

export function getTransactionIcon(type: TransactionType): string {
    const icons: Record<TransactionType, string> = {
        [TransactionType.FLIGHT_REVENUE]: '✈️',
        [TransactionType.PASSENGER_REVENUE]: '👥',
        [TransactionType.CARGO_REVENUE]: '📦',
        [TransactionType.BONUS]: '🎁',
        [TransactionType.EVENT_REWARD]: '🏆',
        [TransactionType.FUEL_COST]: '⛽',
        [TransactionType.LANDING_FEE]: '🛬',
        [TransactionType.MAINTENANCE]: '🔧',
        [TransactionType.AIRCRAFT_RENTAL]: '🛩️',
        [TransactionType.PILOT_SALARY]: '💰',
        [TransactionType.ADJUSTMENT]: '⚙️',
        [TransactionType.REFUND]: '↩️',
    };
    return icons[type];
}
