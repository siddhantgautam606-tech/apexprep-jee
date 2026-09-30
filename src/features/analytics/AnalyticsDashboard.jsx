import React, { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, Target } from 'lucide-react';
import { getCombinedAnalytics } from '../../services/analyticsService';

export default function AnalyticsDashboard({ currentUser }) {
  const [analytics, setAnalytics] = useState({ hasData:false,totalTests:0,averageScore:0,averageAccuracy:0,totalAttemptedQuestions:0,chapterMastery:[],weakChapters:[],moderateChapters:[],strongChapters:[],recentAttempts:[] });
  useEffect(() => { let active=true; (async()=>{ if(!currentUser?.id){setAnalytics({ hasData:false,totalTests:0,averageScore:0,averageAccuracy:0,totalAttemptedQuestions:0,chapterMastery:[],weakChapters:[],moderateChapters:[],strongChapters:[],recentAttempts:[] }); return;} const result=await getCombinedAnalytics(currentUser.id); if(active)setAnalytics(result); })(); return()=>{active=false;}; }, [currentUser?.id]);
  const chapterTotal = analytics.chapterMastery.length;
  const strongPct = chapterTotal ? analytics.strongChapters.length / chapterTotal * 100 : 0;
  const moderatePct = chapterTotal ? (analytics.strongChapters.length + analytics.moderateChapters.length) / chapterTotal * 100 : 0;
const attempted=analytics.totalAttemptedQuestions || 0;
  const accuracy=Math.max(0,Math.min(100,Number(analytics.averageAccuracy)||0));
  const correctCount=Math.round(attempted*accuracy/100);
  if (!analytics.hasData) return (
    <div className="w-full max-w-5xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-10 sm:p-12 text-center flex flex-col items-center gap-4">
      <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center"><BarChart3 className="w-6 h-6" /></div>
      <h2 className="text-lg font-bold text-white">Your performance dashboard is getting ready</h2>
      <p className="text-sm text-slate-400 max-w-md">Complete a personal CBT or Friend Circle test to see your real accuracy, chapter strengths, areas to improve and practice recommendations.</p>
    </div>
  );
  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div className="flex items-center gap-3"><div className="bg-indigo-600/20 text-indigo-400 p-2.5 rounded-xl border border-indigo-600/30"><TrendingUp className="w-5 h-5" /></div><div><h2 className="text-lg font-bold text-white">Performance Analytics</h2><p className="text-xs text-slate-400">Chapter insights from your recorded tests</p></div></div>
        <span className="text-xs font-mono bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-lg text-slate-400">{analytics.totalTests} tests recorded</span>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[{label:'Average score',value:analytics.averageScore,detail:'Per test',color:'text-white'},{label:'Overall accuracy',value:accuracy+'%',detail:'Across attempted questions',color:'text-emerald-400'},{label:'Questions attempted',value:attempted,detail:'Total responses',color:'text-indigo-400'},{label:'Weak chapters',value:analytics.weakChapters.length,detail:'Below 45% accuracy',color:'text-rose-400'}].map((item)=><div key={item.label} className="bg-slate-900 border border-slate-800 rounded-xl p-4"><p className="text-xs text-slate-400">{item.label}</p><p className={`mt-2 text-2xl font-bold ${item.color}`}>{item.value}</p><p className="mt-1 text-[11px] text-slate-500">{item.detail}</p></div>)}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col items-center">
          <h3 className="w-full text-sm font-bold text-white">Overall accuracy</h3><p className="w-full text-xs text-slate-500 mt-1">Correct answers compared with attempted questions</p>
          <div className="relative w-40 h-40 my-5 rounded-full flex items-center justify-center" style={{background:`conic-gradient(#10b981 0 ${accuracy}%, #334155 ${accuracy}% 100%)`}}><div className="w-28 h-28 rounded-full bg-slate-900 flex flex-col items-center justify-center"><span className="text-3xl font-black text-white">{accuracy}%</span><span className="text-[10px] text-slate-500">Accuracy</span></div></div>
          <div className="flex flex-wrap justify-center gap-4 text-xs text-slate-400"><span className="flex items-center gap-2"><i className="w-2.5 h-2.5 rounded-full bg-emerald-500"/>Correct ~{correctCount}</span><span className="flex items-center gap-2"><i className="w-2.5 h-2.5 rounded-full bg-slate-600"/>Incorrect ~{Math.max(0,attempted-correctCount)}</span></div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col items-center">
          <h3 className="w-full text-sm font-bold text-white">Chapter distribution</h3><p className="w-full text-xs text-slate-500 mt-1">Share of tracked chapters by mastery level</p>
          <div className="w-40 h-40 my-5 rounded-full flex items-center justify-center" style={{background:`conic-gradient(#10b981 0 ${strongPct}%, #f59e0b ${strongPct}% ${moderatePct}%, #f43f5e ${moderatePct}% 100%)`}}><div className="w-28 h-28 rounded-full bg-slate-900 flex flex-col items-center justify-center"><span className="text-3xl font-black text-white">{analytics.chapterMastery.length}</span><span className="text-[10px] text-slate-500">Chapters</span></div></div><div className="flex flex-wrap justify-center gap-3 text-xs text-slate-400"><span className="flex items-center gap-1.5"><i className="w-2.5 h-2.5 rounded-full bg-emerald-500"/>Strong {analytics.strongChapters.length}</span><span className="flex items-center gap-1.5"><i className="w-2.5 h-2.5 rounded-full bg-amber-500"/>Moderate {analytics.moderateChapters.length}</span><span className="flex items-center gap-1.5"><i className="w-2.5 h-2.5 rounded-full bg-rose-500"/>Weak {analytics.weakChapters.length}</span></div>
        </div>
      </div>
      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-1"><Target className="w-4 h-4 text-indigo-400"/><h3 className="text-sm font-bold text-white">Chapter-wise performance</h3></div><p className="text-xs text-slate-500 mb-4">Use these results to decide what to revise next.</p>
        {analytics.chapterMastery.length ? <div className="flex flex-col gap-4">{analytics.chapterMastery.slice().sort((a,b)=>a.accuracy-b.accuracy).map(ch=><div key={`${ch.subject}-${ch.chapter}`}><div className="flex justify-between items-center gap-3 text-xs mb-1.5"><span className="text-slate-300 font-medium truncate">{ch.subject} · {ch.chapter}<span className="text-slate-500 ml-2">({ch.total} attempted)</span></span><span className="font-mono font-bold text-white">{ch.accuracy}%</span></div><div className="h-2.5 rounded-full bg-slate-800 overflow-hidden"><div className={`h-full rounded-full ${ch.status==='Strong'?'bg-emerald-500':ch.status==='Weak'?'bg-rose-500':'bg-amber-500'}`} style={{width:`${Math.max(0,Math.min(100,ch.accuracy))}%`}}/></div></div>)}</div>:<p className="text-xs text-slate-500">Chapter-level responses are not available yet.</p>}
      </section>
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4"><h3 className="text-sm font-bold text-rose-400">Needs practice</h3><p className="text-xs text-slate-400 mt-1">Chapters that need more revision.</p><p className="text-lg font-bold text-white mt-2">{analytics.weakChapters.length} chapters</p></div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4"><h3 className="text-sm font-bold text-amber-400">In progress</h3><p className="text-xs text-slate-400 mt-1">Chapters to keep improving.</p><p className="text-lg font-bold text-white mt-2">{analytics.moderateChapters.length} chapters</p></div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4"><h3 className="text-sm font-bold text-emerald-400">Strong zone</h3><p className="text-xs text-slate-400 mt-1">Chapters where you're doing well.</p><p className="text-lg font-bold text-white mt-2">{analytics.strongChapters.length} chapters</p></div>
      </section>
      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-5"><h3 className="text-sm font-bold text-white mb-4">Recent test history</h3><div className="overflow-x-auto"><table className="w-full text-xs text-left text-slate-300"><thead><tr className="border-b border-slate-800 text-slate-500"><th className="pb-3">Date</th><th className="pb-3">Questions</th><th className="pb-3">Duration</th><th className="pb-3 text-center">Score</th><th className="pb-3 text-right">Accuracy</th></tr></thead><tbody>{analytics.recentAttempts.map(at=><tr key={at.id} className="border-b border-slate-800/60 last:border-0"><td className="py-3 font-mono text-slate-400">{new Date(at.timestamp).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})}</td><td className="py-3">{at.questionCount} Questions</td><td className="py-3">{at.durationMinutes} mins</td><td className="py-3 text-center font-bold text-indigo-400">{at.score} / {at.totalPossibleScore}</td><td className="py-3 text-right font-mono font-bold text-emerald-400">{at.accuracy}%</td></tr>)}</tbody></table></div></section>
    </div>
  );
}