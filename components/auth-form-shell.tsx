"use client";

import React from "react";
import { Leaf } from "lucide-react";
import { motion } from "framer-motion";

const LOVERS_BG = "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=1974&auto=format&fit=crop";

export default function AuthFormShell({ children, title, subtitle }: { children: React.ReactNode; title: string, subtitle: string }) {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-[100dvh] bg-[#0c0d10] text-white p-4 sm:p-6 overflow-hidden">
      {/* Lovers Background */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-50"
          style={{ backgroundImage: `url(${LOVERS_BG})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-[#0c0d10]/70 to-[#0c0d10]" />
      </div>

      <div className="relative z-10 w-full max-w-[420px] flex flex-col items-center justify-center py-6 sm:py-10">
        {/* Logo */}
        <div className="flex flex-col items-center gap-2 mb-8 shrink-0">
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="w-14 h-14 bg-gradient-to-br from-[#FF7854] to-[#FF007F] rounded-2xl flex items-center justify-center shadow-2xl shadow-primary-pink/20"
          >
            <Leaf size={32} className="text-white" fill="currentColor" />
          </motion.div>
          <motion.h1 
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-[#FF7854] to-[#FF007F] bg-clip-text text-transparent italic tracking-tight"
          >
            Matcha
          </motion.h1>
        </div>

        <motion.div 
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="w-full space-y-1 text-center mb-8 shrink-0 px-2"
        >
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight leading-tight">{title}</h2>
          <p className="text-gray-400 text-sm sm:text-base font-medium opacity-80">{subtitle}</p>
        </motion.div>

        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="w-full bg-[#1a1b22]/40 p-5 sm:p-8 rounded-[30px] sm:rounded-[40px] border border-white/10 shadow-2xl shadow-black/50 backdrop-blur-xl"
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}
