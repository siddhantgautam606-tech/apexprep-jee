import React, { useState, useEffect } from 'react';
import { 
  Users, UserPlus, MessageSquare, Send, Calendar, 
  Clock, Share2, ShieldCheck, Check, X, Bell, UserCheck
} from 'lucide-react';
import { QUESTIONS_POOL } from '../data/questionsPool';

const DEFAULT_FRIENDS = [
  { username: 'rohan_iitb', name: 'Rohan Verma', targetExam: 'JEE Advanced', status: 'Online' },
  { username: 'priya_phy', name: 'Priya Patel', targetExam: 'JEE Main', status: 'In Practice' }
];

export default function FriendChatSection({ currentUser }) {
  // Navigation inside chat: 'messages' | 'applications'
  const [chatTab, setChatTab] = useState('messages');

  const [friends, setFriends] = useState(() => {
    const saved = localStorage.getItem(`apex_friends_${currentUser.username}`);
    return saved ? JSON.parse(saved) : DEFAULT_FRIENDS;
  });

  const [activeFriend, setActiveFriend] = useState(friends[0] || null);
  const [friendSearch, setFriendSearch] = useState('');
  const [requestNotice, setRequestNotice] = useState('');

  // Unified Applications inbox: Circle Join Requests + Personal Friend Requests
  const appKey = `apex_inbox_applications_${currentUser.username}`;
  const [applications, setApplications] = useState(() => {
    const saved = localStorage.getItem(appKey);
    return saved ? JSON.parse(saved) : [
      {
        id: 'req-demo-friend-1',
        type: 'friend_request', // 'friend_request' or 'circle_join'
        senderUsername: 'math_wizard',
        senderName: 'Aarav Sharma',
        senderExam: 'JEE Main',
        senderClass: 'Class 12',
        requestedAt: '12 mins ago'
      },
      {
        id: 'req-demo-circle-1',
        type: 'circle_join',
        circleId: 'circle-1',
        circleName: 'Top 100 IIT Bombay Dreamers',
        senderUsername: 'ankit_99',
        senderName: 'Ankit Gupta',
        senderExam: 'JEE Main',
        senderClass: 'Dropper',
        requestedAt: '35 mins ago'
      }
    ];
  });

  // Chat message map keyed by recipient username
  const [chatThreads, setChatThreads] = useState(() => {
    const saved = localStorage.getItem(`apex_chats_${currentUser.username}`);
    return saved ? JSON.parse(saved) : {
      'rohan_iitb': [
        { id: 1, sender: 'rohan_iitb', text: 'Hey! Schedule a 20m Kinematics test tonight?', timestamp: '08:15 PM' }
      ]
    };
  });

  const [messageInput, setMessageInput] = useState('');

  useEffect(() => {
    localStorage.setItem(appKey, JSON.stringify(applications));
  }, [applications, appKey]);

  useEffect(() => {
    localStorage.setItem(`apex_friends_${currentUser.username}`, JSON.stringify(friends));
  }, [friends, currentUser.username]);

  useEffect(() => {
    localStorage.setItem(`apex_chats_${currentUser.username}`, JSON.stringify(chatThreads));
  }, [chatThreads, currentUser.username]);

  // SEND A FRIEND REQUEST (Goes to recipient's Applications Inbox)
  const handleSendFriendRequest = (e) => {
    e.preventDefault();
    setRequestNotice('');
    const targetUser = friendSearch.trim().toLowerCase().replace(/\s+/g, '_');

    if (!targetUser) return;
    if (targetUser === currentUser.username.toLowerCase()) {
      setRequestNotice('You cannot send a request to yourself.');
      return;
    }
    if (friends.some(f => f.username.toLowerCase() === targetUser)) {
      setRequestNotice('Already in your authorized friends list.');
      return;
    }

    // Load recipient's application inbox
    const recipientKey = `apex_inbox_applications_${targetUser}`;
    const recipientInbox = JSON.parse(localStorage.getItem(recipientKey) || '[]');

    if (recipientInbox.some(a => a.type === 'friend_request' && a.senderUsername === currentUser.username)) {
      setRequestNotice(`Friend request to @${targetUser} is already pending.`);
      return;
    }

    const newRequest = {
      id: `freq-${Date.now()}`,
      type: 'friend_request',
      senderUsername: currentUser.username,
      senderName: currentUser.name,
      senderExam: currentUser.targetExam,
      senderClass: currentUser.targetClass,
      requestedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    localStorage.setItem(recipientKey, JSON.stringify([newRequest, ...recipientInbox]));
    setFriendSearch('');
    setRequestNotice(`Authorization request sent to @${targetUser}!`);
  };

  // AUTHORIZE OR DECLINE HANDLER
  const handleAuthorize = (reqId, shouldAccept) => {
    const req = applications.find(a => a.id === reqId);
    if (!req) return;

    if (shouldAccept) {
      if (req.type === 'friend_request') {
        // Add applicant to current user's friends list
        const newFriend = {
          username: req.senderUsername,
          name: req.senderName,
          targetExam: req.senderExam,
          status: 'Active'
        };
        const updatedFriends = [...friends, newFriend];
        setFriends(updatedFriends);
        if (!activeFriend) setActiveFriend(newFriend);

        // Also mutual-add current user to the sender's friend list
        const senderKey = `apex_friends_${req.senderUsername}`;
        const senderFriends = JSON.parse(localStorage.getItem(senderKey) || '[]');
        if (!senderFriends.some(f => f.username === currentUser.username)) {
          senderFriends.push({
            username: currentUser.username,
            name: currentUser.name,
            targetExam: currentUser.targetExam,
            status: 'Active'
          });
          localStorage.setItem(senderKey, JSON.stringify(senderFriends));
        }
      } else if (req.type === 'circle_join') {
        // Authorize Circle Join Request
        const allCircles = JSON.parse(localStorage.getItem('apex_master_circles') || '[]');
        const updated = allCircles.map(c => {
          if (c.id === req.circleId && !c.members.includes(req.senderUsername)) {
            return { ...c, members: [...c.members, req.senderUsername] };
          }
          return c;
        });
        localStorage.setItem('apex_master_circles', JSON.stringify(updated));

        // Auto-add as contact
        if (!friends.some(f => f.username === req.senderUsername)) {
          setFriends(prev => [...prev, {
            username: req.senderUsername,
            name: req.senderName,
            targetExam: req.senderExam,
            status: 'Circle Peer'
          }]);
        }
      }
    }

    // Remove from applications inbox
    setApplications(applications.filter(a => a.id !== reqId));
  };

  const handleSendMessage = () => {
    if (!messageInput.trim() || !activeFriend) return;

    const newMsg = {
      id: Date.now(),
      sender: currentUser.username,
      text: messageInput.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatThreads(prev => ({
      ...prev,
      [activeFriend.username]: [...(prev[activeFriend.username] || []), newMsg]
    }));

    setMessageInput('');
  };

  const currentMessages = activeFriend ? (chatThreads[activeFriend.username] || []) : [];

  return (
    <div className="max-w-6xl mx-auto h-[640px] bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden grid grid-cols-1 md:grid-cols-3 shadow-2xl">
      {/* LEFT PANEL */}
      <div className="md:col-span-1 border-r border-slate-800 bg-slate-900/60 flex flex-col justify-between">
        <div>
          {/* Top Tab Switcher */}
          <div className="p-3 border-b border-slate-800 flex gap-1 bg-slate-950/40">
            <button
              onClick={() => setChatTab('messages')}
              className={`flex-1 py-2 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5 ${
                chatTab === 'messages' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" /> Chats ({friends.length})
            </button>
            <button
              onClick={() => setChatTab('applications')}
              className={`flex-1 py-2 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5 relative ${
                chatTab === 'applications' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" /> Applications
              {applications.length > 0 && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block ml-1" />
              )}
            </button>
          </div>

          {/* TAB A: DIRECT CHATS & FRIEND REQUEST SENDER */}
          {chatTab === 'messages' ? (
            <div>
              {/* Send Friend Request Box */}
              <div className="p-3.5 border-b border-slate-800 bg-slate-900/30">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Send Friend Request
                </span>
                <form onSubmit={handleSendFriendRequest} className="space-y-1.5">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search @username..."
                      value={friendSearch}
                      onChange={(e) => setFriendSearch(e.target.value)}
                      className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                    <button
                      type="submit"
                      className="absolute right-1 top-1 bg-blue-600 hover:bg-blue-500 text-white p-1 rounded-lg text-xs"
                      title="Send Request"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {requestNotice && (
                    <p className="text-[10px] text-blue-400 font-medium">{requestNotice}</p>
                  )}
                </form>
              </div>

              {/* Authorized Friends List */}
              <div className="p-2 space-y-1 overflow-y-auto max-h-[380px]">
                <span className="text-[10px] font-bold text-slate-500 uppercase px-3 py-1 block">
                  Authorized Friends
                </span>
                {friends.length === 0 ? (
                  <div className="text-center py-6 text-slate-500 text-xs">No friends added yet.</div>
                ) : (
                  friends.map((f) => (
                    <button
                      key={f.username}
                      onClick={() => setActiveFriend(f)}
                      className={`w-full text-left p-3 rounded-2xl flex items-center justify-between transition ${
                        activeFriend?.username === f.username
                          ? 'bg-blue-600/20 border border-blue-500/30 text-white'
                          : 'hover:bg-slate-800/50 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-blue-400">
                          {f.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold">{f.name}</h4>
                          <p className="text-[10px] text-slate-400">@{f.username}</p>
                        </div>
                      </div>
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                        {f.status}
                      </span>
                    </button>
                  ))
                )}
              </div>
            </div>
          ) : (
            /* TAB B: APPLICATIONS INBOX (Incoming Friend & Circle Requests) */
            <div className="p-3 space-y-3 overflow-y-auto max-h-[550px]">
              <span className="text-[10px] font-bold text-slate-500 uppercase px-1 block">
                Pending Authorizations ({applications.length})
              </span>

              {applications.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs">
                  No pending authorizations right now.
                </div>
              ) : (
                applications.map((app) => (
                  <div key={app.id} className="bg-slate-800/60 border border-slate-700/60 p-3.5 rounded-2xl space-y-2.5">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                          app.type === 'friend_request' 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                            : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                        }`}>
                          {app.type === 'friend_request' ? 'Friend Request' : 'Circle Join Request'}
                        </span>
                        <span className="text-[10px] text-slate-500">{app.requestedAt}</span>
                      </div>

                      <h5 className="text-xs font-bold text-white mt-1">
                        {app.senderName} <span className="text-slate-400 font-normal">(@{app.senderUsername})</span>
                      </h5>
                      <p className="text-[10px] text-slate-400">
                        {app.type === 'circle_join' && <span className="text-blue-300 block mb-0.5">Circle: {app.circleName}</span>}
                        {app.senderExam} • {app.senderClass}
                      </p>
                    </div>

                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => handleAuthorize(app.id, true)}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-1.5 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 transition shadow"
                      >
                        <Check className="w-3 h-3" /> Authorize
                      </button>
                      <button
                        onClick={() => handleAuthorize(app.id, false)}
                        className="flex-1 bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-700 py-1.5 rounded-xl text-[11px] font-semibold transition flex items-center justify-center gap-1"
                      >
                        <X className="w-3 h-3" /> Decline
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT PANEL: ACTIVE CHAT THREAD */}
      <div className="md:col-span-2 flex flex-col justify-between bg-slate-950/40">
        {activeFriend ? (
          <>
            <div className="h-16 px-6 border-b border-slate-800 bg-slate-900/40 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-white flex items-center gap-2">
                  {activeFriend.name} <span className="text-[11px] font-normal text-slate-400">(@{activeFriend.username})</span>
                </h3>
                <span className="text-[10px] text-emerald-400 font-medium">Authorized Peer</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {currentMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs">
                  <MessageSquare className="w-8 h-8 mb-2 opacity-40" />
                  <p>Say hello to @{activeFriend.username}!</p>
                </div>
              ) : (
                currentMessages.map((m) => {
                  const isMe = m.sender === currentUser.username;
                  return (
                    <div key={m.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                      <div className={`max-w-md p-3.5 rounded-2xl text-xs leading-relaxed whitespace-pre-line ${
                        isMe 
                          ? 'bg-blue-600 text-white rounded-br-none shadow-md' 
                          : 'bg-slate-800 border border-slate-700/80 text-slate-200 rounded-bl-none'
                      }`}>
                        {m.text}
                      </div>
                      <span className="text-[9px] text-slate-500 mt-1 px-1">{m.timestamp}</span>
                    </div>
                  );
                })
              )}
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-900/60 flex items-center gap-2">
              <input
                type="text"
                placeholder={`Message @${activeFriend.username}...`}
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1 bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={handleSendMessage}
                disabled={!messageInput.trim()}
                className="bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white p-2.5 rounded-xl transition"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </>
        ) : (
          <div className="h-full flex items-center justify-center text-xs text-slate-500">
            Select an authorized friend or accept a request to begin chatting.
          </div>
        )}
      </div>
    </div>
  );
}