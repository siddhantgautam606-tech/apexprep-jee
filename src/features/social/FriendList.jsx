import React, { useState, useEffect } from 'react';
import { Search, UserPlus, Check, X, MessageSquare, Users, Loader2 } from 'lucide-react';
import {
  searchUsers,
  sendFriendRequest,
  respondToFriendRequest,
  getFriendsList,
  getPendingRequests,
} from '../../services/socialService';

export default function FriendList({ currentUser, onSelectFriend, activeFriendId }) {
  const [friends, setFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);

  const loadSocialData = async () => {
    if (!currentUser) return;
    try {
      const [friendsData, requestsData] = await Promise.all([
        getFriendsList(currentUser.id),
        getPendingRequests(currentUser.id),
      ]);
      setFriends(friendsData);
      setPendingRequests(requestsData);
    } catch (err) {
      console.error('Error loading friends data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSocialData();
  }, [currentUser]);

  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    try {
      const results = await searchUsers(query, currentUser.id);
      setSearchResults(results);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSendRequest = async (targetUserId) => {
    try {
      await sendFriendRequest(currentUser.id, targetUserId);
      setSearchResults((prev) => prev.filter((u) => u.id !== targetUserId));
    } catch (err) {
      console.error('Failed to send friend request:', err);
    }
  };

  const handleRespond = async (friendshipId, status) => {
    try {
      await respondToFriendRequest(friendshipId, status);
      await loadSocialData();
    } catch (err) {
      console.error('Failed to respond to request:', err);
    }
  };

  return (
    <div className="flex h-full flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-4">
        <Users className="h-5 w-5 text-blue-600" />
        <h2 className="font-bold text-slate-800 dark:text-white">Study Network</h2>
      </div>

      {/* User Search Input */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search aspirants..."
          value={searchQuery}
          onChange={handleSearch}
          className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 py-2 pl-9 pr-4 text-sm focus:outline-hidden focus:border-blue-500 dark:text-white"
        />
      </div>

      {/* Search Results Dropdown / Panel */}
      {searchQuery.trim().length >= 2 && (
        <div className="mb-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 p-2 space-y-2">
          <p className="text-[11px] font-semibold text-slate-400 uppercase px-2">Aspirants Found</p>
          {searchLoading ? (
            <div className="flex justify-center p-2">
              <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
            </div>
          ) : searchResults.length === 0 ? (
            <p className="text-xs text-slate-500 px-2">No users matching "{searchQuery}"</p>
          ) : (
            searchResults.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-slate-900 shadow-2xs">
                <div>
                  <p className="text-xs font-semibold dark:text-white">@{user.username}</p>
                  <span className="text-[10px] text-slate-400">{user.target_exam}</span>
                </div>
                <button
                  onClick={() => handleSendRequest(user.id)}
                  className="flex items-center gap-1 rounded-md bg-blue-600 px-2 py-1 text-xs text-white hover:bg-blue-700"
                >
                  <UserPlus className="h-3 w-3" /> Connect
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <div className="mb-4">
          <p className="text-[11px] font-semibold uppercase text-amber-500 tracking-wider mb-2">
            Pending Requests ({pendingRequests.length})
          </p>
          <div className="space-y-2">
            {pendingRequests.map((req) => (
              <div key={req.id} className="flex items-center justify-between p-2 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30">
                <div>
                  <p className="text-xs font-semibold dark:text-white">@{req.sender.username}</p>
                  <span className="text-[10px] text-slate-400">{req.sender.target_exam}</span>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleRespond(req.id, 'accepted')}
                    className="p-1 rounded-md bg-emerald-600 text-white hover:bg-emerald-700"
                  >
                    <Check className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleRespond(req.id, 'declined')}
                    className="p-1 rounded-md bg-rose-600 text-white hover:bg-rose-700"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Friends List */}
      <div className="flex-1 overflow-y-auto">
        <p className="text-[11px] font-semibold uppercase text-slate-400 tracking-wider mb-2">
          Study Partners ({friends.length})
        </p>

        {loading ? (
          <div className="flex justify-center p-4">
            <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
          </div>
        ) : friends.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-400">
            No friends connected yet. Use search above to find study partners!
          </div>
        ) : (
          <div className="space-y-1">
            {friends.map((friend) => {
              const isActive = activeFriendId === friend.id;
              return (
                <button
                  key={friend.id}
                  onClick={() => onSelectFriend(friend)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-bold text-xs text-slate-600 dark:text-slate-300">
                      {friend.username?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-800 dark:text-white">@{friend.username}</p>
                      <span className="text-[10px] text-slate-400">{friend.target_exam || 'JEE Main'}</span>
                    </div>
                  </div>
                  <MessageSquare className="h-4 w-4 text-slate-400" />
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}