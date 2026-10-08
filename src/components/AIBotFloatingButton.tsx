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
      className="fixed bottom-4 right-4 sm:bottom-5 sm:right-5 lg:bottom-6 lg:right-6 z-30 w-[56px] h-[56px] sm:w-[60px] sm:h-[60px] lg:w-[64px] lg:h-[64px] rounded-full p-0 flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95 shadow-md dark:shadow-none hover:shadow-lg dark:hover:shadow-none focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:ring-offset-2 dark:focus:ring-offset-slate-900 select-none overflow-hidden"
      onClick={(e) => {
        // Visual-only at this stage as strictly mandated
        e.preventDefault();
      }}
    >
      <img
        src="/webicon.png"
        alt="AI Assistant"
        className="w-full h-full object-contain rounded-full select-none pointer-events-none"
        draggable={false}
      />
    </button>
  );
};
