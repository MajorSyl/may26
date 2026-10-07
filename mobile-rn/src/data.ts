import { Project, ClubEvent, UserProfile } from './types';
import { FULL_MEMBER_LIST } from './memberData';

// Local-sandbox fallback content only, used when Supabase isn't configured.
// Ported from the web app's src/data.ts. The one project that had a bundled
// local image (kaningo-2017.jpg) is ported without it here -- it falls back
// to SafeImage's placeholder instead. See MIGRATION_NOTES.md.
export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'proj_hope_orphanage_well',
    title: 'Water Well – Hope Orphanage',
    category: 'Water & Sanitation',
    description: 'Constructed a water well for Hope Orphanage in Grafton Village to improve access to clean water.',
    year: 2014,
    status: 'Completed',
    locationName: 'Grafton Village'
  },
  {
    id: 'proj_russel_library',
    title: 'Russel Community Library',
    category: 'Basic Education and Literacy',
    description: 'Built and equipped the Russel Community Library, including books, laptops, and a generator to power the library.',
    year: 2019,
    status: 'Completed'
  },
  {
    id: 'proj_ola_during_solar',
    title: 'Solar System – Ola During Hospital Pediatric Ward',
    category: 'Energy',
    description: 'Installed a solar energy system for the Pediatric Ward at Ola During Hospital.',
    year: 2022,
    status: 'Completed'
  },
  {
    id: 'proj_tree_planting',
    title: '1,000 Tree Planting Initiative',
    category: 'The Environment',
    description: 'Planted 1,000 trees in collaboration with the Freetown City Council.',
    year: 2023,
    status: 'Completed'
  },
  {
    id: 'proj_ola_during_donations',
    title: "Ola During Children's Ward Donations",
    category: 'Maternal and Child Health',
    description: "Donated toiletries and hygiene items for babies at the Ola During Children's Ward in 2019 and 2021.",
    year: 2021,
    status: 'Completed'
  },
  {
    id: 'proj_russel_scholarships',
    title: 'Russel Rural Community School Scholarships',
    category: 'Basic Education and Literacy',
    description: 'Every year from 2014 through 2022, the club awarded scholarships to the top 12 students at Russel Rural Community School, including school materials and personal effects.',
    year: 2022,
    status: 'Completed'
  },
  {
    id: 'proj_russel_furniture',
    title: 'Russel Rural Community School – Furniture and Renovation',
    category: 'Basic Education and Literacy',
    description: 'Provided 100 chairs and tables to Russel Rural Community School in 2015, and completed a classroom renovation with new furniture in 2022.',
    year: 2022,
    status: 'Completed'
  },
  {
    id: 'proj_murray_town_refurb',
    title: 'Murray Town Municipal Primary School Refurbishment',
    category: 'Basic Education and Literacy',
    description: 'Refurbished Murray Town Municipal Primary School and provided classroom furniture, including tables and chairs.',
    year: 2016,
    status: 'Completed'
  },
  {
    id: 'proj_school_donations',
    title: 'School Donations – Baw Baw and Tengbeh Town',
    category: 'Basic Education and Literacy',
    description: 'Donated school materials and stationery to Baw Baw Municipal School in 2014, and provided radios for school programs to Baw Baw Municipal School and Tengbeh Town Primary School in 2015.',
    year: 2015,
    status: 'Completed'
  },
  {
    id: 'proj_john_bosco',
    title: 'John Bosco Orphanage Child Care Support',
    category: 'Maternal and Child Health',
    description: 'Provided child care support to John Bosco Orphanage on Fort Street.',
    year: 2017,
    status: 'Completed',
    locationName: 'Fort Street'
  },
  {
    id: 'proj_kaningo_kamayama',
    title: 'Kaningo and Kamayama Mudslide Resettlement',
    category: 'Community Economic Development',
    description: 'Supported the resettlement and rehabilitation of mudslide victims in the Kaningo and Kamayama communities.',
    year: 2017,
    status: 'Completed'
  },
  {
    id: 'proj_wellington_fire',
    title: 'Wellington Fire Victims – Blood Donations',
    category: 'Community Economic Development',
    description: 'Organized blood donations in support of victims of the Wellington fire.',
    year: 2021,
    status: 'Completed'
  },
  {
    id: 'proj_blood_bank',
    title: 'Blood Bank / Blood Donation Program',
    category: 'Health',
    description: 'Established a blood bank and blood donation program to support emergencies, disasters, and other urgent needs, in collaboration with the Ministry of Health.',
    year: 2023,
    status: 'Completed'
  }
];

export const INITIAL_EVENTS: ClubEvent[] = [];

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

// Official Rotary International wording.
export const OBJECTS_OF_ROTARY = [
  'The development of acquaintance as an opportunity for service.',
  'High ethical standards in business and professions; the recognition of the worthiness of all useful occupations; and the dignifying of each Rotarian’s occupation as an opportunity to serve society.',
  'The application of the ideal of service in each Rotarian’s personal, business, and community life.',
  'The advancement of international understanding, goodwill, and peace through a world fellowship of business and professional persons united in the ideal of service.'
];

export const FOUR_WAY_TEST = [
  { num: 1, q: 'Is it the TRUTH?', desc: 'We advocate for honesty and clarity in our reporting and communications.' },
  {
    num: 2,
    q: 'Is it FAIR to all concerned?',
    desc: 'We consult, listen, and partner with local community committees to guarantee equal resource distribution without bias.'
  },
  {
    num: 3,
    q: 'Will it build GOODWILL and BETTER FRIENDSHIPS?',
    desc: 'We bridge lines of profession and origin. Weekly meetings foster lifelong, collaborative friends unified by service.'
  },
  {
    num: 4,
    q: 'Will it be BENEFICIAL to all concerned?',
    desc: 'Our projects must leave a permanent, self-sustaining positive health, economic, or physical impact in Sierra Leone.'
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

export const INITIAL_MEMBER_DIRECTORY: UserProfile[] = [...FULL_MEMBER_LIST];

export const SOCIAL_LINKS = {
  facebook: 'https://www.facebook.com/profile.php?id=100071187714639',
  instagram: 'https://www.instagram.com/rcfsunset'
};
