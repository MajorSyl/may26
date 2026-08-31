import { supabase, isSupabaseConfigured } from './supabase';
import { getLocalData, setLocalData } from './localStore';
import { Project, ClubEvent, UserProfile, ContactInquiry, EventRSVP, ProjectApplication, GalleryPhoto, Submission } from '../types';
import { INITIAL_PROJECTS, INITIAL_EVENTS, INITIAL_MEMBER_DIRECTORY } from '../data';

export { isSupabaseConfigured };

export function randomId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 11)}`;
}

function requireSupabase() {
  if (!isSupabaseConfigured || !supabase) throw new Error('This action requires a configured Supabase project.');
  return supabase;
}

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
  homeVideoUrl: string;
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
  socialInstagramUrl: 'https://www.instagram.com/rcfsunset',
  homeVideoUrl: ''
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
        rotaryId: d.rotary_id,
        authUserId: d.auth_user_id
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

// -----------------------------------------------------------------------
// Member portal: own profile, own contact info, own submissions.
// RLS enforces "own" -- a member can only ever touch rows tied to their
// auth.uid(), the queries below don't need to filter defensively.
// -----------------------------------------------------------------------

export interface MemberContactInfo {
  uid: string;
  email?: string;
  phone?: string;
  birthday?: string;
}

async function currentAuthUser() {
  const db = requireSupabase();
  const {
    data: { user }
  } = await db.auth.getUser();
  if (!user) throw new Error('Not signed in.');
  return user;
}

export const getMyProfile = async (): Promise<UserProfile> => {
  const db = requireSupabase();
  const user = await currentAuthUser();
  const { data, error } = await db.from('users').select('*').eq('auth_user_id', user.id).single();
  if (error || !data) throw new Error('Could not load your profile.');
  return {
    uid: data.uid,
    name: data.name,
    role: data.role,
    committee: data.committee,
    classification: data.classification,
    isPaulHarrisFellow: data.ispaulharrisfellow,
    paulHarrisLevel: data.paulharrislevel,
    avatarUrl: data.avatarurl,
    bio: data.bio,
    rotaryId: data.rotary_id,
    authUserId: data.auth_user_id
  };
};

export const updateMyProfile = async (uid: string, patch: { bio?: string; classification?: string; committee?: string }): Promise<void> => {
  const db = requireSupabase();
  const { error } = await db.from('users').update(patch).eq('uid', uid);
  if (error) throw error;
};

export const getMyContactInfo = async (uid: string): Promise<MemberContactInfo | null> => {
  const db = requireSupabase();
  const { data, error } = await db.from('member_contact_info').select('*').eq('uid', uid).maybeSingle();
  if (error) throw error;
  return data;
};

export const saveMyContactInfo = async (info: MemberContactInfo): Promise<void> => {
  const db = requireSupabase();
  const { error } = await db.from('member_contact_info').upsert(info);
  if (error) throw error;
};

export const getMySubmissions = async (): Promise<Submission[]> => {
  const db = requireSupabase();
  const user = await currentAuthUser();
  const { data, error } = await db.from('submissions').select('*').eq('submitter_id', user.id).order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(mapSubmissionRow);
};

export const createSubmission = async (input: {
  kind: 'project' | 'photo';
  title: string;
  description?: string;
  category?: string;
  year?: number;
  imageUrl?: string;
}): Promise<void> => {
  const db = requireSupabase();
  const user = await currentAuthUser();
  const { error } = await db.from('submissions').insert({
    submitter_id: user.id,
    kind: input.kind,
    title: input.title,
    description: input.description || null,
    category: input.category || null,
    year: input.year || null,
    image_url: input.imageUrl || null,
    status: 'pending'
  });
  if (error) throw error;
};

function mapSubmissionRow(d: any): Submission {
  return {
    id: d.id,
    submitterId: d.submitter_id,
    kind: d.kind,
    title: d.title,
    description: d.description,
    category: d.category,
    year: d.year,
    imageUrl: d.image_url,
    status: d.status,
    rejectReason: d.reject_reason,
    reviewedBy: d.reviewed_by,
    reviewedAt: d.reviewed_at,
    publishedId: d.published_id,
    createdAt: d.created_at
  };
}

// -----------------------------------------------------------------------
// Admin: Projects CRUD
// -----------------------------------------------------------------------

// Only these columns actually exist on the live `projects` table -- built
// explicitly rather than spreading the input object, since Project also
// carries fields (locationName, budget, teamLeads, etc.) that don't exist
// as columns and would otherwise get sent straight into a failing insert.
export const adminCreateProject = async (input: Omit<Project, 'id'>): Promise<void> => {
  const db = requireSupabase();
  const { error } = await db.from('projects').insert({
    id: randomId('proj'),
    title: input.title,
    category: input.category,
    description: input.description,
    year: input.year,
    impact: input.impact || null,
    status: input.status,
    imageurl: input.imageUrl || null
  });
  if (error) throw error;
};

export const adminUpdateProject = async (id: string, patch: Partial<Project>): Promise<void> => {
  const db = requireSupabase();
  const payload: any = {};
  if (patch.title !== undefined) payload.title = patch.title;
  if (patch.category !== undefined) payload.category = patch.category;
  if (patch.description !== undefined) payload.description = patch.description;
  if (patch.year !== undefined) payload.year = patch.year;
  if (patch.impact !== undefined) payload.impact = patch.impact;
  if (patch.status !== undefined) payload.status = patch.status;
  if (patch.imageUrl !== undefined) payload.imageurl = patch.imageUrl;
  const { error } = await db.from('projects').update(payload).eq('id', id);
  if (error) throw error;
};

export const adminDeleteProject = async (id: string): Promise<void> => {
  const db = requireSupabase();
  const { error } = await db.from('projects').delete().eq('id', id);
  if (error) throw error;
};

// -----------------------------------------------------------------------
// Admin: Events CRUD
// -----------------------------------------------------------------------

export const adminCreateEvent = async (input: Omit<ClubEvent, 'id'>): Promise<void> => {
  const db = requireSupabase();
  const { error } = await db.from('events').insert({ id: randomId('evt'), ...input });
  if (error) throw error;
};

export const adminUpdateEvent = async (id: string, patch: Partial<ClubEvent>): Promise<void> => {
  const db = requireSupabase();
  const { error } = await db.from('events').update(patch).eq('id', id);
  if (error) throw error;
};

export const adminDeleteEvent = async (id: string): Promise<void> => {
  const db = requireSupabase();
  const { error } = await db.from('events').delete().eq('id', id);
  if (error) throw error;
};

// -----------------------------------------------------------------------
// Admin: Members (edit/delete existing profiles -- provisioning a brand
// new member login goes through the member-accounts Edge Function, which
// is out of scope for this pass; see MIGRATION_NOTES.md)
// -----------------------------------------------------------------------

export const adminUpdateMember = async (uid: string, patch: Partial<UserProfile>): Promise<void> => {
  const db = requireSupabase();
  const payload: any = {};
  if (patch.name !== undefined) payload.name = patch.name;
  if (patch.role !== undefined) payload.role = patch.role;
  if (patch.committee !== undefined) payload.committee = patch.committee;
  if (patch.classification !== undefined) payload.classification = patch.classification;
  if (patch.bio !== undefined) payload.bio = patch.bio;
  if (patch.isPaulHarrisFellow !== undefined) payload.ispaulharrisfellow = patch.isPaulHarrisFellow;
  if (patch.paulHarrisLevel !== undefined) payload.paulharrislevel = patch.paulHarrisLevel;
  const { error } = await db.from('users').update(payload).eq('uid', uid);
  if (error) throw error;
};

export const adminDeleteMember = async (uid: string): Promise<void> => {
  const db = requireSupabase();
  const { error } = await db.from('users').delete().eq('uid', uid);
  if (error) throw error;
};

// -----------------------------------------------------------------------
// Admin: Inquiries + Project Applications + RSVPs (read + clear)
// -----------------------------------------------------------------------

export const adminListInquiries = async (): Promise<ContactInquiry[]> => {
  const db = requireSupabase();
  const { data, error } = await db.from('inquiries').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []) as ContactInquiry[];
};

export const adminDeleteInquiry = async (id: string): Promise<void> => {
  const db = requireSupabase();
  const { error } = await db.from('inquiries').delete().eq('id', id);
  if (error) throw error;
};

export const adminListApplications = async (): Promise<ProjectApplication[]> => {
  const db = requireSupabase();
  const { data, error } = await db.from('project_applications').select('*').order('submitted_at', { ascending: false });
  if (error) throw error;
  return (data || []) as ProjectApplication[];
};

export const adminListRsvps = async (): Promise<EventRSVP[]> => {
  const db = requireSupabase();
  const { data, error } = await db.from('event_rsvps').select('*').order('submitted_at', { ascending: false });
  if (error) throw error;
  return (data || []) as EventRSVP[];
};

// -----------------------------------------------------------------------
// Admin: Approvals (member-submitted projects/photos awaiting review)
// -----------------------------------------------------------------------

export const adminListSubmissions = async (status?: 'pending' | 'approved' | 'rejected'): Promise<Submission[]> => {
  const db = requireSupabase();
  let query = db.from('submissions').select('*').order('created_at', { ascending: false });
  if (status) query = query.eq('status', status);
  const { data, error } = await query;
  if (error) throw error;
  return (data || []).map(mapSubmissionRow);
};

const GALLERY_CATEGORIES = ['meetings', 'anniversary', 'outreach', 'rotaract'];

export const adminApproveSubmission = async (sub: Submission): Promise<void> => {
  const db = requireSupabase();
  const user = await currentAuthUser();
  let publishedId: string;

  if (sub.kind === 'project') {
    publishedId = randomId('proj');
    const { error: insertErr } = await db.from('projects').insert({
      id: publishedId,
      title: sub.title,
      category: sub.category || 'Community',
      description: sub.description || '',
      year: sub.year || new Date().getFullYear(),
      status: 'Active',
      imageurl: sub.imageUrl || null
    });
    if (insertErr) throw insertErr;
  } else {
    const category = GALLERY_CATEGORIES.includes(sub.category || '') ? sub.category! : 'meetings';
    const { data, error: insertErr } = await db
      .from('gallery_photos')
      .insert({
        title: sub.title,
        description: sub.description || null,
        category,
        image_url: sub.imageUrl || '',
        submission_id: sub.id
      })
      .select('id')
      .single();
    if (insertErr) throw insertErr;
    publishedId = data.id;
  }

  const { error } = await db
    .from('submissions')
    .update({ status: 'approved', published_id: publishedId, reviewed_by: user.id, reviewed_at: new Date().toISOString() })
    .eq('id', sub.id);
  if (error) throw error;
};

export const adminRejectSubmission = async (id: string, reason: string): Promise<void> => {
  const db = requireSupabase();
  const user = await currentAuthUser();
  const { error } = await db
    .from('submissions')
    .update({ status: 'rejected', reject_reason: reason, reviewed_by: user.id, reviewed_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
};

// -----------------------------------------------------------------------
// Admin: Site settings (write side of getSiteSettings above)
// -----------------------------------------------------------------------

export const saveSiteSettings = async (settings: SiteSettings): Promise<void> => {
  const db = requireSupabase();
  const { error } = await db.from('projects').upsert({
    id: 'settings_site_config',
    title: 'Site Settings',
    category: 'internal',
    description: JSON.stringify(settings),
    year: new Date().getFullYear(),
    status: 'Completed'
  });
  if (error) throw error;
};

// -----------------------------------------------------------------------
// Admin: Roles (the `admins` table -- who has admin/reviewer access)
// -----------------------------------------------------------------------

export interface AdminRow {
  userId: string;
  role: string;
  memberName?: string;
  memberUid?: string;
}

export const adminListAdmins = async (): Promise<AdminRow[]> => {
  const db = requireSupabase();
  const { data, error } = await db.from('admins').select('*');
  if (error) throw error;
  const users = await getUsers();
  return (data || []).map((d: any) => {
    const match = users.find((u) => u.authUserId === d.user_id);
    return { userId: d.user_id, role: d.role, memberName: match?.name, memberUid: match?.uid };
  });
};

export const adminAddAdmin = async (authUserId: string, role: 'admin' | 'reviewer' = 'admin'): Promise<void> => {
  const db = requireSupabase();
  const { error } = await db.from('admins').insert({ user_id: authUserId, role });
  if (error) throw error;
};

export const adminRemoveAdmin = async (authUserId: string): Promise<void> => {
  const db = requireSupabase();
  const { error } = await db.from('admins').delete().eq('user_id', authUserId);
  if (error) throw error;
};

// -----------------------------------------------------------------------
// Admin: Analytics (simple counts, no realtime)
// -----------------------------------------------------------------------

export interface AnalyticsSnapshot {
  members: number;
  projects: number;
  events: number;
  inquiries: number;
  applications: number;
  rsvps: number;
  pendingSubmissions: number;
  admins: number;
}

async function countRows(table: string, filter?: (q: any) => any): Promise<number> {
  const db = requireSupabase();
  let query = db.from(table).select('*', { count: 'exact', head: true });
  if (filter) query = filter(query);
  const { count, error } = await query;
  if (error) throw error;
  return count || 0;
}

export const adminGetAnalytics = async (): Promise<AnalyticsSnapshot> => {
  const [members, projects, events, inquiries, applications, rsvps, pendingSubmissions, admins] = await Promise.all([
    countRows('users'),
    countRows('projects', (q) => q.neq('id', 'settings_site_config')),
    countRows('events'),
    countRows('inquiries'),
    countRows('project_applications'),
    countRows('event_rsvps'),
    countRows('submissions', (q) => q.eq('status', 'pending')),
    countRows('admins')
  ]);
  return { members, projects, events, inquiries, applications, rsvps, pendingSubmissions, admins };
};
