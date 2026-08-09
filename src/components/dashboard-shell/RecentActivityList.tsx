import React from 'react';
import { LucideIcon, Clock } from 'lucide-react';

export interface ActivityItem {
  id: string;
  title: string;
  subtitle?: string;
  timestamp?: string;
  icon?: LucideIcon;
  tone?: 'default' | 'success' | 'warning' | 'danger';
}

const TONE_CLASSES: Record<NonNullable<ActivityItem['tone']>, string> = {
  default: 'bg-rotary-azure/10 text-rotary-azure',
  success: 'bg-emerald-100 text-emerald-700',
  warning: 'bg-amber-100 text-amber-700',
  danger: 'bg-rose-100 text-rose-700'
};

interface RecentActivityListProps {
  title?: string;
  items: ActivityItem[];
  emptyLabel?: string;
}

export default function RecentActivityList({ title = 'Recent Activity', items, emptyLabel = 'Nothing here yet.' }: RecentActivityListProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
      <h3 className="text-xs font-extrabold text-slate-800 font-display mb-4">{title}</h3>
      {items.length === 0 ? (
        <p className="text-[11px] text-slate-400 italic">{emptyLabel}</p>
      ) : (
        <div className="space-y-3.5">
          {items.map((item) => {
            const Icon = item.icon || Clock;
            const tone = item.tone || 'default';
            return (
              <div key={item.id} className="flex items-start gap-3">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${TONE_CLASSES[tone]}`}>
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-bold text-slate-700 truncate">{item.title}</p>
                  {item.subtitle && <p className="text-[10px] text-slate-400 truncate">{item.subtitle}</p>}
                </div>
                {item.timestamp && <span className="text-[9px] text-slate-350 shrink-0 font-medium">{item.timestamp}</span>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
