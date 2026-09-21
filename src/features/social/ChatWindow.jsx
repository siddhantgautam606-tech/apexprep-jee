import React, { useState, useEffect, useRef } from 'react';
import { Send, X, User } from 'lucide-react';
import { getDirectMessages, sendDirectMessage, subscribeToDirectMessages } from '../../services/socialService';

export default function ChatWindow({ currentUser, activeFriend, onClose }) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (!currentUser?.id || !activeFriend?.id) return;

    // 1. Initial history fetch
    const loadMessages = async () => {
      const history = await getDirectMessages(currentUser.id, activeFriend.id);
      setMessages(history);
      scrollToBottom();
    };
    loadMessages();

    // 2. Realtime listener
    const subscription = subscribeToDirectMessages(currentUser.id, activeFriend.id, (newMsg) => {
      setMessages((prev) => [...prev, newMsg]);
      scrollToBottom();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [currentUser?.id, activeFriend?.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !currentUser?.id || !activeFriend?.id) return;

    const text = inputText.trim();
    setInputText('');

    const res = await sendDirectMessage(currentUser.id, activeFriend.id, text);
    if (res.error) {
      alert('Failed to send message: ' + res.error);
    }
  };

  return (
    <div className="flex flex-col h-[600px] w-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
      {/* Top Header */}
      <div className="p-3.5 px-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <User className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-semibold text-white text-xs">@{activeFriend.username}</h4>
            <span className="text-[10px] text-slate-400 block">{activeFriend.target_exam || 'JEE Main'}</span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2.5">
        {messages.length === 0 ? (
          <div className="m-auto text-center text-slate-500 text-xs">
            Start a conversation with @{activeFriend.username}!
          </div>
        ) : (
          messages.map((m) => {
            const isMe = m.sender_id === currentUser.id;
            return (
              <div
                key={m.id}
                className={`flex flex-col max-w-[75%] ${
                  isMe ? 'self-end items-end' : 'self-start items-start'
                }`}
              >
                <div
                  className={`p-2.5 px-3 rounded-2xl text-xs ${
                    isMe
                      ? 'bg-indigo-600 text-white rounded-br-xs'
                      : 'bg-slate-800 text-slate-200 border border-slate-700/60 rounded-bl-xs'
                  }`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>
                </div>
                <span className="text-[9px] text-slate-500 mt-1 px-1">
                  {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Bottom Pinned Input Bar */}
      <form onSubmit={handleSend} className="p-3 border-t border-slate-800 bg-slate-950 flex items-center gap-2 shrink-0">
        <input
          type="text"
          placeholder={`Message @${activeFriend.username}...`}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500"
        />
        <button
          type="submit"
          className="bg-indigo-600 hover:bg-indigo-500 text-white p-2 rounded-xl transition flex items-center justify-center shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}