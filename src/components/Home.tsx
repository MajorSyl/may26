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
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getSiteSettings, SiteSettings, DEFAULT_SITE_SETTINGS } from '../supabase-service';

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

  useEffect(() => {
    let active = true;
    getSiteSettings().then(res => {
      if (active) {
        setSettings(res);
      }
    });
    return () => { active = false; };
  }, []);

  // Pre-configured official looking facebook highlights from rcfsunset profile feed
  const [fbPosts, setFbPosts] = useState<FbPost[]>([
    {
      id: 'fb_post_mangroves',
      author: 'Rotary Club of Freetown Sunset',
      avatarInitials: 'RFS',
      timeAgo: '2 days ago',
      content: '🌊 Coastal Environmental Action! Sunset Coastal volunteers successfully planted over 1,200 protective mangrove seedlings and cleaned up critical plastic debris near Aberdeen beach. Preserving Freetown\'s majestic coastlines is our shared duty, protecting marine biodiversity and curbing soil erosion. High-five to our youth service partners! 🌱 #ServiceAboveSelf #RotarySunset #SierraLeone #FocusOnEnvironment',
      imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=800',
      likes: 124,
      liked: false,
      shares: 32,
      commentsCount: 3,
      comments: [
        { id: 'c1', author: 'Sahr John', text: 'Stellar effort team! Aberdeen estuary has been needing this intervention so badly.', time: '1d ago' },
        { id: 'c2', author: 'Mariama Turay', text: 'Proud to see our local Rotary taking absolute lead on climate resilience.', time: '1d ago' },
        { id: 'c3', author: 'David V.', text: 'Inspiring work! Greets from Rotary Club Munich.', time: '18h ago' }
      ],
      showComments: false
    },
    {
      id: 'fb_post_maternal',
      author: 'Rotary Club of Freetown Sunset',
      avatarInitials: 'RFS',
      timeAgo: '1 week ago',
      content: '🤰 Saving lives in underserved Freetown areas. This week, we completed our flagship Safe Motherhood delivery, shipping 1,500 midwifery birth kits and critical supplies to maternal health clinics. Special praise to the medical officers who worked around the clock with us! ☀️👶 #MaternalHealth #HealthyMoms #RotaryInvests #FreetownCare',
      imageUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=800',
      likes: 247,
      liked: false,
      shares: 58,
      commentsCount: 2,
      comments: [
        { id: 'c4', author: 'Dr. Evelyn Cole', text: 'The birth kits are already in use. Thank you Sunset Rotarians for safeguarding mothers.', time: '5d ago' },
        { id: 'c5', author: 'Alusine Bangura', text: 'True grassroots contribution. District 9101 is proud.', time: '4d ago' }
      ],
      showComments: false
    },
    {
      id: 'fb_post_fellowship',
      author: 'Rotary Club of Freetown Sunset',
      avatarInitials: 'RFS',
      timeAgo: '2 weeks ago',
      content: '🤝 A majestic sunset of fellowship and leadership synergy! Delightful joint evening meeting at the Radisson Blu Mammy Yoko. We finalized funding blueprints for our upcoming solar borehole pipeline setups. Service meets action! Join us as a guest next Thursday or get in touch. 🌅 #WeeklySunsetFellowship #FreetownLeaders #RotaryGlobal',
      imageUrl: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&q=80&w=800',
      likes: 98,
      liked: false,
      shares: 14,
      commentsCount: 1,
      comments: [
        { id: 'c6', author: 'John Rogers', text: 'Wonderful atmosphere. Looking forward to attending next month.', time: '1w ago' }
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

  return (
    <div className="space-y-16 pb-24 select-none">
      
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-br from-rotary-dark via-slate-800 to-slate-900 text-white py-24 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 opacity-15">
          <div className="absolute top-10 left-10 w-96 h-96 rounded-full bg-rotary-azure filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-rotary-gold filter blur-3xl animate-pulse"></div>
        </div>
        
        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-8">
          <motion.div 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 bg-rotary-gold/20 border border-rotary-gold/30 px-4 py-1.5 rounded-full text-rotary-gold text-xs font-semibold tracking-wider uppercase font-display"
          >
            <ShieldCheck className="h-4 w-4 text-rotary-gold" />
            {settings.homeHeroBadge}
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold font-display tracking-tight text-white"
          >
            {settings.homeHeroTitle}
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-2xl mx-auto text-lg sm:text-xl text-slate-300 font-light leading-relaxed whitespace-pre-wrap"
          >
            {settings.homeHeroSubtitle}
          </motion.p>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="pt-4 flex flex-col sm:flex-row justify-center items-center gap-4 animate-fade-in"
          >
            <button
              id="cta-gallery-btn"
              onClick={() => onLearnMore('gallery')}
              className="w-full sm:w-auto px-8 py-3.5 bg-rotary-azure hover:bg-rotary-azure/90 text-white font-semibold font-display rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer"
            >
              Examine Our Impact
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              id="cta-get-involved-btn"
              onClick={() => onLearnMore('get-involved')}
              className="w-full sm:w-auto px-8 py-3.5 bg-transparent hover:bg-white/10 text-white border-2 border-slate-500 font-semibold font-display rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              Partner or Sponsor
            </button>
          </motion.div>
        </div>
      </section>

      {/* 2. VALUE STATEMENTS / NUMBERS IN BRIEF */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow transition-all text-center flex flex-col justify-between">
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2 font-display">Residents Served</p>
            <h3 className="text-4xl font-extrabold text-rotary-azure font-display">{settings.homeResidentsServed}</h3>
            <span className="mt-3 inline-block px-2.5 py-1 bg-rotary-azure/10 text-rotary-azure text-[10px] font-bold rounded uppercase">Clean Water</span>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow transition-all text-center flex flex-col justify-between">
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2 font-display">Resources Shipped</p>
            <h3 className="text-4xl font-extrabold text-rotary-gold font-display">{settings.homeResourcesShipped}</h3>
            <span className="mt-3 inline-block px-2.5 py-1 bg-rotary-gold/10 text-rotary-gold text-[10px] font-bold rounded uppercase">Literacy books</span>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow transition-all text-center flex flex-col justify-between">
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2 font-display">Maternal Delivery</p>
            <h3 className="text-4xl font-extrabold text-indigo-600 font-display">{settings.homeMaternalKits}</h3>
            <span className="mt-3 inline-block px-2.5 py-1 bg-indigo-50 text-indigo-700 text-[10px] font-bold rounded uppercase">Midwife Kits</span>
          </div>

          <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 shadow-md text-center flex flex-col justify-between relative overflow-hidden">
            <div className="relative z-10 space-y-1">
              <p className="text-indigo-300 text-[10px] font-bold uppercase tracking-wider mb-2 font-display">Financial Trail</p>
              <h3 className="text-4xl font-extrabold text-rotary-gold font-display">{settings.homeFinancingAudit}</h3>
              <span className="mt-3 inline-block px-2.5 py-1 bg-slate-800 text-rotary-gold text-[10px] font-bold rounded uppercase">Direct Project Funding</span>
            </div>
            <div className="absolute bottom-[-40%] right-[-20%] w-32 h-32 bg-rotary-gold/20 rounded-full blur-2xl"></div>
          </div>
        </div>
      </section>

      {/* 3. WHO WE ARE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="inline-flex bg-rotary-azure/10 text-rotary-azure px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider font-display">
              The Sunset Mission
            </div>
            <h2 className="text-3xl font-extrabold font-display text-rotary-dark tracking-tight leading-snug whitespace-pre-wrap">
              {settings.homeMissionTitle}
            </h2>
            <p className="text-slate-500 text-sm leading-relaxed whitespace-pre-wrap">
              {settings.homeMissionBody1}
            </p>
            <p className="text-slate-500 text-sm leading-relaxed whitespace-pre-wrap">
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

        {/* Dynamic decorative widget resembling Sierra Leone's natural beauty and work */}
        <div className="grid grid-cols-1 gap-4">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-start gap-4">
            <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600 shadow-xs shrink-0">
              <Compass className="h-6 w-6" />
            </div>
            <div>
              <span className="text-[10px] bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded uppercase font-display">LUMLEY WATER</span>
              <h4 className="font-extrabold font-display text-slate-800 mt-1">{settings.homeServiceValueTitle1}</h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">{settings.homeServiceValueBody1}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-start gap-4">
            <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600 shadow-xs shrink-0">
              <CheckCircle className="h-6 w-6" />
            </div>
            <div>
              <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded uppercase font-display font-display">THE 4-WAY TEST</span>
              <h4 className="font-extrabold font-display text-slate-800 mt-1">{settings.homeServiceValueTitle2}</h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">{settings.homeServiceValueBody2}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-start gap-4">
            <div className="p-3 bg-amber-50 rounded-2xl text-[#EAB308] shadow-xs shrink-0">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <span className="text-[10px] bg-amber-50 text-amber-700 font-bold px-2 py-0.5 rounded uppercase font-display">COAST FELLOWSHIP</span>
              <h4 className="font-extrabold font-display text-slate-800 mt-1">{settings.homeServiceValueTitle3}</h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">{settings.homeServiceValueBody3}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FACEBOOK INTERACTIVE DYNAMIC HUB */}
      <section className="bg-slate-100/50 py-16 px-4 sm:px-6 lg:px-8 border-y border-slate-200 relative overflow-hidden">
        {/* Decorative dynamic bubbles */}
        <div className="absolute top-[-20%] right-[5%] w-96 h-96 bg-brand-fb/5 bg-sky-100 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-[-15%] left-[-5%] w-80 h-80 bg-gold/5 bg-amber-50 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto space-y-12 relative z-10">
          
          {/* Header Title with Official Badge */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 bg-[#1877F2]/10 text-[#1877F2] font-bold px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-display border border-[#1877F2]/20">
                <Facebook className="w-3.5 h-3.5 fill-current" />
                <span>Interact On Facebook</span>
              </div>
              <h2 className="text-3xl font-extrabold font-display text-slate-800 tracking-tight leading-snug">
                Community Hub & Live Activity
              </h2>
              <p className="text-xs text-slate-500 font-light max-w-xl">
                Stay updated on Sunset Club field deployments, child wellness, and beachfront campaigns directly from our verified Facebook page footprint.
              </p>
            </div>

            <a 
              href="https://www.facebook.com/profile.php?id=100071187714639" 
              target="_blank" 
              rel="noopener noreferrer"
              id="fb-hub-full-btn"
              className="inline-flex items-center gap-2 bg-[#1877F2] hover:bg-[#1565C0] text-white font-bold py-3 px-6 rounded-2xl text-xs uppercase tracking-wider shadow-sm hover:shadow-lg transition-all shrink-0 active:scale-95"
            >
              <span>Follow Our Facebook Profile</span>
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>

          {/* Social feed Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT COLUMN: Facebook Activity Feeds (8 Spans) */}
            <div className="lg:col-span-8 space-y-6">
              {fbPosts.map((post) => (
                <div 
                  key={post.id}
                  id={`fb-item-${post.id}`}
                  className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden"
                >
                  {/* Author Header */}
                  <div className="p-4 sm:p-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {/* Avatar sphere */}
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-rotary-dark to-rotary-azure text-white flex items-center justify-center font-bold text-xs shadow-inner">
                        {post.avatarInitials}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-extrabold text-sm text-slate-800 tracking-tight">{post.author}</h4>
                          <span className="w-4 h-4 bg-[#1877F2] rounded-full text-white flex items-center justify-center text-[8px] font-black" title="Verified Organization">
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
                      className="p-2 text-slate-400 hover:text-[#1877F2] rounded-full hover:bg-slate-50 transition-colors"
                      title="View original post"
                    >
                      <Facebook className="w-4 h-4" />
                    </a>
                  </div>

                  {/* Post Content text */}
                  <div className="px-5 pb-4 text-xs sm:text-xs text-slate-600 leading-relaxed font-light">
                    {post.content}
                  </div>

                  {/* Image Attachment inside cards */}
                  <div className="relative h-64 sm:h-80 bg-slate-100 overflow-hidden border-y border-slate-105">
                    <img 
                      src={post.imageUrl} 
                      alt="Field operations" 
                      className="w-full h-full object-cover hover:scale-103 transition-transform duration-700"
                    />
                  </div>

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
                  <div className="px-3 py-1.5 bg-slate-50 border-b border-slate-100 grid grid-cols-3 gap-2 text-xs font-bold text-slate-600 select-none">
                    <button
                      id={`fb-btn-like-${post.id}`}
                      onClick={() => handleLikePost(post.id)}
                      className={`py-2 px-1 rounded-xl flex items-center justify-center gap-1.5 hover:bg-slate-200/60 transition-all cursor-pointer ${
                        post.liked ? 'text-[#1877F2]' : 'text-slate-600'
                      }`}
                    >
                      <ThumbsUp className={`h-4 w-4 ${post.liked ? 'fill-current' : ''}`} />
                      <span>{post.liked ? 'Liked!' : 'Like'}</span>
                    </button>

                    <button
                      id={`fb-btn-comm-${post.id}`}
                      onClick={() => handleToggleComments(post.id)}
                      className={`py-2 px-1 rounded-xl flex items-center justify-center gap-1.5 hover:bg-slate-200/60 transition-all cursor-pointer ${
                        post.showComments ? 'bg-slate-200 text-[#1877F2]' : ''
                      }`}
                    >
                      <MessageSquare className="h-4 w-4" />
                      <span>Comment</span>
                    </button>

                    <button
                      id={`fb-btn-share-${post.id}`}
                      onClick={() => handleShareClick(post.id)}
                      className="py-2 px-1 rounded-xl flex items-center justify-center gap-1.5 hover:bg-slate-200/60 transition-all cursor-pointer text-slate-600"
                    >
                      <Share2 className="h-4 w-4" />
                      <span>{copiedId === post.id ? 'Copied link!' : 'Share Link'}</span>
                    </button>
                  </div>

                  {/* Comments Box Panel */}
                  <AnimatePresence>
                    {post.showComments && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-slate-50/70 border-t border-slate-100 overflow-hidden"
                      >
                        {/* List nested comments */}
                        <div className="p-4 sm:p-5 space-y-3">
                          {post.comments.map((comm) => (
                            <div key={comm.id} className="flex gap-2.5 items-start">
                              <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-600 text-[10px] font-bold flex items-center justify-center shrink-0">
                                {comm.author.charAt(0)}
                              </div>
                              <div className="bg-white rounded-2xl px-3.5 py-2.5 border border-slate-100 flex-grow relative">
                                <div className="flex items-center justify-between mb-0.5">
                                  <span className="font-bold text-[11px] text-slate-800">{comm.author}</span>
                                  <span className="text-[9px] text-slate-400 font-medium">{comm.time}</span>
                                </div>
                                <p className="text-[11px] text-slate-500 font-light leading-relaxed">{comm.text}</p>
                              </div>
                            </div>
                          ))}

                          {/* Submit New Custom Comment Form */}
                          <form 
                            onSubmit={(e) => handleAddComment(post.id, e)}
                            className="mt-4 pt-4 border-t border-slate-200 flex gap-2 items-center"
                          >
                            <input
                              type="text"
                              placeholder="Write a public comment supporting them..."
                              value={newCommentText[post.id] || ''}
                              onChange={(e) => setNewCommentText(prev => ({ ...prev, [post.id]: e.target.value }))}
                              className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs flex-grow text-slate-700 font-normal focus:ring-1 focus:ring-rotary-azure focus:border-rotary-azure ml-1"
                              required
                            />
                            <button
                              type="submit"
                              id={`fb-sub-comment-${post.id}`}
                              className="p-2.5 bg-rotary-azure hover:bg-rotary-azure/90 text-white rounded-xl transition-all shadow-xs shrink-0 cursor-pointer"
                              title="Post public comment"
                            >
                              <Send className="h-3.5 w-3.5" />
                            </button>
                          </form>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                </div>
              ))}
            </div>

            {/* RIGHT COLUMN: Freetown Digital Invitation Desk (4 Spans) */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Profile Card */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
                <div className="text-center space-y-3">
                  <div className="w-16 h-16 rounded-3xl bg-slate-900 border border-slate-800 text-white flex items-center justify-center font-black text-xl mx-auto shadow-md">
                    R
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-extrabold font-display text-slate-800 text-md">Rotary Sunset Freetown</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Sierra Leone • District 9101</p>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-4 space-y-3.5 text-xs text-slate-500 leading-normal font-light">
                  <div className="flex justify-between">
                    <span className="font-semibold text-slate-400">Total Followers:</span>
                    <span className="font-bold text-slate-700">1,200+ members</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-slate-400">Active Focus:</span>
                    <span className="font-bold text-indigo-600">Coastal Resilience</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-slate-400">Meeting Space:</span>
                    <span className="font-bold text-slate-700">Radisson Blu Lumley</span>
                  </div>
                </div>

                {/* Direct quick action */}
                <a 
                  href="https://www.facebook.com/profile.php?id=100071187714639" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full py-3 bg-[#1877F2]/10 hover:bg-[#1877F2]/15 text-[#1877F2] font-bold text-[11px] uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5"
                >
                  <Facebook className="h-3.5 w-3.5 fill-current" />
                  <span>Join Our FB Community</span>
                </a>
              </div>

              {/* Dynamic Quote */}
              <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 shadow-md relative overflow-hidden">
                <div className="relative z-10 space-y-3">
                  <Sparkles className="h-5 w-5 text-rotary-gold animate-pulse" />
                  <p className="text-xs italic text-slate-300 font-light leading-relaxed">
                    "Rotary is not just about writing checks. It is about planting the seeds, carrying the birth kits, sharing weekly fellowship milestones on Sunset coastlines, and standing by the community for years to come."
                  </p>
                  <span className="block text-[9px] font-bold uppercase text-rotary-gold tracking-widest font-display">— Sierra Leone Charter Desk</span>
                </div>
                <div className="absolute top-[-50%] right-[-50%] w-48 h-48 bg-rotary-azure/20 rounded-full blur-3xl"></div>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* 5. CURRENT ROTARY ANNOUNCEMENTS */}
      <section className="bg-white/50 py-16 px-4 sm:px-6 lg:px-8 border-y border-slate-200">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <div className="text-xs font-semibold uppercase tracking-wider text-rotary-azure font-display">Announcements</div>
            <h2 className="text-3xl font-bold font-display text-rotary-dark animate-fade-in">Latest News from Sunset</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4 relative overflow-hidden">
              <span className="inline-block bg-rotary-gold/10 text-rotary-gold text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded">June Meeting Highlights</span>
              <h3 className="text-lg font-bold text-slate-800">Hosting Dr. David Sengeh</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-light">
                Our upcoming meeting at the Radisson Blu will feature a presentation by Sierra Leone's leading educational and tech innovator, discussing customized solutions for school reading materials in outer Freetown.
              </p>
              <button onClick={() => onLearnMore('events')} className="text-xs font-bold text-rotary-azure hover:text-rotary-gold flex items-center gap-1 font-display cursor-pointer">
                RSVP for Meeting <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4 relative overflow-hidden">
              <span className="inline-block bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded">Environmental Care</span>
              <h3 className="text-lg font-bold text-slate-800">Planted 1,200 mangrove seedlings</h3>
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
    </div>
  );
}
