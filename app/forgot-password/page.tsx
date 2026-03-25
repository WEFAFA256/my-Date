"use client";
export const dynamic = 'force-dynamic';

import React, { useState } from "react";
import AuthFormShell from "@/components/auth-form-shell";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { Mail, Loader2, KeyRound, ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const supabase = createClient();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${location.origin}/auth/callback?next=/update-password`,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setIsSuccess(true);
      setLoading(false);
    }
  };

  return (
    <AuthFormShell title="Reset Password" subtitle="Don't worry, we'll get you back in!">
      <AnimatePresence mode="wait">
        {!isSuccess ? (
          <motion.form 
            key="reset-form"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onSubmit={handleReset} 
            className="space-y-4"
          >
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-2.5 rounded-2xl text-xs font-medium animate-shake text-center">
                {error}
              </div>
            )}

            <div className="space-y-3">
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 transition-colors group-focus-within:text-white" size={16} />
                <input
                  type="email"
                  placeholder="Enter your email address"
                  className="w-full bg-[#0c0d10] border border-white/10 rounded-2xl py-3.5 pl-11 pr-4 outline-none focus:ring-2 focus:ring-primary-pink/50 transition-all font-medium text-white text-sm"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-primary-orange to-primary-pink rounded-full font-black text-lg shadow-[0_10px_20px_rgba(255,0,127,0.2)] hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group cursor-pointer text-white mt-4"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  Send Reset Link <KeyRound className="group-hover:rotate-12 transition-transform" size={18} />
                </>
              )}
            </button>

            <Link href="/login" className="block text-center text-gray-400 font-medium text-sm mt-4 hover:text-white transition-colors">
              Wait, I remember my password!
            </Link>
          </motion.form>
        ) : (
          <motion.div 
            key="success"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="flex flex-col items-center py-6 space-y-6 text-center"
          >
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center text-green-500 border border-green-500/50 shadow-[0_0_30px_rgba(34,197,94,0.3)]">
              <CheckCircle2 size={40} />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-[#FF7854] to-[#FF007F]">Check your email</h3>
              <p className="text-gray-400 font-medium text-sm px-4">
                We've sent a password reset link to <strong className="text-white">{email}</strong>. 
                Please check your inbox (and spam folder) to reset your password.
              </p>
            </div>
            
            <Link href="/login" className="w-full py-3.5 bg-white/5 border border-white/10 rounded-full font-black text-sm flex items-center justify-center gap-2 hover:bg-white/10 active:scale-[0.98] transition-all cursor-pointer text-white mt-4">
               Return to Login <ArrowRight size={16} />
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </AuthFormShell>
  );
}
