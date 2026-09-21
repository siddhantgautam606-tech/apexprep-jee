import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  BookOpen,
  Layers,
  BarChart3,
  Users,
  MessageSquare,
  LogIn,
  LogOut,
  User as UserIcon,
} from 'lucide-react';
import QuestionPool from './features/question-pool/QuestionPool';
import TestOrganizer from './features/cbt/TestOrganizer';
import AnalyticsDashboard from './features/analytics/AnalyticsDashboard';
import AuthModal from './features/auth/AuthModal';
import CircleList from './features/circles/CircleList';
import FriendList from './features/social/FriendList';
import ChatWindow from './features/social/ChatWindow';
import { getCurrentUserProfile, signOutUser } from './services/authService';

export default function App() {
  const [activeTab, setActiveTab] = useState('pool');
  const [isTestActive, setIsTestActive] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [activeChatFriend, setActiveChatFriend] = useState(null);

  const fetchUser = async () => {
    try {
      const profile = await getCurrentUserProfile();
      setCurrentUser(profile);
    } catch {
      setCurrentUser(null);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const handleLogout = async () => {
    await signOutUser();
    setCurrentUser(null);
    setActiveChatFriend(null);
  };

  const navItems = [
    { id: 'pool', label: 'Question Pool', icon: BookOpen },
    { id: 'cbt', label: 'CBT Tests', icon: Layers },
    { id: 'analytics', label: 'Growth', icon: BarChart3 },
    { id: 'circles', label: 'Friend Circles', icon: Users },
    { id: 'chat', label: 'Chat', icon: MessageSquare },
  ];

  const handleTabChange = (targetTab) => {
    if (isTestActive && targetTab !== 'cbt') {
      const confirmLeave = window.confirm(
        'An active examination is in progress. Leaving this tab will submit your test or forfeit your attempt. Do you wish to leave?'
      );
      if (!confirmLeave) return;
      setIsTestActive(false);
    }
    setActiveTab(targetTab);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center p-3 md:p-6 font-sans">
      {/* Top Header */}
      <header className="w-full max-w-6xl flex flex-col sm:flex-row items-center justify-between pb-5 mb-6 border-b border-slate-800 gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2.5 rounded-xl shadow-lg shadow-indigo-600/30">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">ApexPrep</h1>
            <p className="text-xs text-slate-400">JEE & NEET CBT Exam System</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-xl overflow-x-auto max-w-full">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabChange(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
                {item.badge && (
                  <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded ml-1">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Auth Action */}
        <div className="flex items-center gap-2">
          {currentUser ? (
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 py-1.5 px-3 rounded-xl">
              <UserIcon className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-medium text-slate-200">@{currentUser.username}</span>
              <button
                onClick={handleLogout}
                title="Log Out"
                className="ml-1 p-1 hover:text-rose-400 transition"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsAuthOpen(true)}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium py-1.5 px-3.5 rounded-xl transition shadow"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Log In</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="w-full max-w-6xl flex justify-center">
        {activeTab === 'pool' && <QuestionPool currentUser={currentUser} />}
        {activeTab === 'cbt' && <TestOrganizer onExamActiveStateChange={setIsTestActive} />}
        {activeTab === 'analytics' && <AnalyticsDashboard />}

        {activeTab === 'chat' && (
          <div className="w-full h-[650px] grid grid-cols-1 md:grid-cols-3 gap-4">
            {!currentUser ? (
              <div className="md:col-span-3 flex flex-col items-center justify-center p-12 bg-slate-900/40 border border-slate-800 rounded-2xl text-center">
                <MessageSquare className="w-12 h-12 text-slate-600 mb-3" />
                <h3 className="text-base font-semibold text-slate-200">Log In to Chat</h3>
                <p className="text-xs text-slate-400 max-w-xs mt-1 mb-4">
                  Connect with peer aspirants, build study partnerships, and discuss problems in real time.
                </p>
                <button
                  onClick={() => setIsAuthOpen(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold py-2 px-4 rounded-xl transition"
                >
                  Sign In / Create Account
                </button>
              </div>
            ) : (
              <>
                <div className="md:col-span-1 h-full">
                  <FriendList
                    currentUser={currentUser}
                    onSelectFriend={(friend) => setActiveChatFriend(friend)}
                    activeFriendId={activeChatFriend?.id}
                  />
                </div>
                <div className="md:col-span-2 h-full">
                  {activeChatFriend ? (
                    <ChatWindow
                      currentUser={currentUser}
                      activeFriend={activeChatFriend}
                      onClose={() => setActiveChatFriend(null)}
                    />
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center bg-slate-900/40 border border-slate-800 rounded-2xl p-6 text-center text-slate-500 text-sm">
                      <MessageSquare className="w-10 h-10 text-slate-600 mb-2" />
                      Select a friend from your Study Network to start chatting
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'social' && (
          <div className="w-full flex-1 flex flex-col min-h-[calc(100vh-100px)]">
            <ChatWindow currentUser={currentUser || user} />
          </div>
        )}
        <CircleList
  currentUser={user}
/>
        )}
      </main>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={fetchUser}
      />
    </div>
  );
}