import dotenvConfig from 'dotenv';
dotenvConfig.config();

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://ijnjntirgpqqdmhhmaft.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseKey) {
  console.error('❌ Error: VITE_SUPABASE_ANON_KEY / SUPABASE_ANON_KEY environment variable is not defined!');
  process.exit(1);
}

// Map key casing to lowercase to align with standard PostgreSQL folded identifiers (e.g., imageurl),
// and ensure every single record has uniform keys to satisfy PostgREST batch requirement (PGRST102)
const MAPPED_PROJECTS = [
  {
    id: 'proj_water_tombo',
    title: 'Water for Tombo Clean Well Initiative',
    category: 'Water, Sanitation, and Hygiene',
    description: 'Constructed three solar-powered borehole water wells and community wash facilities in the coastal fishing village of Tombo, providing direct clean water access and ending water-borne illness spikes.',
    year: 2024,
    impact: 'Provided drinkable water to over 5,000 residents and reduced health epidemics by 85%.',
    status: 'Completed',
    imageurl: 'https://images.unsplash.com/photo-1541816521319-ef3d45e5f6e8?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'proj_literacy_first',
    title: 'Literacy First Waterloo Libraries',
    category: 'Basic Education and Literacy',
    description: 'Refurbished local community libraries and delivered 4,500 curriculum-aligned textbooks, educational tablets, and teacher training programs in Waterloo and surrounding peri-urban communities.',
    year: 2025,
    impact: 'Rebuilt 2 libraries, benefitting 1,200 secondary students with a 40% rise in local reading scores.',
    status: 'Completed',
    imageurl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'proj_maternal_health',
    title: 'Safe Motherhood Delivery Kits',
    category: 'Maternal and Child Health',
    description: 'Providing sterile midwifery delivery kits, maternal supplements, and solar-power-equipped labor and delivery lamps to local clinics in Freetown’s underserved settlements.',
    year: 2026,
    impact: 'Distributed 1,500 clean birth kits and installed lighting systems in 5 labor clinics.',
    status: 'Active',
    imageurl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'proj_solar_power',
    title: 'Solar Cold Chain for Clinics',
    category: 'Disease Prevention and Treatment',
    description: 'Equipping three community health outposts with photovoltaic solar panels and medical-grade reefers to guarantee the secure preservation of vaccines and cold-sensitive pediatric treatments.',
    year: 2026,
    impact: 'Establishes continuous vaccine safety and diagnostics coverage for over 10,000 children.',
    status: 'Planning',
    imageurl: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'proj_lumley_clean',
    title: 'Sunset Mangrove & Coastal Care',
    category: 'Supporting the Environment',
    description: 'Coastal waste mitigation and reforestation of critical mangrove zones along Aberdeen and Lumley beach pathways, collaborating with local youth groups to tackle plastic waste.',
    year: 2025,
    impact: 'Planted 1,200 coastal mangrove seedlings and cleared 3.5 tons of plastic waste debris.',
    status: 'Completed',
    imageurl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=800'
  }
];

const MAPPED_EVENTS = [
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
    speaker: null, // Unified schema keys
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

async function seedData() {
  console.log('🌱 Starting database seeding script with unified PostgreSQL-friendly identifiers...');
  console.log(`📡 URLTarget: ${supabaseUrl}`);

  // 1. Projects Upsert
  console.log('\n📥 Seeding projects into Table [projects]...');
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/projects`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify(MAPPED_PROJECTS)
    });

    if (response.ok) {
      console.log('✅ Successfully seeded all projects!');
    } else {
      const errText = await response.text();
      console.error(`🔴 Projects inserting failed (${response.status}):`, errText);
    }
  } catch (err) {
    console.error('🔴 Connection failed while seeding projects:', err.message);
  }

  // 2. Events Upsert
  console.log('\n📥 Seeding events into Table [events]...');
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/events`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify(MAPPED_EVENTS)
    });

    if (response.ok) {
      console.log('✅ Successfully seeded all events!');
    } else {
      const errText = await response.text();
      console.error(`🔴 Events inserting failed (${response.status}):`, errText);
    }
  } catch (err) {
    console.error('🔴 Connection failed while seeding events:', err.message);
  }

  console.log('\n🏁 Seeding complete!');
}

seedData();
