import React, { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  Calendar,
  Clock,
  BookOpen,
  UserPlus,
  CheckCircle2,
  X,
  Megaphone,
  Trophy,
  ShieldCheck,
  LogOut,
  Send,
  UserCheck,
  UserX,
  Hourglass
} from 'lucide-react';
import {
  getAllCircles,
  getUserCircleMemberships,
  createCircle,
  requestJoinCircle,
  leaveCircle,
  getCircleMembers,
  handleJoinRequest,
  getCircleTests,
  scheduleCircleTest,
  getCircleAnnouncements,
  postAnnouncement,
  getCircleLeaderboard
} from '../../services/circleService';

export default function CircleList({ currentUser, onStartTest }) {
  const [circles, setCircles] = useState([]);
  const [membershipMap, setMembershipMap] = useState({}); // { [circleId]: { status, role } }
  const [selectedCircle, setSelectedCircle] = useState(null);

  // Circle sub-data
  const [circleMembers, setCircleMembers] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [circleTests, setCircleTests] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);

  // Active sub-tab inside a circle
  const [circleTab, setCircleTab] = useState('tests'); // 'tests' | 'announcements' | 'leaderboard' | 'admin'
  const [loading, setLoading] = useState(true);

  // Modals & Inputs
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [announcementMsg, setAnnouncementMsg] = useState('');

  const [newCircle, setNewCircle] = useState({ name: '', description: '' });
  const [newTest, setNewTest] = useState({
    title: '',
    subject: 'Physics',
    chapter: 'All',
    durationMinutes: 60
  });

  const loadData = async () => {
    setLoading(true);
    const all = await getAllCircles();
    setCircles(all);

    if (currentUser?.id) {
      const memberships = await getUserCircleMemberships(currentUser.id);
      const mapping = {};
      memberships.forEach((m) => {
        mapping[m.circle_id] = { status: m.status, role: m.role };
      });
      setMembershipMap(mapping);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [currentUser?.id]);

  const handleSelectCircle = async (circle) => {
    setSelectedCircle(circle);
    setCircleTab('tests');

    const [membersRes, tests, ann, ranks] = await Promise.all([
      getCircleMembers(circle.id),
      getCircleTests(circle.id),
      getCircleAnnouncements(circle.id),
      getCircleLeaderboard(circle.id)
    ]);

    setCircleMembers(membersRes.approved);
    setPendingRequests(membersRes.pending);
    setCircleTests(tests);
    setAnnouncements(ann);
    setLeaderboard(ranks);
  };

  const handleCreateCircle = async (e) => {
    e.preventDefault();
    if (!currentUser?.id) return alert('Please sign in first.');

    const res = await createCircle(newCircle.name, newCircle.description, currentUser.id);
    if (res.error) {
      alert(res.error);
    } else {
      setShowCreateModal(false);
      setNewCircle({ name: '', description: '' });
      await loadData();
      if (res.data) handleSelectCircle(res.data);
    }
  };

  const handleJoinRequest = async (circleId, e) => {
    e?.stopPropagation();
    if (!currentUser?.id) return alert('Please sign in to request joining.');

    const res = await requestJoinCircle(circleId, currentUser.id);
    if (res.error) {
      alert(res.error);
    } else {
      setMembershipMap((prev) => ({
        ...prev,
        [circleId]: { status: 'pending', role: 'member' }
      }));
    }
  };

  const handleLeaveCircle = async () => {
    if (!selectedCircle || !currentUser?.id) return;
    const confirm = window.confirm(`Are you sure you want to leave ${selectedCircle.name}?`);
    if (!confirm) return;

    const res = await leaveCircle(selectedCircle.id, currentUser.id);
    if (res.error) {
      alert(res.error);
    } else {
      setMembershipMap((prev) => {
        const next = { ...prev };
        delete next[selectedCircle.id];
        return next;
      });
      setSelectedCircle(null);
      await loadData();
    }
  };

  const handleApproveReject = async (memberId, accept) => {
    const res = await handleJoinRequest(memberId, accept);
    if (res.error) {
      alert(res.error);
    } else {
      const refreshed = await getCircleMembers(selectedCircle.id);
      setCircleMembers(refreshed.approved);
      setPendingRequests(refreshed.pending);
    }
  };

  const handleScheduleTest = async (e) => {
    e.preventDefault();
    if (!selectedCircle || !currentUser?.id) return;

    const res = await scheduleCircleTest(selectedCircle.id, newTest, currentUser.id);
    if (res.error) {
      alert(res.error);
    } else {
      setShowScheduleModal(false);
      setNewTest({ title: '', subject: 'Physics', chapter: 'All', durationMinutes: 60 });
      const tests = await getCircleTests(selectedCircle.id);
      setCircleTests(tests);
    }
  };

  const handleSendAnnouncement = async (e) => {
    e.preventDefault();
    if (!announcementMsg.trim() || !selectedCircle || !currentUser?.id) return;

    const res = await postAnnouncement(selectedCircle.id, announcementMsg, currentUser.id);
    if (res.error) {
      alert(res.error);
    } else {
      setAnnouncementMsg('');
      const ann = await getCircleAnnouncements(selectedCircle.id);
      setAnnouncements(ann);
    }
  };

  const isCircleAdmin =
    selectedCircle &&
    currentUser?.id &&
    (selectedCircle.created_by === currentUser.id ||
      membershipMap[selectedCircle.id]?.role === 'admin');

  const userStatus = selectedCircle ? membershipMap[selectedCircle.id]?.status : null;
  const isApprovedMember = userStatus === 'approved' || isCircleAdmin;

  return (
    <div className="w-full max-w-5xl flex flex-col gap-6">
      {/* Circle Hub Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600/20 text-indigo-400 p-2.5 rounded-xl border border-indigo-600/30">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Friend Circles & Cohorts</h2>
            <p className="text-xs text-slate-400">Collaborative study circles with gated entry, scheduled tests & rank boards</p>
          </div>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow transition shrink-0"
        >
          <Plus className="w-4 h-4" /> Create Circle
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Circles Directory */}
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold text-slate-300">Available Circles</h3>

          {loading ? (
            <div className="p-8 text-center text-slate-500 text-xs bg-slate-900/50 border border-slate-800 rounded-xl">
              Loading circles...
            </div>
          ) : circles.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs bg-slate-900/50 border border-slate-800 rounded-xl">
              No circles yet. Be the first to create one!
            </div>
          ) : (
            circles.map((circle) => {
              const mem = membershipMap[circle.id];
              const isSelected = selectedCircle?.id === circle.id;
              const memberCount = circle.members?.[0]?.count || 1;

              return (
                <div
                  key={circle.id}
                  onClick={() => handleSelectCircle(circle)}
                  className={`p-4 rounded-xl border cursor-pointer transition flex flex-col gap-2 ${
                    isSelected
                      ? 'bg-slate-800/90 border-indigo-500/60 shadow-lg shadow-indigo-500/10'
                      : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-white text-sm">{circle.name}</h4>

                    {mem?.status === 'approved' ? (
                      <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" /> Joined
                      </span>
                    ) : mem?.status === 'pending' ? (
                      <span className="flex items-center gap-1 text-[11px] font-medium text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                        <Hourglass className="w-3 h-3" /> Pending
                      </span>
                    ) : (
                      <button
                        onClick={(e) => handleJoinRequest(circle.id, e)}
                        className="flex items-center gap-1 text-[11px] font-medium text-indigo-400 hover:text-white bg-indigo-600/20 hover:bg-indigo-600 px-2.5 py-1 rounded-md transition"
                      >
                        <UserPlus className="w-3 h-3" /> Request
                      </button>
                    )}
                  </div>

                  {circle.description && (
                    <p className="text-xs text-slate-400 line-clamp-2">{circle.description}</p>
                  )}

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-800/80">
                    <span>{memberCount} member{memberCount !== 1 ? 's' : ''}</span>
                    <span>Admin: @{circle.creator?.username || 'user'}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Selected Circle Workspace */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          {selectedCircle ? (
            <>
              {/* Header Box */}
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col gap-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-white">{selectedCircle.name}</h3>
                      {isCircleAdmin && (
                        <span className="flex items-center gap-1 text-[10px] font-semibold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 px-2 py-0.5 rounded">
                          <ShieldCheck className="w-3 h-3" /> Admin
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {selectedCircle.description || 'No description provided.'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Admin Test Scheduling Button */}
                    {isCircleAdmin && (
                      <button
                        onClick={() => setShowScheduleModal(true)}
                        className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium px-3 py-1.5 rounded-xl transition shadow"
                      >
                        <Calendar className="w-3.5 h-3.5" /> Schedule Test
                      </button>
                    )}

                    {/* Exit Circle Button (for non-creator approved members) */}
                    {isApprovedMember && selectedCircle.created_by !== currentUser?.id && (
                      <button
                        onClick={handleLeaveCircle}
                        title="Leave this Circle"
                        className="flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 px-3 py-1.5 rounded-xl transition"
                      >
                        <LogOut className="w-3.5 h-3.5" /> Leave
                      </button>
                    )}
                  </div>
                </div>

                {/* Sub-Tabs Navigation */}
                <div className="flex items-center gap-1 border-b border-slate-800 pb-2 text-xs">
                  <button
                    onClick={() => setCircleTab('tests')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
                      circleTab === 'tests'
                        ? 'bg-slate-800 text-white font-semibold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Calendar className="w-3.5 h-3.5" /> Tests ({circleTests.length})
                  </button>

                  <button
                    onClick={() => setCircleTab('announcements')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
                      circleTab === 'announcements'
                        ? 'bg-slate-800 text-white font-semibold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Megaphone className="w-3.5 h-3.5" /> Announcements
                  </button>

                  <button
                    onClick={() => setCircleTab('leaderboard')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
                      circleTab === 'leaderboard'
                        ? 'bg-slate-800 text-white font-semibold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Trophy className="w-3.5 h-3.5" /> Leaderboard
                  </button>

                  {/* Admin Requests Tab */}
                  {isCircleAdmin && (
                    <button
                      onClick={() => setCircleTab('admin')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition ml-auto ${
                        circleTab === 'admin'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'text-amber-400/80 hover:text-amber-300'
                      }`}
                    >
                      <UserPlus className="w-3.5 h-3.5" /> Requests ({pendingRequests.length})
                    </button>
                  )}
                </div>
              </div>

              {/* Sub-Tab View Switcher */}
              {!isApprovedMember ? (
                <div className="bg-slate-900/60 border border-slate-800 p-8 rounded-2xl text-center flex flex-col items-center justify-center gap-2">
                  <Hourglass className="w-8 h-8 text-amber-400/60 mb-1" />
                  <h4 className="text-sm font-semibold text-slate-200">Gated Circle</h4>
                  <p className="text-xs text-slate-400 max-w-sm">
                    {userStatus === 'pending'
                      ? 'Your join request is awaiting circle admin authorization. You will get access once accepted.'
                      : 'You must request and be granted admission by the circle admin to view tests, announcements, and ranks.'}
                  </p>
                </div>
              ) : (
                <>
                  {/* 1. Scheduled Tests Tab */}
                  {circleTab === 'tests' && (
                    <div className="flex flex-col gap-3">
                      {circleTests.length === 0 ? (
                        <div className="p-8 text-center text-slate-500 text-xs bg-slate-900/50 border border-slate-800 rounded-xl">
                          No tests scheduled yet. {isCircleAdmin ? 'Use "Schedule Test" above to set one.' : 'Circle admin will post scheduled tests soon.'}
                        </div>
                      ) : (
                        circleTests.map((test) => (
                          <div
                            key={test.id}
                            className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4"
                          >
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2">
                                <h5 className="font-semibold text-white text-sm">{test.title}</h5>
                                <span className="text-[10px] font-semibold uppercase tracking-wider bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                                  {test.subject}
                                </span>
                              </div>
                              <div className="flex items-center gap-4 text-xs text-slate-400 mt-1">
                                <span className="flex items-center gap-1">
                                  <BookOpen className="w-3.5 h-3.5 text-slate-500" /> {test.chapter}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3.5 h-3.5 text-slate-500" /> {test.duration_minutes} mins
                                </span>
                              </div>
                            </div>

                            <button
                              onClick={() => onStartTest && onStartTest(test)}
                              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-2 rounded-xl transition shrink-0"
                            >
                              Attempt Test
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {/* 2. Admin Broadcast Announcements Tab */}
                  {circleTab === 'announcements' && (
                    <div className="flex flex-col gap-4">
                      {/* Admin Message Poster Form */}
                      {isCircleAdmin ? (
                        <form
                          onSubmit={handleSendAnnouncement}
                          className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex items-center gap-2"
                        >
                          <input
                            type="text"
                            placeholder="Broadcast an announcement to your circle members..."
                            value={announcementMsg}
                            onChange={(e) => setAnnouncementMsg(e.target.value)}
                            className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none"
                          />
                          <button
                            type="submit"
                            className="bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-2 rounded-lg text-xs font-medium flex items-center gap-1 transition"
                          >
                            <Send className="w-3.5 h-3.5" /> Post
                          </button>
                        </form>
                      ) : (
                        <div className="text-[11px] text-slate-500 bg-slate-900/40 p-2.5 rounded-lg border border-slate-800/80">
                          Announcements are broadcast exclusively by the Circle Admin.
                        </div>
                      )}

                      {/* Feed */}
                      {announcements.length === 0 ? (
                        <div className="p-8 text-center text-slate-500 text-xs bg-slate-900/50 border border-slate-800 rounded-xl">
                          No announcements posted yet.
                        </div>
                      ) : (
                        announcements.map((a) => (
                          <div key={a.id} className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl flex flex-col gap-1">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="font-semibold text-indigo-400">@{a.author?.username || 'Admin'}</span>
                              <span className="text-slate-500">{new Date(a.created_at).toLocaleDateString()}</span>
                            </div>
                            <p className="text-xs text-slate-200">{a.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {/* 3. Circle Leaderboard Tab */}
                  {circleTab === 'leaderboard' && (
                    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                      {leaderboard.length === 0 ? (
                        <div className="p-8 text-center text-slate-500 text-xs">
                          No test submissions yet. Complete scheduled circle exams to populate ranks!
                        </div>
                      ) : (
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 uppercase tracking-wider text-[10px]">
                            <tr>
                              <th className="py-2.5 px-4">Rank</th>
                              <th className="py-2.5 px-4">Candidate</th>
                              <th className="py-2.5 px-4">Target Exam</th>
                              <th className="py-2.5 px-4 text-center">Tests</th>
                              <th className="py-2.5 px-4 text-right">Avg Accuracy</th>
                              <th className="py-2.5 px-4 text-right">Total Score</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800">
                            {leaderboard.map((row, idx) => (
                              <tr key={row.userId} className="hover:bg-slate-800/40 transition">
                                <td className="py-3 px-4 font-bold text-slate-300">
                                  {idx === 0 ? '🥇 1' : idx === 1 ? '🥈 2' : idx === 2 ? '🥉 3' : `#${idx + 1}`}
                                </td>
                                <td className="py-3 px-4 font-medium text-white">@{row.username}</td>
                                <td className="py-3 px-4 text-slate-400">{row.targetExam}</td>
                                <td className="py-3 px-4 text-center text-slate-300">{row.testsTaken}</td>
                                <td className="py-3 px-4 text-right text-emerald-400 font-semibold">{row.avgAccuracy}%</td>
                                <td className="py-3 px-4 text-right font-bold text-indigo-400">{row.totalScore} pts</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  )}

                  {/* 4. Admin Admission Requests Tab */}
                  {circleTab === 'admin' && isCircleAdmin && (
                    <div className="flex flex-col gap-3">
                      <h4 className="text-xs font-semibold text-slate-400">
                        Pending Membership Requests ({pendingRequests.length})
                      </h4>

                      {pendingRequests.length === 0 ? (
                        <div className="p-8 text-center text-slate-500 text-xs bg-slate-900/50 border border-slate-800 rounded-xl">
                          No pending join requests at this time.
                        </div>
                      ) : (
                        pendingRequests.map((req) => (
                          <div
                            key={req.id}
                            className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl flex items-center justify-between gap-4"
                          >
                            <div>
                              <span className="font-semibold text-white text-xs">@{req.user?.username || 'Aspirant'}</span>
                              <span className="text-[11px] text-slate-400 block">
                                Target: {req.user?.target_exam || 'JEE Main'}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleApproveReject(req.id, true)}
                                className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-medium px-3 py-1.5 rounded-lg transition"
                              >
                                <UserCheck className="w-3.5 h-3.5" /> Accept
                              </button>
                              <button
                                onClick={() => handleApproveReject(req.id, false)}
                                className="flex items-center gap-1 bg-slate-800 hover:bg-rose-600/80 text-slate-300 hover:text-white text-[11px] font-medium px-3 py-1.5 rounded-lg transition"
                              >
                                <UserX className="w-3.5 h-3.5" /> Decline
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </>
              )}
            </>
          ) : (
            <div className="p-16 text-center text-slate-500 bg-slate-900/30 border border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center gap-2">
              <Users className="w-8 h-8 text-slate-600" />
              <p className="text-sm">Select a circle from the list to view its tests, announcements, and leaderboard</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal: Create Circle */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-base font-bold text-white">Create New Study Circle</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCircle} className="flex flex-col gap-4 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Circle Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex 99 Percentile Batch"
                  value={newCircle.name}
                  onChange={(e) => setNewCircle({ ...newCircle, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Target / Focus Description</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Focused on daily chapterwise problem tests..."
                  value={newCircle.description}
                  onChange={(e) => setNewCircle({ ...newCircle, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 font-semibold"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Admin Schedule Test */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-base font-bold text-white">Schedule Circle Test</h3>
              <button onClick={() => setShowScheduleModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleScheduleTest} className="flex flex-col gap-4 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Test Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mechanics Full Mock 01"
                  value={newTest.title}
                  onChange={(e) => setNewTest({ ...newTest, title: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Subject</label>
                  <select
                    value={newTest.subject}
                    onChange={(e) => setNewTest({ ...newTest, subject: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200"
                  >
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Mathematics">Mathematics</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Duration (Mins)</label>
                  <input
                    type="number"
                    min="15"
                    max="180"
                    value={newTest.durationMinutes}
                    onChange={(e) => setNewTest({ ...newTest, durationMinutes: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Chapter Focus</label>
                <input
                  type="text"
                  placeholder="e.g. Work Power Energy (or 'All')"
                  value={newTest.chapter}
                  onChange={(e) => setNewTest({ ...newTest, chapter: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 font-semibold"
                >
                  Schedule Test
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}