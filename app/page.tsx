"use client";

import React, { useState, useRef, useEffect } from "react";
import { User, MessageCircle, RotateCcw, X, Star, Heart, Zap, Leaf, LayoutGrid, MessageSquare, Settings, Sparkles, LogOut, Loader2, School, Search, Send, Bot, ChevronLeft, MapPin, AtSign } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

// Fallback profiles if DB is empty
const fallbackProfiles = [
  {
    id: "fb-1",
    full_name: "Sarah",
    age: 24,
    bio: "Loves hiking and the beach. Looking for someone adventurous. 🏔️🌊",
    image_url: "/images/sarah.png",
  },
  {
    id: "fb-2",
    full_name: "Michael",
    age: 27,
    bio: "Engineer by day, chef by night. Can make a mean lasagna. 🍝👨‍🍳",
    image_url: "/images/michael.png",
  },
];

export default function Home() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [match, setMatch] = useState<{ name: string; img: string } | null>(null);
  const [hasMounted, setHasMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [showProfileDetail, setShowProfileDetail] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    setHasMounted(true);
    checkUserAndFetchProfiles();
  }, []);

  const checkUserAndFetchProfiles = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      router.push("/login");
      return;
    }
    
    setCurrentUser(user);

    // Check if user has a profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (!profile || !profile.full_name) {
      router.push("/setup-profile");
      return;
    }

    setUserProfile(profile);

    // Fetch other profiles
    const { data: otherProfiles, error } = await supabase
      .from("profiles")
      .select("*")
      .neq("id", user.id) // Don't show current user's own profile
      .limit(20);

    if (otherProfiles && otherProfiles.length > 0) {
      setProfiles(otherProfiles);
    } else {
      setProfiles(fallbackProfiles);
    }
    
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const handleAction = (type: "like" | "nope") => {
    if (profiles.length === 0) return;
    
    if (type === "like" && Math.random() > 0.3) {
      setMatch({ 
        name: profiles[currentIndex].full_name || profiles[currentIndex].name, 
        img: profiles[currentIndex].image_url || profiles[currentIndex].image 
      });
    }
    if (currentIndex < profiles.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  if (loading && hasMounted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-[#0c0d10] text-white p-4 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-[#FF7854] to-[#FF007F] rounded-2xl flex items-center justify-center animate-pulse shadow-2xl shadow-primary-pink/20">
            <Leaf size={32} className="text-white" fill="currentColor" />
          </div>
          <Loader2 className="animate-spin text-primary-pink" size={24} />
          <p className="font-bold italic text-lg opacity-60">Matcha is heating up...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col items-center justify-center min-h-[100dvh] bg-[#0c0d10] text-white selection:bg-primary-pink selection:text-white overflow-hidden">
      {/* Background for Desktop */}
      <div className="absolute inset-0 z-0 hidden sm:block">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
          style={{ backgroundImage: `url(https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=1974&auto=format&fit=crop)` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-[#0c0d10]/80 to-[#0c0d10]" />
      </div>

      <div className="relative z-10 w-full max-w-[420px] h-[100dvh] flex flex-col shadow-2xl overflow-hidden border-x border-white/5 bg-[#0c0d10]">
        
        {/* Header */}
        <header className="h-[60px] flex items-center justify-between px-6 border-b border-white/10 shrink-0 z-50 bg-[#0c0d10]/80 backdrop-blur-xl">
          <div 
            onClick={() => setShowProfileDetail(true)}
            className="w-10 h-10 rounded-full border-2 border-primary-pink/50 overflow-hidden cursor-pointer hover:scale-105 transition-transform shrink-0"
          >
            <img 
              src={userProfile?.image_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser?.email}`} 
              alt="Me" 
              className="w-full h-full object-cover" 
            />
          </div>
          <div className="flex items-center gap-2">
            <Leaf className="text-primary-pink animate-pulse" size={24} fill="currentColor" />
            <h1 className="text-2xl font-black bg-gradient-to-r from-primary-orange to-primary-pink bg-clip-text text-transparent italic tracking-tight">
              Matcha
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <LayoutGrid className="text-gray-400 cursor-pointer hover:text-white transition-colors" size={24} onClick={() => setShowSearch(true)} />
            <MessageCircle className="text-gray-400 cursor-pointer hover:text-white transition-colors" size={24} onClick={() => setShowChat(true)} />
          </div>
        </header>

        {/* Vertical Chain Feed */}
        <main className="flex-1 relative overflow-hidden bg-[#050505]" ref={containerRef}>
          {hasMounted && (
            <motion.div 
               className="h-full touch-none"
               drag="y"
               dragConstraints={{ top: -(profiles.length * 100), bottom: 0 }}
               onDragEnd={(e, info) => {
                 const threshold = 50;
                 if (info.offset.y < -threshold && currentIndex < profiles.length) {
                   setCurrentIndex(prev => prev + 1);
                 } else if (info.offset.y > threshold && currentIndex > 0) {
                   setCurrentIndex(prev => prev - 1);
                 }
               }}
               animate={{ y: `-${currentIndex * 100}%` }}
               transition={{ type: "spring", stiffness: 250, damping: 30 }}
            >
              {profiles.map((profile, i) => (
                <section key={profile.id} className="h-full w-full p-4 flex flex-col shrink-0">
                  <div className="relative flex-1 bg-card-dark rounded-3xl overflow-hidden shadow-2xl border border-white/5 transform-gpu backdrop-blur-sm">
                    {profile.image_url || profile.image ? (
                        <Image
                            src={profile.image_url || profile.image}
                            alt={profile.full_name || profile.name}
                            fill
                            priority
                            sizes="(max-width: 450px) 100vw, 450px"
                            className="object-cover pointer-events-none"
                            unoptimized={profile.image_url?.startsWith('http')}
                        />
                    ) : (
                        <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                            <User size={64} className="text-white/20" />
                        </div>
                    )}
                    
                    {/* Card Info Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black via-black/80 to-transparent p-8 flex flex-col justify-end">
                      <motion.div 
                         initial={{ y: 20, opacity: 0 }}
                         whileInView={{ y: 0, opacity: 1 }}
                         transition={{ delay: 0.2 }}
                      >
                        <h2 className="text-4xl font-black flex items-baseline gap-3">
                          {profile.full_name || profile.name} <span className="text-2xl font-normal text-gray-300">{profile.age}</span>
                        </h2>
                        
                        {profile.university && (
                          <div className="flex items-center gap-1.5 text-primary-pink font-bold text-sm mt-1 uppercase tracking-wider">
                            <School size={16} />
                            {profile.university}
                          </div>
                        )}

                        <p className="text-lg text-gray-200 mt-3 font-medium leading-relaxed drop-shadow-md">{profile.bio}</p>

                        {profile.interests && profile.interests.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-4">
                            {profile.interests.map((interest: string) => (
                              <span key={interest} className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-bold text-white/90 border border-white/10 uppercase tracking-tighter">
                                {interest}
                              </span>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    </div>
                  </div>
                </section>
              ))}

              {/* Empty State */}
              <section className="h-full w-full flex items-center justify-center p-10 text-center">
                <div>
                  <div className="w-24 h-24 bg-gradient-to-br from-primary-orange to-primary-pink rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary-pink/20">
                    <Sparkles size={48} className="text-white" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">That&apos;s everyone for now!</h2>
                  <p className="text-gray-400 mb-8">You&apos;ve looked through all potential matches.</p>
                  <button
                    onClick={() => setCurrentIndex(0)}
                    className="px-8 py-3 bg-gradient-to-r from-primary-orange to-primary-pink rounded-full font-bold hover:scale-105 transition-transform active:scale-95 cursor-pointer"
                  >
                    Start Over
                  </button>
                </div>
              </section>
            </motion.div>
          )}
        </main>

        {/* Action Buttons */}
        <div className="h-[100px] flex justify-evenly items-center px-4 shrink-0 pointer-events-none z-50">
          <ActionButton Icon={RotateCcw} color="text-rewind" onClick={() => setCurrentIndex(0)} size="sm" />
          <ActionButton Icon={X} color="text-nope" onClick={() => handleAction("nope")} size="lg" />
          <ActionButton Icon={Star} color="text-superlike" onClick={() => { }} size="sm" />
          <ActionButton Icon={Heart} color="text-like" onClick={() => handleAction("like")} size="lg" fill />
          <ActionButton Icon={Zap} color="text-boost" onClick={() => { }} size="sm" />
        </div>

        {/* Bottom Nav */}
        <nav className="h-[55px] flex justify-around items-center border-t border-white/10 shrink-0 z-50 bg-[#0c0d10]">
          <NavItem Icon={Leaf} active />
          <NavItem Icon={LayoutGrid} />
          <NavItem Icon={Star} badge />
          <NavItem Icon={MessageSquare} />
          <div onClick={handleLogout} className="cursor-pointer text-gray-500 hover:text-red-400 transition-colors">
            <LogOut size={20} />
          </div>
        </nav>

        {/* Match Overlay */}
        <AnimatePresence>
          {match && (
            <MatchOverlay profile={match} onClose={() => setMatch(null)} />
          )}
        </AnimatePresence>

        {/* Profile Detail Overlay */}
        <AnimatePresence>
          {showProfileDetail && (
            <ProfileOverlay 
              profile={userProfile} 
              onClose={() => setShowProfileDetail(false)} 
              onLogout={handleLogout}
            />
          )}
        </AnimatePresence>

        {/* Search Overlay */}
        <AnimatePresence>
          {showSearch && (
            <SearchOverlay 
              onClose={() => setShowSearch(false)}
              profiles={profiles}
              onSelect={(index: number) => {
                setCurrentIndex(index);
                setShowSearch(false);
              }}
            />
          )}
        </AnimatePresence>

        {/* Chat Overlay */}
        <AnimatePresence>
          {showChat && (
            <ChatOverlay 
              onClose={() => setShowChat(false)}
              currentUser={currentUser}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function ProfileOverlay({ profile, onClose, onLogout }: { profile: any; onClose: () => void; onLogout: () => void }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
      <motion.div
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="w-full h-full sm:max-w-[420px] sm:h-[90dvh] bg-[#0c0d10] flex flex-col sm:rounded-[40px] sm:shadow-2xl sm:border sm:border-white/10 overflow-hidden relative"
      >
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="relative h-[40dvh] sm:h-[300px]">
            <img 
              src={profile?.image_url || `https://api.dicebear.com/7.x/avataaars/svg?seed= Felix`} 
              className="w-full h-full object-cover" 
              alt="Profile"
            />
            <button 
              onClick={onClose}
              className="absolute top-6 left-6 w-10 h-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-black/60 transition-colors z-20"
            >
              <ChevronLeft size={24} />
            </button>
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#0c0d10] to-transparent" />
          </div>

          <div className="px-8 -mt-6 relative z-10 space-y-8 pb-10">
            <div className="space-y-2">
              <h2 className="text-4xl font-black italic">
                {profile?.full_name}
              </h2>
              <div className="flex items-center gap-2 text-primary-pink font-bold uppercase tracking-widest text-sm">
                <AtSign size={16} className="inline" /> {profile?.username}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 p-4 rounded-3xl border border-white/10">
                <School className="text-primary-pink mb-2" size={20} />
                <div className="text-xs text-gray-500 font-bold uppercase tracking-tighter">University</div>
                <div className="font-bold text-sm truncate">{profile?.university || "Not set"}</div>
              </div>
              <div className="bg-white/5 p-4 rounded-3xl border border-white/10">
                <MapPin className="text-primary-orange mb-2" size={20} />
                <div className="text-xs text-gray-500 font-bold uppercase tracking-tighter">Location</div>
                <div className="font-bold text-sm">Nairobi, KE</div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-bold italic">About Me</h3>
              <p className="text-gray-400 leading-relaxed font-medium">
                {profile?.bio || "No bio yet. Tell the world about yourself!"}
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-bold italic">Interests</h3>
              <div className="flex flex-wrap gap-2">
                {profile?.interests?.map((interest: string) => (
                  <span key={interest} className="px-4 py-2 bg-gradient-to-r from-primary-orange/10 to-primary-pink/10 border border-primary-pink/20 rounded-full text-xs font-bold text-primary-pink">
                    {interest}
                  </span>
                )) || <span className="text-gray-500 italic">No interests added yet</span>}
              </div>
            </div>

            <div className="pt-4 space-y-4">
              <button 
                onClick={() => {}} 
                className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-white/10 transition-colors"
              >
                <Settings size={20} /> Edit Profile
              </button>
              <button 
                onClick={onLogout} 
                className="w-full py-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-red-500/20 transition-colors"
              >
                <LogOut size={20} /> Sign Out
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function SearchOverlay({ onClose, profiles, onSelect }: { onClose: () => void; profiles: any[]; onSelect: (index: number) => void }) {
  const [query, setQuery] = useState("");
  
  const filteredProfiles = profiles.filter(p => 
    (p.full_name || p.name || "").toLowerCase().includes(query.toLowerCase()) ||
    (p.username || "").toLowerCase().includes(query.toLowerCase()) ||
    (p.university || "").toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full h-full sm:max-w-[420px] sm:h-[90dvh] bg-[#0c0d10] flex flex-col p-6 sm:rounded-[40px] sm:shadow-2xl sm:border sm:border-white/10 overflow-hidden"
      >
        <div className="flex items-center gap-4 mb-8">
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <ChevronLeft size={24} />
          </button>
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
            <input 
              autoFocus
              type="text" 
              placeholder="Search by name, university..." 
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 outline-none focus:ring-2 focus:ring-primary-pink/50 transition-all text-sm"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-4 px-2">Matches found</h3>
          {filteredProfiles.length > 0 ? (
            filteredProfiles.map((p) => {
              const originalIndex = profiles.findIndex(orig => orig.id === p.id);
              return (
                <motion.div 
                  key={p.id}
                  initial={{ x: -10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  onClick={() => onSelect(originalIndex)}
                  className="flex items-center gap-4 p-4 bg-white/5 rounded-3xl border border-white/10 cursor-pointer hover:bg-white/10 transition-all active:scale-[0.98]"
                >
                  <div className="w-14 h-14 rounded-2xl overflow-hidden border border-white/10 shrink-0">
                    <img src={p.image_url || p.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.id}`} className="w-full h-full object-cover" alt="" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold truncate text-lg">{p.full_name || p.name}</div>
                    <div className="text-sm text-primary-pink font-bold italic truncate">{p.university || "No university"}</div>
                  </div>
                  <Sparkles size={18} className="text-primary-orange opacity-50" />
                </motion.div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
               <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center text-gray-600">
                  <Search size={40} />
               </div>
               <p className="text-gray-500 font-medium italic">No sparks found for &quot;{query}&quot;</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function ChatOverlay({ onClose, currentUser }: { onClose: () => void; currentUser: any }) {
  const [messages, setMessages] = useState([
    { id: 1, text: "Hey! I'm Matcha AI, your dating wingman. 🍵", sender: "ai", time: "12:00 PM" },
    { id: 2, text: "I can help you break the ice or give you profile tips. What's on your mind?", sender: "ai", time: "12:01 PM" }
  ]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    
    const newUserMsg = { id: Date.now(), text: input, sender: "user", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setMessages(prev => [...prev, newUserMsg]);
    setInput("");

    // AI Response logic
    setTimeout(() => {
      let aiText = "That's interesting! Let's find you a perfect match. 🔥";
      const lower = input.toLowerCase();
      if (lower.includes("hello") || lower.includes("hi")) aiText = "Hey there! Ready to brew some connections? 🍵";
      else if (lower.includes("tip") || lower.includes("help")) aiText = "Tip: A great bio should be short, witty, and show your personality! ✨";
      else if (lower.includes("match")) aiText = "You've got great taste! I'll keep an eye out for more profiles you'll love.";

      setMessages(prev => [...prev, { 
        id: Date.now() + 1, 
        text: aiText, 
        sender: "ai", 
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
      }]);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
      <motion.div
        initial={{ x: "100%", opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: "100%", opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="w-full h-full sm:max-w-[420px] sm:h-[90dvh] bg-[#0c0d10] flex flex-col sm:rounded-[40px] sm:shadow-2xl sm:border sm:border-white/10 overflow-hidden"
      >
        {/* Chat Header */}
        <div className="h-[70px] flex items-center px-6 border-b border-white/10 gap-4 shrink-0">
          <button onClick={onClose} className="p-1 hover:bg-white/5 rounded-full">
            <ChevronLeft size={24} />
          </button>
          <div className="w-10 h-10 bg-gradient-to-br from-primary-orange to-primary-pink rounded-xl flex items-center justify-center shadow-lg shadow-primary-pink/20">
            <Bot size={24} className="text-white" />
          </div>
          <div>
            <div className="font-bold italic flex items-center gap-2">
              Matcha AI <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            </div>
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Your Wingman</div>
          </div>
        </div>

        {/* Messages Feed */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar" ref={scrollRef}>
          {messages.map((m) => (
            <motion.div 
              key={m.id}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div className={`max-w-[80%] p-4 rounded-3xl text-sm font-medium shadow-sm ${
                m.sender === "user" 
                  ? "bg-primary-pink text-white rounded-tr-none" 
                  : "bg-white/5 border border-white/10 text-gray-200 rounded-tl-none"
              }`}>
                {m.text}
                <div className={`text-[9px] mt-1.5 font-bold uppercase tracking-tight opacity-50 ${m.sender === "user" ? "text-right" : "text-left"}`}>
                  {m.time}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Input Area */}
        <div className="p-6 border-t border-white/10 bg-[#0c0d10]/50 backdrop-blur-xl">
          <div className="relative flex items-center gap-3">
            <input 
              type="text" 
              placeholder="Ask Matcha AI anything..." 
              className="flex-1 bg-white/5 border border-white/10 rounded-2xl py-4 pl-6 pr-14 outline-none focus:ring-2 focus:ring-primary-pink/50 transition-all font-medium text-sm"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />
            <button 
              onClick={handleSend}
              className="absolute right-2 w-11 h-11 bg-primary-pink rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary-pink/20 hover:scale-105 active:scale-95 transition-all"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function ActionButton({ Icon, color, onClick, size, fill }: any) {
  return (
    <button
      onClick={onClick}
      className={`
        ${size === 'lg' ? 'w-14 h-14' : 'w-10 h-10'} 
        rounded-full bg-card-dark border border-white/10 flex items-center justify-center 
        shadow-lg transition-transform active:scale-90 hover:scale-105 ${color} pointer-events-auto
      `}
    >
      <Icon size={size === 'lg' ? 28 : 20} fill={fill ? "currentColor" : "none"} />
    </button>
  );
}

function NavItem({ Icon, active, badge }: any) {
  return (
    <div className={`relative ${active ? "text-primary-pink" : "text-gray-500"} cursor-pointer hover:text-white transition-colors`}>
      <Icon size={22} />
      {badge && <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full ring-2 ring-bg-dark" />}
      {active && <motion.div layoutId="nav-underline" className="absolute -bottom-2 left-0 right-0 h-0.5 bg-primary-pink" />}
    </div>
  );
}

function MatchOverlay({ profile, onClose }: { profile: any; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center p-8 text-center backdrop-blur-xl"
    >
      <div className="w-full max-w-sm flex flex-col items-center">
        <motion.div
           initial={{ scale: 0.5, rotate: -20, opacity: 0 }}
           animate={{ scale: 1, rotate: 0, opacity: 1 }}
           transition={{ type: "spring", damping: 15, stiffness: 200 }}
        >
          <h1 className="text-6xl font-black italic bg-gradient-to-r from-primary-orange to-primary-pink bg-clip-text text-transparent mb-12 drop-shadow-[0_0_30px_rgba(255,0,127,0.3)]">
            It&apos;s a Match!
          </h1>
        </motion.div>

        <p className="mb-12 text-xl font-medium text-gray-200">You and {profile.name} are sparks! 🔥</p>

        <div className="flex gap-0 mb-16 relative">
          <motion.div 
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="w-36 h-36 rounded-full border-[6px] border-white overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] z-20"
          >
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="You" className="w-full h-full object-cover bg-gray-800" />
          </motion.div>
          <motion.div 
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="w-36 h-36 rounded-full border-[6px] border-white overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] -ml-10 z-10"
          >
            <img src={profile.img} alt={profile.name} className="w-full h-full object-cover bg-gray-800" />
          </motion.div>
        </div>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="w-full flex flex-col gap-4"
        >
          <button className="w-full py-5 bg-gradient-to-r from-primary-orange to-primary-pink rounded-full font-black text-xl shadow-[0_10px_30px_rgba(255,0,127,0.3)] hover:brightness-110 active:scale-95 transition-all">
            Send a Message
          </button>
          <button
            onClick={onClose}
            className="w-full py-5 text-white font-bold text-xl border-2 border-white/20 rounded-full hover:bg-white/10 active:scale-95 transition-all backdrop-blur-md"
          >
            Keep Swiping
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
}

