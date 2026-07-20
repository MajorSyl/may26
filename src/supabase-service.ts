import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Project, ClubEvent, UserProfile, ContactInquiry, EventRSVP, ProjectApplication, NewsletterSubscriber, Submission, GalleryPhoto, ChatMessage, TimelinePost, TimelineComment } from './types';
import { INITIAL_PROJECTS, INITIAL_EVENTS, INITIAL_MEMBER_DIRECTORY } from './data';
import { safeStorage } from './lib/safe-storage';

// Read configuration from Vite environment
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL;
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey && supabaseUrl !== 'undefined' && supabaseAnonKey !== 'undefined');

// Real Supabase Client Instance (if variables exist)
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!)
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
  involvedContactEmail: "freetownsunset@gmail.com",
  involvedContactPhone: "+232 76 987654",

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

// 3. Profiles Operations
export const getSupabaseUser = async (uid: string): Promise<UserProfile | null> => {
  if (isSupabaseConfigured && supabase) {
    try {
      // Direct query on users (now safe and public with no sensitive columns)
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('uid', uid)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      // Try to query member_contact_info for sensitive fields (only returns data if authorized / admin)
      let contactInfo: any = null;
      try {
        const { data: contactData } = await supabase
          .from('member_contact_info')
          .select('*')
          .eq('uid', uid)
          .maybeSingle();
        contactInfo = contactData;
      } catch (cErr) {
        console.warn('Could not read member contact info (non-admin access or table missing):', cErr);
      }
      
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
export const getSupabaseUserByAuthId = async (authUserId: string): Promise<UserProfile | null> => {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('uid')
        .eq('auth_user_id', authUserId)
        .maybeSingle();

      if (error || !data) return null;
      return getSupabaseUser(data.uid);
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
      // Query users table (now public with no sensitive columns)
      const { data: usersData, error: userError } = await supabase
        .from('users')
        .select('*')
        .order('name', { ascending: true });

      if (userError) throw userError;

      if (usersData) {
        // Try to query member_contact_info (only returns rows if role is authorized / admin)
        let contactsMap = new Map<string, any>();
        try {
          const { data: contactsData } = await supabase
            .from('member_contact_info')
            .select('*');
          if (contactsData) {
            contactsData.forEach((c: any) => {
              contactsMap.set(c.uid, c);
            });
          }
        } catch (cErr) {
          console.warn('Could not read member_contact_info (this is expected for non-admins):', cErr);
        }

        list = usersData.map((d: any) => {
          const contact = contactsMap.get(d.uid);
          return {
            uid: d.uid,
            name: d.name,
            email: contact?.email || '',
            role: d.role,
            attendanceRate: d.attendanceRate !== undefined ? d.attendanceRate : (d.attendancerate ?? undefined),
            contributionGoals: d.contributionGoals !== undefined ? d.contributionGoals : (d.contributiongoals ?? undefined),
            contributedAmount: d.contributedAmount !== undefined ? d.contributedAmount : (d.contributedamount ?? undefined),
            committee: d.committee,
            tasks: d.tasks || [],
            classification: d.classification || '',
            isPaulHarrisFellow: d.isPaulHarrisFellow !== undefined ? d.isPaulHarrisFellow : (d.ispaulharrisfellow !== undefined ? d.ispaulharrisfellow : false),
            paulHarrisLevel: d.paulHarrisLevel !== undefined ? d.paulHarrisLevel : (d.paulharrislevel || 'None'),
            phone: contact?.phone || '',
            joinedDate: d.joinedDate !== undefined ? d.joinedDate : (d.joineddate || ''),
            birthday: contact?.birthday || '',
            avatarUrl: d.avatarUrl !== undefined ? d.avatarUrl : (d.avatarurl || ''),
            bio: d.bio || '',
            authUserId: d.auth_user_id || undefined,
            rotaryId: d.rotary_id || undefined
          };
        }) as UserProfile[];
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

// 5. Seed Database Script
export const seedSupabaseTables = async (): Promise<{ success: boolean; message: string; seededCount: number }> => {
  if (!isSupabaseConfigured || !supabase) {
    return { success: false, message: 'Supabase URL/Anon key are missing.', seededCount: 0 };
  }

  let count = 0;
  try {
    // Seed projects
    for (const p of INITIAL_PROJECTS) {
      const { error } = await supabase
        .from('projects')
        .upsert({
          id: p.id,
          title: p.title,
          category: p.category,
          description: p.description,
          year: p.year,
          impact: p.impact || '',
          status: p.status,
          imageurl: p.imageUrl || '' // Use lowercase field name to match PG
        });
      if (error) throw error;
      count++;
    }

    // Seed events
    for (const ev of INITIAL_EVENTS) {
      const { error } = await supabase
        .from('events')
        .upsert({
          id: ev.id,
          title: ev.title,
          date: ev.date,
          time: ev.time,
          location: ev.location,
          speaker: ev.speaker || null, // Ensure is always present (even as null) to satisfy PostgREST batch constraints
          description: ev.description || '',
          type: ev.type
        });
      if (error) throw error;
      count++;
    }

    return { 
      success: true, 
      message: 'Successfully seeded default Rotary Sunset projects and events into your live Supabase database!',
      seededCount: count 
    };
  } catch (err: any) {
    console.error('Error seeding Supabase data:', err);
    return { 
      success: false, 
      message: `Failed during seed: ${err.message || String(err)}. Make sure tables exist in your Supabase schema!`, 
      seededCount: count 
    };
  }
};

// 6. SQL Schema Script code Block (for presentation inside instructions)
export const GET_SUPABASE_SQL_SCHEMA = () => `
-- Copy and run this script in your Supabase SQL Editor:
-- (kept in sync with supabase/schema.sql — see that file for full comments)

-- 1. Create Admins Table
CREATE TABLE IF NOT EXISTS admins (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE
);

-- 2. Create is_admin() helper function
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admins WHERE user_id = auth.uid()
  );
END;
$$;

-- 2.1 Create is_linked_member() helper function -- true only for a Supabase
-- Auth session linked to an actual roster row. Used by chat/timeline
-- policies as a second layer on top of the 'authenticated' role check,
-- since Supabase Auth's public signup toggle (a project-level setting this
-- app's code can't enforce) could otherwise let a non-member "authenticated"
-- session read/post there.
CREATE OR REPLACE FUNCTION is_linked_member()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users WHERE auth_user_id = auth.uid()
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION is_linked_member() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION is_linked_member() TO authenticated;

-- 3. Create Projects Table
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  year INTEGER NOT NULL,
  impact TEXT,
  status TEXT NOT NULL CHECK (status IN ('Completed', 'Active', 'Planning')),
  imageUrl TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, now()) NOT NULL
);

-- 4. Create Events Table
CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  location TEXT NOT NULL,
  speaker TEXT,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('Weekly Meeting', 'Service Project', 'Social', 'Fundraiser')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, now()) NOT NULL
);

-- 5. Create Users Table (public roster; auth_user_id links a row to a
-- Supabase Auth account so that member can self-edit name/bio/avatarurl).
-- rotary_id is the member-facing login identifier (e.g. RCFS-001),
-- auto-assigned by the assign_rotary_id trigger below -- never set it
-- manually. The PIN itself is never stored here; it *is* the Supabase Auth
-- password on auth_user_id, so Supabase's own bcrypt hashing covers it.
-- failed_pin_attempts / pin_locked_until back the per-Rotary-ID login
-- lockout (see the REVOKE SELECT below that keeps these unreadable by
-- anyone but the service role).
CREATE TABLE IF NOT EXISTS users (
  uid TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('Rotarian', 'Club Officer', 'Guest', 'President')),
  attendancerate INTEGER,
  contributiongoals INTEGER,
  contributedamount INTEGER,
  committee TEXT,
  tasks TEXT[],
  classification TEXT,
  ispaulharrisfellow BOOLEAN DEFAULT false,
  paulharrislevel TEXT,
  joineddate TEXT,
  avatarurl TEXT,
  bio TEXT,
  auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
  rotary_id TEXT UNIQUE,
  failed_pin_attempts INTEGER NOT NULL DEFAULT 0,
  pin_locked_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, now()) NOT NULL
);

ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS rotary_id TEXT UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS failed_pin_attempts INTEGER NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS pin_locked_until TIMESTAMP WITH TIME ZONE;

-- 6. Create Member Contact Info Table (Relocated sensitive data)
CREATE TABLE IF NOT EXISTS member_contact_info (
  uid TEXT PRIMARY KEY REFERENCES users(uid) ON DELETE CASCADE,
  email TEXT,
  phone TEXT,
  birthday TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, now()) NOT NULL
);

-- 7. Create Inquiries Table
CREATE TABLE IF NOT EXISTS inquiries (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('Membership Inquiry', 'Donation Inquiry', 'General Contact')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, now()) NOT NULL
);

-- 8. Create Event RSVPs Table (Relocated guest mutations)
CREATE TABLE IF NOT EXISTS event_rsvps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id TEXT REFERENCES events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, now()) NOT NULL
);

-- 9. Create Project Applications Table (Relocated volunteer mutations)
CREATE TABLE IF NOT EXISTS project_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  statement TEXT NOT NULL,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, now()) NOT NULL
);

-- 10. Create Newsletter Subscribers Table
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, now()) NOT NULL
);

-- 11. Create Submissions Table (member-submitted projects/photos awaiting
-- admin approval; never publicly readable — see RLS policies below)
CREATE TABLE IF NOT EXISTS submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submitter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('project', 'photo')),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  year INTEGER,
  image_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reject_reason TEXT,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  published_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, now()) NOT NULL
);

-- 12. Create Gallery Photos Table (the Club Gallery's backing table;
-- public read, admin-only write)
CREATE TABLE IF NOT EXISTS gallery_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('meetings', 'anniversary', 'outreach', 'rotaract')),
  image_url TEXT NOT NULL,
  taken_date TEXT,
  location TEXT,
  submission_id UUID REFERENCES submissions(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, now()) NOT NULL
);

-- 13. Trigger function: silently reverts admin-only roster columns
-- (role, committee, attendance/contribution figures, tasks, classification,
-- Paul Harris status, joined date, auth_user_id, rotary_id, PIN lockout
-- state) if a non-admin updates their own users row. A member may still
-- change name/bio/avatarurl. Must also let a service_role caller through
-- (no auth.uid() of its own) -- the member-accounts/member-login Edge
-- Functions update these exact columns using the service_role key, and
-- without this check the trigger silently reverted their updates too.
CREATE OR REPLACE FUNCTION protect_admin_only_user_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT is_admin() AND auth.role() IS DISTINCT FROM 'service_role' THEN
    NEW.role := OLD.role;
    NEW.committee := OLD.committee;
    NEW.attendancerate := OLD.attendancerate;
    NEW.contributiongoals := OLD.contributiongoals;
    NEW.contributedamount := OLD.contributedamount;
    NEW.tasks := OLD.tasks;
    NEW.classification := OLD.classification;
    NEW.ispaulharrisfellow := OLD.ispaulharrisfellow;
    NEW.paulharrislevel := OLD.paulharrislevel;
    NEW.joineddate := OLD.joineddate;
    NEW.auth_user_id := OLD.auth_user_id;
    NEW.rotary_id := OLD.rotary_id;
    NEW.failed_pin_attempts := OLD.failed_pin_attempts;
    NEW.pin_locked_until := OLD.pin_locked_until;
  END IF;
  RETURN NEW;
END;
$$;

-- 14. Trigger function: assigns the next sequential RCFS-NNN Rotary ID on
-- insert whenever the caller doesn't supply one, so every path that creates
-- a users row (the roster seed button, an admin adding a member one at a
-- time, or any future path) gets a Rotary ID without the client having to
-- compute it. Simple MAX+1 rather than a real sequence: this table only
-- ever gets inserted into by a single admin at a time (sequential seed loop
-- or a form submission), so the tiny race window is an acceptable tradeoff
-- against the complexity of a dedicated sequence.
CREATE OR REPLACE FUNCTION assign_rotary_id()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  next_num INTEGER;
BEGIN
  IF NEW.rotary_id IS NULL THEN
    SELECT COALESCE(MAX(SUBSTRING(rotary_id FROM 6)::int), 0) + 1
    INTO next_num
    FROM users
    WHERE rotary_id ~ '^RCFS-\d+$';

    NEW.rotary_id := 'RCFS-' || LPAD(next_num::text, 3, '0');
  END IF;
  RETURN NEW;
END;
$$;

-- 15. Trigger function: blocks an admin from deleting their own admins row
CREATE OR REPLACE FUNCTION prevent_self_admin_removal()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.user_id = auth.uid() THEN
    RAISE EXCEPTION 'Admins cannot remove their own admin privileges.';
  END IF;
  RETURN OLD;
END;
$$;

-- All three trigger functions above only fire as triggers; they are not
-- meant to be called directly as an RPC endpoint. Revoking EXECUTE doesn't
-- affect trigger firing. Must revoke from PUBLIC *and* anon/authenticated
-- explicitly — this project carries an ALTER DEFAULT PRIVILEGES rule that
-- grants EXECUTE directly to anon/authenticated on every newly created
-- function (Supabase's standard default for PostgREST RPC exposure), which
-- a PUBLIC-only revoke does not remove.
REVOKE EXECUTE ON FUNCTION protect_admin_only_user_fields() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION prevent_self_admin_removal() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION assign_rotary_id() FROM PUBLIC, anon, authenticated;

-- 16. Create Chat Messages Table (single shared real-time room for all
-- logged-in members; sender_name is a denormalized snapshot for Realtime)
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sender_name TEXT NOT NULL,
  content TEXT NOT NULL CHECK (char_length(btrim(content)) > 0 AND char_length(content) <= 2000),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, now()) NOT NULL
);

-- 17. Create Chat Message Reactions Table (one row per message/member/emoji)
CREATE TABLE IF NOT EXISTS chat_message_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES chat_messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  emoji TEXT NOT NULL CHECK (char_length(emoji) <= 8),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, now()) NOT NULL,
  UNIQUE (message_id, user_id, emoji)
);

-- 18. Create Timeline Posts Table (member feed; publishes instantly, no
-- approval step, unlike submissions)
CREATE TABLE IF NOT EXISTS timeline_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  author_avatar_url TEXT,
  content TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, now()) NOT NULL,
  CHECK (
    (content IS NOT NULL AND char_length(btrim(content)) > 0 AND char_length(content) <= 5000)
    OR image_url IS NOT NULL
  )
);

-- 19. Create Timeline Comments Table
CREATE TABLE IF NOT EXISTS timeline_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES timeline_posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  content TEXT NOT NULL CHECK (char_length(btrim(content)) > 0 AND char_length(content) <= 1000),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_chat_message_reactions_message_id ON chat_message_reactions(message_id);
CREATE INDEX IF NOT EXISTS idx_timeline_comments_post_id ON timeline_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_timeline_posts_created_at ON timeline_posts(created_at);

-- Widen Realtime DELETE payloads for these two child tables so the client
-- gets message_id/post_id, not just the deleted row's own primary key.
ALTER TABLE chat_message_reactions REPLICA IDENTITY FULL;
ALTER TABLE timeline_comments REPLICA IDENTITY FULL;

-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_contact_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_rsvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- 1. Policies for 'admins' Table
-- No public SELECT policy exists on 'admins', making it completely private.
-- Only the SECURITY DEFINER is_admin() function can query it, and admins can manage it.
CREATE POLICY "Allow admin read and write on admins" ON admins
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

DROP TRIGGER IF EXISTS trg_prevent_self_admin_removal ON admins;
CREATE TRIGGER trg_prevent_self_admin_removal
  BEFORE DELETE ON admins
  FOR EACH ROW EXECUTE FUNCTION prevent_self_admin_removal();

-- 2. Policies for 'projects' Table
DROP POLICY IF EXISTS "Allow anyone to read projects" ON projects;
DROP POLICY IF EXISTS "Allow admin full access to projects" ON projects;

CREATE POLICY "Allow anyone to read projects" ON projects
  FOR SELECT TO public USING (true);

CREATE POLICY "Allow admin full access to projects" ON projects
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- 3. Policies for 'events' Table
DROP POLICY IF EXISTS "Allow anyone to read events" ON events;
DROP POLICY IF EXISTS "Allow admin full access to events" ON events;

CREATE POLICY "Allow anyone to read events" ON events
  FOR SELECT TO public USING (true);

CREATE POLICY "Allow admin full access to events" ON events
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- 4. Policies for 'users' Table
DROP POLICY IF EXISTS "Allow anyone to select on users" ON users;
DROP POLICY IF EXISTS "Allow admin full access to users" ON users;

CREATE POLICY "Allow anyone to select on users" ON users
  FOR SELECT TO public USING (true);

CREATE POLICY "Allow admin full access to users" ON users
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Allow self update on users" ON users;
CREATE POLICY "Allow self update on users" ON users
  FOR UPDATE TO authenticated
  USING (auth_user_id = auth.uid())
  WITH CHECK (auth_user_id = auth.uid());

DROP TRIGGER IF EXISTS trg_protect_admin_only_user_fields ON users;
CREATE TRIGGER trg_protect_admin_only_user_fields
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION protect_admin_only_user_fields();

DROP TRIGGER IF EXISTS trg_assign_rotary_id ON users;
CREATE TRIGGER trg_assign_rotary_id
  BEFORE INSERT ON users
  FOR EACH ROW EXECUTE FUNCTION assign_rotary_id();

-- Table-level privileges (a prerequisite to RLS — without these grants no
-- policy above, including the admin one, can ever write against real Supabase)
REVOKE ALL PRIVILEGES ON users FROM public, anon, authenticated;
GRANT SELECT ON users TO public, anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON users TO authenticated;

-- Lockout state must never be readable by anyone but the service role (used
-- by the member-login Edge Function) and admins via direct table access --
-- exposing the attempt counter/lockout time to a caller trying to brute
-- force a PIN would leak useful timing/state information.
REVOKE SELECT (failed_pin_attempts, pin_locked_until) ON users FROM public, anon, authenticated;

-- 5. Policies for 'member_contact_info' Table (admin full access; a member
-- can read/write only their own row, matched via users.auth_user_id)
CREATE POLICY "Allow admin select on member_contact_info" ON member_contact_info
  FOR SELECT TO authenticated USING (is_admin());

CREATE POLICY "Allow admin write on member_contact_info" ON member_contact_info
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Allow self select on member_contact_info" ON member_contact_info;
CREATE POLICY "Allow self select on member_contact_info" ON member_contact_info
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users u WHERE u.uid = member_contact_info.uid AND u.auth_user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Allow self insert on member_contact_info" ON member_contact_info;
CREATE POLICY "Allow self insert on member_contact_info" ON member_contact_info
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM users u WHERE u.uid = member_contact_info.uid AND u.auth_user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Allow self update on member_contact_info" ON member_contact_info;
CREATE POLICY "Allow self update on member_contact_info" ON member_contact_info
  FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users u WHERE u.uid = member_contact_info.uid AND u.auth_user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM users u WHERE u.uid = member_contact_info.uid AND u.auth_user_id = auth.uid()
  ));

-- 6. Policies for 'inquiries' Table
DROP POLICY IF EXISTS "Allow anyone to insert inquiries" ON inquiries;
DROP POLICY IF EXISTS "Allow admin full access to inquiries" ON inquiries;

CREATE POLICY "Allow anyone to insert inquiries" ON inquiries
  FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Allow admin full access to inquiries" ON inquiries
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- 7. Policies for 'event_rsvps' Table
CREATE POLICY "Allow public insert to event_rsvps" ON event_rsvps
  FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Allow admin full access to event_rsvps" ON event_rsvps
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- 8. Policies for 'project_applications' Table
CREATE POLICY "Allow public insert to project_applications" ON project_applications
  FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Allow admin full access to project_applications" ON project_applications
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- 9. Policies for 'newsletter_subscribers' Table
CREATE POLICY "Allow anyone to insert newsletter_subscribers" ON newsletter_subscribers
  FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Allow admin full access to newsletter_subscribers" ON newsletter_subscribers
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- 10. Policies for 'submissions' Table (no public policy exists at all —
-- visitors never see pending/rejected content, or another member's rows).
-- A member may insert/select/update only their own rows, and only update
-- while status is still 'pending'. Admins have full access.
DROP POLICY IF EXISTS "Allow members to insert own pending submissions" ON submissions;
CREATE POLICY "Allow members to insert own pending submissions" ON submissions
  FOR INSERT TO authenticated
  WITH CHECK (submitter_id = auth.uid() AND status = 'pending');

DROP POLICY IF EXISTS "Allow members to select own submissions" ON submissions;
CREATE POLICY "Allow members to select own submissions" ON submissions
  FOR SELECT TO authenticated
  USING (submitter_id = auth.uid());

DROP POLICY IF EXISTS "Allow members to update own pending submissions" ON submissions;
CREATE POLICY "Allow members to update own pending submissions" ON submissions
  FOR UPDATE TO authenticated
  USING (submitter_id = auth.uid() AND status = 'pending')
  WITH CHECK (submitter_id = auth.uid() AND status = 'pending');

DROP POLICY IF EXISTS "Allow admin full access to submissions" ON submissions;
CREATE POLICY "Allow admin full access to submissions" ON submissions
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- 11. Policies for 'gallery_photos' Table (public read, admin-only write)
ALTER TABLE gallery_photos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anyone to read gallery_photos" ON gallery_photos;
CREATE POLICY "Allow anyone to read gallery_photos" ON gallery_photos
  FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Allow admin full access to gallery_photos" ON gallery_photos;
CREATE POLICY "Allow admin full access to gallery_photos" ON gallery_photos
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- 12. Policies for 'chat_messages' Table (members-only, no anon/public
-- access; read/post requires is_linked_member() or is_admin() on top of
-- the authenticated role; own-message delete, admin delete-any)
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members can read chat messages" ON chat_messages;
CREATE POLICY "Members can read chat messages" ON chat_messages
  FOR SELECT TO authenticated USING (is_linked_member() OR is_admin());

DROP POLICY IF EXISTS "Members can send chat messages" ON chat_messages;
CREATE POLICY "Members can send chat messages" ON chat_messages
  FOR INSERT TO authenticated WITH CHECK (sender_id = auth.uid() AND (is_linked_member() OR is_admin()));

DROP POLICY IF EXISTS "Members can delete own chat messages, admins any" ON chat_messages;
CREATE POLICY "Members can delete own chat messages, admins any" ON chat_messages
  FOR DELETE TO authenticated USING (sender_id = auth.uid() OR is_admin());

REVOKE ALL PRIVILEGES ON chat_messages FROM public, anon, authenticated;
GRANT SELECT, INSERT, DELETE ON chat_messages TO authenticated;

-- 13. Policies for 'chat_message_reactions' Table
ALTER TABLE chat_message_reactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members can read chat reactions" ON chat_message_reactions;
CREATE POLICY "Members can read chat reactions" ON chat_message_reactions
  FOR SELECT TO authenticated USING (is_linked_member() OR is_admin());

DROP POLICY IF EXISTS "Members can add own chat reactions" ON chat_message_reactions;
CREATE POLICY "Members can add own chat reactions" ON chat_message_reactions
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() AND (is_linked_member() OR is_admin()));

DROP POLICY IF EXISTS "Members can remove own chat reactions" ON chat_message_reactions;
CREATE POLICY "Members can remove own chat reactions" ON chat_message_reactions
  FOR DELETE TO authenticated USING (user_id = auth.uid());

REVOKE ALL PRIVILEGES ON chat_message_reactions FROM public, anon, authenticated;
GRANT SELECT, INSERT, DELETE ON chat_message_reactions TO authenticated;

-- 14. Policies for 'timeline_posts' Table (members-only feed; own-post
-- delete, admin delete-any)
ALTER TABLE timeline_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members can read timeline posts" ON timeline_posts;
CREATE POLICY "Members can read timeline posts" ON timeline_posts
  FOR SELECT TO authenticated USING (is_linked_member() OR is_admin());

DROP POLICY IF EXISTS "Members can create timeline posts" ON timeline_posts;
CREATE POLICY "Members can create timeline posts" ON timeline_posts
  FOR INSERT TO authenticated WITH CHECK (author_id = auth.uid() AND (is_linked_member() OR is_admin()));

DROP POLICY IF EXISTS "Members can delete own timeline posts, admins any" ON timeline_posts;
CREATE POLICY "Members can delete own timeline posts, admins any" ON timeline_posts
  FOR DELETE TO authenticated USING (author_id = auth.uid() OR is_admin());

REVOKE ALL PRIVILEGES ON timeline_posts FROM public, anon, authenticated;
GRANT SELECT, INSERT, DELETE ON timeline_posts TO authenticated;

-- 15. Policies for 'timeline_comments' Table
ALTER TABLE timeline_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members can read timeline comments" ON timeline_comments;
CREATE POLICY "Members can read timeline comments" ON timeline_comments
  FOR SELECT TO authenticated USING (is_linked_member() OR is_admin());

DROP POLICY IF EXISTS "Members can create timeline comments" ON timeline_comments;
CREATE POLICY "Members can create timeline comments" ON timeline_comments
  FOR INSERT TO authenticated WITH CHECK (author_id = auth.uid() AND (is_linked_member() OR is_admin()));

DROP POLICY IF EXISTS "Members can delete own timeline comments, admins any" ON timeline_comments;
CREATE POLICY "Members can delete own timeline comments, admins any" ON timeline_comments
  FOR DELETE TO authenticated USING (author_id = auth.uid() OR is_admin());

REVOKE ALL PRIVILEGES ON timeline_comments FROM public, anon, authenticated;
GRANT SELECT, INSERT, DELETE ON timeline_comments TO authenticated;

-- ==========================================
-- SEED INITIAL ADMIN USER
-- ==========================================
-- Insert the admin account 'bigsyl19@gmail.com' dynamically into the admins table
-- (Will work automatically once the user signs up/in via Supabase Auth)
INSERT INTO admins (user_id)
SELECT id FROM auth.users WHERE email = 'bigsyl19@gmail.com'
ON CONFLICT DO NOTHING;

-- Enable Realtime for automatic updates
alter publication supabase_realtime add table projects;
alter publication supabase_realtime add table events;
alter publication supabase_realtime add table event_rsvps;
alter publication supabase_realtime add table project_applications;
alter publication supabase_realtime add table submissions;
alter publication supabase_realtime add table gallery_photos;
alter publication supabase_realtime add table chat_messages;
alter publication supabase_realtime add table chat_message_reactions;
alter publication supabase_realtime add table timeline_posts;
alter publication supabase_realtime add table timeline_comments;

-- ==========================================
-- STORAGE — member-uploads bucket
-- ==========================================
-- Bucket is public=true so object URLs render without any RLS check; no
-- SELECT policy is added (that would only enable authenticated file
-- listing, which isn't needed). A member may only write inside
-- member-uploads/<their auth uid>/...
INSERT INTO storage.buckets (id, name, public)
VALUES ('member-uploads', 'member-uploads', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Allow public read on member-uploads" ON storage.objects;

DROP POLICY IF EXISTS "Allow members to upload to their own folder" ON storage.objects;
CREATE POLICY "Allow members to upload to their own folder" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'member-uploads' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Allow members to update their own files" ON storage.objects;
CREATE POLICY "Allow members to update their own files" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'member-uploads' AND (storage.foldername(name))[1] = auth.uid()::text)
  WITH CHECK (bucket_id = 'member-uploads' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Allow members to delete their own files" ON storage.objects;
CREATE POLICY "Allow members to delete their own files" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'member-uploads' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Allow admin full access to member-uploads" ON storage.objects;
CREATE POLICY "Allow admin full access to member-uploads" ON storage.objects
  FOR ALL TO authenticated
  USING (bucket_id = 'member-uploads' AND is_admin())
  WITH CHECK (bucket_id = 'member-uploads' AND is_admin());
`;
