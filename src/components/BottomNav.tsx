'use client';

import type { Screen } from '@/lib/types';

interface Props {
  active: Screen;
  onChange: (s: Screen) => void;
}

export default function BottomNav({ active, onChange }: Props) {
  return (
    <nav className="bg-navy flex-shrink-0 border-t border-white/10">
      <div className="flex">
        <button
          onClick={() => onChange('checkin')}
          className={`flex-1 flex flex-col items-center gap-1 py-3 transition-colors ${
            active === 'checkin' ? 'text-teal' : 'text-white/50'
          }`}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
            <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" />
          </svg>
          <span className="text-xs font-medium">This Week</span>
        </button>

        <button
          onClick={() => onChange('dashboard')}
          className={`flex-1 flex flex-col items-center gap-1 py-3 transition-colors ${
            active === 'dashboard' ? 'text-teal' : 'text-white/50'
          }`}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="20" x2="18" y2="10" />
            <line x1="12" y1="20" x2="12" y2="4" />
            <line x1="6" y1="20" x2="6" y2="14" />
          </svg>
          <span className="text-xs font-medium">Summary</span>
        </button>
      </div>
    </nav>
  );
}
