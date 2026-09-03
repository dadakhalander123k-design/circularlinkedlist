import React, { useState, useEffect, useMemo } from 'react';
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  Award,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  BookOpen,
  Gamepad2,
  Check,
  Star,
  Layers,
  ChevronRight,
  ListOrdered,
  Trophy,
  Home,
} from 'lucide-react';
import { progressManager } from '../utils/progressManager';
import { soundManager } from '../utils/audio';
import { useScrollReveal } from '../hooks/useScrollReveal';

export interface QuizViewProps {
  onNavigateToTheory: (chapterId?: string) => void;
  onNavigateToQuest: (levelId?: number) => void;
  onNavigateToProgress: () => void;
  onNavigateToHome?: () => void;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  correctAnswerText: string;
  explanation: string;
  exampleSnippet?: string;
  techniqueCode: string;
  targetChapterId?: string;
  targetLevelId?: number;
}

export interface StudentAnswerRecord {
  questionId: number;
  selectedOptionIndex: number;
  selectedAnswerText: string;
  correctOptionIndex: number;
  correctAnswerText: string;
  isCorrect: boolean;
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: 'What makes a Circular Linked List different from a Singly Linked List?',
    options: [
      'Every node has two data fields',
      'The last node points back to the first node',
      'The first node always points to NULL',
      'Nodes are stored in contiguous memory',
    ],
    correctIndex: 1,
    correctAnswerText: 'The last node points back to the first node',
    explanation:
      'In a Circular Linked List, the last node does not point to NULL. Instead, its next pointer stores the address of the first node. This creates a continuous circular connection between the nodes.',
    exampleSnippet:
      'If a list contains 10, 20, 30, the links are 10 → 20 → 30 → 10. Therefore, after reaching 30, we can go back to 10.',
    techniqueCode: 'CLL-01',
    targetChapterId: 'theory-01',
  },
  {
    id: 2,
    question: "In a Circular Linked List, what does the last node's next pointer contain?",
    options: [
      'NULL',
      'Address of the previous node',
      'Address of the first node',
      'Address of itself',
    ],
    correctIndex: 2,
    correctAnswerText: 'Address of the first node',
    explanation:
      'The next field of the last node contains the address of the first node. This is the fundamental property that makes the linked list circular.',
    exampleSnippet:
      'For the list 10 → 20 → 30, the next pointer of node 30 points to node 10, so 30.next = head.',
    techniqueCode: 'CLL-02',
    targetChapterId: 'theory-02',
  },
  {
    id: 3,
    question: 'Which pointer is commonly used to identify the starting point of a Circular Linked List?',
    options: [
      'NULL pointer',
      'Head pointer',
      'Tail data',
      'Previous pointer',
    ],
    correctIndex: 1,
    correctAnswerText: 'Head pointer',
    explanation:
      'The head pointer stores the address of the first node and provides the starting point for operations such as traversal and searching.',
    exampleSnippet:
      'If the first node contains 10, head points to the node containing 10. From there, we can access the remaining nodes using their next pointers.',
    techniqueCode: 'CLL-03',
    targetChapterId: 'theory-03',
  },
  {
    id: 4,
    question: 'How do you know when to stop traversing a Circular Linked List?',
    options: [
      'When the current pointer becomes NULL',
      'After visiting only one node',
      'When the current pointer reaches the head again',
      'When the data becomes zero',
    ],
    correctIndex: 2,
    correctAnswerText: 'When the current pointer reaches the head again',
    explanation:
      'A Circular Linked List does not normally have NULL at the end. Therefore, checking current != NULL is not an appropriate stopping condition. Instead, traversal stops when the current pointer reaches the starting node again.',
    exampleSnippet:
      'For 10 → 20 → 30 → 10, after visiting 10, 20, and 30, the pointer reaches 10 again. At that point, traversal is complete.',
    techniqueCode: 'CLL-04',
    targetChapterId: 'theory-12',
  },
  {
    id: 5,
    question: 'What happens when a new node is inserted at the beginning of a Circular Linked List?',
    options: [
      'The new node becomes the first node and connects to the old head',
      'The new node is always inserted after the last node without changing links',
      'The last node is deleted',
      'The list becomes linear',
    ],
    correctIndex: 0,
    correctAnswerText: 'The new node becomes the first node and connects to the old head',
    explanation:
      'During insertion at the beginning, the new node becomes the new head. Its next pointer is connected to the previous first node. The last node must also be updated so that its next points to the new head.',
    exampleSnippet:
      'Suppose the list is 10 → 20 → 30 → 10. If 5 is inserted at the beginning, the new order becomes 5 → 10 → 20 → 30 → 5.',
    techniqueCode: 'CLL-05',
    targetChapterId: 'theory-05',
  },
  {
    id: 6,
    question: 'What is the main advantage of a Circular Linked List for repeated traversal?',
    options: [
      'It uses no pointers',
      'It allows traversal to continue from the last node back to the first',
      'It always uses less memory than an array',
      'It automatically sorts the data',
    ],
    correctIndex: 1,
    correctAnswerText: 'It allows traversal to continue from the last node back to the first',
    explanation:
      'The last node is connected to the first node, so traversal can continue repeatedly without reaching NULL. This makes Circular Linked Lists useful for situations where data needs to be processed in a cycle.',
    exampleSnippet:
      'In a round-robin system containing processes P1, P2, and P3, after processing P3, the system can return to P1 and continue the cycle.',
    techniqueCode: 'CLL-06',
    targetChapterId: 'theory-14',
  },
  {
    id: 7,
    question: 'Suppose a Circular Linked List contains 10 → 20 → 30 → 10. What will be the next node after 30?',
    options: [
      'NULL',
      '20',
      '10',
      '30',
    ],
    correctIndex: 2,
    correctAnswerText: '10',
    explanation:
      'In a Circular Linked List, the last node points back to the first node. Since 30 is the last node in this example, its next pointer points to 10.',
    exampleSnippet:
      'Starting from 10, the sequence is 10 → 20 → 30 → 10 → 20 → ... Therefore, after 30, the next node is 10.',
    techniqueCode: 'CLL-07',
    targetChapterId: 'theory-02',
  },
  {
    id: 8,
    question: 'Which operation is used to find whether a particular value exists in a Circular Linked List?',
    options: [
      'Sorting',
      'Searching',
      'Hashing only',
      'Compilation',
    ],
    correctIndex: 1,
    correctAnswerText: 'Searching',
    explanation:
      'Searching checks the data stored in each node until the required value is found or the traversal returns to the starting node.',
    exampleSnippet:
      'If the list contains 10, 20, 30, 40 and we search for 30, we compare 10 first, then 20, and then 30. When 30 matches the target value, the search is successful.',
    techniqueCode: 'CLL-08',
    targetChapterId: 'theory-11',
  },
  {
    id: 9,
    question: 'What should happen when the only node in a Circular Linked List is deleted?',
    options: [
      'The node points to itself forever',
      'The head becomes NULL',
      'A new node is automatically created',
      'The node becomes the tail',
    ],
    correctIndex: 1,
    correctAnswerText: 'The head becomes NULL',
    explanation:
      'When a Circular Linked List contains only one node, that node’s next pointer points back to itself. After deleting this node, there are no nodes remaining, so the head must be set to NULL.',
    exampleSnippet:
      'If the list contains only 10, deleting 10 makes the list empty, so head = NULL.',
    techniqueCode: 'CLL-09',
    targetChapterId: 'theory-08',
  },
  {
    id: 10,
    question: 'Which real-world application is well suited to a Circular Linked List?',
    options: [
      'Round-robin CPU scheduling',
      'Storing a single constant',
      'Calculating the area of a rectangle',
      'Checking whether a number is prime',
    ],
    correctIndex: 0,
    correctAnswerText: 'Round-robin CPU scheduling',
    explanation:
      'Circular Linked Lists are useful when a group of items needs to be processed repeatedly in a cycle. In round-robin CPU scheduling, each process gets a turn, and after the last process, the system can return to the first process.',
    exampleSnippet:
      'If three processes are P1, P2, and P3, the CPU can process them in the order P1 → P2 → P3 → P1 → P2 → P3, continuing the cycle as required.',
    techniqueCode: 'CLL-10',
    targetChapterId: 'theory-16',
  },
];

