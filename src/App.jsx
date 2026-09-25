import React, { useState, useEffect } from 'react';
import { APP_VERSION, APP_UPDATE_URL, APP_VERSION_URL } from './config/appVersion';
import { 
  BookOpen, 
  Users, 
  HelpCircle, 
  BarChart2, 
  MessageSquare, 
  LogIn, 
  Flame,
  Download
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
  const [updateRequired, setUpdateRequired] = useState(false);
  const [latestVersion, setLatestVersion] = useState(APP_VERSION);
  const [showAppDownload, setShowAppDownload] = useState(false);
  const isNativeAndroid = typeof window !== 'undefined' && (window.Capacitor?.getPlatform?.() === 'android' || (/Android/i.test(navigator.userAgent) && window.Capacitor?.isNativePlatform?.()));

  useEffect(() => {
    if (!isNativeAndroid) return;
    let cancelled = false;
    async function checkForRequiredUpdate() {
      try {
        const response = await fetch(APP_VERSION_URL + '?v=' + Date.now(), { cache: 'no-store' });
        if (!response.ok) return;
        const info = await response.json();
        const remoteVersion = String(info?.latestVersion || '').trim();
        const minimumVersion = String(info?.minimumVersion || remoteVersion).trim();
        if (!remoteVersion || cancelled) return;
        setLatestVersion(remoteVersion);
        const toParts = (version) => String(version).split('.').map((part) => Number.parseInt(part, 10) || 0);
        const compareVersions = (a, b) => {
          const aa = toParts(a);
          const bb = toParts(b);
          for (let i = 0; i < 3; i += 1) {
            if (aa[i] !== bb[i]) return aa[i] > bb[i] ? 1 : -1;
          }
          return 0;
        };
        if (compareVersions(APP_VERSION, minimumVersion) < 0) setUpdateRequired(true);
      } catch (error) {
        console.warn('PrepXAI update check failed:', error);
      }
    }
    checkForRequiredUpdate();
    return () => { cancelled = true; };
  }, [isNativeAndroid]);

  useEffect(() => {
    const isAndroidMobileWeb = typeof window !== 'undefined' && !isNativeAndroid && /Android/i.test(navigator.userAgent);
    if (!isAndroidMobileWeb) return;
    const timer = setTimeout(() => setShowAppDownload(true), 1200);
    return () => clearTimeout(timer);
  }, [isNativeAndroid]);

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

  const appDownloadPopup = showAppDownload ? (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-3xl border border-indigo-500/30 bg-slate-900 shadow-2xl shadow-indigo-950/50 overflow-hidden">
        <div className="p-6 text-center">
          <img src="/icon-192.png" alt="PrepXAI" className="mx-auto mb-4 w-16 h-16 rounded-2xl object-cover" />
          <h2 className="text-xl font-black text-white">Get PrepXAI on your phone</h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">Download the latest Android app for a faster, app-like study experience.</p>
          <a href={APP_UPDATE_URL} download="PrepXAI.apk" className="mt-5 w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 hover:bg-indigo-500 px-5 py-3.5 text-sm font-bold text-white transition shadow-lg shadow-indigo-600/20"><Download className="w-4 h-4" /> Download Android App</a>
          <button onClick={() => setShowAppDownload(false)} className="mt-3 w-full py-2 text-xs font-semibold text-slate-400 hover:text-white transition">Not now</button>
        </div>
      </div>
    </div>
  ) : null;

  const mandatoryUpdateScreen = updateRequired ? (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950 p-6 text-center">
      <div className="w-full max-w-md rounded-3xl border border-indigo-500/30 bg-slate-900 p-7 shadow-2xl">
        <img src="/icon-192.png" alt="PrepXAI" className="mx-auto mb-5 h-20 w-20 rounded-2xl object-cover" />
        <h2 className="text-2xl font-black text-white">Update PrepXAI</h2>
        <p className="mt-3 text-sm leading-6 text-slate-400">A newer version of PrepXAI is required to continue. Please update the app to keep using it.</p>
        <p className="mt-2 text-xs text-slate-500">Installed: {APP_VERSION} · Required: {latestVersion}</p>
        <a href={APP_UPDATE_URL} className="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-indigo-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/20">Update App</a>
      </div>
    </div>
  ) : null;

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

  if (isNativeAndroid && !currentUser) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 font-sans">
        <AuthModal isOpen={true} onClose={() => {}} onAuthSuccess={(u) => setCurrentUser(u)} />
      </div>
    );
  }

  return (
    <div className={`min-h-screen text-slate-100 flex flex-col font-sans transition-colors duration-300 ${isNeetInterface ? 'bg-slate-950 selection:bg-emerald-500 selection:text-white' : 'bg-slate-950 selection:bg-indigo-500 selection:text-white'}`}>
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between app-header-row">
          <div className="flex items-center gap-3 app-brand">
            <div className="w-10 h-10 rounded-xl overflow-hidden border border-indigo-500/30 shadow-lg shadow-indigo-500/20 app-brand-icon">
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-indigo-600 to-violet-500"><Flame className="w-6 h-6 text-white" /></div>
            </div>
            <div>
              <span className="font-black text-lg tracking-tight text-white flex items-center gap-1.5 app-brand-title">
                PrepXAI <span className={`text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full border ${examTheme.soft}`}>{feedExam}</span>
              </span>
              <p className="text-[10px] text-slate-400 font-medium app-brand-subtitle">Peer Study & CBT Simulator</p>
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

          <div className="flex items-center gap-2 header-actions">
            {!isNativeAndroid && <a href={APP_UPDATE_URL} download="PrepXAI.apk" className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-indigo-500/30 bg-indigo-600/10 text-indigo-200 hover:bg-indigo-600 hover:text-white transition text-xs font-bold" title="Download PrepXAI Android app">
              <Download className="w-4 h-4" /> Download App
            </a>}
            {currentUser ? (
              <>
                <button onClick={() => setActiveTab('connections')} className="connections-button flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-slate-700/80 bg-slate-900/80 text-slate-200 hover:bg-indigo-600 hover:border-indigo-500 hover:text-white transition shadow-sm" title="Open Connections">
                  <Users className="w-4 h-4" />
                  <span className="text-xs font-bold connections-label">Connections</span>
                </button>
                <div className="relative">
                  <button onClick={() => setShowProfile((value) => !value)} className="profile-button flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-indigo-500/30 bg-indigo-600/15 text-white hover:bg-indigo-600 hover:border-indigo-500 transition shadow-sm" title="Open Profile">
                    <div className="w-7 h-7 rounded-full bg-indigo-500/25 border border-indigo-400/30 flex items-center justify-center text-indigo-300 font-bold text-xs">
                      {(currentUser.username || 'A')[0].toUpperCase()}
                    </div>
                    <div className="text-left profile-details">
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

        <div className="mobile-nav flex md:hidden border-t border-slate-800/80 px-2 py-1.5 overflow-x-auto gap-1">
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

      <main className="app-main flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
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

      {mandatoryUpdateScreen}
      {appDownloadPopup}
    </div>
  );
}