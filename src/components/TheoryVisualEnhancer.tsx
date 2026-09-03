import React, { useState } from 'react';
import {
  ArrowRight,
  ArrowDown,
  Play,
  RotateCcw,
  Check,
  Cpu,
  Layers,
  Sparkles,
  Music,
  Gamepad2,
  Clock,
  TrendingUp,
  ListOrdered,
  Workflow,
  PlusCircle,
  Trash2,
  Search,
} from 'lucide-react';

interface TheoryVisualEnhancerProps {
  chapterId: string;
}

export const TheoryVisualEnhancer: React.FC<TheoryVisualEnhancerProps> = ({ chapterId }) => {
  // Module 11 Search Simulation
  const [searchStep, setSearchStep] = useState<number>(0);
  const searchNodes = [10, 20, 30, 40];
  const searchTarget = 30;

  // Module 12 Traversal Simulation
  const [traversalStep, setTraversalStep] = useState<number>(0);
  const traversalNodes = [10, 20, 30, 40];

  // Module 05 & 06 Toggle State (Before vs After)
  const [insertView, setInsertView] = useState<'before' | 'after'>('before');
  const [deleteView, setDeleteView] = useState<'before' | 'after'>('before');

  // =========================================================================
  // MODULE 01: CIRCULAR STRUCTURE VS SINGLY LINEAR LIST
  // =========================================================================
  if (chapterId === 'theory-01') {
    return (
      <div className="space-y-4 font-sans text-slate-900 dark:text-white animate-fadeIn">
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-blue-500/20 rounded-2xl p-5 sm:p-6 shadow-xs dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)] space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-blue-500/15 pb-3">
            <div className="text-xs font-bold uppercase text-[#2563EB] dark:text-[#3B82F6] tracking-wider flex items-center gap-1.5 font-mono">
              <Sparkles className="w-4 h-4" />
              <span>Singly Linear Linked List vs. Circular Linked List</span>
            </div>
          </div>

          {/* Normal Singly List */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 font-mono uppercase">
              Normal Singly Linked List (Ends at NULL)
            </span>
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap p-3 bg-slate-50 dark:bg-[#0F172A] rounded-xl border border-slate-200 dark:border-blue-500/20">
              {[10, 20, 30, 40].map((val, idx) => (
                <React.Fragment key={idx}>
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-white dark:bg-[#172033] border border-slate-300 dark:border-blue-500/30 flex items-center justify-center font-mono font-bold text-sm shadow-xs">
                    {val}
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
                </React.Fragment>
              ))}
              <div className="px-3 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-500/30 text-rose-600 dark:text-rose-400 font-mono font-bold text-xs">
                NULL
              </div>
            </div>
          </div>

          {/* Circular Linked List */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-[#2563EB] dark:text-[#3B82F6] font-mono uppercase">
              Circular Linked List (Last node points back to First node)
            </span>
            <div className="relative p-4 sm:p-5 bg-[#EFF6FF]/60 dark:bg-blue-950/30 rounded-xl border border-[#DBEAFE] dark:border-blue-500/30">
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                <span className="text-[10px] font-bold px-2 py-0.5 bg-[#2563EB] text-white rounded font-mono">
                  HEAD
                </span>
                {[10, 20, 30, 40].map((val, idx) => (
                  <React.Fragment key={idx}>
                    <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-white dark:bg-[#172033] border-2 border-[#2563EB] dark:border-[#3B82F6] flex items-center justify-center font-mono font-bold text-sm text-[#2563EB] dark:text-[#3B82F6] shadow-xs">
                      {val}
                    </div>
                    {idx < 3 && <ArrowRight className="w-4 h-4 text-[#2563EB] dark:text-[#3B82F6] shrink-0" />}
                  </React.Fragment>
                ))}
              </div>

              {/* Loopback Curved Arrow Indicator */}
              <div className="mt-3 pt-2 border-t border-dashed border-[#93C5FD] dark:border-blue-500/40 flex items-center justify-between text-xs font-mono text-[#2563EB] dark:text-[#3B82F6]">
                <span className="flex items-center gap-1">
                  <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                  <span>Loopback: last node (40) points directly back to head (10)</span>
                </span>
                <span className="font-bold">NO NULL TERMINATION</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // MODULE 02: NODE ANATOMY & INVARIANT
  // =========================================================================
  if (chapterId === 'theory-02') {
    return (
      <div className="space-y-4 font-sans text-slate-900 dark:text-white animate-fadeIn">
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-blue-500/20 rounded-2xl p-5 sm:p-6 shadow-xs dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)] space-y-5">
          <div className="text-xs font-bold uppercase text-[#2563EB] dark:text-[#3B82F6] tracking-wider flex items-center gap-1.5 font-mono border-b border-slate-100 dark:border-blue-500/15 pb-3">
            <Layers className="w-4 h-4" />
            <span>Node Anatomy &amp; Pointer Chain Diagram</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 py-2">
            {[10, 20, 30].map((val, idx) => (
              <React.Fragment key={idx}>
                <div className="border-2 border-[#2563EB] dark:border-[#3B82F6] rounded-xl overflow-hidden shadow-xs">
                  <div className="grid grid-cols-2 bg-[#EFF6FF] dark:bg-blue-950/60 text-[10px] font-mono font-bold text-center border-b border-[#DBEAFE] dark:border-blue-500/30">
                    <span className="py-0.5 px-2 border-r border-[#DBEAFE] dark:border-blue-500/30 text-slate-600 dark:text-slate-300">DATA</span>
                    <span className="py-0.5 px-2 text-[#2563EB] dark:text-[#3B82F6]">NEXT</span>
                  </div>
                  <div className="grid grid-cols-2 bg-white dark:bg-[#172033] font-mono text-center">
                    <span className="py-2.5 px-3 font-bold text-base border-r border-slate-200 dark:border-blue-500/20 text-slate-900 dark:text-white">
                      {val}
                    </span>
                    <span className="py-2.5 px-3 font-bold text-base text-[#2563EB] dark:text-[#3B82F6] flex items-center justify-center">
                      ●
                    </span>
                  </div>
                </div>
                {idx < 2 ? (
                  <ArrowRight className="w-4 h-4 text-[#2563EB] dark:text-[#3B82F6] shrink-0" />
                ) : (
                  <div className="text-xs font-mono text-[#2563EB] dark:text-[#3B82F6] font-bold px-2 py-1 bg-[#EFF6FF] dark:bg-blue-950/60 rounded border border-[#DBEAFE] dark:border-blue-500/30">
                    points back to 10 ↺
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>

          <div className="p-3 bg-slate-50 dark:bg-[#0F172A] rounded-xl border border-slate-200 dark:border-blue-500/20 text-xs font-mono text-center text-slate-700 dark:text-slate-300">
            <strong>Condition for Circularity:</strong> <code className="text-[#2563EB] dark:text-[#3B82F6] font-bold font-mono">lastNode.next == head</code>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // MODULE 03: BASIC STRUCTURE AND IMPORTANT TERMS
  // =========================================================================
  if (chapterId === 'theory-03') {
    return (
      <div className="space-y-4 font-sans text-slate-900 dark:text-white animate-fadeIn">
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-blue-500/20 rounded-2xl p-5 sm:p-6 shadow-xs dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)] space-y-4">
          <div className="text-xs font-bold uppercase text-[#2563EB] dark:text-[#3B82F6] tracking-wider flex items-center gap-1.5 font-mono border-b border-slate-100 dark:border-blue-500/15 pb-3">
            <Workflow className="w-4 h-4" />
            <span>Circular Linked List Structural Architecture</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 py-2 text-center font-mono">
            <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-500/30 rounded-xl">
              <span className="text-[11px] font-bold text-[#2563EB] dark:text-[#3B82F6] block">HEAD</span>
              <span className="text-lg font-extrabold text-slate-900 dark:text-white">Node 10</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-1">Starting reference</span>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-blue-500/20 rounded-xl">
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">NODE</span>
              <span className="text-lg font-extrabold text-slate-900 dark:text-white">[Data|Next]</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-1">Individual element</span>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-blue-500/20 rounded-xl">
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">NEXT</span>
              <span className="text-lg font-extrabold text-[#2563EB] dark:text-[#3B82F6]">Address</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-1">Pointer to successor</span>
            </div>
            <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-500/30 rounded-xl">
              <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 block">LAST NODE</span>
              <span className="text-lg font-extrabold text-slate-900 dark:text-white">Node 40</span>
              <span className="text-[10px] text-indigo-600 dark:text-indigo-400 block mt-1">last.next == head</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // MODULE 04: OPERATIONS TAXONOMY
  // =========================================================================
  if (chapterId === 'theory-04') {
    return (
      <div className="space-y-4 font-sans text-slate-900 dark:text-white animate-fadeIn">
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-blue-500/20 rounded-2xl p-5 sm:p-6 shadow-xs dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)] space-y-4">
          <div className="text-xs font-bold uppercase text-[#2563EB] dark:text-[#3B82F6] tracking-wider flex items-center gap-1.5 font-mono border-b border-slate-100 dark:border-blue-500/15 pb-3">
            <ListOrdered className="w-4 h-4" />
            <span>Operations Hierarchy Tree</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-500/30 rounded-xl space-y-2">
              <div className="font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                <PlusCircle className="w-3.5 h-3.5" />
                <span>INSERTION</span>
              </div>
              <ul className="space-y-1 text-slate-600 dark:text-slate-300">
                <li>• At Beginning</li>
                <li>• At End</li>
                <li>• At Position</li>
              </ul>
            </div>

            <div className="p-3.5 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-500/30 rounded-xl space-y-2">
              <div className="font-bold text-rose-700 dark:text-rose-300 flex items-center gap-1.5">
                <Trash2 className="w-3.5 h-3.5" />
                <span>DELETION</span>
              </div>
              <ul className="space-y-1 text-slate-600 dark:text-slate-300">
                <li>• At Beginning</li>
                <li>• At End</li>
                <li>• At Position</li>
              </ul>
            </div>

            <div className="p-3.5 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-500/30 rounded-xl space-y-2">
              <div className="font-bold text-[#2563EB] dark:text-[#3B82F6] flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5" />
                <span>SEARCHING</span>
              </div>
              <ul className="space-y-1 text-slate-600 dark:text-slate-300">
                <li>• Sequential Scan</li>
                <li>• Compare data</li>
                <li>• Stop at head</li>
              </ul>
            </div>

            <div className="p-3.5 bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-500/30 rounded-xl space-y-2">
              <div className="font-bold text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
                <RotateCcw className="w-3.5 h-3.5" />
                <span>TRAVERSAL</span>
              </div>
              <ul className="space-y-1 text-slate-600 dark:text-slate-300">
                <li>• do-while Loop</li>
                <li>• Print elements</li>
                <li>• Stop when temp==head</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // MODULE 05: INSERTION AT BEGINNING
  // =========================================================================
  if (chapterId === 'theory-05') {
    return (
      <div className="space-y-4 font-sans text-slate-900 dark:text-white animate-fadeIn">
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-blue-500/20 rounded-2xl p-5 sm:p-6 shadow-xs dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)] space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-blue-500/15 pb-3">
            <span className="text-xs font-bold uppercase text-[#2563EB] dark:text-[#3B82F6] font-mono flex items-center gap-1.5">
              <PlusCircle className="w-4 h-4" />
              <span>Insertion at Beginning: Inserting 5 into [10, 20, 30]</span>
            </span>
            <div className="flex gap-1.5">
              <button
                onClick={() => setInsertView('before')}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-bold cursor-pointer transition-all ${
                  insertView === 'before'
                    ? 'bg-[#2563EB] text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                Before
              </button>
              <button
                onClick={() => setInsertView('after')}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-bold cursor-pointer transition-all ${
                  insertView === 'after'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                After
              </button>
            </div>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-[#0F172A] rounded-xl border border-slate-200 dark:border-blue-500/20 flex items-center justify-center gap-2 sm:gap-3 flex-wrap font-mono">
            {insertView === 'before' ? (
              <>
                <span className="text-xs font-bold text-[#2563EB] dark:text-[#3B82F6]">HEAD →</span>
                {[10, 20, 30].map((val, idx) => (
                  <React.Fragment key={idx}>
                    <div className="w-12 h-12 rounded-xl bg-white dark:bg-[#172033] border border-slate-300 dark:border-blue-500/30 flex items-center justify-center font-bold text-sm shadow-xs">
                      {val}
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </React.Fragment>
                ))}
                <span className="text-xs text-[#2563EB] dark:text-[#3B82F6] font-bold">↺ back to 10</span>
              </>
            ) : (
              <>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">HEAD →</span>
                <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/70 border-2 border-emerald-500 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-extrabold text-sm shadow-md scale-105">
                  5 (NEW)
                </div>
                <ArrowRight className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                {[10, 20, 30].map((val, idx) => (
                  <React.Fragment key={idx}>
                    <div className="w-12 h-12 rounded-xl bg-white dark:bg-[#172033] border border-slate-300 dark:border-blue-500/30 flex items-center justify-center font-bold text-sm shadow-xs">
                      {val}
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </React.Fragment>
                ))}
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">↺ back to 5</span>
              </>
            )}
          </div>

          <div className="text-xs font-mono text-center text-slate-600 dark:text-slate-400">
            {insertView === 'before'
              ? 'Before: Node 30 points to Node 10 (head).'
              : 'After: Node 5 is new head. Node 30 now points to 5, and 5 points to 10.'}
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // MODULE 11: SEARCHING IN CIRCULAR LINKED LIST
  // =========================================================================
  if (chapterId === 'theory-11') {
    return (
      <div className="space-y-4 font-sans text-slate-900 dark:text-white animate-fadeIn">
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-blue-500/20 rounded-2xl p-5 sm:p-6 shadow-xs dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)] space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-blue-500/15 pb-3">
            <span className="text-xs font-bold uppercase text-[#2563EB] dark:text-[#3B82F6] font-mono flex items-center gap-1.5">
              <Search className="w-4 h-4" />
              <span>Interactive CLL Search Trace (Target = {searchTarget})</span>
            </span>
            <button
              onClick={() => setSearchStep((prev) => (prev < 2 ? prev + 1 : 0))}
              className="px-3.5 py-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-lg text-xs font-mono font-bold cursor-pointer transition-all flex items-center gap-1.5"
            >
              <span>{searchStep < 2 ? `Advance to Step ${searchStep + 2}` : 'Reset Search'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center justify-center gap-3 py-4 flex-wrap font-mono">
            {searchNodes.map((val, idx) => {
              const isCurrent = idx === searchStep;
              const isMatch = val === searchTarget && searchStep === 2;
              const isChecked = idx < searchStep;

              return (
                <div key={idx} className="flex flex-col items-center gap-2">
                  <span className="text-[11px] font-bold h-4">
                    {isMatch ? (
                      <span className="text-emerald-600 dark:text-emerald-400">FOUND ✅</span>
                    ) : isCurrent ? (
                      <span className="text-[#2563EB] dark:text-[#3B82F6] animate-pulse">CHECKING</span>
                    ) : isChecked ? (
                      <span className="text-rose-500">MISMATCH ❌</span>
                    ) : (
                      <span className="text-slate-400">WAITING</span>
                    )}
                  </span>
                  <div
                    className={`w-13 h-13 rounded-xl flex items-center justify-center font-bold text-base border-2 transition-all ${
                      isMatch
                        ? 'bg-emerald-100 dark:bg-emerald-950/70 border-emerald-500 text-emerald-700 dark:text-emerald-300 scale-110 shadow-md'
                        : isCurrent
                        ? 'bg-blue-100 dark:bg-blue-950/70 border-[#2563EB] dark:border-[#3B82F6] text-[#2563EB] dark:text-[#3B82F6] scale-105 shadow-md'
                        : 'bg-white dark:bg-[#172033] border-slate-300 dark:border-blue-500/30 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    {val}
                  </div>
                  <span className="text-xs text-slate-500">Node {idx + 1}</span>
                </div>
              );
            })}
          </div>

          <div className="p-3 bg-slate-50 dark:bg-[#0F172A] rounded-xl border border-slate-200 dark:border-blue-500/20 text-xs font-mono text-center">
            {searchStep === 0 && 'Step 1: Check Node 10 == 30 → False. Advance temp = temp->next.'}
            {searchStep === 1 && 'Step 2: Check Node 20 == 30 → False. Advance temp = temp->next.'}
            {searchStep === 2 && 'Step 3: Check Node 30 == 30 → True! MATCH FOUND. Returns 1 (True).'}
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // MODULE 12: TRAVERSAL / DISPLAY
  // =========================================================================
  if (chapterId === 'theory-12') {
    return (
      <div className="space-y-4 font-sans text-slate-900 dark:text-white animate-fadeIn">
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-blue-500/20 rounded-2xl p-5 sm:p-6 shadow-xs dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)] space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-blue-500/15 pb-3">
            <span className="text-xs font-bold uppercase text-[#2563EB] dark:text-[#3B82F6] font-mono flex items-center gap-1.5">
              <RotateCcw className="w-4 h-4" />
              <span>do-while Traversal Flow Simulator</span>
            </span>
            <button
              onClick={() => setTraversalStep((prev) => (prev < 4 ? prev + 1 : 0))}
              className="px-3.5 py-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-lg text-xs font-mono font-bold cursor-pointer transition-all flex items-center gap-1.5"
            >
              <span>{traversalStep < 4 ? 'Next Print' : 'Restart'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center justify-center gap-3 py-4 flex-wrap font-mono">
            {traversalNodes.map((val, idx) => {
              const isPrinted = idx < traversalStep;
              const isCurrent = idx === traversalStep;

              return (
                <div
                  key={idx}
                  className={`w-13 h-13 rounded-xl flex items-center justify-center font-bold text-base border-2 transition-all ${
                    isPrinted
                      ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 text-emerald-700 dark:text-emerald-300'
                      : isCurrent
                      ? 'bg-blue-50 dark:bg-blue-950/50 border-[#2563EB] dark:border-[#3B82F6] text-[#2563EB] dark:text-[#3B82F6] scale-105'
                      : 'bg-white dark:bg-[#172033] border-slate-300 dark:border-blue-500/30 text-slate-400'
                  }`}
                >
                  {val}
                </div>
              );
            })}
          </div>

          <div className="p-3 bg-slate-50 dark:bg-[#0F172A] rounded-xl border border-slate-200 dark:border-blue-500/20 text-xs font-mono text-center">
            <strong>Printed Output:</strong>{' '}
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">
              {traversalNodes.slice(0, traversalStep).join(' ') || '(Empty - Click Next Print)'}
            </span>
            {traversalStep === 4 && ' — (temp returned to head; traversal stopped safely)'}
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // MODULE 16: REAL-WORLD APPLICATIONS
  // =========================================================================
  if (chapterId === 'theory-16') {
    return (
      <div className="space-y-4 font-sans text-slate-900 dark:text-white animate-fadeIn">
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-blue-500/20 rounded-2xl p-5 sm:p-6 shadow-xs dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)] space-y-4">
          <div className="text-xs font-bold uppercase text-[#2563EB] dark:text-[#3B82F6] tracking-wider flex items-center gap-1.5 font-mono border-b border-slate-100 dark:border-blue-500/15 pb-3">
            <Cpu className="w-4 h-4" />
            <span>Real-World Cyclic Architecture Applications</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
            <div className="p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-500/30 rounded-xl space-y-2">
              <div className="flex items-center gap-2 font-bold text-[#2563EB] dark:text-[#3B82F6]">
                <Cpu className="w-4 h-4" />
                <span>Round-Robin CPU</span>
              </div>
              <div className="text-slate-700 dark:text-slate-300 text-[11px] leading-relaxed">
                Process A → B → C → D → A. Each thread receives equal quantum slices in round-robin succession.
              </div>
            </div>

            <div className="p-4 bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-500/30 rounded-xl space-y-2">
              <div className="flex items-center gap-2 font-bold text-purple-700 dark:text-purple-300">
                <Music className="w-4 h-4" />
                <span>Music Playlist</span>
              </div>
              <div className="text-slate-700 dark:text-slate-300 text-[11px] leading-relaxed">
                Song 1 → 2 → 3 → 4 → 1. When the final track concludes, playback loops seamlessly to the first track.
              </div>
            </div>

            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-500/30 rounded-xl space-y-2">
              <div className="flex items-center gap-2 font-bold text-emerald-700 dark:text-emerald-300">
                <Gamepad2 className="w-4 h-4" />
                <span>Multiplayer Turns</span>
              </div>
              <div className="text-slate-700 dark:text-slate-300 text-[11px] leading-relaxed">
                Player 1 → 2 → 3 → 4 → 1. Board games cycle turns continuously until an endgame condition triggers.
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // MODULE 17: TIME COMPLEXITY COMPARISON
  // =========================================================================
  if (chapterId === 'theory-17') {
    return (
      <div className="space-y-4 font-sans text-slate-900 dark:text-white animate-fadeIn">
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-blue-500/20 rounded-2xl p-5 sm:p-6 shadow-xs dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)] space-y-4">
          <div className="text-xs font-bold uppercase text-[#2563EB] dark:text-[#3B82F6] font-mono flex items-center gap-1.5 border-b border-slate-100 dark:border-blue-500/15 pb-3">
            <TrendingUp className="w-4 h-4" />
            <span>Time Complexity Comparison: Head-Only vs. Tail Pointer</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-200 dark:border-blue-500/20 text-slate-500 dark:text-slate-400">
                  <th className="py-2 px-3">Operation</th>
                  <th className="py-2 px-3 text-[#2563EB] dark:text-[#3B82F6]">With Head Only</th>
                  <th className="py-2 px-3 text-emerald-600 dark:text-emerald-400">With Tail Pointer</th>
                  <th className="py-2 px-3">Reasoning</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-blue-500/10 text-slate-700 dark:text-slate-300">
                <tr>
                  <td className="py-2.5 px-3 font-semibold">Insert at Beginning</td>
                  <td className="py-2.5 px-3 text-amber-600 dark:text-amber-400 font-bold">O(n)</td>
                  <td className="py-2.5 px-3 text-emerald-600 dark:text-emerald-400 font-bold">O(1)</td>
                  <td className="py-2.5 px-3">Tail gives direct O(1) access to the last node</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold">Insert at End</td>
                  <td className="py-2.5 px-3 text-amber-600 dark:text-amber-400 font-bold">O(n)</td>
                  <td className="py-2.5 px-3 text-emerald-600 dark:text-emerald-400 font-bold">O(1)</td>
                  <td className="py-2.5 px-3">Insert after tail and update tail pointer in O(1)</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold">Search / Traversal</td>
                  <td className="py-2.5 px-3 font-bold">O(n)</td>
                  <td className="py-2.5 px-3 font-bold">O(n)</td>
                  <td className="py-2.5 px-3">Must visit nodes sequentially</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold">Delete End</td>
                  <td className="py-2.5 px-3 font-bold">O(n)</td>
                  <td className="py-2.5 px-3 font-bold">O(n)</td>
                  <td className="py-2.5 px-3">Must traverse to find the second-last node</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
