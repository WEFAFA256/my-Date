"use client";

import React, { useState, useEffect } from 'react';
import { Search, Check, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const UGANDAN_UNIVERSITIES = [
  "Makerere University (MAK)",
  "Mbarara University of Science and Technology (MUST)",
  "Kyambogo University (KYU)",
  "Gulu University",
  "Busitema University",
  "Kabale University",
  "Lira University",
  "Muni University",
  "Soroti University",
  "Uganda Management Institute (UMI)",
  "Uganda Christian University (UCU)",
  "Kampala International University (KIU)",
  "Islamic University in Uganda (IUIU)",
  "Ndejje University",
  "Uganda Martyrs University (UMU)",
  "Nkumba University",
  "International University of East Africa (IUEA)",
  "Bugema University",
  "Victoria University",
  "Mountains of the Moon University",
  "Bishop Stuart University",
  "ISBAT University",
  "Cavendish University Uganda",
  "LivingStone International University",
  "Muteesa I Royal University",
  "Africa Renewal University",
  "Clarke International University",
  "St. Lawrence University",
];

interface UniversitySelectorProps {
  onSelect: (uni: string) => void;
  selected?: string;
}

export const UniversitySelector = ({ onSelect, selected }: UniversitySelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [filteredUnis, setFilteredUnis] = useState(UGANDAN_UNIVERSITIES);

  useEffect(() => {
    setFilteredUnis(
      UGANDAN_UNIVERSITIES.filter(uni => 
        uni.toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [search]);

  return (
    <div className="relative w-full">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-left hover:border-matcha/50 transition-all focus:outline-none shadow-inner"
      >
        <div className="flex flex-col">
            <span className="text-[9px] font-black text-text-dim uppercase tracking-[0.2em] italic mb-1 leading-none">Your Campus</span>
            <span className={`text-base font-black italic tracking-tighter ${selected ? "text-white" : "text-text-dim/50"}`}>
            {selected || "Find your university..."}
            </span>
        </div>
        <ChevronDown className={`w-5 h-5 text-matcha transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute z-50 w-full mt-3 bg-card-dark border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden backdrop-blur-3xl"
          >
            <div className="p-4 border-b border-white/5 bg-white/5">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-matcha" />
                <input
                  type="text"
                  placeholder="Type university name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-3 bg-transparent text-white placeholder:text-text-dim/40 focus:outline-none text-sm font-black italic tracking-tight"
                  autoFocus
                />
              </div>
            </div>

            <div className="max-h-60 overflow-y-auto custom-scrollbar">
              {filteredUnis.length > 0 ? (
                filteredUnis.map((uni) => (
                  <button
                    key={uni}
                    onClick={() => {
                      onSelect(uni);
                      setIsOpen(false);
                      setSearch("");
                    }}
                    className="w-full px-5 py-4 text-left hover:bg-matcha transition-colors group flex items-center justify-between"
                  >
                    <span className="text-sm text-text-dim font-black italic tracking-tighter group-hover:text-black transition-colors uppercase">
                      {uni}
                    </span>
                    {selected === uni && <Check className="w-5 h-5 text-matcha group-hover:text-black" />}
                  </button>
                ))
              ) : (
                <div className="p-8 text-center text-xs font-black text-text-dim italic uppercase tracking-widest">
                  Not found... ⚡️
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
