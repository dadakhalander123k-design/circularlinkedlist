import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, AlertCircle, Lightbulb, Sparkles, PlusCircle } from 'lucide-react';
import { soundManager } from '../utils/audio';
import { GuidedSolvePanel } from './GuidedSolvePanel';
import { CLLCanvas, VisualNodeData } from './cll/CLLCanvas';

interface Level3GameplayProps {
  onLevelComplete: (levelId: number, score: number) => void;
  onScoreUpdate: (delta: number) => void;
  onStreakUpdate: (streak: number) => void;
}

export const Level3Gameplay: React.FC<Level3GameplayProps> = ({
  onLevelComplete,
  onScoreUpdate,
  onStreakUpdate,
}) => {
  // 3 progressive parts: 'partA_beginning' -> 'partB_end' -> 'partC_position' -> 'completed'
  const [stage, setStage] = useState<'partA_beginning' | 'partB_end' | 'partC_position' | 'completed'>('partA_beginning');

  // Sub-step within each stage (e.g. 1: point new node, 2: point tail/prev, 3: update head)
  const [subStep, setSubStep] = useState<number>(1);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string>('Step 1: Point new Node [5] toward current HEAD (Node [10]).');
  const [mistakeText, setMistakeText] = useState<string | null>(null);

  // Guided Solve state
  const [isGuidedSolveActive, setIsGuidedSolveActive] = useState<boolean>(false);

  // -------------------------------------------------------------
  // PART A: Insert 5 at Beginning of [10, 20, 30]
  // -------------------------------------------------------------
  const [partANodes, setPartANodes] = useState<VisualNodeData[]>([
    { id: 'a-new-5', value: 5, nextId: null, isNew: true, customBadge: 'NEW TO INSERT' },
    { id: 'a-10', value: 10, nextId: 'a-20', isHead: true },
    { id: 'a-20', value: 20, nextId: 'a-30' },
    { id: 'a-30', value: 30, nextId: 'a-10', customBadge: 'TAIL' },
  ]);
  const [partAHeadId, setPartAHeadId] = useState<string>('a-10');

  // -------------------------------------------------------------
  // PART B: Insert 40 at End of [10, 20, 30]
  // -------------------------------------------------------------
  const [partBNodes, setPartBNodes] = useState<VisualNodeData[]>([
    { id: 'b-10', value: 10, nextId: 'b-20', isHead: true },
    { id: 'b-20', value: 20, nextId: 'b-30' },
    { id: 'b-30', value: 30, nextId: 'b-10', customBadge: 'OLD TAIL' },
    { id: 'b-new-40', value: 40, nextId: null, isNew: true, customBadge: 'NEW TAIL' },
  ]);

  // -------------------------------------------------------------
  // PART C: Insert 25 between 20 and 30 in [10, 20, 30, 40]
  // -------------------------------------------------------------
  const [partCNodes, setPartCNodes] = useState<VisualNodeData[]>([
    { id: 'c-10', value: 10, nextId: 'c-20', isHead: true },
    { id: 'c-20', value: 20, nextId: 'c-30', customBadge: 'PREV' },
    { id: 'c-new-25', value: 25, nextId: null, isNew: true, customBadge: 'INSERT HERE' },
    { id: 'c-30', value: 30, nextId: 'c-40', customBadge: 'NEXT' },
    { id: 'c-40', value: 40, nextId: 'c-10', customBadge: 'TAIL' },
  ]);

  // Handle Part A pointer updates
  const handlePartAStep = (action: 'point_new_to_head' | 'point_tail_to_new' | 'update_head') => {
    setMistakeText(null);
    if (subStep === 1 && action === 'point_new_to_head') {
      soundManager.playCalcSuccess();
      setPartANodes((prev) =>
        prev.map((n) => (n.id === 'a-new-5' ? { ...n, nextId: 'a-10', isNew: false } : n))
      );
      setSubStep(2);
      setFeedback('Great! [5].next points to [10]. Now update the tail: Node [30] must point to new Node [5].');
      onScoreUpdate(15);
      onStreakUpdate(1);
    } else if (subStep === 2 && action === 'point_tail_to_new') {
      soundManager.playCalcSuccess();
      setPartANodes((prev) =>
        prev.map((n) => (n.id === 'a-30' ? { ...n, nextId: 'a-new-5' } : n))
      );
      setSubStep(3);
      setFeedback('Now make Node [5] the new HEAD!');
      onScoreUpdate(15);
      onStreakUpdate(2);
    } else if (subStep === 3 && action === 'update_head') {
      soundManager.playCalcSuccess();
      setPartAHeadId('a-new-5');
      setPartANodes((prev) =>
        prev.map((n) =>
          n.id === 'a-new-5' ? { ...n, isHead: true } : n.id === 'a-10' ? { ...n, isHead: false } : n
        )
      );
      setSubStep(4);
      setFeedback('✓ Part A Complete! HEAD → 5 → 10 → 20 → 30 → HEAD. The circular invariant holds!');
      onScoreUpdate(20);
      onStreakUpdate(3);
    } else {
      soundManager.playError();
      onScoreUpdate(-2);
      setMistakeText('Follow the exact pointer order: connect new node first so data is never disconnected!');
    }
  };

  // Handle Part B pointer updates (Insert at End)
  const handlePartBStep = (action: 'point_tail_to_new' | 'point_new_to_head') => {
    setMistakeText(null);
    if (subStep === 1 && action === 'point_tail_to_new') {
      soundManager.playCalcSuccess();
      setPartBNodes((prev) =>
        prev.map((n) => (n.id === 'b-30' ? { ...n, nextId: 'b-new-40', customBadge: undefined } : n))
      );
      setSubStep(2);
      setFeedback('Old tail [30] now points to [40]. Now complete the circle: Point [40] to HEAD [10]!');
      onScoreUpdate(15);
      onStreakUpdate(4);
    } else if (subStep === 2 && action === 'point_new_to_head') {
      soundManager.playCalcSuccess();
      setPartBNodes((prev) =>
        prev.map((n) =>
          n.id === 'b-new-40' ? { ...n, nextId: 'b-10', isNew: false, customBadge: 'NEW TAIL' } : n
        )
      );
      setSubStep(3);
      setFeedback('✓ Part B Complete! HEAD → 10 → 20 → 30 → 40 → HEAD. Node [40] is now the tail pointing to HEAD.');
      onScoreUpdate(20);
      onStreakUpdate(5);
    } else {
      soundManager.playError();
      onScoreUpdate(-2);
      setMistakeText('The new last node must receive the connection from old tail, and its NEXT must point to HEAD.');
    }
  };

  // Handle Part C pointer updates (Insert at Position between 20 and 30)
  const handlePartCStep = (action: 'point_new_to_next' | 'point_prev_to_new') => {
    setMistakeText(null);
    if (subStep === 1 && action === 'point_new_to_next') {
      soundManager.playCalcSuccess();
      setPartCNodes((prev) =>
        prev.map((n) => (n.id === 'c-new-25' ? { ...n, nextId: 'c-30', isNew: false } : n))
      );
      setSubStep(2);
      setFeedback('Perfect! [25].next points to [30]. Now update previous node [20] to point to [25].');
      onScoreUpdate(15);
      onStreakUpdate(6);
    } else if (subStep === 2 && action === 'point_prev_to_new') {
      soundManager.playCalcSuccess();
      setPartCNodes((prev) =>
        prev.map((n) => (n.id === 'c-20' ? { ...n, nextId: 'c-new-25' } : n))
      );
      setSubStep(3);
      setFeedback('✓ Part C Complete! 20 → 25 → 30. The list seamlessly accommodates the new node!');
      onScoreUpdate(25);
      onStreakUpdate(7);
      setTimeout(() => {
        setStage('completed');
        soundManager.playLevelVictory();
        onLevelComplete(3, 100);
      }, 1500);
    } else {
      soundManager.playError();
      onScoreUpdate(-2);
      setMistakeText(
        'Check the direction of the NEXT pointer! The new node must point to the node that originally came after 20 (Node [30]).'
      );
    }
  };

  // Guided solve explanation
  const getGuidedSolveExplanation = () => {
    if (stage === 'partA_beginning') {
      if (subStep === 1) return 'Step 1: Point new node [5] → current HEAD [10]. Connect the new node first to prevent dangling references.';
      if (subStep === 2) return 'Step 2: Update tail node [30] → [5]. In a Circular Linked List, the tail must always point to the new beginning.';
      if (subStep === 3) return 'Step 3: Move HEAD to [5]. HEAD now references our new starting node.';
      return 'Part A Complete! Click "Next Challenge" to insert at the end.';
    }
    if (stage === 'partB_end') {
      if (subStep === 1) return 'Step 1: Traverse to tail node [30] and update its pointer: [30] → [40].';
      if (subStep === 2) return 'Step 2: Point new tail [40] → HEAD [10] to close the circular loop.';
      return 'Part B Complete! Click "Next Challenge" to insert at a specific position.';
    }
    if (stage === 'partC_position') {
      if (subStep === 1) return 'Step 1: Point new node [25] → next node [30]. Wire the new node forward first.';
      if (subStep === 2) return 'Step 2: Point previous node [20] → new node [25]. The chain is repaired!';
      return 'Insertion mastery achieved across beginning, end, and position!';
    }
    return 'Level 3 complete!';
  };

  const handleGuidedNextStep = () => {
    if (stage === 'partA_beginning') {
      if (subStep === 1) handlePartAStep('point_new_to_head');
      else if (subStep === 2) handlePartAStep('point_tail_to_new');
      else if (subStep === 3) handlePartAStep('update_head');
      else {
        setStage('partB_end');
        setSubStep(1);
        setFeedback('Part B: Insert Node [40] at the END of the Circular Linked List.');
      }
    } else if (stage === 'partB_end') {
      if (subStep === 1) handlePartBStep('point_tail_to_new');
      else if (subStep === 2) handlePartBStep('point_new_to_head');
      else {
        setStage('partC_position');
        setSubStep(1);
        setFeedback('Part C: Insert Node [25] between Node [20] and Node [30].');
      }
    } else if (stage === 'partC_position') {
      if (subStep === 1) handlePartCStep('point_new_to_next');
      else if (subStep === 2) handlePartCStep('point_prev_to_new');
      else {
        onLevelComplete(3, 100);
      }
    } else if (stage === 'completed') {
      onLevelComplete(3, 100);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6 animate-page-enter font-sans">
      <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-blue-500/20 rounded-2xl p-5 sm:p-6 shadow-xs">
        {/* Mission Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-blue-500/15">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-[#EFF6FF] dark:bg-blue-950/60 border border-[#DBEAFE] dark:border-blue-500/30 text-[#2563EB] dark:text-[#3B82F6] rounded-lg text-xs font-bold font-mono">
              {stage === 'partA_beginning' ? 'PART A: BEGINNING' : stage === 'partB_end' ? 'PART B: END' : 'PART C: POSITION'}
            </span>
            <span className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100">
              {stage === 'partA_beginning'
                ? 'Insert Node [5] at Beginning'
                : stage === 'partB_end'
                ? 'Insert Node [40] at End'
                : 'Insert Node [25] Between [20] and [30]'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {!isGuidedSolveActive && stage !== 'completed' && (
              <button
                id="btn-lvl3-start-guided-solve"
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
                stage === 'partA_beginning'
                  ? subStep
                  : stage === 'partB_end'
                  ? 3 + subStep
                  : 5 + subStep
              }
              totalSteps={7}
              explanation={getGuidedSolveExplanation()}
              isComplete={stage === 'completed'}
              nextButtonLabel={
                stage === 'completed'
                  ? 'Complete Level 3'
                  : subStep === 4 && stage === 'partA_beginning'
                  ? 'Proceed to Part B'
                  : subStep === 3 && stage === 'partB_end'
                  ? 'Proceed to Part C'
                  : 'Execute Pointer Repair'
              }
              onNextStep={handleGuidedNextStep}
              onStop={() => setIsGuidedSolveActive(false)}
            />
          </div>
        )}

        {/* Canvas Display */}
        <div className="pt-6 pb-2">
          <div className="text-xs font-bold uppercase font-mono tracking-wider text-slate-500 dark:text-slate-400 mb-2 flex items-center justify-between">
            <span>Pointer Alignment</span>
            <span className="text-blue-600 dark:text-blue-400 font-mono font-bold">
              Operation: Pointer Repair Mechanic
            </span>
          </div>

          <div className="bg-slate-50/60 dark:bg-[#0B1120]/60 rounded-2xl border border-slate-200/80 dark:border-blue-500/20 p-2 sm:p-4 my-3">
            {stage === 'partA_beginning' && (
              <CLLCanvas nodes={partANodes} headId={partAHeadId} />
            )}
            {stage === 'partB_end' && (
              <CLLCanvas nodes={partBNodes} headId="b-10" />
            )}
            {stage === 'partC_position' && (
              <CLLCanvas nodes={partCNodes} headId="c-10" />
            )}
          </div>
        </div>

        {/* Action Controls for Part A */}
        {stage === 'partA_beginning' && (
          <div className="p-5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-500/30 space-y-4 animate-scale-enter">
            <p className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
              {feedback}
            </p>

            <div className="flex flex-wrap gap-2.5">
              {subStep === 1 && (
                <button
                  onClick={() => handlePartAStep('point_new_to_head')}
                  className="btn-modern-primary px-4 py-2 text-xs font-bold flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <span>Connect [5].next → [10] (HEAD)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
              {subStep === 2 && (
                <button
                  onClick={() => handlePartAStep('point_tail_to_new')}
                  className="btn-modern-primary px-4 py-2 text-xs font-bold flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <span>Update Tail: Connect [30].next → [5]</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
              {subStep === 3 && (
                <button
                  onClick={() => handlePartAStep('update_head')}
                  className="btn-modern-primary px-4 py-2 text-xs font-bold flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <span>Set HEAD → Node [5]</span>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </button>
              )}
              {subStep === 4 && (
                <button
                  onClick={() => {
                    soundManager.playSelect();
                    setStage('partB_end');
                    setSubStep(1);
                    setFeedback('Part B: Insert Node [40] at the END of the Circular Linked List.');
                  }}
                  className="btn-modern-primary px-5 py-2.5 text-xs font-bold flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <span>Next: Part B (Insert at End)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Action Controls for Part B */}
        {stage === 'partB_end' && (
          <div className="p-5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-500/30 space-y-4 animate-scale-enter">
            <p className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
              {feedback}
            </p>

            <div className="flex flex-wrap gap-2.5">
              {subStep === 1 && (
                <button
                  onClick={() => handlePartBStep('point_tail_to_new')}
                  className="btn-modern-primary px-4 py-2 text-xs font-bold flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <span>Connect Old Tail [30].next → [40]</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
              {subStep === 2 && (
                <button
                  onClick={() => handlePartBStep('point_new_to_head')}
                  className="btn-modern-primary px-4 py-2 text-xs font-bold flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <span>Connect New Tail [40].next → HEAD [10]</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
              {subStep === 3 && (
                <button
                  onClick={() => {
                    soundManager.playSelect();
                    setStage('partC_position');
                    setSubStep(1);
                    setFeedback('Part C: Insert Node [25] between Node [20] and Node [30].');
                  }}
                  className="btn-modern-primary px-5 py-2.5 text-xs font-bold flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <span>Next: Part C (Insert at Position)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Action Controls for Part C */}
        {stage === 'partC_position' && (
          <div className="p-5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-500/30 space-y-4 animate-scale-enter">
            <p className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
              {feedback}
            </p>

            <div className="flex flex-wrap gap-2.5">
              {subStep === 1 && (
                <button
                  onClick={() => handlePartCStep('point_new_to_next')}
                  className="btn-modern-primary px-4 py-2 text-xs font-bold flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <span>Connect [25].next → [30]</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
              {subStep === 2 && (
                <button
                  onClick={() => handlePartCStep('point_prev_to_new')}
                  className="btn-modern-primary px-4 py-2 text-xs font-bold flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <span>Connect Previous [20].next → [25]</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
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
        {stage === 'completed' && (
          <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-500/40 text-center space-y-3 animate-page-enter">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400 mx-auto" />
            <h3 className="text-xl font-bold text-emerald-900 dark:text-emerald-100">
              Level Complete!
            </h3>
            <p className="text-xs sm:text-sm text-emerald-800 dark:text-emerald-300 max-w-md mx-auto">
              Excellent work. You successfully inserted nodes at the beginning, end, and middle while preserving the circular link.
            </p>
            <button
              onClick={() => onLevelComplete(3, 100)}
              className="btn-modern-primary px-6 py-2.5 text-xs sm:text-sm font-bold shadow-md cursor-pointer"
            >
              Next Level
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
