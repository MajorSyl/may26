import { Project, ClubEvent, UserProfile, ContactInquiry, EventRSVP, ProjectApplication, NewsletterSubscriber, Submission, GalleryPhoto, ChatMessage, TimelinePost } from './types';
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
  getSupabaseUserByAuthId,
  updateSupabaseOwnProfile,
  updateSupabaseOwnContactInfo,
  getSupabaseRSVPs,
  submitSupabaseRSVP,
  getSupabaseApplications,
  submitSupabaseApplication,
  submitSupabaseNewsletterSignup,
  getSupabaseSubmissions,
  getMySupabaseSubmissions,
  submitSupabaseSubmission,
  reviewSupabaseSubmission,
  getSupabaseGalleryPhotos,
  promoteSupabaseAdmin,
  demoteSupabaseAdmin,
  createLoginSupabaseMember,
  resetSupabasePin,
  revokeSupabaseMemberAccount,
  loginWithRotaryIdAndPin,
  getSupabaseChatMessages,
  sendSupabaseChatMessage,
  deleteSupabaseChatMessage,
  toggleSupabaseChatReaction,
  subscribeToChatRealtime,
  getSupabaseTimelinePosts,
  createSupabaseTimelinePost,
  deleteSupabaseTimelinePost,
  addSupabaseTimelineComment,
  deleteSupabaseTimelineComment,
  subscribeToTimelineRealtime
} from './supabase-service';
import { INITIAL_MEMBER_DIRECTORY } from './data';
import { safeStorage } from './lib/safe-storage';

export type DbDriver = 'supabase';

// LocalStorage Persistence helper for Simulator auth
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

