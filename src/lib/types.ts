export interface WeeklyData {
  weekStart: string;
  shifts: 0 | 1 | 2;
  groceries: number;
  transit: number;
  misc: number;
  ebtApproved: boolean;
  transitDiscount: boolean;
}

export interface RunwaySettings {
  monthsElapsed: number;
  greece: boolean;
  japan: boolean;
  smallerTrips: boolean;
  businessExpenses: boolean;
}

export type Screen = 'checkin' | 'dashboard';
