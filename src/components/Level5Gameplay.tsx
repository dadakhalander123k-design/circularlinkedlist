import React, { useState } from 'react';
import {
  ArrowRight,
  Sparkles,
  Award,
  CheckCircle2,
  Search,
  Wrench,
  AlertCircle,
} from 'lucide-react';
import { soundManager } from '../utils/audio';
import { GuidedSolvePanel } from './GuidedSolvePanel';
import { CLLCanvas, VisualNodeData } from './cll/CLLCanvas';
import { CLLMemoryBar } from './cll/CLLMemoryBar';

interface Level5GameplayProps {
  onLevelComplete: (levelId: number, score: number) => void;
  onScoreUpdate: (delta: number) => void;
  onStreakUpdate: (streak: number) => void;
}

export const Level5Gameplay: React.FC<Level5GameplayProps> = ({
  onLevelComplete,
  onScoreUpdate,
  onStreakUpdate,
}) => {
  // 4 Pure Gameplay Tasks: 'task1_search' -> 'task2_search_missing' -> 'task3_repair' -> 'task4_master_challenge' -> 'completed'
  const [task, setTask] = useState<
    'task1_search' | 'task2_search_missing' | 'task3_repair' | 'task4_master_challenge' | 'completed'
  >('task1_search');

  // Guided Solve state
  const [isGuidedSolveActive, setIsGuidedSolveActive] = useState<boolean>(false);
  const [mistakeText, setMistakeText] = useState<string | null>(null);

  // -------------------------------------------------------------
  // TASK 1: Search Existing Target (Target: 30 at Address 1004)
  // -------------------------------------------------------------
  const [t1Head, setT1Head] = useState<number>(1000);
  const [t1Tail, setT1Tail] = useState<number>(1006);
  const [t1Nodes, setT1Nodes] = useState<VisualNodeData[]>([
    { id: 't1-1000', address: 1000, value: 10, nextId: 't1-1002', nextAddress: 1002, isHead: true },
    { id: 't1-1002', address: 1002, value: 20, nextId: 't1-1004', nextAddress: 1004 },
    { id: 't1-1004', address: 1004, value: 30, nextId: 't1-1006', nextAddress: 1006 },
    { id: 't1-1006', address: 1006, value: 40, nextId: 't1-1000', nextAddress: 1000, isTail: true },
  ]);
  const [t1CurrentIdx, setT1CurrentIdx] = useState<number>(0);
  const [t1Found, setT1Found] = useState<boolean>(false);

  const handleT1Step = () => {
    if (t1Found) return;
    soundManager.playClick();
    if (t1CurrentIdx === 2) {
      soundManager.playCalcSuccess();
      setT1Found(true);
      onScoreUpdate(25);
      onStreakUpdate(1);
    } else {
      setT1CurrentIdx((prev) => prev + 1);
    }
  };

  // -------------------------------------------------------------
  // TASK 2: Search Missing Target (Target: 50)
  // -------------------------------------------------------------
  const [t2Head, setT2Head] = useState<number>(1000);
  const [t2Tail, setT2Tail] = useState<number>(1006);
  const [t2Nodes, setT2Nodes] = useState<VisualNodeData[]>([
    { id: 't2-1000', address: 1000, value: 10, nextId: 't2-1002', nextAddress: 1002, isHead: true },
    { id: 't2-1002', address: 1002, value: 20, nextId: 't2-1004', nextAddress: 1004 },
    { id: 't2-1004', address: 1004, value: 30, nextId: 't2-1006', nextAddress: 1006 },
    { id: 't2-1006', address: 1006, value: 40, nextId: 't2-1000', nextAddress: 1000, isTail: true },
  ]);
  const [t2CurrentIdx, setT2CurrentIdx] = useState<number>(0);
  const [t2CycleCompleted, setT2CycleCompleted] = useState<boolean>(false);
  const [t2Done, setT2Done] = useState<boolean>(false);

  const handleT2Step = () => {
    if (t2Done) return;
    soundManager.playClick();
    if (t2CurrentIdx === 3) {
      setT2CurrentIdx(0);
      setT2CycleCompleted(true);
    } else {
      setT2CurrentIdx((prev) => prev + 1);
    }
  };

  const handleT2Conclude = () => {
    soundManager.playCalcSuccess();
    setT2Done(true);
    onScoreUpdate(25);
    onStreakUpdate(2);
  };

  // -------------------------------------------------------------
  // TASK 3: Repair Broken Pointer / Address (1004 points to NULL)
  // -------------------------------------------------------------
  const [bossNodes, setBossNodes] = useState<VisualNodeData[]>([
    { id: 'b-1000', address: 1000, value: 10, nextId: 'b-1002', nextAddress: 1002, isHead: true },
    { id: 'b-1002', address: 1002, value: 20, nextId: 'b-1004', nextAddress: 1004 },
    {
      id: 'b-1004',
      address: 1004,
      value: 30,
      nextId: null,
      nextAddress: null,
      hasBrokenPointer: true,
      customBadge: 'BROKEN TAIL',
    },
  ]);
  const [bossRepaired, setBossRepaired] = useState<boolean>(false);
  const [bossHead, setBossHead] = useState<number>(1000);
  const [bossTail, setBossTail] = useState<number>(1004);

  const handleRepairAction = () => {
    setMistakeText(null);
    soundManager.playCalcSuccess();
    setBossRepaired(true);
    setBossNodes((prev) =>
      prev.map((n) =>
        n.address === 1004
          ? {
              ...n,
              nextId: 'b-1000',
              nextAddress: 1000,
              hasBrokenPointer: false,
              customBadge: 'REPAIRED TAIL',
            }
          : n
      )
    );
    onScoreUpdate(30);
    onStreakUpdate(3);
  };

  // -------------------------------------------------------------
  // TASK 4: Master Challenge (Live 5-step sequence with addresses)
  // -------------------------------------------------------------
  const [masterStep, setMasterStep] = useState<number>(1);
  const [masterHead, setMasterHead] = useState<number>(1000);
  const [masterTail, setMasterTail] = useState<number>(1004);
  const [masterNodes, setMasterNodes] = useState<VisualNodeData[]>([
    { id: 'mc-1000', address: 1000, value: 10, nextId: 'mc-1002', nextAddress: 1002, isHead: true },
    { id: 'mc-1002', address: 1002, value: 20, nextId: 'mc-1004', nextAddress: 1004 },
    { id: 'mc-1004', address: 1004, value: 30, nextId: 'mc-1000', nextAddress: 1000, isTail: true },
  ]);
  const [masterCurrentId, setMasterCurrentId] = useState<string | null>(null);

  // Address input handler for Task 3 and Task 4
  const handleApplyNextAddress = (fromNodeId: string, targetAddress: number) => {
    setMistakeText(null);

    if (task === 'task3_repair') {
      if (targetAddress !== 1000) {
        soundManager.playError();
        setMistakeText(`To repair the circular link, tail 1004 must point to HEAD address (1000), not ${targetAddress}.`);
        return;
      }
      handleRepairAction();
    } else if (task === 'task4_master_challenge') {
      // Allow student to advance step via address entry if desired
      handleMasterAction();
    }
  };

  const handleMasterAction = () => {
    setMistakeText(null);
    if (masterStep === 1) {
      // Insert 5 at address 1006 at beginning
      soundManager.playCalcSuccess();
      setMasterHead(1006);
      setMasterNodes([
        { id: 'mc-1006', address: 1006, value: 5, nextId: 'mc-1000', nextAddress: 1000, isHead: true, customBadge: 'NEW HEAD' },
        { id: 'mc-1000', address: 1000, value: 10, nextId: 'mc-1002', nextAddress: 1002 },
        { id: 'mc-1002', address: 1002, value: 20, nextId: 'mc-1004', nextAddress: 1004 },
        { id: 'mc-1004', address: 1004, value: 30, nextId: 'mc-1006', nextAddress: 1006, isTail: true },
      ]);
      setMasterStep(2);
      onScoreUpdate(20);
      onStreakUpdate(4);
    } else if (masterStep === 2) {
      // Insert 25 at address 1008 between 1002 and 1004
      soundManager.playCalcSuccess();
      setMasterNodes([
        { id: 'mc-1006', address: 1006, value: 5, nextId: 'mc-1000', nextAddress: 1000, isHead: true },
        { id: 'mc-1000', address: 1000, value: 10, nextId: 'mc-1002', nextAddress: 1002 },
        { id: 'mc-1002', address: 1002, value: 20, nextId: 'mc-1008', nextAddress: 1008 },
        { id: 'mc-1008', address: 1008, value: 25, nextId: 'mc-1004', nextAddress: 1004, customBadge: 'INSERTED' },
        { id: 'mc-1004', address: 1004, value: 30, nextId: 'mc-1006', nextAddress: 1006, isTail: true },
      ]);
      setMasterStep(3);
      onScoreUpdate(20);
      onStreakUpdate(5);
    } else if (masterStep === 3) {
      // Delete 10 (addr 1000)
      soundManager.playCalcSuccess();
      setMasterNodes([
        { id: 'mc-1006', address: 1006, value: 5, nextId: 'mc-1002', nextAddress: 1002, isHead: true },
        { id: 'mc-1002', address: 1002, value: 20, nextId: 'mc-1008', nextAddress: 1008 },
        { id: 'mc-1008', address: 1008, value: 25, nextId: 'mc-1004', nextAddress: 1004 },
        { id: 'mc-1004', address: 1004, value: 30, nextId: 'mc-1006', nextAddress: 1006, isTail: true },
      ]);
      setMasterStep(4);
      onScoreUpdate(20);
      onStreakUpdate(6);
    } else if (masterStep === 4) {
      // Search for 25 at address 1008
      soundManager.playCalcSuccess();
      setMasterCurrentId('mc-1008');
      setMasterStep(5);
      onScoreUpdate(20);
      onStreakUpdate(7);
    } else if (masterStep === 5) {
      // Traverse entire completed list
      soundManager.playLevelVictory();
      setTask('completed');
      onScoreUpdate(50);
      onLevelComplete(5, 100);
    }
  };

  // Guided solve explanation
  const getGuidedSolveExplanation = () => {
    switch (task) {
      case 'task1_search':
        return 'Searching: Start at HEAD address 1000 and follow NEXT pointer addresses until reaching address 1004 where target 30 is located.';
      case 'task2_search_missing':
        return 'Search Absent Value: Follow addresses 1000 → 1002 → 1004 → 1006 → 1000. When CURRENT address returns to HEAD address (1000), conclude search (target absent).';
      case 'task3_repair':
        return 'Repair Broken Pointer: In a Circular Linked List, the tail must point back to HEAD. Update address 1004: set 1004.NEXT = 1000.';
      case 'task4_master_challenge':
        return `Master Sequence Step ${masterStep}: Execute the live address and pointer manipulation to verify the circular invariant.`;
      default:
        return 'Circular Linked List game completed!';
    }
  };

  const handleGuidedNextStep = () => {
    if (task === 'task1_search') {
      if (!t1Found) {
        soundManager.playCalcSuccess();
        setT1CurrentIdx(2);
        setT1Found(true);
      } else {
        setTask('task2_search_missing');
      }
    } else if (task === 'task2_search_missing') {
      if (!t2Done) {
        setT2CycleCompleted(true);
        handleT2Conclude();
      } else {
        setTask('task3_repair');
      }
    } else if (task === 'task3_repair') {
      if (!bossRepaired) {
        handleRepairAction();
      } else {
        setTask('task4_master_challenge');
      }
    } else if (task === 'task4_master_challenge') {
      handleMasterAction();
    } else if (task === 'completed') {
      onLevelComplete(5, 100);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6 animate-page-enter font-sans">
      <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-blue-500/20 rounded-2xl p-5 sm:p-6 shadow-xs">
        {/* Mission Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-blue-500/15">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-[#EFF6FF] dark:bg-blue-950/60 border border-[#DBEAFE] dark:border-blue-500/30 text-[#2563EB] dark:text-[#3B82F6] rounded-lg text-xs font-bold font-mono">
              LEVEL 5: ADDRESS MASTERY
            </span>
            <span className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100">
              {task === 'task1_search' && 'Search for Target Value 30 (Located at Address 1004)'}
              {task === 'task2_search_missing' && 'Search for Absent Value 50 (Loop Detection)'}
              {task === 'task3_repair' && 'Repair Broken Tail Pointer (1004.NEXT → HEAD 1000)'}
              {task === 'task4_master_challenge' && 'Master Synthesis: 5-Step Live CLL Operations with Addresses'}
              {task === 'completed' && 'Circular Linked List Mastered!'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {!isGuidedSolveActive && task !== 'completed' && (
              <button
                id="btn-lvl5-start-guided-solve"
                type="button"
                onClick={() => {
                  soundManager.playClick();
                  setIsGuidedSolveActive(true);
                }}
                className="btn-modern-secondary px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs select-none"
                title="Start Guided Solve step-by-step assistant"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#2563EB] dark:text-[#3B82F6]" />
                <span>Guided Solve</span>
              </button>
            )}
          </div>
        </div>

        {/* Guided Solve Step-by-Step Panel */}
        {isGuidedSolveActive && (
          <div className="pt-4">
            <GuidedSolvePanel
              stepNumber={
                task === 'task1_search'
                  ? 1
                  : task === 'task2_search_missing'
                  ? 2
                  : task === 'task3_repair'
                  ? 3
                  : 3 + masterStep
              }
              totalSteps={8}
              explanation={getGuidedSolveExplanation()}
              isComplete={task === 'completed'}
              nextButtonLabel={
                task === 'completed'
                  ? 'Complete Game'
                  : 'Execute Next Action'
              }
              onNextStep={handleGuidedNextStep}
              onStop={() => setIsGuidedSolveActive(false)}
            />
          </div>
        )}

        {/* TASK 1: Search Existing Target */}
        {task === 'task1_search' && (
          <div className="py-4 space-y-4 animate-scale-enter">
            {/* Memory Pointer Registers Bar */}
            <CLLMemoryBar
              headAddress={t1Head}
              tailAddress={t1Tail}
              tailNextAddress={t1Nodes.find((n) => n.address === t1Tail)?.nextAddress ?? 1000}
              validAddresses={[1000, 1002, 1004, 1006]}
              onSetHeadAddress={(addr) => {
                setT1Head(addr);
                setT1Nodes((prev) => prev.map((n) => ({ ...n, isHead: n.address === addr })));
              }}
              onSetTailAddress={(addr) => {
                setT1Tail(addr);
                setT1Nodes((prev) => prev.map((n) => ({ ...n, isTail: n.address === addr })));
              }}
            />

            <div className="bg-slate-50/60 dark:bg-[#0B1120]/60 rounded-2xl border border-slate-200/80 dark:border-blue-500/20 p-2 sm:p-4">
              <CLLCanvas
                nodes={t1Nodes}
                headId={`t1-${t1Head}`}
                tailId={`t1-${t1Tail}`}
                currentId={t1Nodes[t1CurrentIdx].id}
              />
            </div>

            <div className="p-4 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-500/30 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 uppercase">
                  Target Value: 30 • Target Address: 1004
                </p>
                <p className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
                  {t1Found
                    ? '✓ TARGET MATCHED: Followed NEXT addresses until reaching Address 1004 (Value 30)!'
                    : `Inspecting Node at Address [${t1Nodes[t1CurrentIdx].address}]: DATA = ${t1Nodes[t1CurrentIdx].value}, NEXT = ${t1Nodes[t1CurrentIdx].nextAddress}.`}
                </p>
              </div>

              {t1Found ? (
                <button
                  onClick={() => {
                    soundManager.playSelect();
                    setTask('task2_search_missing');
                  }}
                  className="btn-modern-primary px-4 py-2 text-xs font-bold flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <span>Next Task</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  onClick={handleT1Step}
                  className="btn-modern-primary px-4 py-2 text-xs font-bold flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Inspect Next Node (Address {t1Nodes[t1CurrentIdx].nextAddress})</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* TASK 2: Search Missing Value */}
        {task === 'task2_search_missing' && (
          <div className="py-4 space-y-4 animate-scale-enter">
            {/* Memory Pointer Registers Bar */}
            <CLLMemoryBar
              headAddress={t2Head}
              tailAddress={t2Tail}
              tailNextAddress={t2Nodes.find((n) => n.address === t2Tail)?.nextAddress ?? 1000}
              validAddresses={[1000, 1002, 1004, 1006]}
              onSetHeadAddress={(addr) => {
                setT2Head(addr);
                setT2Nodes((prev) => prev.map((n) => ({ ...n, isHead: n.address === addr })));
              }}
              onSetTailAddress={(addr) => {
                setT2Tail(addr);
                setT2Nodes((prev) => prev.map((n) => ({ ...n, isTail: n.address === addr })));
              }}
            />

            <div className="bg-slate-50/60 dark:bg-[#0B1120]/60 rounded-2xl border border-slate-200/80 dark:border-blue-500/20 p-2 sm:p-4">
              <CLLCanvas
                nodes={t2Nodes}
                headId={`t2-${t2Head}`}
                tailId={`t2-${t2Tail}`}
                currentId={t2Nodes[t2CurrentIdx].id}
              />
            </div>

            <div className="p-5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-500/30 space-y-3">
              <p className="text-xs font-mono font-bold text-amber-800 dark:text-amber-300 uppercase">
                Target: 50 (Not Present in List)
              </p>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {t2Done
                  ? '✓ Full cycle completed: Reached HEAD address (1000) a second time without finding value 50 (Target Absent).'
                  : t2CycleCompleted
                  ? 'Returned to HEAD (Address 1000)! Loop detected: every active node address has been inspected.'
                  : `Traversing: Currently inspecting Node at Address [${t2Nodes[t2CurrentIdx].address}], DATA = ${t2Nodes[t2CurrentIdx].value}, NEXT = ${t2Nodes[t2CurrentIdx].nextAddress}.`}
              </p>

              {!t2CycleCompleted ? (
                <button
                  onClick={handleT2Step}
                  className="btn-modern-primary px-4 py-2 text-xs font-bold flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Inspect Next Address ({t2Nodes[t2CurrentIdx].nextAddress})</span>
                </button>
              ) : !t2Done ? (
                <button
                  onClick={handleT2Conclude}
                  className="btn-modern-primary py-2.5 px-4 text-xs font-bold flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Conclude Search: Target Absent (Cycle returned to HEAD 1000)</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    soundManager.playSelect();
                    setTask('task3_repair');
                  }}
                  className="btn-modern-primary px-4 py-2 text-xs font-bold flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <span>Next: Repair Broken Circle</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* TASK 3: Repair the Broken Circle */}
        {task === 'task3_repair' && (
          <div className="py-4 space-y-4 animate-scale-enter">
            <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-sm">
              <Wrench className="w-5 h-5" />
              <span>Repair Corrupted Pointer Address (1004.NEXT → NULL)</span>
            </div>

            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300">
              The tail node [30] at address 1004 has NEXT set to <strong>NULL</strong> instead of HEAD (1000)! Enter address 1000 into its NEXT field or click Repair.
            </p>

            {/* Memory Pointer Registers Bar */}
            <CLLMemoryBar
              headAddress={bossHead}
              tailAddress={bossTail}
              tailNextAddress={bossRepaired ? 1000 : null}
              validAddresses={[1000, 1002, 1004]}
              onSetHeadAddress={(addr) => {
                setBossHead(addr);
                setBossNodes((prev) => prev.map((n) => ({ ...n, isHead: n.address === addr })));
              }}
              onSetTailAddress={(addr) => {
                setBossTail(addr);
                setBossNodes((prev) => prev.map((n) => ({ ...n, isTail: n.address === addr })));
              }}
            />

            <div className="bg-slate-50/60 dark:bg-[#0B1120]/60 rounded-2xl border border-slate-200/80 dark:border-blue-500/20 p-2 sm:p-4">
              <CLLCanvas
                nodes={bossNodes}
                headId={`b-${bossHead}`}
                tailId={`b-${bossTail}`}
                showNullForTail={!bossRepaired}
                onApplyNextAddress={handleApplyNextAddress}
              />
            </div>

            {!bossRepaired ? (
              <button
                onClick={handleRepairAction}
                className="btn-modern-primary py-3 px-5 text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <Wrench className="w-4 h-4" />
                <span>Repair Pointer: Set 1004.NEXT = 1000 (HEAD)</span>
              </button>
            ) : (
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-500/40 flex items-center justify-between">
                <span className="text-xs sm:text-sm font-bold text-emerald-800 dark:text-emerald-300">
                  ✓ Connection Repaired: 1004.NEXT === 1000 (TAIL.NEXT === HEAD)
                </span>
                <button
                  onClick={() => {
                    soundManager.playSelect();
                    setTask('task4_master_challenge');
                  }}
                  className="btn-modern-primary px-4 py-2 text-xs font-bold flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <span>Begin Master Sequence</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* TASK 4: Master Challenge (Live 5-step sequence) */}
        {task === 'task4_master_challenge' && (
          <div className="py-4 space-y-4 animate-scale-enter">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-blue-500/20">
              <span className="text-xs font-bold font-mono text-blue-600 dark:text-blue-400 uppercase">
                Master Practical Synthesis • Step {masterStep} of 5
              </span>
              <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                TAIL.NEXT === HEAD
              </span>
            </div>

            {/* Memory Pointer Registers Bar */}
            <CLLMemoryBar
              headAddress={masterHead}
              tailAddress={masterTail}
              tailNextAddress={masterNodes.find((n) => n.address === masterTail)?.nextAddress as number}
              validAddresses={masterNodes.map((n) => n.address)}
              onSetHeadAddress={(addr) => {
                setMasterHead(addr);
                setMasterNodes((prev) => prev.map((n) => ({ ...n, isHead: n.address === addr })));
              }}
              onSetTailAddress={(addr) => {
                setMasterTail(addr);
                setMasterNodes((prev) => prev.map((n) => ({ ...n, isTail: n.address === addr })));
              }}
            />

            <div className="bg-slate-50/60 dark:bg-[#0B1120]/60 rounded-2xl border border-slate-200/80 dark:border-blue-500/20 p-2 sm:p-4">
              <CLLCanvas
                nodes={masterNodes}
                headId={`mc-${masterHead}`}
                tailId={`mc-${masterTail}`}
                currentId={masterCurrentId}
                onApplyNextAddress={handleApplyNextAddress}
              />
            </div>

            <div className="p-4 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-500/30 flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs font-mono font-bold uppercase text-blue-600 dark:text-blue-400">
                  {masterStep === 1 && 'Step 1: Insert [5] at Address 1006 at Beginning'}
                  {masterStep === 2 && 'Step 2: Insert [25] at Address 1008 between 1002 and 1004'}
                  {masterStep === 3 && 'Step 3: Delete Node [10] at Address 1000'}
                  {masterStep === 4 && 'Step 4: Search for Target Value 25 (Address 1008)'}
                  {masterStep === 5 && 'Step 5: Traverse the entire completed list'}
                </p>
                <p className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
                  {masterStep === 1 && 'Update tail 1004.NEXT = 1006, 1006.NEXT = 1000, and set HEAD register to 1006.'}
                  {masterStep === 2 && 'Update 1002.NEXT = 1008 and 1008.NEXT = 1004.'}
                  {masterStep === 3 && 'Bypass 1000: Set 1006.NEXT = 1002.'}
                  {masterStep === 4 && 'Traverse from HEAD until Address 1008 (Value 25) is matched.'}
                  {masterStep === 5 && 'Verify complete circular memory layout: 1006 → 1002 → 1008 → 1004 → 1006.'}
                </p>
              </div>

              <button
                onClick={handleMasterAction}
                className="btn-modern-primary px-5 py-2.5 text-xs font-bold shrink-0 flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <span>Execute Step {masterStep}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Mistake feedback banner */}
        {mistakeText && (
          <div className="mt-3 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-500/30 text-xs text-rose-700 dark:text-rose-300 font-medium flex items-center gap-2 animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{mistakeText}</span>
          </div>
        )}

        {/* Level Complete Final Card */}
        {task === 'completed' && (
          <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-500/40 text-center space-y-3 animate-page-enter">
            <Award className="w-12 h-12 text-emerald-600 dark:text-emerald-400 mx-auto" />
            <h3 className="text-2xl font-black text-emerald-900 dark:text-emerald-100">
              Circular Linked List Mastered!
            </h3>
            <p className="text-xs sm:text-sm text-emerald-800 dark:text-emerald-300 max-w-lg mx-auto leading-relaxed">
              Congratulations! You completed all five interactive challenges with memory addresses. You mastered pointer dereferencing, cyclic traversal, address splicing, pointer bypassing, and circular repair.
            </p>
            <button
              onClick={() => onLevelComplete(5, 100)}
              className="btn-modern-primary px-8 py-3 text-xs sm:text-sm font-bold shadow-md cursor-pointer"
            >
              View Quest Completion
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
