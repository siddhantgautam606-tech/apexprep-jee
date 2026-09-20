import React, { useState, useEffect } from 'react';
import { 
  Users, Clock, BrainCircuit, BarChart2, 
  ArrowRight, LogOut, User, Lock, Mail, Database, MessageSquare, AtSign 
} from 'lucide-react';
import { QUESTIONS_POOL } from './data/questionsPool';

// Standalone Feature Components
import FriendCircleSection from './components/FriendCircleSection.jsx';
import FriendChatSection from './components/FriendChatSection.jsx';
import CbtTestSection from './components/CbtTestSection.jsx';

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('apex_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [authMode, setAuthMode] = useState('login');
  const [authUsername, setAuthUsername] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authExam, setAuthExam] = useState('JEE Main');
  const [authClass, setAuthClass] = useState('Class 11');
  const [authError, setAuthError] = useState('');

  // Primary Navigation Tabs: 'circle' | 'chat' | 'test' | 'pool' | 'growth'
  const [activeTab, setActiveTab] = useState('circle');

  // Test History / Scorecards
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('apex_drill_history');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('apex_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('apex_current_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('apex_drill_history', JSON.stringify(history));
  }, [history]);

  const handleRecordScore = (record) => {
    setHistory(prev => [record, ...prev]);
  };

  const handleAuthSubmit = (e) => {
    e.preventDefault();
    setAuthError('');
    if (!authUsername.trim()) {
      setAuthError('Please enter your username.');
      return;
    }
    if (!authPassword) {
      setAuthError('Please enter your password.');
      return;
    }

    const cleanUsername = authUsername.trim().toLowerCase().replace(/\s+/g, '_');

    setCurrentUser({
      username: cleanUsername,
      name: authMode === 'signup' && authName ? authName : cleanUsername,
      email: authEmail || `${cleanUsername}@apexprep.io`,
      targetExam: authExam,
      targetClass: authClass,
    });
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('apex_current_user');
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 text-slate-100 font-sans">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-8 relative overflow-hidden">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-500/25 mb-3">
              <BrainCircuit className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white">ApexPrep AI</h1>
            <p className="text-xs text-slate-400 mt-1">JEE Social Study Network & CBT Testing</p>
          </div>

          <div className="flex bg-slate-800/80 p-1 rounded-xl mb-6 border border-slate-700/50">
            <button
              type="button"
              onClick={() => { setAuthMode('login'); setAuthError(''); }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                authMode === 'login' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Log In
            </button>
            <button
              type="button"
              onClick={() => { setAuthMode('signup'); setAuthError(''); }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                authMode === 'signup' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign Up
            </button>
          </div>

          {authError && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl text-center">
              {authError}
            </div>
          )}

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1.5">Username (Used for Friend Circle & Chat)</label>
              <div className="relative">
                <AtSign className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  placeholder="e.g. topper_ankit"
                  value={authUsername}
                  onChange={(e) => setAuthUsername(e.target.value)}
                  className="w-full bg-slate-800/60 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {authMode === 'signup' && (
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1.5">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    placeholder="Ankit Sharma"
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                    className="w-full bg-slate-800/60 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  className="w-full bg-slate-800/60 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1.5">Target Exam</label>
                <select
                  value={authExam}
                  onChange={(e) => setAuthExam(e.target.value)}
                  className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="JEE Main">JEE Main</option>
                  <option value="JEE Advanced">JEE Advanced</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1.5">Target Class</label>
                <select
                  value={authClass}
                  onChange={(e) => setAuthClass(e.target.value)}
                  className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="Class 11">Class 11</option>
                  <option value="Class 12">Class 12</option>
                  <option value="Dropper">Dropper</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition text-sm"
            >
              <span>{authMode === 'login' ? 'Sign In to Portal' : 'Create Profile'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="border-b border-slate-800 bg-slate-900/80 sticky top-0 z-30 px-6 py-3.5 backdrop-blur flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-xl text-white shadow-md shadow-blue-600/30">
            <BrainCircuit className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-base leading-tight text-white">ApexPrep JEE</h1>
            <p className="text-xs text-slate-400">
              @{currentUser.username} • <span className="text-blue-400 font-medium">{currentUser.name}</span>
            </p>
          </div>
        </div>

        {/* Center Navigation: Friend Circle, Chat, CBT Tests, Pool, Scorecards */}
        <div className="flex gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60">
          <button
            onClick={() => setActiveTab('circle')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'circle' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" /> Friend Circle
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'chat' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" /> Chat
          </button>
          <button
            onClick={() => setActiveTab('test')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'test' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" /> CBT Tests
          </button>
          <button
            onClick={() => setActiveTab('pool')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'pool' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Database className="w-3.5 h-3.5" /> Question Pool
          </button>
          <button
            onClick={() => setActiveTab('growth')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'growth' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" /> Scorecards
          </button>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-rose-400 bg-slate-800/60 hover:bg-rose-500/10 border border-slate-700/80 px-3 py-2 rounded-xl transition"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-6">
        {/* TAB 1: FRIEND CIRCLE (Tests & Rankings) */}
        {activeTab === 'circle' && (
          <FriendCircleSection 
            currentUser={currentUser} 
            onStartCircleTest={() => setActiveTab('test')} 
          />
        )}

        {/* TAB 2: SEPARATE CHAT & FRIENDS */}
        {activeTab === 'chat' && (
          <FriendChatSection currentUser={currentUser} />
        )}

        {/* TAB 3: CBT TEST SECTION */}
        {activeTab === 'test' && (
          <CbtTestSection onRecordScore={handleRecordScore} />
        )}

        {/* TAB 4: QUESTION POOL */}
        {activeTab === 'pool' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
            <h2 className="text-lg font-bold text-white mb-4">Question Pool Master Archive</h2>
            <div className="space-y-3">
              {QUESTIONS_POOL.map(q => (
                <div key={q.id} className="bg-slate-800/40 border border-slate-800 p-4 rounded-2xl">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-blue-400">{q.yearTag}</span>
                    <span className="text-[11px] text-slate-500 uppercase">{q.subjectId}</span>
                  </div>
                  <p className="text-xs text-slate-200">{q.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: SCORECARDS / GROWTH */}
        {activeTab === 'growth' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
            <h3 className="text-base font-bold text-white mb-4">Test History & Performance Log</h3>
            {history.length === 0 ? (
              <p className="text-center py-8 text-slate-500 text-xs">No CBT tests completed yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="border-b border-slate-800 text-slate-400 uppercase">
                    <tr>
                      <th className="py-2.5">Topic / Mock</th>
                      <th className="py-2.5">Score</th>
                      <th className="py-2.5">Accuracy</th>
                      <th className="py-2.5">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {history.map((h, i) => (
                      <tr key={i}>
                        <td className="py-3 font-medium text-white">{h.subtopicTitle}</td>
                        <td className="py-3 font-mono">{h.score} / {h.totalPossible}</td>
                        <td className="py-3 font-semibold text-blue-400">{h.accuracy}%</td>
                        <td className="py-3 text-slate-500">{h.timestamp}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}