import { supabase, isSupabaseConfigured } from './supabase';

// General site-content image uploads (Page Content sections, Projects,
// Gallery) -- separate from the per-user `avatars` bucket in
// memberAccount.ts. Public read, admin-only write (RLS on
// storage.objects), so only admins can ever change what's shown on the
// public site through this path.

function requireSupabase() {
  if (!isSupabaseConfigured || !supabase) throw new Error('This action requires a configured Supabase project.');
  return supabase;
}

function extFor(contentType: string): string {
  if (contentType === 'image/png') return 'png';
  if (contentType === 'image/webp') return 'webp';
  return 'jpg';
}

export const uploadSiteImage = async (uri: string, folder: string, contentType: string = 'image/jpeg'): Promise<string> => {
  const db = requireSupabase();
  const path = `${folder}/${Date.now()}_${Math.random().toString(36).slice(2, 9)}.${extFor(contentType)}`;
  const response = await fetch(uri);
  const blob = await response.blob();
  const { error } = await db.storage.from('site-images').upload(path, blob, { contentType, upsert: false });
  if (error) throw error;
  const { data } = db.storage.from('site-images').getPublicUrl(path);
  return data.publicUrl;
};

// Newsletter PDF uploads (`newsletters` bucket) -- public read, media-officer-
// tier write only (RLS on storage.objects), separate bucket from site-images
// since it holds documents, not photos, and has its own mime/size limits.
export const uploadNewsletterPdf = async (uri: string): Promise<string> => {
  const db = requireSupabase();
  const path = `${Date.now()}_${Math.random().toString(36).slice(2, 9)}.pdf`;
  const response = await fetch(uri);
  const blob = await response.blob();
  const { error } = await db.storage.from('newsletters').upload(path, blob, { contentType: 'application/pdf', upsert: false });
  if (error) throw error;
  const { data } = db.storage.from('newsletters').getPublicUrl(path);
  return data.publicUrl;
};
