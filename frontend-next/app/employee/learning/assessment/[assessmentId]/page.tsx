'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { AppLayout } from '@/components/dashboard/AppLayout';
import { DashboardPageContainer } from '@/components/dashboard/DashboardPageContainer';
import {
  getQuizDetail,
  submitQuizAnswer,
  QuizDetailResponse,
  QuizResultResponse,
} from '@/lib/services/employeeLearning';
import {
  Award,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  RotateCcw,
  BookOpen,
  Send,
  AlertCircle,
  FileCheck,
} from 'lucide-react';

interface QuizPageProps {
  params: Promise<{ assessmentId: string }>;
}

export default function EmployeeAssessmentQuizPage({ params }: QuizPageProps) {
  const resolvedParams = use(params);
  const quizId = resolvedParams.assessmentId;

  const [quiz, setQuiz] = useState<QuizDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<QuizResultResponse | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadQuiz() {
      setLoading(true);
      setError(null);
      try {
        const q = await getQuizDetail(quizId);
        if (isMounted) {
          setQuiz(q);
          if (q.options && q.options.length > 0) {
            setSelectedOption(q.options[0].option_label);
          }
        }
      } catch (err: unknown) {
        if (isMounted) setError(err instanceof Error ? err.message : 'Failed to load quiz details');
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadQuiz();
    return () => {
      isMounted = false;
    };
  }, [quizId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOption) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await submitQuizAnswer(quizId, selectedOption);
      setResult(res);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to submit quiz answer');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetry = () => {
    setResult(null);
  };

  return (
    <AppLayout allowedRoles={['admin', 'employee']}>
      <DashboardPageContainer>
        {/* Back navigation link */}
        <div className="mb-4 flex items-center justify-between">
          <Link
            href="/employee/learning"
            className="inline-flex items-center text-xs font-semibold text-slate-400 hover:text-indigo-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Learning Workspace
          </Link>
          {quiz && (
            <span className="text-xs font-mono font-semibold text-slate-400">
              Module Assessment ID: {quiz.module_id}
            </span>
          )}
        </div>

        {loading ? (
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-sm animate-pulse space-y-4 max-w-3xl mx-auto">
            <div className="h-6 bg-slate-800 rounded w-1/3"></div>
            <div className="h-10 bg-slate-800/60 rounded"></div>
            <div className="h-32 bg-slate-800/60 rounded"></div>
          </div>
        ) : error && !quiz ? (
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-sm max-w-3xl mx-auto">
            <div className="flex items-center text-rose-400 bg-rose-950/60 p-4 rounded-lg border border-rose-800/60 text-sm">
              <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
              <span>{error}</span>
            </div>
          </div>
        ) : quiz ? (
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Quiz Header */}
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-sm">
              <div className="flex items-center justify-between gap-4 border-b border-slate-800/60 pb-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-amber-950/60 rounded-lg text-amber-400 border border-amber-800/60">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700/50 px-2 py-0.5 rounded">
                        {quiz.question_code || 'Q01'}
                      </span>
                      <h1 className="text-xl font-bold text-slate-100">Module Knowledge Check</h1>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Passing score requirement: <span className="font-bold text-slate-300 font-mono">{quiz.passing_score}%</span>
                    </p>
                  </div>
                </div>

                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-indigo-950/60 text-indigo-300 border border-indigo-800/60">
                  Multiple Choice
                </span>
              </div>

              {!result ? (
                /* Question & Options Form */
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <h2 className="text-base font-bold text-slate-100 leading-snug mb-4">
                      {quiz.question_text}
                    </h2>

                    <div className="space-y-3">
                      {quiz.options && quiz.options.length > 0 ? (
                        quiz.options.map((opt) => (
                          <label
                            key={opt.option_id}
                            className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                              selectedOption === opt.option_label
                                ? 'bg-indigo-950/60 border-indigo-500 ring-2 ring-indigo-500/30 text-slate-100 shadow-sm'
                                : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900'
                            }`}
                          >
                            <input
                              type="radio"
                              name="quiz_option"
                              value={opt.option_label}
                              checked={selectedOption === opt.option_label}
                              onChange={() => setSelectedOption(opt.option_label)}
                              className="mt-0.5 text-indigo-500 focus:ring-indigo-500"
                            />
                            <div>
                              <span className="font-bold text-xs text-indigo-400 mr-2">
                                Option {opt.option_label}:
                              </span>
                              <span className="text-xs text-slate-200 font-medium">
                                {opt.option_text}
                              </span>
                            </div>
                          </label>
                        ))
                      ) : (
                        <div className="text-xs text-slate-400 italic">No option choices returned for this quiz.</div>
                      )}
                    </div>
                  </div>

                  {error && (
                    <div className="text-xs text-rose-400 bg-rose-950/60 p-3 rounded-lg border border-rose-800/60">
                      {error}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-slate-800/60">
                    <span className="text-xs text-slate-400">
                      Select your answer choice above and click submit.
                    </span>

                    <button
                      type="submit"
                      disabled={submitting || !selectedOption}
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg inline-flex items-center gap-1.5 transition-colors disabled:opacity-50 shadow-sm"
                    >
                      {submitting ? (
                        <span>Evaluating...</span>
                      ) : (
                        <>
                          <Send className="w-4 h-4" /> Submit Quiz Answer
                        </>
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                /* Result Feedback View */
                <div className="space-y-6 pt-2">
                  <div
                    className={`p-6 rounded-xl border text-center space-y-3 ${
                      result.passed
                        ? 'bg-emerald-950/60 border-emerald-800/60 text-emerald-300'
                        : 'bg-rose-950/60 border-rose-800/60 text-rose-300'
                    }`}
                  >
                    {result.passed ? (
                      <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                    ) : (
                      <XCircle className="w-12 h-12 text-rose-400 mx-auto" />
                    )}

                    <h2 className="text-2xl font-black">
                      {result.passed ? 'Quiz Assessment Passed!' : 'Assessment Retake Recommended'}
                    </h2>

                    <div className="text-3xl font-black font-mono">
                      Score: {result.score}%
                    </div>

                    <p className="text-xs max-w-md mx-auto text-slate-300">
                      {result.passed
                        ? 'Congratulations! You have demonstrated compliance and subject matter mastery for this learning module.'
                        : 'Your score was below the required 80% passing threshold. Please review the explanation below and retry.'}
                    </p>
                  </div>

                  {/* Explanation Card */}
                  <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 text-xs space-y-2">
                    <div className="flex items-center gap-2 text-slate-100 font-bold">
                      <FileCheck className="w-4 h-4 text-indigo-400" /> Correct Answer Reference
                    </div>
                    <div>
                      <strong className="text-slate-300">Correct Option:</strong>{' '}
                      <span className="font-mono bg-indigo-950/80 text-indigo-300 border border-indigo-800/60 px-2 py-0.5 rounded font-bold">
                        {result.correct_answer}
                      </span>
                    </div>
                    {result.explanation && (
                      <div className="text-slate-400 mt-2 leading-relaxed">
                        <strong className="text-slate-300">Explanation:</strong> {result.explanation}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-800/60">
                    <button
                      onClick={handleRetry}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-lg border border-slate-700 transition-colors"
                    >
                      <RotateCcw className="w-4 h-4 mr-1.5 inline" /> Try Quiz Again
                    </button>

                    <Link
                      href="/employee/learning"
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg inline-flex items-center gap-1.5 transition-colors shadow-sm"
                    >
                      <BookOpen className="w-4 h-4" /> Return to Learning Workspace
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </DashboardPageContainer>
    </AppLayout>
  );
}
