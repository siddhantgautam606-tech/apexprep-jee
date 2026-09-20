import React, { useState, useEffect } from 'react';
import { 
  Users, MessageSquare, ThumbsUp, Send, Share2, 
  HelpCircle, BookOpen, Flame, Tag, CheckCircle 
} from 'lucide-react';

const INITIAL_POSTS = [
  {
    id: 'post-1',
    author: 'Aarav Sharma',
    exam: 'JEE Main 2025',
    targetClass: 'Class 12',
    timestamp: '2 hours ago',
    tag: 'Doubt',
    subject: 'Physics',
    title: 'Doubt in Kinematics: Trajectory angle vs horizontal component',
    content: 'In PYQ Jan 29 Shift 1, why does horizontal velocity stay strictly constant even when launching on an inclined plane? Doesn’t gravity have a component along the incline?',
    likes: 14,
    hasLiked: false,
    replies: [
      {
        id: 'rep-1',
        author: 'Priya Patel',
        exam: 'JEE Advanced',
        text: 'On an inclined plane, if you take coordinate axes along and perpendicular to the incline, g does have a component (g sinθ) parallel to the incline! Only on flat ground is a_x = 0.',
        timestamp: '1 hour ago'
      }
    ]
  },
  {
    id: 'post-2',
    author: 'Rohan Verma',
    exam: 'JEE Main 2025',
    targetClass: 'Dropper',
    timestamp: '5 hours ago',
    tag: 'Strategy',
    subject: 'Chemistry',
    title: 'How to cover Organic Chemistry mechanisms in 30 days?',
    content: 'I keep mixing up electrophilic addition vs nucleophilic substitution in haloalkanes. Any short tricks or flowcharts you guys use to remember reaction conditions?',
    likes: 28,
    hasLiked: false,
    replies: [
      {
        id: 'rep-2',
        author: 'Neha Gupta',
        exam: 'JEE Main 2025',
        text: 'Focus on reagent identification first: Strong base vs good nucleophile. Check standard MS Chouhan charts, that helped me clear all confusion!',
        timestamp: '3 hours ago'
      }
    ]
  },
  {
    id: 'post-3',
    author: 'Vikram Mehta',
    exam: 'JEE Main 2025',
    targetClass: 'Class 11',
    timestamp: '1 day ago',
    tag: 'Discussion',
    subject: 'Math',
    title: 'Standard limit shortcuts: L’Hôpital vs Series Expansion',
    content: 'Is it always safe to use L’Hôpital rule or does Maclaurin series expansion save more time in tricky 0/0 limits with trigonometric powers?',
    likes: 19,
    hasLiked: false,
    replies: []
  }
];

