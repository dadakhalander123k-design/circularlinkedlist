import React from 'react';
import {
  ArrowRight,
  Target,
  Link2,
  Shapes,
  Lightbulb,
  FileText,
  RotateCw,
  Infinity as InfinityIcon,
  BookOpen,
  GitFork,
  Settings,
  CheckSquare,
  Star,
  Database,
  Users,
} from 'lucide-react';
import { soundManager } from '../utils/audio';
import { useScrollReveal } from '../hooks/useScrollReveal';

export interface HomePageProps {
  onContinueLearning: () => void;
  onExploreTopics: () => void;
  onNavigateToTab: (
    tab: 'THEORY' | 'VIDEO' | 'GAME' | 'QUEST' | 'LAB' | 'QUIZ' | 'PROGRESS',
    targetOption?: string | number
  ) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onExploreTopics,
  onNavigateToTab,
}) => {
  // Hook for smooth reveal animation on scroll
  useScrollReveal();

  const handleStartLearning = () => {
    soundManager.playPrimaryClick();
    onExploreTopics();
  };

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-6 sm:gap-7 font-sans text-slate-900 dark:text-slate-100 animate-page-enter pb-10 select-text">
      {/* =========================================================================
          SECTION 01: HERO SECTION & CIRCULAR LINKED LIST DIAGRAM
          ========================================================================= */}
      <section className="reveal-on-scroll bg-white dark:bg-[#111827] p-6 sm:p-10 rounded-2xl border border-slate-200/90 dark:border-blue-500/20 shadow-xs dark:shadow-[0_8px_32px_rgba(0,0,0,0.35)] transition-all">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-center">
          {/* Left Side: Curriculum Label, Main Heading, & Educational Description */}
          <div className="lg:col-span-6 flex flex-col gap-3.5">
            {/* Small Curriculum Label */}
            <div className="flex items-center">
              <span className="text-xs sm:text-sm font-mono font-bold tracking-wider text-[#2563EB] dark:text-[#3B82F6] uppercase">
                THEORY CURRICULUM &nbsp;•&nbsp; MODULE 02 &nbsp;•&nbsp; CHAPTER 01
              </span>
            </div>

            {/* Main Title */}
            <h1 className="text-4xl sm:text-5xl lg:text-[52px] font-extrabold text-[#0F172A] dark:text-white tracking-tight leading-[1.1]">
              Circular<br />
              <span>Linked List</span>
            </h1>

            {/* Educational Description */}
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl font-normal">
              Learn about circular linked lists, where the last node points back to the first node, forming a circle, and
              explore their operations, advantages, and real-world applications.
            </p>
          </div>

          {/* Right Side: Circular Linked List Illustration matching reference */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center lg:items-end">
            <div className="relative w-full max-w-[340px] sm:max-w-[380px] aspect-square flex items-center justify-center select-none">
              <svg viewBox="0 0 360 360" className="w-full h-full drop-shadow-sm overflow-visible">
                <defs>
                  {/* Subtle Central Radial Glow */}
                  <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#EFF6FF" stopOpacity="0.85" />
                    <stop offset="60%" stopColor="#F8FAFF" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
                  </radialGradient>
                  {/* Dark Mode Glow */}
                  <radialGradient id="centerGlowDark" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#1E40AF" stopOpacity="0.25" />
                    <stop offset="60%" stopColor="#172554" stopOpacity="0.1" />
                    <stop offset="100%" stopColor="#111827" stopOpacity="0" />
                  </radialGradient>

                  {/* Marker for Clockwise Loop Arrows */}
                  <marker
                    id="arrowhead"
                    markerWidth="8"
                    markerHeight="8"
                    refX="6"
                    refY="4"
                    orient="auto"
                    markerUnits="strokeWidth"
                  >
                    <path d="M 1 1 L 7 4 L 1 7 Z" fill="#2563EB" />
                  </marker>
                </defs>

                {/* Ambient Center Glow */}
                <circle cx="180" cy="170" r="125" fill="url(#centerGlow)" className="dark:hidden" />
                <circle cx="180" cy="170" r="125" fill="url(#centerGlowDark)" className="hidden dark:block" />

                {/* Circular Track Ring */}
                <circle
                  cx="180"
                  cy="170"
                  r="88"
                  fill="none"
                  stroke="#DBEAFE"
                  strokeWidth="2"
                  className="dark:stroke-blue-950/60"
                />

                {/* 4 Clockwise Curved Flow Arrows                 {/* Arc 1: Node 10 (top) -> Node 20 (right) */}
                <path
                  d="M 190 115 A 88 88 0 0 1 225 150"
                  fill="none"
                  stroke="#2563EB"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  markerEnd="url(#arrowhead)"
                  className="dark:stroke-[#3B82F6]"
                />

                {/* Arc 2: Node 20 (right) -> Node 30 (bottom) */}
                <path
                  d="M 225 190 A 88 88 0 0 1 190 225"
                  fill="none"
                  stroke="#2563EB"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  markerEnd="url(#arrowhead)"
                  className="dark:stroke-[#3B82F6]"
                />

                {/* Arc 3: Node 30 (bottom) -> Node 40 (left) */}
                <path
                  d="M 150 225 A 88 88 0 0 1 115 190"
                  fill="none"
                  stroke="#2563EB"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  markerEnd="url(#arrowhead)"
                  className="dark:stroke-[#3B82F6]"
                />

                {/* Arc 4: Node 40 (left) -> Node 10 (top) */}
                <path
                  d="M 115 150 A 88 88 0 0 1 150 115"
                  fill="none"
                  stroke="#2563EB"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  markerEnd="url(#arrowhead)"
                  className="dark:stroke-[#3B82F6]"
                />

                {/* Top-Left: "Head" Badge & Curved Pointer */}
                <g>
                  {/* Head Badge Box */}
                  <rect
                    x="56"
                    y="42"
                    width="60"
                    height="28"
                    rx="8"
                    fill="#EFF6FF"
                    stroke="#DBEAFE"
                    strokeWidth="1.2"
                    className="dark:fill-blue-950/90 dark:stroke-blue-500/40"
                  />
                  <text
                    x="86"
                    y="61"
                    textAnchor="middle"
                    fill="#2563EB"
                    fontSize="13"
                    fontWeight="700"
                    fontFamily="sans-serif"
                    className="dark:fill-[#3B82F6]"
                  >
                    Head
                  </text>
                  {/* Curved Pointer from Head to Node 10 */}
                  <path
                    d="M 118 56 Q 146 54 154 74"
                    fill="none"
                    stroke="#2563EB"
                    strokeWidth="2"
                    strokeLinecap="round"
                    markerEnd="url(#arrowhead)"
                    className="dark:stroke-[#3B82F6]"
                  />
                </g>

                {/* Bottom-Right: "Last node points to first node" Badge & Pointer */}
                <g>
                  {/* Badge Box */}
                  <rect
                    x="248"
                    y="252"
                    width="106"
                    height="42"
                    rx="10"
                    fill="#EFF6FF"
                    stroke="#DBEAFE"
                    strokeWidth="1.2"
                    className="dark:fill-blue-950/90 dark:stroke-blue-500/40 shadow-xs"
                  />
                  <text
                    x="301"
                    y="269"
                    textAnchor="middle"
                    fill="#1D4ED8"
                    fontSize="11.5"
                    fontWeight="700"
                    fontFamily="sans-serif"
                    className="dark:fill-[#93C5FD]"
                  >
                    Last node
                  </text>
                  <text
                    x="301"
                    y="284"
                    textAnchor="middle"
                    fill="#1D4ED8"
                    fontSize="11.5"
                    fontWeight="700"
                    fontFamily="sans-serif"
                    className="dark:fill-[#93C5FD]"
                  >
                    points to first node
                  </text>
                  {/* Pointer from Badge towards bottom cycle */}
                  <path
                    d="M 270 252 Q 256 236 242 232"
                    fill="none"
                    stroke="#2563EB"
                    strokeWidth="2"
                    strokeLinecap="round"
                    markerEnd="url(#arrowhead)"
                    className="dark:stroke-[#3B82F6]"
                  />
                </g>

                {/* NODE 10 (Top: cx=180, cy=82) */}
                <g transform="translate(180, 82)">
                  <circle
                    cx="0"
                    cy="0"
                    r="25"
                    fill="#FFFFFF"
                    stroke="#2563EB"
                    strokeWidth="2.5"
                    className="dark:fill-[#172033] dark:stroke-[#3B82F6] shadow-md"
                  />
                  <text
                    x="0"
                    y="6"
                    textAnchor="middle"
                    fill="#172554"
                    fontSize="17"
                    fontWeight="800"
                    fontFamily="monospace"
                    className="dark:fill-[#F8FAFC]"
                  >
                    10
                  </text>
                </g>

                {/* NODE 20 (Right: cx=268, cy=170) */}
                <g transform="translate(268, 170)">
                  <circle
                    cx="0"
                    cy="0"
                    r="25"
                    fill="#FFFFFF"
                    stroke="#2563EB"
                    strokeWidth="2.5"
                    className="dark:fill-[#172033] dark:stroke-[#3B82F6] shadow-md"
                  />
                  <text
                    x="0"
                    y="6"
                    textAnchor="middle"
                    fill="#172554"
                    fontSize="17"
                    fontWeight="800"
                    fontFamily="monospace"
                    className="dark:fill-[#F8FAFC]"
                  >
                    20
                  </text>
                </g>

                {/* NODE 30 (Bottom: cx=180, cy=258) */}
                <g transform="translate(180, 258)">
                  <circle
                    cx="0"
                    cy="0"
                    r="25"
                    fill="#FFFFFF"
                    stroke="#2563EB"
                    strokeWidth="2.5"
                    className="dark:fill-[#172033] dark:stroke-[#3B82F6] shadow-md"
                  />
                  <text
                    x="0"
                    y="6"
                    textAnchor="middle"
                    fill="#172554"
                    fontSize="17"
                    fontWeight="800"
                    fontFamily="monospace"
                    className="dark:fill-[#F8FAFC]"
                  >
                    30
                  </text>
                </g>

                {/* NODE 40 (Left: cx=92, cy=170) */}
                <g transform="translate(92, 170)">
                  <circle
                    cx="0"
                    cy="0"
                    r="25"
                    fill="#FFFFFF"
                    stroke="#2563EB"
                    strokeWidth="2.5"
                    className="dark:fill-[#172033] dark:stroke-[#3B82F6] shadow-md"
                  />
                  <text
                    x="0"
                    y="6"
                    textAnchor="middle"
                    fill="#172554"
                    fontSize="17"
                    fontWeight="800"
                    fontFamily="monospace"
                    className="dark:fill-[#F8FAFC]"
                  >
                    40
                  </text>
                </g>
              </svg>
            </div>
          </div>
        </div>

        {/* =========================================================================
            HERO INFORMATION CARDS (3 Cards)
            ========================================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 pt-8 border-t border-slate-100 dark:border-blue-500/15">
          {/* Card 1: Core Idea */}
          <div className="bg-white dark:bg-[#0F172A] border border-slate-200/90 dark:border-blue-500/20 rounded-2xl p-5 flex items-start gap-3.5 shadow-2xs hover:border-[#2563EB] dark:hover:border-blue-500/40 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-[#EFF6FF] dark:bg-blue-950/70 border border-[#DBEAFE] dark:border-blue-500/30 flex items-center justify-center text-[#2563EB] dark:text-[#3B82F6] shrink-0">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-[17px] font-bold text-[#0F172A] dark:text-white">Core Idea</h2>
              <p className="text-sm sm:text-[14.5px] text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
                A linked list where the last node points back to the first node.
              </p>
            </div>
          </div>

          {/* Card 2: Key Operations */}
          <div className="bg-white dark:bg-[#0F172A] border border-slate-200/90 dark:border-blue-500/20 rounded-2xl p-5 flex items-start gap-3.5 shadow-2xs hover:border-[#2563EB] dark:hover:border-blue-500/40 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-[#EFF6FF] dark:bg-blue-950/70 border border-[#DBEAFE] dark:border-blue-500/30 flex items-center justify-center text-[#2563EB] dark:text-[#3B82F6] shrink-0">
              <Link2 className="w-6 h-6 -rotate-45" />
            </div>
            <div>
              <h2 className="text-base sm:text-[17px] font-bold text-[#0F172A] dark:text-white">Key Operations</h2>
              <p className="text-sm sm:text-[14.5px] text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
                Insertion, deletion, traversal, and searching.
              </p>
            </div>
          </div>

          {/* Card 3: Main Advantage */}
          <div className="bg-white dark:bg-[#0F172A] border border-slate-200/90 dark:border-blue-500/20 rounded-2xl p-5 flex items-start gap-3.5 shadow-2xs hover:border-[#2563EB] dark:hover:border-blue-500/40 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-[#EFF6FF] dark:bg-blue-950/70 border border-[#DBEAFE] dark:border-blue-500/30 flex items-center justify-center text-[#2563EB] dark:text-[#3B82F6] shrink-0">
              <Shapes className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-[17px] font-bold text-[#0F172A] dark:text-white">Main Advantage</h2>
              <p className="text-sm sm:text-[14.5px] text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
                Efficient circular traversal and useful in cyclic applications.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 02: 1. THE MAIN IDEA
          ========================================================================= */}
      <section className="reveal-on-scroll bg-white dark:bg-[#111827] p-6 sm:p-9 rounded-2xl border border-slate-200/90 dark:border-blue-500/20 shadow-xs dark:shadow-[0_8px_32px_rgba(0,0,0,0.35)]">
        {/* Section Header */}
        <div className="flex items-center gap-2.5 mb-6">
          <div className="w-9 h-9 rounded-full bg-[#EFF6FF] dark:bg-blue-950/70 border border-[#DBEAFE] dark:border-blue-500/30 flex items-center justify-center text-[#2563EB] dark:text-[#3B82F6]">
            <Lightbulb className="w-5 h-5" />
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#0F172A] dark:text-white tracking-tight">
            1. The Main Idea
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
          {/* Left Column: Question & Explanation */}
          <div className="lg:col-span-4 flex flex-col gap-2.5">
            <h3 className="text-lg sm:text-xl font-bold text-[#1E40AF] dark:text-[#60A5FA] leading-snug">
              What makes a linked list<br />
              “circular”?
            </h3>
            <p className="text-sm sm:text-base text-slate-700 dark:text-slate-200 leading-relaxed font-normal">
              In a circular linked list, the last node does not point to NULL but instead points back to the first node,
              forming a circle. This allows continuous traversal from any node.
            </p>
          </div>

          {/* Right Column: 4-Step Process Flow Diagram */}
          <div className="lg:col-span-8 bg-[#F8FAFF] dark:bg-[#0F172A] border border-slate-200/80 dark:border-blue-500/20 rounded-2xl p-5 sm:p-6">
            <div className="grid grid-cols-2 gap-x-4 gap-y-6 items-start sm:flex sm:flex-nowrap sm:items-center sm:justify-between sm:gap-2">
              {/* Step 1: Node */}
              <div className="flex flex-col items-center text-center w-full sm:w-auto sm:flex-1 sm:min-w-[90px]">
                <div className="w-13 h-13 rounded-full bg-[#EFF6FF] dark:bg-blue-950/80 border border-[#DBEAFE] dark:border-blue-500/30 text-[#2563EB] dark:text-[#3B82F6] flex items-center justify-center shadow-xs mb-2.5 shrink-0">
                  <FileText className="w-6 h-6 text-[#2563EB] dark:text-[#3B82F6]" />
                </div>
                <span className="text-base font-bold text-[#0F172A] dark:text-white">Node</span>
                <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 leading-snug">Stores data &amp; address</span>
              </div>

              {/* Arrow 1 */}
              <ArrowRight className="w-4 h-4 text-[#3B82F6] dark:text-[#6366F1] shrink-0 hidden sm:block" />

              {/* Step 2: Next Pointer */}
              <div className="flex flex-col items-center text-center w-full sm:w-auto sm:flex-1 sm:min-w-[90px]">
                <div className="w-13 h-13 rounded-full bg-[#EFF6FF] dark:bg-blue-950/80 border border-[#DBEAFE] dark:border-blue-500/30 text-[#2563EB] dark:text-[#3B82F6] flex items-center justify-center shadow-xs mb-2.5 shrink-0">
                  <ArrowRight className="w-6 h-6 text-[#2563EB] dark:text-[#3B82F6] stroke-[2.5]" />
                </div>
                <span className="text-base font-bold text-[#0F172A] dark:text-white">Next Pointer</span>
                <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 leading-snug">Points to next node</span>
              </div>

              {/* Arrow 2 */}
              <ArrowRight className="w-4 h-4 text-[#3B82F6] dark:text-[#6366F1] shrink-0 hidden sm:block" />

              {/* Step 3: Last Node */}
              <div className="flex flex-col items-center text-center w-full sm:w-auto sm:flex-1 sm:min-w-[90px]">
                <div className="w-13 h-13 rounded-full bg-[#EFF6FF] dark:bg-blue-950/80 border border-[#DBEAFE] dark:border-blue-500/30 text-[#2563EB] dark:text-[#3B82F6] flex items-center justify-center shadow-xs mb-2.5 shrink-0">
                  <RotateCw className="w-6 h-6 text-[#2563EB] dark:text-[#3B82F6] stroke-[2.4]" />
                </div>
                <span className="text-base font-bold text-[#0F172A] dark:text-white">Last Node</span>
                <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 leading-snug">Points back to first node</span>
              </div>

              {/* Arrow 3 */}
              <ArrowRight className="w-4 h-4 text-[#3B82F6] dark:text-[#6366F1] shrink-0 hidden sm:block" />

              {/* Step 4: Circular Traversal */}
              <div className="flex flex-col items-center text-center w-full sm:w-auto sm:flex-1 sm:min-w-[90px]">
                <div className="w-13 h-13 rounded-full bg-[#EFF6FF] dark:bg-blue-950/80 border border-[#DBEAFE] dark:border-blue-500/30 text-[#2563EB] dark:text-[#3B82F6] flex items-center justify-center shadow-xs mb-2.5 shrink-0">
                  <InfinityIcon className="w-6 h-6 text-[#2563EB] dark:text-[#3B82F6] stroke-[2.4]" />
                </div>
                <span className="text-base font-bold text-[#0F172A] dark:text-white">Circular Traversal</span>
                <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 leading-snug">Loop from any node</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 03: 2. CONCEPT ROADMAP
          ========================================================================= */}
      <section className="reveal-on-scroll bg-white dark:bg-[#111827] p-6 sm:p-9 rounded-2xl border border-slate-200/90 dark:border-blue-500/20 shadow-xs dark:shadow-[0_8px_32px_rgba(0,0,0,0.35)]">
        {/* Section Header */}
        <div className="flex items-center gap-2.5 mb-8">
          <div className="w-9 h-9 rounded-full bg-[#EFF6FF] dark:bg-blue-950/70 border border-[#DBEAFE] dark:border-blue-500/30 flex items-center justify-center text-[#2563EB] dark:text-[#3B82F6]">
            <BookOpen className="w-5 h-5" />
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#0F172A] dark:text-white tracking-tight">
            2. Concept Roadmap
          </h2>
        </div>

        {/* 5-Stage Progression */}
        <div className="relative">
          {/* Connected Dashed Line Across the 5 Steps (desktop) */}
          <div className="hidden md:block absolute top-5 left-[10%] right-[10%] h-0.5 border-t-2 border-dashed border-[#DBEAFE] dark:border-blue-500/40 z-0" />

          <div className="flex flex-col items-center md:grid md:grid-cols-5 md:gap-4 md:items-start relative z-10">
            {/* Stage 01: Introduction to Circular Linked List */}
            <div
              onClick={() => {
                soundManager.playSelect();
                onNavigateToTab('THEORY', 'theory-01');
              }}
              className="flex flex-col items-center text-center group cursor-pointer w-full max-w-[220px] md:max-w-none"
            >
              <div className="w-10 h-10 rounded-full bg-[#EFF6FF] dark:bg-blue-950 text-[#2563EB] dark:text-[#3B82F6] border-2 border-white dark:border-[#111827] shadow-xs flex items-center justify-center font-mono font-extrabold text-sm mb-3 group-hover:bg-[#2563EB] group-hover:text-white transition-colors">
                01
              </div>
              <div className="w-13 h-13 rounded-full bg-[#F8FAFF] dark:bg-[#172033] border border-[#DBEAFE] dark:border-blue-500/30 flex items-center justify-center text-[#2563EB] dark:text-[#3B82F6] mb-2.5 shadow-2xs group-hover:border-[#2563EB] transition-all">
                <GitFork className="w-5 h-5 rotate-180" />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-[#0F172A] dark:text-white leading-snug">
                Introduction <br className="hidden md:inline" /> to Circular Linked List
              </h3>
            </div>

            {/* Mobile Connector Line: 01 -> 02 */}
            <div className="md:hidden w-0.5 h-6 border-l-2 border-dashed border-[#DBEAFE] dark:border-blue-500/40 my-2" />

            {/* Stage 02: Node Structure and Representation */}
            <div
              onClick={() => {
                soundManager.playSelect();
                onNavigateToTab('THEORY', 'theory-02');
              }}
              className="flex flex-col items-center text-center group cursor-pointer w-full max-w-[220px] md:max-w-none"
            >
              <div className="w-10 h-10 rounded-full bg-[#EFF6FF] dark:bg-blue-950 text-[#2563EB] dark:text-[#3B82F6] border-2 border-white dark:border-[#111827] shadow-xs flex items-center justify-center font-mono font-extrabold text-sm mb-3 group-hover:bg-[#2563EB] group-hover:text-white transition-colors">
                02
              </div>
              <div className="w-13 h-13 rounded-full bg-[#F8FAFF] dark:bg-[#172033] border border-[#DBEAFE] dark:border-blue-500/30 flex items-center justify-center text-[#2563EB] dark:text-[#3B82F6] mb-2.5 shadow-2xs group-hover:border-[#2563EB] transition-all">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-[#0F172A] dark:text-white leading-snug">
                Node Structure <br className="hidden md:inline" /> and Representation
              </h3>
            </div>

            {/* Mobile Connector Line: 02 -> 03 */}
            <div className="md:hidden w-0.5 h-6 border-l-2 border-dashed border-[#DBEAFE] dark:border-blue-500/40 my-2" />

            {/* Stage 03: Operations (Insertion & Deletion) */}
            <div
              onClick={() => {
                soundManager.playSelect();
                onNavigateToTab('THEORY', 'theory-03');
              }}
              className="flex flex-col items-center text-center group cursor-pointer w-full max-w-[220px] md:max-w-none"
            >
              <div className="w-10 h-10 rounded-full bg-[#EFF6FF] dark:bg-blue-950 text-[#2563EB] dark:text-[#3B82F6] border-2 border-white dark:border-[#111827] shadow-xs flex items-center justify-center font-mono font-extrabold text-sm mb-3 group-hover:bg-[#2563EB] group-hover:text-white transition-colors">
                03
              </div>
              <div className="w-13 h-13 rounded-full bg-[#F8FAFF] dark:bg-[#172033] border border-[#DBEAFE] dark:border-blue-500/30 flex items-center justify-center text-[#2563EB] dark:text-[#3B82F6] mb-2.5 shadow-2xs group-hover:border-[#2563EB] transition-all">
                <Settings className="w-5 h-5" />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-[#0F172A] dark:text-white leading-snug">
                Operations <br className="hidden md:inline" /> (Insertion &amp; Deletion)
              </h3>
            </div>

            {/* Mobile Connector Line: 03 -> 04 */}
            <div className="md:hidden w-0.5 h-6 border-l-2 border-dashed border-[#DBEAFE] dark:border-blue-500/40 my-2" />

            {/* Stage 04: Traversal Techniques */}
            <div
              onClick={() => {
                soundManager.playSelect();
                onNavigateToTab('THEORY', 'theory-04');
              }}
              className="flex flex-col items-center text-center group cursor-pointer w-full max-w-[220px] md:max-w-none"
            >
              <div className="w-10 h-10 rounded-full bg-[#EFF6FF] dark:bg-blue-950 text-[#2563EB] dark:text-[#3B82F6] border-2 border-white dark:border-[#111827] shadow-xs flex items-center justify-center font-mono font-extrabold text-sm mb-3 group-hover:bg-[#2563EB] group-hover:text-white transition-colors">
                04
              </div>
              <div className="w-13 h-13 rounded-full bg-[#F8FAFF] dark:bg-[#172033] border border-[#DBEAFE] dark:border-blue-500/30 flex items-center justify-center text-[#2563EB] dark:text-[#3B82F6] mb-2.5 shadow-2xs group-hover:border-[#2563EB] transition-all">
                <RotateCw className="w-5 h-5 stroke-[2.4]" />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-[#0F172A] dark:text-white leading-snug">
                Traversal <br className="hidden md:inline" /> Techniques
              </h3>
            </div>

            {/* Mobile Connector Line: 04 -> 05 */}
            <div className="md:hidden w-0.5 h-6 border-l-2 border-dashed border-[#DBEAFE] dark:border-blue-500/40 my-2" />

            {/* Stage 05: Applications and Advantages */}
            <div
              onClick={() => {
                soundManager.playSelect();
                onNavigateToTab('THEORY', 'theory-05');
              }}
              className="flex flex-col items-center text-center group cursor-pointer w-full max-w-[220px] md:max-w-none"
            >
              <div className="w-10 h-10 rounded-full bg-[#EFF6FF] dark:bg-blue-950 text-[#2563EB] dark:text-[#3B82F6] border-2 border-white dark:border-[#111827] shadow-xs flex items-center justify-center font-mono font-extrabold text-sm mb-3 group-hover:bg-[#2563EB] group-hover:text-white transition-colors">
                05
              </div>
              <div className="w-13 h-13 rounded-full bg-[#F8FAFF] dark:bg-[#172033] border border-[#DBEAFE] dark:border-blue-500/30 flex items-center justify-center text-[#2563EB] dark:text-[#3B82F6] mb-2.5 shadow-2xs group-hover:border-[#2563EB] transition-all">
                <CheckSquare className="w-5 h-5 fill-[#2563EB] text-white dark:fill-[#3B82F6] dark:text-[#172033]" />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-[#0F172A] dark:text-white leading-snug">
                Applications <br className="hidden md:inline" /> and Advantages
              </h3>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 04: 3. WHY THIS TOPIC MATTERS
          ========================================================================= */}
      <section className="reveal-on-scroll bg-white dark:bg-[#111827] p-6 sm:p-9 rounded-2xl border border-slate-200/90 dark:border-blue-500/20 shadow-xs dark:shadow-[0_8px_32px_rgba(0,0,0,0.35)]">
        {/* Section Header */}
        <div className="flex items-center gap-2.5 mb-6">
          <div className="w-9 h-9 rounded-full bg-[#EFF6FF] dark:bg-blue-950/70 border border-[#DBEAFE] dark:border-blue-500/30 flex items-center justify-center text-[#2563EB] dark:text-[#3B82F6]">
            <Star className="w-5 h-5" />
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#0F172A] dark:text-white tracking-tight">
            3. Why This Topic Matters
          </h2>
        </div>

        {/* 3 Value Cards Matching Exact Reference */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: Continuous Access (Subtle Violet Accent at right edge) */}
          <div className="bg-[#EFF6FF] dark:bg-[#172033] border border-[#DBEAFE] dark:border-blue-500/25 rounded-2xl p-5 sm:p-6 flex flex-col justify-between gap-4 shadow-2xs">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#1D4ED8] to-[#6366F1] text-white flex items-center justify-center shadow-xs">
              <RotateCw className="w-5 h-5 stroke-[2.4]" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#0F172A] dark:text-white mb-2">Continuous Access</h3>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                Allows seamless traversal without reaching NULL.
              </p>
            </div>
          </div>

          {/* Card 2: Useful in Real Systems (Subtle Green Tint) */}
          <div className="bg-[#ECFDF5] dark:bg-[#172033] border border-[#D1FAE5] dark:border-emerald-500/25 rounded-2xl p-5 sm:p-6 flex flex-col justify-between gap-4 shadow-2xs">
            <div className="w-12 h-12 rounded-full bg-[#10B981] text-white flex items-center justify-center shadow-xs">
              <Database className="w-5 h-5 fill-white/20" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#0F172A] dark:text-white mb-2">Useful in Real Systems</h3>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                Used in round-robin scheduling, circular buffers, and playlists.
              </p>
            </div>
          </div>

          {/* Card 3: Improved Efficiency (Subtle Royal-Blue Tint) */}
          <div className="bg-[#EFF6FF] dark:bg-[#172033] border border-[#DBEAFE] dark:border-blue-500/25 rounded-2xl p-5 sm:p-6 flex flex-col justify-between gap-4 shadow-2xs">
            <div className="w-12 h-12 rounded-full bg-[#2563EB] text-white flex items-center justify-center shadow-xs">
              <Users className="w-5 h-5 fill-white/20" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#0F172A] dark:text-white mb-2">Improved Efficiency</h3>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                Enables cyclic data processing and better resource utilization.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 05: 4. READY TO START?
          ========================================================================= */}
      <section className="reveal-on-scroll bg-gradient-to-r from-[#EFF6FF] via-[#F8FAFF] to-[#F0F4FF] dark:from-[#111827] dark:via-[#172033] dark:to-[#111827] border border-[#DBEAFE] dark:border-blue-500/30 p-6 sm:p-8 rounded-2xl shadow-xs dark:shadow-[0_8px_32px_rgba(0,0,0,0.35)]">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Left Side: Educational Rocket Visual & Supporting Text */}
          <div className="flex items-center gap-5 sm:gap-6">
            {/* 3D Diagonal Rocket Illustration matching exact Reference Image */}
            <div className="w-18 h-18 sm:w-22 sm:h-22 shrink-0 flex items-center justify-center relative select-none">
              <svg viewBox="0 0 120 120" className="w-full h-full drop-shadow-md">
                <defs>
                  {/* Gradients for 3D Shading */}
                  <linearGradient id="rocketBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FFFFFF" />
                    <stop offset="65%" stopColor="#F8FAFC" />
                    <stop offset="100%" stopColor="#CBD5E1" />
                  </linearGradient>
                  <linearGradient id="purpleNoseGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#1D4ED8" />
                    <stop offset="60%" stopColor="#2563EB" />
                    <stop offset="100%" stopColor="#6366F1" />
                  </linearGradient>
                  <linearGradient id="purpleFinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#1D4ED8" />
                    <stop offset="60%" stopColor="#2563EB" />
                    <stop offset="100%" stopColor="#6366F1" />
                  </linearGradient>
                  <linearGradient id="exhaustBeamGrad" x1="100%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#FFEDD5" stopOpacity="0.95" />
                    <stop offset="50%" stopColor="#FED7AA" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
                  </linearGradient>
                  <radialGradient id="cloudGrad" cx="35%" cy="30%" r="65%">
                    <stop offset="0%" stopColor="#FFFFFF" />
                    <stop offset="70%" stopColor="#F1F5F9" />
                    <stop offset="100%" stopColor="#E2E8F0" />
                  </radialGradient>
                  <radialGradient id="cloudShadowGrad" cx="40%" cy="35%" r="65%">
                    <stop offset="0%" stopColor="#E2E8F0" />
                    <stop offset="100%" stopColor="#CBD5E1" />
                  </radialGradient>
                </defs>

                {/* --- BILLOWING FLUFFY 3D CLOUDS (Background layers) --- */}
                <g>
                  {/* Deep shadow cloud base */}
                  <circle cx="24" cy="98" r="16" fill="#DBEAFE" opacity="0.45" />
                  <circle cx="44" cy="100" r="16" fill="#E2E8F0" opacity="0.8" />
                  <circle cx="68" cy="94" r="14" fill="#E2E8F0" opacity="0.7" />

                  {/* Mid-ground fluffy clouds */}
                  <circle cx="16" cy="90" r="14" fill="url(#cloudGrad)" />
                  <circle cx="34" cy="82" r="18" fill="url(#cloudGrad)" />
                  <circle cx="56" cy="84" r="17" fill="url(#cloudGrad)" />
                  <circle cx="76" cy="92" r="14" fill="url(#cloudGrad)" />
                  <circle cx="46" cy="96" r="16" fill="url(#cloudGrad)" />

                  {/* Highlights on cloud tops */}
                  <ellipse cx="32" cy="74" rx="9" ry="4.5" fill="#FFFFFF" opacity="0.9" />
                  <ellipse cx="54" cy="76" rx="8" ry="4" fill="#FFFFFF" opacity="0.9" />
                </g>

                {/* --- EXHAUST PLUME STREAM (Connecting engine to cloud base) --- */}
                <g>
                  <path
                    d="M 52 68 Q 36 82 28 92 Q 44 80 58 62 Z"
                    fill="url(#exhaustBeamGrad)"
                  />
                  {/* Small bright core flame */}
                  <path
                    d="M 50 67 Q 40 76 34 82 Q 44 75 54 63 Z"
                    fill="#FDBA74"
                    opacity="0.9"
                  />
                  <path
                    d="M 49 67 Q 43 72 38 77 Q 45 72 52 64 Z"
                    fill="#F97316"
                  />
                </g>

                {/* --- ROCKET STRUCTURE (Oriented ~45deg diagonally) --- */}
                <g transform="rotate(45, 68, 52)">
                  {/* Left Fin (flared out) */}
                  <path
                    d="M 54 58 C 42 64 38 74 42 78 C 50 76 56 70 58 64 Z"
                    fill="url(#purpleFinGrad)"
                  />

                  {/* Right Fin (flared down/back) */}
                  <path
                    d="M 82 58 C 94 64 98 74 94 78 C 86 76 80 70 78 64 Z"
                    fill="url(#purpleFinGrad)"
                  />

                  {/* Red Engine Base / Mounting Ring */}
                  <path
                    d="M 56 68 L 80 68 L 77 74 L 59 74 Z"
                    fill="#EF4444"
                  />
                  {/* Orange Flame Emitter Nozzle */}
                  <path
                    d="M 62 74 Q 68 82 68 83 Q 68 82 74 74 Z"
                    fill="#F97316"
                  />

                  {/* Rocket Fuselage Body */}
                  <path
                    d="M 68 16 C 52 30 52 60 56 68 L 80 68 C 84 60 84 30 68 16 Z"
                    fill="url(#rocketBodyGrad)"
                    stroke="#E2E8F0"
                    strokeWidth="0.5"
                  />

                  {/* Nosecone */}
                  <path
                    d="M 68 16 C 60 23 55 31 54 37 L 82 37 C 81 31 76 23 68 16 Z"
                    fill="url(#purpleNoseGrad)"
                  />

                  {/* Dorsal Spine Fin */}
                  <path
                    d="M 66 37 Q 68 56 65 67 L 71 67 Q 68 56 70 37 Z"
                    fill="url(#purpleFinGrad)"
                  />

                  {/* 3D Porthole / Window */}
                  <circle cx="68" cy="46" r="8" fill="url(#purpleNoseGrad)" stroke="#FFFFFF" strokeWidth="2" />
                  <circle cx="68" cy="46" r="5" fill="#172554" />
                  <circle cx="66" cy="44" r="1.75" fill="#FFFFFF" opacity="0.9" />
                </g>
              </svg>
            </div>

            {/* Title & Description */}
            <div className="flex flex-col gap-1.5">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] dark:text-white tracking-tight">
                4. Ready to Start?
              </h2>
              <p className="text-sm sm:text-base text-slate-700 dark:text-slate-200 max-w-lg leading-relaxed font-normal">
                Begin with the fundamental idea behind circular linked lists and explore their structure and operations.
              </p>
            </div>
          </div>

          {/* Right Side: Start Learning Button */}
          <button
            id="btn-home-start-learning"
            onClick={handleStartLearning}
            className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-[#1D4ED8] via-[#2563EB] to-[#6366F1] hover:from-[#1E40AF] hover:via-[#1D4ED8] hover:to-[#4F46E5] text-white font-bold text-base sm:text-lg rounded-xl transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2.5 cursor-pointer shrink-0 group hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>Start Learning</span>
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </section>
    </div>
  );
};
