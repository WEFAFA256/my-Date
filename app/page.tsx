"use client";

import React, { useState } from "react";
import { User, MessageCircle, RotateCcw, X, Star, Heart, Zap, Flame, LayoutGrid, MessageSquare, Settings, Sparkles } from "lucide-react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import Image from "next/image";

const profiles = [
  {
    id: 1,
    name: "Sarah",
    age: 24,
    bio: "Loves hiking and the beach. Looking for someone adventurous. 🏔️🌊",
    image: "/images/sarah.png",
  },
  {
    id: 2,
    name: "Michael",
    age: 27,
    bio: "Engineer by day, chef by night. Can make a mean lasagna. 🍝👨‍🍳",
    image: "/images/michael.png",
  },
  {
    id: 3,
    name: "Chloe",
    age: 22,
    bio: "Aspiring photographer. Let's capture some memories together. 📸✨",
    image: "/images/chloe.png",
  },
];

export default function Home() {
  const [currentProfiles, setCurrentProfiles] = useState(profiles);
  const [match, setMatch] = useState<{ name: string; img: string } | null>(null);

  const handleSwipe = (direction: "left" | "right", id: number) => {
    const profile = currentProfiles.find(p => p.id === id);
    setCurrentProfiles((prev) => prev.filter((p) => p.id !== id));

    if (direction === "right" && profile && Math.random() > 0.3) {
      setMatch({ name: profile.name, img: profile.image });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-bg-dark text-white selection:bg-primary-pink selection:text-white">
      <div className="w-full max-w-[450px] h-screen flex flex-col relative shadow-2xl overflow-hidden border-x border-white/5">
        {/* Header */}
        <header className="h-[70px] flex items-center justify-between px-4 border-b border-white/10 shrink-0">
          <User className="text-gray-400 cursor-pointer hover:text-white transition-colors" size={28} />
          <h1 className="text-3xl font-black bg-gradient-to-r from-primary-orange to-primary-pink bg-clip-text text-transparent italic tracking-tight">
            You And Me
          </h1>
          <MessageCircle className="text-gray-400 cursor-pointer hover:text-white transition-colors" size={28} />
        </header>

        {/* Card Stack */}
        <main className="flex-1 relative m-3 perspective-1000 flex items-center justify-center">
          <AnimatePresence>
            {currentProfiles.map((profile, i) => (
              <TinderCard
                key={profile.id}
                profile={profile}
                zIndex={currentProfiles.length - i}
                onSwipe={(dir) => handleSwipe(dir, profile.id)}
              />
            ))}
          </AnimatePresence>

          {currentProfiles.length === 0 && (
            <div className="text-center p-10 animate-in fade-in zoom-in duration-500">
              <div className="w-24 h-24 bg-gradient-to-br from-primary-orange to-primary-pink rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary-pink/20">
                <Sparkles size={48} className="text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-2">No more profiles nearby</h2>
              <p className="text-gray-400 mb-8">Try expanding your search range or check back later!</p>
              <button
                onClick={() => setCurrentProfiles(profiles)}
                className="px-8 py-3 bg-gradient-to-r from-primary-orange to-primary-pink rounded-full font-bold hover:scale-105 transition-transform active:scale-95 cursor-pointer"
              >
                Reset Feed
              </button>
            </div>
          )}
        </main>

        {/* Action Buttons */}
        <div className="h-[120px] flex justify-evenly items-center px-4 shrink-0 pointer-events-none">
          <ActionButton Icon={RotateCcw} color="text-rewind" onClick={() => setCurrentProfiles(profiles)} size="sm" />
          <ActionButton Icon={X} color="text-nope" onClick={() => currentProfiles.length > 0 && handleSwipe("left", currentProfiles[currentProfiles.length - 1].id)} size="lg" />
          <ActionButton Icon={Star} color="text-superlike" onClick={() => { }} size="sm" />
          <ActionButton Icon={Heart} color="text-like" onClick={() => currentProfiles.length > 0 && handleSwipe("right", currentProfiles[currentProfiles.length - 1].id)} size="lg" fill />
          <ActionButton Icon={Zap} color="text-boost" onClick={() => { }} size="sm" />
        </div>

        {/* Bottom Nav */}
        <nav className="h-[60px] flex justify-around items-center border-t border-white/10 shrink-0">
          <NavItem Icon={Flame} active />
          <NavItem Icon={LayoutGrid} />
          <NavItem Icon={Star} badge />
          <NavItem Icon={MessageSquare} />
          <NavItem Icon={Settings} />
        </nav>

        {/* Match Overlay */}
        {match && (
          <MatchOverlay profile={match} onClose={() => setMatch(null)} />
        )}
      </div>
    </div>
  );
}

function TinderCard({ profile, zIndex, onSwipe }: { profile: any; zIndex: number; onSwipe: (dir: "left" | "right") => void }) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const opacityLeft = useTransform(x, [-120, -60, -30], [1, 1, 0]);
  const opacityRight = useTransform(x, [30, 60, 120], [0, 1, 1]);

  return (
    <motion.div
      style={{ x, rotate, zIndex }}
      className="absolute inset-0 cursor-grab active:cursor-grabbing select-none will-change-transform"
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={(e, info) => {
        if (info.offset.x > 100) onSwipe("right");
        else if (info.offset.x < -100) onSwipe("left");
      }}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={(x.get() > 0 ? { x: 500, opacity: 0 } : { x: -500, opacity: 0 })}
      transition={{ type: "spring", stiffness: 400, damping: 25, restDelta: 0.5 }}
    >
      <div className="relative w-full h-full bg-card-dark rounded-3xl overflow-hidden shadow-2xl border border-white/5 transform-gpu backdrop-blur-sm">
        <Image
          src={profile.image}
          alt={profile.name}
          fill
          priority
          sizes="(max-width: 450px) 100vw, 450px"
          className="object-cover pointer-events-none"
        />

        {/* Indicators */}
        <motion.div style={{ opacity: opacityRight }} className="absolute top-10 left-6 border-4 border-like text-like font-black text-4xl px-4 py-2 rounded-xl -rotate-12 pointer-events-none">
          LIKE
        </motion.div>
        <motion.div style={{ opacity: opacityLeft }} className="absolute top-10 right-6 border-4 border-nope text-nope font-black text-4xl px-4 py-2 rounded-xl rotate-12 pointer-events-none">
          NOPE
        </motion.div>

        {/* Card Info */}
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black via-black/50 to-transparent p-6 flex flex-col justify-end pointer-events-none">
          <h2 className="text-3xl font-bold flex items-baseline gap-2">
            {profile.name} <span className="text-2xl font-normal text-gray-200">{profile.age}</span>
          </h2>
          <p className="text-sm text-gray-300 line-clamp-2 mt-1">{profile.bio}</p>
        </div>
      </div>
    </motion.div>
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
      className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-6 text-center"
    >
      <div className="w-full max-w-sm flex flex-col items-center">
        <h1 className="text-5xl font-black italic bg-gradient-to-r from-primary-orange to-primary-pink bg-clip-text text-transparent mb-8">
          It&apos;s a Match!
        </h1>
        <p className="mb-10 text-lg">You and {profile.name} have liked each other.</p>

        <div className="flex gap-4 mb-12">
          <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden shadow-xl scale-95 hover:scale-100 transition-transform">
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="You" className="w-full h-full object-cover" />
          </div>
          <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden shadow-xl scale-95 hover:scale-100 transition-transform -ml-6">
            <img src={profile.img} alt={profile.name} className="w-full h-full object-cover" />
          </div>
        </div>

        <button className="w-full py-4 bg-gradient-to-r from-primary-orange to-primary-pink rounded-full font-bold text-lg mb-4 hover:brightness-110 active:scale-95 transition-all">
          Send a Message
        </button>
        <button
          onClick={onClose}
          className="w-full py-4 text-white font-bold text-lg border-2 border-white/20 rounded-full hover:bg-white/10 active:scale-95 transition-all"
        >
          Keep Swiping
        </button>
      </div>
    </motion.div>
  );
}
