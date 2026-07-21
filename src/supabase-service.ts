import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Project, ClubEvent, UserProfile, ContactInquiry, EventRSVP, ProjectApplication, NewsletterSubscriber, Submission, GalleryPhoto, ChatMessage, TimelinePost, TimelineComment } from './types';
import { INITIAL_PROJECTS, INITIAL_EVENTS, INITIAL_MEMBER_DIRECTORY } from './data';
import { safeStorage } from './lib/safe-storage';
import { capacitorPreferencesStorage, isNativeApp } from './lib/capacitor-storage';

// Read configuration from Vite environment
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL;
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey && supabaseUrl !== 'undefined' && supabaseAnonKey !== 'undefined');

// Real Supabase Client Instance (if variables exist). Inside the Capacitor
// app shell, session storage is backed by native Preferences instead of
// WebView localStorage (see lib/capacitor-storage.ts); in the web build,
// isNativeApp() is always false and this is byte-for-byte the same client
// creation as before.
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!, isNativeApp() ? { auth: { storage: capacitorPreferencesStorage } } : undefined)
  : null;

// LocalStorage Persistence helper for Simulator
const getLocalData = <T>(key: string, defaultVal: T): T => {
  const val = safeStorage.getItem(key);
  if (!val) {
    safeStorage.setItem(key, JSON.stringify(defaultVal));
    return defaultVal;
  }
  return JSON.parse(val);
};

const setLocalData = <T>(key: string, data: T) => {
  safeStorage.setItem(key, JSON.stringify(data));
};

// -------------------------------------------------------------
// SUPABASE OPERATIONS ENGINE (AUTONOMOUS SWITCHOVER)
// -------------------------------------------------------------

export interface PageBlock {
  id: string;
  title: string;
  bgColor: 'dark' | 'light' | 'slate' | 'brand' | 'gold';
  visible: boolean;
}

export interface SiteSettings {
  homeHeroTitle: string;
  homeHeroSubtitle: string;
  homeHeroBadge: string;
  homeResidentsServed: string;
  homeResourcesShipped: string;
  homeMaternalKits: string;
  homeFinancingAudit: string;
  homeMissionTitle: string;
  homeMissionBody1: string;
  homeMissionBody2: string;
  homeServiceValueTitle1: string;
  homeServiceValueBody1: string;
  homeServiceValueTitle2: string;
  homeServiceValueBody2: string;
  homeServiceValueTitle3: string;
  homeServiceValueBody3: string;

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
  involvedContactEmail: string;
  involvedContactPhone: string;

  homeLayout?: string;
  aboutLayout?: string;
}

export const DEFAULT_HOME_LAYOUT: PageBlock[] = [
  { id: 'hero', title: 'Hero Banner', bgColor: 'dark', visible: true },
  { id: 'about_us', title: 'About Us & Fellowship', bgColor: 'light', visible: true },
  { id: 'recent_projects', title: 'Recent Completed Projects', bgColor: 'slate', visible: true },
  { id: 'mission', title: 'Sunset Mission Details', bgColor: 'light', visible: true },
  { id: 'announcements', title: 'Latest Announcements', bgColor: 'light', visible: true }
];

export const DEFAULT_ABOUT_LAYOUT: PageBlock[] = [
  { id: 'header', title: 'Introductory Header', bgColor: 'light', visible: true },
  { id: 'vision_mission', title: 'Vision & Mission', bgColor: 'light', visible: true },
  { id: 'four_way_test', title: 'Four-Way Test Accordion', bgColor: 'dark', visible: true },
  { id: 'leadership', title: 'Club Leadership Grid', bgColor: 'light', visible: true }
];

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  homeHeroTitle: "Service Above Self",
  homeHeroSubtitle: "We are a community of dedicated local and international professionals taking action in Freetown to pioneer sustainable clean water access, secondary education, and healthcare.",
  homeHeroBadge: "",
  homeResidentsServed: "",
  homeResourcesShipped: "",
  homeMaternalKits: "",
  homeFinancingAudit: "",
  homeMissionTitle: "Serving Freetown Through Fellowship and Action",
  homeMissionBody1: "The Rotary Club of Freetown Sunset (RCFS) is a community of professionals meeting weekly in Freetown, applying Rotary's core principle of Service Above Self to local needs.",
  homeMissionBody2: "Since 2014, we have carried out projects across water and sanitation, education, maternal and child health, and other areas of local need. Explore our recent projects below, or visit our official Facebook and Instagram pages for our latest work.",
  homeServiceValueTitle1: "Service Above Self",
  homeServiceValueBody1: "We work to identify real community needs and respond with practical, locally-supported solutions.",
  homeServiceValueTitle2: "The 4-Way Test",
  homeServiceValueBody2: "We follow Rotary's ethical Four-Way Test in all of our decisions and activities.",
  homeServiceValueTitle3: "Community Cooperation",
  homeServiceValueBody3: "We aim to work alongside local leaders and community members on the projects we undertake.",

  aboutHeaderBadge: "Our Foundation",
  aboutHeaderTitle: "The Sunset Legacy",
  aboutHeaderDesc: "The Rotary Club of Freetown Sunset brings together professionals in Freetown for fellowship and community service.",
  aboutVisionTitle: "Our Vision",
  aboutVisionBody: "To build a diverse, engaged network of leaders serving the Freetown community and upholding Rotary's standard of ethical service.",
  aboutMissionTitle: "Our Mission",
  aboutMissionBody: "Through weekly fellowship, professional collaboration, and hands-on community service, we work toward Rotary's mission of Service Above Self.",

  involvedBadge: "Take Action Today",
  involvedTitle: "Help Us Empower Freetown Communities",
  involvedSubtitle: "Whether you are a local professional looking to give back or an international partner ready to fund systemic change, there are multiple avenues to work with Freetown Sunset.",
  involvedContactEmail: "placeholder@rcfsunset.org",
  involvedContactPhone: "000000000",

  homeLayout: JSON.stringify(DEFAULT_HOME_LAYOUT),
  aboutLayout: JSON.stringify(DEFAULT_ABOUT_LAYOUT)
};

