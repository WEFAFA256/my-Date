"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UniversitySelector } from './UniversitySelector';
import { Logo } from './Logo';
import { Mail, ArrowRight, User, Lock, Upload, Sparkles, Heart } from 'lucide-react';

const INTERESTS = ["Gaming", "Rolex Hunting", "Partying", "Deep Chats", "Travel", "Tech", "Hiking", "Music", "Photography", "Fashion"];
const VIBES = ["The Fun One", "The Academic", "The Lowkey", "The Adventurer", "The Sweetheart"];

export const OnboardingFlow = ({ onComplete }: { onComplete: (data: any) => void }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    university: "",
    preference: "Anywhere in UG",
    interests: [] as string[],
    vibe: "",
    bio: "",
    profilePic: null as string | null,
  });

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const toggleInterest = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData({ ...formData, profilePic: event.target?.result as string });
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const PageTransition = ({ children }: { children: React.ReactNode }) => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="w-full flex flex-col gap-6"
    >
      {children}
    </motion.div>
  );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-bg-dark p-6 overflow-hidden sm:p-12">
      <div className="w-full max-w-md bg-card-dark border border-white/5 rounded-[2rem] p-8 shadow-2xl overflow-y-auto max-h-[90vh] custom-scrollbar">
        <div className="flex justify-center mb-8">
          <Logo />
        </div>

        {/* Step Progress */}
        <div className="flex gap-2 mb-8">
          {[1, 2, 3, 4].map((i) => (
             <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= i ? 'bg-matcha shadow-[0_0_10px_rgba(253,41,123,0.5)]' : 'bg-white/10'}`} />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <PageTransition key="step1">
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-black bg-gradient-to-r from-matcha to-matcha-light bg-clip-text text-transparent italic tracking-tighter">Spark Your Vibe</h2>
                <p className="text-text-dim text-sm font-medium italic">Uganda's Most Romantic Campus Hub.</p>
              </div>
              <button
                onClick={nextStep}
                className="w-full py-4 px-6 bg-white border border-white/10 text-black font-black italic rounded-2xl flex items-center justify-center gap-3 hover:bg-matcha hover:text-white transition-all transform hover:scale-[1.02] shadow-xl group"
              >
                <div className="w-6 h-6 flex items-center justify-center bg-white rounded-full border border-gray-200 group-hover:border-white/50 transition-colors">
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                </div>
                Continue with Google
              </button>
              <div className="relative">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10" /></div>
                <div className="relative flex justify-center text-[10px] uppercase font-black"><span className="bg-card-dark px-2 text-text-dim tracking-[0.2em]">Romantic Quick Login</span></div>
              </div>
              <button
                onClick={nextStep}
                className="w-full py-4 px-6 border border-matcha/30 bg-matcha/5 text-matcha font-black italic rounded-2xl flex items-center justify-center gap-3 hover:bg-matcha/20 hover:border-matcha transition-all tracking-tight shadow-lg shadow-matcha/5"
              >
                <Mail className="w-5 h-5 text-matcha" />
                Login via Gmail
              </button>
            </PageTransition>
          )}

          {step === 2 && (
            <PageTransition key="step2">
              <div className="space-y-4">
                <h3 className="text-xl font-black text-white italic tracking-tighter uppercase">Profile Essentials</h3>
                <div className="space-y-3">
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim" />
                    <input
                      placeholder="Username (Unique)"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      className="w-full pl-10 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-text-dim/50 focus:outline-none focus:border-matcha/50 transition-colors italic font-medium"
                    />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim" />
                    <input
                      type="password"
                      placeholder="Password (Backup)"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full pl-10 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-text-dim/50 focus:outline-none focus:border-matcha/50 transition-colors italic font-medium"
                    />
                  </div>
                  <UniversitySelector
                    selected={formData.university}
                    onSelect={(uni) => setFormData({ ...formData, university: uni })}
                  />
                  <div className="space-y-2">
                    <label className="text-[10px] text-text-dim font-black italic uppercase tracking-widest">Preference: Vibe check matches from...</label>
                    <div className="grid grid-cols-1 gap-2">
                      {["My Campus Only", "Anywhere in UG"].map((opt) => (
                        <button
                          key={opt}
                          onClick={() => setFormData({ ...formData, preference: opt })}
                          className={`px-4 py-4 text-sm font-black italic rounded-2xl border transition-all text-left flex items-center justify-between ${formData.preference === opt ? 'bg-matcha/20 border-matcha text-matcha' : 'bg-white/5 border-white/10 text-text-dim'}`}
                        >
                          {opt}
                          {formData.preference === opt && <Check className="w-4 h-4" />}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <button
                disabled={!formData.username || !formData.university}
                onClick={nextStep}
                className="mt-4 w-full py-4 bg-matcha hover:bg-matcha-dark text-black font-black italic rounded-2xl flex items-center justify-center gap-2 disabled:opacity-50 transition-all uppercase tracking-widest"
              >
                Next Essentials <ArrowRight className="w-5 h-5" />
              </button>
            </PageTransition>
          )}

          {step === 3 && (
            <PageTransition key="step3">
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-black text-white italic tracking-tighter uppercase mb-3">Vibe Check ✨</h3>
                  <div className="flex flex-wrap gap-2">
                    {INTERESTS.map(interest => (
                      <button
                        key={interest}
                        onClick={() => toggleInterest(interest)}
                        className={`px-3 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase border transition-all ${formData.interests.includes(interest) ? 'bg-matcha border-matcha text-black shadow-lg shadow-matcha/20' : 'bg-white/5 border-white/10 text-white hover:border-matcha/50'}`}
                      >
                        {interest}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-text-dim block mb-3 font-black italic uppercase tracking-widest">What is "Your Type"?</label>
                  <div className="grid grid-cols-2 gap-2">
                    {VIBES.map(vibe => (
                      <button
                        key={vibe}
                        onClick={() => setFormData({ ...formData, vibe })}
                        className={`px-3 py-3 rounded-2xl text-[10px] font-black uppercase italic border transition-all text-center flex items-center justify-center gap-1.5 ${formData.vibe === vibe ? 'bg-matcha/20 border-matcha text-matcha shadow-lg' : 'bg-white/5 border-white/10 text-white'}`}
                      >
                        <Heart className={`w-3.5 h-3.5 ${formData.vibe === vibe ? 'fill-current' : ''}`} />
                        {vibe}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                    <label className="text-[10px] text-text-dim block mb-2 font-black italic uppercase tracking-widest">Bio (Show your energy)</label>
                    <textarea
                        maxLength={200}
                        placeholder="Say something romantic or witty..."
                        value={formData.bio}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        className="w-full h-24 p-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-text-dim/30 focus:outline-none focus:border-matcha/50 transition-colors resize-none text-sm font-medium italic"
                    />
                    <div className="text-right text-[10px] text-text-dim mt-1 font-mono">{formData.bio.length}/200</div>
                </div>
              </div>
              <div className="flex gap-3">
                  <button onClick={prevStep} className="flex-1 py-4 bg-white/5 text-white font-black italic rounded-2xl border border-white/10 uppercase text-xs">Back</button>
                  <button
                    disabled={formData.interests.length === 0 || !formData.vibe || !formData.bio}
                    onClick={nextStep}
                    className="flex-[2] py-4 bg-matcha hover:bg-matcha-dark text-black font-black italic rounded-2xl flex items-center justify-center gap-2 disabled:opacity-50 transition-all uppercase tracking-widest"
                  >
                    Vibe Confirmed <ArrowRight className="w-5 h-5" />
                  </button>
              </div>
            </PageTransition>
          )}

          {step === 4 && (
            <PageTransition key="step4">
               <div className="text-center space-y-4">
                <h3 className="text-xl font-black text-white italic tracking-tighter uppercase">Show Your Face!</h3>
                <p className="text-text-dim text-xs italic font-medium">Single high-quality profile picture for maximum sparks.</p>
                
                <div className="group relative w-full aspect-square bg-white/5 rounded-3xl border-2 border-dashed border-white/20 flex flex-col items-center justify-center overflow-hidden cursor-pointer hover:border-matcha/50 transition-all shadow-inner">
                   {formData.profilePic ? (
                     <img src={formData.profilePic} alt="Profile preview" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                   ) : (
                     <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 bg-matcha/10 rounded-full flex items-center justify-center border border-matcha/30 animate-pulse">
                            <Upload className="w-8 h-8 text-matcha" />
                        </div>
                        <span className="text-[10px] font-black text-text-dim uppercase tracking-widest group-hover:text-matcha transition-colors italic">Upload Photo</span>
                     </div>
                   )}
                   <input
                     type="file"
                     accept="image/*"
                     className="absolute inset-0 opacity-0 cursor-pointer"
                     onChange={handleFileChange}
                   />
                </div>
               </div>
               
               <div className="flex gap-3 mt-6">
                  <button onClick={prevStep} className="flex-1 py-4 bg-white/5 text-white font-black italic rounded-2xl border border-white/10 uppercase text-xs">Back</button>
                  <button
                    disabled={!formData.profilePic}
                    onClick={() => onComplete(formData)}
                    className="flex-[2] py-4 bg-matcha hover:bg-matcha-dark text-black font-black italic rounded-2xl flex items-center justify-center gap-2 disabled:opacity-50 transition-all shadow-[0_0_30px_rgba(253,41,123,0.3)] uppercase tracking-widest"
                  >
                    Find My Spark <Sparkles className="w-5 h-5" />
                  </button>
              </div>
            </PageTransition>
          )}
        </AnimatePresence>
      </div>
      
      {/* Branding for PC users */}
      <div className="hidden lg:flex fixed left-12 bottom-12 items-center gap-4">
          <div className="w-12 h-12 rounded-2xl border border-matcha/30 bg-matcha/10 flex items-center justify-center shadow-lg shadow-matcha/20">
              <Logo className="scale-75" />
          </div>
          <div>
              <p className="text-white font-black italic tracking-tighter text-lg">The Matcha Campus</p>
              <p className="text-matcha font-bold text-[10px] italic tracking-[0.3em] uppercase">Find Your Spark in UG</p>
          </div>
      </div>
    </div>
  );
};

const Check = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
)
