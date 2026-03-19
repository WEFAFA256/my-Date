"use client";

import React, { useState, useEffect } from "react";
import AuthFormShell from "@/components/auth-form-shell";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { User, Calendar, FileText, Camera, Loader2, Sparkles, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function SetupProfilePage() {
  const [fullName, setFullName] = useState("");
  const [age, setAge] = useState("");
  const [bio, setBio] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
      } else {
        // Pre-fill full name if available from metadata
        if (user.user_metadata?.full_name) {
          setFullName(user.user_metadata.full_name);
        }
      }
      setChecking(false);
    }
    checkAuth();
  }, [router, supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error: updateError } = await supabase
      .from("profiles")
      .upsert({
        id: user.id,
        full_name: fullName,
        age: parseInt(age),
        bio,
        image_url: imageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`,
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
            exit={{ opacity: 0, y: -20 }}
            onSubmit={handleSubmit} 
            className="space-y-6"
          >
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-2xl text-sm font-medium text-center">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 transition-colors group-focus-within:text-white" size={20} />
                <input
                  type="text"
                  placeholder="Full Name"
                  className="w-full bg-[#0c0d10] border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-primary-pink/50 focus:border-primary-pink/50 transition-all font-medium"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>

              <div className="relative group">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 transition-colors group-focus-within:text-white" size={20} />
                <input
                  type="number"
                  placeholder="Age"
                  min="18"
                  max="100"
                  className="w-full bg-[#0c0d10] border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-primary-pink/50 focus:border-primary-pink/50 transition-all font-medium"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  required
                />
              </div>

              <div className="relative group">
                <FileText className="absolute left-4 top-6 text-gray-500 transition-colors group-focus-within:text-white" size={20} />
                <textarea
                  placeholder="Your Bio (be yourself!)"
                  rows={4}
                  className="w-full bg-[#0c0d10] border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-primary-pink/50 focus:border-primary-pink/50 transition-all font-medium resize-none"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  required
                />
              </div>

              <div className="relative group">
                <Camera className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 transition-colors group-focus-within:text-white" size={20} />
                <input
                  type="url"
                  placeholder="Profile Image URL (optional)"
                  className="w-full bg-[#0c0d10] border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-primary-pink/50 focus:border-primary-pink/50 transition-all font-medium"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                />
                <p className="mt-2 text-xs text-gray-500 px-1">If blank, we'll generate a cool avatar for you! ✨</p>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-gradient-to-r from-[#FF7854] to-[#FF007F] rounded-full font-black text-xl shadow-[0_10px_30px_rgba(255,0,127,0.3)] hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group cursor-pointer"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="animate-spin" size={24} />
              ) : (
                <>
                  Complete Setup <Sparkles size={20} className="group-hover:rotate-12 transition-transform" />
                </>
              )}
            </button>
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
              <h3 className="text-3xl font-black italic">Profile Created!</h3>
              <p className="text-gray-400 font-medium">Redirecting you to find matches...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </AuthFormShell>
  );
}
