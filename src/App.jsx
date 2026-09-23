import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Users, 
  HelpCircle, 
  BarChart2, 
  MessageSquare, 
  LogIn, 
  Flame
} from 'lucide-react';

import CircleList from './features/circles/CircleList';
import QuestionPool from './features/question-pool/QuestionPool';
import TestOrganizer from './features/cbt/TestOrganizer';
import TestRunner from './features/cbt/TestRunner';
import PYQSession from './features/question-pool/PYQSession';
import AnalyticsDashboard from './features/analytics/AnalyticsDashboard';
import ChatWindow from './features/social/ChatWindow';
import AuthModal from './features/auth/AuthModal';
import ProfilePanel from './features/auth/ProfilePanel';
import Connections from './features/social/Connections';

import { supabase } from './services/supabaseClient';
import { getCurrentUser, signOutUser } from './services/authService';
import { clearTestHistory } from './services/analyticsService';
import { EXAM_OPTIONS, normalizeExam } from './config/examConfig';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [activeTab, setActiveTab] = useState('cbt');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [developerExamOverride, setDeveloperExamOverride] = useState(null);
  const [activeCircleTest, setActiveCircleTest] = useState(null);
  const [activePYQTest, setActivePYQTest] = useState(null);
  const [activePYQSession, setActivePYQSession] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function checkAuth() {
      const user = await getCurrentUser();
      if (!mounted) return;
      setCurrentUser(user);
      if (user?.is_admin) setDeveloperExamOverride(localStorage.getItem('apexprep_dev_exam') || null);
      if (!user) clearTestHistory();
      setAuthChecked(true);
    }
    checkAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;

      if (event === 'SIGNED_OUT' || !session?.user) {
        setCurrentUser(null);
        clearTestHistory();
        setShowProfile(false);
        setShowAuthModal(false);
        return;
      }

      setTimeout(async () => {
        if (!mounted) return;
        const user = await getCurrentUser();
        if (!mounted) return;

        if (user) {
          setCurrentUser(user);
          setShowAuthModal(false);
          if (user.is_admin) {
            setDeveloperExamOverride(localStorage.getItem('apexprep_dev_exam') || null);
          }
        } else {
          setCurrentUser(null);
          clearTestHistory();
          setShowProfile(false);
        }
      }, 0);
    });

    return () => {
      mounted = false;
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const feedExam = normalizeExam(developerExamOverride || currentUser?.target_exam);
  const isNeetInterface = feedExam === 'NEET';
  const examTheme = isNeetInterface
    ? { accent: 'emerald', gradient: 'from-emerald-600 to-teal-500', soft: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' }
    : { accent: 'indigo', gradient: 'from-indigo-600 to-violet-500', soft: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300' };

  const handleDeveloperExamChange = (exam) => {
    const next = exam === 'ACCOUNT' ? null : normalizeExam(exam);
    setDeveloperExamOverride(next);
    if (next) localStorage.setItem('apexprep_dev_exam', next);
    else localStorage.removeItem('apexprep_dev_exam');
  };

  const handleSignOut = async () => {
    await signOutUser();
    setCurrentUser(null);
    setShowProfile(false);
  };

  const handleLaunchCircleTest = (testRecord) => {
    if (!testRecord) return;

    setActiveCircleTest({
      id: testRecord.id,
      title: testRecord.title || 'Circle Mock Test',
      exam: testRecord.exam || normalizeExam(currentUser?.target_exam),
      subject: testRecord.subject || 'All',
      chapter: testRecord.chapter || 'All',
      durationMinutes: Number(testRecord.duration_minutes) || 60,
      questions: Array.isArray(testRecord.questions) ? testRecord.questions : [],
      circleId: testRecord.circle_id
    });
  };

  const handleLaunchPYQPractice = (questions, subject = 'All') => {
    if (!Array.isArray(questions) || questions.length === 0) return;
    setActivePYQSession({
      id: `pyq-session-${Date.now()}`,
      title: `${feedExam} PYQS Session`,
      exam: feedExam,
      subject,
      questions
    });
  };

  if (activeCircleTest) {
    return (
      <TestRunner
        test={activeCircleTest}
        currentUser={currentUser}
        onComplete={() => setActiveCircleTest(null)}
        onExit={() => setActiveCircleTest(null)}
      />
    );
  }

  if (activePYQSession) {
    return (
      <PYQSession
        session={activePYQSession}
        currentUser={currentUser}
        onExit={() => setActivePYQSession(null)}
      />
    );
  }

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center font-sans">
        <div className="text-center">
          <div className="w-10 h-10 mx-auto mb-4 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <Flame className="w-6 h-6 text-white" />
          </div>
          <p className="text-sm text-slate-400">Checking your session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen text-slate-100 flex flex-col font-sans transition-colors duration-300 ${isNeetInterface ? 'bg-slate-950 selection:bg-emerald-500 selection:text-white' : 'bg-slate-950 selection:bg-indigo-500 selection:text-white'}`}>
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${examTheme.gradient} flex items-center justify-center shadow-lg shadow-indigo-500/20`}>
              <Flame className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="font-black text-lg tracking-tight text-white flex items-center gap-1.5">
                PrepXAI <span className={`text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full border ${examTheme.soft}`}>{feedExam}</span>
              </span>
              <p className="text-[10px] text-slate-400 font-medium">Peer Study & CBT Simulator</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-1 bg-slate-950/60 p-1.5 rounded-2xl border border-slate-800/80">
            {[
              { id: 'cbt', label: 'Practice CBT', icon: BookOpen },
              { id: 'circles', label: 'Study Circles', icon: Users },
              { id: 'pool', label: 'PYQS', icon: HelpCircle },
              { id: 'analytics', label: 'Analytics', icon: BarChart2 },
              { id: 'chat', label: 'Chat', icon: MessageSquare }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${isActive ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'}`}>
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>

          {currentUser?.is_admin && (
            <div className="hidden xl:flex items-center gap-2 mr-2 px-2 py-1.5 rounded-xl border border-slate-800 bg-slate-950/70">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Preview</span>
              <select value={developerExamOverride || 'ACCOUNT'} onChange={(e) => handleDeveloperExamChange(e.target.value)}
                className="bg-transparent text-xs font-semibold text-white outline-none cursor-pointer" title="Preview another exam interface (admin only)">
                <option value="ACCOUNT">My Account</option>
                {EXAM_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
            </div>
          )}

          <div className="flex items-center gap-2">
            {currentUser ? (
              <>
                <button onClick={() => setActiveTab('connections')} className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-slate-700/80 bg-slate-900/80 text-slate-200 hover:bg-indigo-600 hover:border-indigo-500 hover:text-white transition shadow-sm" title="Open Connections">
                  <Users className="w-4 h-4" />
                  <span className="text-xs font-bold">Connections</span>
                </button>
                <div className="relative">
                  <button onClick={() => setShowProfile((value) => !value)} className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-indigo-500/30 bg-indigo-600/15 text-white hover:bg-indigo-600 hover:border-indigo-500 transition shadow-sm" title="Open Profile">
                    <div className="w-7 h-7 rounded-full bg-indigo-500/25 border border-indigo-400/30 flex items-center justify-center text-indigo-300 font-bold text-xs">
                      {(currentUser.username || 'A')[0].toUpperCase()}
                    </div>
                    <div className="text-left">
                      <span className="block text-xs font-bold">{currentUser.username || 'Aspirant'}</span>
                      <span className="block text-[10px] text-indigo-300">{feedExam} • Profile</span>
                    </div>
                  </button>
                  {showProfile && (
                    <ProfilePanel currentUser={currentUser} onClose={() => setShowProfile(false)}
                      onConnections={() => { setActiveTab('connections'); setShowProfile(false); }} onSignOut={handleSignOut} />
                  )}
                </div>
              </>
            ) : (
              <button onClick={() => setShowAuthModal(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition shadow-lg shadow-indigo-600/20">
                <LogIn className="w-4 h-4" /> Sign In / Sign Up
              </button>
            )}
          </div>
        </div>

        <div className="flex md:hidden border-t border-slate-800/80 px-2 py-1.5 overflow-x-auto gap-1">
          {[
            { id: 'cbt', label: 'CBT', icon: BookOpen },
            { id: 'circles', label: 'Circles', icon: Users },
            { id: 'pool', label: 'PYQS', icon: HelpCircle },
            { id: 'analytics', label: 'Analytics', icon: BarChart2 },
            { id: 'chat', label: 'Chat', icon: MessageSquare }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${isActive ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === 'cbt' && <TestOrganizer currentUser={currentUser} feedExam={feedExam} />}
        {activeTab === 'circles' && <CircleList currentUser={currentUser} feedExam={feedExam} onSelectTestToTake={handleLaunchCircleTest} />}
        {activeTab === 'pool' && <QuestionPool currentUser={currentUser} feedExam={feedExam} onStartPractice={handleLaunchPYQPractice} />}
        {activeTab === 'analytics' && <AnalyticsDashboard currentUser={currentUser} />}
        {activeTab === 'chat' && <ChatWindow currentUser={currentUser} />}
        {activeTab === 'connections' && <Connections currentUser={currentUser} />}
      </main>

      {showAuthModal && (
        <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)}
          onAuthSuccess={(u) => { setCurrentUser(u); setShowAuthModal(false); }} />
      )}
    </div>
  );
}