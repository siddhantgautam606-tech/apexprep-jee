import React, { useState, useEffect } from 'react';
import { Search, UserPlus, Check, X, MessageSquare, Users, Loader2 } from 'lucide-react';
import {
  searchUsers,
  sendFriendRequest,
  respondToFriendRequest,
  getFriendsList,
  getPendingRequests,
  getFriendshipStatuses,
  subscribeToFriendships,
} from '../../services/socialService';

export default function FriendList({ currentUser, onSelectFriend, activeFriendId }) {
  const [friends, setFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [relationshipMap, setRelationshipMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [actionUserId, setActionUserId] = useState(null);

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

  const refreshSearchRelationships = async (users = searchResults) => {
    if (!currentUser || !users.length) {
      setRelationshipMap({});
      return;
    }

    try {
      const map = await getFriendshipStatuses(
        currentUser.id,
        users.map((user) => user.id)
      );
      setRelationshipMap(map);
    } catch (err) {
      console.error('Error loading friendship statuses:', err);
    }
  };

  useEffect(() => {
    loadSocialData();
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) return undefined;

    const channel = subscribeToFriendships(currentUser.id, async () => {
      await loadSocialData();
      await refreshSearchRelationships();
    });

    return () => {
      channel?.unsubscribe?.();
    };
  }, [currentUser]);

  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.trim().length < 4) {
      setSearchResults([]);
      setRelationshipMap({});
      return;
    }

    setSearchLoading(true);
    try {
      const results = await searchUsers(query, currentUser.id);
      setSearchResults(results);
      const map = await getFriendshipStatuses(
        currentUser.id,
        results.map((user) => user.id)
      );
      setRelationshipMap(map);
    } catch (err) {
      console.error('Search error:', err);
      setSearchResults([]);
      setRelationshipMap({});
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSendRequest = async (targetUserId) => {
    setActionUserId(targetUserId);
    try {
      await sendFriendRequest(currentUser.id, targetUserId);
      await loadSocialData();
      await refreshSearchRelationships();
    } catch (err) {
      console.error('Failed to send friend request:', err);
    } finally {
      setActionUserId(null);
    }
  };

  const handleRespond = async (friendshipId, status) => {
    try {
      await respondToFriendRequest(friendshipId, status);
      await loadSocialData();
      await refreshSearchRelationships();
    } catch (err) {
      console.error('Failed to respond to request:', err);
    }
  };

  const renderSearchAction = (user) => {
    const relationship = relationshipMap[user.id];
    const busy = actionUserId === user.id;

    if (busy) {
      return <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-400" />;
    }

    if (!relationship) {
      return (
        <button
          onClick={() => handleSendRequest(user.id)}
          className="flex items-center gap-1 rounded-md bg-blue-600 px-2 py-1 text-xs text-white hover:bg-blue-700"
        >
          <UserPlus className="h-3 w-3" /> Add Friend
        </button>
      );
    }

    if (relationship.status === 'accepted') {
      return (
        <span className="rounded-md bg-emerald-950/60 px-2 py-1 text-[10px] font-semibold text-emerald-400">
          Friends
        </span>
      );
    }

    if (relationship.status === 'pending' && relationship.direction === 'outgoing') {
      return (
        <span className="rounded-md bg-amber-950/60 px-2 py-1 text-[10px] font-semibold text-amber-400">
          Request Sent
        </span>
      );
    }

    if (relationship.status === 'pending' && relationship.direction === 'incoming') {
      return (
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleRespond(relationship.id, 'accepted')}
            className="rounded-md bg-emerald-600 px-2 py-1 text-[10px] font-semibold text-white hover:bg-emerald-700"
          >
            Accept
          </button>
          <button
            onClick={() => handleRespond(relationship.id, 'declined')}
            className="rounded-md bg-rose-600 px-2 py-1 text-[10px] font-semibold text-white hover:bg-rose-700"
          >
            Reject
          </button>
        </div>
      );
    }

    // A declined request remains visible and can be sent again.
    return (
      <button
        onClick={() => handleSendRequest(user.id)}
        className="flex items-center gap-1 rounded-md bg-blue-600 px-2 py-1 text-xs text-white hover:bg-blue-700"
      >
        <UserPlus className="h-3 w-3" /> Add Friend
      </button>
    );
  };

  return (
    <div className="flex min-h-[620px] h-full flex-col bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-4">
        <Users className="h-5 w-5 text-blue-600" />
        <h2 className="font-bold text-white">Study Network</h2>
      </div>

      {/* User Search Input */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Enter first 4 letters of username..."
          value={searchQuery}
          onChange={handleSearch}
          className="w-full rounded-xl border border-slate-800 bg-slate-950/70 py-2 pl-9 pr-4 text-sm focus:outline-hidden focus:border-blue-500 dark:text-white"
        />
      </div>

      {/* Search Results */}
      {searchQuery.trim().length >= 4 && (
        <div className="mb-4 rounded-xl border border-slate-800 bg-slate-950/50 p-2 space-y-2">
          <p className="text-[11px] font-semibold text-slate-400 uppercase px-2">Aspirants Found</p>
          {searchLoading ? (
            <div className="flex justify-center p-2">
              <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
            </div>
          ) : searchResults.length === 0 ? (
            <p className="text-xs text-slate-500 px-2">No users matching "{searchQuery}"</p>
          ) : (
            searchResults.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-900 shadow-lg">
                <div>
                  <p className="text-xs font-semibold dark:text-white">@{user.username}</p>
                  <span className="text-[10px] text-slate-400">{user.target_exam}</span>
                </div>
                {renderSearchAction(user)}
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
              <div key={req.id} className="flex items-center justify-between p-2 rounded-xl bg-amber-950/20 border border-amber-900/30">
                <div>
                  <p className="text-xs font-semibold dark:text-white">@{req.sender.username}</p>
                  <span className="text-[10px] text-slate-400">{req.sender.target_exam}</span>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleRespond(req.id, 'accepted')}
                    className="p-1 rounded-md bg-emerald-600 text-white hover:bg-emerald-700"
                    title="Accept request"
                  >
                    <Check className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleRespond(req.id, 'declined')}
                    className="p-1 rounded-md bg-rose-600 text-white hover:bg-rose-700"
                    title="Reject request"
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
                      ? 'bg-indigo-600/15 border border-indigo-500/30'
                      : 'hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-indigo-400">
                      {friend.username?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-white">@{friend.username}</p>
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
