"use client";
export const dynamic = 'force-dynamic';

import React, { useState } from "react";
import AuthFormShell from "@/components/auth-form-shell";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { Mail, Lock, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/");
      router.refresh();
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${location.origin}/auth/callback?next=/setup-profile`,
      },
    });

    if (error) {
      setError(error.message);
      setGoogleLoading(false);
    }
  };

  return (
    <AuthFormShell title="Welcome Back!" subtitle="Ready for some more sparks?">
      <div className="space-y-3 sm:space-y-4">
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-2.5 rounded-2xl text-[11px] sm:text-xs font-medium animate-shake text-center">
            {error}
          </div>
        )}

        {/* Google Auth Button */}
        <button
          onClick={handleGoogleLogin}
          disabled={googleLoading}
          className="w-full py-2.5 sm:py-3.5 bg-white border border-white/10 rounded-full font-bold text-black flex items-center justify-center gap-2 sm:gap-3 hover:bg-gray-100 active:scale-[0.98] transition-all cursor-pointer shadow-lg text-xs sm:text-sm"
        >
          {googleLoading ? (
            <Loader2 className="animate-spin" size={18} />
          ) : (
            <>
              <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </>
          )}
        </button>

        <div className="relative flex items-center py-1 sm:py-2">
            <div className="flex-grow border-t border-white/10"></div>
            <span className="flex-shrink mx-4 text-[9px] sm:text-xs font-bold uppercase tracking-widest text-gray-500">OR</span>
            <div className="flex-grow border-t border-white/10"></div>
        </div>

        <form onSubmit={handleLogin} className="space-y-3 sm:space-y-4">
          <div className="space-y-2 sm:space-y-3">
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 transition-colors group-focus-within:text-white" size={16} />
              <input
                type="email"
                placeholder="Email address"
                className="w-full bg-[#0c0d10] border border-white/10 rounded-2xl py-2.5 sm:py-3.5 pl-11 pr-4 outline-none focus:ring-2 focus:ring-primary-pink/50 focus:border-primary-pink/50 transition-all font-medium text-white text-xs sm:text-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 transition-colors group-focus-within:text-white" size={16} />
              <input
                type="password"
                placeholder="Password"
                className="w-full bg-[#0c0d10] border border-white/10 rounded-2xl py-2.5 sm:py-3.5 pl-11 pr-4 outline-none focus:ring-2 focus:ring-primary-pink/50 focus:border-primary-pink/50 transition-all font-medium text-white text-xs sm:text-sm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 sm:py-3.5 bg-gradient-to-r from-[#FF7854] to-[#FF007F] rounded-full font-black text-base sm:text-lg shadow-[0_10px_20px_rgba(255,0,127,0.2)] hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group cursor-pointer text-white"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                Log In <ArrowRight className="group-hover:translate-x-1 transition-transform" size={18} />
              </>
            )}
          </button>

          <div className="flex flex-col gap-2 mt-4 sm:mt-6">
            <Link href="/forgot-password" className="text-center text-primary-pink font-bold text-xs hover:underline transition-all">
              Forgot Password?
            </Link>
            
            <p className="text-center text-gray-400 font-medium text-xs sm:text-sm mt-1">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="text-primary-pink hover:underline font-bold">
                Sign Up
              </Link>
            </p>
          </div>
        </form>
      </div>
    </AuthFormShell>
  );
}