const QUIZ_STORAGE_ANSWERS_KEY = 'hash_quest_quiz_answers_v4';
const QUIZ_STORAGE_SUBMITTED_KEY = 'hash_quest_quiz_submitted_v4';

export const QuizView: React.FC<QuizViewProps> = ({
  onNavigateToTheory,
  onNavigateToQuest,
  onNavigateToProgress,
  onNavigateToHome,
}) => {
  useScrollReveal();

  // Load persisted student answers
  const [studentAnswers, setStudentAnswers] = useState<Record<number, StudentAnswerRecord>>(() => {
    try {
      const stored = localStorage.getItem(QUIZ_STORAGE_ANSWERS_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // fallback
    }
    return {};
  });

  const [isSubmitted, setIsSubmitted] = useState<boolean>(() => {
    try {
      const storedSub = localStorage.getItem(QUIZ_STORAGE_SUBMITTED_KEY);
      if (storedSub !== null) {
        return storedSub === 'true';
      }
      return progressManager.getState().quizSubmitted || false;
    } catch {
      return false;
    }
  });

  // Subscribe to progressManager for reset synchronization
  useEffect(() => {
    const unsub = progressManager.subscribe((pState) => {
      const isQuizEmpty = !pState.quizScores || Object.keys(pState.quizScores).length === 0;
      if (!pState.quizSubmitted && isQuizEmpty) {
        setIsSubmitted(false);
        setStudentAnswers({});
        setCurrentQuestionIndex(0);
        setPendingSelection(null);
        setViewMode('STEP_BY_STEP');
        try {
          localStorage.removeItem(QUIZ_STORAGE_ANSWERS_KEY);
          localStorage.removeItem(QUIZ_STORAGE_SUBMITTED_KEY);
          localStorage.removeItem('hash_quest_quiz_answers_v4');
          localStorage.removeItem('hash_quest_quiz_submitted_v4');
          localStorage.removeItem('cll_quiz_answers_v1');
          localStorage.removeItem('cll_quiz_submitted_v1');
        } catch {
          // Ignore
        }
      }
    });

    const handleGlobalQuizReset = () => {
      handleResetQuiz();
    };
    window.addEventListener('cll_reset_quiz', handleGlobalQuizReset);

    return () => {
      unsub();
      window.removeEventListener('cll_reset_quiz', handleGlobalQuizReset);
    };
  }, []);

  // Navigation within Quiz (0-indexed current question)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  // Temporary selection before confirming/submitting the question
  const [pendingSelection, setPendingSelection] = useState<number | null>(null);
  // View mode: 'STEP_BY_STEP' or 'FULL_REVIEW'
  const [viewMode, setViewMode] = useState<'STEP_BY_STEP' | 'FULL_REVIEW'>(() => {
    return isSubmitted ? 'FULL_REVIEW' : 'STEP_BY_STEP';
  });

  // Current question helper
  const currentQuestion = QUIZ_QUESTIONS[currentQuestionIndex] || QUIZ_QUESTIONS[0];
  const currentAnswerRecord = studentAnswers[currentQuestion.id];
  const isCurrentQuestionAnswered = currentAnswerRecord !== undefined;

  // Synchronize selection with current question record
  useEffect(() => {
    if (currentAnswerRecord !== undefined) {
      setPendingSelection(currentAnswerRecord.selectedOptionIndex);
    } else {
      setPendingSelection(null);
    }
  }, [currentQuestionIndex, currentAnswerRecord]);

  // Persist answers to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(QUIZ_STORAGE_ANSWERS_KEY, JSON.stringify(studentAnswers));
    } catch {
      // Ignore storage errors
    }
  }, [studentAnswers]);

  // Calculate score deterministically from stored answers
  const { score, totalQuestions, percentage, correctAnswersCount } = useMemo(() => {
    let correct = 0;
    QUIZ_QUESTIONS.forEach((q) => {
      const rec = studentAnswers[q.id];
      if (rec && rec.isCorrect) {
        correct++;
      }
    });
    const total = QUIZ_QUESTIONS.length;
    const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
    return {
      score: correct,
      totalQuestions: total,
      percentage: pct,
      correctAnswersCount: correct,
    };
  }, [studentAnswers]);

  // Get result tier based on final score
  // Get result tier based on final score
  const getResultTier = (correctCount: number) => {
    if (correctCount >= 8) {
      return {
        level: 'EXCELLENT',
        emoji: '🟢',
        title: '8–10: 🟢 Excellent — Circular Linked List Master!',
        badgeText: '🟢 EXCELLENT — CIRCULAR LINKED LIST MASTER!',
        badgeClass: 'bg-emerald-700 text-white border-emerald-900',
        cardClass: 'border-emerald-700 bg-emerald-50/80',
        summary:
          'Outstanding achievement! You scored in the top tier and have mastered all primary Circular Linked List concepts, node structures, operations, and complexity tradeoffs.',
        isMastered: true,
      };
    } else if (correctCount >= 6) {
      return {
        level: 'GOOD',
        emoji: '🟡',
        title: '6–7: 🟡 Good — Review a little and try again.',
        badgeText: '🟡 GOOD — REVIEW & PRACTICE',
        badgeClass: 'bg-amber-500 text-[#181818] border-amber-600',
        cardClass: 'border-amber-600 bg-amber-50/80',
        summary:
          'Solid foundation! You understand the key concepts. Review the detailed technical rationales below and try again to achieve Circular Linked List Master status.',
        isMastered: false,
      };
    } else {
      return {
        level: 'KEEP_LEARNING',
        emoji: '🔴',
        title: '0–5: 🔴 Keep Learning — Review the theory and visualization.',
        badgeText: '🔴 KEEP LEARNING — REVIEW THEORY',
        badgeClass: 'bg-red-600 text-white border-red-800',
        cardClass: 'border-red-600 bg-red-50/80',
        summary:
          'Keep practicing! Review the step-by-step Theory modules and try interactive simulations in the Visualizer.',
        isMastered: false,
      };
    }
  };

  const tier = getResultTier(score);

  // Dynamic Certificate / Completion Card Theme & Grade Content based on final quiz percentage
  const certificateTheme = useMemo(() => {
    if (percentage >= 80) {
      // 🟢 Green / Grade A (80%–100%)
      return {
        grade: 'A',
        badgeText: '★ OUTSTANDING MASTERY (GRADE A) ★',
        description:
          'Incredible performance! You demonstrated thorough command of Circular Linked List traversal, operations, edge cases, and algorithmic complexities.',
        cardBorder: 'border-slate-200 dark:border-emerald-500/30',
        iconBg: 'bg-[#00A86B] dark:bg-emerald-600 shadow-emerald-500/20 dark:shadow-emerald-950/50',
        badge: 'border-[#00A86B]/40 dark:border-emerald-500/40 bg-[#E6F8F0] dark:bg-emerald-950/60 text-[#008A54] dark:text-emerald-300',
        scoreCardBorder: 'border-[#A7F3D0] dark:border-emerald-500/40',
        scoreLabel: 'text-[#008A54] dark:text-emerald-400',
        scoreAccent: 'text-[#00A86B] dark:text-emerald-400',
        scoreSubBorder: 'border-slate-200 dark:border-emerald-500/30',
      };
    } else if (percentage >= 40) {
      // 🔵 Light Blue / Grade B (40%–79%)
      return {
        grade: 'B',
        badgeText: '★ STRONG PERFORMANCE (GRADE B) ★',
        description:
          'Solid performance! You have a good grasp of Circular Linked List fundamentals. Review any missed questions to master all concepts.',
        cardBorder: 'border-slate-200 dark:border-sky-500/30',
        iconBg: 'bg-[#0284C7] dark:bg-sky-500 shadow-sky-500/20 dark:shadow-sky-950/50',
        badge: 'border-sky-400/40 dark:border-sky-500/40 bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300',
        scoreCardBorder: 'border-sky-200 dark:border-sky-500/40',
        scoreLabel: 'text-sky-600 dark:text-sky-400',
        scoreAccent: 'text-[#0284C7] dark:text-sky-400',
        scoreSubBorder: 'border-slate-200 dark:border-sky-500/30',
      };
    } else {
      // 🟡 Yellow / Grade C (0%–39%)
      return {
        grade: 'C',
        badgeText: '★ NEEDS IMPROVEMENT (GRADE C) ★',
        description:
          'Keep practicing! Review the step-by-step Theory modules and try interactive simulations in the Visualizer to strengthen your understanding.',
        cardBorder: 'border-slate-200 dark:border-amber-500/30',
        iconBg: 'bg-[#EAB308] dark:bg-amber-500 shadow-amber-500/20 dark:shadow-amber-950/50',
        badge: 'border-amber-400/40 dark:border-amber-500/40 bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300',
        scoreCardBorder: 'border-amber-200 dark:border-amber-500/40',
        scoreLabel: 'text-amber-700 dark:text-amber-400',
        scoreAccent: 'text-[#D97706] dark:text-amber-400',
        scoreSubBorder: 'border-slate-200 dark:border-amber-500/30',
      };
    }
  }, [percentage]);

  // Robust scroll to a specific question card in the full review section
  const scrollToReviewQuestion = (questionId: number) => {
    setViewMode('FULL_REVIEW');
    const attemptScroll = (attemptsLeft: number) => {
      const el = document.getElementById(`quiz-review-card-${questionId}`);
      if (el) {
        const topHeaderOffset = 100;
        const elementPosition = el.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - topHeaderOffset;
        window.scrollTo({
          top: Math.max(0, offsetPosition),
          behavior: 'smooth',
        });
        el.classList.add('ring-4', 'ring-[#2563EB]', 'dark:ring-[#3B82F6]');
        setTimeout(() => {
          el.classList.remove('ring-4', 'ring-[#2563EB]', 'dark:ring-[#3B82F6]');
        }, 1800);
      } else if (attemptsLeft > 0) {
        setTimeout(() => attemptScroll(attemptsLeft - 1), 50);
      }
    };
    requestAnimationFrame(() => attemptScroll(12));
  };

  // Handle student selecting an option (before or during answering)
  const handleSelectOption = (optionIndex: number) => {
    if (isCurrentQuestionAnswered && isSubmitted) return;
    soundManager.playQuizSelect();
    setPendingSelection(optionIndex);
  };

  // Handle confirming answer for current question (Records answer without revealing final result screen)
  const handleConfirmAnswer = () => {
    if (pendingSelection === null || isCurrentQuestionAnswered) return;

    const q = currentQuestion;
    const isCorrect = pendingSelection === q.correctIndex;
    const selectedText = q.options[pendingSelection] || '';

    const newRecord: StudentAnswerRecord = {
      questionId: q.id,
      selectedOptionIndex: pendingSelection,
      selectedAnswerText: selectedText,
      correctOptionIndex: q.correctIndex,
      correctAnswerText: q.correctAnswerText,
      isCorrect,
    };

    const updatedAnswers = {
      ...studentAnswers,
      [q.id]: newRecord,
    };

    setStudentAnswers(updatedAnswers);

    // Play appropriate interaction sound
    if (isCorrect) {
      soundManager.playQuizCorrect();
    } else {
      soundManager.playQuizWrong();
    }
  };

  // Handle submitting the entire examination ONLY when user clicks "Complete & Review"
  const handleSubmitExamination = () => {
    const totalAnswered = Object.keys(studentAnswers).length;
    if (totalAnswered < QUIZ_QUESTIONS.length) {
      soundManager.playError();
      const firstUnansweredIndex = QUIZ_QUESTIONS.findIndex((quest) => studentAnswers[quest.id] === undefined);
      if (firstUnansweredIndex >= 0) {
        setCurrentQuestionIndex(firstUnansweredIndex);
      }
      return;
    }

    setIsSubmitted(true);
    setViewMode('FULL_REVIEW');
    try {
      localStorage.setItem(QUIZ_STORAGE_SUBMITTED_KEY, 'true');
    } catch {
      // Ignore storage errors
    }

    // Synchronize with progressManager
    const rawScoresMap: Record<number, number> = {};
    (Object.values(studentAnswers) as StudentAnswerRecord[]).forEach((rec) => {
      rawScoresMap[rec.questionId] = rec.selectedOptionIndex;
    });

    progressManager.recordQuizCompletion(rawScoresMap, score, QUIZ_QUESTIONS.length);

    if (score >= 6) {
      soundManager.playQuizComplete();
    } else {
      soundManager.playQuizWrong();
    }
  };

  // Handle resetting the quiz completely
  const handleResetQuiz = () => {
    soundManager.playReset();
    setStudentAnswers({});
    setIsSubmitted(false);
    setCurrentQuestionIndex(0);
    setPendingSelection(null);
    setViewMode('STEP_BY_STEP');

    try {
      localStorage.removeItem(QUIZ_STORAGE_ANSWERS_KEY);
      localStorage.removeItem(QUIZ_STORAGE_SUBMITTED_KEY);
      localStorage.removeItem('hash_quest_quiz_answers_v4');
      localStorage.removeItem('hash_quest_quiz_submitted_v4');
      localStorage.removeItem('cll_quiz_answers_v1');
      localStorage.removeItem('cll_quiz_submitted_v1');
    } catch {
      // Ignore
    }

    progressManager.resetQuizAttempt();
  };

  const answeredCount = Object.keys(studentAnswers).length;
  const allAnswered = answeredCount === QUIZ_QUESTIONS.length;

  return (
    <div className="w-full max-w-4xl mx-auto py-4 px-4 font-sans text-slate-900 dark:text-white animate-page-enter">
      {/* Header Banner */}
      <div className="border border-slate-200 dark:border-blue-500/20 rounded-2xl pb-6 mb-6 bg-white dark:bg-[#111827] p-6 sm:p-8 shadow-xs dark:shadow-[0_8px_30px_rgba(0,0,0,0.35)] reveal-on-scroll">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#EFF6FF] dark:bg-blue-950/60 border border-[#DBEAFE] dark:border-blue-500/30 text-[#2563EB] dark:text-[#3B82F6] rounded-lg text-xs font-semibold uppercase tracking-wider font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-[#2563EB] dark:text-[#3B82F6]" />
            <span>Knowledge Assessment</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Simple Circular Linked List Quiz (10 Questions)
            </span>
            {isSubmitted && (
              <span className="px-2.5 py-0.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300 rounded-md text-xs font-semibold">
                Completed
              </span>
            )}
          </div>
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight animate-heading-enter">
          Circular Linked List Knowledge Check
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-300 max-w-2xl mt-1 leading-relaxed">
          Test your understanding of circular linked list concepts, node connections, head pointers, traversals, and operations.
        </p>

        {/* Question Index Tabs / Progress Tracker */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-blue-500/15">
          <div className="flex items-center justify-between gap-2 mb-3 text-xs font-semibold text-slate-700 dark:text-slate-300">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#2563EB] dark:text-[#3B82F6]" />
              <span>
                Progress: <strong className="text-[#2563EB] dark:text-[#3B82F6] font-mono">{answeredCount}</strong> / {totalQuestions} Answered
              </span>
            </div>
            {isSubmitted && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    soundManager.playNav();
                    setViewMode(viewMode === 'STEP_BY_STEP' ? 'FULL_REVIEW' : 'STEP_BY_STEP');
                  }}
                  className="text-xs font-semibold text-[#2563EB] dark:text-[#3B82F6] hover:text-[#1D4ED8] dark:hover:text-[#3B82F6] flex items-center gap-1 cursor-pointer"
                >
                  <ListOrdered className="w-3.5 h-3.5" />
                  <span>{viewMode === 'STEP_BY_STEP' ? 'Switch to Full Review' : 'Switch to Step Mode'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Question Index Pills */}
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
            {QUIZ_QUESTIONS.map((q, idx) => {
              const rec = studentAnswers[q.id];
              const isAnswered = rec !== undefined;
              const isCurrent = currentQuestionIndex === idx && viewMode === 'STEP_BY_STEP';

              let pillStyle = 'bg-slate-50 dark:bg-[#0F172A] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-blue-500/20 hover:bg-slate-100 dark:hover:bg-[#172033]';
              if (isCurrent) {
                pillStyle = 'bg-[#2563EB] dark:bg-[#3B82F6] text-white border-[#2563EB] dark:border-[#3B82F6] font-bold shadow-xs';
              } else if (isAnswered) {
                if (rec.isCorrect) {
                  pillStyle = 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30 font-semibold';
                } else {
                  pillStyle = 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-500/30 font-semibold';
                }
              }

              return (
                <button
                  key={q.id}
                  id={`btn-quiz-jump-${q.id}`}
                  onClick={() => {
                    soundManager.playNav();
                    if (isSubmitted || viewMode === 'FULL_REVIEW') {
                      scrollToReviewQuestion(q.id);
                    } else {
                      setCurrentQuestionIndex(idx);
                      setViewMode('STEP_BY_STEP');
                    }
                  }}
                  className={`py-2 text-center text-xs font-mono rounded-lg border transition-all cursor-pointer ${pillStyle}`}
                  title={`Question ${idx + 1}`}
                >
                  <span>Q{idx + 1}</span>
                  {isAnswered && (
                    <span className="block text-[10px] leading-tight mt-0.5">
                      {rec.isCorrect ? '✓' : '✕'}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quiz Assessment Completed Section (Shown when submitted or in review mode) */}
      {isSubmitted && (
        <div
          id="quiz-result-card"
          className={`mb-8 p-6 sm:p-10 lg:p-12 bg-white dark:bg-[#111827] border ${certificateTheme.cardBorder} rounded-3xl shadow-xs dark:shadow-[0_8px_30px_rgba(0,0,0,0.35)] flex flex-col items-center justify-center text-center animate-editorial-scale transition-all`}
        >
          {/* 1. Top Achievement Trophy Icon */}
          <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl ${certificateTheme.iconBg} flex items-center justify-center shadow-lg mx-auto mb-4 sm:mb-5`}>
            <Trophy className="w-8 h-8 sm:w-10 sm:h-10 text-white stroke-[2.2]" />
          </div>

          {/* 2. Achievement Badge */}
          <div className={`inline-flex items-center justify-center px-4 py-1.5 rounded-full border ${certificateTheme.badge} font-mono text-[11px] sm:text-xs font-bold tracking-wider uppercase mb-3 sm:mb-4`}>
            {certificateTheme.badgeText}
          </div>

          {/* 3. Main Completion Heading */}
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0B192C] dark:text-white tracking-tight uppercase mb-3">
            QUIZ ASSESSMENT COMPLETED
          </h2>

          {/* 4. Supporting Description */}
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-xl mx-auto leading-relaxed font-normal mb-6 sm:mb-8">
            {certificateTheme.description}
          </p>

          {/* 5. Large Highlighted Score Card */}
          <div className={`w-full max-w-md mx-auto p-6 sm:p-8 bg-white dark:bg-[#0F172A] border-2 ${certificateTheme.scoreCardBorder} rounded-3xl shadow-sm dark:shadow-md flex flex-col items-center justify-center text-center mb-6 sm:mb-8`}>
            <span className={`text-[11px] sm:text-xs font-mono font-bold tracking-[0.2em] ${certificateTheme.scoreLabel} uppercase mb-2`}>
              FINAL HIGHLIGHTED SCORE
            </span>
            <div className={`text-5xl sm:text-6xl font-black ${certificateTheme.scoreAccent} font-sans tracking-tight leading-none my-2`}>
              {percentage}%
            </div>
            <div className={`mt-3 px-4 py-1.5 rounded-xl bg-slate-50 dark:bg-blue-950/40 border ${certificateTheme.scoreSubBorder} text-slate-700 dark:text-slate-300 font-mono text-xs sm:text-sm font-semibold`}>
              {score} / {totalQuestions} Questions Correct
            </div>
          </div>

          {/* 6. Summary Statistics Cards (CORRECT, INCORRECT, ACCURACY - STRICTLY NO XP) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 w-full max-w-2xl mx-auto">
            {/* CORRECT CARD */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200/90 dark:border-blue-500/30 shadow-xs flex flex-col items-center justify-center text-center">
              <span className="text-[10px] sm:text-[11px] font-mono font-bold tracking-widest text-slate-400 dark:text-slate-500 uppercase mb-1.5">
                CORRECT
              </span>
              <span className={`text-xl sm:text-2xl font-extrabold ${certificateTheme.scoreAccent} font-mono flex items-center justify-center gap-1.5`}>
                <Check className="w-5 h-5 stroke-[2.5]" />
                {score}
              </span>
            </div>

            {/* INCORRECT CARD */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200/90 dark:border-blue-500/30 shadow-xs flex flex-col items-center justify-center text-center">
              <span className="text-[10px] sm:text-[11px] font-mono font-bold tracking-widest text-slate-400 dark:text-slate-500 uppercase mb-1.5">
                INCORRECT
              </span>
              <span className="text-xl sm:text-2xl font-extrabold text-rose-500 dark:text-rose-400 font-mono">
                {totalQuestions - score}
              </span>
            </div>

            {/* ACCURACY CARD */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200/90 dark:border-blue-500/30 shadow-xs flex flex-col items-center justify-center text-center">
              <span className="text-[10px] sm:text-[11px] font-mono font-bold tracking-widest text-slate-400 dark:text-slate-500 uppercase mb-1.5">
                ACCURACY
              </span>
              <span className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white font-mono">
                {percentage}%
              </span>
            </div>
          </div>

          {/* 7. Action Buttons (Retake Quiz & Back to Home) */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4 mt-8 w-full max-w-md mx-auto">
            {/* 1. Retake Quiz (Primary Action) */}
            <button
              id="btn-quiz-retake"
              type="button"
              onClick={handleResetQuiz}
              className="w-full sm:w-auto px-6 sm:px-7 py-3 rounded-2xl bg-[#2563EB] hover:bg-[#1D4ED8] dark:bg-[#2563EB] dark:hover:bg-[#1D4ED8] text-white font-sans text-sm font-semibold shadow-xs transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4 stroke-[2.2]" />
              <span>Retake Quiz</span>
            </button>

            {/* 2. Back to Home (Secondary Action) */}
            <button
              id="btn-quiz-back-to-home"
              type="button"
              onClick={() => {
                soundManager.playNav();
                if (onNavigateToHome) {
                  onNavigateToHome();
                }
              }}
              className="w-full sm:w-auto px-6 sm:px-7 py-3 rounded-2xl bg-white hover:bg-slate-50 dark:bg-[#0F172A] dark:hover:bg-[#172033] text-slate-800 dark:text-slate-200 border border-slate-200/90 dark:border-blue-500/30 font-sans text-sm font-semibold shadow-xs transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Home className="w-4 h-4 stroke-[2.2] text-[#2563EB] dark:text-[#3B82F6]" />
              <span>Back to Home</span>
            </button>
          </div>
        </div>
      )}

      {/* VIEW MODE 1: STEP BY STEP QUESTION FLOW */}
      {viewMode === 'STEP_BY_STEP' && (
        <div className="space-y-6">
          <div
            key={currentQuestion.id}
            id={`quiz-step-card-${currentQuestion.id}`}
            className={`p-6 sm:p-8 border rounded-2xl transition-all bg-white dark:bg-[#111827] shadow-xs dark:shadow-[0_8px_30px_rgba(0,0,0,0.35)] animate-chapter-switch ${isCurrentQuestionAnswered
              ? currentAnswerRecord?.isCorrect
                ? 'border-emerald-300 dark:border-emerald-500/40 ring-1 ring-emerald-200 dark:ring-emerald-500/30'
                : 'border-rose-300 dark:border-rose-500/40 ring-1 ring-rose-200 dark:ring-rose-500/30'
              : 'border-slate-200 dark:border-blue-500/20'
              }`}
          >
            {/* Question Header */}
            <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100 dark:border-blue-500/15">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 bg-[#2563EB] dark:bg-[#3B82F6] text-white rounded-md text-xs font-bold font-mono shadow-xs">
                  Question {currentQuestionIndex + 1 < 10 ? `0${currentQuestionIndex + 1}` : currentQuestionIndex + 1} of {totalQuestions}
                </span>
                <span className="text-xs font-semibold text-[#2563EB] dark:text-[#3B82F6] font-mono">{currentQuestion.techniqueCode}</span>
              </div>

              {isCurrentQuestionAnswered && (
                <div>
                  {currentAnswerRecord?.isCorrect ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/60 text-xs font-bold text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30 rounded-lg">
                      <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>Correct</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 dark:bg-rose-950/60 text-xs font-bold text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-500/30 rounded-lg">
                      <XCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                      <span>Incorrect</span>
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Question Statement */}
            <p className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-6 leading-snug break-words">
              {currentQuestion.question}
            </p>

            {/* Answer Options */}
            <div className="space-y-3">
              {currentQuestion.options.map((opt, optIdx) => {
                const isSelected = pendingSelection === optIdx;
                let optStyle =
                  'bg-white dark:bg-[#0F172A] border-slate-200 dark:border-blue-500/25 hover:border-[#2563EB] dark:hover:border-[#3B82F6] hover:bg-slate-50 dark:hover:bg-[#172033] text-slate-800 dark:text-slate-200';

                if (isCurrentQuestionAnswered) {
                  if (optIdx === currentQuestion.correctIndex) {
                    optStyle =
                      'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-950 dark:text-emerald-200 font-bold ring-2 ring-emerald-400 dark:ring-emerald-500/40';
                  } else if (isSelected && !currentAnswerRecord?.isCorrect) {
                    optStyle = 'bg-rose-50 dark:bg-rose-950/60 border-rose-400 text-rose-950 dark:text-rose-200 font-bold';
                  } else {
                    optStyle = 'bg-white dark:bg-[#0F172A] opacity-40 border-slate-200 dark:border-blue-500/20 text-slate-400 dark:text-slate-500';
                  }
                } else if (isSelected) {
                  optStyle =
                    'bg-[#EFF6FF]/80 dark:bg-blue-950/60 border-[#2563EB] dark:border-[#3B82F6] text-[#2563EB] dark:text-[#F8FAFC] font-semibold ring-2 ring-[#2563EB] dark:ring-blue-500/30';
                }

                return (
                  <button
                    key={optIdx}
                    id={`quiz-q${currentQuestion.id}-opt${optIdx}`}
                    onClick={() => handleSelectOption(optIdx)}
                    disabled={isCurrentQuestionAnswered && isSubmitted}
                    style={{ animationDelay: `${(optIdx + 1) * 60}ms` }}
                    className={`w-full p-4 text-left text-sm font-sans rounded-xl border transition-all flex items-start gap-3.5 cursor-pointer animate-chapter-switch ${optStyle}`}
                  >
                    <span
                      className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 border text-xs font-bold font-mono ${isSelected
                        ? isCurrentQuestionAnswered
                          ? optIdx === currentQuestion.correctIndex
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-rose-600 text-white border-rose-600'
                          : 'bg-[#2563EB] dark:bg-[#3B82F6] text-white border-[#2563EB] dark:border-blue-500'
                        : 'bg-slate-100 dark:bg-[#111827] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-blue-500/30'
                        }`}
                    >
                      {String.fromCharCode(65 + optIdx)}
                    </span>
                    <span className="flex-1 pt-0.5 leading-relaxed break-words">{opt}</span>
                  </button>
                );
              })}
            </div>

            {/* Answer Confirmation / Next Button Bar */}
            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-blue-500/15 flex flex-wrap items-center justify-between gap-3">
              <button
                disabled={currentQuestionIndex === 0}
                onClick={() => {
                  soundManager.playNav();
                  setCurrentQuestionIndex((prev) => Math.max(0, prev - 1));
                }}
                className={`btn-modern-secondary px-4 py-2 text-xs font-semibold flex items-center gap-1.5 transition-all ${currentQuestionIndex === 0 ? 'opacity-40 cursor-not-allowed pointer-events-none' : 'cursor-pointer'
                  }`}
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </button>

              {!isCurrentQuestionAnswered ? (
                <button
                  id="btn-confirm-answer"
                  disabled={pendingSelection === null}
                  onClick={handleConfirmAnswer}
                  className={`btn-modern-primary px-6 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${pendingSelection !== null ? 'cursor-pointer' : 'opacity-40 cursor-not-allowed pointer-events-none'
                    }`}
                >
                  <Check className="w-4 h-4" />
                  <span>Submit Answer</span>
                </button>
              ) : currentQuestionIndex < totalQuestions - 1 ? (
                <button
                  id="btn-next-question"
                  onClick={() => {
                    soundManager.playClick();
                    setCurrentQuestionIndex((prev) => prev + 1);
                  }}
                  className="btn-modern-primary px-6 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer"
                >
                  <span>Next Question</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  id="btn-finish-quiz"
                  onClick={handleSubmitExamination}
                  className="btn-modern-primary px-6 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer"
                >
                  <Award className="w-4 h-4" />
                  <span>Complete & Review</span>
                </button>
              )}
            </div>

            {/* Technical Explanation Panel (visible once answered) */}
            {isCurrentQuestionAnswered && (
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-blue-500/15 bg-slate-50 dark:bg-[#0F172A] rounded-xl p-4 sm:p-5 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white mb-2">
                  <HelpCircle className="w-4 h-4 text-[#2563EB] dark:text-[#3B82F6]" />
                  <span>Technical Explanation:</span>
                </div>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-3 font-normal text-sm">
                  {currentQuestion.explanation}
                </p>

                {currentQuestion.exampleSnippet && (
                  <div className="mb-3 p-3 bg-white dark:bg-[#111827] border border-slate-200 dark:border-blue-500/30 rounded-lg font-mono text-xs text-[#2563EB] dark:text-[#3B82F6] font-semibold">
                    Example: {currentQuestion.exampleSnippet}
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-3 text-xs pt-1">
                  {currentQuestion.targetChapterId && (
                    <button
                      onClick={() => {
                        soundManager.playNav();
                        onNavigateToTheory(currentQuestion.targetChapterId);
                      }}
                      className="text-[#2563EB] dark:text-[#3B82F6] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Review in Theory Guide →</span>
                    </button>
                  )}
                  {currentQuestion.targetLevelId && (
                    <button
                      onClick={() => {
                        soundManager.playNav();
                        onNavigateToQuest(currentQuestion.targetLevelId);
                      }}
                      className="text-slate-700 dark:text-slate-300 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Gamepad2 className="w-3.5 h-3.5 text-[#2563EB] dark:text-[#3B82F6]" />
                      <span>Practice in Quest Level {currentQuestion.targetLevelId} →</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW MODE 2: COMPREHENSIVE AUDIT REVIEW */}
      {viewMode === 'FULL_REVIEW' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-blue-500/20">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ListOrdered className="w-4 h-4 text-[#2563EB] dark:text-[#3B82F6]" />
              <span>Full Question-by-Question Review</span>
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold font-mono">
              {score} of {totalQuestions} Correct
            </span>
          </div>

          <div className="space-y-4">
            {QUIZ_QUESTIONS.map((q, idx) => {
              const rec = studentAnswers[q.id];
              const isAnswered = rec !== undefined;
              const isCorrect = rec?.isCorrect || false;

              return (
                <div
                  key={q.id}
                  id={`quiz-review-card-${q.id}`}
                  className={`p-5 sm:p-6 border rounded-2xl transition-all bg-white dark:bg-[#111827] shadow-xs dark:shadow-[0_8px_30px_rgba(0,0,0,0.35)] scroll-mt-24 ${isAnswered
                    ? isCorrect
                      ? 'border-emerald-300 dark:border-emerald-500/40 ring-1 ring-emerald-200 dark:ring-emerald-500/30'
                      : 'border-rose-300 dark:border-rose-500/40 ring-1 ring-rose-200 dark:ring-rose-500/30'
                    : 'border-slate-200 dark:border-blue-500/20 opacity-75'
                    }`}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between gap-3 mb-3 pb-2 border-b border-slate-100 dark:border-blue-500/15">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 bg-[#2563EB] dark:bg-[#3B82F6] text-white rounded-md text-xs font-bold font-mono">
                        Question {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                      </span>
                      <span className="text-xs font-semibold text-[#2563EB] dark:text-[#3B82F6] font-mono">{q.techniqueCode}</span>
                    </div>

                    <div>
                      {isAnswered ? (
                        isCorrect ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-50 dark:bg-emerald-950/60 text-xs font-bold text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30 rounded-md">
                            <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Correct
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-rose-50 dark:bg-rose-950/60 text-xs font-bold text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-500/30 rounded-md">
                            <XCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" /> Incorrect
                          </span>
                        )
                      ) : (
                        <span className="px-2 py-0.5 bg-slate-100 dark:bg-[#0F172A] rounded-md text-xs font-semibold text-slate-500 dark:text-slate-400">
                          Unanswered
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Question Prompt */}
                  <p className="text-base font-bold text-slate-900 dark:text-white mb-4 leading-snug">
                    {q.question}
                  </p>

                  {/* Stored Comparison */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 text-xs font-mono">
                    <div className={`p-3 rounded-xl border ${isCorrect ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-500/30 text-emerald-950 dark:text-emerald-200' : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-500/30 text-rose-950 dark:text-rose-200'}`}>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 font-sans">
                        Your Submission:
                      </div>
                      <div className="font-bold text-sm">
                        {rec ? `${String.fromCharCode(65 + rec.selectedOptionIndex)}: ${rec.selectedAnswerText}` : 'No Answer Submitted'}
                      </div>
                    </div>

                    <div className="p-3 rounded-xl border bg-slate-50 dark:bg-[#0F172A] border-slate-200 dark:border-blue-500/20 text-slate-900 dark:text-white">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 font-sans">
                        Correct Answer:
                      </div>
                      <div className="font-bold text-sm text-emerald-800 dark:text-emerald-300">
                        {String.fromCharCode(65 + q.correctIndex)}: {q.correctAnswerText}
                      </div>
                    </div>
                  </div>

                  {/* Explanation */}
                  <div className="bg-slate-50 dark:bg-[#0F172A] p-4 rounded-xl border border-slate-200 dark:border-blue-500/20 text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white mb-1.5">
                      <HelpCircle className="w-4 h-4 text-[#2563EB] dark:text-[#3B82F6]" />
                      <span>Technical Explanation:</span>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-2 font-normal text-sm">
                      {q.explanation}
                    </p>

                    {q.exampleSnippet && (
                      <div className="mb-2 p-2.5 bg-white dark:bg-[#111827] border border-slate-200 dark:border-blue-500/30 rounded-lg font-mono text-xs text-[#2563EB] dark:text-[#3B82F6] font-semibold">
                        Example: {q.exampleSnippet}
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-3 text-xs pt-1">
                      {q.targetChapterId && (
                        <button
                          onClick={() => {
                            soundManager.playNav();
                            onNavigateToTheory(q.targetChapterId);
                          }}
                          className="text-[#2563EB] dark:text-[#3B82F6] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>Review in Theory Guide →</span>
                        </button>
                      )}
                      {q.targetLevelId && (
                        <button
                          onClick={() => {
                            soundManager.playNav();
                            onNavigateToQuest(q.targetLevelId);
                          }}
                          className="text-slate-700 dark:text-slate-300 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Gamepad2 className="w-3.5 h-3.5 text-[#2563EB] dark:text-[#3B82F6]" />
                          <span>Practice in Quest Level {q.targetLevelId} →</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizView;
