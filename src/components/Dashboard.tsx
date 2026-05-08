'use client';

import type { WeeklyData, RunwaySettings } from '@/lib/types';
import {
  getWeeklyIncome,
  getWeeklySurplus,
  getMonthlyIncome,
  getMonthlySurplus,
  getTotalBudget,
  getTotalSpent,
  getTransitBudget,
  getRunway,
  addWeeks,
  GROCERIES_BUDGET,
  MISC_BUDGET,
  RUNWAY_START,
  fmt,
  fmtSigned,
  formatWeekLabel,
} from '@/lib/calculations';

interface Props {
  data: WeeklyData;
  currentWeekStart: string;
  viewingWeekStart: string;
  onWeekChange: (ws: string) => void;
  runwaySettings: RunwaySettings;
  onRunwayChange: (s: RunwaySettings) => void;
}

function ProgressBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.min(1, value / max) : 0;
  return (
    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-500 ${color}`}
        style={{ width: `${pct * 100}%` }}
      />
    </div>
  );
}

function MetricCard({
  label,
  value,
  sub,
  highlight,
}: {
  label: string;
  value: string;
  sub?: string;
  highlight?: 'positive' | 'negative' | 'neutral';
}) {
  const valueColor =
    highlight === 'positive'
      ? 'text-teal'
      : highlight === 'negative'
      ? 'text-crimson'
      : 'text-navy';

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col gap-1">
      <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{label}</span>
      <span className={`text-2xl font-black ${valueColor}`}>{value}</span>
      {sub && <span className="text-xs text-gray-400">{sub}</span>}
    </div>
  );
}

function CategoryRow({
  label,
  spent,
  budget,
}: {
  label: string;
  spent: number;
  budget: number;
}) {
  const diff = budget - spent;
  const over = diff < 0;
  const pct = budget > 0 ? Math.min(1, spent / budget) : 0;

  return (
    <div className="py-3 first:pt-0 last:pb-0">
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-sm font-semibold text-navy">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-navy">{fmt(spent)}</span>
          <span
            className={`text-xs font-bold px-1.5 py-0.5 rounded-md ${
              over ? 'bg-crimson/10 text-crimson' : 'bg-teal/10 text-teal'
            }`}
          >
            {fmtSigned(diff)}
          </span>
        </div>
      </div>
      <ProgressBar value={spent} max={budget} color={over ? 'bg-crimson' : 'bg-teal'} />
      <span className="text-xs text-gray-400 mt-1 block">Budget: {fmt(budget)}</span>
    </div>
  );
}

function DrawToggle({
  label,
  amount,
  active,
  onToggle,
}: {
  label: string;
  amount: number;
  active: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className={`rounded-xl p-3 text-left border-2 transition-all active:scale-95 ${
        active
          ? 'bg-red-50 border-crimson/40 text-crimson'
          : 'bg-white border-gray-200 text-gray-500'
      }`}
    >
      <div className="text-xs font-semibold truncate">{label}</div>
      <div className={`text-base font-black mt-0.5 ${active ? 'text-crimson' : 'text-gray-700'}`}>
        -{fmt(amount)}
      </div>
    </button>
  );
}

export default function Dashboard({ data, currentWeekStart, viewingWeekStart, onWeekChange, runwaySettings, onRunwayChange }: Props) {
  const weeklyIncome = getWeeklyIncome(data);
  const weeklySurplus = getWeeklySurplus(data);
  const monthlyIncome = getMonthlyIncome(weeklyIncome);
  const monthlySurplus = getMonthlySurplus(weeklyIncome, data.transitDiscount);
  const totalBudget = getTotalBudget();
  const totalSpent = getTotalSpent(data);
  const transitBudget = getTransitBudget(data.transitDiscount);

  const runway = getRunway(runwaySettings);
  const runwayColor =
    runway >= 15000 ? 'text-teal' : runway >= 8000 ? 'text-amber-500' : 'text-crimson';
  const runwayBg =
    runway >= 15000 ? 'bg-teal/10' : runway >= 8000 ? 'bg-amber-50' : 'bg-crimson/10';
  const runwayBarColor =
    runway >= 15000 ? 'bg-teal' : runway >= 8000 ? 'bg-amber-400' : 'bg-crimson';

  const months = Array.from({ length: 25 }, (_, i) => i);

  const isCurrentWeek = viewingWeekStart === currentWeekStart;
  const prevWeek = addWeeks(viewingWeekStart, -1);
  const nextWeek = addWeeks(viewingWeekStart, 1);

  return (
    <div className="px-4 py-5 space-y-4 pb-6">
      {/* Week navigator */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onWeekChange(prevWeek)}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-white border border-gray-200 shadow-sm text-navy active:bg-gray-50"
        >
          ‹
        </button>
        <div className="text-center">
          <p className="text-sm font-bold text-navy">{formatWeekLabel(viewingWeekStart)}</p>
          {!isCurrentWeek && (
            <button
              onClick={() => onWeekChange(currentWeekStart)}
              className="text-xs text-teal font-semibold mt-0.5"
            >
              Back to current week
            </button>
          )}
        </div>
        <button
          onClick={() => onWeekChange(nextWeek)}
          disabled={isCurrentWeek}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-white border border-gray-200 shadow-sm text-navy active:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          ›
        </button>
      </div>

      {/* Weekly spending card */}
      <section>
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
          Weekly Spending
        </h2>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex justify-between items-end mb-3">
            <div>
              <p className="text-xs text-gray-400 font-medium">Total spent</p>
              <p className="text-3xl font-black text-navy">{fmt(totalSpent)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400 font-medium">of {fmt(totalBudget)} budget</p>
              <p className={`text-lg font-bold ${totalSpent > totalBudget ? 'text-crimson' : 'text-teal'}`}>
                {fmtSigned(totalBudget - totalSpent)}
              </p>
            </div>
          </div>
          <ProgressBar
            value={totalSpent}
            max={totalBudget}
            color={totalSpent > totalBudget ? 'bg-crimson' : 'bg-teal'}
          />
        </div>
      </section>

      {/* Category breakdown */}
      <section>
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
          By Category
        </h2>
        <div className="bg-white rounded-2xl px-4 shadow-sm border border-gray-100 divide-y divide-gray-100">
          <CategoryRow label="Groceries & Eating Out" spent={data.groceries} budget={GROCERIES_BUDGET} />
          <CategoryRow label="Transit" spent={data.transit} budget={transitBudget} />
          <CategoryRow label="Misc" spent={data.misc} budget={MISC_BUDGET} />
        </div>
      </section>

      {/* Metric cards */}
      <section>
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
          Income & Surplus
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <MetricCard label="Weekly Income" value={fmt(weeklyIncome)} sub="Rapha + EDD + EBT" highlight="neutral" />
          <MetricCard
            label="Weekly Surplus"
            value={fmt(Math.abs(weeklySurplus))}
            sub={weeklySurplus >= 0 ? 'under budget' : 'over budget'}
            highlight={weeklySurplus >= 0 ? 'positive' : 'negative'}
          />
          <MetricCard
            label="Est. Monthly Income"
            value={fmt(monthlyIncome)}
            sub="weekly × 4.33"
            highlight="neutral"
          />
          <MetricCard
            label="Est. Monthly Surplus"
            value={fmt(Math.abs(monthlySurplus))}
            sub={monthlySurplus >= 0 ? 'after fixed costs' : 'shortfall'}
            highlight={monthlySurplus >= 0 ? 'positive' : 'negative'}
          />
        </div>
      </section>

      {/* Runway tracker */}
      <section>
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
          Runway
        </h2>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-4">
          {/* Balance display */}
          <div className={`rounded-xl p-4 ${runwayBg}`}>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Current Balance</p>
            <p className={`text-4xl font-black mt-1 ${runwayColor}`}>{fmt(runway)}</p>
            <div className="mt-3 h-2 bg-white/60 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${runwayBarColor}`}
                style={{ width: `${Math.max(0, Math.min(100, (runway / RUNWAY_START) * 100))}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1.5">
              {fmt(RUNWAY_START - runway)} drawn from {fmt(RUNWAY_START)} starting balance
            </p>
          </div>

          {/* Months elapsed */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">
              Months Elapsed (× $2,000/mo)
            </label>
            <div className="relative">
              <select
                value={runwaySettings.monthsElapsed}
                onChange={(e) =>
                  onRunwayChange({ ...runwaySettings, monthsElapsed: parseInt(e.target.value) })
                }
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-navy font-semibold text-base appearance-none outline-none"
              >
                {months.map((m) => (
                  <option key={m} value={m}>
                    {m} month{m !== 1 ? 's' : ''} — {fmt(m * 2000)} drawn
                  </option>
                ))}
              </select>
              <svg
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          </div>

          {/* One-time draws */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">
              One-time Draws
            </label>
            <div className="grid grid-cols-2 gap-2">
              <DrawToggle
                label="Greece Trip"
                amount={2500}
                active={runwaySettings.greece}
                onToggle={() => onRunwayChange({ ...runwaySettings, greece: !runwaySettings.greece })}
              />
              <DrawToggle
                label="Japan Trip"
                amount={2000}
                active={runwaySettings.japan}
                onToggle={() => onRunwayChange({ ...runwaySettings, japan: !runwaySettings.japan })}
              />
              <DrawToggle
                label="Smaller Trips"
                amount={1500}
                active={runwaySettings.smallerTrips}
                onToggle={() =>
                  onRunwayChange({ ...runwaySettings, smallerTrips: !runwaySettings.smallerTrips })
                }
              />
              <DrawToggle
                label="Business Exp."
                amount={1000}
                active={runwaySettings.businessExpenses}
                onToggle={() =>
                  onRunwayChange({
                    ...runwaySettings,
                    businessExpenses: !runwaySettings.businessExpenses,
                  })
                }
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
