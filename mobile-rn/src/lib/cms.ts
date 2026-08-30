import { supabase, isSupabaseConfigured } from './supabase';

// Generic admin-managed content blocks per public page -- lets an admin
// add/edit/remove freeform copy sections without a code change. Structured
// content (Projects, Events, Gallery) keeps its own dedicated tables/CRUD
// (see service.ts); this covers Home/About/WhatIsRotary/GetInvolved/Contact.

function requireSupabase() {
  if (!isSupabaseConfigured || !supabase) throw new Error('This action requires a configured Supabase project.');
  return supabase;
}

export type ContentPage = 'home' | 'about' | 'what_is_rotary' | 'get_involved' | 'contact';

export interface ContentBlock {
  id: string;
  page: ContentPage;
  sortOrder: number;
  title: string | null;
  body: string | null;
  imageUrl: string | null;
  isVisible: boolean;
}

function mapBlockRow(d: any): ContentBlock {
  return {
    id: d.id,
    page: d.page,
    sortOrder: d.sort_order,
    title: d.title,
    body: d.body,
    imageUrl: d.image_url,
    isVisible: d.is_visible
  };
}

export const getContentBlocks = async (page: ContentPage): Promise<ContentBlock[]> => {
  if (!isSupabaseConfigured || !supabase) return [];
  try {
    const { data, error } = await supabase
      .from('content_blocks')
      .select('*')
      .eq('page', page)
      .eq('is_visible', true)
      .order('sort_order', { ascending: true });
    if (error) throw error;
    return (data || []).map(mapBlockRow);
  } catch (err) {
    console.error('Supabase query error (content_blocks):', err);
    return [];
  }
};

export const adminListContentBlocks = async (page: ContentPage): Promise<ContentBlock[]> => {
  const db = requireSupabase();
  const { data, error } = await db.from('content_blocks').select('*').eq('page', page).order('sort_order', { ascending: true });
  if (error) throw error;
  return (data || []).map(mapBlockRow);
};

export const adminCreateContentBlock = async (input: Omit<ContentBlock, 'id'>): Promise<void> => {
  const db = requireSupabase();
  const { error } = await db.from('content_blocks').insert({
    page: input.page,
    sort_order: input.sortOrder,
    title: input.title,
    body: input.body,
    image_url: input.imageUrl,
    is_visible: input.isVisible
  });
  if (error) throw error;
};

export const adminUpdateContentBlock = async (id: string, patch: Partial<Omit<ContentBlock, 'id' | 'page'>>): Promise<void> => {
  const db = requireSupabase();
  const payload: any = { updated_at: new Date().toISOString() };
  if (patch.sortOrder !== undefined) payload.sort_order = patch.sortOrder;
  if (patch.title !== undefined) payload.title = patch.title;
  if (patch.body !== undefined) payload.body = patch.body;
  if (patch.imageUrl !== undefined) payload.image_url = patch.imageUrl;
  if (patch.isVisible !== undefined) payload.is_visible = patch.isVisible;
  const { error } = await db.from('content_blocks').update(payload).eq('id', id);
  if (error) throw error;
};

export const adminDeleteContentBlock = async (id: string): Promise<void> => {
  const db = requireSupabase();
  const { error } = await db.from('content_blocks').delete().eq('id', id);
  if (error) throw error;
};
