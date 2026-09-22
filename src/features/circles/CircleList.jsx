import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Users, Plus, Shield, Check, X, MessageSquare, Trophy, Calendar, Clock, Trash2, ArrowRight, Send } from 'lucide-react';
import { 
  getAllCircles, 
  getUserCircleMemberships, 
  createCircle, 
  deleteCircle, 
  requestJoinCircle, 
  leaveCircle, 
  getCircleMembers, 
  handleJoinRequest, 
  getCircleTests, 
  scheduleCircleTest, 
  deleteCircleTest, 
  getCircleAnnouncements, 
  postAnnouncement, 
  getCircleLeaderboard,
  fetchQuestionsForTest
} from '../../services/circleService';
import { getStandardQuestions } from '../../data/jeeQuestionBank';
import { JEE_SYLLABUS } from '../../data/syllabusData';

export default function CircleList({ currentUser, onSelectTestToTake }) {
  const [circles, setCircles] = useState([]);
  const [userMemberships, setUserMemberships] = useState([]);
  const [selectedCircle, setSelectedCircle] = useState(null);
  const [activeTab, setActiveTab] = useState('tests'); // tests, members, chat, leaderboard

  // Modals & form state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [newCircleName, setNewCircleName] = useState('');
  const [newCircleDesc, setNewCircleDesc] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Active Circle Detailed Data
  const [circleMembers, setCircleMembers] = useState({ approved: [], pending: [] });
  const [circleTests, setCircleTests] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [announcementMsg, setAnnouncementMsg] = useState('');

  // Auto-scroll ref for announcements
  const chatBottomRef = useRef(null);

  // Schedule Test Form State
  const [newTest, setNewTest] = useState({
    title: '',
    subject: 'Full Syllabus',
    chapter: 'All',
    durationMinutes: 60,
    questionCount: 5,
    windowStart: '',
    windowEnd: ''
  });

  // Dynamically load chapters safely based on subject
  const availableChapters = useMemo(() => {
    if (!newTest.subject || newTest.subject === 'Full Syllabus') {
      return ['All'];
    }

    let chapters = [];
    if (JEE_SYLLABUS && JEE_SYLLABUS[newTest.subject]) {
      const subjectData = JEE_SYLLABUS[newTest.subject];

      if (Array.isArray(subjectData)) {
        chapters = subjectData;
      } else if (typeof subjectData === 'object' && subjectData !== null) {
        Object.values(subjectData).forEach((val) => {
          if (Array.isArray(val)) {
            chapters.push(...val);
          } else if (typeof val === 'string') {
            chapters.push(val);
          }
        });
      }
    }

    const unique = Array.from(new Set(chapters.filter((c) => c && c !== 'All')));
    return ['All', ...unique];
  }, [newTest.subject]);

  const loadCirclesData = async () => {
    const all = await getAllCircles();
    setCircles(all);
    if (currentUser?.id) {
      const mems = await getUserCircleMemberships(currentUser.id);
      setUserMemberships(mems);
    }
  };

  useEffect(() => {
    loadCirclesData();
  }, [currentUser]);

  useEffect(() => {
    if (!selectedCircle) return;

    const loadCircleDetails = async () => {
      const [members, tests, ann, lb] = await Promise.all([
        getCircleMembers(selectedCircle.id),
        getCircleTests(selectedCircle.id),
        getCircleAnnouncements(selectedCircle.id),
        getCircleLeaderboard(selectedCircle.id)
      ]);
      setCircleMembers(members);
      setCircleTests(tests);
      setAnnouncements(ann);
      setLeaderboard(lb);
    };

    loadCircleDetails();
  }, [selectedCircle]);

  // Scroll to bottom of chat when announcements update
  useEffect(() => {
    if (activeTab === 'chat' && chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [announcements, activeTab]);

  const isUserAdmin = (circle) => {
    if (!currentUser) return false;
    if (circle.created_by === currentUser.id) return true;
    const mem = userMemberships.find((m) => m.circle_id === circle.id);
    return mem?.role === 'admin' && mem?.status === 'approved';
  };

  const getMembershipStatus = (circleId) => {
    const mem = userMemberships.find((m) => m.circle_id === circleId);
    return mem ? mem.status : null;
  };

  const handleCreateCircle = async (e) => {
    e.preventDefault();
    if (!newCircleName.trim() || !currentUser?.id) return;

    setIsSubmitting(true);
    const res = await createCircle(newCircleName, newCircleDesc, currentUser.id);
    setIsSubmitting(false);

    if (res.error) {
      alert('Error creating circle: ' + res.error);
    } else {
      setShowCreateModal(false);
      setNewCircleName('');
      setNewCircleDesc('');
      loadCirclesData();
    }
  };

  const handleJoin = async (circleId) => {
    if (!currentUser?.id) return;
    await requestJoinCircle(circleId, currentUser.id);
    loadCirclesData();
  };

  const handleLeave = async (circleId) => {
    if (!currentUser?.id) return;
    if (window.confirm('Are you sure you want to leave this circle?')) {
      await leaveCircle(circleId, currentUser.id);
      setSelectedCircle(null);
      loadCirclesData();
    }
  };

  const handleDeleteCircle = async (circleId) => {
    if (!currentUser?.id) return;
    if (window.confirm('Delete this circle permanently?')) {
      await deleteCircle(circleId, currentUser.id);
      setSelectedCircle(null);
      loadCirclesData();
    }
  };

  const handleScheduleTest = async (e) => {
    e.preventDefault();
    if (!selectedCircle || !currentUser?.id) {
      alert('You must be logged in and inside an active circle.');
      return;
    }

    setIsSubmitting(true);
    let questions = [];

    try {
      const qNum = Number(newTest.questionCount) || 5;

      try {
        if (typeof fetchQuestionsForTest === 'function') {
          questions = await fetchQuestionsForTest(newTest.subject, newTest.chapter, qNum);
        }
      } catch (err) {
        console.warn('DB question fetch failed, using fallback bank:', err);
      }

      if (!Array.isArray(questions) || questions.length === 0) {
        const subForBank = newTest.subject === 'Full Syllabus' ? 'Physics' : newTest.subject;
        questions = getStandardQuestions(subForBank, newTest.chapter, qNum);
      }

      if (!Array.isArray(questions) || questions.length === 0) {
        questions = Array.from({ length: qNum }, (_, i) => ({
          id: i + 1,
          question: `Sample Question ${i + 1} for ${newTest.subject} (${newTest.chapter})`,
          options: ['Option A', 'Option B', 'Option C', 'Option D'],
          correctAnswer: 0,
          explanation: 'Standard concept application.'
        }));
      }

      const res = await scheduleCircleTest(
        selectedCircle.id,
        { ...newTest, questions },
        currentUser.id
      );

      if (res.error) {
        alert('Could not schedule test: ' + res.error);
      } else {
        setShowScheduleModal(false);
        setNewTest({
          title: '',
          subject: 'Full Syllabus',
          chapter: 'All',
          durationMinutes: 60,
          questionCount: 5,
          windowStart: '',
          windowEnd: ''
        });
        const tests = await getCircleTests(selectedCircle.id);
        setCircleTests(tests);
      }
    } catch (err) {
      console.error('Test scheduling error:', err);
      alert('An unexpected error occurred while scheduling.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTest = async (testId) => {
    if (window.confirm('Delete this scheduled test?')) {
      await deleteCircleTest(testId);
      const tests = await getCircleTests(selectedCircle.id);
      setCircleTests(tests);
    }
  };

  const handlePostAnnouncement = async (e) => {
    e.preventDefault();
    if (!announcementMsg.trim() || !currentUser?.id) return;
    const msgToSend = announcementMsg;
    setAnnouncementMsg('');

    const res = await postAnnouncement(selectedCircle.id, msgToSend, currentUser.id);
    if (!res.error) {
      const ann = await getCircleAnnouncements(selectedCircle.id);
      setAnnouncements(ann);
    }
  };

  const handleManageRequest = async (recordId, accept) => {
    await handleJoinRequest({ memberRecordId: recordId, accept });
    const members = await getCircleMembers(selectedCircle.id);
    setCircleMembers(members);
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-400" /> Study Circles
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Form private study circles, challenge friends with synchronized mock exams, and climb leaderboards.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition shadow-lg shadow-indigo-600/20"
        >
          <Plus className="w-4 h-4" /> Create New Circle
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Circles Sidebar */}
        <div className="lg:col-span-1 flex flex-col gap-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
            Available Circles ({circles.length})
          </h2>

          <div className="flex flex-col gap-2.5 max-h-[700px] overflow-y-auto pr-1">
            {circles.map((c) => {
              const status = getMembershipStatus(c.id);
              const isSelected = selectedCircle?.id === c.id;

              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedCircle(c)}
                  className={`p-4 rounded-xl border cursor-pointer transition flex flex-col gap-2 ${
                    isSelected
                      ? 'bg-slate-800/90 border-indigo-500 shadow-md'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-white">{c.name}</h3>
                    {isUserAdmin(c) && (
                      <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded flex items-center gap-1 font-semibold">
                        <Shield className="w-3 h-3" /> Admin
                      </span>
                    )}
                  </div>

                  {c.description && (
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {c.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-800/60 mt-1">
                    <span>Admin: {c.creator?.username || 'Aspirant'}</span>
                    <div className="flex items-center gap-2">
                      {status === 'approved' && (
                        <span className="text-emerald-400 font-medium">Joined</span>
                      )}
                      {status === 'pending' && (
                        <span className="text-amber-400 font-medium">Request Pending</span>
                      )}
                      {!status && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleJoin(c.id);
                          }}
                          className="text-indigo-400 hover:text-indigo-300 font-semibold"
                        >
                          Join
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {circles.length === 0 && (
              <div className="p-8 text-center bg-slate-900/50 border border-slate-800 rounded-xl text-xs text-slate-500">
                No circles available yet. Create the first one!
              </div>
            )}
          </div>
        </div>

        {/* Right: Selected Circle Content */}
        <div className="lg:col-span-2">
          {selectedCircle ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 md:p-6 shadow-xl flex flex-col gap-6">
              {/* Circle Info Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
                <div>
                  <h2 className="text-xl font-bold text-white">{selectedCircle.name}</h2>
                  <p className="text-xs text-slate-400 mt-1">
                    {selectedCircle.description || 'Private peer study circle for JEE prep.'}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {isUserAdmin(selectedCircle) && (
                    <button
                      onClick={() => handleDeleteCircle(selectedCircle.id)}
                      className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete Circle
                    </button>
                  )}
                  {getMembershipStatus(selectedCircle.id) === 'approved' && !isUserAdmin(selectedCircle) && (
                    <button
                      onClick={() => handleLeave(selectedCircle.id)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition"
                    >
                      Leave Circle
                    </button>
                  )}
                </div>
              </div>

              {/* Navigation Tabs inside Circle */}
              <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                {[
                  { id: 'tests', label: 'Circle Tests', icon: Calendar },
                  { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
                  { id: 'members', label: `Members (${circleMembers.approved.length})`, icon: Users },
                  { id: 'chat', label: 'Announcements', icon: MessageSquare }
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                        isActive
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* TAB 1: TESTS */}
              {activeTab === 'tests' && (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-400">Scheduled Mock Tests</span>
                    {isUserAdmin(selectedCircle) && (
                      <button
                        onClick={() => setShowScheduleModal(true)}
                        className="px-3 py-1.5 bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-600/30 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
                      >
                        <Plus className="w-3.5 h-3.5" /> Schedule Test
                      </button>
                    )}
                  </div>

                  <div className="flex flex-col gap-3">
                    {circleTests.map((t) => (
                      <div
                        key={t.id}
                        className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-700 transition"
                      >
                        <div className="flex flex-col gap-1">
                          <h4 className="text-sm font-semibold text-white">{t.title}</h4>
                          <div className="flex items-center gap-3 text-[11px] text-slate-400">
                            <span className="text-indigo-400 font-semibold">{t.subject}</span>
                            <span>•</span>
                            <span>{t.chapter}</span>
                            <span>•</span>
                            <span>{t.question_count || t.total_questions || (t.questions ? t.questions.length : 5)} Questions</span>
                            <span>•</span>
                            <span>{t.duration_minutes || 60} Mins</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              if (typeof onSelectTestToTake === 'function') {
                                onSelectTestToTake(t);
                              }
                            }}
                            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
                          >
                            Take Test <ArrowRight className="w-3.5 h-3.5" />
                          </button>

                          {isUserAdmin(selectedCircle) && (
                            <button
                              onClick={() => handleDeleteTest(t.id)}
                              className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                              title="Delete Test"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}

                    {circleTests.length === 0 && (
                      <div className="py-12 text-center text-xs text-slate-500">
                        No tests have been scheduled in this circle yet.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: LEADERBOARD */}
              {activeTab === 'leaderboard' && (
                <div className="flex flex-col gap-3">
                  <div className="grid grid-cols-12 text-[11px] font-semibold text-slate-400 px-4 py-2 border-b border-slate-800">
                    <span className="col-span-2">Rank</span>
                    <span className="col-span-5">Aspirant</span>
                    <span className="col-span-3 text-right">Tests Taken</span>
                    <span className="col-span-2 text-right">Total Score</span>
                  </div>

                  {leaderboard.map((u, idx) => (
                    <div
                      key={u.userId}
                      className="grid grid-cols-12 items-center text-xs px-4 py-3 bg-slate-950/40 border border-slate-800 rounded-xl"
                    >
                      <span className="col-span-2 font-bold text-indigo-400">#{idx + 1}</span>
                      <span className="col-span-5 font-medium text-white">{u.username}</span>
                      <span className="col-span-3 text-right text-slate-400">{u.testsTaken}</span>
                      <span className="col-span-2 text-right font-bold text-emerald-400">
                        {u.totalScore}
                      </span>
                    </div>
                  ))}

                  {leaderboard.length === 0 && (
                    <div className="py-12 text-center text-xs text-slate-500">
                      No test submissions yet. Take tests to generate rankings!
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: MEMBERS */}
              {activeTab === 'members' && (
                <div className="flex flex-col gap-6">
                  {isUserAdmin(selectedCircle) && circleMembers.pending.length > 0 && (
                    <div className="flex flex-col gap-2.5">
                      <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                        Pending Join Requests ({circleMembers.pending.length})
                      </span>
                      <div className="flex flex-col gap-2">
                        {circleMembers.pending.map((m) => (
                          <div
                            key={m.id}
                            className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center justify-between"
                          >
                            <span className="text-xs font-semibold text-white">
                              {m.user?.username || 'Aspirant'}
                            </span>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleManageRequest(m.id, true)}
                                className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30 transition"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleManageRequest(m.id, false)}
                                className="p-1.5 bg-rose-500/20 text-rose-400 rounded-lg hover:bg-rose-500/30 transition"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Circle Members ({circleMembers.approved.length})
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {circleMembers.approved.map((m) => (
                        <div
                          key={m.id}
                          className="p-3 bg-slate-950/40 border border-slate-800 rounded-xl flex items-center justify-between"
                        >
                          <div className="flex flex-col">
                            <span className="text-xs font-semibold text-white">
                              {m.user?.username || 'Aspirant'}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              Target: {m.user?.target_exam || 'JEE Main'}
                            </span>
                          </div>
                          <span className="text-[10px] uppercase font-semibold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                            {m.role}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: ANNOUNCEMENTS */}
              {activeTab === 'chat' && (
                <div className="flex flex-col h-[520px] bg-slate-950/50 border border-slate-800/80 rounded-2xl overflow-hidden">
                  <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
                    {announcements.map((a) => (
                      <div
                        key={a.id}
                        className="p-3 bg-slate-900/90 border border-slate-800 rounded-xl flex flex-col gap-1 shadow-sm"
                      >
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-semibold text-indigo-400">
                            {a.author?.username || 'Member'}
                          </span>
                          <span className="text-slate-500 text-[10px]">
                            {new Date(a.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">
                          {a.message}
                        </p>
                      </div>
                    ))}
                    {announcements.length === 0 && (
                      <div className="my-auto py-12 text-center text-xs text-slate-500">
                        No announcements posted yet. Start the conversation below!
                      </div>
                    )}
                    <div ref={chatBottomRef} />
                  </div>

                  <div className="p-3 bg-slate-900 border-t border-slate-800/80">
                    <form onSubmit={handlePostAnnouncement} className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Post an announcement or message to the circle..."
                        value={announcementMsg}
                        onChange={(e) => setAnnouncementMsg(e.target.value)}
                        className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 transition"
                      />
                      <button
                        type="submit"
                        disabled={!announcementMsg.trim()}
                        className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white text-xs font-semibold rounded-xl transition flex items-center gap-1.5 shadow-sm"
                      >
                        <Send className="w-3.5 h-3.5" /> Post
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-12 bg-slate-900 border border-slate-800 rounded-2xl text-center">
              <Users className="w-12 h-12 text-slate-700 mb-3" />
              <h3 className="text-sm font-semibold text-slate-300">Select a Circle</h3>
              <p className="text-xs text-slate-500 max-w-sm mt-1">
                Choose a study circle from the left column to view scheduled mock tests, leaderboards, and peer discussions.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* MODAL: CREATE CIRCLE */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4">Create New Circle</h3>
            <form onSubmit={handleCreateCircle} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Circle Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Kota Aspirants 2026"
                  value={newCircleName}
                  onChange={(e) => setNewCircleName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
                <textarea
                  rows="3"
                  placeholder="Target goal, discussion focus, or test schedule..."
                  value={newCircleDesc}
                  onChange={(e) => setNewCircleDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition"
                >
                  {isSubmitting ? 'Creating...' : 'Create Circle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: SCHEDULE TEST (With Full Syllabus and Dynamic Chapter Select) */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4">Schedule Circle Mock Test</h3>
            <form onSubmit={handleScheduleTest} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Test Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Weekly Full Mock Test"
                  value={newTest.title}
                  onChange={(e) => setNewTest({ ...newTest, title: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Subject</label>
                  <select
                    value={newTest.subject}
                    onChange={(e) => setNewTest({ ...newTest, subject: e.target.value, chapter: 'All' })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                  >
                    <option value="Full Syllabus">Full Syllabus (P + C + M)</option>
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Mathematics">Mathematics</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Chapter Selection</label>
                  <select
                    disabled={newTest.subject === 'Full Syllabus'}
                    value={newTest.chapter}
                    onChange={(e) => setNewTest({ ...newTest, chapter: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-500 disabled:opacity-40"
                  >
                    {availableChapters.map((ch, idx) => (
                      <option key={idx} value={ch}>
                        {ch === 'All' ? 'All Chapters' : ch}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Question Count</label>
                  <input
                    type="number"
                    min="5"
                    max="75"
                    value={newTest.questionCount}
                    onChange={(e) => setNewTest({ ...newTest, questionCount: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Duration (Mins)</label>
                  <input
                    type="number"
                    min="5"
                    max="180"
                    value={newTest.durationMinutes}
                    onChange={(e) => setNewTest({ ...newTest, durationMinutes: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition"
                >
                  {isSubmitting ? 'Scheduling...' : 'Save & Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}