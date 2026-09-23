import React from 'react';
import { User, Users, Mail, GraduationCap, X, LogOut } from 'lucide-react';

export default function ProfilePanel({
  currentUser,
  onClose,
  onConnections,
  onSignOut
}) {
  if (!currentUser) return null;

  return (
    <div className="absolute right-0 top-full mt-3 w-80 rounded-2xl border border-slate-800 bg-slate-900/95 backdrop-blur-xl shadow-2xl shadow-black/30 overflow-hidden z-50">
      <div className="p-5 border-b border-slate-800">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold">
              {(currentUser.username || 'A')[0].toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-white truncate">@{currentUser.username || 'Aspirant'}</p>
              <p className="text-[11px] text-indigo-400">{currentUser.target_exam || 'JEE Main'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition"
            aria-label="Close profile"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="p-3 space-y-1">
        <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-slate-950/50">
          <User className="w-4 h-4 text-indigo-400 shrink-0" />
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-wider text-slate-500">Username</p>
            <p className="text-xs font-semibold text-slate-200 truncate">@{currentUser.username || 'Aspirant'}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-slate-950/50">
          <Mail className="w-4 h-4 text-indigo-400 shrink-0" />
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-wider text-slate-500">Registered Email</p>
            <p className="text-xs font-semibold text-slate-200 truncate">{currentUser.email || 'Not available'}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-slate-950/50">
          <GraduationCap className="w-4 h-4 text-indigo-400 shrink-0" />
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-wider text-slate-500">Target Exam</p>
            <p className="text-xs font-semibold text-slate-200">{currentUser.target_exam || 'JEE Main'}</p>
          </div>
        </div>
      </div>

      <div className="p-3 pt-1 border-t border-slate-800 space-y-1">
        <button
          onClick={onConnections}
          className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left text-xs font-semibold text-slate-200 hover:bg-indigo-600/15 hover:text-white transition"
        >
          <Users className="w-4 h-4 text-indigo-400" />
          Connections
        </button>

        <button
          onClick={onSignOut}
          className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left text-xs font-semibold text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