export default function CommunitySection({ currentUser }) {
  const [posts, setPosts] = useState(() => {
    const saved = localStorage.getItem('apex_community_posts');
    return saved ? JSON.parse(saved) : INITIAL_POSTS;
  });

  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedTag, setSelectedTag] = useState('All');
  
  // New Post Form State
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newSubject, setNewSubject] = useState('Physics');
  const [newTag, setNewTag] = useState('Doubt');
  const [replyText, setReplyText] = useState({});

  useEffect(() => {
    localStorage.setItem('apex_community_posts', JSON.stringify(posts));
  }, [posts]);

  const handleCreatePost = (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const post = {
      id: `post-${Date.now()}`,
      author: currentUser?.name || 'Aspirant',
      exam: currentUser?.targetExam || 'JEE Main',
      targetClass: currentUser?.targetClass || 'Class 12',
      timestamp: 'Just now',
      tag: newTag,
      subject: newSubject,
      title: newTitle.trim(),
      content: newContent.trim(),
      likes: 0,
      hasLiked: false,
      replies: []
    };

    setPosts([post, ...posts]);
    setNewTitle('');
    setNewContent('');
  };

  const handleToggleLike = (postId) => {
    setPosts(posts.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          likes: p.hasLiked ? p.likes - 1 : p.likes + 1,
          hasLiked: !p.hasLiked
        };
      }
      return p;
    }));
  };

  const handleAddReply = (postId) => {
    const text = replyText[postId];
    if (!text || !text.trim()) return;

    setPosts(posts.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          replies: [
            ...p.replies,
            {
              id: `rep-${Date.now()}`,
              author: currentUser?.name || 'Aspirant',
              exam: currentUser?.targetExam || 'JEE Main',
              text: text.trim(),
              timestamp: 'Just now'
            }
          ]
        };
      }
      return p;
    }));

    setReplyText(prev => ({ ...prev, [postId]: '' }));
  };

  // Filter logic
  const filteredPosts = posts.filter(p => {
    const matchSubj = activeFilter === 'all' || p.subject.toLowerCase() === activeFilter.toLowerCase();
    const matchTag = selectedTag === 'All' || p.tag.toLowerCase() === selectedTag.toLowerCase();
    return matchSubj && matchTag;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900/40 via-slate-900 to-indigo-950/40 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <Users className="w-4 h-4" /> Aspirant Lounge & Doubt Exchange
          </div>
          <h2 className="text-2xl font-black text-white">JEE Community Hub</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Ask challenging doubts, share study strategies, discuss tricky PYQs, and collaborate with fellow aspirants.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/60 px-4 py-2 rounded-2xl text-xs font-semibold text-slate-300">
          <Flame className="w-4 h-4 text-amber-400" />
          <span>{posts.length} Discussions Live</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 cols: Posts Feed & Creator */}
        <div className="lg:col-span-2 space-y-6">
          {/* Create Post Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-blue-400" /> Ask a Question or Share Insight
            </h3>

            <form onSubmit={handleCreatePost} className="space-y-3">
              <input
                type="text"
                placeholder="What's your question or topic title? (e.g., Doubt in Rotation theorem)"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full bg-slate-800/70 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />

              <textarea
                rows="3"
                placeholder="Elaborate on your doubt, equation, or thought process..."
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                className="w-full bg-slate-800/70 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
              />

              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <div className="flex gap-2">
                  <select
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none"
                  >
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Math">Math</option>
                    <option value="General">General</option>
                  </select>

                  <select
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none"
                  >
                    <option value="Doubt">Doubt</option>
                    <option value="Strategy">Strategy</option>
                    <option value="Discussion">Discussion</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={!newTitle.trim() || !newContent.trim()}
                  className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold px-5 py-2 rounded-xl text-xs flex items-center gap-1.5 transition shadow"
                >
                  <Send className="w-3.5 h-3.5" /> Post Discussion
                </button>
              </div>
            </form>
          </div>

          {/* Posts List */}
          <div className="space-y-4">
            {filteredPosts.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-10 text-center text-slate-500 text-xs">
                No discussions found under this filter. Be the first to start a conversation!
              </div>
            ) : (
              filteredPosts.map(post => (
                <div key={post.id} className="bg-slate-900 border border-slate-800 rounded-3xl p-5 hover:border-slate-700/80 transition">
                  {/* Post Metadata Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center font-bold text-xs text-blue-400">
                        {post.author.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">{post.author}</span>
                          <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700">
                            {post.exam}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500">{post.timestamp}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        {post.subject}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                        {post.tag}
                      </span>
                    </div>
                  </div>

                  {/* Post Content */}
                  <h4 className="text-sm font-bold text-slate-100 mb-1.5">{post.title}</h4>
                  <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line mb-4">
                    {post.content}
                  </p>

                  {/* Actions (Like & Reply count) */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs text-slate-400">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleToggleLike(post.id)}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-xl transition ${
                          post.hasLiked 
                            ? 'bg-blue-600/20 text-blue-400 font-semibold' 
                            : 'hover:bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span>{post.likes}</span>
                      </button>

                      <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>{post.replies.length} replies</span>
                      </div>
                    </div>
                  </div>

                  {/* Replies Section */}
                  {post.replies.length > 0 && (
                    <div className="mt-3.5 space-y-2 border-t border-slate-800/60 pt-3">
                      {post.replies.map(rep => (
                        <div key={rep.id} className="bg-slate-800/50 rounded-2xl p-3 border border-slate-800 text-xs">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-slate-200">{rep.author}</span>
                            <span className="text-[10px] text-slate-500">{rep.timestamp}</span>
                          </div>
                          <p className="text-slate-300">{rep.text}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Reply Input Box */}
                  <div className="mt-3 flex gap-2">
                    <input
                      type="text"
                      placeholder="Write an answer or reply..."
                      value={replyText[post.id] || ''}
                      onChange={(e) => setReplyText({ ...replyText, [post.id]: e.target.value })}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleAddReply(post.id);
                        }
                      }}
                      className="flex-1 bg-slate-800/60 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                    <button
                      onClick={() => handleAddReply(post.id)}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-xl text-xs font-semibold transition"
                    >
                      Reply
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right 1 col: Filters & Study Guidelines */}
        <div className="space-y-4">
          {/* Subject Filter */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Filter by Subject</h4>
            <div className="grid grid-cols-2 gap-2">
              {['all', 'physics', 'chemistry', 'math'].map(subj => (
                <button
                  key={subj}
                  onClick={() => setActiveFilter(subj)}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold capitalize transition ${
                    activeFilter === subj
                      ? 'bg-blue-600 text-white shadow'
                      : 'bg-slate-800/60 border border-slate-700/60 text-slate-400 hover:text-white'
                  }`}
                >
                  {subj}
                </button>
              ))}
            </div>
          </div>

          {/* Tag Filter */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Categories</h4>
            <div className="flex flex-wrap gap-2">
              {['All', 'Doubt', 'Strategy', 'Discussion'].map(tag => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={`py-1.5 px-3 rounded-xl text-xs font-medium transition ${
                    selectedTag === tag
                      ? 'bg-emerald-600 text-white shadow'
                      : 'bg-slate-800/60 text-slate-400 hover:text-white border border-slate-700/50'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Community Guidelines Card */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-5">
            <h4 className="text-xs font-bold text-slate-300 mb-2 flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Community Rules
            </h4>
            <ul className="text-[11px] text-slate-400 space-y-2 list-disc pl-4 leading-relaxed">
              <li>Keep doubts constructive and specify the step where you are stuck.</li>
              <li>Always cite PYQ Shift and Year when discussing a specific question.</li>
              <li>Maintain encouraging and respectful peer discussions.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}