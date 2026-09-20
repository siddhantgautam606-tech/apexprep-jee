import React, { useState, useEffect, useRef } from 'react';
import { Send, X, Loader2, User } from 'lucide-react';
import { fetchConversation, sendMessage, subscribeToMessages } from '../../services/chatService';

export default function ChatWindow({ currentUser, activeFriend, onClose }) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (!currentUser || !activeFriend) return;

    let unsubscribe = () => {};

    const loadHistoryAndSubscribe = async () => {
      setLoading(true);
      try {
        const history = await fetchConversation(currentUser.id, activeFriend.id);
        setMessages(history);

        unsubscribe = subscribeToMessages(currentUser.id, (newMsg) => {
          if (newMsg.sender_id === activeFriend.id) {
            setMessages((prev) => [...prev, newMsg]);
          }
        });
      } catch (err) {
        console.error('Failed to load chat conversation:', err);
      } finally {
        setLoading(false);
      }
    };

    loadHistoryAndSubscribe();

    return () => {
      unsubscribe();
    };
  }, [currentUser, activeFriend]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const messageContent = inputText;
    setInputText('');

    try {
      const sentMsg = await sendMessage({
        senderId: currentUser.id,
        receiverId: activeFriend.id,
        content: messageContent,
      });
      setMessages((prev) => [...prev, sentMsg]);
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  if (!activeFriend) return null;

  return (
    <div className="flex h-full flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 font-semibold">
            {activeFriend.username?.charAt(0).toUpperCase() || <User className="h-4 w-4" />}
          </div>
          <div>
            <h3 className="font-semibold text-sm text-slate-800 dark:text-white">@{activeFriend.username}</h3>
            <span className="text-xs text-slate-500 dark:text-slate-400">{activeFriend.target_exam || 'JEE Main'}</span>
          </div>
        </div>
        <button onClick={onClose} className="rounded-lg p-1 hover:bg-slate-200 dark:hover:bg-slate-700">
          <X className="h-5 w-5 text-slate-500" />
        </button>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-xs text-slate-400">
            No messages yet. Say hi to @{activeFriend.username}!
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender_id === currentUser.id;
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm shadow-xs ${
                    isMe
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-bl-none'
                  }`}
                >
                  <p className="break-words">{msg.content}</p>
                  <span
                    className={`block text-[10px] mt-1 text-right ${
                      isMe ? 'text-blue-200' : 'text-slate-400'
                    }`}
                  >
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSend} className="p-3 border-t border-slate-200 dark:border-slate-800 flex gap-2">
        <input
          type="text"
          placeholder={`Message @${activeFriend.username}...`}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="flex-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-2 text-sm focus:outline-hidden focus:border-blue-500 dark:text-white"
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="rounded-xl bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50 transition"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}