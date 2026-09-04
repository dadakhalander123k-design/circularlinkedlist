import React, { useState } from 'react';
import {
  ArrowRight,
  Sparkles,
  Award,
  CheckCircle2,
  Search,
  Wrench,
  RotateCcw,
} from 'lucide-react';
import { soundManager } from '../utils/audio';
import { GuidedSolvePanel } from './GuidedSolvePanel';
import { CLLCanvas, VisualNodeData } from './cll/CLLCanvas';

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

  // -------------------------------------------------------------
  // TASK 1: Search Existing Target (Target: 30)
  // -------------------------------------------------------------
  const t1Nodes: VisualNodeData[] = [
    { id: 't1-10', value: 10, nextId: 't1-20', isHead: true },
    { id: 't1-20', value: 20, nextId: 't1-30' },
    { id: 't1-30', value: 30, nextId: 't1-40' },
    { id: 't1-40', value: 40, nextId: 't1-10' },
  ];
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
  const t2Nodes: VisualNodeData[] = [
    { id: 't2-10', value: 10, nextId: 't2-20', isHead: true },
    { id: 't2-20', value: 20, nextId: 't2-30' },
    { id: 't2-30', value: 30, nextId: 't2-40' },
    { id: 't2-40', value: 40, nextId: 't2-10' },
  ];
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
  // TASK 3: Repair the Broken Circle (30 points to NULL)
  // -------------------------------------------------------------
  const [bossRepaired, setBossRepaired] = useState<boolean>(false);

  const handleRepairAction = () => {
    soundManager.playCalcSuccess();
    setBossRepaired(true);
    onScoreUpdate(30);
    onStreakUpdate(3);
  };

  // -------------------------------------------------------------
  // TASK 4: Master Challenge (Live 5-step sequence)
  // -------------------------------------------------------------
  const [masterStep, setMasterStep] = useState<number>(1);
  const [masterNodes, setMasterNodes] = useState<VisualNodeData[]>([
    { id: 'mc-10', value: 10, nextId: 'mc-20', isHead: true },
    { id: 'mc-20', value: 20, nextId: 'mc-30' },
    { id: 'mc-30', value: 30, nextId: 'mc-10' },
  ]);
  const [masterHeadId, setMasterHeadId] = useState<string>('mc-10');
  const [masterCurrentId, setMasterCurrentId] = useState<string | null>(null);

  const handleMasterAction = () => {
    if (masterStep === 1) {
      // Insert 5 at beginning
      soundManager.playCalcSuccess();
      setMasterNodes([
        { id: 'mc-5', value: 5, nextId: 'mc-10', isHead: true },
        { id: 'mc-10', value: 10, nextId: 'mc-20' },
        { id: 'mc-20', value: 20, nextId: 'mc-30' },
        { id: 'mc-30', value: 30, nextId: 'mc-5' },
      ]);
      setMasterHeadId('mc-5');
      setMasterStep(2);
      onScoreUpdate(20);
      onStreakUpdate(4);
    } else if (masterStep === 2) {
      // Insert 25 between 20 and 30
      soundManager.playCalcSuccess();
      setMasterNodes([
        { id: 'mc-5', value: 5, nextId: 'mc-10', isHead: true },
        { id: 'mc-10', value: 10, nextId: 'mc-20' },
        { id: 'mc-20', value: 20, nextId: 'mc-25' },
        { id: 'mc-25', value: 25, nextId: 'mc-30' },
        { id: 'mc-30', value: 30, nextId: 'mc-5' },
      ]);
      setMasterStep(3);
      onScoreUpdate(20);
      onStreakUpdate(5);
    } else if (masterStep === 3) {
      // Delete 10
      soundManager.playCalcSuccess();
      setMasterNodes([
        { id: 'mc-5', value: 5, nextId: 'mc-20', isHead: true },
        { id: 'mc-20', value: 20, nextId: 'mc-25' },
        { id: 'mc-25', value: 25, nextId: 'mc-30' },
        { id: 'mc-30', value: 30, nextId: 'mc-5' },
      ]);
      setMasterStep(4);
      onScoreUpdate(20);
      onStreakUpdate(6);
    } else if (masterStep === 4) {
      // Search for 25
      soundManager.playCalcSuccess();
      setMasterCurrentId('mc-25');
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
        return 'Searching: Start from HEAD and follow NEXT pointers until target 30 is matched.';
      case 'task2_search_missing':
        return 'Search Absent Value: Follow pointers through the circle. When CURRENT returns to HEAD, conclude search (target absent).';
      case 'task3_repair':
        return 'Repair Broken Pointer: In a Circular Linked List, the tail must never point to NULL. Reconnect [30].next → HEAD [10].';
      case 'task4_master_challenge':
        return `Master Sequence Step ${masterStep}: Execute the live pointer manipulation task to verify the circular invariant.`;
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
              GAMEPLAY
            </span>
            <span className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100">
              {task === 'task1_search' && 'Search for Target Value 30'}
              {task === 'task2_search_missing' && 'Search for Absent Value 50'}
              {task === 'task3_repair' && 'Repair Broken Circular Link'}
              {task === 'task4_master_challenge' && 'Master Synthesis: 5-Step Live CLL Operations'}
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
            <div className="bg-slate-50/60 dark:bg-[#0B1120]/60 rounded-2xl border border-slate-200/80 dark:border-blue-500/20 p-2 sm:p-4">
              <CLLCanvas
                nodes={t1Nodes}
                headId="t1-10"
                currentId={t1Nodes[t1CurrentIdx].id}
              />
            </div>

            <div className="p-4 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-500/30 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 uppercase">
                  Target: 30
                </p>
                <p className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
                  {t1Found
                    ? '✓ TARGET FOUND: Started at HEAD and followed pointers until 30 was reached.'
                    : `Currently inspecting Node [${t1Nodes[t1CurrentIdx].value}].`}
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
                  <span>Inspect Next Node</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* TASK 2: Search Missing Value */}
        {task === 'task2_search_missing' && (
          <div className="py-4 space-y-4 animate-scale-enter">
            <div className="bg-slate-50/60 dark:bg-[#0B1120]/60 rounded-2xl border border-slate-200/80 dark:border-blue-500/20 p-2 sm:p-4">
              <CLLCanvas
                nodes={t2Nodes}
                headId="t2-10"
                currentId={t2Nodes[t2CurrentIdx].id}
              />
            </div>

            <div className="p-5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-500/30 space-y-3">
              <p className="text-xs font-mono font-bold text-amber-800 dark:text-amber-300 uppercase">
                Target: 50 (Not Present in List)
              </p>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {t2Done
                  ? '✓ Full cycle completed: Reached HEAD without finding target 50 (Target Absent).'
                  : t2CycleCompleted
                  ? 'Returned to HEAD! Every node has been inspected.'
                  : `Traversing: Currently inspecting Node [${t2Nodes[t2CurrentIdx].value}].`}
              </p>

              {!t2CycleCompleted ? (
                <button
                  onClick={handleT2Step}
                  className="btn-modern-primary px-4 py-2 text-xs font-bold flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Inspect Next Node</span>
                </button>
              ) : !t2Done ? (
                <button
                  onClick={handleT2Conclude}
                  className="btn-modern-primary py-2.5 px-4 text-xs font-bold flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Conclude Search: Target Absent (Full Loop Finished)</span>
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
          <div className="py-4 space-y-5 animate-scale-enter">
            <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-sm">
              <Wrench className="w-5 h-5" />
              <span>Repair Corrupted Pointer (30 → NULL)</span>
            </div>

            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300">
              The tail node [30] incorrectly terminates at <strong>NULL</strong>! Repair the pointer so it connects back to HEAD [10].
            </p>

            <div className="bg-slate-50/60 dark:bg-[#0B1120]/60 rounded-2xl border border-slate-200/80 dark:border-blue-500/20 p-2 sm:p-4">
              <CLLCanvas
                nodes={[
                  { id: 'b-10', value: 10, nextId: 'b-20', isHead: true },
                  { id: 'b-20', value: 20, nextId: 'b-30' },
                  {
                    id: 'b-30',
                    value: 30,
                    nextId: bossRepaired ? 'b-10' : null,
                    hasBrokenPointer: !bossRepaired,
                    customBadge: bossRepaired ? 'REPAIRED TAIL' : 'BROKEN TAIL',
                  },
                ]}
                headId="b-10"
                showNullForTail={!bossRepaired}
              />
            </div>

            {!bossRepaired ? (
              <button
                onClick={handleRepairAction}
                className="btn-modern-primary py-3 px-5 text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <Wrench className="w-4 h-4" />
                <span>Repair Pointer: Connect [30].next → HEAD [10]</span>
              </button>
            ) : (
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-500/40 flex items-center justify-between">
                <span className="text-xs sm:text-sm font-bold text-emerald-800 dark:text-emerald-300">
                  ✓ Connection Repaired: tail.next === head
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
          <div className="py-4 space-y-5 animate-scale-enter">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-blue-500/20">
              <span className="text-xs font-bold font-mono text-blue-600 dark:text-blue-400 uppercase">
                Master Practical Synthesis • Step {masterStep} of 5
              </span>
              <span className="text-xs font-mono font-bold text-slate-500">
                Live CLL Invariant: Valid
              </span>
            </div>

            <div className="bg-slate-50/60 dark:bg-[#0B1120]/60 rounded-2xl border border-slate-200/80 dark:border-blue-500/20 p-2 sm:p-4">
              <CLLCanvas
                nodes={masterNodes}
                headId={masterHeadId}
                currentId={masterCurrentId}
              />
            </div>

            <div className="p-4 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-500/30 flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs font-mono font-bold uppercase text-blue-600 dark:text-blue-400">
                  {masterStep === 1 && 'Step 1: Insert [5] at Beginning'}
                  {masterStep === 2 && 'Step 2: Insert [25] between [20] and [30]'}
                  {masterStep === 3 && 'Step 3: Delete Node [10]'}
                  {masterStep === 4 && 'Step 4: Search for Target Value 25'}
                  {masterStep === 5 && 'Step 5: Traverse the entire completed list'}
                </p>
                <p className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
                  {masterStep === 1 && 'Update tail [30] → [5], [5] → [10], and set HEAD to [5].'}
                  {masterStep === 2 && 'Update [20] → [25] and [25] → [30].'}
                  {masterStep === 3 && 'Bypass [10]: Point [5].next → [20].'}
                  {masterStep === 4 && 'Traverse from HEAD until Node [25] is matched.'}
                  {masterStep === 5 && 'Verify the final structure: HEAD → 5 → 20 → 25 → 30 → HEAD.'}
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

        {/* Level Complete Final Card */}
        {task === 'completed' && (
          <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-500/40 text-center space-y-3 animate-page-enter">
            <Award className="w-12 h-12 text-emerald-600 dark:text-emerald-400 mx-auto" />
            <h3 className="text-2xl font-black text-emerald-900 dark:text-emerald-100">
              Circular Linked List Mastered!
            </h3>
            <p className="text-xs sm:text-sm text-emerald-800 dark:text-emerald-300 max-w-lg mx-auto leading-relaxed">
              Congratulations! You completed all five interactive challenges. You successfully constructed, traversed, inserted, deleted, searched, and repaired circular linked lists.
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
