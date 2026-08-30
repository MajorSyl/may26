import { Platform } from 'react-native';
import { supabase, isSupabaseConfigured, AsyncStorage } from './supabase';

// Visitor analytics: page-view logging (fire-and-forget, via the
// log-page-view Edge Function so IP geolocation happens server-side) plus
// admin-side reads of the resulting page_views table.

const VISITOR_ID_KEY = 'rn_visitor_id';

async function getOrCreateVisitorId(): Promise<string> {
  try {
    const existing = await AsyncStorage.getItem(VISITOR_ID_KEY);
    if (existing) return existing;
    const id = `v_${Math.random().toString(36).slice(2, 11)}_${Date.now()}`;
    await AsyncStorage.setItem(VISITOR_ID_KEY, id);
    return id;
  } catch {
    return `v_${Math.random().toString(36).slice(2, 11)}`;
  }
}

// Never throws -- a broken analytics call must never break the screen it's
// attached to. Call this from a screen's useEffect on mount/focus.
export const logPageView = async (page: string): Promise<void> => {
  if (!isSupabaseConfigured || !supabase) return;
  try {
    const {
      data: { user }
    } = await supabase.auth.getUser();
    const visitorId = await getOrCreateVisitorId();
    const device = Platform.OS;
    const browser = Platform.OS === 'web' && typeof navigator !== 'undefined' ? navigator.userAgent : null;

    await fetch(`${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/log-page-view`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({ page, visitorId, userId: user?.id || null, device, browser })
    });
  } catch {
    // Best-effort only.
  }
};

export interface PageView {
  id: string;
  page: string;
  visitorId: string | null;
  city: string | null;
  country: string | null;
  device: string | null;
  browser: string | null;
  createdAt: string;
}

function requireSupabase() {
  if (!isSupabaseConfigured || !supabase) throw new Error('This action requires a configured Supabase project.');
  return supabase;
}

function mapViewRow(d: any): PageView {
  return {
    id: d.id,
    page: d.page,
    visitorId: d.visitor_id,
    city: d.city,
    country: d.country,
    device: d.device,
    browser: d.browser,
    createdAt: d.created_at
  };
}

export const adminListPageViews = async (limit = 200): Promise<PageView[]> => {
  const db = requireSupabase();
  const { data, error } = await db.from('page_views').select('*').order('created_at', { ascending: false }).limit(limit);
  if (error) throw error;
  return (data || []).map(mapViewRow);
};

export interface AnalyticsSummary {
  totalViews: number;
  uniqueVisitors: number;
  topPages: { page: string; count: number }[];
  topLocations: { label: string; count: number }[];
  dailyCounts: { label: string; count: number }[];
}

// Pulls up to 2000 recent rows and aggregates client-side -- simple and
// good enough for a club-sized app; would move to a SQL view/RPC if volume
// ever justified it.
export const adminGetAnalyticsSummary = async (): Promise<AnalyticsSummary> => {
  const db = requireSupabase();
  const { data, error } = await db.from('page_views').select('*').order('created_at', { ascending: false }).limit(2000);
  if (error) throw error;
  const rows = (data || []).map(mapViewRow);

  const totalViews = rows.length;
  const uniqueVisitors = new Set(rows.map((r) => r.visitorId).filter(Boolean)).size;

  const pageCounts = new Map<string, number>();
  const locationCounts = new Map<string, number>();
  const dayCounts = new Map<string, number>();

  for (const r of rows) {
    pageCounts.set(r.page, (pageCounts.get(r.page) || 0) + 1);
    const loc = r.city && r.country ? `${r.city}, ${r.country}` : r.country || 'Unknown';
    locationCounts.set(loc, (locationCounts.get(loc) || 0) + 1);
    const day = r.createdAt.slice(0, 10);
    dayCounts.set(day, (dayCounts.get(day) || 0) + 1);
  }

  const topPages = [...pageCounts.entries()]
    .map(([page, count]) => ({ page, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  const topLocations = [...locationCounts.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  const last14Days: string[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    last14Days.push(d.toISOString().slice(0, 10));
  }
  const dailyCounts = last14Days.map((day) => ({ label: day.slice(5), count: dayCounts.get(day) || 0 }));

  return { totalViews, uniqueVisitors, topPages, topLocations, dailyCounts };
};
