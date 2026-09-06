import React from 'react';

/**
 * AIBotFloatingButton Component
 * 
 * Renders the circular AI Bot floating icon fixed to the bottom-right corner
 * across every page in the application, matching Image 1 with absolute visual fidelity.
 * 
 * Strictly visual icon replacement as specified while preserving container positioning,
 * sizing, accessibility, and interaction behavior.
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
      <img
        src="/ai-bot-icon.png"
        alt="AI Assistant"
        className="w-full h-full rounded-full object-contain pointer-events-none select-none"
        draggable={false}
      />
    </button>
  );
};
