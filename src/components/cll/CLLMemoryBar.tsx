import React, { useState } from 'react';
import { ArrowRight, Check, Hash, Cpu } from 'lucide-react';
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
  const [editingHead, setEditingHead] = useState<boolean>(false);
  const [headInput, setHeadInput] = useState<string>('');

  const [editingTail, setEditingTail] = useState<boolean>(false);
  const [tailInput, setTailInput] = useState<string>('');

  const handleHeadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(headInput.trim(), 10);
    if (!isNaN(num) && onSetHeadAddress) {
      soundManager.playClick();
      onSetHeadAddress(num);
      setEditingHead(false);
      setHeadInput('');
    }
  };

  const handleTailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(tailInput.trim(), 10);
    if (!isNaN(num) && onSetTailAddress) {
      soundManager.playClick();
      onSetTailAddress(num);
      setEditingTail(false);
      setTailInput('');
    }
  };

  const isCircularClosed =
    headAddress !== null &&
    tailNextAddress !== null &&
    headAddress === tailNextAddress;

  return (
    <div className="w-full bg-slate-100/90 dark:bg-slate-900/90 border border-slate-200 dark:border-blue-500/25 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs font-mono select-none">
      {/* Left: Memory Pointer Registers */}
      <div className="flex flex-wrap items-center gap-3">
        {/* HEAD Register */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-[#111827] border border-blue-200 dark:border-blue-500/30 shadow-2xs">
          <span className="font-bold text-blue-600 dark:text-blue-400">HEAD:</span>
          {editingHead ? (
            <form onSubmit={handleHeadSubmit} className="flex items-center gap-1">
              <input
                type="text"
                autoFocus
                placeholder="Addr"
                value={headInput}
                onChange={(e) => setHeadInput(e.target.value)}
                className="w-16 px-1 py-0.5 text-xs font-bold text-center bg-blue-50 dark:bg-blue-950 border border-blue-400 rounded focus:outline-hidden"
              />
              <button
                type="submit"
                className="p-1 bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer"
                title="Set HEAD Address"
              >
                <Check className="w-3 h-3" />
              </button>
            </form>
          ) : (
            <button
              onClick={() => {
                if (onSetHeadAddress) {
                  setEditingHead(true);
                  setHeadInput(headAddress ? String(headAddress) : '');
                }
              }}
              className="font-extrabold text-slate-800 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer px-1 rounded hover:bg-blue-50 dark:hover:bg-blue-950"
              title="Click to change HEAD target address"
            >
              {headAddress ? `[ ${headAddress} ]` : '[ NONE ]'}
            </button>
          )}
        </div>

        {/* TAIL Register */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-[#111827] border border-indigo-200 dark:border-indigo-500/30 shadow-2xs">
          <span className="font-bold text-indigo-600 dark:text-indigo-400">TAIL:</span>
          {editingTail ? (
            <form onSubmit={handleTailSubmit} className="flex items-center gap-1">
              <input
                type="text"
                autoFocus
                placeholder="Addr"
                value={tailInput}
                onChange={(e) => setTailInput(e.target.value)}
                className="w-16 px-1 py-0.5 text-xs font-bold text-center bg-indigo-50 dark:bg-indigo-950 border border-indigo-400 rounded focus:outline-hidden"
              />
              <button
                type="submit"
                className="p-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 cursor-pointer"
                title="Set TAIL Address"
              >
                <Check className="w-3 h-3" />
              </button>
            </form>
          ) : (
            <button
              onClick={() => {
                if (onSetTailAddress) {
                  setEditingTail(true);
                  setTailInput(tailAddress ? String(tailAddress) : '');
                }
              }}
              className="font-extrabold text-slate-800 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer px-1 rounded hover:bg-indigo-50 dark:hover:bg-indigo-950"
              title="Click to change TAIL target address"
            >
              {tailAddress ? `[ ${tailAddress} ]` : '[ NONE ]'}
            </button>
          )}
        </div>

        {/* Circular Condition Invariant Indicator */}
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-bold ${
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
  );
};
