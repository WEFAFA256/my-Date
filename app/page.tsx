"use client";
export const dynamic = 'force-dynamic';

import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  User, MessageCircle, RotateCcw, X, Star, Heart, Zap, Leaf,
  LayoutGrid, MessageSquare, Settings, Sparkles, LogOut, Loader2,
  School, Search, Send, Bot, ChevronLeft, MapPin, AtSign
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { MatchesOverlay, RealtimeChatOverlay } from "@/components/chat-system";

// Fallback profiles if DB is empty
const fallbackProfiles = [
  {
    id: "fb-1",
    full_name: "Aisha",
    age: 23,
    location: "Kampala - Nakawa",
    university: "Makerere University",
    bio: "Loves food, adventures, and good vibes only 🌟",
    image_url: "/images/sarah.png",
    interests: ["Food", "Travel", "Music"],
  },
  {
    id: "fb-2",
    full_name: "Brian",
    age: 26,
    location: "Jinja",
    university: "Kyambogo University",
    bio: "Engineer by day, boda philosopher by night 🏍️",
    image_url: "/images/michael.png",
    interests: ["Tech", "Football", "Business"],
  },
];

type Profile = {
  id: string;
  full_name: string;
  age?: number;
  bio?: string;
  image_url?: string;
  university?: string;
  location?: string;
  username?: string;
  interests?: string[];
};

