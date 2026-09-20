/**
 * CryptoVerse - Curriculum & Interactive Learning Engine
 * Location: src/views/LearnView.tsx
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { INITIAL_LESSONS, INITIAL_QUIZZES } from '../data/db';
import { Lesson, QuizQuestion } from '../types';
import { LessonVisualizer } from '../components/LessonVisualizer';
import { 
  BookOpen, 
  CheckCircle2, 
  Lock, 
  Sparkles, 
  Cpu, 
  ArrowRight, 
  Edit3, 
  HelpCircle,
  Award,
  ChevronRight,
  Flame,
  Clock,
  RotateCcw
} from 'lucide-react';

export const LearnView: React.FC<{ initialLessonId?: number }> = ({ initialLessonId }) => {
  const { user, profile, addXp } = useAuth();

  const [activeLesson, setActiveLesson] = useState<Lesson>(
    INITIAL_LESSONS.find(l => l.id === initialLessonId) || INITIAL_LESSONS[0]
  );
  const [explanationMode, setExplanationMode] = useState<'BEGINNER' | 'TECHNICAL'>('BEGINNER');

  // Quiz state
  const [quizAnswers, setQuizAnswers] = useState<{ [qId: number]: number }>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState<number | null>(null);

  // Notes state
  const [noteText, setNoteText] = useState('');
  const [noteSaved, setNoteSaved] = useState(false);

  // Student progress state
  const [completedLessonIds, setCompletedLessonIds] = useState<number[]>([1]);

  useEffect(() => {
    if (initialLessonId) {
      const target = INITIAL_LESSONS.find(l => l.id === initialLessonId);
      if (target) {
        setActiveLesson(target);
        resetLessonState(target.id);
      }
    }
  }, [initialLessonId]);

  const resetLessonState = (lessonId: number) => {
    setQuizAnswers({});
    setQuizSubmitted(false);
    setQuizScore(null);
    const savedNote = localStorage.getItem(`cryptoverse_note_${user?.id}_${lessonId}`) || '';
    setNoteText(savedNote);
  };

  const handleSelectLesson = (lesson: Lesson) => {
    setActiveLesson(lesson);
    resetLessonState(lesson.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveNote = () => {
    if (!user) return;
    localStorage.setItem(`cryptoverse_note_${user.id}_${activeLesson.id}`, noteText);
    setNoteSaved(true);
    setTimeout(() => setNoteSaved(false), 2000);
  };

  const lessonQuizzes = INITIAL_QUIZZES.filter(q => q.lesson_id === activeLesson.id);

  const handleSelectOption = (questionId: number, optionIndex: number) => {
    if (quizSubmitted) return;
    setQuizAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleSubmitQuiz = (e: React.FormEvent) => {
    e.preventDefault();
    if (lessonQuizzes.length === 0) return;

    let correctCount = 0;
    lessonQuizzes.forEach(q => {
      if (quizAnswers[q.id] === q.correct_index) {
        correctCount++;
      }
    });

    const scorePct = Math.round((correctCount / lessonQuizzes.length) * 100);
    setQuizScore(scorePct);
    setQuizSubmitted(true);

    if (scorePct >= 70) {
      if (!completedLessonIds.includes(activeLesson.id)) {
        setCompletedLessonIds(prev => [...prev, activeLesson.id]);
        addXp(activeLesson.xp_reward);
      }
    }
  };

  // Group lessons by module
  const modules = [
    { key: 'MODULE_1', title: 'Module 1: Foundations of Digital Value' },
    { key: 'MODULE_2', title: 'Module 2: The Blockchain Protocol' },
    { key: 'MODULE_3', title: 'Module 3: Wallets, Keys & Transactions' },
    { key: 'MODULE_4', title: 'Module 4: Markets, Economics & Risk' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-20">
      
      {/* LEFT COLUMN: CURRICULUM ROADMAP NAVIGATION (4 cols) */}
      <div className="lg:col-span-4 space-y-6">
        <div className="rounded-xl border border-white/10 bg-[#121722] p-5">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Curriculum Path</h2>
              <span className="text-xs text-slate-400">{completedLessonIds.length} of 15 Completed</span>
            </div>
            <span className="rounded bg-blue-600/20 text-blue-400 font-mono text-xs px-2.5 py-1 font-bold">
              {Math.round((completedLessonIds.length / 15) * 100)}%
            </span>
          </div>

          <div className="mt-4 space-y-6">
            {modules.map(mod => {
              const modLessons = INITIAL_LESSONS.filter(l => l.module === mod.key);
              return (
                <div key={mod.key} className="space-y-2">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    {mod.title}
                  </div>

                  <div className="space-y-1">
                    {modLessons.map(l => {
                      const isCompleted = completedLessonIds.includes(l.id);
                      const isCurrent = activeLesson.id === l.id;
                      const isUnlocked = l.order_num === 1 || completedLessonIds.includes(l.id - 1) || isCompleted;

                      return (
                        <button
                          key={l.id}
                          disabled={!isUnlocked}
                          onClick={() => handleSelectLesson(l)}
                          className={`w-full text-left rounded-lg p-2.5 flex items-center justify-between transition text-xs ${
                            isCurrent 
                              ? 'border border-blue-500 bg-blue-600/15 text-white font-bold' 
                              : isUnlocked 
                                ? 'hover:bg-white/5 text-slate-300' 
                                : 'opacity-40 cursor-not-allowed text-slate-500'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0 pr-2">
                            <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded text-[10px] font-mono font-bold ${
                              isCompleted ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-slate-400'
                            }`}>
                              {isCompleted ? '✓' : l.order_num}
                            </span>
                            <span className="truncate">{l.title}</span>
                          </div>

                          <span className="shrink-0 font-mono text-[10px] text-emerald-400">
                            +{l.xp_reward} XP
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: ACTIVE LESSON WORKSPACE (8 cols) */}
      <div className="lg:col-span-8 space-y-6">
        
        {/* Lesson Header Card */}
        <div className="rounded-xl border border-white/10 bg-[#121722] p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <span className="rounded bg-blue-600/20 px-2.5 py-0.5 text-xs font-mono font-bold text-blue-400">
                LESSON {String(activeLesson.order_num).padStart(2, '0')}
              </span>
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Clock className="h-3.5 w-3.5" />
                <span>{activeLesson.estimated_minutes} min read</span>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-400">
                +{activeLesson.xp_reward} XP
              </span>
            </div>

            {/* Dual Mode Switcher */}
            <div className="flex items-center rounded-lg border border-white/10 bg-black/40 p-1">
              <button
                type="button"
                onClick={() => setExplanationMode('BEGINNER')}
                className={`rounded-md px-3 py-1.5 text-xs font-bold transition ${
                  explanationMode === 'BEGINNER' 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Beginner (Analogy)
              </button>
              <button
                type="button"
                onClick={() => setExplanationMode('TECHNICAL')}
                className={`rounded-md px-3 py-1.5 text-xs font-bold transition ${
                  explanationMode === 'TECHNICAL' 
                    ? 'bg-indigo-600 text-white shadow-sm' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Technical (Protocol)
              </button>
            </div>
          </div>

          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">{activeLesson.title}</h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">{activeLesson.summary}</p>
          </div>

          {/* DUAL MODE CONTENT DISPLAY */}
          {explanationMode === 'BEGINNER' ? (
            <div className="space-y-4 pt-2">
              <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-4 text-xs text-blue-300 leading-relaxed italic border-l-4 border-l-blue-500">
                <strong>Everyday Analogy: </strong>
                {activeLesson.analogy}
              </div>
              <div className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                {activeLesson.simple_explanation}
              </div>
            </div>
          ) : (
            <div className="space-y-4 pt-2">
              <div className="rounded-lg border border-indigo-500/20 bg-indigo-500/5 p-4 text-xs text-indigo-300 leading-relaxed border-l-4 border-l-indigo-500">
                <strong>Protocol Specification: </strong>
                Cryptographic network primitives, consensus constraints, and architectural invariants.
              </div>
              <div className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line font-mono text-[12px]">
                {activeLesson.technical_explanation}
              </div>
            </div>
          )}
        </div>

        {/* INTERACTIVE VISUAL PROTOCOL LAB */}
        <LessonVisualizer lessonId={activeLesson.id} />

        {/* PERSONAL STUDENT NOTES SCRATCHPAD */}
        <div className="rounded-xl border border-white/10 bg-[#121722] p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <Edit3 className="h-4 w-4 text-amber-400" />
              <span>Personal Study Notes</span>
            </div>
            {noteSaved && (
              <span className="text-[11px] font-semibold text-emerald-400">Notes Saved!</span>
            )}
          </div>
          <textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Jot down notes, questions, or key takeaways for this lesson..."
            rows={2}
            className="w-full rounded-lg border border-white/10 bg-black/40 p-3 text-xs text-slate-200 placeholder-slate-500 focus:border-blue-500 focus:outline-none"
          />
          <button
            type="button"
            onClick={handleSaveNote}
            className="rounded bg-white/10 px-3 py-1 text-[11px] font-bold text-white hover:bg-white/20 transition"
          >
            Save Notes
          </button>
        </div>

        {/* SCENARIO-BASED QUIZ ENGINE */}
        {lessonQuizzes.length > 0 && (
          <form onSubmit={handleSubmitQuiz} className="rounded-xl border border-white/10 bg-[#121722] p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-emerald-400">CHECKPOINT QUIZ</span>
                <h3 className="text-sm font-bold text-white">Scenario-Based Knowledge Check</h3>
              </div>
              <span className="text-xs text-slate-400">Passing score: 70%+</span>
            </div>

            <div className="space-y-6">
              {lessonQuizzes.map((q, qIndex) => {
                const userChoice = quizAnswers[q.id];
                const isAnswered = userChoice !== undefined;
                const isCorrect = userChoice === q.correct_index;

                return (
                  <div key={q.id} className="rounded-lg border border-white/5 bg-black/30 p-4 space-y-3">
                    <div className="text-xs font-bold text-white">
                      {qIndex + 1}. {q.scenario || q.question_text}
                    </div>

                    <div className="space-y-2">
                      {q.options.map((option, optIndex) => {
                        const optionText = typeof option === 'string' ? option : option.option_text;
                        const isSelected = userChoice === optIndex;
                        let optionStyle = 'border-white/5 bg-white/5 text-slate-300 hover:bg-white/10';

                        if (quizSubmitted) {
                          if (optIndex === q.correct_index) {
                            optionStyle = 'border-emerald-500/50 bg-emerald-500/15 text-emerald-300 font-bold';
                          } else if (isSelected && !isCorrect) {
                            optionStyle = 'border-rose-500/50 bg-rose-500/15 text-rose-300';
                          }
                        } else if (isSelected) {
                          optionStyle = 'border-blue-500 bg-blue-500/20 text-white font-bold';
                        }

                        return (
                          <label
                            key={optIndex}
                            onClick={() => handleSelectOption(q.id, optIndex)}
                            className={`flex items-start gap-3 rounded-lg border p-2.5 text-xs cursor-pointer transition ${optionStyle}`}
                          >
                            <input
                              type="radio"
                              name={`quiz_${q.id}`}
                              checked={isSelected}
                              onChange={() => handleSelectOption(q.id, optIndex)}
                              disabled={quizSubmitted}
                              className="mt-0.5"
                            />
                            <span>{optionText}</span>
                          </label>
                        );
                      })}
                    </div>

                    {quizSubmitted && (
                      <div className={`rounded p-2 text-[11px] leading-relaxed ${
                        isCorrect ? 'bg-emerald-500/10 text-emerald-300' : 'bg-rose-500/10 text-rose-300'
                      }`}>
                        <strong>{isCorrect ? '✓ Correct! ' : '✕ Incorrect. '}</strong>
                        {q.explanation}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-white/10">
              {!quizSubmitted ? (
                <button
                  type="submit"
                  disabled={Object.keys(quizAnswers).length < lessonQuizzes.length}
                  className="rounded-lg bg-emerald-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-500 transition disabled:opacity-50"
                >
                  Submit Answers & Claim XP
                </button>
              ) : (
                <div className="flex items-center gap-3">
                  <div className={`text-xs font-bold ${quizScore! >= 70 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    Score: {quizScore}% {quizScore! >= 70 ? '— Passed! (+XP Awarded)' : '— Need 70% to pass.'}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setQuizSubmitted(false);
                      setQuizAnswers({});
                      setQuizScore(null);
                    }}
                    className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition"
                  >
                    <RotateCcw className="h-3.5 w-3.5" /> Retake Quiz
                  </button>
                </div>
              )}

              {quizSubmitted && quizScore! >= 70 && activeLesson.id < 15 && (
                <button
                  type="button"
                  onClick={() => {
                    const next = INITIAL_LESSONS.find(l => l.id === activeLesson.id + 1);
                    if (next) handleSelectLesson(next);
                  }}
                  className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-5 py-2 text-xs font-bold text-white hover:bg-blue-500 transition"
                >
                  <span>Next Lesson</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
