import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { LinearSearchLab } from './LinearSearchLab';
import { soundManager } from '../utils/audio';

interface SandboxModeProps {
  onExit: () => void;
  onOpenTheory?: () => void;
  initialTechnique?: any;
  initialTableSize?: number;
}

export const SandboxMode: React.FC<SandboxModeProps> = ({ onExit, onOpenTheory }) => {
  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-6 font-sans animate-page-enter">
      {/* Return to Game Completion Navigation */}
      <div className="flex items-center justify-start">
        <button
          id="btn-lab-exit-to-game"
          onClick={() => {
            soundManager.playClick();
            onExit();
          }}
          className="btn-modern-secondary px-4 sm:px-5 py-2.5 text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-xs select-none hover:border-[#2563EB] dark:hover:border-blue-500/40 transition-all group"
        >
          <ArrowLeft className="w-4 h-4 text-[#2563EB] dark:text-[#3B82F6] group-hover:-translate-x-1 transition-transform" />
          <span>← Back to Game Completion</span>
        </button>
      </div>

      {/* The Full Interactive Linear Search Lab */}
      <LinearSearchLab onExit={onExit} onOpenTheory={onOpenTheory} />
    </div>
  );
};
