"use client";

import React, { useState, useRef, useEffect } from "react";
import { User, MessageCircle, RotateCcw, X, Star, Heart, Zap, Leaf, LayoutGrid, MessageSquare, Settings, Sparkles, LogOut, Loader2 } from "lucide-react";
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

    // Fetch other profiles
    const { data: otherProfiles, error } = await supabase
      .from("profiles")
      .select("*")
      .neq("id", user.id) // Don't show current user's own profile
      .limit(10);

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
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0c0d10] text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-[#FF7854] to-[#FF007F] rounded-full flex items-center justify-center animate-pulse">
            <Leaf size={32} className="text-white" fill="currentColor" />
          </div>
          <Loader2 className="animate-spin text-primary-pink" size={24} />
          <p className="font-bold italic text-lg opacity-50">Matcha is heating up...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-bg-dark text-white selection:bg-primary-pink selection:text-white h-screen overflow-hidden">
      <div className="w-full max-w-[450px] h-screen flex flex-col relative shadow-2xl overflow-hidden border-x border-white/5 bg-[#0c0d10]">
        
        {/* Header */}
        <header className="h-[70px] flex items-center justify-between px-6 border-b border-white/10 shrink-0 z-50 bg-[#0c0d10]/80 backdrop-blur-xl">
          <User className="text-gray-400 cursor-pointer hover:text-white transition-colors" size={28} />
          <div className="flex items-center gap-2">
            <Leaf className="text-primary-pink animate-pulse" size={28} fill="currentColor" />
            <h1 className="text-3xl font-black bg-gradient-to-r from-primary-orange to-primary-pink bg-clip-text text-transparent italic tracking-tight">
              Matcha
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <MessageCircle className="text-gray-400 cursor-pointer hover:text-white transition-colors" size={28} />
          </div>
        </header>

        {/* Vertical Chain Feed */}
        <main className="flex-1 relative overflow-hidden" ref={containerRef}>
          {hasMounted && (
            <motion.div 
               className="h-full touch-none"
               drag="y"
               dragConstraints={{ top: -(profiles.length * 100), bottom: 0 }}
               onDragEnd={(e, info) => {
                 if (info.offset.y < -100 && currentIndex < profiles.length - 1) {
                   setCurrentIndex(prev => prev + 1);
                 } else if (info.offset.y > 100 && currentIndex > 0) {
                   setCurrentIndex(prev => prev - 1);
                 }
               }}
               animate={{ y: `-${currentIndex * 100}%` }}
               transition={{ type: "spring", stiffness: 300, damping: 30 }}
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
                        <p className="text-lg text-gray-200 mt-2 font-medium leading-relaxed drop-shadow-md">{profile.bio}</p>
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
        <div className="h-[120px] flex justify-evenly items-center px-4 shrink-0 pointer-events-none z-50">
          <ActionButton Icon={RotateCcw} color="text-rewind" onClick={() => setCurrentIndex(0)} size="sm" />
          <ActionButton Icon={X} color="text-nope" onClick={() => handleAction("nope")} size="lg" />
          <ActionButton Icon={Star} color="text-superlike" onClick={() => { }} size="sm" />
          <ActionButton Icon={Heart} color="text-like" onClick={() => handleAction("like")} size="lg" fill />
          <ActionButton Icon={Zap} color="text-boost" onClick={() => { }} size="sm" />
        </div>

        {/* Bottom Nav */}
        <nav className="h-[60px] flex justify-around items-center border-t border-white/10 shrink-0 z-50 bg-[#0c0d10]">
          <NavItem Icon={Leaf} active />
          <NavItem Icon={LayoutGrid} />
          <NavItem Icon={Star} badge />
          <NavItem Icon={MessageSquare} />
          <div onClick={handleLogout} className="cursor-pointer text-gray-500 hover:text-red-400 transition-colors">
            <LogOut size={24} />
          </div>
        </nav>

        {/* Match Overlay */}
        <AnimatePresence>
          {match && (
            <MatchOverlay profile={match} onClose={() => setMatch(null)} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function ActionButton({ Icon, color, onClick, size, fill }: any) {
  return (
    <button
      onClick={onClick}
      className={`
        ${size === 'lg' ? 'w-16 h-16' : 'w-12 h-12'} 
        rounded-full bg-card-dark border border-white/10 flex items-center justify-center 
        shadow-lg transition-transform active:scale-90 hover:scale-105 ${color} pointer-events-auto
      `}
    >
      <Icon size={size === 'lg' ? 32 : 24} fill={fill ? "currentColor" : "none"} />
    </button>
  );
}

function NavItem({ Icon, active, badge }: any) {
  return (
    <div className={`relative ${active ? "text-primary-pink" : "text-gray-500"} cursor-pointer hover:text-white transition-colors`}>
      <Icon size={24} />
      {badge && <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-yellow-400 rounded-full ring-2 ring-bg-dark" />}
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

