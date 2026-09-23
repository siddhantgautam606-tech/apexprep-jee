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
import AnalyticsDashboard from './features/analytics/AnalyticsDashboard';
import ChatWindow from './features/social/ChatWindow';
import AuthModal from './features/auth/AuthModal';
import ProfilePanel from './features/auth/ProfilePanel';
import Connections from './features/social/Connections';

import { supabase } from './services/supabaseClient';
import { getCurrentUser, signOutUser } from './services/authService';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('cbt'); // 'cbt', 'circles', 'pool', 'analytics', 'chat', 'connections'
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  
  // Dedicated state for active circle test taking
  const [activeCircleTest, setActiveCircleTest] = useState(null);

  useEffect(() => {
    async function checkAuth() {
      const user = await getCurrentUser();
      setCurrentUser(user);
    }
    checkAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const user = await getCurrentUser();
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    await signOutUser();
    setCurrentUser(null);
  };

  // Launch test runner directly for a Circle mock test
  const handleLaunchCircleTest = (testRecord) => {
    if (!testRecord) return;
    
    const formattedQuestions = Array.isArray(testRecord.questions)
      ? testRecord.questions
      : [];

    setActiveCircleTest({
      id: testRecord.id,
      title: testRecord.title || 'Circle Mock Test',
      subject: testRecord.subject || 'All',
      chapter: testRecord.chapter || 'All',
      durationMinutes: Number(testRecord.duration_minutes) || 60,
      questions: formattedQuestions,
      circleId: testRecord.circle_id
    });
  };

  // If a Circle Test is being taken, show TestRunner full screen
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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Navigation Header */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <Flame className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="font-black text-lg tracking-tight text-white flex items-center gap-1.5">
                PrepXAI <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">CBT</span>
              </span>
              <p className="text-[10px] text-slate-400 font-medium">Peer Study & CBT Simulator</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-950/60 p-1.5 rounded-2xl border border-slate-800/80">
            {[
              { id: 'cbt', label: 'Practice CBT', icon: BookOpen },
              { id: 'circles', label: 'Study Circles', icon: Users },
              { id: 'pool', label: 'Question Pool', icon: HelpCircle },
              { id: 'analytics', label: 'Analytics', icon: BarChart2 },
              { id: 'chat', label: 'Chat', icon: MessageSquare }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                    isActive 
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>

          {/* User Profile / Auth Button */}
          <div className="flex items-center gap-3">
            {currentUser ? (
              <div className="relative flex items-center gap-3">
                <button
                  onClick={() => setShowProfile((value) => !value)}
                  className="flex flex-col text-right rounded-xl px-2 py-1 hover:bg-slate-800/70 transition"
                  title="Open Profile"
                >
                  <span className="text-xs font-bold text-white">{currentUser.username || 'Aspirant'}</span>
                  <span className="text-[10px] text-indigo-400 font-medium">Profile</span>
                </button>
                {showProfile && (
                  <ProfilePanel
                    currentUser={currentUser}
                    onClose={() => setShowProfile(false)}
                    onConnections={() => {
                      setActiveTab('connections');
                      setShowProfile(false);
                    }}
                    onSignOut={handleSignOut}
                  />
                )}
              </div>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition shadow-lg shadow-indigo-600/20"
              >
                <LogIn className="w-4 h-4" /> Sign In / Sign Up
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="flex md:hidden border-t border-slate-800/80 px-2 py-1.5 overflow-x-auto gap-1">
          {[
            { id: 'cbt', label: 'CBT', icon: BookOpen },
            { id: 'circles', label: 'Circles', icon: Users },
            { id: 'pool', label: 'Pool', icon: HelpCircle },
            { id: 'analytics', label: 'Analytics', icon: BarChart2 },
            { id: 'chat', label: 'Chat', icon: MessageSquare }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${
                  isActive ? 'bg-indigo-600 text-white' : 'text-slate-400'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === 'cbt' && <TestOrganizer currentUser={currentUser} />}

        {activeTab === 'circles' && (
          <CircleList
            currentUser={currentUser}
            onSelectTestToTake={handleLaunchCircleTest}
          />
        )}

        {activeTab === 'pool' && <QuestionPool currentUser={currentUser} />}

        {activeTab === 'analytics' && <AnalyticsDashboard currentUser={currentUser} />}

        {activeTab === 'chat' && (
          <ChatWindow currentUser={currentUser} />
        )}

        {activeTab === 'connections' && (
          <Connections currentUser={currentUser} />
        )}
      </main>

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onAuthSuccess={(u) => {
            setCurrentUser(u);
            setShowAuthModal(false);
          }}
        />
      )}
    </div>
  );
}