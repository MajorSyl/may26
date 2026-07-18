import React, { useState, useEffect } from 'react';
import { 
  Compass, 
  ShieldCheck, 
  HelpCircle, 
  Heart, 
  ArrowRight, 
  CheckCircle, 
  Users, 
  Facebook, 
  ThumbsUp, 
  MessageSquare, 
  Share2, 
  ExternalLink, 
  Award, 
  Send,
  MessageCircle,
  Sparkles,
  Play,
  Pause,
  FileText,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getSiteSettings, SiteSettings, DEFAULT_SITE_SETTINGS, PageBlock, DEFAULT_HOME_LAYOUT } from '../supabase-service';
import { getDbProjects } from '../db-router';
import { Project } from '../types';
import MemberSpotlight from './MemberSpotlight';
import SafeImage from './SafeImage';
import heroConnectImage from '../assets/images/hero-connect.jpg';

interface HomeProps {
  onLearnMore: (tabId: string) => void;
}

interface FbPost {
  id: string;
  author: string;
  avatarInitials: string;
  timeAgo: string;
  content: string;
  imageUrl: string;
  likes: number;
  liked: boolean;
  shares: number;
  commentsCount: number;
  comments: {
    id: string;
    author: string;
    text: string;
    time: string;
  }[];
  showComments: boolean;
}

