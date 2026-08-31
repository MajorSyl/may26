import { Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { supabase, isSupabaseConfigured } from './supabase';

// New self-serve member dashboard (email/password + Google OAuth signup,
// admin-approval workflow). This is intentionally separate from the
// existing officer-provisioned `users` roster table and Rotary-ID+PIN
// login (lib/service.ts) -- that system is untouched.

WebBrowser.maybeCompleteAuthSession();

function requireSupabase() {
  if (!isSupabaseConfigured || !supabase) throw new Error('This action requires a configured Supabase project.');
  return supabase;
}

export type MembershipStatus = 'pending' | 'approved' | 'rejected' | 'guest';

export interface MemberProfile {
  id: string;
  email: string | null;
  fullName: string | null;
  photoUrl: string | null;
  bio: string | null;
  phone: string | null;
  membershipStatus: MembershipStatus;
  requestedAt: string;
}

function mapProfileRow(d: any): MemberProfile {
  return {
    id: d.id,
    email: d.email,
    fullName: d.full_name,
    photoUrl: d.photo_url,
    bio: d.bio,
    phone: d.phone,
    membershipStatus: d.membership_status,
    requestedAt: d.requested_at
  };
}

export const getMemberProfile = async (): Promise<MemberProfile | null> => {
  const db = requireSupabase();
  const {
    data: { user }
  } = await db.auth.getUser();
  if (!user) return null;
  const { data, error } = await db.from('profiles').select('*').eq('id', user.id).maybeSingle();
  if (error) throw error;
  return data ? mapProfileRow(data) : null;
};

// Google sign-in fills these in automatically; email/password signup asks
// for a name in the app's own "are you a member or guest" prompt instead.
export const getGoogleSuggestedName = async (): Promise<string> => {
  const db = requireSupabase();
  const {
    data: { user }
  } = await db.auth.getUser();
  return (user?.user_metadata?.full_name as string) || (user?.email as string)?.split('@')[0] || '';
};

// Called the first time an authenticated user has no profiles row yet --
// covers both a fresh email/password signup and a first-time Google
// sign-in equally, since Google's redirect can't be paused mid-flow to ask
// the member/guest question beforehand.
export const createMemberProfile = async (kind: 'member' | 'guest', fullName: string): Promise<MemberProfile> => {
  const db = requireSupabase();
  const {
    data: { user }
  } = await db.auth.getUser();
  if (!user) throw new Error('Not signed in.');
  const googleAvatar = (user.user_metadata?.avatar_url as string) || null;
  const { data, error } = await db
    .from('profiles')
    .insert({
      id: user.id,
      email: user.email,
      full_name: fullName,
      photo_url: googleAvatar,
      membership_status: kind === 'member' ? 'pending' : 'guest'
    })
    .select('*')
    .single();
  if (error) throw error;
  return mapProfileRow(data);
};

export const updateMemberProfile = async (patch: { fullName?: string; photoUrl?: string; bio?: string; phone?: string }): Promise<void> => {
  const db = requireSupabase();
  const {
    data: { user }
  } = await db.auth.getUser();
  if (!user) throw new Error('Not signed in.');
  const payload: any = {};
  if (patch.fullName !== undefined) payload.full_name = patch.fullName;
  if (patch.photoUrl !== undefined) payload.photo_url = patch.photoUrl;
  if (patch.bio !== undefined) payload.bio = patch.bio;
  if (patch.phone !== undefined) payload.phone = patch.phone;
  const { error } = await db.from('profiles').update(payload).eq('id', user.id);
  if (error) throw error;
};

export const signUpMemberAccount = async (email: string, password: string): Promise<{ needsEmailConfirmation: boolean }> => {
  const db = requireSupabase();
  const { data, error } = await db.auth.signUp({ email: email.trim(), password });
  if (error) throw error;
  return { needsEmailConfirmation: !data.session };
};

export const signInMemberAccount = async (email: string, password: string): Promise<void> => {
  const db = requireSupabase();
  const { error } = await db.auth.signInWithPassword({ email: email.trim(), password });
  if (error) throw error;
};

export const signOutMemberAccount = async (): Promise<void> => {
  const db = requireSupabase();
  await db.auth.signOut();
};

// Google OAuth: on web, Supabase just redirects the whole page and picks
// the session back up via detectSessionInUrl. On native there's no
// browser navigation to redirect, so we open an in-app auth session
// (expo-web-browser) against our custom `rcfsmobile://auth-callback`
// scheme and parse the returned token fragment ourselves.
export const signInWithGoogle = async (): Promise<void> => {
  const db = requireSupabase();

  if (Platform.OS === 'web') {
    const { error } = await db.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: typeof window !== 'undefined' ? window.location.origin : undefined }
    });
    if (error) throw error;
    return;
  }

  const redirectUrl = Linking.createURL('auth-callback');
  const { data, error } = await db.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: redirectUrl, skipBrowserRedirect: true }
  });
  if (error) throw error;
  if (!data?.url) throw new Error('Could not start Google sign-in.');

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);
  if (result.type !== 'success' || !('url' in result) || !result.url) {
    throw new Error('Google sign-in was cancelled.');
  }

  const hashIndex = result.url.indexOf('#');
  const fragment = hashIndex >= 0 ? result.url.slice(hashIndex + 1) : '';
  const params = new URLSearchParams(fragment);
  const access_token = params.get('access_token');
  const refresh_token = params.get('refresh_token');
  if (!access_token || !refresh_token) throw new Error('Google sign-in did not return a session.');

  const { error: sessionErr } = await db.auth.setSession({ access_token, refresh_token });
  if (sessionErr) throw sessionErr;
};

