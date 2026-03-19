"use client";

import React, { useState } from "react";
import AuthFormShell from "@/components/auth-form-shell";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { Mail, Lock, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data: { user }, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${location.origin}/auth/callback?next=/setup-profile`,
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
    } else if (user) {
      // successful sign up
      router.push("/setup-profile");
    }
  };

  return (
    <AuthFormShell title="Start Swiping!" subtitle="Create your account to find your spark.">
      <form onSubmit={handleSignup} className="space-y-6">
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-2xl text-sm font-medium animate-shake text-center">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 transition-colors group-focus-within:text-white" size={20} />
            <input
              type="email"
              placeholder="Email address"
              className="w-full bg-[#0c0d10] border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-primary-pink/50 focus:border-primary-pink/50 transition-all font-medium"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 transition-colors group-focus-within:text-white" size={20} />
            <input
              type="password"
              placeholder="Password"
              className="w-full bg-[#0c0d10] border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-primary-pink/50 focus:border-primary-pink/50 transition-all font-medium"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
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
              Sign Up <ArrowRight className="group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>

        <p className="text-center text-gray-400 font-medium">
          Already have an account?{" "}
          <Link href="/login" className="text-primary-pink hover:underline">
            Login
          </Link>
        </p>
      </form>
    </AuthFormShell>
  );
}
