import React from 'react';
import { LucideIcon } from 'lucide-react';

type StatColor = 'azure' | 'gold' | 'emerald' | 'rose' | 'slate';

const COLOR_CLASSES: Record<StatColor, { bg: string; text: string; iconBg: string }> = {
  azure: { bg: 'bg-rotary-azure/10', text: 'text-rotary-azure', iconBg: 'bg-rotary-azure' },
  gold: { bg: 'bg-rotary-gold/10', text: 'text-rotary-gold', iconBg: 'bg-rotary-gold' },
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', iconBg: 'bg-emerald-500' },
  rose: { bg: 'bg-rose-50', text: 'text-rose-600', iconBg: 'bg-rose-500' },
  slate: { bg: 'bg-slate-100', text: 'text-slate-600', iconBg: 'bg-slate-500' }
};

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color?: StatColor;
  sublabel?: string;
}

// Shared stat-card tile used by both dashboards. Color is restricted to the
// app's existing Rotary/status tokens -- no purple, matches the reference
// layout's card style without importing its purple palette.
export default function StatCard({ label, value, icon: Icon, color = 'azure', sublabel }: StatCardProps) {
  const classes = COLOR_CLASSES[color];
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm flex items-start gap-4">
      <div className={`w-11 h-11 rounded-xl ${classes.iconBg} text-white flex items-center justify-center shrink-0`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 font-display">{label}</span>
        <span className="block text-2xl font-black text-slate-800 font-display leading-tight mt-0.5">{value}</span>
        {sublabel && <span className={`block text-[11px] font-semibold mt-0.5 ${classes.text}`}>{sublabel}</span>}
      </div>
    </div>
  );
}
