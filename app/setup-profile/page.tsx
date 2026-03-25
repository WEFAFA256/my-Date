"use client";
export const dynamic = 'force-dynamic';

import React, { useState, useRef, useEffect } from "react";
import AuthFormShell from "@/components/auth-form-shell";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import {
  User, FileText, Camera, Loader2, Sparkles, CheckCircle2,
  School, Brain, ChevronRight, ChevronLeft, Image as ImageIcon,
  AtSign, Calendar, MapPin
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const INTEREST_OPTIONS = [
  "Music", "Travel", "Food", "Football", "Gaming", "Photography",
  "Cooking", "Art", "Dancing", "Tech", "Nature", "Books",
  "Movies", "Church", "Business", "Fashion", "Fitness", "Boda"
];

const UGANDA_UNIVERSITIES = [
  "Makerere University",
  "Kyambogo University",
  "Makerere University Business School (MUBS)",
  "Uganda Christian University (UCU)",
  "Kampala International University (KIU)",
  "Nkumba University",
  "Busitema University",
  "Mbarara University of Science & Technology (MUST)",
  "Gulu University",
  "Kabale University",
  "Ndejje University",
  "Uganda Martyrs University",
  "Bugema University",
  "Cavendish University Uganda",
  "Islamic University in Uganda (IUIU)",
  "Muteesa I Royal University",
  "Other",
];

const UGANDA_LOCATIONS = [
  "Kampala - Nakawa", "Kampala - Makindye", "Kampala - Kawempe",
  "Kampala - Rubaga", "Kampala - Central", "Entebbe", "Jinja",
  "Mbarara", "Gulu", "Lira", "Fort Portal", "Kabale", "Mbale",
  "Masaka", "Arua", "Soroti", "Hoima", "Mukono", "Wakiso",
];

export default function SetupProfilePage() {
  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [seeking, setSeeking] = useState("");
  const [location, setLocation] = useState("");
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleInterest = (interest: string) => {
    setInterests(prev =>
      prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
    );
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // File type validation
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      setError("Only JPG, PNG, or WebP images are allowed.");
      return;
    }

    // File size validation (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be smaller than 5MB.");
      return;
    }

    setError(null);
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleNext = () => {
    // Validate step 1
    if (step === 1) {
      if (!fullName.trim()) { setError("Please enter your name."); return; }
      if (!username.trim()) { setError("Please choose a username."); return; }
      if (!age || parseInt(age) < 18 || parseInt(age) > 80) {
        setError("You must be 18 or older to use Matcha UG."); return;
      }
      if (!gender) { setError("Please select your gender."); return; }
      if (!seeking) { setError("Please select who you're looking for."); return; }
    }
    // Validate step 2
    if (step === 2) {
      if (bio.length > 500) { setError("Bio must be 500 characters or less."); return; }
    }
    setError(null);
    setStep(prev => prev + 1);
  };
  const handlePrev = () => { setError(null); setStep(prev => prev - 1); };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    let finalImageUrl = "";

    if (imageFile) {
      const fileExt = imageFile.name.split('.').pop();
      // Use crypto.randomUUID() instead of Math.random() — no collisions
      const fileName = `${user.id}-${crypto.randomUUID()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, imageFile, { upsert: true });

      if (uploadError) {
        setError("Image upload failed: " + uploadError.message);
        setLoading(false);
        return;
      }

      const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(fileName);
      finalImageUrl = publicUrl;
    } else {
      finalImageUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`;
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .upsert({
        id: user.id,
        full_name: fullName.trim(),
        username: username.trim().toLowerCase(),
        age: parseInt(age),
        gender,
        seeking,
        location,
        university,
        bio: bio.trim().slice(0, 500),
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
    <AuthFormShell title="Create Your Profile" subtitle="Let's find your match in Uganda 🇺🇬">
      <AnimatePresence mode="wait">
        {!isSuccess ? (
          <motion.div
            key="form"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-3 sm:space-y-4"
          >
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-2.5 rounded-2xl text-xs font-medium text-center animate-shake">
                {error}
              </div>
            )}

            {/* Step Indicators */}
            <div className="flex justify-between items-center mb-4 sm:mb-6 px-2">
              {["Basics", "About", "Photo"].map((label, i) => {
                const num = i + 1;
                return (
                  <div key={label} className="flex flex-col items-center gap-1">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${step >= num ? "bg-primary-pink text-white shadow-lg shadow-primary-pink/30" : "bg-white/10 text-gray-500"}`}>
                      {step > num ? "✓" : num}
                    </div>
                    <span className={`text-[9px] font-bold uppercase tracking-widest ${step >= num ? "text-primary-pink" : "text-gray-600"}`}>{label}</span>
                  </div>
                );
              })}
            </div>

            <div className="min-h-[260px] sm:min-h-[300px] flex flex-col justify-center px-1">

              {/* ---- STEP 1: BASICS ---- */}
              {step === 1 && (
                <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="space-y-2.5 sm:space-y-3">
                  <h3 className="text-base sm:text-lg font-black px-1 mb-2 italic text-white">The Basics</h3>

                  {/* Full Name */}
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-white transition-colors" size={16} />
                    <input
                      type="text"
                      placeholder="Full Name"
                      maxLength={60}
                      className="w-full bg-[#0c0d10] border border-white/10 rounded-xl py-3 pl-11 pr-4 outline-none focus:ring-2 focus:ring-primary-pink/50 transition-all font-medium text-sm text-white"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>

                  {/* Username */}
                  <div className="relative group">
                    <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-white transition-colors" size={16} />
                    <input
                      type="text"
                      placeholder="Username (e.g. nakato_ug)"
                      maxLength={30}
                      className="w-full bg-[#0c0d10] border border-white/10 rounded-xl py-3 pl-11 pr-4 outline-none focus:ring-2 focus:ring-primary-pink/50 transition-all font-medium text-sm text-white"
                      value={username}
                      onChange={(e) => setUsername(e.target.value.replace(/\s/g, "").toLowerCase())}
                    />
                  </div>

                  {/* Age */}
                  <div className="relative group">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-white transition-colors" size={16} />
                    <input
                      type="number"
                      placeholder="Age (18+)"
                      min={18}
                      max={80}
                      className="w-full bg-[#0c0d10] border border-white/10 rounded-xl py-3 pl-11 pr-4 outline-none focus:ring-2 focus:ring-primary-pink/50 transition-all font-medium text-sm text-white"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                    />
                  </div>

                  {/* Gender */}
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 px-1 mb-1.5">I am a...</p>
                    <div className="flex gap-2">
                      {["Man", "Woman", "Other"].map(g => (
                        <button key={g} type="button" onClick={() => setGender(g)}
                          className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all border ${gender === g ? "bg-primary-pink border-primary-pink text-white shadow-lg shadow-primary-pink/20" : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"}`}>
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Seeking */}
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 px-1 mb-1.5">Looking for...</p>
                    <div className="flex gap-2">
                      {["Men", "Women", "Everyone"].map(s => (
                        <button key={s} type="button" onClick={() => setSeeking(s)}
                          className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all border ${seeking === s ? "bg-gradient-to-r from-primary-orange to-primary-pink border-transparent text-white" : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"}`}>
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ---- STEP 2: ABOUT ---- */}
              {step === 2 && (
                <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="space-y-2.5 sm:space-y-3">
                  <h3 className="text-base sm:text-lg font-black px-1 mb-2 italic text-white">About You</h3>

                  {/* Location */}
                  <div className="relative group">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-white transition-colors" size={16} />
                    <select
                      className="w-full bg-[#0c0d10] border border-white/10 rounded-xl py-3 pl-11 pr-4 outline-none focus:ring-2 focus:ring-primary-pink/50 transition-all font-medium text-sm text-white appearance-none"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    >
                      <option value="" className="bg-[#0c0d10]">Your Location in Uganda</option>
                      {UGANDA_LOCATIONS.map(loc => <option key={loc} value={loc} className="bg-[#0c0d10]">{loc}</option>)}
                    </select>
                  </div>

                  {/* University */}
                  <div className="relative group">
                    <School className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-white transition-colors" size={16} />
                    <select
                      className="w-full bg-[#0c0d10] border border-white/10 rounded-xl py-3 pl-11 pr-4 outline-none focus:ring-2 focus:ring-primary-pink/50 transition-all font-medium text-sm text-white appearance-none"
                      value={university}
                      onChange={(e) => setUniversity(e.target.value)}
                    >
                      <option value="" className="bg-[#0c0d10]">University (optional)</option>
                      {UGANDA_UNIVERSITIES.map(uni => <option key={uni} value={uni} className="bg-[#0c0d10]">{uni}</option>)}
                    </select>
                  </div>

                  {/* Bio */}
                  <div className="relative group">
                    <FileText className="absolute left-4 top-4 text-gray-500 group-focus-within:text-white transition-colors" size={16} />
                    <textarea
                      placeholder="Tell people about yourself... (max 500 chars)"
                      rows={3}
                      maxLength={500}
                      className="w-full bg-[#0c0d10] border border-white/10 rounded-xl py-3 pl-11 pr-4 outline-none focus:ring-2 focus:ring-primary-pink/50 transition-all font-medium resize-none text-sm text-white"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                    />
                    <span className="absolute bottom-2 right-3 text-[9px] text-gray-600">{bio.length}/500</span>
                  </div>

                  {/* Interests */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-gray-400 px-1">
                      <Brain size={14} />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Interests</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {INTEREST_OPTIONS.map(interest => (
                        <button
                          key={interest}
                          type="button"
                          onClick={() => toggleInterest(interest)}
                          className={`px-3 py-1.5 rounded-full text-[10px] font-bold transition-all ${interests.includes(interest) ? "bg-primary-pink text-white shadow-lg shadow-primary-pink/20" : "bg-white/5 text-gray-400 hover:bg-white/10"}`}
                        >
                          {interest}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ---- STEP 3: PHOTO ---- */}
              {step === 3 && (
                <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="space-y-3 sm:space-y-4 flex flex-col items-center">
                  <h3 className="text-base sm:text-lg font-black w-full px-1 italic text-white">Your Best Photo</h3>

                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-36 h-36 sm:w-44 sm:h-44 bg-[#0c0d10] border-2 border-dashed border-white/10 rounded-[30px] flex flex-col items-center justify-center cursor-pointer hover:border-primary-pink/50 transition-all overflow-hidden relative group shadow-inner"
                  >
                    {imagePreview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <>
                        <ImageIcon size={32} className="text-gray-600 group-hover:text-primary-pink transition-colors mb-2" />
                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">Upload Image</span>
                        <span className="text-[9px] text-gray-600 mt-1">JPG, PNG, WebP · Max 5MB</span>
                      </>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Camera size={24} className="text-white" />
                    </div>
                  </div>

                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageChange}
                  />

                  <p className="text-center text-[10px] text-gray-500 px-6">
                    {imageFile ? `✅ ${imageFile.name}` : "A clear, smiling photo gets 5× more matches! ✨"}
                  </p>
                </motion.div>
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="flex gap-3 pt-2">
              {step > 1 && (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="flex-1 py-3 bg-white/5 border border-white/10 rounded-full font-bold text-sm flex items-center justify-center gap-1.5 hover:bg-white/10 transition-all cursor-pointer"
                >
                  <ChevronLeft size={18} /> Back
                </button>
              )}

              {step < 3 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex-[2] py-3 bg-gradient-to-r from-primary-orange to-primary-pink rounded-full font-black text-base sm:text-lg flex items-center justify-center gap-2 shadow-[0_10px_30px_rgba(255,0,127,0.3)] hover:brightness-110 transition-all cursor-pointer"
                >
                  Next <ChevronRight size={18} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="flex-[2] py-3 bg-gradient-to-r from-primary-orange to-primary-pink rounded-full font-black text-base sm:text-lg flex items-center justify-center gap-2 shadow-[0_10px_30px_rgba(255,0,127,0.3)] hover:brightness-110 transition-all cursor-pointer"
                  disabled={loading}
                >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : <>Let&apos;s Go <Sparkles size={18} /></>}
                </button>
              )}
            </div>
          </motion.div>
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
              <h3 className="text-3xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-[#FF7854] to-[#FF007F]">Tuli nga Ready! 🇺🇬</h3>
              <p className="text-gray-400 font-medium">Your profile is live. Finding your matches...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </AuthFormShell>
  );
}