export const subscribeToNewsletter = async (email: string): Promise<NewsletterSubscriber> => {
  return submitSupabaseNewsletterSignup(email);
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
// Accounts are admin-created/invite-only (no open self-signup), so a
// session with no linked roster row is never fabricated a placeholder
// profile here -- that would silently invent fake club data for whoever
// holds the session, the exact thing this app has spent real effort
// removing elsewhere. onStateChange(null) covers both "logged out" and
// "logged in but not yet linked to a roster row"; components that need to
// tell those two apart (e.g. to show "contact an admin to finish setup")
// can check supabase.auth.getSession() themselves.

export const subscribeToAuth = (
  onStateChange: (user: UserProfile | null) => void,
  setLoading: (loading: boolean) => void
) => {
  if (isSupabaseConfigured && supabase) {
    setLoading(true);
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        getSupabaseUserByAuthId(session.user.id).then((profile) => {
          onStateChange(profile);
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
        const profile = await getSupabaseUserByAuthId(session.user.id);
        onStateChange(profile);
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
      const profile = profiles.find(p => p.uid === activeSession.uid) || null;
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
    safeStorage.removeItem('rcfs_auth_session');
  }
};

// Rotary ID + 6-digit PIN sign-in only -- there is no self-registration
// path and no email surface. Members receive their Rotary ID + an initial
// PIN from an admin (see createLoginSupabaseMember below), which links
// their auth account to an existing roster row before they ever sign in
// here. Real Rotary-ID-first lookup and per-ID lockout is enforced by the
// member-login Edge Function (see loginWithRotaryIdAndPin); this wrapper
// just falls back to a local simulator when Supabase isn't configured.
export const logInMember = async (rotaryId: string, pin: string): Promise<UserProfile> => {
  if (isSupabaseConfigured && supabase) {
    return loginWithRotaryIdAndPin(rotaryId, pin);
  } else {
    const fakeUid = 'sim_' + Math.random().toString(36).substr(2, 9);
    const normalizedId = rotaryId.trim().toUpperCase();
    const activeSession = { uid: fakeUid, displayName: normalizedId, email: `${normalizedId.toLowerCase()}@members.rcfs.internal`, emailVerified: true };
    setLocalData('rcfs_auth_session', activeSession);

    const profiles = getLocalData<UserProfile[]>('sb_supabase_users', INITIAL_MEMBER_DIRECTORY);
    let profile = profiles.find(p => p.rotaryId === normalizedId);
    if (!profile) {
      profile = {
        uid: fakeUid,
        name: normalizedId,
        rotaryId: normalizedId,
        role: 'Rotarian',
        committee: 'General Fellowship',
        tasks: []
      };
      profiles.push(profile);
      setLocalData('sb_supabase_users', profiles);
    }
    return profile;
  }
};

export const setOwnPin = async (pin: string): Promise<void> => {
  if (!/^\d{6}$/.test(pin)) throw new Error('PIN must be exactly 6 digits.');
  if (!isSupabaseConfigured || !supabase) return;
  const { error } = await supabase.auth.updateUser({ password: pin });
  if (error) throw error;
};

// -------------------------------------------------------------
// MEMBER SELF-EDIT
// -------------------------------------------------------------

export const updateOwnProfile = async (
  uid: string,
  fields: { name?: string; bio?: string; avatarUrl?: string }
): Promise<void> => {
  return updateSupabaseOwnProfile(uid, fields);
};

export const updateOwnContactInfo = async (
  uid: string,
  fields: { email?: string; phone?: string; birthday?: string }
): Promise<void> => {
  return updateSupabaseOwnContactInfo(uid, fields);
};

// -------------------------------------------------------------
// SUBMISSIONS
// -------------------------------------------------------------

export const getDbSubmissions = async (): Promise<Submission[]> => {
  return getSupabaseSubmissions();
};

export const getMyDbSubmissions = async (authUserId: string): Promise<Submission[]> => {
  return getMySupabaseSubmissions(authUserId);
};

export const submitDbSubmission = async (input: {
  submitterId: string;
  kind: 'project' | 'photo';
  title: string;
  description?: string;
  category?: string;
  year?: number;
  imageUrl?: string;
}): Promise<Submission> => {
  return submitSupabaseSubmission(input);
};

export const reviewDbSubmission = async (
  submissionId: string,
  decision: 'approved' | 'rejected',
  reviewerId: string,
  rejectReason?: string
): Promise<void> => {
  return reviewSupabaseSubmission(submissionId, decision, reviewerId, rejectReason);
};

// -------------------------------------------------------------
// CLUB GALLERY
// -------------------------------------------------------------

export const getDbGalleryPhotos = async (): Promise<GalleryPhoto[]> => {
  return getSupabaseGalleryPhotos();
};

// -------------------------------------------------------------
// ADMIN MANAGEMENT
// -------------------------------------------------------------

export const promoteToAdmin = async (authUserId: string): Promise<void> => {
  return promoteSupabaseAdmin(authUserId);
};

export const demoteFromAdmin = async (authUserId: string): Promise<void> => {
  return demoteSupabaseAdmin(authUserId);
};

export const createMemberLogin = async (uid: string, pin: string): Promise<string> => {
  return createLoginSupabaseMember(uid, pin);
};

export const resetMemberPin = async (uid: string, pin: string): Promise<void> => {
  return resetSupabasePin(uid, pin);
};

export const revokeMemberAccount = async (uid: string): Promise<void> => {
  return revokeSupabaseMemberAccount(uid);
};

// -------------------------------------------------------------
// GROUP CHAT & MEMBER TIMELINE
// -------------------------------------------------------------
// Members-only, live-Supabase features -- there is no local sandbox
// simulation of Realtime, so these simply no-op/return-empty when Supabase
// isn't configured (isDriverSimulated) and the UI shows that state directly.

export const getDbChatMessages = async (): Promise<ChatMessage[]> => {
  return getSupabaseChatMessages();
};

export const sendDbChatMessage = async (senderId: string, senderName: string, content: string): Promise<void> => {
  return sendSupabaseChatMessage(senderId, senderName, content);
};

export const deleteDbChatMessage = async (messageId: string): Promise<void> => {
  return deleteSupabaseChatMessage(messageId);
};

export const toggleDbChatReaction = async (messageId: string, userId: string, emoji: string): Promise<'added' | 'removed'> => {
  return toggleSupabaseChatReaction(messageId, userId, emoji);
};

export const subscribeToDbChatRealtime = subscribeToChatRealtime;

export const getDbTimelinePosts = async (): Promise<TimelinePost[]> => {
  return getSupabaseTimelinePosts();
};

export const createDbTimelinePost = async (input: {
  authorId: string;
  authorName: string;
  authorAvatarUrl?: string;
  content?: string;
  imageUrl?: string;
}): Promise<void> => {
  return createSupabaseTimelinePost(input);
};

export const deleteDbTimelinePost = async (postId: string): Promise<void> => {
  return deleteSupabaseTimelinePost(postId);
};

export const addDbTimelineComment = async (postId: string, authorId: string, authorName: string, content: string): Promise<void> => {
  return addSupabaseTimelineComment(postId, authorId, authorName, content);
};

export const deleteDbTimelineComment = async (commentId: string): Promise<void> => {
  return deleteSupabaseTimelineComment(commentId);
};

export const subscribeToDbTimelineRealtime = subscribeToTimelineRealtime;
