'use client';

import type { WeeklyData } from '@/lib/types';
import { getShiftIncome, EBT_WEEKLY, fmt } from '@/lib/calculations';

interface Props {
  data: WeeklyData;
  onChange: (data: WeeklyData) => void;
}

function ExpenseInput({
  label,
  budget,
  value,
  onChange,
}: {
  label: string;
  budget: number;
  value: number;
  onChange: (v: number) => void;
}) {
  const pct = budget > 0 ? Math.min(1, value / budget) : 0;
  const over = value > budget;

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-semibold text-navy">{label}</span>
        <span className="text-xs text-gray-400 font-medium">Budget {fmt(budget)}</span>
      </div>
      <div className="flex items-center gap-1">
        <span className="text-xl font-bold text-gray-300">$</span>
        <input
          type="number"
          inputMode="decimal"
          min="0"
          step="1"
          value={value === 0 ? '' : value}
          placeholder="0"
          onChange={(e) => {
            const v = parseFloat(e.target.value);
            onChange(isNaN(v) || v < 0 ? 0 : v);
          }}
          className="flex-1 text-2xl font-bold text-navy outline-none bg-transparent min-w-0"
        />
        {value > 0 && (
          <span className={`text-sm font-semibold ${over ? 'text-crimson' : 'text-teal'}`}>
            {over ? `+${fmt(value - budget)} over` : `${fmt(budget - value)} left`}
          </span>
        )}
      </div>
      <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${over ? 'bg-crimson' : 'bg-teal'}`}
          style={{ width: `${pct * 100}%` }}
        />
      </div>
    </div>
  );
}

function Toggle({
  label,
  sublabel,
  checked,
  onChange,
}: {
  label: string;
  sublabel: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="w-full bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center justify-between active:bg-gray-50 transition-colors"
    >
      <div className="text-left">
        <div className="text-sm font-semibold text-navy">{label}</div>
        <div className="text-xs text-gray-400 mt-0.5">{sublabel}</div>
      </div>
      <div
        className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 ${
          checked ? 'bg-teal' : 'bg-gray-200'
        }`}
      >
        <span
          className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
            checked ? 'translate-x-6' : 'translate-x-0.5'
          }`}
        />
      </div>
    </button>
  );
}

export default function WeeklyCheckin({ data, onChange }: Props) {
  const transitBudget = data.transitDiscount ? 25 : 50;

  return (
    <div className="px-4 py-5 space-y-6 pb-6">
      {/* Shift selector */}
      <section>
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Shifts This Week</h2>
        <div className="grid grid-cols-3 gap-2">
          {([0, 1, 2] as const).map((s) => {
            const income = getShiftIncome(s);
            const selected = data.shifts === s;
            return (
              <button
                key={s}
                onClick={() => onChange({ ...data, shifts: s })}
                className={`rounded-2xl p-4 flex flex-col items-center gap-1 transition-all active:scale-95 ${
                  selected
                    ? 'bg-navy shadow-lg shadow-navy/30'
                    : 'bg-white border-2 border-gray-200 shadow-sm'
                }`}
              >
                <span className={`text-3xl font-black ${selected ? 'text-white' : 'text-navy'}`}>{s}</span>
                <span className={`text-xs font-medium ${selected ? 'text-blue-200' : 'text-gray-400'}`}>
                  shift{s !== 1 ? 's' : ''}
                </span>
                <span className={`text-sm font-bold ${selected ? 'text-teal' : 'text-teal'}`}>
                  {fmt(income)}
                </span>
              </button>
            );
          })}
        </div>
        <p className="text-xs text-gray-400 mt-2 text-center">
          Income shown is Rapha + EDD (before EBT)
        </p>
      </section>

      {/* Expenses */}
      <section>
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Expenses</h2>
        <div className="space-y-3">
          <ExpenseInput
            label="Groceries & Eating Out"
            budget={100}
            value={data.groceries}
            onChange={(v) => onChange({ ...data, groceries: v })}
          />
          <ExpenseInput
            label="Transit"
            budget={transitBudget}
            value={data.transit}
            onChange={(v) => onChange({ ...data, transit: v })}
          />
          <ExpenseInput
            label="Misc"
            budget={50}
            value={data.misc}
            onChange={(v) => onChange({ ...data, misc: v })}
          />
        </div>
      </section>

      {/* Benefits & Discounts toggles hidden — logic preserved, UI removed for now */}
    </div>
  );
}
