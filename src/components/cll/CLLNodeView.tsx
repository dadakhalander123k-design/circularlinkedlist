import React, { useState } from 'react';
import { ArrowRight, Check, Sparkles, CornerDownRight } from 'lucide-react';

export interface CLLNodeViewProps {
  id: string;
  address: number;
  value: number;
  nextAddress?: number | null | string;
  isHead?: boolean;
  isTail?: boolean;
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
  onApplyNextAddress?: (fromAddress: number, targetAddress: number) => void;
  showNextPointerDot?: boolean;
  customBadge?: string;
  allowAddressInput?: boolean;
}

export const CLLNodeView: React.FC<CLLNodeViewProps> = ({
  id,
  address,
  value,
  nextAddress,
  isHead = false,
  isTail = false,
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
  onApplyNextAddress,
  showNextPointerDot = true,
  customBadge,
  allowAddressInput = true,
}) => {
  const [isEditingAddress, setIsEditingAddress] = useState<boolean>(false);
  const [inputVal, setInputVal] = useState<string>('');

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const num = parseInt(inputVal.trim(), 10);
    if (!isNaN(num) && onApplyNextAddress) {
      onApplyNextAddress(address, num);
      setIsEditingAddress(false);
      setInputVal('');
    }
  };

  return (
    <div
      id={`cll-node-container-${id}`}
      className={`relative flex flex-col items-center select-none transition-all duration-300 ${
        isFadingOut ? 'opacity-0 scale-75 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* Dynamic Top Indicator Badges */}
      <div className="h-7 mb-1 flex items-center gap-1.5 justify-center">
        {isHead && !isTail && (
          <div className="px-2.5 py-0.5 rounded-md bg-blue-600 dark:bg-blue-500 text-white font-mono font-bold text-xs tracking-wider uppercase shadow-xs flex items-center gap-1 animate-pulse">
            <span>HEAD</span>
            <span className="text-blue-200">↓</span>
          </div>
        )}

        {isTail && !isHead && (
          <div className="px-2.5 py-0.5 rounded-md bg-[#1D4ED8] dark:bg-[#2563EB] text-white font-mono font-bold text-xs tracking-wider uppercase shadow-xs flex items-center gap-1">
            <span>TAIL</span>
            <span className="text-blue-200">↓</span>
          </div>
        )}

        {isHead && isTail && (
          <div className="px-2.5 py-0.5 rounded-md bg-gradient-to-r from-[#1D4ED8] via-[#2563EB] to-[#6366F1] text-white font-mono font-bold text-xs tracking-wider uppercase shadow-xs flex items-center gap-1 animate-pulse">
            <span>HEAD • TAIL</span>
            <span className="text-blue-200">↓</span>
          </div>
        )}

        {isCurrent && (
          <div className="px-2.5 py-0.5 rounded-md bg-amber-500 dark:bg-amber-400 text-slate-900 font-mono font-bold text-xs tracking-wider uppercase shadow-xs flex items-center gap-1">
            <span>CURRENT</span>
            <span>↓</span>
          </div>
        )}

        {isPrev && (
          <div className="px-2.5 py-0.5 rounded-md bg-[#1E40AF] dark:bg-[#1D4ED8] text-white font-mono font-bold text-xs tracking-wider uppercase shadow-xs">
            PREV
          </div>
        )}

        {isTarget && (
          <div className="px-2.5 py-0.5 rounded-md bg-emerald-600 dark:bg-emerald-500 text-white font-mono font-bold text-xs tracking-wider uppercase shadow-xs">
            TARGET
          </div>
        )}

        {isNew && (
          <div className="px-2.5 py-0.5 rounded-md bg-[#2563EB] dark:bg-[#3B82F6] text-white font-mono font-bold text-xs tracking-wider uppercase shadow-xs flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            <span>NEW</span>
          </div>
        )}

        {customBadge && (
          <div className="px-2.5 py-0.5 rounded-md bg-slate-700 text-white font-mono font-bold text-xs tracking-wider uppercase shadow-xs">
            {customBadge}
          </div>
        )}
      </div>

      {/* Node Box: [ ADDRESS | DATA | NEXT ] */}
      <div
        onClick={onClick}
        className={`group flex flex-col rounded-xl border-2 shadow-xs transition-all duration-200 cursor-pointer overflow-hidden min-w-[135px] sm:min-w-[155px] ${
          isSelected
            ? 'border-[#2563EB] dark:border-blue-400 ring-4 ring-blue-500/20 scale-105 bg-blue-50/70 dark:bg-blue-950/60'
            : isCurrent
            ? 'border-amber-500 dark:border-amber-400 ring-4 ring-amber-500/20 bg-amber-50/40 dark:bg-amber-950/30'
            : isVisited
            ? 'border-emerald-500/80 dark:border-emerald-500/60 bg-emerald-50/30 dark:bg-emerald-950/20'
            : isPrev
            ? 'border-[#1E40AF] dark:border-[#1D4ED8] bg-blue-50/50 dark:bg-blue-950/40'
            : isNew
            ? 'border-[#2563EB] dark:border-[#3B82F6] bg-blue-50/40 dark:bg-blue-950/30'
            : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-[#111827] hover:border-blue-400 dark:hover:border-blue-500'
        }`}
      >
        {/* Tier 1: ADDRESS */}
        <div className="px-3 py-1 bg-slate-100/90 dark:bg-slate-800/90 border-b border-slate-200 dark:border-slate-700/80 flex items-center justify-between text-xs font-mono">
          <span className="font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            ADDR
          </span>
          <span className="font-extrabold text-xs sm:text-sm text-blue-700 dark:text-blue-300 bg-white dark:bg-[#0B1120] px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
            {address}
          </span>
        </div>

        {/* Tier 2: DATA & NEXT side-by-side */}
        <div className="flex items-stretch flex-1">
          {/* DATA Section */}
          <div className="flex-1 px-3 py-2 flex flex-col items-center justify-center bg-slate-50/60 dark:bg-[#0F172A]/60 border-r border-slate-200 dark:border-slate-700/80">
            <span className="text-xs font-mono uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">
              DATA
            </span>
            <span className="text-lg sm:text-xl font-mono font-extrabold text-slate-800 dark:text-white">
              {value}
            </span>
          </div>

          {/* NEXT Pointer Section with Address Input/Display */}
          <div
            onClick={(e) => {
              if (onNextClick && !isEditingAddress) {
                e.stopPropagation();
                onNextClick();
              }
            }}
            className={`flex-1 px-2.5 py-2 flex flex-col items-center justify-center transition-colors relative ${
              hasBrokenPointer
                ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400'
                : 'hover:bg-blue-50/70 dark:hover:bg-blue-900/30'
            }`}
            title="Click to redirect pointer or edit target address"
          >
            <div className="w-full flex items-center justify-between gap-1 mb-0.5">
              <span className="text-xs font-mono uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">
                {nextLabel}
              </span>
              {showNextPointerDot && (
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 dark:bg-blue-400"></span>
              )}
            </div>

            {/* Address Value or Interactive Input */}
            {isEditingAddress ? (
              <form onSubmit={handleAddressSubmit} className="flex items-center gap-1 w-full mt-1">
                <input
                  type="text"
                  autoFocus
                  placeholder="Addr"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full px-1 py-0.5 text-xs sm:text-sm font-mono font-bold bg-white dark:bg-[#0B1120] border border-blue-500 rounded text-center text-blue-600 focus:outline-hidden"
                />
                <button
                  type="submit"
                  onClick={(e) => e.stopPropagation()}
                  className="p-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 cursor-pointer"
                  title="Apply Address"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
              </form>
            ) : (
              <div className="flex items-center gap-1 font-mono">
                <span
                  onClick={(e) => {
                    if (allowAddressInput && onApplyNextAddress) {
                      e.stopPropagation();
                      setIsEditingAddress(true);
                      setInputVal(nextAddress ? String(nextAddress) : '');
                    }
                  }}
                  className={`text-xs sm:text-sm font-bold px-2 py-0.5 rounded border transition-all ${
                    hasBrokenPointer
                      ? 'bg-rose-100 dark:bg-rose-900/60 border-rose-300 text-rose-700'
                      : nextAddress
                      ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800/80 text-blue-700 dark:text-blue-300 hover:border-blue-400'
                      : 'bg-slate-100 dark:bg-slate-800 border-dashed border-slate-300 dark:border-slate-700 text-slate-400'
                  }`}
                  title="Click to change target memory address"
                >
                  {nextAddress !== undefined && nextAddress !== null ? nextAddress : '—'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