export const getSiteSettings = async (): Promise<SiteSettings> => {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', 'settings_site_config')
        .single();

      if (error || !data) {
        return getLocalData<SiteSettings>('sb_site_settings', DEFAULT_SITE_SETTINGS);
      }
      
      const parsed = JSON.parse(data.description);
      return { ...DEFAULT_SITE_SETTINGS, ...parsed };
    } catch (err) {
      console.error('Failed to load site settings from Supabase, returning local state:', err);
      return getLocalData<SiteSettings>('sb_site_settings', DEFAULT_SITE_SETTINGS);
    }
  } else {
    return getLocalData<SiteSettings>('sb_site_settings', DEFAULT_SITE_SETTINGS);
  }
};

export const updateSiteSettings = async (settings: SiteSettings): Promise<SiteSettings> => {
  setLocalData('sb_site_settings', settings);
  
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase
        .from('projects')
        .upsert({
          id: 'settings_site_config',
          title: 'Site Settings Configuration Data File',
          category: 'System Config',
          description: JSON.stringify(settings),
          year: 2026,
          impact: 'Applied directly to website text panels',
          status: 'Active',
          imageurl: ''
        });
    } catch (err) {
      console.error('Failed to save settings to live Supabase Postgres:', err);
    }
  }
  return settings;
};

// 1. Projects Operations
export const getSupabaseProjects = async (): Promise<Project[]> => {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('year', { ascending: false });

      if (error) throw error;
      if (data && data.length > 0) {
        // Map database lowercase key "imageurl" back to react interface's camelCase "imageUrl"
        return data
          .filter((d: any) => d.id !== 'settings_site_config')
          .map((d: any) => ({
            ...d,
            imageUrl: d.imageUrl || d.imageurl
          })) as Project[];
      }
      
      // If table exists but has no data, return initially loaded values
      return INITIAL_PROJECTS;
    } catch (err) {
      console.error('Supabase query error (Projects), falling back:', err);
      return INITIAL_PROJECTS;
    }
  } else {
    // Simulated Sandbox Mode
    return getLocalData<Project[]>('sb_supabase_projects', INITIAL_PROJECTS)
      .filter((p) => p.id !== 'settings_site_config');
  }
};

export const saveSupabaseProject = async (project: Project): Promise<Project> => {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase
      .from('projects')
      .upsert({
        id: project.id,
        title: project.title,
        category: project.category,
        description: project.description,
        year: project.year,
        impact: project.impact || '',
        status: project.status,
        imageurl: project.imageUrl || '' // Save into the database's lowercase field 
      });

    if (error) {
      console.error('Failed to upsert to real Supabase database:', error);
      throw error;
    }
    return project;
  } else {
    // Simulated Sandbox Mode
    const list = getLocalData<Project[]>('sb_supabase_projects', INITIAL_PROJECTS);
    const idx = list.findIndex(p => p.id === project.id);
    if (idx > -1) {
      list[idx] = project;
    } else {
      list.push(project);
    }
    setLocalData('sb_supabase_projects', list);
    return project;
  }
};

// 2. Events Operations
export const getSupabaseEvents = async (): Promise<ClubEvent[]> => {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: true });

      if (error) throw error;
      if (data && data.length > 0) {
        return data as ClubEvent[];
      }
      return INITIAL_EVENTS;
    } catch (err) {
      console.error('Supabase query error (Events), falling back:', err);
      return INITIAL_EVENTS;
    }
  } else {
    // Simulated Sandbox Mode
    return getLocalData<ClubEvent[]>('sb_supabase_events', INITIAL_EVENTS);
  }
};

export const saveSupabaseEvent = async (event: ClubEvent): Promise<ClubEvent> => {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase
      .from('events')
      .upsert({
        id: event.id,
        title: event.title,
        date: event.date,
        time: event.time,
        location: event.location,
        speaker: event.speaker || '',
        description: event.description || '',
        type: event.type
      });

    if (error) {
      console.error('Failed to upsert Event to real Supabase database:', error);
      throw error;
    }
    return event;
  } else {
    // Simulated Sandbox Mode
    const list = getLocalData<ClubEvent[]>('sb_supabase_events', INITIAL_EVENTS);
    const idx = list.findIndex(e => e.id === event.id);
    if (idx > -1) {
      list[idx] = event;
    } else {
      list.push(event);
    }
    setLocalData('sb_supabase_events', list);
    return event;
  }
};

// Maps a raw `users` row -- fetched with an embedded `member_contact_info(*)`
// select -- into a UserProfile. PostgREST returns a to-one embed as a single
// object when the FK column is also the child table's primary key (true here:
// member_contact_info.uid is both), but this normalizes defensively in case
// it ever comes back as an array, since that detail isn't worth re-breaking
// login over.
const mapUserRow = (data: any): UserProfile => {
  const rawContact = data.member_contact_info;
  const contactInfo = Array.isArray(rawContact) ? rawContact[0] : rawContact;

  return {
    uid: data.uid,
    name: data.name,
    email: contactInfo?.email || '',
    role: data.role,
    attendanceRate: data.attendanceRate !== undefined ? data.attendanceRate : data.attendancerate,
    contributionGoals: data.contributionGoals !== undefined ? data.contributionGoals : data.contributiongoals,
    contributedAmount: data.contributedAmount !== undefined ? data.contributedAmount : data.contributedamount,
    committee: data.committee,
    tasks: data.tasks || [],
    classification: data.classification || '',
    isPaulHarrisFellow: data.ispaulharrisfellow !== undefined ? data.ispaulharrisfellow : false,
    paulHarrisLevel: data.paulharrislevel || 'None',
    phone: contactInfo?.phone || '',
    joinedDate: data.joineddate || '',
    birthday: contactInfo?.birthday || '',
    avatarUrl: data.avatarurl || '',
    bio: data.bio || '',
    authUserId: data.auth_user_id || undefined,
    rotaryId: data.rotary_id || undefined
  } as UserProfile;
};

