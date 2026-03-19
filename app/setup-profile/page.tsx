"use client";

import React, { useState, useEffect, useRef } from "react";
import AuthFormShell from "@/components/auth-form-shell";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { User, Calendar, FileText, Camera, Loader2, Sparkles, CheckCircle2, School, Brain, ChevronRight, ChevronLeft, Image as ImageIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const INTEREST_OPTIONS = [
  "Music", "Travel", "Coffee", "Netflix", "Sports", "Gaming", "Photography", "Cooking", "Art", "Dancing", "Tech", "Nature", "Books", "Movies"
];

export default function SetupProfilePage() {
  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState("");
  const [age, setAge] = useState("");
  const [university, setUniversity] = useState("");
  const [bio, setBio] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
      } else {
        if (user.user_metadata?.full_name) {
          setFullName(user.user_metadata.full_name);
        }
      }
      setChecking(false);
    }
    checkAuth();
  }, [router, supabase]);

  const toggleInterest = (interest: string) => {
    setInterests(prev => 
      prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
    );
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNext = () => setStep(prev => prev + 1);
  const handlePrev = () => setStep(prev => prev - 1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    let finalImageUrl = "";

    // Upload image if selected
    if (imageFile) {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, imageFile);

      if (uploadError) {
        setError("Image upload failed: " + uploadError.message);
        setLoading(false);
        return;
      }

      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName);
      finalImageUrl = publicUrl;
    } else {
        finalImageUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`;
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .upsert({
        id: user.id,
        full_name: fullName,
        age: parseInt(age),
        university,
        bio,
        interests,
        image_url: finalImageUrl,
        updated_at: new Date().toISOString(),
      });

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
    } else {
      setIsSuccess(true);
      setTimeout(() => {
        router.push("/");
        router.refresh();
      }, 1500);
    }
  };

  if (checking) return null;

  return (
    <AuthFormShell title="Create Your Profile" subtitle="Help others get to know you better.">
      <AnimatePresence mode="wait">
        {!isSuccess ? (
          <motion.form 
            key="form"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onSubmit={(e) => e.preventDefault()}
            className="space-y-6"
          >
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-2xl text-sm font-medium text-center">
                {error}
              </div>
            )}

            {/* Step Indicators */}
            <div className="flex justify-between items-center mb-8 px-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold transition-all ${step >= i ? "bg-primary-pink text-white" : "bg-white/10 text-gray-500"}`}>
                    {i}
                  </div>
                </div>
              ))}
            </div>

            <div className="min-h-[300px] flex flex-col justify-center">
              {step === 1 && (
                <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="space-y-4">
                  <h3 className="text-xl font-bold px-1 mb-4">The Basics</h3>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-white" size={20} />
                    <input
                      type="text"
                      placeholder="Full Name"
                      className="w-full bg-[#0c0d10] border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-primary-pink/50 transition-all font-medium"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>
                  <div className="relative group">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-white" size={20} />
                    <input
                      type="number"
                      placeholder="Age"
                      className="w-full bg-[#0c0d10] border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-primary-pink/50 transition-all font-medium"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                    />
                  </div>
                  <div className="relative group">
                    <School className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-white" size={20} />
                    <input
                      type="text"
                      placeholder="University"
                      className="w-full bg-[#0c0d10] border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-primary-pink/50 transition-all font-medium"
                      value={university}
                      onChange={(e) => setUniversity(e.target.value)}
                    />
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="space-y-4">
                  <h3 className="text-xl font-bold px-1 mb-4">Bio & Interests</h3>
                  <div className="relative group">
                    <FileText className="absolute left-4 top-6 text-gray-500 group-focus-within:text-white" size={20} />
                    <textarea
                      placeholder="Tell us about yourself..."
                      rows={3}
                      className="w-full bg-[#0c0d10] border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-primary-pink/50 transition-all font-medium resize-none"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-gray-400 px-1 mb-2">
                       <Brain size={18} />
                       <span className="text-sm font-bold uppercase tracking-wider">Interests</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {INTEREST_OPTIONS.map(interest => (
                        <button
                          key={interest}
                          type="button"
                          onClick={() => toggleInterest(interest)}
                          className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${interests.includes(interest) ? "bg-primary-pink text-white shadow-lg shadow-primary-pink/20" : "bg-white/5 text-gray-400 hover:bg-white/10"}`}
                        >
                          {interest}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="space-y-6 flex flex-col items-center">
                  <h3 className="text-xl font-bold w-full px-1">Profile Photo</h3>
                  
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-48 h-48 bg-[#0c0d10] border-2 border-dashed border-white/10 rounded-[40px] flex flex-col items-center justify-center cursor-pointer hover:border-primary-pink/50 transition-all overflow-hidden relative group"
                  >
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <>
                        <ImageIcon size={48} className="text-gray-600 group-hover:text-primary-pink transition-colors mb-2" />
                        <span className="text-xs text-gray-500 font-bold uppercase">Upload Image</span>
                      </>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                       <Camera size={32} className="text-white" />
                    </div>
                  </div>
                  
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                  
                  <p className="text-center text-xs text-gray-500 px-8">
                     {imageFile ? "Click photo to change" : "A great photo helps you stand out! ✨"}
                  </p>
                </motion.div>
              )}
            </div>

            <div className="flex gap-4 pt-4">
              {step > 1 && (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="flex-1 py-4 bg-white/5 border border-white/10 rounded-full font-bold flex items-center justify-center gap-2 hover:bg-white/10 transition-all cursor-pointer"
                >
                  <ChevronLeft size={20} /> Back
                </button>
              )}
              
              {step < 3 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex-[2] py-4 bg-gradient-to-r from-primary-orange to-primary-pink rounded-full font-black text-xl flex items-center justify-center gap-2 shadow-[0_10px_30px_rgba(255,0,127,0.3)] hover:brightness-110 transition-all cursor-pointer"
                >
                  Next <ChevronRight size={20} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="flex-[2] py-4 bg-gradient-to-r from-primary-orange to-primary-pink rounded-full font-black text-xl flex items-center justify-center gap-2 shadow-[0_10px_30px_rgba(255,0,127,0.3)] hover:brightness-110 transition-all cursor-pointer"
                  disabled={loading}
                >
                  {loading ? <Loader2 className="animate-spin" size={24} /> : <>Ready to Swipe <Sparkles size={20} /></>}
                </button>
              )}
            </div>
          </motion.form>
        ) : (
          <motion.div 
            key="success"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="flex flex-col items-center py-10 space-y-6 text-center"
          >
            <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center text-green-500 border border-green-500/50 shadow-[0_0_30px_rgba(34,197,94,0.3)]">
              <CheckCircle2 size={64} />
            </div>
            <div className="space-y-2">
              <h3 className="text-3xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-[#FF7854] to-[#FF007F]">All Set!</h3>
              <p className="text-gray-400 font-medium">Your profile is looking amazing. Redirecting...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </AuthFormShell>
  );
}

