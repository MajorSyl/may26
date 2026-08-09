import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface MiniCalendarProps {
  // ISO 'YYYY-MM-DD' dates to mark with a dot (e.g. upcoming meetings/events).
  highlightDates?: string[];
}

const WEEKDAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function toIsoDate(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export default function MiniCalendar({ highlightDates = [] }: MiniCalendarProps) {
  const today = new Date();
  const [cursor, setCursor] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const highlightSet = new Set(highlightDates);

  const cells: (number | null)[] = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1)
  ];

  const monthLabel = cursor.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-extrabold text-slate-800 font-display">{monthLabel}</span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCursor(new Date(year, month - 1, 1))}
            className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-slate-100 text-slate-500"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setCursor(new Date(year, month + 1, 1))}
            className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-slate-100 text-slate-500"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-y-1.5 text-center">
        {WEEKDAY_LABELS.map((d, i) => (
          <span key={i} className="text-[9px] font-bold text-slate-350 uppercase font-display">{d}</span>
        ))}
        {cells.map((day, idx) => {
          if (day === null) return <span key={idx} />;
          const iso = toIsoDate(year, month, day);
          const isToday =
            day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
          const hasEvent = highlightSet.has(iso);
          return (
            <div key={idx} className="flex flex-col items-center justify-center py-0.5">
              <span
                className={`w-6 h-6 flex items-center justify-center rounded-full text-[10px] font-bold ${
                  isToday ? 'bg-rotary-azure text-white' : 'text-slate-600'
                }`}
              >
                {day}
              </span>
              <span className={`w-1 h-1 rounded-full mt-0.5 ${hasEvent ? 'bg-rotary-gold' : 'bg-transparent'}`} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
