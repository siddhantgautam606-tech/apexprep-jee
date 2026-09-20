import React, { useState } from 'react';
import { Sparkles, BookOpen, Layers, BarChart3, Users, MessageSquare } from 'lucide-react';
import QuestionPool from './features/question-pool/QuestionPool';
import TestOrganizer from './features/cbt/TestOrganizer';

export default function App() {
  const [activeTab, setActiveTab] = useState('pool');

  const navItems = [
    { id: 'pool', label: 'Question Pool', icon: BookOpen },
    { id: 'cbt', label: 'CBT Tests', icon: Layers },
    { id: 'analytics', label: 'Growth', icon: BarChart3, badge: 'Next' },
    { id: 'circles', label: 'Friend Circles', icon: Users, badge: 'Next' },
    { id: 'chat', label: 'Chat', icon: MessageSquare, badge: 'Next' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center p-3 md:p-6 font-sans">
      {/* Top Navbar */}
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
                onClick={() => setActiveTab(item.id)}
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
      </header>

      {/* Main Content Area */}
      <main className="w-full max-w-6xl flex justify-center">
        {activeTab === 'pool' && <QuestionPool />}
        {activeTab === 'cbt' && <TestOrganizer />}
        {activeTab !== 'pool' && activeTab !== 'cbt' && (
          <div className="p-16 text-center text-slate-500 bg-slate-900/40 border border-slate-800 rounded-2xl text-sm w-full">
            Module under construction. Coming in the next step!
          </div>
        )}
      </main>
    </div>
  );
}