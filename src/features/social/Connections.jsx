import React from 'react';
import FriendList from './FriendList';

export default function Connections({ currentUser }) {
  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-indigo-400">Your Network</p>
        <h1 className="text-2xl font-black text-white mt-1">Connections</h1>
        <p className="text-sm text-slate-400 mt-1">
          Manage your friends, incoming requests, and discover other aspirants.
        </p>
      </div>

      <div className="max-w-2xl">
        <FriendList currentUser={currentUser} onSelectFriend={() => {}} />
      </div>
    </div>
  );
}
