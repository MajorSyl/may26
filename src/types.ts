export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: 'Rotarian' | 'Club Officer' | 'Guest' | 'President';
  attendanceRate?: number;
  contributionGoals?: number;
  contributedAmount?: number;
  committee?: string;
  tasks?: string[];
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
