import { supabase, isSupabaseConfigured } from './supabase';

// Reads from social_posts (cached server-side by the sync-social-feed Edge
// Function -- see supabase/ cron jobs) -- never calls the Instagram/
// Facebook Graph API directly from the client.

export interface SocialPost {
  id: string;
  platform: 'instagram' | 'facebook';
  caption: string | null;
  mediaUrl: string | null;
  permalink: string;
  mediaType: string | null;
  postedAt: string | null;
}

function mapPostRow(d: any): SocialPost {
  return {
    id: d.id,
    platform: d.platform,
    caption: d.caption,
    mediaUrl: d.media_url,
    permalink: d.permalink,
    mediaType: d.media_type,
    postedAt: d.posted_at
  };
}

// Never throws -- the feed must degrade to "show nothing" on any failure,
// never break the page it's embedded in.
export const getSocialPosts = async (limit = 12, platform?: 'instagram' | 'facebook'): Promise<SocialPost[]> => {
  if (!isSupabaseConfigured || !supabase) return [];
  try {
    let query = supabase.from('social_posts').select('*').order('posted_at', { ascending: false }).limit(limit);
    if (platform) query = query.eq('platform', platform);
    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map(mapPostRow);
  } catch (err) {
    console.error('Supabase query error (social_posts):', err);
    return [];
  }
};

// -----------------------------------------------------------------------
// Admin: credentials + sync/refresh status
// -----------------------------------------------------------------------

export interface SocialConfig {
  metaAppId: string;
  metaAppSecret: string;
  instagramAccessToken: string;
  instagramAccountId: string;
  instagramTokenExpiresAt: string | null;
  facebookAccessToken: string;
  facebookPageId: string;
  facebookTokenExpiresAt: string | null;
  lastSyncedAt: string | null;
  lastSyncError: string | null;
  lastRefreshAttemptAt: string | null;
  lastRefreshError: string | null;
}

function requireSupabase() {
  if (!isSupabaseConfigured || !supabase) throw new Error('This action requires a configured Supabase project.');
  return supabase;
}

function mapConfigRow(d: any): SocialConfig {
  return {
    metaAppId: d.meta_app_id || '',
    metaAppSecret: d.meta_app_secret || '',
    instagramAccessToken: d.instagram_access_token || '',
    instagramAccountId: d.instagram_account_id || '',
    instagramTokenExpiresAt: d.instagram_token_expires_at,
    facebookAccessToken: d.facebook_access_token || '',
    facebookPageId: d.facebook_page_id || '',
    facebookTokenExpiresAt: d.facebook_token_expires_at,
    lastSyncedAt: d.last_synced_at,
    lastSyncError: d.last_sync_error,
    lastRefreshAttemptAt: d.last_refresh_attempt_at,
    lastRefreshError: d.last_refresh_error
  };
}

export const adminGetSocialConfig = async (): Promise<SocialConfig> => {
  const db = requireSupabase();
  const { data, error } = await db.from('social_config').select('*').eq('id', 'default').single();
  if (error) throw error;
  return mapConfigRow(data);
};

export const adminSaveSocialCredentials = async (input: {
  metaAppId: string;
  metaAppSecret: string;
  instagramAccessToken: string;
  instagramAccountId: string;
  facebookAccessToken: string;
  facebookPageId: string;
}): Promise<void> => {
  const db = requireSupabase();
  const { error } = await db
    .from('social_config')
    .update({
      meta_app_id: input.metaAppId,
      meta_app_secret: input.metaAppSecret,
      instagram_access_token: input.instagramAccessToken,
      instagram_account_id: input.instagramAccountId,
      facebook_access_token: input.facebookAccessToken,
      facebook_page_id: input.facebookPageId,
      updated_at: new Date().toISOString()
    })
    .eq('id', 'default');
  if (error) throw error;
};

// Manual "Sync Now" from the admin screen -- calls the same Edge Function
// the cron job calls, so an admin doesn't have to wait up to 4 hours to
// confirm freshly-pasted credentials actually work.
export const adminTriggerSocialSync = async (): Promise<void> => {
  if (!isSupabaseConfigured) throw new Error('Supabase is not configured.');
  const res = await fetch(`${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/sync-social-feed`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}` }
  });
  if (!res.ok) throw new Error(`Sync failed (${res.status})`);
};
