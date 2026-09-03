import React from 'react';

/**
 * AIBotFloatingButton Component
 * 
 * Renders the exact circular AI Bot floating icon fixed to the bottom-right corner
 * across every page in the application, matching the master reference image with
 * absolute reference fidelity.
 * 
 * Strictly visual-only as specified (clicking performs no action / triggers no popup).
 */
export const AIBotFloatingButton: React.FC = () => {
  return (
    <button
      id="ai-bot-floating-button"
      type="button"
      aria-label="AI Assistant"
      className="fixed bottom-4 right-4 sm:bottom-5 sm:right-5 lg:bottom-6 lg:right-6 z-30 w-[56px] h-[56px] sm:w-[60px] sm:h-[60px] lg:w-[64px] lg:h-[64px] rounded-full p-0 flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95 shadow-xl hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 dark:focus:ring-offset-slate-900 select-none"
      onClick={(e) => {
        // Visual-only at this stage as strictly mandated
        e.preventDefault();
      }}
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full rounded-full overflow-hidden block"
      >
        <defs>
          {/* Main Saturated 3D Blue Badge Gradient */}
          <radialGradient id="masterBadgeGrad" cx="44%" cy="26%" r="74%">
            <stop offset="0%" stopColor="#2563EB" />
            <stop offset="45%" stopColor="#1D4ED8" />
            <stop offset="78%" stopColor="#1E40AF" />
            <stop offset="100%" stopColor="#172554" />
          </radialGradient>

          {/* Top Subtle Gloss Arc */}
          <linearGradient id="topGlossGlow" x1="50" y1="0" x2="50" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>

          {/* Robot White Head 3D Gradient */}
          <linearGradient id="robotBodyGrad" x1="50" y1="20" x2="50" y2="70" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="68%" stopColor="#F8FAFD" />
            <stop offset="90%" stopColor="#E2EBF8" />
            <stop offset="100%" stopColor="#CBD8F0" />
          </linearGradient>

          {/* Left Ear Inset Gradient */}
          <linearGradient id="leftEarInset" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#DBEAFE" />
            <stop offset="100%" stopColor="#2563EB" />
          </linearGradient>

          {/* Right Ear Inset Gradient */}
          <linearGradient id="rightEarInset" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#DBEAFE" />
            <stop offset="100%" stopColor="#6366F1" />
          </linearGradient>

          {/* Dark Navy Visor Screen */}
          <linearGradient id="visorGrad" x1="50" y1="30" x2="50" y2="62" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0B132C" />
            <stop offset="100%" stopColor="#040818" />
          </linearGradient>

          {/* Lower Book Base Glowing Cover (Royal Blue -> Subtle Violet) */}
          <linearGradient id="bookBottomCover" x1="16" y1="78" x2="84" y2="92" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#1D4ED8" />
            <stop offset="60%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#6366F1" />
          </linearGradient>

          {/* Middle Transition Layer */}
          <linearGradient id="bookCyanLayer" x1="20" y1="74" x2="80" y2="84" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#2563EB" />
            <stop offset="50%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#4F46E5" />
          </linearGradient>

          {/* Soft Depth Filter for Elements */}
          <filter id="softDepthShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="1.6" stdDeviation="1.6" floodColor="#021447" floodOpacity="0.35" />
          </filter>
        </defs>

        {/* 1. Base Circular Blue Badge */}
        <circle cx="50" cy="50" r="50" fill="url(#masterBadgeGrad)" />
        <circle cx="50" cy="50" r="49" stroke="url(#topGlossGlow)" strokeWidth="1.5" fill="none" opacity="0.6" />

        {/* 2. Top Antenna */}
        {/* Antenna Stem */}
        <path
          d="M50 17 L50 26.5"
          stroke="#FFFFFF"
          strokeWidth="3.4"
          strokeLinecap="round"
        />
        {/* Antenna Sphere Bulb */}
        <circle
          cx="50"
          cy="16.8"
          r="4.5"
          fill="#FFFFFF"
          filter="url(#softDepthShadow)"
        />
        {/* Antenna Bulb Soft Specular Highlight */}
        <circle
          cx="48.7"
          cy="15.4"
          r="1.4"
          fill="#FFFFFF"
          opacity="0.9"
        />

        {/* 3. Ear Pods (Left & Right) */}
        {/* Left Ear Outer Capsule */}
        <rect
          x="21.5"
          y="40.5"
          width="7.2"
          height="16.5"
          rx="3.6"
          fill="#FFFFFF"
          filter="url(#softDepthShadow)"
        />
        <rect
          x="23"
          y="43"
          width="3.6"
          height="11.5"
          rx="1.8"
          fill="url(#leftEarInset)"
        />

        {/* Right Ear Outer Capsule */}
        <rect
          x="71.3"
          y="40.5"
          width="7.2"
          height="16.5"
          rx="3.6"
          fill="#FFFFFF"
          filter="url(#softDepthShadow)"
        />
        <rect
          x="73.3"
          y="43"
          width="3.6"
          height="11.5"
          rx="1.8"
          fill="url(#rightEarInset)"
        />

        {/* 4. White Robot Head Capsule Shell */}
        <rect
          x="25"
          y="25"
          width="50"
          height="42"
          rx="18"
          fill="url(#robotBodyGrad)"
          filter="url(#softDepthShadow)"
        />

        {/* 5. Dark Navy Face Visor Panel */}
        <rect
          x="31"
          y="31.8"
          width="38"
          height="28.5"
          rx="12.5"
          fill="url(#visorGrad)"
        />

        {/* 6. Smiling Happy Arch Eyes */}
        {/* Left Eye - Happy Arch */}
        <path
          d="M37 46.8 C37 42.5 43 42.5 43 46.8"
          stroke="#FFFFFF"
          strokeWidth="3.6"
          strokeLinecap="round"
          fill="none"
        />
        {/* Right Eye - Happy Arch */}
        <path
          d="M57 46.8 C57 42.5 63 42.5 63 46.8"
          stroke="#FFFFFF"
          strokeWidth="3.6"
          strokeLinecap="round"
        fill="none"
        />

        {/* 7. Friendly Cyan Smile */}
        <path
          d="M45.2 52.8 C47.2 56 52.8 56 54.8 52.8"
          stroke="#3B82F6"
          strokeWidth="2.9"
          strokeLinecap="round"
          fill="none"
        />

        {/* 8. Robot Neck Connection */}
        <path
          d="M38 65.5 C38 65.5 43.5 70 50 70 C56.5 70 62 65.5 62 65.5 L62 74 L38 74 Z"
          fill="#D8E4F6"
        />

        {/* 9. Open Book Knowledge Base Element */}
        {/* Bottom Layer: Violet/Cyan Spread Cover */}
        <path
          d="M19 78 C33 78 44.5 83.5 50 87 C55.5 83.5 67 78 81 78 C82 84.5 78 90 73 92.5 C63 89 54.5 92.8 50 94.5 C45.5 92.8 37 89 27 92.5 C22 90 18 84.5 19 78 Z"
          fill="url(#bookBottomCover)"
        />

        {/* Middle Cyan Layer */}
        <path
          d="M21 75.2 C34 75.2 44.5 80.2 50 84 C55.5 80.2 66 75.2 79 75.2 L80 79 C68 79 56 84.5 50 88 C44 84.5 32 79 20 79 Z"
          fill="url(#bookCyanLayer)"
        />

        {/* Top White Book Pages (Left & Right) */}
        {/* Left Page */}
        <path
          d="M22 71 C34 71 44.5 76 49 79.5 L49 85.2 C44 82 33 77.5 21.5 77.5 C21.5 74.8 21.7 72.8 22 71 Z"
          fill="#FFFFFF"
        />
        {/* Right Page */}
        <path
          d="M78 71 C66 71 55.5 76 51 79.5 L51 85.2 C56 82 67 77.5 78.5 77.5 C78.5 74.8 78.3 72.8 78 71 Z"
          fill="#FFFFFF"
        />

        {/* Book Spine Center Line */}
        <line
          x1="50"
          y1="79.5"
          x2="50"
          y2="87.5"
          stroke="#0F4EB8"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      </svg>
    </button>
  );
};
