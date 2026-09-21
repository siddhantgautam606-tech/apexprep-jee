import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Send,
  MessageSquare,
  ArrowLeft,
  CheckCheck,
  Circle
} from 'lucide-react';
import {
  getFriendsList,
  getDirectMessages,
  sendDirectMessage,
  subscribeToDirectMessages
} from '../../services/socialService';

export default function ChatWindow({ currentUser }) {
  const [friends, setFriends] = useState([]);
  const [activeFriend, setActiveFriend] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingFriends, setLoadingFriends] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const messagesEndRef = useRef(null);

  // Load friends list safely
  useEffect(() => {
    async function loadFriends() {
      if (!currentUser?.id) return;
      setLoadingFriends(true);
      try {
        const list = await getFriendsList(currentUser.id);
        setFriends(Array.isArray(list) ? list.filter(Boolean) : []);
      } catch (err) {
        console.error('Failed to load friends list:', err);
        setFriends([]);
      } finally {
        setLoadingFriends(false);
      }
    }
    loadFriends();
  }, [currentUser?.id]);

  // Load messages when an active conversation is picked
  useEffect(() => {
    if (!currentUser?.id || !activeFriend?.id) return;

    let channel = null;

    async function loadChat() {
      setLoadingMessages(true);
      try {
        const history = await getDirectMessages(currentUser.id, activeFriend.id);
        setMessages(Array.isArray(history) ? history : []);
      } catch (err) {
        console.error('Failed to load messages:', err);
        setMessages([]);
      } finally {
        setLoadingMessages(false);
      }

      channel = subscribeToDirectMessages(currentUser.id, activeFriend.id, (newMsg) => {
        if (!newMsg) return;
        setMessages((prev) => {
          if (prev.some((m) => m?.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });
      });
    }

    loadChat();

    return () => {
      if (channel) channel.unsubscribe();
    };
  }, [activeFriend?.id, currentUser?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !activeFriend?.id || !currentUser?.id) return;

    const payloadText = inputText.trim();
    setInputText('');

    try {
      const res = await sendDirectMessage(currentUser.id, activeFriend.id, payloadText);
      if (res?.data) {
        setMessages((prev) => {
          if (prev.some((m) => m?.id === res.data.id)) return prev;
          return [...prev, res.data];
        });
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const filteredFriends = friends.filter((f) => {
    if (!f) return false;
    const name = f.username || f.user?.username || '';
    return name.toLowerCase().includes((searchTerm || '').toLowerCase());
  });

  return (
    <div className="w-full h-[calc(100vh-140px)] max-h-[920px] bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row">
      {/* 1. LEFT SIDEBAR */}
      <div
        className={`w-full md:w-80 lg:w-96 flex flex-col border-r border-slate-800/80 bg-slate-900/60 shrink-0 ${
          activeFriend ? 'hidden md:flex' : 'flex'
        }`}
      >
        <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <MessageSquare className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-white tracking-wide">Chats</h2>
          </div>
          <span className="text-xs text-slate-400">
            {friends.length} Contact{friends.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Search Contacts */}
        <div className="p-3 border-b border-slate-800/50">
          <div className="flex items-center gap-2 bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus-within:border-indigo-500 transition">
            <Search className="w-4 h-4 text-slate-500 shrink-0" />
            <input
              type="text"
              placeholder="Search contacts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent outline-none w-full text-xs text-white placeholder:text-slate-500"
            />
          </div>
        </div>

        {/* Contacts Roster */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-800/40">
          {loadingFriends ? (
            <div className="p-8 text-center text-slate-500 text-xs">Loading contacts...</div>
          ) : filteredFriends.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              {searchTerm ? 'No contacts match your query.' : 'No friends added yet.'}
            </div>
          ) : (
            filteredFriends.map((f) => {
              const username = f.username || f.user?.username || 'Aspirant';
              const initial = username[0]?.toUpperCase() || 'U';
              const targetExam = f.target_exam || f.user?.target_exam || 'JEE Main';
              const isSelected = activeFriend?.id === f.id;

              return (
                <div
                  key={f.id || username}
                  onClick={() => setActiveFriend(f)}
                  className={`p-3.5 flex items-center gap-3 cursor-pointer transition ${
                    isSelected
                      ? 'bg-slate-800/90 border-l-4 border-indigo-500'
                      : 'hover:bg-slate-900/80'
                  }`}
                >
                  <div className="relative">
                    <div className="w-11 h-11 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-indigo-400 font-bold text-sm">
                      {initial}
                    </div>
                    <Circle className="w-3 h-3 text-emerald-500 fill-emerald-500 absolute bottom-0 right-0" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-semibold text-white truncate">@{username}</h4>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">
                      Target: {targetExam}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 2. RIGHT CONVERSATION SCREEN */}
      <div
        className={`flex-1 flex flex-col bg-slate-950/70 relative ${
          !activeFriend ? 'hidden md:flex' : 'flex'
        }`}
      >
        {activeFriend ? (
          <>
            {/* Header */}
            <div className="p-3.5 px-5 border-b border-slate-800/80 bg-slate-900/70 backdrop-blur-sm flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActiveFriend(null)}
                  className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>

                <div className="w-10 h-10 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold text-sm">
                  {(activeFriend.username || activeFriend.user?.username || 'U')[0]?.toUpperCase() || 'U'}
                </div>

                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    @{activeFriend.username || activeFriend.user?.username || 'Peer'}
                  </h3>
                  <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                    <Circle className="w-2 h-2 fill-emerald-400" /> Active Aspirant
                  </span>
                </div>
              </div>

              <span className="text-[11px] text-slate-400 bg-slate-800/70 border border-slate-700/60 px-2.5 py-1 rounded-full">
                {activeFriend.target_exam || activeFriend.user?.target_exam || 'JEE Main'}
              </span>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col gap-3">
              {loadingMessages ? (
                <div className="m-auto text-slate-500 text-xs">Loading message history...</div>
              ) : messages.length === 0 ? (
                <div className="m-auto text-center flex flex-col items-center gap-2 text-slate-500 text-xs">
                  <MessageSquare className="w-8 h-8 text-slate-700" />
                  <p>No messages yet. Say hello and coordinate study plans!</p>
                </div>
              ) : (
                messages.map((m) => {
                  if (!m) return null;
                  const isMine = m.sender_id === currentUser?.id;
                  const time = m.created_at
                    ? new Date(m.created_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                    : '';

                  return (
                    <div
                      key={m.id || Math.random()}
                      className={`flex flex-col max-w-[78%] md:max-w-[62%] ${
                        isMine ? 'self-end items-end' : 'self-start items-start'
                      }`}
                    >
                      <div
                        className={`p-3.5 rounded-2xl text-xs leading-relaxed break-words shadow-md ${
                          isMine
                            ? 'bg-indigo-600 text-white rounded-br-xs'
                            : 'bg-slate-800 text-slate-100 rounded-bl-xs border border-slate-700/60'
                        }`}
                      >
                        {m.content}
                      </div>
                      <span className="text-[10px] text-slate-500 mt-1 px-1 flex items-center gap-1">
                        {time}
                        {isMine && <CheckCheck className="w-3 h-3 text-indigo-400" />}
                      </span>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <form
              onSubmit={handleSend}
              className="p-3 md:p-4 border-t border-slate-800 bg-slate-900/90 flex items-center gap-2"
            >
              <input
                type="text"
                placeholder={`Message @${activeFriend.username || activeFriend.user?.username || 'friend'}...`}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-200 outline-none focus:border-indigo-500 transition"
              />

              <button
                type="submit"
                disabled={!inputText.trim()}
                className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white p-3 rounded-xl transition flex items-center justify-center shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </>
        ) : (
          <div className="m-auto text-center flex flex-col items-center gap-3 p-8">
            <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500">
              <MessageSquare className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-200">Your Messages</h3>
            <p className="text-xs text-slate-500 max-w-sm">
              Select a peer from the conversations list to send direct messages, clarify doubts, and coordinate study schedules.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}