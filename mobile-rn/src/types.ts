export interface UserProfile {
  uid: string;
  name: string;
  email?: string;
  role: 'Rotarian' | 'Club Officer' | 'Guest' | 'President';
  attendanceRate?: number;
  contributionGoals?: number;
  contributedAmount?: number;
  committee?: string;
  tasks?: string[];
  isPaulHarrisFellow?: boolean;
  paulHarrisLevel?: 'PHF' | 'PHF+1' | 'PHF+2' | 'PHF+3' | 'PHF+4' | 'PHF+8' | 'Major Donor' | 'None';
  avatarUrl?: string;
  classification?: string;
  phone?: string;
  joinedDate?: string;
  birthday?: string;
  title?: string;
  bio?: string;
  authUserId?: string;
  isAdmin?: boolean;
  rotaryId?: string;
}

export interface Submission {
  id: string;
  submitterId: string;
  submitterName?: string;
  kind: 'project' | 'photo';
  title: string;
  description?: string;
  category?: string;
  year?: number;
  imageUrl?: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectReason?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  publishedId?: string;
  createdAt: string;
}

export interface GalleryPhoto {
  id: string;
  title: string;
  description?: string;
  category: 'meetings' | 'anniversary' | 'outreach' | 'rotaract';
  imageUrl: string;
  takenDate?: string;
  location?: string;
}

export interface Project {
  id: string;
  title: string;
  category: string;
  description: string;
  year: number;
  impact?: string;
  status: 'Completed' | 'Active' | 'Planning';
  imageUrl?: string;
  details?: string;
  galleryUrls?: string[];
  budget?: string;
  fundingRaised?: string;
  beneficiariesCount?: string;
  locationName?: string;
  teamLeads?: string[];
  wellsBuilt?: number;
  studentsSponsored?: number;
  fundsRaised?: number;
  peopleImpacted?: number;
}

export interface ClubEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  speaker?: string;
  description?: string;
  type: 'Weekly Meeting' | 'Service Project' | 'Social' | 'Fundraiser';
  attendance_tracking_enabled?: boolean;
  venue_lat?: number | null;
  venue_lng?: number | null;
  venue_radius_m?: number;
}

export interface AttendanceRecord {
  id: string;
  event_id: string;
  member_id: string;
  method: 'qr' | 'manual';
  checked_in_at: string;
  distance_m?: number | null;
  gps_accuracy_m?: number | null;
  confidence: 'high' | 'low' | 'manual';
  memberName?: string;
}

export interface RoleRequest {
  id: string;
  user_id: string;
  requested_role: 'secretary' | 'treasurer' | 'media';
  note?: string | null;
  status: 'pending' | 'approved' | 'denied';
  reviewed_by?: string | null;
  reviewed_at?: string | null;
  created_at: string;
  memberName?: string;
  memberEmail?: string;
}

export interface ContactInquiry {
  id: string;
  name: string;
  email: string;
  subject?: string;
  message: string;
  type: 'Membership Inquiry' | 'Donation Inquiry' | 'General Contact';
  createdAt?: string;
}

export interface EventRSVP {
  id: string;
  event_id: string;
  name: string;
  email: string;
  submitted_at: string;
  event_title?: string;
  member_id?: string | null;
}

export interface ProjectApplication {
  id: string;
  project_id: string;
  name: string;
  email: string;
  statement: string;
  submitted_at: string;
  project_title?: string;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  createdAt?: string;
}

export interface ChatReaction {
  id: string;
  emoji: string;
  userId: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  createdAt: string;
  reactions: ChatReaction[];
}

export interface TimelineComment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
}

export interface TimelinePost {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatarUrl?: string;
  content?: string;
  imageUrl?: string;
  createdAt: string;
  comments: TimelineComment[];
}
