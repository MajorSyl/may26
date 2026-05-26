import { Project, ClubEvent } from './types';

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'proj_water_tombo',
    title: 'Water for Tombo Clean Well Initiative',
    category: 'Water, Sanitation, and Hygiene',
    description: 'Constructed three solar-powered borehole water wells and community wash facilities in the coastal fishing village of Tombo, providing direct clean water access and ending water-borne illness spikes.',
    year: 2024,
    impact: 'Provided drinkable water to over 5,000 residents and reduced health epidemics by 85%.',
    status: 'Completed',
    imageUrl: 'https://images.unsplash.com/photo-1541816521319-ef3d45e5f6e8?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'proj_literacy_first',
    title: 'Literacy First Waterloo Libraries',
    category: 'Basic Education and Literacy',
    description: 'Refurbished local community libraries and delivered 4,500 curriculum-aligned textbooks, educational tablets, and teacher training programs in Waterloo and surrounding peri-urban communities.',
    year: 2025,
    impact: 'Rebuilt 2 libraries, benefitting 1,200 secondary students with a 40% rise in local reading scores.',
    status: 'Completed',
    imageUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'proj_maternal_health',
    title: 'Safe Motherhood Delivery Kits',
    category: 'Maternal and Child Health',
    description: 'Providing sterile midwifery delivery kits, maternal supplements, and solar-power-equipped labor and delivery lamps to local clinics in Freetown’s underserved settlements.',
    year: 2026,
    impact: 'Distributed 1,500 clean birth kits and installed lighting systems in 5 labor clinics.',
    status: 'Active',
    imageUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'proj_solar_power',
    title: 'Solar Cold Chain for Clinics',
    category: 'Disease Prevention and Treatment',
    description: 'Equipping three community health outposts with photovoltaic solar panels and medical-grade reefers to guarantee the secure preservation of vaccines and cold-sensitive pediatric treatments.',
    year: 2026,
    impact: 'Establishes continuous vaccine safety and diagnostics coverage for over 10,000 children.',
    status: 'Planning',
    imageUrl: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'proj_lumley_clean',
    title: 'Sunset Mangrove & Coastal Care',
    category: 'Supporting the Environment',
    description: 'Coastal waste mitigation and reforestation of critical mangrove zones along Aberdeen and Lumley beach pathways, collaborating with local youth groups to tackle plastic waste.',
    year: 2025,
    impact: 'Planted 1,200 coastal mangrove seedlings and cleared 3.5 tons of plastic waste debris.',
    status: 'Completed',
    imageUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=800'
  }
];

export const INITIAL_EVENTS: ClubEvent[] = [
  {
    id: 'ev_literacy_meeting',
    title: 'Expansion of Youth Literacy in Sierra Leone',
    date: '2026-06-04',
    time: '18:30 - 20:00',
    location: 'Radisson Blu Mammy Yoko, Lumley Beach Road, Freetown',
    speaker: 'Hon. Dr. David Sengeh (Minister of Basic Education)',
    description: 'Join us for our weekly sunset meeting as we host Dr. David Sengeh to discuss collaborative models for Rotary initiatives to support secondary school libraries and digital literacy training centers across Freetown.',
    type: 'Weekly Meeting'
  },
  {
    id: 'ev_mangrove_drive',
    title: 'Lumley Mangrove Plantation Service Day',
    date: '2026-06-13',
    time: '08:00 - 12:00',
    location: 'Lumley Beach Estuary Site, Aberdeen, Freetown',
    description: 'Hands-on community service day! RCFS members, Rotaractors, and local conservationists will meet to plant mangrove saplings, help erect natural erosion walls, and clean up plastic litter.',
    type: 'Service Project'
  },
  {
    id: 'ev_sunset_gala',
    title: 'Annual Golden Sunset Charity Gala & Auction',
    date: '2026-06-27',
    time: '19:00 - 23:00',
    location: 'Bintumani Conference Centre, Aberdeen, Freetown',
    speaker: 'Rotary District 9101 Governor Invite',
    description: 'Our premier annual fundraising highlight. A beautiful formal evening of music, dining, and live auctions. All tickets and auction fundraising proceeds directly finance our 2026-2027 Rural Solar Borehole Projects.',
    type: 'Fundraiser'
  },
  {
    id: 'ev_monthly_social',
    title: 'New Member Information Coffee & Circle',
    date: '2026-07-05',
    time: '17:00 - 18:30',
    location: 'Cabenda Hotel Terrace, Signal Hill, Freetown',
    speaker: 'Club Membership Director',
    description: 'A relaxed, warm gathering for prospective members to learn about the Rotary movement, meet our leadership, ask questions, and explore the pathway to nomination and service.',
    type: 'Social'
  }
];

export const GENERAL_FAQS = [
  {
    q: 'How can I become a member of the Rotary Club of Freetown Sunset?',
    a: 'Membership is by invitation following attendance at some of our meetings and a nomination process. If you enjoy serving your community, meet the professional or business standards, and are willing to dedicate time, we encourage you to submit your details on our "Get Involved" page so we can invite you as a guest.'
  },
  {
    q: 'What is the "Four-Way Test" in Rotary?',
    a: 'It is a nonpartisan ethical guide for Rotarians to apply in their personal and professional relationships: 1) Is it the TRUTH? 2) Is it FAIR to all concerned? 3) Will it build GOODWILL and BETTER FRIENDSHIPS? 4) Will it be BENEFICIAL to all concerned?'
  },
  {
    q: 'Where do membership dues and public donations go?',
    a: '100% of public donations go directly to funding our local service projects (like clean water wells, health kits, and school libraries). General club administrative fees are covered exclusively by members through annual subscription dues.'
  },
  {
    q: 'Are your meetings open to the public?',
    a: 'Yes, visiting Rotarians from other clubs worldwide and guests interested in our work or service programs are always welcome to join our weekly Sunset meetings. We do ask that local guests contact us ahead of time so we can arrange proper hospitality.'
  }
];

export const ROTARY_FOCUS_AREAS = [
  {
    title: 'Peacebuilding & Conflict Prevention',
    description: 'Fostering understanding and equipping leaders to prevent conflict and reconcile communities.'
  },
  {
    title: 'Disease Prevention & Treatment',
    description: 'Establishing health centers, funding medical equipment, and championing the global Polio eradication effort.'
  },
  {
    title: 'Water, Sanitation, & Hygiene',
    description: 'Providing sustainable water systems and hygiene education to rural settlements and schools.'
  },
  {
    title: 'Maternal & Child Health',
    description: 'Enhancing high-quality prenatal care and safe deliveries to lower infant and maternal mortality.'
  },
  {
    title: 'Basic Education & Literacy',
    description: 'Constructing school resources, donating learning materials, and mentoring teachers to expand literacy.'
  },
  {
    title: 'Community Economic Development',
    description: 'Empowering marginalized groups and entrepreneurs with vocational training, grants, and micro-savings models.'
  },
  {
    title: 'Supporting the Environment',
    description: 'Conserving forest resources, promoting sustainable farming, waste cleanup, and ecosystem restoration.'
  }
];