export default function Home() {
  const supabase = useMemo(() => createClient(), []);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [match, setMatch] = useState<{ name: string; img: string; myImg: string } | null>(null);
  const [hasMounted, setHasMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<{ id: string; email?: string } | null>(null);
  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  const [showProfileDetail, setShowProfileDetail] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showMatches, setShowMatches] = useState(false);
  const [activeChatMatch, setActiveChatMatch] = useState<any | null>(null);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    setHasMounted(true);
    checkUserAndFetchProfiles();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkUserAndFetchProfiles = async () => {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    setCurrentUser({ id: user.id, email: user.email });

    // Check if user has a profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, full_name, username, age, bio, image_url, university, location, interests")
      .eq("id", user.id)
      .single();

    if (!profile || !profile.full_name) {
      router.push("/setup-profile");
      return;
    }

    setUserProfile(profile);

    // Get list of profiles the user has already swiped
    const { data: swipedData } = await supabase
      .from("swipes")
      .select("swiped_id")
      .eq("swiper_id", user.id);

    const swipedIds = (swipedData || []).map((s: { swiped_id: string }) => s.swiped_id);

    // Fetch other profiles, excluding already-swiped ones
    const query = supabase
      .from("profiles")
      .select("id, full_name, username, age, bio, image_url, university, location, interests")
      .neq("id", user.id)
      .limit(30);

    const { data: otherProfiles } = await query;

    const unseen = (otherProfiles || []).filter((p: Profile) => !swipedIds.includes(p.id));

    if (unseen.length > 0) {
      setProfiles(unseen);
    } else {
      setProfiles(fallbackProfiles);
    }

    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const recordSwipe = async (swipedId: string, direction: "like" | "nope") => {
    if (!currentUser || swipedId.startsWith("fb-")) return; // skip fallback profiles
    await supabase.from("swipes").upsert({
      swiper_id: currentUser.id,
      swiped_id: swipedId,
      direction,
      created_at: new Date().toISOString(),
    });

    // Check for mutual match (did they like me too?)
    if (direction === "like") {
      const { data: theirSwipe } = await supabase
        .from("swipes")
        .select("id")
        .eq("swiper_id", swipedId)
        .eq("swiped_id", currentUser.id)
        .eq("direction", "like")
        .single();

      if (theirSwipe) {
        // It's a real match — save to matches table
        await supabase.from("matches").upsert({
          user1_id: currentUser.id,
          user2_id: swipedId,
          created_at: new Date().toISOString(),
        });
        return true; // it's a match!
      }
    }
    return false;
  };

  const handleAction = async (type: "like" | "nope") => {
    if (profiles.length === 0 || currentIndex >= profiles.length) return;
    const profile = profiles[currentIndex];

    // Advance card
    setCurrentIndex(prev => prev + 1);

    if (type === "like") {
      const isMatch = await recordSwipe(profile.id, "like");
      if (isMatch) {
        setMatch({
          name: profile.full_name,
          img: profile.image_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.id}`,
          myImg: userProfile?.image_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser?.email}`,
        });
      }
    } else {
      await recordSwipe(profile.id, "nope");
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
          <p className="font-bold italic text-lg opacity-60">Matcha UG is loading...</p>
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
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={userProfile?.image_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser?.email}`}
              alt="Me"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex items-center gap-2">
            <Leaf className="text-primary-pink animate-pulse" size={24} fill="currentColor" />
            <h1 className="text-2xl font-black bg-gradient-to-r from-primary-orange to-primary-pink bg-clip-text text-transparent italic tracking-tight">
              Matcha UG
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <LayoutGrid className="text-gray-400 cursor-pointer hover:text-white transition-colors" size={24} onClick={() => setShowSearch(true)} />
            <MessageCircle className="text-gray-400 cursor-pointer hover:text-white transition-colors" size={24} onClick={() => setShowMatches(true)} />
          </div>
        </header>

        {/* Vertical Card Feed */}
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
              {profiles.map((profile) => (
                <section key={profile.id} className="h-full w-full p-4 flex flex-col shrink-0">
                  <div className="relative flex-1 bg-card-dark rounded-3xl overflow-hidden shadow-2xl border border-white/5 transform-gpu backdrop-blur-sm">
                    {profile.image_url ? (
                      <Image
                        src={profile.image_url}
                        alt={profile.full_name}
                        fill
                        priority
                        sizes="(max-width: 450px) 100vw, 450px"
                        className="object-cover pointer-events-none"
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
                          {profile.full_name}
                          {profile.age && <span className="text-2xl font-normal text-gray-300">{profile.age}</span>}
                        </h2>

                        {profile.location && (
                          <div className="flex items-center gap-1.5 text-white/60 font-bold text-sm mt-1">
                            <MapPin size={14} className="text-primary-orange" />
                            {profile.location}
                          </div>
                        )}

                        {profile.university && (
                          <div className="flex items-center gap-1.5 text-primary-pink font-bold text-sm mt-1 uppercase tracking-wider">
                            <School size={16} />
                            {profile.university}
                          </div>
                        )}

                        {profile.bio && (
                          <p className="text-base text-gray-200 mt-3 font-medium leading-relaxed drop-shadow-md line-clamp-2">{profile.bio}</p>
                        )}

                        {profile.interests && profile.interests.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-4">
                            {profile.interests.slice(0, 4).map((interest: string) => (
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
                  <h2 className="text-2xl font-bold mb-2">Owange! That&apos;s everyone!</h2>
                  <p className="text-gray-400 mb-8 font-medium">You&apos;ve seen all available matches. Check back soon!</p>
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
          <ActionButton Icon={RotateCcw} color="text-rewind" onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))} size="sm" title="Undo" />
          <ActionButton Icon={X} color="text-nope" onClick={() => handleAction("nope")} size="lg" title="Nope" />
          <ActionButton Icon={Star} color="text-superlike" onClick={() => handleAction("like")} size="sm" title="Super Like" />
          <ActionButton Icon={Heart} color="text-like" onClick={() => handleAction("like")} size="lg" fill title="Like" />
          <ActionButton Icon={Zap} color="text-boost" onClick={() => setShowMatches(true)} size="sm" title="Boost" />
        </div>

        {/* Bottom Nav */}
        <nav className="h-[55px] flex justify-around items-center border-t border-white/10 shrink-0 z-50 bg-[#0c0d10]">
          <NavItem Icon={Leaf} active />
          <NavItem Icon={LayoutGrid} onClick={() => setShowSearch(true)} />
          <NavItem Icon={Star} badge />
          <NavItem Icon={MessageSquare} onClick={() => setShowMatches(true)} />
          <div onClick={handleLogout} className="cursor-pointer text-gray-500 hover:text-red-400 transition-colors">
            <LogOut size={20} />
          </div>
        </nav>

        {/* Match Overlay */}
        <AnimatePresence>
          {match && (
            <MatchOverlay profile={match} onClose={() => setMatch(null)} onMessage={() => { setMatch(null); setShowMatches(true); }} />
          )}
        </AnimatePresence>

        {/* Profile Detail Overlay */}
        <AnimatePresence>
          {showProfileDetail && (
            <ProfileOverlay
              profile={userProfile}
              onClose={() => setShowProfileDetail(false)}
              onLogout={handleLogout}
              onEdit={() => { setShowProfileDetail(false); setShowEditProfile(true); }}
            />
          )}
        </AnimatePresence>

        {/* Edit Profile overlay → re-uses setup-profile page */}
        <AnimatePresence>
          {showEditProfile && (
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-0 z-[200] bg-[#0c0d10]"
            >
              <div className="flex items-center gap-4 p-6 border-b border-white/10">
                <button onClick={() => setShowEditProfile(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                  <ChevronLeft size={24} />
                </button>
                <h2 className="text-xl font-black italic">Edit Profile</h2>
              </div>
              <div className="p-6 text-gray-400 text-center mt-20">
                <Settings size={48} className="mx-auto mb-4 opacity-30" />
                <p className="font-medium">Full profile editing coming soon!</p>
                <p className="text-sm mt-2 opacity-60">For now, you can re-run setup to update your details.</p>
                <button
                  onClick={() => { setShowEditProfile(false); router.push("/setup-profile"); }}
                  className="mt-6 px-8 py-3 bg-gradient-to-r from-primary-orange to-primary-pink rounded-full font-bold hover:brightness-110 transition-all"
                >
                  Re-run Setup
                </button>
              </div>
            </motion.div>
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

        {/* Matches Inbox Overlay */}
        <AnimatePresence>
          {showMatches && !activeChatMatch && (
            <MatchesOverlay
              onClose={() => setShowMatches(false)}
              currentUser={currentUser}
              onSelectMatch={setActiveChatMatch}
            />
          )}
        </AnimatePresence>

        {/* Realtime Chat Overlay */}
        <AnimatePresence>
          {activeChatMatch && (
            <RealtimeChatOverlay
              match={activeChatMatch}
              onClose={() => setActiveChatMatch(null)}
              currentUser={currentUser}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Sub Components ──────────────────────────────────────────────────────────

function ProfileOverlay({ profile, onClose, onLogout, onEdit }: { profile: Profile | null; onClose: () => void; onLogout: () => void; onEdit: () => void }) {
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
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={profile?.image_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=ug`}
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
            <div className="space-y-1">
              <h2 className="text-4xl font-black italic">{profile?.full_name}</h2>
              {profile?.username && (
                <div className="flex items-center gap-2 text-primary-pink font-bold uppercase tracking-widest text-sm">
                  <AtSign size={16} className="inline" /> {profile.username}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {profile?.university && (
                <div className="bg-white/5 p-4 rounded-3xl border border-white/10">
                  <School className="text-primary-pink mb-2" size={20} />
                  <div className="text-xs text-gray-500 font-bold uppercase tracking-tighter">University</div>
                  <div className="font-bold text-sm truncate">{profile.university}</div>
                </div>
              )}
              <div className="bg-white/5 p-4 rounded-3xl border border-white/10">
                <MapPin className="text-primary-orange mb-2" size={20} />
                <div className="text-xs text-gray-500 font-bold uppercase tracking-tighter">Location</div>
                <div className="font-bold text-sm">{profile?.location || "Uganda 🇺🇬"}</div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-bold italic">About Me</h3>
              <p className="text-gray-400 leading-relaxed font-medium">
                {profile?.bio || "No bio yet. Tell the world about yourself!"}
              </p>
            </div>

            {profile?.interests && profile.interests.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-bold italic">Interests</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.interests.map((interest: string) => (
                    <span key={interest} className="px-4 py-2 bg-gradient-to-r from-primary-orange/10 to-primary-pink/10 border border-primary-pink/20 rounded-full text-xs font-bold text-primary-pink">
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-4 space-y-4">
              <button
                onClick={onEdit}
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

function SearchOverlay({ onClose, profiles, onSelect }: { onClose: () => void; profiles: Profile[]; onSelect: (index: number) => void }) {
  const [query, setQuery] = useState("");

  const filteredProfiles = profiles.filter(p =>
    (p.full_name || "").toLowerCase().includes(query.toLowerCase()) ||
    (p.username || "").toLowerCase().includes(query.toLowerCase()) ||
    (p.university || "").toLowerCase().includes(query.toLowerCase()) ||
    (p.location || "").toLowerCase().includes(query.toLowerCase())
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
              placeholder="Search by name, location, uni..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 outline-none focus:ring-2 focus:ring-primary-pink/50 transition-all text-sm"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-4 px-2">
            {filteredProfiles.length} match{filteredProfiles.length !== 1 ? "es" : ""} found
          </h3>
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
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.image_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.id}`} className="w-full h-full object-cover" alt="" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold truncate text-lg">{p.full_name}</div>
                    <div className="text-sm text-gray-500 truncate">{p.location || p.university || "Uganda 🇺🇬"}</div>
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
              <p className="text-gray-500 font-medium italic">No results for &quot;{query}&quot;</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}


function ActionButton({ Icon, color, onClick, size, fill, title }: {
  Icon: React.ElementType; color: string; onClick: () => void;
  size: "sm" | "lg"; fill?: boolean; title?: string;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`
        ${size === "lg" ? "w-14 h-14" : "w-10 h-10"}
        rounded-full bg-card-dark border border-white/10 flex items-center justify-center
        shadow-lg transition-transform active:scale-90 hover:scale-105 ${color} pointer-events-auto
      `}
    >
      <Icon size={size === "lg" ? 28 : 20} fill={fill ? "currentColor" : "none"} />
    </button>
  );
}

function NavItem({ Icon, active, badge, onClick }: {
  Icon: React.ElementType; active?: boolean; badge?: boolean; onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`relative ${active ? "text-primary-pink" : "text-gray-500"} cursor-pointer hover:text-white transition-colors`}
    >
      <Icon size={22} />
      {badge && <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full ring-2 ring-[#0c0d10]" />}
      {active && <motion.div layoutId="nav-underline" className="absolute -bottom-2 left-0 right-0 h-0.5 bg-primary-pink" />}
    </div>
  );
}

function MatchOverlay({ profile, onClose, onMessage }: {
  profile: { name: string; img: string; myImg: string };
  onClose: () => void;
  onMessage: () => void;
}) {
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
          <h1 className="text-6xl font-black italic bg-gradient-to-r from-primary-orange to-primary-pink bg-clip-text text-transparent mb-6 drop-shadow-[0_0_30px_rgba(255,0,127,0.3)]">
            It&apos;s a Match!
          </h1>
        </motion.div>

        <p className="mb-8 text-xl font-medium text-gray-200">You and <strong>{profile.name}</strong> liked each other! 🔥</p>

        <div className="flex gap-0 mb-12 relative">
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="w-36 h-36 rounded-full border-[6px] border-white overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] z-20"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={profile.myImg} alt="You" className="w-full h-full object-cover bg-gray-800" />
          </motion.div>
          <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="w-36 h-36 rounded-full border-[6px] border-white overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] -ml-10 z-10"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={profile.img} alt={profile.name} className="w-full h-full object-cover bg-gray-800" />
          </motion.div>
        </div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="w-full flex flex-col gap-4"
        >
          <button
            onClick={onMessage}
            className="w-full py-5 bg-gradient-to-r from-primary-orange to-primary-pink rounded-full font-black text-xl shadow-[0_10px_30px_rgba(255,0,127,0.3)] hover:brightness-110 active:scale-95 transition-all"
          >
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


