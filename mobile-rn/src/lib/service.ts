import { supabase, isSupabaseConfigured } from './supabase';
import { getLocalData, setLocalData } from './localStore';
import { Project, ClubEvent, UserProfile, ContactInquiry, EventRSVP, ProjectApplication, GalleryPhoto } from '../types';
import { INITIAL_PROJECTS, INITIAL_EVENTS, INITIAL_MEMBER_DIRECTORY } from '../data';

export { isSupabaseConfigured };

// Talks directly to this app's Supabase project: its tables, RLS policies,
// and Edge Functions. Only covers the read/write operations the in-scope
// screens need (public content + the two login flows); the member/admin
// dashboards' data operations were intentionally left out of this pass.

// -----------------------------------------------------------------------
// Site settings (About/GetInvolved/Contact copy + contact info)
// -----------------------------------------------------------------------

export interface SiteSettings {
  homeHeroTitle: string;
  homeHeroSubtitle: string;
  aboutHeaderBadge: string;
  aboutHeaderTitle: string;
  aboutHeaderDesc: string;
  aboutVisionTitle: string;
  aboutVisionBody: string;
  aboutMissionTitle: string;
  aboutMissionBody: string;
  involvedBadge: string;
  involvedTitle: string;
  involvedSubtitle: string;
  contactEmail: string;
  contactPhone: string;
  socialFacebookUrl: string;
  socialInstagramUrl: string;
}

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  homeHeroTitle: 'Service Above Self',
  homeHeroSubtitle:
    'We are a community of dedicated local and international professionals taking action in Freetown to pioneer sustainable clean water access, secondary education, and healthcare.',
  aboutHeaderBadge: 'Our Foundation',
  aboutHeaderTitle: 'The Sunset Legacy',
  aboutHeaderDesc: 'The Rotary Club of Freetown Sunset brings together professionals in Freetown for fellowship and community service.',
  aboutVisionTitle: 'Our Vision',
  aboutVisionBody: "To build a diverse, engaged network of leaders serving the Freetown community and upholding Rotary's standard of ethical service.",
  aboutMissionTitle: 'Our Mission',
  aboutMissionBody: "Through weekly fellowship, professional collaboration, and hands-on community service, we work toward Rotary's mission of Service Above Self.",
  involvedBadge: 'Take Action Today',
  involvedTitle: 'Help Us Empower Freetown Communities',
  involvedSubtitle:
    'Whether you are a local professional looking to give back or an international partner ready to fund systemic change, there are multiple avenues to work with Freetown Sunset.',
  contactEmail: 'placeholder@rcfsunset.org',
  contactPhone: '000000000',
  socialFacebookUrl: 'https://www.facebook.com/profile.php?id=100071187714639',
  socialInstagramUrl: 'https://www.instagram.com/rcfsunset'
};

// Mirrors the web app: settings live as a JSON blob in the `description`
// column of a disguised row (id = 'settings_site_config') in `projects`.
export const getSiteSettings = async (): Promise<SiteSettings> => {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('projects').select('*').eq('id', 'settings_site_config').single();
      if (error || !data) return getLocalData('rn_site_settings', DEFAULT_SITE_SETTINGS);
      const parsed = JSON.parse(data.description);
      return { ...DEFAULT_SITE_SETTINGS, ...parsed };
    } catch {
      return getLocalData('rn_site_settings', DEFAULT_SITE_SETTINGS);
    }
  }
  return getLocalData('rn_site_settings', DEFAULT_SITE_SETTINGS);
};

// -----------------------------------------------------------------------
// Projects
// -----------------------------------------------------------------------

export const getProjects = async (): Promise<Project[]> => {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('projects').select('*').order('year', { ascending: false });
      if (error) throw error;
      if (data && data.length > 0) {
        return data
          .filter((d: any) => d.id !== 'settings_site_config')
          .map((d: any) => ({ ...d, imageUrl: d.imageUrl || d.imageurl })) as Project[];
      }
      return INITIAL_PROJECTS;
    } catch (err) {
      console.error('Supabase query error (projects), falling back:', err);
      return INITIAL_PROJECTS;
    }
  }
  return getLocalData('rn_projects', INITIAL_PROJECTS);
};

// -----------------------------------------------------------------------
// Events
// -----------------------------------------------------------------------

export const getEvents = async (): Promise<ClubEvent[]> => {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('events').select('*').order('date', { ascending: true });
      if (error) throw error;
      return (data || []) as ClubEvent[];
    } catch (err) {
      console.error('Supabase query error (events), falling back:', err);
      return INITIAL_EVENTS;
    }
  }
  return getLocalData('rn_events', INITIAL_EVENTS);
};

export const submitRSVP = async (rsvp: EventRSVP): Promise<void> => {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from('event_rsvps').insert({
      event_id: rsvp.event_id,
      name: rsvp.name,
      email: rsvp.email
    });
    if (error) throw error;
    return;
  }
  const list = await getLocalData<EventRSVP[]>('rn_rsvps', []);
  list.push(rsvp);
  await setLocalData('rn_rsvps', list);
};

// -----------------------------------------------------------------------
// Gallery (approved club photos)
// -----------------------------------------------------------------------

export const getGalleryPhotos = async (): Promise<GalleryPhoto[]> => {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('gallery_photos').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []).map((d: any) => ({
        id: d.id,
        title: d.title,
        description: d.description,
        category: d.category,
        imageUrl: d.image_url,
        takenDate: d.taken_date,
        location: d.location
      }));
    } catch (err) {
      console.error('Supabase query error (gallery_photos):', err);
      return [];
    }
  }
  return getLocalData('rn_gallery_photos', []);
};

