import React from 'react';
import { ArrowRight, CornerDownRight, Check, Sparkles } from 'lucide-react';

export interface CLLNodeViewProps {
  id: string;
  value: number;
  isHead?: boolean;
  isCurrent?: boolean;
  isPrev?: boolean;
  isTarget?: boolean;
  isNew?: boolean;
  isSelected?: boolean;
  isVisited?: boolean;
  isFadingOut?: boolean;
  hasBrokenPointer?: boolean;
  nextLabel?: string;
  onClick?: () => void;
  onNextClick?: () => void;
  showNextPointerDot?: boolean;
  customBadge?: string;
}

export const CLLNodeView: React.FC<CLLNodeViewProps> = ({
  id,
  value,
  isHead = false,
  isCurrent = false,
  isPrev = false,
  isTarget = false,
  isNew = false,
  isSelected = false,
  isVisited = false,
  isFadingOut = false,
  hasBrokenPointer = false,
  nextLabel = 'NEXT',
  onClick,
  onNextClick,
  showNextPointerDot = true,
  customBadge,
}) => {
  return (
    <div
      id={`cll-node-container-${id}`}
      className={`relative flex flex-col items-center select-none transition-all duration-300 ${
        isFadingOut ? 'opacity-0 scale-75 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* Dynamic Top Indicator Badges */}
      <div className="h-7 mb-1 flex items-center gap-1.5 justify-center">
        {isHead && (
          <div className="px-2 py-0.5 rounded-md bg-blue-600 dark:bg-blue-500 text-white font-mono font-bold text-[10px] tracking-wider uppercase shadow-xs flex items-center gap-1 animate-pulse">
            <span>HEAD</span>
            <span className="text-blue-200">↓</span>
          </div>
        )}

        {isCurrent && (
          <div className="px-2 py-0.5 rounded-md bg-amber-500 dark:bg-amber-400 text-slate-900 font-mono font-bold text-[10px] tracking-wider uppercase shadow-xs flex items-center gap-1">
            <span>CURRENT</span>
            <span>↓</span>
          </div>
        )}

        {isPrev && (
          <div className="px-2 py-0.5 rounded-md bg-purple-600 dark:bg-purple-500 text-white font-mono font-bold text-[10px] tracking-wider uppercase shadow-xs">
            PREV
          </div>
        )}

        {isTarget && (
          <div className="px-2 py-0.5 rounded-md bg-emerald-600 dark:bg-emerald-500 text-white font-mono font-bold text-[10px] tracking-wider uppercase shadow-xs">
            TARGET
          </div>
        )}

        {isNew && (
          <div className="px-2 py-0.5 rounded-md bg-cyan-600 dark:bg-cyan-500 text-white font-mono font-bold text-[10px] tracking-wider uppercase shadow-xs flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5" />
            <span>NEW</span>
          </div>
        )}

        {customBadge && (
          <div className="px-2 py-0.5 rounded-md bg-slate-700 text-white font-mono font-bold text-[10px] tracking-wider uppercase shadow-xs">
            {customBadge}
          </div>
        )}
      </div>

      {/* Node Box: [ DATA | NEXT ] */}
      <div
        onClick={onClick}
        className={`group flex items-stretch rounded-xl border-2 shadow-xs transition-all duration-200 cursor-pointer overflow-hidden ${
          isSelected
            ? 'border-[#2563EB] dark:border-blue-400 ring-4 ring-blue-500/20 scale-105 bg-blue-50/70 dark:bg-blue-950/60'
            : isCurrent
            ? 'border-amber-500 dark:border-amber-400 ring-4 ring-amber-500/20 bg-amber-50/40 dark:bg-amber-950/30'
            : isVisited
            ? 'border-emerald-500/80 dark:border-emerald-500/60 bg-emerald-50/30 dark:bg-emerald-950/20'
            : isPrev
            ? 'border-purple-500 dark:border-purple-400 bg-purple-50/40 dark:bg-purple-950/30'
            : isNew
            ? 'border-cyan-500 dark:border-cyan-400 bg-cyan-50/40 dark:bg-cyan-950/30'
            : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-[#111827] hover:border-blue-400 dark:hover:border-blue-500'
        }`}
      >
        {/* DATA Cell */}
        <div className="px-3.5 sm:px-4 py-2.5 sm:py-3 flex flex-col items-center justify-center min-w-[54px] sm:min-w-[62px] bg-slate-50/80 dark:bg-[#0F172A]/80 border-r border-slate-200 dark:border-slate-700/80">
          <span className="text-[9px] font-mono uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">
            DATA
          </span>
          <span className="text-base sm:text-lg font-mono font-extrabold text-slate-800 dark:text-white">
            {value}
          </span>
        </div>

        {/* NEXT Pointer Cell */}
        <button
          type="button"
          onClick={(e) => {
            if (onNextClick) {
              e.stopPropagation();
              onNextClick();
            }
          }}
          className={`px-2.5 sm:px-3 py-2.5 sm:py-3 flex flex-col items-center justify-center min-w-[50px] sm:min-w-[56px] transition-colors ${
            hasBrokenPointer
              ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400'
              : onNextClick
              ? 'hover:bg-blue-100/60 dark:hover:bg-blue-900/40 cursor-pointer'
              : ''
          }`}
          title={onNextClick ? 'Click to redirect NEXT pointer' : 'NEXT Pointer'}
        >
          <span className="text-[9px] font-mono uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">
            {nextLabel}
          </span>
          <div className="flex items-center gap-1 font-mono font-semibold text-xs text-blue-600 dark:text-blue-400">
            {showNextPointerDot ? (
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 dark:bg-blue-400 ring-2 ring-blue-300 dark:ring-blue-800 flex items-center justify-center">
                <span className="w-1 h-1 rounded-full bg-white"></span>
              </span>
            ) : (
              <ArrowRight className="w-3.5 h-3.5" />
            )}
          </div>
        </button>
      </div>
    </div>
  );
};
