import React, { useState, useEffect } from 'react';
import {
  Zap,
  BookOpen,
  Search,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  Clock,
  RotateCcw,
  Activity,
  Cpu,
  Database,
  Lock,
  ExternalLink,
  Award,
  Copy,
  CheckCheck,
  FileCode,
  CheckCircle2,
  Lightbulb,
  Layers,
  Code2,
  ListOrdered,
  HelpCircle,
} from 'lucide-react';
import { TechniqueType } from '../types/game';
import { progressManager, normalizeTheoryChapterId } from '../utils/progressManager';
import { soundManager } from '../utils/audio';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { TheoryVisualEnhancer } from './TheoryVisualEnhancer';
import {
  LINEAR_SEARCH_MODULES,
  LinearSearchModule,
} from '../data/linearSearchTheory';

export interface LearnLinearSearchSectionProps {
  initialTopic?: string;
  onStartLevel: (levelId: number) => void;
  onOpenSandbox: (technique?: TechniqueType, size?: number) => void;
}

export const LearnLinearSearchSection: React.FC<LearnLinearSearchSectionProps> = ({
  initialTopic = 'theory-01',
  onStartLevel,
  onOpenSandbox,
}) => {
  useScrollReveal();

  // Active Chapter State
  const [activeChapterId, setActiveChapterId] = useState<string>(() =>
    normalizeTheoryChapterId(initialTopic)
  );

  // Search Filter State for Table of Contents
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Active Code Language Tab (C, C++, Java, Python)
  const [selectedLang, setSelectedLang] = useState<'c' | 'cpp' | 'java' | 'python'>('c');
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // Progress State from Single Source of Truth
  const [pState, setPState] = useState(() => progressManager.getState());

  useEffect(() => {
    if (initialTopic) {
      const normalized = normalizeTheoryChapterId(initialTopic);
      setActiveChapterId(normalized);
    }
  }, [initialTopic]);

  useEffect(() => {
    const unsub = progressManager.subscribe((state) => {
      setPState(state);
    });
    return () => unsub();
  }, []);

  const activeModuleIndex = LINEAR_SEARCH_MODULES.findIndex(
    (m) => m.id === activeChapterId || m.id === normalizeTheoryChapterId(activeChapterId)
  );
  const activeModule =
    activeModuleIndex >= 0 ? LINEAR_SEARCH_MODULES[activeModuleIndex] : LINEAR_SEARCH_MODULES[0];

  const completedChapters = pState.completedTheoryChapters || [];
  const isCurrentModuleCompleted = completedChapters.includes(activeModule.id);
  const totalCompletedCount = completedChapters.length;
  const theoryPercentage = Math.round((totalCompletedCount / LINEAR_SEARCH_MODULES.length) * 100);

  // Hook for automatic scroll-to-reveal animations on module changes
  useScrollReveal([activeModule.id]);

  // Handle Copy Code Snippet
  const handleCopyCode = () => {
    const codeToCopy = activeModule.codeSnippets?.[selectedLang] || activeModule.codeSnippets?.c || '';
    if (navigator.clipboard) {
      navigator.clipboard.writeText(codeToCopy).then(() => {
        setCopiedCode(true);
        soundManager.playClick();
        setTimeout(() => setCopiedCode(false), 2000);
      });
    }
  };

  // Selecting a chapter in the sidebar
  const handleSelectModule = (moduleId: string) => {
    soundManager.playSelect();
    const normalized = normalizeTheoryChapterId(moduleId);
    setActiveChapterId(normalized);
    progressManager.setCurrentTheoryChapter(normalized);
  };

  // Mark Module as Completed
  const handleMarkCompleted = () => {
    if (isCurrentModuleCompleted) return;
    const newlyCompleted = progressManager.completeTheoryChapter(activeModule.id);
    if (newlyCompleted) {
      soundManager.playTheoryComplete();
    }
  };

  // Next Module Action: Advances to next topic without auto-marking complete
  const handleNextModule = () => {
    soundManager.playNav();
    if (activeModuleIndex < LINEAR_SEARCH_MODULES.length - 1) {
      const nextMod = LINEAR_SEARCH_MODULES[activeModuleIndex + 1];
      setActiveChapterId(nextMod.id);
      progressManager.setCurrentTheoryChapter(nextMod.id);
    }
  };

  // Previous Module Action
  const handlePrevModule = () => {
    soundManager.playNav();
    if (activeModuleIndex > 0) {
      const prevMod = LINEAR_SEARCH_MODULES[activeModuleIndex - 1];
      setActiveChapterId(prevMod.id);
      progressManager.setCurrentTheoryChapter(prevMod.id);
    }
  };

  // Filtered list of modules
  const filteredModules = LINEAR_SEARCH_MODULES.filter((m) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      m.title.toLowerCase().includes(q) ||
      m.subtitle.toLowerCase().includes(q) ||
      m.category.toLowerCase().includes(q) ||
      m.summary.toLowerCase().includes(q) ||
      m.number.includes(q)
    );
  });

  return (
    <div className="w-full max-w-7xl mx-auto py-2 sm:py-4 px-2 sm:px-4 space-y-6 font-sans text-slate-900 dark:text-white animate-page-enter">
      {/* =========================================================================
          1. HEADER SECTION
          ========================================================================= */}
      <div className="border border-slate-200 dark:border-blue-500/20 rounded-2xl pt-5 pb-6 px-6 sm:px-8 bg-white dark:bg-[#111827] shadow-xs dark:shadow-[0_8px_30px_rgba(0,0,0,0.35)] reveal-on-scroll">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-0.5 bg-[#EFF6FF] dark:bg-blue-950/60 text-[#2563EB] dark:text-[#3B82F6] border border-[#DBEAFE] dark:border-blue-500/30 rounded-md text-xs font-semibold uppercase tracking-wider font-mono">
              THEORY CURRICULUM // VOL. 01
            </span>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 font-sans">
              Circular Linked List Foundations
            </span>
          </div>
          <div className="text-xs font-mono text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-[#0F172A] px-3 py-1 rounded-lg border border-slate-200 dark:border-blue-500/20 flex items-center gap-2">
            <span>Progress:</span>
            <span className="text-[#2563EB] dark:text-[#3B82F6] font-bold">{totalCompletedCount}</span> / {LINEAR_SEARCH_MODULES.length} Chapters
            <span className="font-bold text-slate-900 dark:text-white">({theoryPercentage}%)</span>
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight animate-heading-enter">
          Circular Linked List
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-3xl mt-2 leading-relaxed font-normal">
          A comprehensive 17-chapter technical curriculum covering Circular Linked List concepts, node structures, operations, multi-language code implementations in C, Java, and Python, advantages, disadvantages, applications, and time complexity derivations.
        </p>

        {/* Global Progress Bar */}
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mt-4">
          <div
            className="bg-[#2563EB] dark:bg-[#3B82F6] h-full transition-all duration-300 rounded-full"
            style={{ width: `${theoryPercentage}%` }}
          />
        </div>
      </div>

      {/* =========================================================================
          2. TWO-COLUMN INTERFACE:
             Left Sidebar: Table of Contents & Search Box (12 Modules)
             Right Main: Active Module Learning Canvas
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* =========================================================================
            LEFT COLUMN: TABLE OF CONTENTS (12 MODULES)
            ========================================================================= */}
        <aside className="lg:col-span-4 bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-blue-500/20 rounded-2xl shadow-xs dark:shadow-[0_8px_30px_rgba(0,0,0,0.35)] overflow-hidden flex flex-col">
          {/* 1. Header Row */}
          <div className="px-5 py-3.5 sm:px-6 sm:py-4 border-b border-slate-100 dark:border-blue-500/15 bg-slate-50/70 dark:bg-[#0F172A] flex items-center justify-between">
            <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider font-mono">
              TABLE OF CONTENTS
            </span>
            <span className="text-xs sm:text-sm font-mono text-slate-500 dark:text-slate-400 font-semibold">
              {LINEAR_SEARCH_MODULES.length} Chapters
            </span>
          </div>

          {/* 2. Chapter List (Vertically Stacked Rows) */}
          <nav className="divide-y divide-slate-100 dark:divide-blue-500/10" aria-label="Table of Contents">
            {LINEAR_SEARCH_MODULES.map((mod) => {
              const isSelected = activeModule.id === mod.id;
              const isCompleted = completedChapters.includes(mod.id);

              return (
                <button
                  key={mod.id}
                  id={`btn-chapter-${mod.id}`}
                  onClick={() => handleSelectModule(mod.id)}
                  className={`w-full text-left px-5 py-3.5 sm:px-6 sm:py-3.5 transition-all flex items-center justify-between gap-3 cursor-pointer group select-none ${
                    isSelected
                      ? 'bg-[#EFF6FF] dark:bg-blue-950/60 text-[#2563EB] dark:text-[#3B82F6] font-bold border-l-4 border-l-[#2563EB] dark:border-l-[#3B82F6]'
                      : 'bg-white dark:bg-[#111827] text-slate-700 dark:text-slate-300 hover:bg-[#EFF6FF] dark:hover:bg-[#172033] hover:text-[#2563EB] font-medium'
                  }`}
                >
                  {/* Left: Fixed-width 2-digit Number & Center: Title */}
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span
                      className={`text-xs sm:text-sm font-mono font-bold w-6 shrink-0 text-left ${
                        isSelected
                          ? 'text-[#2563EB] dark:text-[#3B82F6]'
                          : 'text-slate-400 dark:text-slate-500 group-hover:text-[#2563EB] dark:group-hover:text-slate-200'
                      }`}
                    >
                      {mod.number}
                    </span>
                    <span
                      className={`text-sm sm:text-[15px] leading-snug font-sans font-semibold truncate ${
                        isSelected
                          ? 'text-[#2563EB] dark:text-[#3B82F6] font-bold'
                          : 'text-slate-800 dark:text-slate-200 group-hover:text-[#2563EB] dark:group-hover:text-white'
                      }`}
                    >
                      {mod.title}
                    </span>
                  </div>

                  {/* Right: Circular Completion Indicator */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {isCompleted ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold text-sm" title="Completed">
                        ✓
                      </span>
                    ) : isSelected ? (
                      <span className="text-[#2563EB] dark:text-[#3B82F6] text-xs font-bold" title="Current">
                        ●
                      </span>
                    ) : (
                      <span className="text-slate-300 dark:text-slate-600 text-xs font-normal" title="Available">
                        ○
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </nav>

          {/* 3. Bottom Status Footer */}
          <div className="px-5 py-3.5 sm:px-6 sm:py-3.5 bg-slate-50/80 dark:bg-[#0F172A] border-t border-slate-100 dark:border-blue-500/15 flex items-center justify-between text-xs sm:text-sm font-sans">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Status:</span>
            <span className="font-bold text-slate-900 dark:text-white font-mono">
              {totalCompletedCount} / {LINEAR_SEARCH_MODULES.length} Completed
            </span>
          </div>
        </aside>

        {/* =========================================================================
            RIGHT COLUMN: ACTIVE MODULE LEARNING CANVAS
            ========================================================================= */}
        <main
          key={activeModule.id}
          className="lg:col-span-8 bg-white dark:bg-[#111827] border border-slate-200 dark:border-blue-500/20 rounded-2xl p-6 sm:p-8 shadow-xs dark:shadow-[0_8px_30px_rgba(0,0,0,0.35)] space-y-6 animate-chapter-switch"
        >
          {/* Module Header Bar (Badge, Title, Subtitle, Time) */}
          <div className="border-b border-slate-100 dark:border-blue-500/15 pb-5 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-[#EFF6FF] dark:bg-blue-950/60 border border-[#DBEAFE] dark:border-blue-500/30 text-[#2563EB] dark:text-[#3B82F6] rounded-md text-xs sm:text-sm font-bold uppercase tracking-wider font-mono">
                  Module {activeModule.number} // {activeModule.category}
                </span>
                {isCurrentModuleCompleted && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300 rounded-md text-xs sm:text-sm font-bold font-sans">
                    <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 stroke-[3]" />
                    <span>Completed</span>
                  </span>
                )}
              </div>
              <div className="text-xs sm:text-sm font-sans text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#2563EB] dark:text-[#3B82F6]" />
                <span>Est. Read: {activeModule.readTime}</span>
              </div>
            </div>

            {/* Title & Subtitle */}
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight pt-1">
              {parseInt(activeModule.number, 10)}. {activeModule.title}
            </h2>
            <p className="text-base sm:text-lg font-bold text-[#2563EB] dark:text-[#3B82F6]">
              {activeModule.subtitle}
            </p>

            {/* Summary Box */}
            <div className="mt-3 p-4 sm:p-5 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-blue-500/20 rounded-xl text-sm sm:text-base text-slate-700 dark:text-slate-200 leading-relaxed font-sans">
              <strong className="text-slate-900 dark:text-white font-bold block mb-1.5 text-base sm:text-[17px]">Executive Summary:</strong>
              {activeModule.summary}
            </div>
          </div>

          {/* Everyday Real-Life Analogy Card */}
          {activeModule.analogyContent && (
            <div className="bg-[#EFF6FF]/60 dark:bg-blue-950/30 border-l-4 border-l-[#2563EB] dark:border-l-[#3B82F6] border border-[#DBEAFE] dark:border-blue-500/20 rounded-r-xl p-4 sm:p-5 text-slate-800 dark:text-slate-200 leading-relaxed space-y-1.5 shadow-xs reveal-on-scroll">
              <div className="flex items-center gap-2 text-xs sm:text-sm font-bold uppercase tracking-wider text-[#2563EB] dark:text-[#3B82F6] font-mono">
                <Lightbulb className="w-4 h-4 text-[#2563EB] dark:text-[#3B82F6]" />
                <span>Everyday Analogy: {activeModule.analogyTitle || 'Intuitive Real-Life Model'}</span>
              </div>
              <p className="text-base sm:text-[17px] text-slate-800 dark:text-slate-200 leading-relaxed italic pt-1 font-normal">
                "{activeModule.analogyContent}"
              </p>
            </div>
          )}

          {/* Practical Computer Science Applications */}
          {activeModule.csApplications && activeModule.csApplications.length > 0 && (
            <div className="space-y-2.5 reveal-on-scroll">
              <span className="text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block font-mono">
                Practical Computer Science Applications
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {activeModule.csApplications.map((app, aIdx) => (
                  <div
                    key={aIdx}
                    className="p-4 bg-white dark:bg-[#172033] border border-slate-200 dark:border-blue-500/20 rounded-xl text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed flex items-start gap-2.5 shadow-2xs font-medium"
                  >
                    <span className="w-2 h-2 rounded-full bg-[#2563EB] dark:bg-[#3B82F6] mt-1.5 shrink-0" />
                    <span>{app}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Core Topics Covered */}
          {activeModule.coreTopics && activeModule.coreTopics.length > 0 && (
            <div className="space-y-2.5 reveal-on-scroll">
              <span className="text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block font-mono">
                Core Concepts &amp; Mechanics
              </span>
              <ul className="space-y-2 text-sm sm:text-base text-slate-700 dark:text-slate-200">
                {activeModule.coreTopics.map((topic, tIdx) => (
                  <li key={tIdx} className="flex items-start gap-2.5 leading-relaxed">
                    <span className="w-2 h-2 rounded-full bg-[#2563EB] dark:bg-[#3B82F6] mt-2 shrink-0" />
                    <span>{topic}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Formal Pseudocode Display (Module 04) */}
          {activeModule.pseudocode && (
            <div className="bg-[#0F172A] dark:bg-[#0B1120] text-slate-100 rounded-xl p-4 sm:p-5 font-mono text-xs sm:text-sm shadow-md border border-slate-800 dark:border-blue-500/20 space-y-2 reveal-on-scroll">
              <div className="flex items-center justify-between text-[#93C5FD] dark:text-[#3B82F6] text-xs sm:text-sm font-bold pb-2 border-b border-slate-800">
                <span>FORMAL PSEUDOCODE SPECIFICATION</span>
                <span className="text-xs text-slate-400">Language-Agnostic</span>
              </div>
              <pre className="overflow-x-auto leading-relaxed text-[#DBEAFE] dark:text-[#93C5FD] py-2 text-xs sm:text-sm">
                <code>{activeModule.pseudocode}</code>
              </pre>
            </div>
          )}

          {/* Complexity Breakdown Details (Module 05) */}
          {activeModule.complexityDerivation && (
            <div className="space-y-3 reveal-on-scroll">
              <span className="text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block font-mono">
                Big-O Asymptotic Complexity Breakdown
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {activeModule.complexityDerivation.map((item, cIdx) => (
                  <div
                    key={cIdx}
                    className="p-4 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-blue-500/20 rounded-xl space-y-1.5"
                  >
                    <span className="text-xs sm:text-sm font-bold text-[#2563EB] dark:text-[#3B82F6] uppercase font-mono block">
                      {item.caseType}
                    </span>
                    <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-mono block">
                      {item.complexity}
                    </span>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      {item.description}
                    </p>
                    <code className="text-xs sm:text-sm font-mono font-bold text-slate-700 dark:text-[#3B82F6] block pt-1">
                      {item.formula}
                    </code>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Space Complexity Analysis (Module 06) */}
          {activeModule.spaceAnalysis && (
            <div className="space-y-3 reveal-on-scroll">
              <span className="text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block font-mono">
                Memory Footprint &amp; Stack Allocation
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {activeModule.spaceAnalysis.map((item, sIdx) => (
                  <div
                    key={sIdx}
                    className="p-4 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-blue-500/20 rounded-xl space-y-1"
                  >
                    <span className="text-xs sm:text-sm font-bold text-[#2563EB] dark:text-[#3B82F6] uppercase font-mono block">
                      {item.type}
                    </span>
                    <span className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white font-mono block">
                      {item.complexity}
                    </span>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      {item.details}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Advantages Cards (Module 08) */}
          {activeModule.advantages && (
            <div className="space-y-3 reveal-on-scroll">
              <span className="text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block font-mono">
                Core Engineering Advantages
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {activeModule.advantages.map((adv, aIdx) => (
                  <div
                    key={aIdx}
                    className="p-4 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-blue-500/20 rounded-xl space-y-1.5"
                  >
                    <span className="text-xs font-bold px-2.5 py-0.5 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 rounded-md font-mono">
                      {adv.tag}
                    </span>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white pt-1">{adv.title}</h4>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      {adv.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Disadvantages Cards (Module 09) */}
          {activeModule.disadvantages && (
            <div className="space-y-3 reveal-on-scroll">
              <span className="text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block font-mono">
                Disadvantages &amp; Bottlenecks
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {activeModule.disadvantages.map((dis, dIdx) => (
                  <div
                    key={dIdx}
                    className="p-4 bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-500/20 rounded-xl space-y-1.5"
                  >
                    <span className="text-xs font-bold px-2.5 py-0.5 bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 rounded-md font-mono">
                      {dis.impact}
                    </span>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white pt-1">{dis.title}</h4>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      {dis.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Decision Criteria Table (Module 10) */}
          {activeModule.decisionCriteria && (
            <div className="space-y-3 reveal-on-scroll">
              <span className="text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block font-mono">
                Practical Decision Matrix
              </span>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm font-mono">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-blue-500/20 text-slate-500 dark:text-slate-400">
                      <th className="py-2.5 px-3 font-bold">Engineering Scenario</th>
                      <th className="py-2.5 px-3 font-bold">Recommendation</th>
                      <th className="py-2.5 px-3 font-bold">Rationale</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-blue-500/10 text-slate-700 dark:text-slate-300">
                    {activeModule.decisionCriteria.map((crit, cIdx) => (
                      <tr key={cIdx}>
                        <td className="py-2.5 px-3 font-semibold">{crit.scenario}</td>
                        <td className="py-2.5 px-3 font-bold text-emerald-600 dark:text-emerald-400">
                          {crit.recommendation}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">{crit.rationale}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Interactive Visual Enhancement Component */}
          <TheoryVisualEnhancer chapterId={activeModule.id} />

          {/* Comparison Matrix (Module 02: Singly vs Circular Linked List) */}
          {activeModule.comparisonMatrix && activeModule.comparisonMatrix.length > 0 && (
            <div className="space-y-3 reveal-on-scroll">
              <span className="text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block font-mono">
                Circular Linked List vs Singly Linked List
              </span>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm font-mono">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-blue-500/20 text-slate-500 dark:text-slate-400">
                      <th className="py-2.5 px-3 font-bold">Feature</th>
                      <th className="py-2.5 px-3 font-bold">Singly Linked List</th>
                      <th className="py-2.5 px-3 text-[#2563EB] dark:text-[#3B82F6] font-bold">
                        Circular Linked List
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-blue-500/10 text-slate-700 dark:text-slate-300">
                    {activeModule.comparisonMatrix.map((item, idx) => (
                      <tr key={idx}>
                        <td className="py-2.5 px-3 font-semibold">{item.feature}</td>
                        <td className="py-2.5 px-3">{item.singlyLinkedList}</td>
                        <td className="py-2.5 px-3 font-bold text-[#2563EB] dark:text-[#3B82F6]">
                          {item.circularLinkedList}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* =========================================================================
              INTERACTIVE MULTI-LANGUAGE CODE TABS (C, Java, Python)
              Rendered whenever the active module provides code snippets
              ========================================================================= */}
          {activeModule.codeSnippets && (activeModule.codeSnippets.c || activeModule.codeSnippets.java || activeModule.codeSnippets.python) && (
            <div className="bg-[#0F172A] dark:bg-[#0B1120] rounded-2xl border border-slate-800 dark:border-blue-500/20 overflow-hidden shadow-md reveal-on-scroll">
              {/* Language Selector Bar & Copy Button */}
              <div className="px-4 py-3 bg-[#1E293B] dark:bg-[#111827] border-b border-slate-800 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-1.5 font-mono text-xs sm:text-sm">
                  <span className="text-slate-400 font-bold mr-2 hidden sm:inline">LANGUAGES:</span>
                  {(['c', 'java', 'python'] as const).map((lang) => {
                    const labelMap = { c: 'C', java: 'Java', python: 'Python' };
                    const isCur = selectedLang === lang;
                    return (
                      <button
                        key={lang}
                        onClick={() => {
                          soundManager.playClick();
                          setSelectedLang(lang);
                        }}
                        className={`px-3 py-1 rounded-md font-bold transition-all cursor-pointer ${
                          isCur
                            ? 'bg-[#2563EB] text-white shadow-xs'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800'
                        }`}
                      >
                        {labelMap[lang]}
                      </button>
                    );
                  })}
                </div>

                {/* One-Click Copy Code Button */}
                <button
                  onClick={handleCopyCode}
                  className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  {copiedCode ? (
                    <>
                      <CheckCheck className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-400 font-bold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-slate-400" />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>
              </div>

              {/* Code Snippet Box */}
              <div className="p-4 sm:p-5 overflow-x-auto text-xs sm:text-sm font-mono text-emerald-300 leading-relaxed">
                <pre>
                  <code>
                    {activeModule.codeSnippets[selectedLang] ||
                      activeModule.codeSnippets.c ||
                      activeModule.codeSnippets.java ||
                      activeModule.codeSnippets.python}
                  </code>
                </pre>
              </div>

              {/* Step-by-Step Code Explanation Breakdown Underneath */}
              {activeModule.codeExplanations && activeModule.codeExplanations.length > 0 && (
                <div className="p-4 bg-[#141E33] dark:bg-[#0F172A] border-t border-slate-800/80 space-y-2">
                  <span className="text-xs font-bold text-slate-400 font-mono tracking-wider uppercase block">
                    Step-by-Step Code Explanation Breakdown
                  </span>
                  <div className="space-y-1.5 text-xs sm:text-sm font-mono">
                    {activeModule.codeExplanations.map((exp, eIdx) => (
                      <div key={eIdx} className="flex items-start gap-2.5 text-slate-300">
                        <span className="text-[#93C5FD] dark:text-[#3B82F6] font-bold shrink-0">
                          [{exp.lineNum}]
                        </span>
                        <code className="text-slate-200 font-semibold shrink-0 bg-slate-800/60 px-1.5 py-0.5 rounded">
                          {exp.code}
                        </code>
                        <span className="text-slate-300 font-sans">
                          — {exp.explanation}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Key Formula Card */}
          {activeModule.keyFormula && (
            <div className="bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-blue-500/20 rounded-xl p-4 font-mono shadow-xs reveal-on-scroll">
              <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-2 font-mono">
                {activeModule.keyFormulaLabel || 'Mathematical & Algorithmic Formula'}
              </span>
              <div className="bg-[#F8FAFC] dark:bg-[#0B1120] text-[#111827] dark:text-[#93C5FD] p-3 rounded-lg text-sm sm:text-base font-semibold overflow-x-auto border border-[#E5E7EB] dark:border-blue-500/20 border-l-4 border-l-[#2563EB] dark:border-l-[#3B82F6]">
                <code>{activeModule.keyFormula}</code>
              </div>
            </div>
          )}

          {/* Key Takeaway Banner */}
          <div className="p-4 sm:p-5 bg-[#EFF6FF] dark:bg-blue-950/40 border border-[#DBEAFE] dark:border-blue-500/30 rounded-xl flex items-start gap-3 shadow-2xs reveal-on-scroll">
            <Sparkles className="w-5 h-5 text-[#2563EB] dark:text-[#3B82F6] shrink-0 mt-0.5" />
            <div>
              <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#2563EB] dark:text-[#3B82F6] font-mono block">
                Key Takeaway
              </span>
              <p className="text-base sm:text-lg font-bold text-slate-800 dark:text-white mt-1 leading-snug">
                {activeModule.keyTakeaway}
              </p>
            </div>
          </div>

          {/* =========================================================================
              FOOTER NAVIGATION AND IDEMPOTENT COMPLETION CONTROLS
              ========================================================================= */}
          <div className="border-t border-slate-100 dark:border-blue-500/15 pt-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Previous Topic Button */}
              <button
                id="btn-prev-module"
                onClick={handlePrevModule}
                disabled={activeModuleIndex === 0}
                className="btn-modern-secondary px-4 py-2.5 text-xs sm:text-sm font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Previous Topic</span>
              </button>

              {/* Mark as Completed / Completed ✓ Button */}
              <button
                id="btn-mark-module-completed"
                onClick={handleMarkCompleted}
                className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  isCurrentModuleCompleted
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30 cursor-default'
                    : 'btn-modern-primary'
                }`}
              >
                <Check className={`w-4 h-4 ${isCurrentModuleCompleted ? 'text-emerald-600 dark:text-emerald-400 stroke-[3]' : 'text-white'}`} />
                <span>{isCurrentModuleCompleted ? 'Completed ✓' : 'Mark as Completed'}</span>
              </button>

              {/* Next Topic Button */}
              {activeModuleIndex < LINEAR_SEARCH_MODULES.length - 1 ? (
                <button
                  id="btn-next-module"
                  onClick={handleNextModule}
                  className="btn-modern-secondary px-4 py-2.5 text-xs sm:text-sm font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Next Topic</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  id="btn-complete-theory-to-game"
                  onClick={() => {
                    onStartLevel(1);
                  }}
                  className="btn-modern-primary px-5 py-2.5 text-xs sm:text-sm font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Award className="w-4 h-4" />
                  <span>Start Game Mode</span>
                </button>
              )}
            </div>

            {/* Curriculum progress indicator */}
            <div className="text-xs sm:text-sm font-mono text-slate-500 dark:text-slate-400 text-center sm:text-right font-medium">
              Topic {activeModule.number} of {LINEAR_SEARCH_MODULES.length}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default LearnLinearSearchSection;