// -----------------------------------------------------------------------
// Members directory (public roster fields only)
// -----------------------------------------------------------------------

export const getUsers = async (): Promise<UserProfile[]> => {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('users').select('*');
      if (error) throw error;
      if (!data || data.length === 0) return INITIAL_MEMBER_DIRECTORY;
      return data.map((d: any) => ({
        uid: d.uid,
        name: d.name,
        role: d.role,
        attendanceRate: d.attendancerate,
        contributionGoals: d.contributiongoals,
        contributedAmount: d.contributedamount,
        committee: d.committee,
        tasks: d.tasks || [],
        classification: d.classification,
        isPaulHarrisFellow: d.ispaulharrisfellow,
        paulHarrisLevel: d.paulharrislevel,
        joinedDate: d.joineddate,
        avatarUrl: d.avatarurl,
        bio: d.bio,
        rotaryId: d.rotary_id
      }));
    } catch (err) {
      console.error('Supabase query error (users), falling back:', err);
      return INITIAL_MEMBER_DIRECTORY;
    }
  }
  return getLocalData('rn_users', INITIAL_MEMBER_DIRECTORY);
};

// -----------------------------------------------------------------------
// Contact / Get Involved forms
// -----------------------------------------------------------------------

export const submitInquiry = async (inquiry: ContactInquiry): Promise<void> => {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from('inquiries').insert({
      id: inquiry.id,
      name: inquiry.name,
      email: inquiry.email,
      subject: inquiry.subject,
      message: inquiry.message,
      type: inquiry.type
    });
    if (error) throw error;
    return;
  }
  const list = await getLocalData<ContactInquiry[]>('rn_inquiries', []);
  list.push(inquiry);
  await setLocalData('rn_inquiries', list);
};

export const submitApplication = async (app: ProjectApplication): Promise<void> => {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from('project_applications').insert({
      project_id: app.project_id,
      name: app.name,
      email: app.email,
      statement: app.statement
    });
    if (error) throw error;
    return;
  }
  const list = await getLocalData<ProjectApplication[]>('rn_applications', []);
  list.push(app);
  await setLocalData('rn_applications', list);
};

// -----------------------------------------------------------------------
// Member auth: Rotary ID + 6-digit PIN via the existing member-login Edge
// Function (unauthenticated by design -- see supabase/functions/member-login
// in the main repo). Same contract as the web app.
// -----------------------------------------------------------------------

export const loginWithRotaryIdAndPin = async (rotaryId: string, pin: string): Promise<UserProfile> => {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Member login requires a configured Supabase project.');
  }

  const { data, error } = await supabase.functions.invoke('member-login', {
    body: { rotaryId: rotaryId.trim().toUpperCase(), pin }
  });

  if (error) {
    // supabase-js surfaces non-2xx Edge Function responses as an error with
    // no parsed body by default; try to recover the { error: string } JSON
    // the function actually sent so the UI can show the real message
    // ("Invalid Rotary ID or PIN.", lockout countdown, etc).
    const context = (error as any)?.context;
    if (context?.json) {
      const body = await context.json().catch(() => null);
      if (body?.error) throw new Error(body.error);
    }
    throw new Error(error.message || 'Could not sign in. Check your Rotary ID and PIN.');
  }
  if (data?.error) throw new Error(data.error);
  if (!data?.access_token || !data?.refresh_token) {
    throw new Error('Sign-in did not return a session. Please try again.');
  }

  const { error: sessionErr } = await supabase.auth.setSession({
    access_token: data.access_token,
    refresh_token: data.refresh_token
  });
  if (sessionErr) throw sessionErr;

  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Signed in, but could not load your session.');

  const { data: profileRow, error: profileErr } = await supabase.from('users').select('*').eq('auth_user_id', user.id).maybeSingle();
  if (profileErr || !profileRow) throw new Error('Signed in, but could not load your member profile.');

  return {
    uid: profileRow.uid,
    name: profileRow.name,
    role: profileRow.role,
    committee: profileRow.committee,
    classification: profileRow.classification,
    isPaulHarrisFellow: profileRow.ispaulharrisfellow,
    paulHarrisLevel: profileRow.paulharrislevel,
    avatarUrl: profileRow.avatarurl,
    bio: profileRow.bio,
    rotaryId: profileRow.rotary_id,
    authUserId: profileRow.auth_user_id
  };
};

// -----------------------------------------------------------------------
// Admin auth: Supabase email/password, then re-verified against the
// `admins` table (RLS-gated, same as the web app's checkIsAdmin) -- the
// frontend check here is a UX convenience only, the actual enforcement is
// RLS on the admin-gated tables.
// -----------------------------------------------------------------------

export const checkIsAdmin = async (userId: string): Promise<boolean> => {
  if (!isSupabaseConfigured || !supabase) return false;
  try {
    const { data, error } = await supabase.from('admins').select('user_id').eq('user_id', userId).maybeSingle();
    if (error) return false;
    return !!data;
  } catch {
    return false;
  }
};

export const loginAdmin = async (email: string, password: string): Promise<void> => {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Admin login requires a configured Supabase project.');
  }
  const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
  if (error) throw error;
  if (!data.user) throw new Error('No user returned from authentication service.');

  const isAdmin = await checkIsAdmin(data.user.id);
  if (!isAdmin) {
    await supabase.auth.signOut().catch(() => {});
    throw new Error('Access Denied: This account is not registered as an admin.');
  }
};

export const logOut = async (): Promise<void> => {
  if (isSupabaseConfigured && supabase) {
    await supabase.auth.signOut();
  }
};
