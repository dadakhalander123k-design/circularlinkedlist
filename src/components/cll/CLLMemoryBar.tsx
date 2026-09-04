import React, { useState, useEffect } from 'react';
import { Check, Cpu, AlertCircle } from 'lucide-react';
import { soundManager } from '../../utils/audio';

interface CLLMemoryBarProps {
  headAddress: number | null;
  tailAddress: number | null;
  onSetHeadAddress?: (addr: number) => void;
  onSetTailAddress?: (addr: number) => void;
  tailNextAddress?: number | null;
  validAddresses: number[];
}

export const CLLMemoryBar: React.FC<CLLMemoryBarProps> = ({
  headAddress,
  tailAddress,
  onSetHeadAddress,
  onSetTailAddress,
  tailNextAddress,
  validAddresses,
}) => {
  const [headInput, setHeadInput] = useState<string>(
    headAddress !== null && headAddress !== undefined ? String(headAddress) : ''
  );
  const [tailInput, setTailInput] = useState<string>(
    tailAddress !== null && tailAddress !== undefined ? String(tailAddress) : ''
  );
  const [errorText, setErrorText] = useState<string | null>(null);

  // Keep inputs synchronized with incoming state props
  useEffect(() => {
    setHeadInput(headAddress !== null && headAddress !== undefined ? String(headAddress) : '');
  }, [headAddress]);

  useEffect(() => {
    setTailInput(tailAddress !== null && tailAddress !== undefined ? String(tailAddress) : '');
  }, [tailAddress]);

  const handleApplyHead = () => {
    const trimmed = headInput.trim();
    if (!trimmed) {
      soundManager.playError();
      setErrorText('Enter a valid node address.');
      setHeadInput(headAddress !== null ? String(headAddress) : '');
      return;
    }
    const num = parseInt(trimmed, 10);
    if (isNaN(num) || !/^\d+$/.test(trimmed)) {
      soundManager.playError();
      setErrorText('Address must be a numeric value.');
      setHeadInput(headAddress !== null ? String(headAddress) : '');
      return;
    }
    if (!validAddresses.includes(num)) {
      soundManager.playError();
      setErrorText(`Node address ${num} not found.`);
      setHeadInput(headAddress !== null ? String(headAddress) : '');
      return;
    }

    setErrorText(null);
    soundManager.playClick();
    if (onSetHeadAddress) {
      onSetHeadAddress(num);
    }
  };

  const handleApplyTail = () => {
    const trimmed = tailInput.trim();
    if (!trimmed) {
      soundManager.playError();
      setErrorText('Enter a valid node address.');
      setTailInput(tailAddress !== null ? String(tailAddress) : '');
      return;
    }
    const num = parseInt(trimmed, 10);
    if (isNaN(num) || !/^\d+$/.test(trimmed)) {
      soundManager.playError();
      setErrorText('Address must be a numeric value.');
      setTailInput(tailAddress !== null ? String(tailAddress) : '');
      return;
    }
    if (!validAddresses.includes(num)) {
      soundManager.playError();
      setErrorText(`Node address ${num} not found.`);
      setTailInput(tailAddress !== null ? String(tailAddress) : '');
      return;
    }

    setErrorText(null);
    soundManager.playClick();
    if (onSetTailAddress) {
      onSetTailAddress(num);
    }
  };

  const isCircularClosed =
    headAddress !== null &&
    tailNextAddress !== null &&
    headAddress === tailNextAddress;

  return (
    <div className="w-full bg-slate-100/90 dark:bg-slate-900/90 border border-slate-200 dark:border-blue-500/25 rounded-xl p-3 flex flex-col gap-2 text-xs font-mono select-none">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left: Memory Pointer Registers */}
        <div className="flex flex-wrap items-center gap-3">
          {/* HEAD Register */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#111827] border border-blue-200 dark:border-blue-500/30 shadow-2xs">
            <label htmlFor="input-head-address" className="font-bold text-blue-600 dark:text-blue-400">
              HEAD:
            </label>
            <div className="flex items-center gap-1">
              <span className="text-slate-400 font-mono text-xs">[</span>
              <input
                id="input-head-address"
                type="text"
                value={headInput}
                onChange={(e) => {
                  setHeadInput(e.target.value);
                  setErrorText(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleApplyHead();
                  }
                }}
                placeholder="1000"
                className="w-14 px-1 py-0.5 text-xs font-bold text-center bg-blue-50/70 dark:bg-blue-950/60 border border-blue-300 dark:border-blue-500/40 rounded text-blue-900 dark:text-blue-100 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                title="Type node address and press Enter or click Set HEAD"
              />
              <span className="text-slate-400 font-mono text-xs">]</span>
              <button
                type="button"
                id="btn-set-head-address"
                onClick={handleApplyHead}
                className="px-2 py-0.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded text-[10px] font-bold cursor-pointer transition-transform"
                title="Apply HEAD Address"
              >
                Set HEAD
              </button>
            </div>
          </div>

          {/* TAIL Register */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#111827] border border-indigo-200 dark:border-indigo-500/30 shadow-2xs">
            <label htmlFor="input-tail-address" className="font-bold text-indigo-600 dark:text-indigo-400">
              TAIL:
            </label>
            <div className="flex items-center gap-1">
              <span className="text-slate-400 font-mono text-xs">[</span>
              <input
                id="input-tail-address"
                type="text"
                value={tailInput}
                onChange={(e) => {
                  setTailInput(e.target.value);
                  setErrorText(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleApplyTail();
                  }
                }}
                placeholder="1006"
                className="w-14 px-1 py-0.5 text-xs font-bold text-center bg-indigo-50/70 dark:bg-indigo-950/60 border border-indigo-300 dark:border-indigo-500/40 rounded text-indigo-900 dark:text-indigo-100 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                title="Type node address and press Enter or click Set TAIL"
              />
              <span className="text-slate-400 font-mono text-xs">]</span>
              <button
                type="button"
                id="btn-set-tail-address"
                onClick={handleApplyTail}
                className="px-2 py-0.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded text-[10px] font-bold cursor-pointer transition-transform"
                title="Apply TAIL Address"
              >
                Set TAIL
              </button>
            </div>
          </div>

          {/* Circular Condition Invariant Indicator */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border font-bold ${
              isCircularClosed
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-600/40 text-emerald-700 dark:text-emerald-300'
                : 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-600/30 text-amber-700 dark:text-amber-300'
            }`}
          >
            <span>TAIL.NEXT === HEAD:</span>
            <span>
              {tailNextAddress !== undefined && tailNextAddress !== null
                ? `[ ${tailNextAddress} ]`
                : '[ NULL ]'}
            </span>
            {isCircularClosed ? (
              <Check className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <span className="text-[10px] font-normal">(Open Loop)</span>
            )}
          </div>
        </div>

        {/* Right: Educational Note */}
        <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[11px]">
          <Cpu className="w-3.5 h-3.5 text-blue-500" />
          <span>NEXT stores the memory address of the next node.</span>
        </div>
      </div>

      {/* Small inline validation error feedback */}
      {errorText && (
        <div className="text-rose-600 dark:text-rose-400 text-xs font-medium flex items-center gap-1.5 animate-shake">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{errorText}</span>
        </div>
      )}
    </div>
  );
};