export default function Home({ onLearnMore }: HomeProps) {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [isVoicePlaying, setIsVoicePlaying] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    let active = true;
    getSiteSettings().then(res => {
      if (active) {
        setSettings(res);
      }
    });
    getDbProjects().then(res => {
      if (active) {
        setProjects(res);
      }
    });
    return () => { active = false; };
  }, []);

  // Pre-configured official looking facebook highlights from rcfsunset profile feed
  const [fbPosts, setFbPosts] = useState<FbPost[]>([
    {
      id: 'fb_post_toilets',
      author: 'Rotary Club of Freetown Sunset',
      avatarInitials: 'RFS',
      timeAgo: '2 days ago',
      content: '🚽 Landmark Sanitation Handover! Today, the Rotary Club of Freetown-Sunset officially completed and handed over the fully refurbished, clean, modern public bathroom block on Aberdeen Beach Road. This facility provides running water, solid hygiene fixtures, and reliable waste management for beach visitors and local traders. Together, we are keeping our coastline clean and healthy! 🇸🇱🤝 #WaterAndSanitation #AberdeenBeach #ServiceAboveSelf #RotaryInSierraLeone',
      imageUrl: '',
      likes: 189,
      liked: false,
      shares: 42,
      commentsCount: 3,
      comments: [
        { id: 'c1', author: 'Sahr John', text: 'Splendid intervention! Aberdeen beach road was in serious need of real sanitation facilities.', time: '1d ago' },
        { id: 'c2', author: 'Mariama Turay', text: 'This is what service above self really means. Real development!', time: '1d ago' },
        { id: 'c3', author: 'David V.', text: 'Superb project finish. Big congratulations from Rotary Germany!', time: '18h ago' }
      ],
      showComments: false
    },
    {
      id: 'fb_post_group_posing',
      author: 'Rotary Club of Freetown Sunset',
      avatarInitials: 'RFS',
      timeAgo: '3 days ago',
      content: '🇸🇱 Radiant fellowship and unity under the banner of Service Above Self! Here we are posing together at our West African Goodwill convention, feeling proud and magnificent in our vibrant coordinated African print garments and official partner Goodwill jute bags. Together, we continue to impact lives, foster international peace, and strengthen our local ties! 🌌✨ #RotarySunset #RotaryInternational #ServiceAboveSelf #FreetownSuperstars #AfricanFashionUnity',
      imageUrl: '',
      likes: 352,
      liked: true,
      shares: 88,
      commentsCount: 2,
      comments: [
        { id: 'c7', author: 'Yvonne Cole', text: 'Looking gorgeous and unified! This photo really captures our deep joy and bond.', time: '3d ago' },
        { id: 'c8', author: 'Alpha Jalloh', text: 'Stellar representation, Freetown Sunset! Keep soaring higher.', time: '2d ago' }
      ],
      showComments: false
    },
    {
      id: 'fb_post_gala',
      author: 'Rotary Club of Freetown Sunset',
      avatarInitials: 'RFS',
      timeAgo: '1 week ago',
      content: '🎉 Celebrating continuous service and solidarity! Highlights from our beautiful Annual Fundraising Dinner & Gala Banquet. From cutting our celebratory cake to securing funding commitments for upcoming borehole systems in marginalized sectors, it was an evening of friendship and generous hearts. Thank you to everyone who made this possible! 🍾🍰 #AnnualFundraiser #FreetownRotary #ServiceAboveSelf #RotarySunset',
      imageUrl: '',
      likes: 247,
      liked: false,
      shares: 58,
      commentsCount: 2,
      comments: [
        { id: 'c4', author: 'Patricia Cole', text: 'Stunning evening! Proud of the fellowship and alignment to help our communities.', time: '5d ago' },
        { id: 'c5', author: 'Alusine Bangura', text: 'A truly elegant night for a life-saving cause.', time: '4d ago' }
      ],
      showComments: false
    },
    {
      id: 'fb_post_fellowship',
      author: 'Rotary Club of Freetown Sunset',
      avatarInitials: 'RFS',
      timeAgo: '2 weeks ago',
      content: '🤝 A majestic sunset of fellowship and leadership synergy! Delightful joint evening meeting at our default weekly venue, the Lagoonda Hotel. We finalized funding blueprints for our upcoming solar borehole pipeline setups. Service meets action! Join us as a guest next Thursday or get in touch. 🌅 #WeeklySunsetFellowship #FreetownLeaders #RotaryGlobal',
      imageUrl: '',
      likes: 98,
      liked: false,
      shares: 14,
      commentsCount: 1,
      comments: [
        { id: 'c6', author: 'John Rogers', text: 'Excellent energy. Good to gather and align once again.', time: '1w ago' }
      ],
      showComments: false
    }
  ]);

  // Handle live toggle for post Likes
  const handleLikePost = (postId: string) => {
    setFbPosts(prev => prev.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          liked: !post.liked,
          likes: post.liked ? post.likes - 1 : post.likes + 1
        };
      }
      return post;
    }));
  };

  // Toggle comments expand panel
  const handleToggleComments = (postId: string) => {
    setFbPosts(prev => prev.map(post => {
      if (post.id === postId) {
        return { ...post, showComments: !post.showComments };
      }
      return post;
    }));
  };

  // Handle temporary copy share trigger
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const handleShareClick = (postId: string) => {
    const shareUrl = `https://www.facebook.com/profile.php?id=100071187714639`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopiedId(postId);
      setTimeout(() => setCopiedId(null), 2500);
    });
  };

  // State to hold the new custom inputs inside comment panels
  const [newCommentText, setNewCommentText] = useState<{ [postId: string]: string }>({});
  const handleAddComment = (postId: string, e: React.FormEvent) => {
    e.preventDefault();
    const txt = newCommentText[postId]?.trim();
    if (!txt) return;

    setFbPosts(prev => prev.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          commentsCount: post.commentsCount + 1,
          comments: [
            ...post.comments,
            {
              id: 'c_custom_' + Date.now(),
              author: 'You (Guest Visitor)',
              text: txt,
              time: 'Just now'
            }
          ]
        };
      }
      return post;
    }));

    setNewCommentText(prev => ({ ...prev, [postId]: '' }));
  };

  const getBgStyles = (bgColor: PageBlock['bgColor']) => {
    switch (bgColor) {
      case 'dark':
        return 'bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white border-b border-slate-900/50 shadow-inner';
      case 'slate':
        return 'bg-slate-50 text-slate-800 border-y border-slate-200/50';
      case 'brand':
        return 'bg-sky-50/40 text-slate-800 border-y border-sky-100/30';
      case 'gold':
        return 'bg-amber-50/30 text-slate-800 border-y border-amber-100/25';
      case 'light':
      default:
        return 'bg-white text-slate-850';
    }
  };

  // Safe parsing block of dynamic sequences
  let layout: PageBlock[] = DEFAULT_HOME_LAYOUT.filter(block => block.id !== 'stats' && block.id !== 'facebook');
  if (settings.homeLayout) {
    try {
      const parsed = JSON.parse(settings.homeLayout).filter((block: any) => block.id !== 'stats' && block.id !== 'facebook');
      const hasAboutUs = parsed.some((b: any) => b.id === 'about_us');
      const hasRecentProjects = parsed.some((b: any) => b.id === 'recent_projects');
      const hasMemberSpotlight = parsed.some((b: any) => b.id === 'member_spotlight');
      
      layout = [...parsed];
      if (!hasAboutUs) {
        const heroIdx = layout.findIndex(b => b.id === 'hero');
        layout.splice(heroIdx !== -1 ? heroIdx + 1 : 1, 0, { id: 'about_us', title: 'About Us & Fellowship', bgColor: 'light', visible: true });
      }
      if (!hasRecentProjects) {
        const aboutIdx = layout.findIndex(b => b.id === 'about_us');
        layout.splice(aboutIdx !== -1 ? aboutIdx + 1 : 2, 0, { id: 'recent_projects', title: 'Recent Completed Projects', bgColor: 'slate', visible: true });
      }
      if (!hasMemberSpotlight) {
        const projectIdx = layout.findIndex(b => b.id === 'recent_projects');
        layout.splice(projectIdx !== -1 ? projectIdx + 1 : 3, 0, { id: 'member_spotlight', title: 'Member Spotlight', bgColor: 'light', visible: true });
      }
    } catch (e) {
      layout = DEFAULT_HOME_LAYOUT.filter(block => block.id !== 'stats' && block.id !== 'facebook');
    }
  }

  // Segment renderer
  const renderBlock = (b: PageBlock) => {
    const bgStyles = getBgStyles(b.bgColor);
    const textStyle = b.bgColor === 'dark' ? 'text-white' : 'text-slate-800';
    const subtextStyle = b.bgColor === 'dark' ? 'text-slate-300' : 'text-slate-600';
    const glowNode = b.bgColor === 'dark' && (
      <div className="absolute inset-0 opacity-15 pointer-events-none">
        <div className="absolute top-10 left-10 w-96 h-96 rounded-full bg-rotary-azure filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-rotary-gold filter blur-3xl animate-pulse"></div>
      </div>
    );

    switch (b.id) {
      case 'hero':
        return (
          <section 
            key={b.id} 
            id="home-hero" 
            className="relative w-full overflow-hidden bg-white text-slate-800 border-b border-slate-200/50"
          >
            {/* Full-width image row spanning edge-to-edge with solid fill color to prevent cropping */}
            <div className="w-full bg-[#0A1128] flex items-center justify-center">
              <picture className="w-full block">
                <source srcSet={heroConnectImage} type="image/jpeg" />
                <img
                  src={heroConnectImage}
                  alt="Rotary Club of Freetown Sunset - Kerefay Loko MCHP Community Well dedication"
                  className="w-full h-auto max-h-[550px] object-contain object-center mx-auto"
                  referrerPolicy="no-referrer"
                  loading="eager"
                  fetchPriority="high"
                />
              </picture>
            </div>

            {/* Content section directly below the image */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 text-center space-y-6 md:space-y-8">
              <div className="space-y-3">
                <span className="inline-flex bg-rotary-azure/10 text-rotary-azure border border-rotary-azure/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest font-display">
                  Welcome to Freetown Sunset
                </span>
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold font-display tracking-tight text-[#00246B] leading-tight">
                  Fellowship, Integrity, and Direct Local Service
                </h1>
              </div>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-light max-w-2xl mx-auto">
                Founded on Freetown's beautiful shores, the <strong>Rotary Club of Freetown Sunset (RCFS)</strong> gathers a diverse cohort of passionate Sierra Leonean and international professionals. Sharing a deep devotion to community enrichment, we combine energetic fellowship with rigorous, hands-on humanitarian initiatives in local neighborhoods.
              </p>
              <div className="flex flex-wrap justify-center gap-4 pt-2">
                <button
                  id="hero-learn-more"
                  onClick={() => onLearnMore('about')}
                  className="px-5 py-2.5 bg-rotary-azure hover:bg-rotary-azure-dark text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center gap-2 font-display"
                >
                  <span>Read Our Core Values</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  id="hero-contact-officers"
                  onClick={() => onLearnMore('contact')}
                  className="px-5 py-2.5 bg-transparent hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-300 rounded-xl transition-all cursor-pointer font-display font-semibold text-xs uppercase tracking-wider"
                >
                  Contact Our Officers
                </button>
              </div>
            </div>
          </section>
        );

      case 'stats':
        return (
          <section key={b.id} className={`w-full py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-500 ${bgStyles}`}>
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs hover:shadow-md hover:-translate-y-1 hover:border-rotary-azure/20 transition-all duration-300 text-center flex flex-col justify-between text-slate-800">
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2 font-display">Residents Served</p>
                  <h3 className="text-4xl font-extrabold text-rotary-azure font-display leading-none">{settings.homeResidentsServed}</h3>
                  <span className="mt-4 inline-block px-2.5 py-1 bg-rotary-azure/10 text-rotary-azure text-[10px] font-bold rounded uppercase">Clean Water</span>
                </div>

                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs hover:shadow-md hover:-translate-y-1 hover:border-rotary-gold/20 transition-all duration-300 text-center flex flex-col justify-between text-slate-800">
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2 font-display">Resources Shipped</p>
                  <h3 className="text-4xl font-extrabold text-rotary-gold font-display leading-none">{settings.homeResourcesShipped}</h3>
                  <span className="mt-4 inline-block px-2.5 py-1 bg-rotary-gold/10 text-rotary-gold text-[10px] font-bold rounded uppercase">Literacy books</span>
                </div>

                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs hover:shadow-md hover:-translate-y-1 hover:border-indigo-200 transition-all duration-300 text-center flex flex-col justify-between text-slate-800">
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2 font-display">Maternal Delivery</p>
                  <h3 className="text-4xl font-extrabold text-indigo-600 font-display leading-none">{settings.homeMaternalKits}</h3>
                  <span className="mt-4 inline-block px-2.5 py-1 bg-indigo-50 text-indigo-700 text-[10px] font-bold rounded uppercase">Midwife Kits</span>
                </div>

                <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 text-center flex flex-col justify-between relative overflow-hidden">
                  <div className="relative z-10 space-y-1">
                    <p className="text-indigo-300 text-[10px] font-bold uppercase tracking-wider mb-2 font-display">Financial Trail</p>
                    <h3 className="text-4xl font-extrabold text-rotary-gold font-display leading-none">{settings.homeFinancingAudit}</h3>
                    <span className="mt-4 inline-block px-2.5 py-1 bg-slate-800 text-rotary-gold text-[10px] font-bold rounded uppercase">Direct Project Funding</span>
                  </div>
                  <div className="absolute bottom-[-30%] right-[-15%] w-32 h-32 bg-rotary-gold/20 rounded-full blur-2xl"></div>
                </div>
              </div>
            </div>
          </section>
        );

      case 'mission':
        return (
          <section key={b.id} className={`w-full py-16 px-4 sm:px-6 lg:px-8 transition-colors duration-500 ${bgStyles}`}>
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-6 text-slate-800">
                <div className="space-y-4">
                  <div className="inline-flex bg-rotary-azure/10 text-rotary-azure px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider font-display">
                    The Sunset Mission
                  </div>
                  <h2 className="text-3xl font-extrabold font-display text-rotary-dark tracking-tight leading-snug whitespace-pre-wrap">
                    {settings.homeMissionTitle}
                  </h2>
                  <p className="text-slate-500 text-sm leading-relaxed whitespace-pre-wrap font-light">
                    {settings.homeMissionBody1}
                  </p>
                  <p className="text-slate-500 text-sm leading-relaxed whitespace-pre-wrap font-light">
                    {settings.homeMissionBody2}
                  </p>
                </div>
                <div className="pt-2">
                  <button
                    id="learn-more-about-btn"
                    onClick={() => onLearnMore('about')}
                    className="inline-flex items-center gap-2 text-rotary-azure hover:text-rotary-gold font-bold font-display text-sm transition-colors cursor-pointer"
                  >
                    Explore Our Story & Ethics
                    <ArrowRight className="h-4.5 w-4.5" />
                  </button>
                </div>
              </div>

              {/* Dynamic decorative widgets resembling Sierra Leone's natural beauty and work */}
              <div className="grid grid-cols-1 gap-4 text-slate-800">
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-start gap-4">
                  <div className="p-3 bg-indigo-550/10 rounded-2xl text-indigo-650 shadow-xs shrink-0">
                    <Compass className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="text-[10px] bg-indigo-50 text-indigo-750 font-bold px-2 py-0.5 rounded uppercase font-display">LUMLEY WATER</span>
                    <h4 className="font-extrabold font-display text-slate-805 mt-1">{settings.homeServiceValueTitle1}</h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed font-light">{settings.homeServiceValueBody1}</p>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-start gap-4">
                  <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600 shadow-xs shrink-0">
                    <CheckCircle className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded uppercase font-display">THE 4-WAY TEST</span>
                    <h4 className="font-extrabold font-display text-slate-805 mt-1">{settings.homeServiceValueTitle2}</h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed font-light">{settings.homeServiceValueBody2}</p>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-start gap-4">
                  <div className="p-3 bg-amber-50 rounded-2xl text-[#EAB308] shadow-xs shrink-0">
                    <Users className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="text-[10px] bg-amber-50 text-amber-700 font-bold px-2 py-0.5 rounded uppercase font-display">COAST FELLOWSHIP</span>
                    <h4 className="font-extrabold font-display text-slate-805 mt-1">{settings.homeServiceValueTitle3}</h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed font-light">{settings.homeServiceValueBody3}</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        );

      case 'facebook':
        return (
          <section key={b.id} className={`py-16 px-4 sm:px-6 lg:px-8 border-y relative overflow-hidden transition-colors duration-500 ${bgStyles}`}>
            {/* Decorative dynamic ripples */}
            <div className="absolute top-[-20%] right-[5%] w-96 h-96 bg-sky-100/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-[-15%] left-[-5%] w-80 h-80 bg-amber-50/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="max-w-7xl mx-auto space-y-12 relative z-10">
              {/* Header Title with Official Badge */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 bg-[#1877F2]/10 text-[#1877F2] font-bold px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-display border border-[#1877F2]/25">
                    <Facebook className="w-3.5 h-3.5 fill-current" />
                    <span>Interact On Facebook</span>
                  </div>
                  <h2 className={`text-3xl font-extrabold font-display tracking-tight leading-snug ${textStyle}`}>
                    Community Hub & Live Activity
                  </h2>
                  <p className={`text-xs font-light max-w-xl ${subtextStyle}`}>
                    Stay updated on Sunset Club field deployments, child wellness, and beachfront campaigns directly from our verified Facebook page footprint.
                  </p>
                </div>

                <a 
                  href="https://www.facebook.com/profile.php?id=100071187714639" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  id="fb-hub-full-btn"
                  className="inline-flex items-center gap-2 bg-[#1877F2] hover:bg-[#1565C0] text-white font-bold py-3 px-6 rounded-2xl text-xs uppercase tracking-wider shadow-sm hover:shadow-lg transition-all shrink-0 active:scale-95 cursor-pointer"
                >
                  <span>Follow Our Facebook Profile</span>
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>

              {/* Social feed Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* LEFT COLUMN: Facebook Activity Feeds (8 Spans) */}
                <div className="lg:col-span-8 space-y-6">
                  {fbPosts.map((post) => {
                    const isVoicePost = post.id === 'fb_post_fellowship';
                    const isPdfPost = post.id === 'fb_post_maternal';

                    return (
                      <div 
                        key={post.id}
                        id={`fb-item-${post.id}`}
                        className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden text-slate-800"
                      >
                        {/* Author Header */}
                        <div className="p-4 sm:p-5 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {/* Avatar sphere */}
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-rotary-dark to-rotary-azure text-white flex items-center justify-center font-bold text-xs shadow-inner uppercase font-display">
                              {post.avatarInitials}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <h4 className="font-extrabold text-sm text-slate-800 tracking-tight leading-none">{post.author}</h4>
                                <span className="w-4 h-4 bg-[#0056e3] rounded-full text-white flex items-center justify-center text-[8px] font-black" title="Verified Organization">
                                  ✓
                                </span>
                              </div>
                              <span className="text-[10px] text-slate-400 font-medium">{post.timeAgo} • Freetown, SL</span>
                            </div>
                          </div>

                          <a 
                            href="https://www.facebook.com/profile.php?id=100071187714639" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="p-2 text-slate-400 hover:text-[#0056e3] rounded-full hover:bg-slate-50 transition-colors"
                            title="View original post"
                          >
                            <Facebook className="w-4 h-4" />
                          </a>
                        </div>

                        {/* Post Content text */}
                        <div className="px-5 pb-4 text-xs text-slate-600 leading-relaxed font-normal font-sans">
                          {post.content}
                        </div>

                        {/* Interactive Sound Wave Player adapted for the Fellowship meeting post */}
                        {isVoicePost && (
                          <div className="px-5 pb-6">
                            <div className="bg-[#f3f4f6] rounded-[24px] p-4 flex items-center justify-between gap-4 border border-slate-100/50 shadow-inner">
                              
                              {/* Play/Pause CTA trigger */}
                              <button 
                                onClick={() => setIsVoicePlaying(!isVoicePlaying)}
                                className="w-11 h-11 bg-[#0056e3] hover:bg-opacity-90 rounded-full flex items-center justify-center cursor-pointer transition-all duration-150 shadow-xs text-white shrink-0 active:scale-95"
                                title={isVoicePlaying ? "Pause Audio Summary" : "Play Sunset Voice Summary"}
                              >
                                {isVoicePlaying ? (
                                  <Pause className="h-4.5 w-4.5 fill-current" />
                                ) : (
                                  <Play className="h-4.5 w-4.5 fill-current ml-0.5" />
                                )}
                              </button>

                              {/* Sound waveform simulator representing varying sound levels */}
                              <div className="flex items-end gap-[3px] flex-1 h-12 px-2 select-none overflow-hidden">
                                {[
                                  18, 24, 10, 32, 45, 14, 28, 38, 52, 20, 16, 36, 44, 12, 
                                  26, 48, 58, 16, 30, 42, 50, 24, 14, 34, 46, 22, 18, 30
                                ].map((height, barIdx) => {
                                  // Animate waves nicely if audio summary is playing
                                  const animStyle = isVoicePlaying 
                                    ? { 
                                        animation: `ripple 0.6s ease-in-out infinite alternate`, 
                                        animationDelay: `${barIdx * 0.04}s`,
                                        height: `${height * 0.8}px`
                                      } 
                                    : { height: `${height * 0.5 + 4}px` };

                                  return (
                                    <div 
                                      key={barIdx} 
                                      className={`w-[3px] rounded-full transition-all duration-305 ${
                                        isVoicePlaying 
                                          ? 'bg-[#0056e3]' 
                                          : 'bg-slate-300'
                                      }`}
                                      style={animStyle}
                                    />
                                  );
                                })}
                              </div>

                              {/* Member Status & Timestamp metadata */}
                              <div className="flex flex-col items-end shrink-0 text-right">
                                {/* Profile Avatar badge inside the audio wave message overlay */}
                                <div className="flex items-center gap-1">
                                  <div className="w-5 h-5 rounded-full border border-white shrink-0 overflow-hidden flex items-center justify-center bg-rotary-azure text-white font-extrabold text-[8px] font-display">
                                    MA
                                  </div>
                                  {/* Double Check Delivered Icon Indicator */}
                                  <div className="flex text-[#0056e3]">
                                    <Check className="h-3 w-3 -mr-1" />
                                    <Check className="h-3 w-3" />
                                  </div>
                                </div>
                                <span className="text-[9px] font-bold text-slate-500 font-mono mt-0.5 leading-none">
                                  {isVoicePlaying ? "0:14 / 0:40" : "0:40"}
                                </span>
                              </div>

                            </div>
                          </div>
                        )}

                        {/* Interactive Delivered PDF Card Block adapted (Safe Motherhood guidelines) */}
                        {isPdfPost && (
                          <div className="px-5 pb-5 space-y-3">
                            {/* Crisp PDF Description Segment styled as a self-contained card */}
                            <div className="bg-[#f3f4f6] rounded-[20px] p-4 flex items-center justify-between gap-4 border border-slate-150">
                              <div className="flex items-center gap-3.5 min-w-0">
                                {/* Red Crimson PDF Icon Symbol */}
                                <div className="w-10 h-10 bg-rose-500 rounded-xl text-white font-extrabold text-[11px] flex flex-col items-center justify-center shrink-0 shadow-sm font-display tracking-wider">
                                  <FileText className="h-4.5 w-4.5 mt-0.5 text-white" />
                                  <span className="text-[8px] leading-none mt-0.5">PDF</span>
                                </div>

                                {/* File Text Name metadata description */}
                                <div className="min-w-0">
                                  <h4 className="text-[13px] font-bold text-slate-800 leading-tight truncate">
                                    Safe_Motherhood_Midwifery_Deployment_Brief_2026.pdf
                                  </h4>
                                  <p className="text-[10px] text-slate-400 font-medium font-sans mt-0.5 leading-none">
                                    8 pages • 1.9 MB • Delivered Blueprint
                                  </p>
                                </div>
                              </div>

                              {/* Checklist Delivered Indicator Status */}
                              <div className="flex flex-col items-end shrink-0">
                                <div className="flex text-[#0056e3]" title="Delivered and Read by Club">
                                  <Check className="h-3.5 w-3.5 -mr-1" />
                                  <Check className="h-3.5 w-3.5" />
                                </div>
                                <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider mt-1 opacity-75">SENT</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Normal cover image removed as requested */}

                        {/* Interaction Counter stats */}
                        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-semibold select-none">
                        <div className="flex items-center gap-1">
                          <span className="w-5 h-5 bg-[#1877F2] rounded-full text-white flex items-center justify-center text-[10px] shadow-sm">
                            👍
                          </span>
                          <span>{post.likes} Rotarians Like this</span>
                        </div>

                        <div className="flex gap-4">
                          <button 
                            onClick={() => handleToggleComments(post.id)}
                            className="hover:underline cursor-pointer"
                          >
                            {post.commentsCount} comments
                          </button>
                          <span>{post.shares} shares</span>
                        </div>
                      </div>

                      {/* Interactive Button Bar */}
                      <div className="px-3 py-1.5 bg-slate-50 border-b border-slate-100 grid grid-cols-3 gap-2 text-xs font-bold text-slate-605 select-none">
                        <button 
                          onClick={() => handleLikePost(post.id)}
                          className={`py-2 px-3 hover:bg-slate-150 rounded-xl flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer ${
                            post.liked ? 'text-[#1877F2]' : ''
                          }`}
                        >
                          <ThumbsUp className={`h-4 w-4 ${post.liked ? 'fill-[#1877F2]' : ''}`} />
                          <span>Like</span>
                        </button>

                        <button 
                          onClick={() => handleToggleComments(post.id)}
                          className="py-2 px-3 hover:bg-slate-150 rounded-xl flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                        >
                          <MessageSquare className="h-4 w-4" />
                          <span>Comment</span>
                        </button>

                        <button 
                          onClick={() => handleShareClick(post.id)}
                          className="py-2 px-3 hover:bg-slate-150 rounded-xl flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer text-slate-600"
                        >
                          <Share2 className="h-4 w-4" />
                          <span>{copiedId === post.id ? 'Copied' : 'Share'}</span>
                        </button>
                      </div>

                      {/* Comments Expand Area */}
                      <AnimatePresence>
                        {post.showComments && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="bg-slate-50/50 overflow-hidden"
                          >
                            <div className="p-4 space-y-4 border-b border-slate-100 max-h-60 overflow-y-auto">
                              {post.comments.map(c => (
                                <div key={c.id} className="flex gap-3 text-xs items-start bg-white p-3 rounded-2xl border border-slate-100 shadow-3xs">
                                  <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-[10px] shrink-0">
                                    {c.author.substring(0,2).toUpperCase()}
                                  </div>
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2 border-b border-slate-50 pb-0.5 w-full">
                                      <span className="font-extrabold text-slate-800 leading-none">{c.author}</span>
                                      <span className="text-[9px] text-slate-400 font-mono leading-none">{c.time}</span>
                                    </div>
                                    <p className="text-slate-650 font-light leading-relaxed font-sans">{c.text}</p>
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Add Guest Comment Form */}
                            <form 
                              onSubmit={(e) => handleAddComment(post.id, e)}
                              className="p-3.5 bg-slate-50 flex gap-2"
                            >
                              <input 
                                value={newCommentText[post.id] || ''}
                                onChange={(e) => setNewCommentText(prev => ({ ...prev, [post.id]: e.target.value }))}
                                type="text" 
                                placeholder="Write a supportive public comment..."
                                className="flex-1 bg-white border border-slate-250 px-3.5 py-1.5 rounded-xl text-xs focus:ring-1 focus:ring-[#1877F2] focus:outline-none"
                              />
                              <button 
                                type="submit"
                                className="bg-[#1877F2] hover:bg-[#1565C0] text-white p-2 px-3.5 rounded-xl text-xs font-bold font-display cursor-pointer transition-colors"
                              >
                                <Send className="h-3.5 w-3.5 text-white" />
                              </button>
                            </form>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )})}
                </div>

                {/* RIGHT COLUMN: Desktop Info box (4 Spans) */}
                <div className="lg:col-span-4 space-y-6 text-slate-800">
                  
                  {/* Join Us info card */}
                  <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm space-y-4">
                    <span className="inline-flex bg-rotary-gold/15 text-rotary-gold px-2.5 py-0.5 rounded text-[10px] uppercase font-black font-display leading-tight border border-rotary-gold/20">Meeting Schedule</span>
                    <h3 className="text-base font-extrabold text-slate-850 font-display">Fellowship & Synergy</h3>
                    <p className="text-xs text-slate-500 leading-relaxed font-light">
                      The Rotary Club of Freetown Sunset gathers weekly at the Lagoonda Hotel in Freetown. 
                    </p>
                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl text-[11px] font-medium text-slate-650 space-y-1">
                      <div className="flex justify-between">
                        <span>Meeting Day:</span>
                        <span className="font-extrabold text-slate-800 text-right">Every Thursday</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Time:</span>
                        <span className="font-extrabold text-slate-800 text-right">7:00 PM - 8:30 PM SLST</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Venue:</span>
                        <span className="font-extrabold text-slate-850 text-right">Lagoonda Hotel, Aberdeen</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => onLearnMore('events')}
                      className="w-full py-2.5 bg-slate-105 hover:bg-slate-200 text-slate-700 font-bold font-display text-[10px] uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 border border-slate-200"
                    >
                      <span>Examine Upcoming Calendar</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Rotary International Statement box */}
                  <div className="bg-gradient-to-tr from-[#1E3A8A] to-[#0D9488] p-6 rounded-3xl text-white space-y-3 relative overflow-hidden">
                    <div className="relative z-10 space-y-2">
                      <span className="text-[9px] bg-white/20 text-white px-2 py-0.5 rounded uppercase font-black tracking-widest leading-none">Global Network</span>
                      <h4 className="font-bold text-xs font-display">Rotary District 9101</h4>
                      <p className="text-[11px] leading-relaxed text-slate-100 font-light">
                        Sunset Rotarians are connected to 1.4 million members globally. We implement international grants to deliver healthcare, schools, and sanitation directly to local Sierra Leone communities.
                      </p>
                    </div>
                    <div className="absolute top-[-30%] left-[-20%] w-24 h-24 bg-white/10 rounded-full blur-xl animate-pulse"></div>
                    <div className="absolute bottom-[-30%] right-[-10%] w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl"></div>
                  </div>

                </div>
              </div>
            </div>
          </section>
        );

      case 'announcements':
        return (
          <section key={b.id} className={`py-16 px-4 sm:px-6 lg:px-8 transition-colors duration-500 ${bgStyles}`}>
            <div className="max-w-7xl mx-auto space-y-8">
              <div className="text-center space-y-2">
                <div className="text-xs font-semibold uppercase tracking-wider text-rotary-azure font-display">Announcements</div>
                <h2 className={`text-3xl font-bold font-display text-rotary-dark ${textStyle}`}>Latest News from Sunset</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4 relative overflow-hidden text-slate-800">
                  <span className="inline-block bg-rotary-gold/10 text-rotary-gold text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded">June Meeting Highlights</span>
                  <h3 className="text-lg font-bold text-slate-800 leading-snug">Hosting Dr. David Sengeh</h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-light">
                    Our upcoming meeting at the Lagoonda Hotel will feature a presentation by Sierra Leone's leading educational and tech innovator, discussing customized solutions for school reading materials in outer Freetown.
                  </p>
                  <button onClick={() => onLearnMore('events')} className="text-xs font-bold text-rotary-azure hover:text-rotary-gold flex items-center gap-1 font-display cursor-pointer">
                    RSVP for Meeting <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4 relative overflow-hidden text-slate-800">
                  <span className="inline-block bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded">Environmental Care</span>
                  <h3 className="text-lg font-bold text-slate-800 leading-snug">Planted over 1,000 mangrove seedlings</h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-light">
                    Sunset Coastal volunteers successfully clean beach zones and seed mangrove paths near Aberdeen. The system provides immediate protection from tidal erosion and increases wildlife return files.
                  </p>
                  <button onClick={() => onLearnMore('gallery')} className="text-xs font-bold text-rotary-azure hover:text-rotary-gold flex items-center gap-1 font-display cursor-pointer">
                    Examine Gallery <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </section>
        );

      case 'member_spotlight':
        return <MemberSpotlight key={b.id} />;

      case 'about_us':
        return (
          <section key={b.id} id="home-about" className={`py-16 px-4 sm:px-6 lg:px-8 border-y border-slate-105 relative overflow-hidden transition-colors duration-500 ${bgStyles}`}>
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="space-y-2">
                <span className="inline-flex bg-rotary-azure/10 text-rotary-azure border border-rotary-azure/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest font-display">
                  About Our Club
                </span>
                <h2 className={`text-3xl sm:text-4xl font-extrabold font-display tracking-tight leading-snug ${textStyle}`}>
                  Our Vision, Heritage & Global Action
                </h2>
              </div>
              
              <p className={`text-sm leading-relaxed font-light ${subtextStyle}`}>
                Using the core guidelines of Rotary International and our District 9101, our actions focus on pioneering clean solar water access, distributing vital maternal clinical resources, maintaining educational libraries, and running beach reforestation efforts. We turn values into durable, local infrastructure for Freetown.
              </p>
              <p className={`text-sm leading-relaxed font-light ${subtextStyle}`}>
                Our club offers an intellectual platform for values-driven professionals, creating synergy for systemic local improvements. Through active partnership with international donor clubs, we secure lasting resources to cultivate health, clean water security, and youth literacy.
              </p>

              <div className="pt-2 flex flex-wrap gap-4">
                <button
                  id="home-about-learn-more"
                  onClick={() => onLearnMore('about')}
                  className="px-5 py-2.5 bg-rotary-azure hover:bg-rotary-azure-dark text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center gap-2 font-display"
                >
                  <span>Explore Our History</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  id="home-about-contact"
                  onClick={() => onLearnMore('contact')}
                  className="px-5 py-2.5 bg-transparent hover:bg-slate-100/10 text-slate-700 hover:text-slate-900 border border-slate-350 rounded-xl transition-all cursor-pointer font-display font-semibold text-xs uppercase tracking-wider"
                >
                  Contact Our Officers
                </button>
              </div>
            </div>
          </section>
        );

      case 'recent_projects': {
        const completedProjects = projects
          .filter(p => p.status === 'Completed')
          .slice(0, 3);

        return (
          <section key={b.id} id="home-recent-projects" className={`py-16 px-4 sm:px-6 lg:px-8 border-y border-slate-105 relative overflow-hidden transition-colors duration-500 ${bgStyles}`}>
            <div className="max-w-7xl mx-auto space-y-12">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                  <span className="inline-flex bg-rotary-gold/15 text-rotary-gold-dark border border-rotary-gold/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest font-display">
                    Pioneering Action
                  </span>
                  <h2 className={`text-3xl sm:text-4xl font-extrabold font-display tracking-tight leading-snug ${textStyle}`}>
                    Recent Completed Projects
                  </h2>
                  <p className={`text-xs max-w-xl font-light ${subtextStyle}`}>
                    Take an authentic look at our recently accomplished civic campaigns in Tombo, Waterloo, and Aberdeen beach zones, proving our model of fully self-sustaining grassroots installations.
                  </p>
                </div>

                <button
                  id="view-all-projects"
                  onClick={() => onLearnMore('gallery')}
                  className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-250 font-bold py-3 px-6 rounded-2xl text-xs uppercase tracking-wider transition-all cursor-pointer active:scale-95 shadow-2xs font-display"
                >
                  <span>Examine All Projects</span>
                  <ExternalLink className="h-4 w-4" />
                </button>
              </div>

              {/* Grid of completed projects */}
              {completedProjects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 lg:gap-8">
                  {completedProjects.map((project) => (
                    <div 
                      key={project.id}
                      id={`project-card-${project.id}`}
                      className="bg-white rounded-3xl border border-slate-200 hover:border-rotary-azure/30 shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col h-full text-slate-850"
                    >
                      {/* Content Area with date badge inside */}
                      <div className="p-6 flex-grow flex flex-col justify-between space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-rotary-azure font-bold font-display uppercase tracking-widest block">
                              {project.category}
                            </span>
                            <span className="bg-emerald-500 text-white font-extrabold px-2.5 py-0.5 rounded-full text-[9px] uppercase tracking-wider shadow-2xs">
                              Completed • {project.year}
                            </span>
                          </div>
                          <h3 className="text-base font-extrabold text-slate-850 leading-snug line-clamp-2 pt-1">
                            {project.title}
                          </h3>
                          <p className="text-xs text-slate-500 font-normal leading-relaxed line-clamp-4">
                            {project.description}
                          </p>
                        </div>

                        {/* Impact Stat Banner */}
                        {project.impact && (
                          <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100 text-emerald-800 space-y-1 mt-auto">
                            <span className="text-[8px] font-bold uppercase tracking-wider text-emerald-600 block">Project Community Impact</span>
                            <p className="text-[11px] leading-relaxed font-light">{project.impact}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-slate-50 rounded-3xl p-12 border border-dashed border-slate-250 text-center text-slate-400">
                  <p className="text-sm">No completed projects returned from public lists.</p>
                </div>
              )}
            </div>
          </section>
        );
      }

      default:
        return null;
    }
  };

  return (
    <div className="space-y-4 pb-24 select-none">
      {layout
        .filter(b => b.visible !== false)
        .map(b => renderBlock(b))}
    </div>
  );
}