// 3. Profiles Operations
export const getSupabaseUser = async (uid: string): Promise<UserProfile | null> => {
  if (isSupabaseConfigured && supabase) {
    try {
      // Single request: embeds member_contact_info via its FK to users,
      // instead of two sequential round trips (was the original design --
      // see git history if the embed ever needs reverting).
      const { data, error } = await supabase
        .from('users')
        .select('*, member_contact_info(*)')
        .eq('uid', uid)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;
      return mapUserRow(data);
    } catch (err) {
      console.error('Supabase query error (UserProfile):', err);
      return null;
    }
  } else {
    // Simulated Sandbox Mode
    const list = getLocalData<UserProfile[]>('sb_supabase_users', INITIAL_MEMBER_DIRECTORY);
    return list.find(u => u.uid === uid) || null;
  }
};

// Looks up a roster profile by the linked Supabase Auth user id (used to
// resolve a login session to a member's roster row). Returns null both when
// no row is linked yet and on any query error -- callers must not treat
// null as "safe to fabricate a placeholder profile", since accounts are
// admin-created/invite-only and every real member already has a roster row.
//
// This is on the hot path for every page load and login (see subscribeToAuth
// in db-router.ts), so it's a single embedded query rather than "look up uid,
// then fetch the full profile" -- was 3 sequential round trips (uid lookup +
// full user row + contact info), now 1.
export const getSupabaseUserByAuthId = async (authUserId: string): Promise<UserProfile | null> => {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*, member_contact_info(*)')
        .eq('auth_user_id', authUserId)
        .maybeSingle();

      if (error || !data) return null;
      return mapUserRow(data);
    } catch (err) {
      console.error('Supabase query error (UserProfile by auth id):', err);
      return null;
    }
  } else {
    const list = getLocalData<UserProfile[]>('sb_supabase_users', INITIAL_MEMBER_DIRECTORY);
    return list.find(u => u.authUserId === authUserId) || null;
  }
};

// Member self-edit: only the fields a member may change about themselves.
// The DB trigger protect_admin_only_user_fields() is the real enforcement
// boundary (it silently reverts anything else even if sent), but scoping
// the client-side call to just these fields keeps intent honest and avoids
// a request that looks like it changed data it silently didn't.
export const updateSupabaseOwnProfile = async (
  uid: string,
  fields: { name?: string; bio?: string; avatarUrl?: string }
): Promise<void> => {
  if (isSupabaseConfigured && supabase) {
    const payload: Record<string, any> = {};
    if (fields.name !== undefined) payload.name = fields.name;
    if (fields.bio !== undefined) payload.bio = fields.bio;
    if (fields.avatarUrl !== undefined) payload.avatarurl = fields.avatarUrl;

    const { error } = await supabase.from('users').update(payload).eq('uid', uid);
    if (error) throw error;
  } else {
    const list = getLocalData<UserProfile[]>('sb_supabase_users', INITIAL_MEMBER_DIRECTORY);
    const idx = list.findIndex(u => u.uid === uid);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...fields };
      setLocalData('sb_supabase_users', list);
    }
  }
};

// Member self-edit for contact info (email/phone/birthday), gated by the
// self-select/self-insert/self-update RLS policies on member_contact_info.
export const updateSupabaseOwnContactInfo = async (
  uid: string,
  fields: { email?: string; phone?: string; birthday?: string }
): Promise<void> => {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase
      .from('member_contact_info')
      .upsert({ uid, ...fields });
    if (error) throw error;
  } else {
    const list = getLocalData<UserProfile[]>('sb_supabase_users', INITIAL_MEMBER_DIRECTORY);
    const idx = list.findIndex(u => u.uid === uid);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...fields };
      setLocalData('sb_supabase_users', list);
    }
  }
};

export const upsertSupabaseUser = async (profile: UserProfile): Promise<UserProfile> => {
  if (isSupabaseConfigured && supabase) {
    try {
      // 1. Upsert public fields to users table (without email, phone, birthday)
      const { error: userError } = await supabase
        .from('users')
        .upsert({
          uid: profile.uid,
          name: profile.name,
          role: profile.role,
          attendancerate: profile.attendanceRate !== undefined ? profile.attendanceRate : 92,
          contributiongoals: profile.contributionGoals !== undefined ? profile.contributionGoals : 500,
          contributedamount: profile.contributedAmount !== undefined ? profile.contributedAmount : 150,
          committee: profile.committee || 'General Fellowship',
          tasks: profile.tasks || [],
          classification: profile.classification || '',
          ispaulharrisfellow: !!profile.isPaulHarrisFellow,
          paulharrislevel: profile.paulHarrisLevel || 'None',
          joineddate: profile.joinedDate || '',
          avatarurl: profile.avatarUrl || ''
        });

      if (userError) throw userError;

      // 2. Upsert sensitive fields to member_contact_info table (if values are present)
      if (profile.email || profile.phone || profile.birthday) {
        const { error: contactError } = await supabase
          .from('member_contact_info')
          .upsert({
            uid: profile.uid,
            email: profile.email || '',
            phone: profile.phone || '',
            birthday: profile.birthday || ''
          });
        if (contactError) {
          console.warn('Could not save member contact info (this is normal if non-admin or no contact permission):', contactError.message);
        }
      }
      return profile;
    } catch (err: any) {
      console.error('Failed to upsert User to real Supabase database:', err);
      throw err;
    }
  } else {
    // Simulated Sandbox Mode
    const list = getLocalData<UserProfile[]>('sb_supabase_users', INITIAL_MEMBER_DIRECTORY);
    const idx = list.findIndex(u => u.uid === profile.uid);
    if (idx > -1) {
      list[idx] = profile;
    } else {
      list.push(profile);
    }
    setLocalData('sb_supabase_users', list);
    return profile;
  }
};

