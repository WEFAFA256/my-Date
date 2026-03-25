"use client";
export const dynamic = 'force-dynamic';

import React, { useState } from "react";
import AuthFormShell from "@/components/auth-form-shell";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { Lock, Loader2, KeyRound, Eye, EyeOff, CheckCircle2 } from "lucide-react";

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.updateUser({
      password: password
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setIsSuccess(true);
      setTimeout(() => {
        router.push("/");
      }, 2000);
    }
  };

  return (
    <AuthFormShell title="Set New Password" subtitle="Make it strong and memorable!">
      {!isSuccess ? (
        <form onSubmit={handleUpdate} className="space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-2.5 rounded-2xl text-xs font-medium animate-shake text-center">
              {error}
            </div>
          )}

          <div className="space-y-2.5">
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 transition-colors group-focus-within:text-white" size={16} />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="New Password"
                className="w-full bg-[#0c0d10] border border-white/10 rounded-2xl py-3.5 pl-11 pr-11 outline-none focus:ring-2 focus:ring-primary-pink/50 transition-all font-medium text-white text-sm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 transition-colors group-focus-within:text-white" size={16} />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Confirm New Password"
                className="w-full bg-[#0c0d10] border border-white/10 rounded-2xl py-3.5 pl-11 pr-11 outline-none focus:ring-2 focus:ring-primary-pink/50 transition-all font-medium text-white text-sm"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
                Update Password <KeyRound className="group-hover:rotate-12 transition-transform" size={18} />
              </>
            )}
          </button>
        </form>
      ) : (
        <div className="flex flex-col items-center py-6 space-y-6 text-center">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center text-green-500 border border-green-500/50 shadow-[0_0_30px_rgba(34,197,94,0.3)]">
            <CheckCircle2 size={40} />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-[#FF7854] to-[#FF007F]">Password Updated!</h3>
            <p className="text-gray-400 font-medium text-sm px-4">
              Your password has been successfully reset. Redirecting you into the app...
            </p>
          </div>
        </div>
      )}
    </AuthFormShell>
  );
}
