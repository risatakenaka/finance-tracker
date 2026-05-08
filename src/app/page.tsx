'use client';

import { useState, useEffect } from 'react';
import type { WeeklyData, RunwaySettings, Screen } from '@/lib/types';
import { getWeekStart, getWeeklyIncome, fmt, formatWeekLabel, addWeeks } from '@/lib/calculations';
import BottomNav from '@/components/BottomNav';
import WeeklyCheckin from '@/components/WeeklyCheckin';
import Dashboard from '@/components/Dashboard';

function defaultWeek(weekStart: string): WeeklyData {
  return {
    weekStart,
    shifts: 0,
    groceries: 0,
    transit: 0,
    misc: 0,
    ebtApproved: false,
    transitDiscount: false,
  };
}

function defaultRunway(): RunwaySettings {
  return {
    monthsElapsed: 0,
    greece: false,
    japan: false,
    smallerTrips: false,
    businessExpenses: false,
  };
}

export default function Home() {
  const [screen, setScreen] = useState<Screen>('checkin');
  const [weekStart] = useState(() => getWeekStart());
  const [weeklyData, setWeeklyData] = useState<WeeklyData>(() => defaultWeek(getWeekStart()));
  const [runwaySettings, setRunwaySettings] = useState<RunwaySettings>(defaultRunway);
  const [mounted, setMounted] = useState(false);
  const [viewingWeekStart, setViewingWeekStart] = useState(() => getWeekStart());
  const [historicalData, setHistoricalData] = useState<WeeklyData | null>(null);

  useEffect(() => {
    setMounted(true);
    const ws = getWeekStart();

    // Load benefit/discount settings — persist across weeks since EBT approval
    // and transit discount status don't reset every Monday.
    let persistedEbt = false;
    let persistedTransit = false;
    const savedUserSettings = localStorage.getItem('ft-user-settings');
    if (savedUserSettings) {
      try {
        const s = JSON.parse(savedUserSettings);
        persistedEbt = s.ebtApproved ?? false;
        persistedTransit = s.transitDiscount ?? false;
      } catch {}
    }

    const savedWeek = localStorage.getItem(`ft-week-${ws}`);
    if (savedWeek) {
      try {
        setWeeklyData(JSON.parse(savedWeek));
      } catch {
        setWeeklyData({ ...defaultWeek(ws), ebtApproved: persistedEbt, transitDiscount: persistedTransit });
      }
    } else {
      setWeeklyData({ ...defaultWeek(ws), ebtApproved: persistedEbt, transitDiscount: persistedTransit });
    }

    const savedRunway = localStorage.getItem('ft-runway');
    if (savedRunway) {
      try {
        setRunwaySettings(JSON.parse(savedRunway));
      } catch {
        setRunwaySettings(defaultRunway());
      }
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem(`ft-week-${weeklyData.weekStart}`, JSON.stringify(weeklyData));
  }, [weeklyData, mounted]);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem('ft-user-settings', JSON.stringify({
      ebtApproved: weeklyData.ebtApproved,
      transitDiscount: weeklyData.transitDiscount,
    }));
  }, [weeklyData.ebtApproved, weeklyData.transitDiscount, mounted]);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem('ft-runway', JSON.stringify(runwaySettings));
  }, [runwaySettings, mounted]);

  useEffect(() => {
    if (!mounted) return;
    if (viewingWeekStart === weeklyData.weekStart) {
      setHistoricalData(null);
    } else {
      const saved = localStorage.getItem(`ft-week-${viewingWeekStart}`);
      if (saved) {
        try { setHistoricalData(JSON.parse(saved)); } catch { setHistoricalData(null); }
      } else {
        setHistoricalData(null);
      }
    }
  }, [viewingWeekStart, weeklyData.weekStart, mounted]);

  if (!mounted) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-navy border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const weeklyIncome = getWeeklyIncome(weeklyData);
  const viewingData = viewingWeekStart === weeklyData.weekStart
    ? weeklyData
    : (historicalData ?? defaultWeek(viewingWeekStart));

  return (
    <div
      className="flex flex-col bg-gray-50 mx-auto overflow-hidden"
      style={{ height: '100dvh', maxWidth: '430px' }}
    >
      {/* Header */}
      <header className="bg-navy text-white px-5 pt-safe flex-shrink-0" style={{ paddingTop: 'max(env(safe-area-inset-top), 16px)' }}>
        <div className="flex justify-between items-center pb-4">
          <div>
            <h1 className="text-base font-black tracking-tight">Finance Tracker</h1>
            <p className="text-xs text-blue-200 mt-0.5">Week of {formatWeekLabel(weekStart)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-blue-200">This week</p>
            <p className="text-lg font-black">
              {fmt(weeklyIncome)}
              <span className="text-blue-200 font-normal text-xs">/wk</span>
            </p>
          </div>
        </div>
      </header>

      {/* Scrollable content */}
      <main className="flex-1 overflow-y-auto overscroll-contain">
        {screen === 'checkin' ? (
          <WeeklyCheckin data={weeklyData} onChange={setWeeklyData} />
        ) : (
          <Dashboard
            data={viewingData}
            currentWeekStart={weekStart}
            viewingWeekStart={viewingWeekStart}
            onWeekChange={setViewingWeekStart}
            runwaySettings={runwaySettings}
            onRunwayChange={setRunwaySettings}
          />
        )}
      </main>

      {/* Bottom nav */}
      <BottomNav active={screen} onChange={setScreen} />
    </div>
  );
}