// 4. Contact Inquiries
export const submitSupabaseInquiry = async (inquiry: ContactInquiry): Promise<ContactInquiry> => {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase
      .from('inquiries')
      .insert({
        id: inquiry.id,
        name: inquiry.name,
        email: inquiry.email,
        subject: inquiry.subject || '',
        message: inquiry.message,
        type: inquiry.type,
        created_at: inquiry.createdAt || new Date().toISOString()
      });

    if (error) {
      console.error('Failed to insert Inquiry to real Supabase database:', error);
      throw error;
    }
    return inquiry;
  } else {
    // Simulated Sandbox Mode
    const list = getLocalData<ContactInquiry[]>('sb_supabase_inquiries', []);
    list.push(inquiry);
    setLocalData('sb_supabase_inquiries', list);
    return inquiry;
  }
};

// 4.1 Delete Project
export const deleteSupabaseProject = async (id: string): Promise<boolean> => {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);
    if (error) {
      console.error('Failed to delete Project in live Supabase database:', error);
      throw error;
    }
    return true;
  } else {
    const list = getLocalData<Project[]>('sb_supabase_projects', INITIAL_PROJECTS);
    const updated = list.filter(p => p.id !== id);
    setLocalData('sb_supabase_projects', updated);
    return true;
  }
};

// 4.2 Delete Event
export const deleteSupabaseEvent = async (id: string): Promise<boolean> => {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id);
    if (error) {
      console.error('Failed to delete Event in live Supabase database:', error);
      throw error;
    }
    return true;
  } else {
    const list = getLocalData<ClubEvent[]>('sb_supabase_events', INITIAL_EVENTS);
    const updated = list.filter(e => e.id !== id);
    setLocalData('sb_supabase_events', updated);
    return true;
  }
};

// 4.3 Get All Users / Members
export const getSupabaseUsers = async (): Promise<UserProfile[]> => {
  let list: UserProfile[] = [];
  if (isSupabaseConfigured && supabase) {
    try {
      // Single request: embeds member_contact_info via its FK to users,
      // instead of fetching both tables separately and merging in JS.
      const { data: usersData, error: userError } = await supabase
        .from('users')
        .select('*, member_contact_info(*)')
        .order('name', { ascending: true });

      if (userError) throw userError;
      if (usersData) {
        list = usersData.map(mapUserRow);
      }
    } catch (err) {
      console.error('Supabase query error (all Users):', err);
      list = [];
    }
  } else {
    list = getLocalData<UserProfile[]>('sb_supabase_users', INITIAL_MEMBER_DIRECTORY);
  }

  // Merge the latest hardcoded core roster information into the returned list.
  // This guarantees that any updates made to names, roles, titles, or avatar URLs in FULL_MEMBER_LIST
  // are immediately active and correct in the user's interface, bypassing any stale database or localStorage data.
  const syncedList = list.map(item => {
    const coreMatch = INITIAL_MEMBER_DIRECTORY.find(core => core.uid === item.uid);
    if (coreMatch) {
      return {
        ...item,
        name: coreMatch.name,
        role: coreMatch.role,
        title: coreMatch.title || item.title || '',
        committee: coreMatch.committee,
        avatarUrl: coreMatch.avatarUrl || item.avatarUrl || '',
        classification: coreMatch.classification || item.classification || '',
        isPaulHarrisFellow: coreMatch.isPaulHarrisFellow !== undefined ? coreMatch.isPaulHarrisFellow : item.isPaulHarrisFellow,
        paulHarrisLevel: coreMatch.paulHarrisLevel || item.paulHarrisLevel || 'None',
        tasks: coreMatch.tasks && coreMatch.tasks.length > 0 ? coreMatch.tasks : item.tasks
      } as UserProfile;
    }
    return item;
  });

  // Save the synchronized list back to local storage if not using live Supabase
  if (!isSupabaseConfigured || !supabase) {
    setLocalData('sb_supabase_users', syncedList);
  }

  return syncedList;
};

// 4.4 Delete User / Member
export const deleteSupabaseUser = async (uid: string): Promise<boolean> => {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('uid', uid);
    if (error) {
      console.error('Failed to delete User in live Supabase database:', error);
      throw error;
    }
    return true;
  } else {
    const list = getLocalData<UserProfile[]>('sb_supabase_users', INITIAL_MEMBER_DIRECTORY);
    const updated = list.filter(u => u.uid !== uid);
    setLocalData('sb_supabase_users', updated);
    return true;
  }
};

// 4.5 Get All Contact Inquiries
export const getSupabaseInquiries = async (): Promise<ContactInquiry[]> => {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('inquiries')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) {
        return data.map((d: any) => ({
          id: d.id,
          name: d.name,
          email: d.email,
          subject: d.subject,
          message: d.message,
          type: d.type,
          createdAt: d.created_at || d.createdAt
        })) as ContactInquiry[];
      }
      return [];
    } catch (err) {
      console.error('Supabase query error (all Inquiries):', err);
      return [];
    }
  } else {
    return getLocalData<ContactInquiry[]>('sb_supabase_inquiries', []);
  }
};

