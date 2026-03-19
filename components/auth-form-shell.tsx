"use client";

import React from "react";
import { Leaf } from "lucide-react";

export default function AuthFormShell({ children, title, subtitle }: { children: React.ReactNode; title: string, subtitle: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0c0d10] text-white p-6">
      <div className="w-full max-w-[450px] space-y-8 flex flex-col items-center">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-20 h-20 bg-gradient-to-br from-[#FF7854] to-[#FF007F] rounded-3xl flex items-center justify-center shadow-2xl shadow-primary-pink/20">
            <Leaf size={48} className="text-white" fill="currentColor" />
          </div>
          <h1 className="text-4xl font-black bg-gradient-to-r from-[#FF7854] to-[#FF007F] bg-clip-text text-transparent italic tracking-tight">
            Matcha
          </h1>
        </div>

        <div className="w-full space-y-2 text-center">
          <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
          <p className="text-gray-400 text-lg font-medium">{subtitle}</p>
        </div>

        <div className="w-full bg-[#1a1b22] p-8 rounded-[40px] border border-white/5 shadow-2xl shadow-black/50 backdrop-blur-sm">
          {children}
        </div>
      </div>
    </div>
  );
}
