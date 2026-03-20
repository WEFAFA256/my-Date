"use client";

import React, { useState, useEffect } from "react";
import AuthFormShell from "@/components/auth-form-shell";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { Mail, Lock, Loader2, UserPlus, Eye, EyeOff, Check, X } from "lucide-react";
import Link from "next/link";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    hasUpper: false,
    hasLower: false,
    hasNumber: false,
    hasSymbol: false,
    isMinLength: false
  });

  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSymbol = /[^A-Za-z0-9]/.test(password);
    const isMinLength = password.length >= 8;

    let score = 0;
    if (hasUpper) score++;
    if (hasLower) score++;
    if (hasNumber) score++;
    if (hasSymbol) score++;
    if (isMinLength) score++;

    setPasswordStrength({
      score,
      hasUpper,
      hasLower,
      hasNumber,
      hasSymbol,
      isMinLength
    });
  }, [password]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (passwordStrength.score < 4) {
      setError("Please choose a stronger password");
      return;
    }

    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${location.origin}/auth/callback?next=/setup-profile`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/login?message=Check your email to confirm your account");
    }
  };

  const handleGoogleSignup = async () => {
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
    <AuthFormShell title="Join the Batch!" subtitle="Your perfect match is just a leaf away.">
      <div className="space-y-2.5 sm:space-y-4">
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-2.5 rounded-2xl text-[11px] sm:text-xs font-medium animate-shake text-center">
            {error}
          </div>
        )}

        {/* Google Auth Button */}
        <button
          onClick={handleGoogleSignup}
          disabled={googleLoading}
          className="w-full py-2.5 sm:py-3 bg-white border border-white/10 rounded-full font-bold text-black flex items-center justify-center gap-2 sm:gap-3 hover:bg-gray-100 active:scale-[0.98] transition-all cursor-pointer shadow-lg text-xs sm:text-sm"
        >
          {googleLoading ? (
            <Loader2 className="animate-spin" size={18} />
          ) : (
            <>
              <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24">
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
              Sign up with Google
            </>
          )}
        </button>

        <div className="relative flex items-center py-0.5 sm:py-1">
            <div className="flex-grow border-t border-white/10"></div>
            <span className="flex-shrink mx-4 text-[9px] font-bold uppercase tracking-widest text-gray-500">OR</span>
            <div className="flex-grow border-t border-white/10"></div>
        </div>

        <form onSubmit={handleSignup} className="space-y-2.5 sm:space-y-3">
          <div className="space-y-2 sm:space-y-2.5">
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 transition-colors group-focus-within:text-white" size={16} />
              <input
                type="email"
                placeholder="Email address"
                className="w-full bg-[#0c0d10] border border-white/10 rounded-2xl py-2.5 sm:py-3 pl-11 pr-4 outline-none focus:ring-2 focus:ring-primary-pink/50 focus:border-primary-pink/50 transition-all font-medium text-white text-xs sm:text-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1 sm:space-y-1.5">
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 transition-colors group-focus-within:text-white" size={16} />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  className="w-full bg-[#0c0d10] border border-white/10 rounded-2xl py-2.5 sm:py-3 pl-11 pr-11 outline-none focus:ring-2 focus:ring-primary-pink/50 focus:border-primary-pink/50 transition-all font-medium text-white text-xs sm:text-sm"
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

              {/* Password Strength Gauge */}
              {password.length > 0 && (
                <div className="px-2 space-y-1 sm:space-y-1.5">
                  <div className="flex gap-1 h-1">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={`flex-1 rounded-full transition-all duration-500 ${
                          passwordStrength.score >= level
                            ? level <= 2
                              ? "bg-red-500"
                              : level <= 4
                              ? "bg-yellow-500"
                              : "bg-green-500"
                            : "bg-white/10"
                        }`}
                      />
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-x-2 gap-y-0.5">
                    <StrengthItem label="Uppercase" met={passwordStrength.hasUpper} />
                    <StrengthItem label="Lowercase" met={passwordStrength.hasLower} />
                    <StrengthItem label="Number" met={passwordStrength.hasNumber} />
                    <StrengthItem label="Symbol" met={passwordStrength.hasSymbol} />
                    <StrengthItem label="8+ Characters" met={passwordStrength.isMinLength} />
                  </div>
                </div>
              )}
            </div>

            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 transition-colors group-focus-within:text-white" size={16} />
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm Password"
                className="w-full bg-[#0c0d10] border border-white/10 rounded-2xl py-2.5 sm:py-3 pl-11 pr-11 outline-none focus:ring-2 focus:ring-primary-pink/50 focus:border-primary-pink/50 transition-all font-medium text-white text-xs sm:text-sm"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-[#FF7854] to-[#FF007F] rounded-full font-black text-base sm:text-lg shadow-[0_10px_20px_rgba(255,0,127,0.2)] hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group cursor-pointer text-white mt-2"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                Sign Up <UserPlus className="group-hover:rotate-12 transition-transform" size={18} />
              </>
            )}
          </button>

          <p className="text-center text-gray-400 font-medium text-xs sm:text-sm mt-1 sm:mt-2">
            Already have an account?{" "}
            <Link href="/login" className="text-primary-pink hover:underline">
              Log In
            </Link>
          </p>
        </form>
      </div>
    </AuthFormShell>
  );
}

function StrengthItem({ label, met }: { label: string; met: boolean }) {
  return (
    <div className="flex items-center gap-2">
      {met ? (
        <Check size={12} className="text-green-500" />
      ) : (
        <X size={12} className="text-gray-500" />
      )}
      <span className={`text-[10px] font-bold uppercase tracking-wider ${met ? "text-green-500/80" : "text-gray-500"}`}>
        {label}
      </span>
    </div>
  );
}