// 4.6 Delete Contact Inquiry
export const deleteSupabaseInquiry = async (id: string): Promise<boolean> => {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase
      .from('inquiries')
      .delete()
      .eq('id', id);
    if (error) {
      console.error('Failed to delete inquiry in live Supabase database:', error);
      throw error;
    }
    return true;
  } else {
    const list = getLocalData<ContactInquiry[]>('sb_supabase_inquiries', []);
    const updated = list.filter(i => i.id !== id);
    setLocalData('sb_supabase_inquiries', updated);
    return true;
  }
};

// 4.7 RSVPs Operations
export const getSupabaseRSVPs = async (): Promise<EventRSVP[]> => {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('event_rsvps')
        .select('*')
        .order('submitted_at', { ascending: false });
      if (error) throw error;
      return (data || []).map((d: any) => ({
        id: d.id,
        event_id: d.event_id,
        name: d.name,
        email: d.email,
        submitted_at: d.submitted_at || new Date().toISOString()
      }));
    } catch (err) {
      console.error('Supabase query error (all RSVPs):', err);
      return [];
    }
  } else {
    return getLocalData<EventRSVP[]>('sb_supabase_event_rsvps', []);
  }
};

export const submitSupabaseRSVP = async (rsvp: EventRSVP): Promise<EventRSVP> => {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase
      .from('event_rsvps')
      .insert({
        id: rsvp.id,
        event_id: rsvp.event_id,
        name: rsvp.name,
        email: rsvp.email,
        submitted_at: rsvp.submitted_at || new Date().toISOString()
      });
    if (error) {
      console.error('Failed to insert RSVP to real Supabase database:', error);
      throw error;
    }
    return rsvp;
  } else {
    const list = getLocalData<EventRSVP[]>('sb_supabase_event_rsvps', []);
    list.push(rsvp);
    setLocalData('sb_supabase_event_rsvps', list);
    return rsvp;
  }
};

// 4.8 Project Applications Operations
export const getSupabaseApplications = async (): Promise<ProjectApplication[]> => {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('project_applications')
        .select('*')
        .order('submitted_at', { ascending: false });
      if (error) throw error;
      return (data || []).map((d: any) => ({
        id: d.id,
        project_id: d.project_id,
        name: d.name,
        email: d.email,
        statement: d.statement,
        submitted_at: d.submitted_at || new Date().toISOString()
      }));
    } catch (err) {
      console.error('Supabase query error (all Applications):', err);
      return [];
    }
  } else {
    return getLocalData<ProjectApplication[]>('sb_supabase_project_applications', []);
  }
};

export const submitSupabaseApplication = async (app: ProjectApplication): Promise<ProjectApplication> => {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase
      .from('project_applications')
      .insert({
        id: app.id,
        project_id: app.project_id,
        name: app.name,
        email: app.email,
        statement: app.statement,
        submitted_at: app.submitted_at || new Date().toISOString()
      });
    if (error) {
      console.error('Failed to insert Project Application to real Supabase database:', error);
      throw error;
    }
    return app;
  } else {
    const list = getLocalData<ProjectApplication[]>('sb_supabase_project_applications', []);
    list.push(app);
    setLocalData('sb_supabase_project_applications', list);
    return app;
  }
};

export const checkIsAdmin = async (userId: string): Promise<boolean> => {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('admins')
        .select('user_id')
        .eq('user_id', userId)
        .maybeSingle();
      if (error) {
        console.error('Error querying admins table:', error);
        return false;
      }
      return !!data;
    } catch (err) {
      console.error('Error checking admin status:', err);
      return false;
    }
  }
  return false;
};

// -------------------------------------------------------------
// SUBMISSIONS (member project/photo submissions awaiting approval)
// -------------------------------------------------------------

const mapSubmissionRow = (d: any): Submission => ({
  id: d.id,
  submitterId: d.submitter_id,
  kind: d.kind,
  title: d.title,
  description: d.description || '',
  category: d.category || '',
  year: d.year ?? undefined,
  imageUrl: d.image_url || '',
  status: d.status,
  rejectReason: d.reject_reason || undefined,
  reviewedBy: d.reviewed_by || undefined,
  reviewedAt: d.reviewed_at || undefined,
  publishedId: d.published_id || undefined,
  createdAt: d.created_at
});

// Admin: every submission, newest first.
export const getSupabaseSubmissions = async (): Promise<Submission[]> => {
  if (!isSupabaseConfigured || !supabase) return [];
  const { data, error } = await supabase
    .from('submissions')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) {
    console.error('Supabase query error (submissions):', error);
    return [];
  }
  return (data || []).map(mapSubmissionRow);
};

// Member: only their own submissions, newest first.
export const getMySupabaseSubmissions = async (authUserId: string): Promise<Submission[]> => {
  if (!isSupabaseConfigured || !supabase) return [];
  const { data, error } = await supabase
    .from('submissions')
    .select('*')
    .eq('submitter_id', authUserId)
    .order('created_at', { ascending: false });
  if (error) {
    console.error('Supabase query error (my submissions):', error);
    return [];
  }
  return (data || []).map(mapSubmissionRow);
};

