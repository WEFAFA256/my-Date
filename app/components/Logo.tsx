import React from 'react';

export const Logo = ({ className = "" }: { className?: string }) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Sunset Spark Icon */}
      <div className="relative w-10 h-10 flex items-center justify-center">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full text-matcha"
        >
          {/* Main Glow Shape */}
          <circle cx="12" cy="12" r="10" fill="currentColor" fillOpacity="0.15" />
          {/* Flame/Spark Shape */}
          <path
            d="M12 2C12 2 12 10 4 14C4 18.4183 7.58172 22 12 22C16.4183 22 20 18.4183 20 14C20 10 12 2 12 2Z"
            fill="currentColor"
          />
          <path
             d="M12 8L12 16M8 12L16 12"
             stroke="white"
             strokeWidth="2"
             strokeLinecap="round"
             opacity="0.8"
          />
        </svg>
      </div>
      
      {/* Matcha Typography */}
      <span className="text-2xl font-black lowercase tracking-tighter text-white italic drop-shadow-md">
        matcha
      </span>
    </div>
  );
};
