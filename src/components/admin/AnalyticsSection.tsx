import React, { useState, useEffect } from 'react';
import { Users, Award, MessageCircle, RefreshCw, FolderPlus, KeyRound } from 'lucide-react';
import { getSupabaseAnalyticsSnapshot, AnalyticsSnapshot } from '../../supabase-service';
import StatCard from '../dashboard-shell/StatCard';

const EMPTY: AnalyticsSnapshot = {
  memberCount: 0,
  membersWithLogin: 0,
  phfCount: 0,
  submissionsByStatus: { pending: 0, approved: 0, rejected: 0 },
  submissionsLast30Days: 0,
  chatMessagesTotal: 0,
  chatMessagesLast7Days: 0,
  loginEventsByType: { success: 0, failed: 0, locked: 0 },
  loginEventsLast7Days: 0
};

function Breakdown({ segments }: { segments: { label: string; value: number; color: string }[] }) {
  const total = segments.reduce((sum, s) => sum + s.value, 0) || 1;
  return (
    <div className="space-y-3">
      <div className="w-full h-2.5 rounded-full overflow-hidden flex bg-slate-100">
        {segments.map((s) => (
          <div key={s.label} className={s.color} style={{ width: `${(s.value / total) * 100}%` }} />
        ))}
      </div>
      <div className="flex flex-wrap gap-4">
        {segments.map((s) => (
          <div key={s.label} className="flex items-center gap-1.5 text-[11px] text-slate-600">
            <span className={`w-2 h-2 rounded-full ${s.color}`} />
            <span className="font-bold">{s.value}</span>
            <span className="text-slate-400">{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AnalyticsSection() {
  const [snapshot, setSnapshot] = useState<AnalyticsSnapshot>(EMPTY);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      setSnapshot(await getSupabaseAnalyticsSnapshot());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end">
        <button
          onClick={load}
          disabled={loading}
          className="p-1.5 border border-slate-200 hover:border-slate-300 text-slate-500 rounded-lg transition-colors flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Members" value={snapshot.memberCount} icon={Users} color="azure" sublabel={`${snapshot.membersWithLogin} with a login`} />
        <StatCard label="Paul Harris Fellows" value={snapshot.phfCount} icon={Award} color="gold" />
        <StatCard label="Chat Activity" value={snapshot.chatMessagesLast7Days} icon={MessageCircle} color="emerald" sublabel={`${snapshot.chatMessagesTotal} messages all-time`} />
        <StatCard label="Logins (7 days)" value={snapshot.loginEventsLast7Days} icon={KeyRound} color="slate" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white border border-slate-150 rounded-2xl shadow-xs p-5 space-y-4">
          <h3 className="text-xs font-black font-display text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <FolderPlus className="h-4 w-4 text-rotary-azure" />
            Submissions
          </h3>
          <p className="text-[11px] text-slate-400">{snapshot.submissionsLast30Days} submitted in the last 30 days</p>
          <Breakdown
            segments={[
              { label: 'Pending', value: snapshot.submissionsByStatus.pending, color: 'bg-amber-400' },
              { label: 'Approved', value: snapshot.submissionsByStatus.approved, color: 'bg-emerald-500' },
              { label: 'Rejected', value: snapshot.submissionsByStatus.rejected, color: 'bg-rose-400' }
            ]}
          />
        </div>

        <div className="bg-white border border-slate-150 rounded-2xl shadow-xs p-5 space-y-4">
          <h3 className="text-xs font-black font-display text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-rotary-azure" />
            Login Activity
          </h3>
          <p className="text-[11px] text-slate-400">All recorded member login attempts</p>
          <Breakdown
            segments={[
              { label: 'Success', value: snapshot.loginEventsByType.success, color: 'bg-emerald-500' },
              { label: 'Failed', value: snapshot.loginEventsByType.failed, color: 'bg-amber-400' },
              { label: 'Locked', value: snapshot.loginEventsByType.locked, color: 'bg-rose-400' }
            ]}
          />
        </div>
      </div>
    </div>
  );
}