export const submitSupabaseSubmission = async (input: {
  submitterId: string;
  kind: 'project' | 'photo';
  title: string;
  description?: string;
  category?: string;
  year?: number;
  imageUrl?: string;
}): Promise<Submission> => {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Submissions require a configured Supabase project.');
  }
  const { data, error } = await supabase
    .from('submissions')
    .insert({
      submitter_id: input.submitterId,
      kind: input.kind,
      title: input.title,
      description: input.description || null,
      category: input.category || null,
      year: input.year ?? null,
      image_url: input.imageUrl || null,
      status: 'pending'
    })
    .select('*')
    .single();
  if (error) throw error;
  return mapSubmissionRow(data);
};

// Admin approve/reject. Approving copies the submission's content into the
// live public tables (`projects` for kind='project', `gallery_photos` for
// kind='photo') and stamps published_id; rejecting just records the reason.
// reviewerId is the admin's own auth id (for reviewed_by).
export const reviewSupabaseSubmission = async (
  submissionId: string,
  decision: 'approved' | 'rejected',
  reviewerId: string,
  rejectReason?: string
): Promise<void> => {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Submissions require a configured Supabase project.');
  }

  const { data: submission, error: fetchErr } = await supabase
    .from('submissions')
    .select('*')
    .eq('id', submissionId)
    .single();
  if (fetchErr || !submission) throw fetchErr || new Error('Submission not found');

  let publishedId: string | null = null;

  if (decision === 'approved') {
    if (submission.kind === 'project') {
      publishedId = 'proj_sub_' + submissionId;
      const { error: pubErr } = await supabase.from('projects').insert({
        id: publishedId,
        title: submission.title,
        category: submission.category || 'Community Economic Development',
        description: submission.description || '',
        year: submission.year || new Date().getFullYear(),
        status: 'Completed',
        imageUrl: submission.image_url || null
      });
      if (pubErr) throw pubErr;
    } else {
      const { data: photoRow, error: pubErr } = await supabase
        .from('gallery_photos')
        .insert({
          title: submission.title,
          description: submission.description || null,
          category: (submission.category as string) || 'outreach',
          image_url: submission.image_url,
          submission_id: submissionId
        })
        .select('id')
        .single();
      if (pubErr) throw pubErr;
      publishedId = photoRow.id;
    }
  }

  const { error: updateErr } = await supabase
    .from('submissions')
    .update({
      status: decision,
      reject_reason: decision === 'rejected' ? (rejectReason || null) : null,
      reviewed_by: reviewerId,
      reviewed_at: new Date().toISOString(),
      published_id: publishedId
    })
    .eq('id', submissionId);
  if (updateErr) throw updateErr;
};

// -------------------------------------------------------------
// CLUB GALLERY PHOTOS
// -------------------------------------------------------------

export const getSupabaseGalleryPhotos = async (): Promise<GalleryPhoto[]> => {
  if (!isSupabaseConfigured || !supabase) return [];
  const { data, error } = await supabase
    .from('gallery_photos')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) {
    console.error('Supabase query error (gallery_photos):', error);
    return [];
  }
  return (data || []).map((d: any) => ({
    id: d.id,
    title: d.title,
    description: d.description || '',
    category: d.category,
    imageUrl: d.image_url,
    takenDate: d.taken_date || '',
    location: d.location || ''
  }));
};

// -------------------------------------------------------------
// ADMIN MANAGEMENT (promote/demote; account create/revoke via Edge Function)
// -------------------------------------------------------------

// Set of auth user ids currently holding admin privileges. Only readable by
// an admin (the `admins` table has no public/self-select policy), so this
// naturally returns an empty set for a non-admin caller rather than erroring.
export const getSupabaseAdminUserIds = async (): Promise<string[]> => {
  if (!isSupabaseConfigured || !supabase) return [];
  const { data, error } = await supabase.from('admins').select('user_id');
  if (error) {
    console.error('Supabase query error (admins):', error);
    return [];
  }
  return (data || []).map((d: any) => d.user_id);
};

export const promoteSupabaseAdmin = async (authUserId: string): Promise<void> => {
  if (!isSupabaseConfigured || !supabase) throw new Error('Requires a configured Supabase project.');
  const { error } = await supabase.from('admins').insert({ user_id: authUserId });
  if (error) throw error;
};

export const demoteSupabaseAdmin = async (authUserId: string): Promise<void> => {
  if (!isSupabaseConfigured || !supabase) throw new Error('Requires a configured Supabase project.');
  const { error } = await supabase.from('admins').delete().eq('user_id', authUserId);
  if (error) throw error;
};

// All three call the member-accounts Edge Function, which alone holds the
// service_role key needed to create/reset/delete another user's auth
// account. See supabase/functions/member-accounts/index.ts.
export const createLoginSupabaseMember = async (uid: string, pin: string): Promise<string> => {
  if (!isSupabaseConfigured || !supabase) throw new Error('Requires a configured Supabase project.');
  const { data, error } = await supabase.functions.invoke('member-accounts', {
    body: { action: 'create_login', uid, pin }
  });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return data.rotaryId as string;
};

export const resetSupabasePin = async (uid: string, pin: string): Promise<void> => {
  if (!isSupabaseConfigured || !supabase) throw new Error('Requires a configured Supabase project.');
  const { data, error } = await supabase.functions.invoke('member-accounts', {
    body: { action: 'reset_pin', uid, pin }
  });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
};

export const revokeSupabaseMemberAccount = async (uid: string): Promise<void> => {
  if (!isSupabaseConfigured || !supabase) throw new Error('Requires a configured Supabase project.');
  const { data, error } = await supabase.functions.invoke('member-accounts', {
    body: { action: 'revoke', uid }
  });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
};

// Self-service account deletion: unlike revokeSupabaseMemberAccount above,
// this takes no uid -- the Edge Function derives the caller's own roster
// row from their verified auth session, so it can never be pointed at
// someone else's account.
export const deleteOwnSupabaseAccount = async (): Promise<void> => {
  if (!isSupabaseConfigured || !supabase) throw new Error('Requires a configured Supabase project.');
  const { data, error } = await supabase.functions.invoke('member-accounts', {
    body: { action: 'self_delete' }
  });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
};

