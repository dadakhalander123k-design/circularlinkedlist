import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, Trash2, Lightbulb, Sparkles, AlertCircle } from 'lucide-react';
import { soundManager } from '../utils/audio';
import { GuidedSolvePanel } from './GuidedSolvePanel';
import { CLLCanvas, VisualNodeData } from './cll/CLLCanvas';

interface Level4GameplayProps {
  onLevelComplete: (levelId: number, score: number) => void;
  onScoreUpdate: (delta: number) => void;
  onStreakUpdate: (streak: number) => void;
}

export const Level4Gameplay: React.FC<Level4GameplayProps> = ({
  onLevelComplete,
  onScoreUpdate,
  onStreakUpdate,
}) => {
  // 3 progressive stages: 'partA_beginning' -> 'partB_end' -> 'partC_position' -> 'completed'
  const [stage, setStage] = useState<'partA_beginning' | 'partB_end' | 'partC_position' | 'completed'>('partA_beginning');

  // Sub-step within each stage (1: identify/bypass, 2: fade/update head, 3: completed)
  const [subStep, setSubStep] = useState<number>(1);
  const [feedback, setFeedback] = useState<string>(
    'Part A: Delete beginning node [10]. Tail [30] must point to new HEAD [20], and HEAD must shift to [20].'
  );
  const [mistakeText, setMistakeText] = useState<string | null>(null);

  // Guided Solve state
  const [isGuidedSolveActive, setIsGuidedSolveActive] = useState<boolean>(false);

  // -------------------------------------------------------------
  // PART A: Delete 10 from [10, 20, 30]
  // -------------------------------------------------------------
  const [partANodes, setPartANodes] = useState<VisualNodeData[]>([
    { id: 'da-10', value: 10, nextId: 'da-20', isHead: true, customBadge: 'TARGET TO DELETE' },
    { id: 'da-20', value: 20, nextId: 'da-30', customBadge: 'NEXT HEAD' },
    { id: 'da-30', value: 30, nextId: 'da-10', customBadge: 'TAIL' },
  ]);
  const [partAHeadId, setPartAHeadId] = useState<string>('da-10');

  // -------------------------------------------------------------
  // PART B: Delete 30 from [10, 20, 30]
  // -------------------------------------------------------------
  const [partBNodes, setPartBNodes] = useState<VisualNodeData[]>([
    { id: 'db-10', value: 10, nextId: 'db-20', isHead: true },
    { id: 'db-20', value: 20, nextId: 'db-30', customBadge: 'PREV NODE' },
    { id: 'db-30', value: 30, nextId: 'db-10', customBadge: 'TARGET TAIL' },
  ]);

  // -------------------------------------------------------------
  // PART C: Delete 30 from [10, 20, 30, 40]
  // -------------------------------------------------------------
  const [partCNodes, setPartCNodes] = useState<VisualNodeData[]>([
    { id: 'dc-10', value: 10, nextId: 'dc-20', isHead: true },
    { id: 'dc-20', value: 20, nextId: 'dc-30', isPrev: true, customBadge: 'PREVIOUS' },
    { id: 'dc-30', value: 30, nextId: 'dc-40', isTarget: true, customBadge: 'TARGET TO BYPASS' },
    { id: 'dc-40', value: 40, nextId: 'dc-10', customBadge: 'NEXT NODE' },
  ]);

  // Handle Part A (Delete Beginning)
  const handlePartAStep = (action: 'rewire_tail_and_head') => {
    setMistakeText(null);
    soundManager.playCalcSuccess();
    // 1. Shift HEAD to 20, point 30 to 20, fade out 10
    setPartAHeadId('da-20');
    setPartANodes((prev) =>
      prev.map((n) => {
        if (n.id === 'da-10') return { ...n, isFadingOut: true, isHead: false };
        if (n.id === 'da-20') return { ...n, isHead: true, customBadge: 'NEW HEAD' };
        if (n.id === 'da-30') return { ...n, nextId: 'da-20' };
        return n;
      })
    );
    setSubStep(2);
    setFeedback('✓ Part A Complete! Node [10] is bypassed and detached. Tail [30] loops directly to new HEAD [20].');
    onScoreUpdate(20);
    onStreakUpdate(1);
  };

  // Handle Part B (Delete Ending)
  const handlePartBStep = (action: 'rewire_prev_to_head') => {
    setMistakeText(null);
    soundManager.playCalcSuccess();
    // Point 20 to HEAD (10) and fade out 30
    setPartBNodes((prev) =>
      prev.map((n) => {
        if (n.id === 'db-20') return { ...n, nextId: 'db-10', customBadge: 'NEW TAIL' };
        if (n.id === 'db-30') return { ...n, isFadingOut: true };
        return n;
      })
    );
    setSubStep(2);
    setFeedback('✓ Part B Complete! Node [20] now points back to HEAD [10]. Tail [30] detached safely.');
    onScoreUpdate(20);
    onStreakUpdate(2);
  };

  // Handle Part C (Delete Position / Middle Bypass)
  const handlePartCStep = (action: 'bypass_target') => {
    setMistakeText(null);
    soundManager.playCalcSuccess();
    // Bypass 30: 20.next = 40
    setPartCNodes((prev) =>
      prev.map((n) => {
        if (n.id === 'dc-20') return { ...n, nextId: 'dc-40' };
        if (n.id === 'dc-30') return { ...n, isFadingOut: true };
        return n;
      })
    );
    setSubStep(2);
    setFeedback('✓ Part C Complete! Bypassed Node [30]: 20 → 40. The surrounding nodes are cleanly reconnected.');
    onScoreUpdate(25);
    onStreakUpdate(3);
    setTimeout(() => {
      setStage('completed');
      soundManager.playLevelVictory();
      onLevelComplete(4, 100);
    }, 1500);
  };

  // Guided solve explanation
  const getGuidedSolveExplanation = () => {
    if (stage === 'partA_beginning') {
      if (subStep === 1)
        return 'Delete Beginning: 1. Identify HEAD [10] and the next node [20]. 2. Update tail [30] to point to [20]. 3. Shift HEAD to [20]. Bypassed node [10] is removed.';
      return 'Part A Complete! Click "Next Challenge" to proceed to ending deletion.';
    }
    if (stage === 'partB_end') {
      if (subStep === 1)
        return 'Delete Ending: 1. Find the tail [30] and its previous node [20]. 2. Point [20] directly to HEAD [10]. 3. Remove old tail [30].';
      return 'Part B Complete! Click "Next Challenge" to proceed to middle node deletion.';
    }
    if (stage === 'partC_position') {
      if (subStep === 1)
        return 'Delete Any Position: 1. Find previous node [20]. 2. Identify target [30] and next node [40]. 3. Reconnect prev.next = target.next (20 → 40). Target [30] is cleanly bypassed!';
      return 'Deletion mastery achieved across beginning, ending, and middle!';
    }
    return 'Level 4 complete!';
  };

  const handleGuidedNextStep = () => {
    if (stage === 'partA_beginning') {
      if (subStep === 1) handlePartAStep('rewire_tail_and_head');
      else {
        setStage('partB_end');
        setSubStep(1);
        setFeedback('Part B: Delete ending node [30]. Reconnect previous node [20] to HEAD [10].');
      }
    } else if (stage === 'partB_end') {
      if (subStep === 1) handlePartBStep('rewire_prev_to_head');
      else {
        setStage('partC_position');
        setSubStep(1);
        setFeedback('Part C: Delete middle node [30]. Bypass it by connecting [20] → [40].');
      }
    } else if (stage === 'partC_position') {
      if (subStep === 1) handlePartCStep('bypass_target');
      else {
        onLevelComplete(4, 100);
      }
    } else if (stage === 'completed') {
      onLevelComplete(4, 100);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6 animate-page-enter font-sans">
      <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-blue-500/20 rounded-2xl p-5 sm:p-6 shadow-xs">
        {/* Mission Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-blue-500/15">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-[#EFF6FF] dark:bg-blue-950/60 border border-[#DBEAFE] dark:border-blue-500/30 text-[#2563EB] dark:text-[#3B82F6] rounded-lg text-xs font-bold font-mono">
              {stage === 'partA_beginning' ? 'PART A: DELETE HEAD' : stage === 'partB_end' ? 'PART B: DELETE TAIL' : 'PART C: BYPASS NODE'}
            </span>
            <span className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100">
              {stage === 'partA_beginning'
                ? 'Delete Beginning Node [10]'
                : stage === 'partB_end'
                ? 'Delete Ending Node [30]'
                : 'Bypass & Delete Node [30] (Middle Position)'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {!isGuidedSolveActive && stage !== 'completed' && (
              <button
                id="btn-lvl4-start-guided-solve"
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
                  ? 2 + subStep
                  : 4 + subStep
              }
              totalSteps={6}
              explanation={getGuidedSolveExplanation()}
              isComplete={stage === 'completed'}
              nextButtonLabel={
                stage === 'completed'
                  ? 'Complete Level 4'
                  : subStep === 2 && stage === 'partA_beginning'
                  ? 'Proceed to Part B'
                  : subStep === 2 && stage === 'partB_end'
                  ? 'Proceed to Part C'
                  : 'Bypass & Reconnect'
              }
              onNextStep={handleGuidedNextStep}
              onStop={() => setIsGuidedSolveActive(false)}
            />
          </div>
        )}

        {/* Canvas Display */}
        <div className="pt-6 pb-2">
          <div className="text-xs font-bold uppercase font-mono tracking-wider text-slate-500 dark:text-slate-400 mb-2 flex items-center justify-between">
            <span>Pointer Reconnection & Bypassing</span>
            <span className="text-rose-600 dark:text-rose-400 font-mono font-bold">
              Rule: prev.next = target.next
            </span>
          </div>

          <div className="bg-slate-50/60 dark:bg-[#0B1120]/60 rounded-2xl border border-slate-200/80 dark:border-blue-500/20 p-2 sm:p-4 my-3">
            {stage === 'partA_beginning' && (
              <CLLCanvas nodes={partANodes} headId={partAHeadId} />
            )}
            {stage === 'partB_end' && (
              <CLLCanvas nodes={partBNodes} headId="db-10" />
            )}
            {stage === 'partC_position' && (
              <CLLCanvas nodes={partCNodes} headId="dc-10" />
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
                  onClick={() => handlePartAStep('rewire_tail_and_head')}
                  className="btn-modern-primary px-4 py-2 text-xs font-bold flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-300" />
                  <span>Update Tail [30] → [20] & Set HEAD → [20]</span>
                </button>
              )}
              {subStep === 2 && (
                <button
                  onClick={() => {
                    soundManager.playSelect();
                    setStage('partB_end');
                    setSubStep(1);
                    setFeedback('Part B: Delete ending node [30]. Reconnect previous node [20] to HEAD [10].');
                  }}
                  className="btn-modern-primary px-5 py-2.5 text-xs font-bold flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <span>Next: Part B (Delete at End)</span>
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
                  onClick={() => handlePartBStep('rewire_prev_to_head')}
                  className="btn-modern-primary px-4 py-2 text-xs font-bold flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-300" />
                  <span>Reconnect [20].next → HEAD [10] & Detach [30]</span>
                </button>
              )}
              {subStep === 2 && (
                <button
                  onClick={() => {
                    soundManager.playSelect();
                    setStage('partC_position');
                    setSubStep(1);
                    setFeedback('Part C: Delete middle node [30]. Bypass it by connecting [20] → [40].');
                  }}
                  className="btn-modern-primary px-5 py-2.5 text-xs font-bold flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <span>Next: Part C (Delete Position)</span>
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
                  onClick={() => handlePartCStep('bypass_target')}
                  className="btn-modern-primary px-4 py-2 text-xs font-bold flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-300" />
                  <span>Bypass Node [30]: Point [20].next → [40]</span>
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
              Excellent work. You successfully deleted nodes from the beginning, end, and middle by repairing the surrounding connections.
            </p>
            <button
              onClick={() => onLevelComplete(4, 100)}
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
