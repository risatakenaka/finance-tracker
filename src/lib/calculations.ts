import type { WeeklyData, RunwaySettings } from './types';

export const WEEKS_PER_MONTH = 4.33;
export const EDD_BASE = 450;
export const EARNINGS_DISREGARD = 112.5;
export const EBT_WEEKLY = 200 / WEEKS_PER_MONTH;
export const GROCERIES_BUDGET = 100;
export const TRANSIT_BUDGET_FULL = 50;
export const TRANSIT_BUDGET_DISCOUNT = 25;
export const MISC_BUDGET = 50;
export const FIXED_SUBS = 92;
export const RENT_GAP = 550;
export const RUNWAY_START = 37000;
export const MONTHLY_BURN = 2000;

export function getRaphaEarnings(shifts: number): number {
  return shifts * 7.5 * 20;
}

export function getEDD(shifts: number): number {
  const rapha = getRaphaEarnings(shifts);
  return Math.max(0, EDD_BASE - Math.max(0, rapha - EARNINGS_DISREGARD));
}

export function getShiftIncome(shifts: number): number {
  return getRaphaEarnings(shifts) + getEDD(shifts);
}

export function getWeeklyIncome(data: WeeklyData): number {
  return getShiftIncome(data.shifts) + (data.ebtApproved ? EBT_WEEKLY : 0);
}

export function getTransitBudget(transitDiscount: boolean): number {
  return transitDiscount ? TRANSIT_BUDGET_DISCOUNT : TRANSIT_BUDGET_FULL;
}

// Always returns the full allocation ($200). Transit discount reduces what you spend,
// not the total budget — so remaining budget is higher when discount is on.
export function getTotalBudget(): number {
  return GROCERIES_BUDGET + TRANSIT_BUDGET_FULL + MISC_BUDGET;
}

export function getTotalSpent(data: WeeklyData): number {
  return data.groceries + data.transit + data.misc;
}

export function getWeeklySurplus(data: WeeklyData): number {
  return getWeeklyIncome(data) - getTotalSpent(data);
}

export function getMonthlyIncome(weeklyIncome: number): number {
  return weeklyIncome * WEEKS_PER_MONTH;
}

export function getMonthlySurplus(weeklyIncome: number, transitDiscount: boolean): number {
  const weeklyExpenses = GROCERIES_BUDGET + getTransitBudget(transitDiscount) + MISC_BUDGET;
  return getMonthlyIncome(weeklyIncome) - (weeklyExpenses * WEEKS_PER_MONTH + FIXED_SUBS + RENT_GAP);
}

export function getRunway(settings: RunwaySettings): number {
  let runway = RUNWAY_START;
  runway -= MONTHLY_BURN * settings.monthsElapsed;
  if (settings.greece) runway -= 2500;
  if (settings.japan) runway -= 2000;
  if (settings.smallerTrips) runway -= 1500;
  if (settings.businessExpenses) runway -= 1000;
  return runway;
}

export function addWeeks(weekStart: string, n: number): string {
  const d = new Date(weekStart + 'T12:00:00');
  d.setDate(d.getDate() + n * 7);
  return d.toISOString().split('T')[0];
}

export function getWeekStart(date = new Date()): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().split('T')[0];
}

export function fmt(amount: number): string {
  return '$' + Math.round(Math.abs(amount)).toLocaleString();
}

export function fmtSigned(amount: number): string {
  const rounded = Math.round(amount);
  return (rounded >= 0 ? '+$' : '-$') + Math.abs(rounded).toLocaleString();
}

export function formatWeekLabel(weekStart: string): string {
  const d = new Date(weekStart + 'T12:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