// Calls the public/unauthenticated member-login Edge Function (Rotary ID +
// PIN, with per-Rotary-ID lockout enforced server-side -- see
// supabase/functions/member-login/index.ts) and adopts the returned session
// locally. Throws with the function's user-facing error message on failure
// (invalid credentials, lockout, etc.) so the caller can show it directly.
//
// Wrapped in a hard timeout: setSession() reaching out to Supabase Auth
// can, in rare cases, neither resolve nor reject (observed in practice
// with a stale/corrupted stored session) -- without a timeout, the
// caller's own loading state would then hang forever with no error
// shown, rather than surfacing a message the member can act on.
const LOGIN_TIMEOUT_MS = 15000;

export const loginWithRotaryIdAndPin = async (rotaryId: string, pin: string): Promise<UserProfile> => {
  if (!isSupabaseConfigured || !supabase) throw new Error('Requires a configured Supabase project.');

  const doLogin = async (): Promise<UserProfile> => {
    const { data, error } = await supabase.functions.invoke('member-login', {
      body: { rotaryId, pin }
    });
    if (error) throw error;
    if (data?.error) throw new Error(data.error);

    // setSession() already returns the signed-in user in its own response,
    // so a follow-up getUser() call would just be an extra, redundant
    // round trip to ask Supabase for the same thing again.
    const { data: sessionData, error: sessionErr } = await supabase.auth.setSession({
      access_token: data.access_token,
      refresh_token: data.refresh_token
    });
    if (sessionErr) throw sessionErr;
    if (!sessionData?.user) throw new Error('Login failed.');

    const profile = await getSupabaseUserByAuthId(sessionData.user.id);
    if (!profile) throw new Error('Your account is not yet linked to a member profile. Please contact a club officer.');
    return profile;
  };

  const timeout = new Promise<UserProfile>((_, reject) => {
    setTimeout(() => reject(new Error('Login timed out. Please try again.')), LOGIN_TIMEOUT_MS);
  });

  return Promise.race([doLogin(), timeout]);
};

// 4.8 Newsletter Subscription
export const submitSupabaseNewsletterSignup = async (email: string): Promise<NewsletterSubscriber> => {
  const subscriber: NewsletterSubscriber = {
    id: 'news_' + Math.random().toString(36).substr(2, 9),
    email,
    createdAt: new Date().toISOString()
  };

  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase
      .from('newsletter_subscribers')
      .insert({
        id: subscriber.id,
        email: subscriber.email,
        created_at: subscriber.createdAt
      });

    if (error) {
      console.error('Failed to insert newsletter subscriber to real Supabase database:', error);
      throw error;
    }
    return subscriber;
  } else {
    // Simulated Sandbox Mode
    const list = getLocalData<NewsletterSubscriber[]>('sb_supabase_newsletter_subscribers', []);
    list.push(subscriber);
    setLocalData('sb_supabase_newsletter_subscribers', list);
    return subscriber;
  }
};

// -------------------------------------------------------------
// GROUP CHAT — single shared real-time room for all logged-in members
// -------------------------------------------------------------

export const getSupabaseChatMessages = async (limitCount = 200): Promise<ChatMessage[]> => {
  if (!isSupabaseConfigured || !supabase) return [];
  const { data, error } = await supabase
    .from('chat_messages')
    .select('id, sender_id, sender_name, content, created_at, chat_message_reactions(id, emoji, user_id)')
    .order('created_at', { ascending: true })
    .limit(limitCount);
  if (error) {
    console.error('Supabase query error (chat_messages):', error);
    return [];
  }
  return (data || []).map((d: any) => ({
    id: d.id,
    senderId: d.sender_id,
    senderName: d.sender_name,
    content: d.content,
    createdAt: d.created_at,
    reactions: (d.chat_message_reactions || []).map((r: any) => ({ id: r.id, emoji: r.emoji, userId: r.user_id }))
  }));
};

export const sendSupabaseChatMessage = async (senderId: string, senderName: string, content: string): Promise<void> => {
  if (!isSupabaseConfigured || !supabase) throw new Error('Requires a configured Supabase project.');
  const trimmed = content.trim();
  if (!trimmed) throw new Error('Message cannot be empty.');
  const { error } = await supabase.from('chat_messages').insert({ sender_id: senderId, sender_name: senderName, content: trimmed });
  if (error) throw error;
};

export const deleteSupabaseChatMessage = async (messageId: string): Promise<void> => {
  if (!isSupabaseConfigured || !supabase) throw new Error('Requires a configured Supabase project.');
  const { error } = await supabase.from('chat_messages').delete().eq('id', messageId);
  if (error) throw error;
};

// Reactions toggle server-side: insert, and if that member already reacted
// with this exact emoji (unique violation), remove it instead. Server is
// the source of truth rather than trusting local UI state.
export const toggleSupabaseChatReaction = async (messageId: string, userId: string, emoji: string): Promise<'added' | 'removed'> => {
  if (!isSupabaseConfigured || !supabase) throw new Error('Requires a configured Supabase project.');
  const { error: insertErr } = await supabase.from('chat_message_reactions').insert({ message_id: messageId, user_id: userId, emoji });
  if (!insertErr) return 'added';
  if (insertErr.code === '23505') {
    const { error: deleteErr } = await supabase.from('chat_message_reactions').delete().match({ message_id: messageId, user_id: userId, emoji });
    if (deleteErr) throw deleteErr;
    return 'removed';
  }
  throw insertErr;
};