export const uploadAvatar = async (uri: string, contentType: string = 'image/jpeg'): Promise<string> => {
  const db = requireSupabase();
  const {
    data: { user }
  } = await db.auth.getUser();
  if (!user) throw new Error('Not signed in.');
  const ext = contentType === 'image/png' ? 'png' : contentType === 'image/webp' ? 'webp' : 'jpg';
  const path = `${user.id}/avatar.${ext}`;
  const response = await fetch(uri);
  const blob = await response.blob();
  const { error } = await db.storage.from('avatars').upload(path, blob, { contentType, upsert: true });
  if (error) throw error;
  const { data } = db.storage.from('avatars').getPublicUrl(path);
  return `${data.publicUrl}?t=${Date.now()}`;
};

// -----------------------------------------------------------------------
// Member: submit a photo for the public gallery (goes into `submissions`,
// reviewed by an admin or Media/Communications officer before it appears
// in gallery_photos -- see AdminApprovalsScreen).
// -----------------------------------------------------------------------

export const submitGalleryPhoto = async (
  title: string,
  description: string,
  category: string,
  uri: string,
  contentType: string = 'image/jpeg'
): Promise<void> => {
  const db = requireSupabase();
  const {
    data: { user }
  } = await db.auth.getUser();
  if (!user) throw new Error('Not signed in.');

  const ext = contentType === 'image/png' ? 'png' : contentType === 'image/webp' ? 'webp' : 'jpg';
  const path = `${user.id}/submissions/${Date.now()}.${ext}`;
  const response = await fetch(uri);
  const blob = await response.blob();
  const { error: uploadErr } = await db.storage.from('member-uploads').upload(path, blob, { contentType, upsert: false });
  if (uploadErr) throw uploadErr;
  const { data: pub } = db.storage.from('member-uploads').getPublicUrl(path);

  const { error } = await db.from('submissions').insert({
    submitter_id: user.id,
    kind: 'photo',
    title,
    description,
    category,
    image_url: pub.publicUrl,
    status: 'pending'
  });
  if (error) throw error;
};

export const listMySubmissions = async () => {
  const db = requireSupabase();
  const {
    data: { user }
  } = await db.auth.getUser();
  if (!user) return [];
  const { data, error } = await db.from('submissions').select('*').eq('submitter_id', user.id).order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
};

// -----------------------------------------------------------------------
// Admin: pending-member review queue
// -----------------------------------------------------------------------

export const adminListPendingProfiles = async (): Promise<MemberProfile[]> => {
  const db = requireSupabase();
  const { data, error } = await db.from('profiles').select('*').eq('membership_status', 'pending').order('requested_at', { ascending: true });
  if (error) throw error;
  return (data || []).map(mapProfileRow);
};

export const adminListAllProfiles = async (): Promise<MemberProfile[]> => {
  const db = requireSupabase();
  const { data, error } = await db.from('profiles').select('*').order('requested_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(mapProfileRow);
};

export const adminReviewProfile = async (userId: string, decision: 'approved' | 'rejected'): Promise<void> => {
  const db = requireSupabase();
  const {
    data: { user }
  } = await db.auth.getUser();
  const { error } = await db
    .from('profiles')
    .update({ membership_status: decision, reviewed_by: user?.id || null, reviewed_at: new Date().toISOString() })
    .eq('id', userId);
  if (error) throw error;
};
