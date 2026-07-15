import { Project, ClubEvent, UserProfile, ContactInquiry, EventRSVP, ProjectApplication } from './types';
import { 
  getSupabaseProjects, 
  saveSupabaseProject, 
  getSupabaseEvents, 
  saveSupabaseEvent, 
  submitSupabaseInquiry, 
  upsertSupabaseUser,
  isSupabaseConfigured,
  getSupabaseUsers,
  supabase,
  getSupabaseUser,
  getSupabaseRSVPs,
  submitSupabaseRSVP,
  getSupabaseApplications,
  submitSupabaseApplication
} from './supabase-service';
import { INITIAL_MEMBER_DIRECTORY } from './data';

export type DbDriver = 'supabase';

// LocalStorage Persistence helper for Simulator auth
const getLocalData = <T>(key: string, defaultVal: T): T => {
  const val = localStorage.getItem(key);
  if (!val) {
    localStorage.setItem(key, JSON.stringify(defaultVal));
    return defaultVal;
  }
  return JSON.parse(val);
};

const setLocalData = <T>(key: string, data: T) => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const getActiveDbDriver = (): DbDriver => {
  return 'supabase';
};

export const setActiveDbDriver = (driver: DbDriver) => {
  // No-op (retained for backward compatibility)
};

// -------------------------------------------------------------
// UNIFIED ARCHITECTURAL WRAPPERS (Always Supabase / Sandbox)
// -------------------------------------------------------------

export const getDbProjects = async (): Promise<Project[]> => {
  return getSupabaseProjects();
};

export const saveDbProject = async (project: Project): Promise<Project> => {
  return saveSupabaseProject(project);
};

export const getDbEvents = async (): Promise<ClubEvent[]> => {
  return getSupabaseEvents();
};

export const saveDbEvent = async (event: ClubEvent): Promise<ClubEvent> => {
  return saveSupabaseEvent(event);
};

export const submitDbInquiry = async (inquiry: ContactInquiry): Promise<ContactInquiry> => {
  return submitSupabaseInquiry(inquiry);
};

export const updateDbProfile = async (profile: UserProfile): Promise<UserProfile> => {
  return upsertSupabaseUser(profile);
};

export const getDbUsers = async (): Promise<UserProfile[]> => {
  return getSupabaseUsers();
};

export const isDriverSimulated = (driver: DbDriver): boolean => {
  return !isSupabaseConfigured;
};

// RSVPs
export const getDbRSVPs = async (): Promise<EventRSVP[]> => {
  return getSupabaseRSVPs();
};

export const submitDbRSVP = async (rsvp: EventRSVP): Promise<EventRSVP> => {
  return submitSupabaseRSVP(rsvp);
};

// Applications
export const getDbApplications = async (): Promise<ProjectApplication[]> => {
  return getSupabaseApplications();
};

export const submitDbApplication = async (app: ProjectApplication): Promise<ProjectApplication> => {
  return submitSupabaseApplication(app);
};

// -------------------------------------------------------------
// AUTH INTEGRATION (Supabase vs Sandbox LocalStorage)
// -------------------------------------------------------------

export const subscribeToAuth = (
  onStateChange: (user: UserProfile | null) => void,
  setLoading: (loading: boolean) => void
) => {
  if (isSupabaseConfigured && supabase) {
    setLoading(true);
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        getSupabaseUser(session.user.id).then(async (profile) => {
          if (profile) {
            onStateChange(profile);
          } else {
            // Create user profile
            const newProfile: UserProfile = {
              uid: session.user.id,
              name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Rotary Member',
              email: session.user.email || '',
              role: session.user.email === 'bigsyl19@gmail.com' ? 'President' : 'Rotarian',
              attendanceRate: 92,
              contributionGoals: 500,
              contributedAmount: 150,
              committee: 'Service Projects Committee',
              tasks: ['Identify Tombo maintenance issues', 'Promote clean water awareness']
            };
            await upsertSupabaseUser(newProfile);
            onStateChange(newProfile);
          }
          setLoading(false);
        });
      } else {
        onStateChange(null);
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setLoading(true);
      if (session) {
        const profile = await getSupabaseUser(session.user.id);
        if (profile) {
          onStateChange(profile);
        } else {
          const newProfile: UserProfile = {
            uid: session.user.id,
            name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Rotary Member',
            email: session.user.email || '',
            role: session.user.email === 'bigsyl19@gmail.com' ? 'President' : 'Rotarian',
            attendanceRate: 92,
            contributionGoals: 500,
            contributedAmount: 150,
            committee: 'Service Projects Committee',
            tasks: ['Identify Tombo maintenance issues', 'Promote clean water awareness']
          };
          await upsertSupabaseUser(newProfile);
          onStateChange(newProfile);
        }
      } else {
        onStateChange(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  } else {
    setLoading(true);
    const activeSession = getLocalData<{ uid: string; displayName: string; email: string } | null>('rcfs_auth_session', null);
    if (activeSession) {
      const profiles = getLocalData<UserProfile[]>('sb_supabase_users', INITIAL_MEMBER_DIRECTORY);
      let profile = profiles.find(p => p.uid === activeSession.uid);
      if (!profile) {
        profile = {
          uid: activeSession.uid,
          name: activeSession.displayName,
          email: activeSession.email,
          role: activeSession.email.includes('president') || activeSession.email === 'bigsyl19@gmail.com' ? 'President' : activeSession.email.includes('officer') ? 'Club Officer' : 'Rotarian',
          attendanceRate: 94,
          contributionGoals: 1000,
          contributedAmount: 850,
          committee: 'Vocational Service Committee',
          tasks: ['Prepare Literacy First Waterloo presentation', 'Organize next coffee hour']
        };
        profiles.push(profile);
        setLocalData('sb_supabase_users', profiles);
      }
      onStateChange(profile);
    } else {
      onStateChange(null);
    }
    setLoading(false);
    return () => {};
  }
};

export const logOutUser = async () => {
  if (isSupabaseConfigured && supabase) {
    await supabase.auth.signOut();
  } else {
    localStorage.removeItem('rcfs_auth_session');
  }
};

export const logInUser = async (emailText?: string, nameText?: string): Promise<UserProfile> => {
  if (isSupabaseConfigured && supabase) {
    // Standard Google Sign In
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });
    if (error) throw error;
    return { uid: 'oauth_redirecting' } as any;
  } else {
    const email = emailText || 'member@freetownsunset.org';
    const name = nameText || 'Freetown Rotarian';
    const fakeUid = 'sim_' + Math.random().toString(36).substr(2, 9);
    
    const activeSession = {
      uid: fakeUid,
      displayName: name,
      email,
      emailVerified: true
    };
    setLocalData('rcfs_auth_session', activeSession);

    const profiles = getLocalData<UserProfile[]>('sb_supabase_users', INITIAL_MEMBER_DIRECTORY);
    let profile = profiles.find(p => p.email === email);
    if (!profile) {
      profile = {
        uid: fakeUid,
        name,
        email,
        role: email.includes('president') || email === 'bigsyl19@gmail.com' ? 'President' : email.includes('officer') ? 'Club Officer' : 'Rotarian',
        attendanceRate: 94,
        contributionGoals: 1000,
        contributedAmount: 850,
        committee: 'Vocational Service Committee',
        tasks: ['Prepare Literacy First Waterloo presentation', 'Organize next coffee hour']
      };
      profiles.push(profile);
      setLocalData('sb_supabase_users', profiles);
    }
    return profile;
  }
};