// Raw Realtime passthrough -- callers merge these into their own local
// state. DELETE payloads carry only the columns covered by each table's
// replica identity (see schema.sql): chat_messages needs just `id` for
// delete (default identity), but chat_message_reactions is set to REPLICA
// IDENTITY FULL so its delete payload also includes message_id/user_id/emoji.
export const subscribeToChatRealtime = (handlers: {
  onMessageInsert: (row: { id: string; sender_id: string; sender_name: string; content: string; created_at: string }) => void;
  onMessageDelete: (id: string) => void;
  onReactionInsert: (row: { id: string; message_id: string; user_id: string; emoji: string }) => void;
  onReactionDelete: (row: { id: string; message_id: string; user_id: string; emoji: string }) => void;
}): (() => void) => {
  if (!isSupabaseConfigured || !supabase) return () => {};
  const client = supabase;
  const channel = client
    .channel('chat_realtime')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages' }, (payload) => {
      handlers.onMessageInsert(payload.new as any);
    })
    .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'chat_messages' }, (payload) => {
      handlers.onMessageDelete((payload.old as any).id);
    })
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_message_reactions' }, (payload) => {
      handlers.onReactionInsert(payload.new as any);
    })
    .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'chat_message_reactions' }, (payload) => {
      handlers.onReactionDelete(payload.old as any);
    })
    .subscribe();
  return () => { client.removeChannel(channel); };
};

// -------------------------------------------------------------
// MEMBER TIMELINE — instant-publish feed (no approval queue), with comments
// -------------------------------------------------------------

export const getSupabaseTimelinePosts = async (limitCount = 100): Promise<TimelinePost[]> => {
  if (!isSupabaseConfigured || !supabase) return [];
  const { data, error } = await supabase
    .from('timeline_posts')
    .select('id, author_id, author_name, author_avatar_url, content, image_url, created_at, timeline_comments(id, post_id, author_id, author_name, content, created_at)')
    .order('created_at', { ascending: false })
    .limit(limitCount);
  if (error) {
    console.error('Supabase query error (timeline_posts):', error);
    return [];
  }
  return (data || []).map((d: any) => ({
    id: d.id,
    authorId: d.author_id,
    authorName: d.author_name,
    authorAvatarUrl: d.author_avatar_url || undefined,
    content: d.content || undefined,
    imageUrl: d.image_url || undefined,
    createdAt: d.created_at,
    comments: (d.timeline_comments || [])
      .map((c: any) => ({
        id: c.id,
        postId: c.post_id,
        authorId: c.author_id,
        authorName: c.author_name,
        content: c.content,
        createdAt: c.created_at
      }))
      .sort((a: TimelineComment, b: TimelineComment) => a.createdAt.localeCompare(b.createdAt))
  }));
};

export const createSupabaseTimelinePost = async (input: {
  authorId: string;
  authorName: string;
  authorAvatarUrl?: string;
  content?: string;
  imageUrl?: string;
}): Promise<void> => {
  if (!isSupabaseConfigured || !supabase) throw new Error('Requires a configured Supabase project.');
  const trimmedContent = (input.content || '').trim();
  if (!trimmedContent && !input.imageUrl) throw new Error('Add some text or a photo to post.');
  const { error } = await supabase.from('timeline_posts').insert({
    author_id: input.authorId,
    author_name: input.authorName,
    author_avatar_url: input.authorAvatarUrl || null,
    content: trimmedContent || null,
    image_url: input.imageUrl || null
  });
  if (error) throw error;
};

export const deleteSupabaseTimelinePost = async (postId: string): Promise<void> => {
  if (!isSupabaseConfigured || !supabase) throw new Error('Requires a configured Supabase project.');
  const { error } = await supabase.from('timeline_posts').delete().eq('id', postId);
  if (error) throw error;
};

export const addSupabaseTimelineComment = async (postId: string, authorId: string, authorName: string, content: string): Promise<void> => {
  if (!isSupabaseConfigured || !supabase) throw new Error('Requires a configured Supabase project.');
  const trimmed = content.trim();
  if (!trimmed) throw new Error('Comment cannot be empty.');
  const { error } = await supabase.from('timeline_comments').insert({ post_id: postId, author_id: authorId, author_name: authorName, content: trimmed });
  if (error) throw error;
};

export const deleteSupabaseTimelineComment = async (commentId: string): Promise<void> => {
  if (!isSupabaseConfigured || !supabase) throw new Error('Requires a configured Supabase project.');
  const { error } = await supabase.from('timeline_comments').delete().eq('id', commentId);
  if (error) throw error;
};

export const subscribeToTimelineRealtime = (handlers: {
  onPostInsert: (row: { id: string; author_id: string; author_name: string; author_avatar_url: string | null; content: string | null; image_url: string | null; created_at: string }) => void;
  onPostDelete: (id: string) => void;
  onCommentInsert: (row: { id: string; post_id: string; author_id: string; author_name: string; content: string; created_at: string }) => void;
  onCommentDelete: (row: { id: string; post_id: string }) => void;
}): (() => void) => {
  if (!isSupabaseConfigured || !supabase) return () => {};
  const client = supabase;
  const channel = client
    .channel('timeline_realtime')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'timeline_posts' }, (payload) => {
      handlers.onPostInsert(payload.new as any);
    })
    .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'timeline_posts' }, (payload) => {
      handlers.onPostDelete((payload.old as any).id);
    })
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'timeline_comments' }, (payload) => {
      handlers.onCommentInsert(payload.new as any);
    })
    .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'timeline_comments' }, (payload) => {
      handlers.onCommentDelete(payload.old as any);
    })
    .subscribe();
  return () => { client.removeChannel(channel); };
};

