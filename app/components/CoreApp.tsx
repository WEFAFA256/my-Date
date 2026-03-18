"use client";

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Flame, Search, MessageCircle, User, Heart, X, 
  MapPin, Sparkles, Ghost, Info, Zap, Settings,
  RotateCcw, Star, SearchCode, GraduationCap, ShieldCheck,
  Send, MoreVertical, Paperclip, Smile, ArrowLeft, PlusCircle
} from 'lucide-react';
import { Logo } from './Logo';
import { MOCK_PROFILES } from './mockData';

export const CoreApp = ({ user }: { user: any }) => {
  const [activeTab, setActiveTab] = useState<'home' | 'search' | 'chat' | 'profile'>('home');
  const [activeChatId, setActiveChatId] = useState<number | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [ghostMode, setGhostMode] = useState(false);
  const [interCampus, setInterCampus] = useState(false);
  const [likeInteraction, setLikeInteraction] = useState<number | null>(null);
  
  // Match Engine Logic
  const filteredProfiles = useMemo(() => {
    let result = MOCK_PROFILES;
    if (user.preference === "My Campus Only" && !interCampus) {
        result = result.filter(p => p.university === user.university);
    }
    if (interCampus) {
        result = [...result].sort((a,b) => (a.university === user.university ? 1 : -1));
    }
    return result;
  }, [user, interCampus]);

  const calculateVibeMatch = (profileInterests: string[]) => {
    const common = user.interests.filter((i: string) => profileInterests.includes(i));
    return Math.round((common.length / Math.max(user.interests.length, 1)) * 100);
  };

  const getIceBreakPrompt = (profile: any) => {
     const commonInterests = user.interests.filter((i: string) => profile.interests.includes(i));
     if (commonInterests.length > 0) {
        return `Ask about ${commonInterests[0]}! You both share this spark.`;
     }
     return `Witty Tip: Ask about their energy as ${profile.vibe}.`;
  };

  // --- Sub-components ---

  const ProfileFeed = () => (
    <div className="flex-1 w-full bg-bg-dark relative snap-y snap-mandatory overflow-y-scroll h-full custom-scrollbar">
       {filteredProfiles.map((p, idx) => (
          <div key={p.id} className="h-full w-full snap-start relative flex flex-col justify-end bg-card-dark">
             <div className="absolute inset-0">
                <img src={p.image} className="w-full h-full object-cover" alt={p.name} />
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-bg-dark" />
             </div>

             {/* Right Side Buttons (TikTok Style) */}
             <div className="absolute right-4 bottom-32 flex flex-col gap-6 items-center z-20">
                <div className="flex flex-col items-center gap-1">
                    <button className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-xl flex items-center justify-center border border-white/20 hover:scale-110 transition-transform active:scale-95 group shadow-xl">
                        <Heart className={`w-8 h-8 ${likeInteraction === p.id ? 'fill-matcha text-matcha animate-ping' : 'text-white'}`} />
                    </button>
                    <span className="text-[10px] font-black text-white tracking-widest uppercase italic drop-shadow-md">Spark</span>
                </div>
                
                <div className="flex flex-col items-center gap-1">
                    <button className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-xl flex items-center justify-center border border-white/20 hover:scale-110 transition-transform active:scale-95 shadow-xl">
                        <Star className="w-8 h-8 text-superlike fill-current" />
                    </button>
                    <span className="text-[10px] font-black text-white tracking-widest uppercase italic drop-shadow-md">Super</span>
                </div>

                <div className="flex flex-col items-center gap-1">
                    <button className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-xl flex items-center justify-center border border-white/20 hover:scale-110 transition-transform active:scale-95 shadow-xl">
                        <MessageCircle className="w-8 h-8 text-white fill-current" />
                    </button>
                    <span className="text-[10px] font-black text-white tracking-widest uppercase italic drop-shadow-md">Ping</span>
                </div>

                <div className="flex flex-col items-center gap-1">
                    <button className="w-14 h-14 rounded-full bg-matcha flex items-center justify-center border-2 border-white/20 hover:scale-110 transition-transform active:scale-95 shadow-2xl shadow-matcha/40">
                        <Zap className="w-8 h-8 text-white fill-current animate-pulse" />
                    </button>
                    <span className="text-[10px] font-black text-matcha tracking-widest uppercase italic drop-shadow-md">Boost</span>
                </div>
             </div>

             {/* Profile Info Overlay (TikTok Style) */}
             <div className="p-8 md:p-12 flex flex-col items-start gap-4 z-10 w-[85%] md:w-[65%]">
                 <div className="flex items-center gap-3">
                    <h2 className="text-4xl font-black text-white italic tracking-tighter drop-shadow-2xl">{p.name}, {p.age}</h2>
                    <span className="px-3 py-1 rounded-xl bg-matcha text-white text-[10px] font-black border border-white/20 tracking-widest uppercase italic shadow-lg">{p.vibe}</span>
                 </div>
                 
                 <div className="flex items-center gap-2 text-matcha-light text-sm font-black italic tracking-tight drop-shadow-md">
                    <MapPin className="w-4 h-4" />
                    {p.university}
                 </div>

                 <p className="text-base text-white font-bold leading-relaxed drop-shadow-xl max-w-sm italic">"{p.bio}"</p>

                 <div className="flex flex-wrap gap-2 mt-4">
                    {p.interests.map(i => (
                        <span key={i} className="px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase bg-white/15 text-white backdrop-blur-md border border-white/10 shadow-sm">#{i}</span>
                    ))}
                 </div>

                 <div className="mt-6 p-4 bg-matcha rounded-[1.5rem] flex items-center gap-4 border border-white/20 shadow-2xl shadow-matcha/30 max-w-md transform hover:scale-[1.02] transition-transform cursor-pointer">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                        <Sparkles className="w-6 h-6 text-white animate-bounce" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-white/70 tracking-widest uppercase italic leading-none mb-1">{calculateVibeMatch(p.interests)}% SPARK MATCH</p>
                        <p className="text-sm font-black text-white italic leading-tight tracking-tight uppercase tracking-tighter">{getIceBreakPrompt(p)}</p>
                    </div>
                 </div>
             </div>
          </div>
       ))}
    </div>
  );

  const ChatList = () => (
    <div className="flex-1 flex flex-col bg-bg-dark border-x border-white/5 w-full max-w-xl mx-auto md:max-w-none md:mx-0">
        <div className="p-8 border-b border-white/5 flex items-center justify-between">
            <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase italic">Sparks Flying</h2>
            <button className="p-3 bg-white/5 rounded-2xl border border-white/10 hover:border-matcha/50 transition-all"><PlusCircle className="w-6 h-6 text-matcha" /></button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
            {MOCK_PROFILES.slice(0, 3).map(chat => (
                <button 
                  key={chat.id}
                  onClick={() => setActiveChatId(chat.id)}
                  className={`w-full flex items-center gap-5 p-5 rounded-[2rem] hover:bg-white/5 transition-all mb-3 ${activeChatId === chat.id ? 'bg-white/5 border-2 border-matcha/40 border-dashed shadow-lg shadow-matcha/10' : 'border border-transparent'}`}
                >
                    <div className="relative">
                        <div className="w-16 h-16 rounded-3xl overflow-hidden border-2 border-matcha/50 shadow-md">
                            <img src={chat.image} className="w-full h-full object-cover" />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-matcha rounded-full border-4 border-bg-dark shadow-sm" />
                    </div>
                    <div className="flex-1 text-left">
                        <div className="flex items-baseline justify-between mb-1">
                            <p className="text-lg font-black text-white italic tracking-tighter uppercase">{chat.name}</p>
                            <span className="text-[10px] text-text-dim/60 font-black uppercase tracking-widest">Active Now</span>
                        </div>
                        <p className="text-sm text-text-dim italic line-clamp-1 font-medium italic">"I'm at the photowalk! Where r u? 🌅"</p>
                    </div>
                </button>
            ))}
        </div>
    </div>
  );

  const ChatWindow = ({ chatId }: { chatId: number }) => {
    const chatProfile = MOCK_PROFILES.find(p => p.id === chatId)!;
    return (
        <div className="flex-1 flex flex-col bg-bg-dark w-full">
            {/* Chat Header */}
            <div className="p-5 border-b border-white/5 flex items-center justify-between bg-bg-dark/80 backdrop-blur-xl sticky top-0 z-30">
                <div className="flex items-center gap-4">
                    <button onClick={() => setActiveChatId(null)} className="md:hidden p-2"><ArrowLeft className="w-6 h-6 text-matcha font-black" /></button>
                    <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-matcha/30 shadow-lg">
                        <img src={chatProfile.image} className="w-full h-full object-cover" />
                    </div>
                    <div>
                        <p className="font-black text-white text-base tracking-tighter italic uppercase">{chatProfile.name}</p>
                        <p className="text-[10px] text-matcha font-black uppercase tracking-[0.2em] italic">{chatProfile.university.split(' (')[1]?.replace(')', '') || "UG"}</p>
                    </div>
                </div>
                <button className="p-3 text-text-dim hover:text-white transition-colors"><MoreVertical className="w-6 h-6" /></button>
            </div>

            {/* AI Assistant Help */}
            <div className="px-8 py-3 bg-matcha/15 border-b border-matcha/20 animate-pulse flex items-center gap-3">
                <Sparkles className="w-4 h-4 text-matcha" />
                <p className="text-[11px] font-black text-matcha tracking-widest uppercase italic leading-none pt-0.5">SPARK TIP: <span className="text-white italic font-bold tracking-tight normal-case ml-1">"They love {chatProfile.interests[0]}. Suggest a sunset date there! 🌅"</span></p>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
                <div className="flex justify-center my-10 relative">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5" /></div>
                    <span className="relative px-4 py-1.5 rounded-full bg-card-dark border border-white/10 text-[10px] font-black text-text-dim/60 tracking-[0.3em] uppercase italic">Date Spark: 14:23</span>
                </div>
                
                <div className="flex flex-col gap-2 items-start">
                    <div className="max-w-[75%] p-5 rounded-[2.5rem] rounded-tl-none bg-card-dark border border-white/10 text-white leading-relaxed text-sm italic font-bold shadow-xl">
                        Hi! I noticed we both share a spark for {chatProfile.interests[0]}. That's high energy! 🔥
                    </div>
                    <span className="text-[9px] text-text-dim/40 font-black uppercase ml-4 tracking-widest italic">Delivered</span>
                </div>

                <div className="flex flex-col gap-2 items-end">
                    <div className="max-w-[75%] p-5 rounded-[2.5rem] rounded-tr-none bg-matcha text-white leading-relaxed text-sm font-black italic shadow-2xl shadow-matcha/20">
                        Omg literally yes! 😭 High energy only. We should def vibe soon! ✨
                    </div>
                    <span className="text-[9px] text-matcha/60 font-black uppercase mr-4 tracking-widest italic">Sparked</span>
                </div>
            </div>

            {/* Message Input */}
            <div className="p-8">
                <div className="bg-card-dark border border-white/10 rounded-[2.5rem] p-3 flex items-center gap-3 focus-within:border-matcha/50 focus-within:shadow-[0_0_20px_rgba(253,41,123,0.15)] transition-all shadow-inner">
                    <button className="p-3 text-text-dim hover:text-matcha hover:scale-110 transition-transform"><PlusCircle className="w-6 h-6" /></button>
                    <input 
                      placeholder="Send a spark..."
                      className="flex-1 bg-transparent py-3 text-sm text-white focus:outline-none italic font-bold"
                    />
                    <button className="p-3"><Smile className="w-6 h-6 text-text-dim hover:text-matcha" /></button>
                    <button className="p-4 bg-matcha rounded-[2rem] text-white shadow-xl shadow-matcha/30 hover:scale-105 transition-all"><Send className="w-6 h-6" /></button>
                </div>
            </div>
        </div>
    );
  };

  return (
    <div className="h-screen bg-bg-dark flex flex-col md:flex-row-reverse overflow-hidden">
      
      {/* Desktop Header / Mode Selectors (PC Only) */}
      <header className="hidden md:flex flex-col w-[120px] items-center py-10 gap-10 border-l border-white/5 bg-black/40 relative z-50">
          <Logo className="scale-75 -rotate-90 origin-center mb-10" />
          
          <div className="flex flex-col gap-8 flex-1">
            <button 
                onClick={() => setInterCampus(!interCampus)}
                className={`p-4 rounded-2xl border transition-all ${interCampus ? 'bg-matcha text-black border-matcha' : 'bg-white/5 text-text-dim border-white/10'}`}
                title="Inter-Campus Mode"
            >
                <GraduationCap className="w-6 h-6" />
            </button>
            
            <button 
                onClick={() => setGhostMode(!ghostMode)}
                className={`p-4 rounded-2xl border transition-all ${ghostMode ? 'bg-matcha/20 text-matcha border-matcha' : 'bg-white/5 text-text-dim border-white/10'}`}
                title="Ghost Mode"
            >
                <Ghost className="w-6 h-6" />
            </button>

            <button className="p-4 rounded-2xl border bg-white/5 text-text-dim border-white/10"><Settings className="w-6 h-6" /></button>
          </div>

          <div className="w-12 h-12 rounded-2xl overflow-hidden border border-matcha/40 bg-matcha/20 p-0.5">
             <img src={user.profilePic || "/placeholder.png"} className="w-full h-full object-cover rounded-xl" />
          </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {activeTab === 'home' && <ProfileFeed />}
        
        {(activeTab === 'chat' && !activeChatId) && <ChatList />}
        {(activeTab === 'chat' && activeChatId) && <ChatWindow chatId={activeChatId} />}
        
        {activeTab === 'search' && (
             <div className="flex-1 p-10 flex flex-col items-center justify-center text-center space-y-4">
                <SearchCode className="w-16 h-16 text-matcha opacity-50 animate-pulse" />
                <h2 className="text-2xl font-black text-white italic italic uppercase tracking-widest">Manual Discovery</h2>
                <p className="text-text-dim italic">Filtering by University and Interests coming soon!</p>
             </div>
        )}

        {activeTab === 'profile' && (
             <div className="flex-1 flex flex-col items-center justify-center p-10">
                 <div className="relative group">
                    <div className="w-40 h-40 rounded-[2.5rem] overflow-hidden border-4 border-matcha shadow-2xl relative">
                        <img src={user.profilePic || "/placeholder.png"} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <PlusCircle className="w-10 h-10 text-white" />
                        </div>
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-matcha p-3 rounded-3xl shadow-xl shadow-matcha/30 border-4 border-bg-dark">
                        <Sparkles className="w-6 h-6 text-black" />
                    </div>
                 </div>
                 
                 <div className="mt-8 text-center space-y-2">
                    <h2 className="text-4xl font-black text-white italic italic uppercase tracking-tighter">{user.username}</h2>
                    <p className="text-matcha font-bold tracking-[0.2em] italic uppercase text-sm">{user.university}</p>
                 </div>

                 <div className="grid grid-cols-2 gap-4 mt-12 w-full max-w-sm">
                    <div className="p-6 rounded-3xl bg-white/5 border border-white/10 text-center">
                        <p className="text-2xl font-black text-white italic tracking-tighter">142</p>
                        <p className="text-[10px] text-text-dim font-bold uppercase tracking-widest">Profile Pings</p>
                    </div>
                    <div className="p-6 rounded-3xl bg-white/5 border border-white/10 text-center">
                        <p className="text-2xl font-black text-matcha italic tracking-tighter">8.5k</p>
                        <p className="text-[10px] text-text-dim font-bold uppercase tracking-widest">Vibe Spark</p>
                    </div>
                 </div>
             </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <nav className="border-t border-white/5 bg-bg-dark/95 backdrop-blur-xl px-4 py-4 md:hidden">
        <div className="flex items-center justify-between max-w-md mx-auto relative px-4">
          <button 
            onClick={() => { setActiveTab('home'); setActiveChatId(null); }}
            className={`transition-all relative z-10 ${activeTab === 'home' ? 'text-matcha scale-125' : 'text-text-dim'}`}
          >
            <Flame className={`w-8 h-8 ${activeTab === 'home' ? 'fill-current' : ''}`} />
          </button>
          
          <button 
            onClick={() => { setActiveTab('search'); setActiveChatId(null); }}
            className={`transition-all relative z-10 ${activeTab === 'search' ? 'text-matcha scale-125' : 'text-text-dim'}`}
          >
            <Search className="w-8 h-8 stroke-[2.5]" />
          </button>
          
          <button 
            onClick={() => setActiveTab('chat')}
            className={`transition-all relative z-10 ${activeTab === 'chat' ? 'text-matcha scale-125' : 'text-text-dim'}`}
          >
            <div className="relative">
                <MessageCircle className={`w-8 h-8 ${activeTab === 'chat' ? 'fill-current' : ''}`} />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-matcha text-black flex items-center justify-center text-[10px] font-black rounded-full border-2 border-bg-dark italic tracking-tighter">3</div>
            </div>
          </button>
          
          <button 
            onClick={() => { setActiveTab('profile'); setActiveChatId(null); }}
            className={`transition-all relative z-10 ${activeTab === 'profile' ? 'text-matcha scale-125' : 'text-text-dim'}`}
          >
            <User className={`w-8 h-8 ${activeTab === 'profile' ? 'fill-current' : ''}`} />
          </button>
        </div>
      </nav>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 0px;
          display: none;
        }
        .snap-y {
          scroll-snap-type: y mandatory;
        }
        .snap-start {
          scroll-snap-align: start;
        }
      `}</style>
    </div>
  );
};
