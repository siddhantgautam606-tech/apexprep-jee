import React, { useMemo } from 'react';
import { BarChart3, AlertOctagon, CheckCircle2, TrendingUp, Clock, Award } from 'lucide-react';
import { computeOverallAnalytics } from '../../services/analyticsService';

export default function AnalyticsDashboard({ currentUser, onNavigateToPool }) {
  const analytics = useMemo(() => {
    if (!currentUser?.id) return { hasData: false, totalTests: 0, averageScore: 0, averageAccuracy: 0, totalAttemptedQuestions: 0, chapterMastery: [], weakChapters: [], moderateChapters: [], strongChapters: [], recentAttempts: [] };
    return computeOverallAnalytics();
  }, [currentUser?.id]);

  if (!analytics.hasData) {
    return (
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
          <BarChart3 className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-white">No Exam Data Recorded Yet</h2>
        <p className="text-xs text-slate-400 max-w-sm">
          Complete at least one mock test in the <strong>CBT Tests</strong> section to start generating performance metrics and weak-area analysis.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600/20 text-indigo-400 p-2.5 rounded-xl border border-indigo-600/30">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Growth & Weak-Area Analytics</h2>
            <p className="text-xs text-slate-400">Automated diagnostic performance profiling</p>
          </div>
        </div>
        <span className="text-xs font-mono bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-lg text-slate-400">
          {analytics.totalTests} Mocks Recorded
        </span>
      </div>

      {/* Top-Level KPI Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col justify-between">
          <span className="text-xs text-slate-400 font-medium">Average Score</span>
          <span className="text-2xl font-bold text-white mt-2">{analytics.averageScore}</span>
          <span className="text-[11px] text-slate-500 mt-1">Per Test</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col justify-between">
          <span className="text-xs text-slate-400 font-medium">Cumulative Accuracy</span>
          <span className="text-2xl font-bold text-emerald-400 mt-2">{analytics.averageAccuracy}%</span>
          <span className="text-[11px] text-slate-500 mt-1">Across all attempts</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col justify-between">
          <span className="text-xs text-slate-400 font-medium">Questions Attempted</span>
          <span className="text-2xl font-bold text-indigo-400 mt-2">{analytics.totalAttemptedQuestions}</span>
          <span className="text-[11px] text-slate-500 mt-1">Total Solved</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col justify-between">
          <span className="text-xs text-slate-400 font-medium">Critical Weak Areas</span>
          <span className="text-2xl font-bold text-rose-400 mt-2">{analytics.weakChapters.length}</span>
          <span className="text-[11px] text-slate-500 mt-1">&lt; 45% Accuracy</span>
        </div>
      </div>

      {/* Weak Areas Banner */}
      {analytics.weakChapters.length > 0 && (
        <div className="bg-rose-950/40 border border-rose-900/60 rounded-2xl p-5 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
            <AlertOctagon className="w-4 h-4" />
            <span>High-Priority Revision Required (&lt; 45% Accuracy)</span>
          </div>
          <p className="text-xs text-rose-200/80">
            The diagnostic engine detected low accuracy in the following chapters. Focus on reviewing these topics in the Question Pool:
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            {analytics.weakChapters.map((ch) => (
              <div
                key={`${ch.subject}-${ch.chapter}`}
                className="bg-rose-900/40 border border-rose-800 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-200 flex items-center gap-2"
              >
                <span>{ch.subject} • {ch.chapter}</span>
                <span className="bg-rose-950 px-1.5 py-0.5 rounded text-[10px] font-mono text-rose-300">
                  {ch.accuracy}% Acc
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Chapter Mastery Breakdown */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col gap-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider text-slate-400">
          Chapter Accuracy & Mastery
        </h3>
        <div className="flex flex-col gap-3">
          {analytics.chapterMastery.map((ch) => {
            const barColor =
              ch.status === 'Strong'
                ? 'bg-emerald-500'
                : ch.status === 'Weak'
                ? 'bg-rose-500'
                : 'bg-amber-500';

            return (
              <div key={`${ch.subject}-${ch.chapter}`} className="flex flex-col gap-1.5 text-xs">
                <div className="flex justify-between items-center text-slate-300">
                  <span className="font-semibold">
                    {ch.subject} &bull; {ch.chapter}
                  </span>
                  <span className="font-mono font-bold">{ch.accuracy}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                    style={{ width: `${ch.accuracy}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Attempts History Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col gap-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider text-slate-400">
          Recent Test History
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-slate-300">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500">
                <th className="pb-3">Date</th>
                <th className="pb-3">Questions</th>
                <th className="pb-3">Duration</th>
                <th className="pb-3 text-center">Score</th>
                <th className="pb-3 text-right">Accuracy</th>
              </tr>
            </thead>
            <tbody>
              {analytics.recentAttempts.map((attempt) => (
                <tr key={attempt.id} className="border-b border-slate-800/60 last:border-0">
                  <td className="py-3 font-mono text-slate-400">
                    {new Date(attempt.timestamp).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </td>
                  <td className="py-3">{attempt.questionCount} Questions</td>
                  <td className="py-3">{attempt.durationMinutes} mins</td>
                  <td className="py-3 text-center font-bold text-indigo-400">
                    {attempt.score} / {attempt.totalPossibleScore}
                  </td>
                  <td className="py-3 text-right font-mono font-bold text-emerald-400">
                    {attempt.accuracy}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}