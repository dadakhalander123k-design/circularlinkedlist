import React from 'react';
import {
  Menu,
  Volume2,
  VolumeX,
  RotateCcw,
  Moon,
  Sun,
} from 'lucide-react';
import { MainViewTab, TechniqueType } from '../types/game';
import { soundManager } from '../utils/audio';
import { useTheme } from '../utils/themeContext';
import { AlgoLearnLogo } from './AlgoLearnLogo';

export interface TopHeaderProps {
  activeTab: MainViewTab;
  currentLevelId: number;
  score: number;
  streak: number;
  technique: TechniqueType;
  isMuted: boolean;
  onToggleMute: () => void;
  speed?: number;
  onChangeSpeed?: (newSpeed: number) => void;
  onResetLevel: () => void;
  onResetAllProgress: () => void;
  onToggleMobileSidebar: () => void;
  onOpenHelpModal?: () => void;
  onOpenSettingsModal?: () => void;
  isDesktopSidebarOpen?: boolean;
  isMobileSidebarOpen?: boolean;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  activeTab,
  currentLevelId,
  score,
  streak,
  technique,
  isMuted,
  onToggleMute,
  speed,
  onChangeSpeed,
  onResetLevel,
  onResetAllProgress,
  onToggleMobileSidebar,
  isDesktopSidebarOpen = true,
  isMobileSidebarOpen = false,
}) => {
  const { theme, toggleTheme } = useTheme();

  const getPageName = () => {
    switch (activeTab) {
      case 'HOME':
        return 'Overview';
      case 'THEORY':
        return 'Learn';
      case 'VIDEO':
        return 'Visualize';
      case 'GAME':
      case 'QUEST':
        return 'Game';
      case 'LAB':
        return 'Lab';
      case 'QUIZ':
        return 'Quiz';
      case 'PROGRESS':
        return 'Progress';
      default:
        return 'Learn';
    }
  };

  const pageName = getPageName();
  const isGameMode = activeTab === 'GAME' || activeTab === 'QUEST';

  const showHamburgerDesktop = !isDesktopSidebarOpen;
  const showHamburgerMobile = !isMobileSidebarOpen;
  const hamburgerVisibilityClass =
    showHamburgerDesktop && showHamburgerMobile
      ? 'flex'
      : showHamburgerDesktop && !showHamburgerMobile
        ? 'hidden lg:flex'
        : !showHamburgerDesktop && showHamburgerMobile
          ? 'flex lg:hidden'
          : 'hidden';

  return (
    <header
      id="app-top-header"
      className={`fixed top-0 right-0 left-0 ${isDesktopSidebarOpen ? 'lg:left-64' : 'lg:left-0'
        } z-20 bg-white dark:bg-[#0F172A]/95 border-b border-slate-200 dark:border-blue-500/20 shadow-xs backdrop-blur-md transition-all duration-300`}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2 sm:py-2.5 flex items-center justify-between gap-2 sm:gap-4">
        {/* Left Side: 1. Menu Button (when sidebar is closed) -> 2. AlgoLearn Logo -> 3. Current Section */}
        <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
          {/* 1. THREE-BAR MENU / HAMBURGER BUTTON (Strictly visible ONLY when navigation sidebar is CLOSED) */}
          <button
            id="btn-sidebar-toggle"
            onClick={onToggleMobileSidebar}
            className={`p-1.5 sm:p-2 text-slate-600 dark:text-slate-200 hover:text-[#2563EB] dark:hover:text-[#3B82F6] bg-slate-100/80 dark:bg-blue-950/40 hover:bg-[#EFF6FF] dark:hover:bg-blue-900/50 border border-slate-200 dark:border-blue-500/30 rounded-xl transition-all duration-150 cursor-pointer shrink-0 shadow-xs items-center justify-center ${hamburgerVisibilityClass}`}
            title="Open Navigation Menu (☰)"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* 2. ALGOLEARN LOGO (EXACT IMAGE) */}
          <div className="flex items-center shrink-0">
            <AlgoLearnLogo theme={theme} className="h-8 sm:h-9 w-auto" />
          </div>

          {/* 3. CURRENT PAGE / SECTION (SECONDARY) */}
          <div className="hidden xs:flex items-center gap-2 pl-2.5 sm:pl-3 border-l border-slate-200 dark:border-blue-500/25 min-w-0">
            <span className="text-xs sm:text-sm font-semibold text-[#2563EB] dark:text-[#3B82F6] font-sans tracking-wide leading-none truncate">
              {pageName}
            </span>
          </div>
        </div>

        {/* Right Side: Essential Utilities (Theme, Mute, Reset) - NO XP/PTS */}
        <div className="flex items-center gap-1 sm:gap-2.5 shrink-0">
          {/* Theme Mode Toggle */}
          <button
            id="btn-theme-toggle"
            onClick={() => {
              soundManager.playToggle(theme !== 'dark');
              toggleTheme();
            }}
            className="p-1.5 sm:p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-blue-950/40 border border-slate-200 dark:border-blue-500/30 rounded-xl transition-all cursor-pointer shadow-xs"
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700" />
            )}
          </button>

          {/* Sound Mute Toggle */}
          <button
            id="btn-header-mute"
            onClick={onToggleMute}
            className="p-1.5 sm:p-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-blue-950/40 border border-slate-200 dark:border-blue-500/30 rounded-xl transition-colors cursor-pointer shadow-xs"
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            aria-label={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-slate-400" />
            ) : (
              <Volume2 className="w-4 h-4 text-[#2563EB] dark:text-[#3B82F6]" />
            )}
          </button>

          {/* Reset Progress Button */}
          <button
            id="btn-header-reset-progress"
            onClick={() => {
              soundManager.playModalOpen();
              onResetAllProgress();
            }}
            className="p-1.5 sm:p-2 text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-slate-200 dark:border-blue-500/30 rounded-xl transition-colors cursor-pointer shadow-xs"
            title="Reset Progress"
            aria-label="Reset Progress"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
