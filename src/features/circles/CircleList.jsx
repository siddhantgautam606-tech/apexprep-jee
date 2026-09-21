import React, { useState, useEffect } from 'react';
import { Users, Plus, Calendar, Clock, BookOpen, UserPlus, CheckCircle2, X } from 'lucide-react';
import {
  getAllCircles,
  getUserCircles,
  createCircle,
  joinCircle,
  getCircleMembers,
  getCircleTests,
  scheduleCircleTest
} from '../../services/circleService';

export default function CircleList({ currentUser, onStartTest }) {
  const [circles, setCircles] = useState([]);
  const [joinedIds, setJoinedIds] = useState(new Set());
  const [selectedCircle, setSelectedCircle] = useState(null);
  const [circleMembers, setCircleMembers] = useState([]);
  const [circleTests, setCircleTests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  // Form states
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
      const userCircles = await getUserCircles(currentUser.id);
      setJoinedIds(new Set(userCircles.map((c) => c.id)));
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [currentUser?.id]);

  const handleSelectCircle = async (circle) => {
    setSelectedCircle(circle);
    const [members, tests] = await Promise.all([
      getCircleMembers(circle.id),
      getCircleTests(circle.id)
    ]);
    setCircleMembers(members);
    setCircleTests(tests);
  };

  const handleCreateCircle = async (e) => {
    e.preventDefault();
    if (!currentUser?.id) {
      alert('Please log in to create a circle.');
      return;
    }
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

  const handleJoin = async (circleId, e) => {
    e?.stopPropagation();
    if (!currentUser?.id) {
      alert('Please log in to join a circle.');
      return;
    }
    const res = await joinCircle(circleId, currentUser.id);
    if (res.error) {
      alert(res.error);
    } else {
      setJoinedIds((prev) => new Set([...prev, circleId]));
      if (selectedCircle?.id === circleId) {
        const members = await getCircleMembers(circleId);
        setCircleMembers(members);
      }
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

  return (
    <div className="w-full max-w-5xl flex flex-col gap-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600/20 text-indigo-400 p-2.5 rounded-xl border border-indigo-600/30">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Friend Circles & Study Batches</h2>
            <p className="text-xs text-slate-400">Collaborate, take scheduled group mock tests, and compare rankings</p>
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
        {/* Left Column: Circle Directory */}
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold text-slate-300">Available Circles</h3>

          {loading ? (
            <div className="p-8 text-center text-slate-500 text-xs bg-slate-900/50 border border-slate-800 rounded-xl">
              Loading circles...
            </div>
          ) : circles.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs bg-slate-900/50 border border-slate-800 rounded-xl">
              No circles found. Be the first to create one!
            </div>
          ) : (
            circles.map((circle) => {
              const isJoined = joinedIds.has(circle.id);
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
                    {isJoined ? (
                      <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" /> Joined
                      </span>
                    ) : (
                      <button
                        onClick={(e) => handleJoin(circle.id, e)}
                        className="flex items-center gap-1 text-[11px] font-medium text-indigo-400 hover:text-white bg-indigo-600/20 hover:bg-indigo-600 px-2.5 py-1 rounded-md transition"
                      >
                        <UserPlus className="w-3 h-3" /> Join
                      </button>
                    )}
                  </div>
                  {circle.description && (
                    <p className="text-xs text-slate-400 line-clamp-2">{circle.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-[11px] text-slate-500 pt-2 border-t border-slate-800/80">
                    <span>{memberCount} member{memberCount !== 1 ? 's' : ''}</span>
                    <span>Created {new Date(circle.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Active Circle View (Members & Scheduled Tests) */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          {selectedCircle ? (
            <>
              {/* Circle Details & Actions */}
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col gap-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-bold text-white">{selectedCircle.name}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{selectedCircle.description || 'No description provided.'}</p>
                  </div>
                  {joinedIds.has(selectedCircle.id) && (
                    <button
                      onClick={() => setShowScheduleModal(true)}
                      className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium px-3.5 py-2 rounded-xl transition shrink-0"
                    >
                      <Calendar className="w-3.5 h-3.5" /> Schedule Test
                    </button>
                  )}
                </div>

                {/* Member Badges */}
                <div>
                  <h4 className="text-xs font-semibold text-slate-400 mb-2">
                    Circle Members ({circleMembers.length})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {circleMembers.map((m, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 px-2.5 py-1 rounded-lg text-xs"
                      >
                        <span className="text-slate-200 font-medium">
                          @{m.user?.username || 'user'}
                        </span>
                        {m.role === 'admin' && (
                          <span className="text-[10px] bg-indigo-600/30 text-indigo-400 font-bold px-1.5 rounded">
                            Admin
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Scheduled Tests List */}
              <div className="flex flex-col gap-3">
                <h4 className="text-sm font-semibold text-slate-300">Scheduled Group Tests</h4>
                {circleTests.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-xs bg-slate-900/50 border border-slate-800 rounded-xl">
                    No tests scheduled yet. Schedule one above to challenge your circle!
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
            </>
          ) : (
            <div className="p-16 text-center text-slate-500 bg-slate-900/30 border border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center gap-2">
              <Users className="w-8 h-8 text-slate-600" />
              <p className="text-sm">Select a circle from the list to view members and scheduled exams</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Circle Modal */}
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
                  placeholder="e.g. Kota Top 100 Batch"
                  value={newCircle.name}
                  onChange={(e) => setNewCircle({ ...newCircle, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Target / Focus Description</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Daily 60-min Physics tests & doubt clearing..."
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

      {/* Schedule Test Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-base font-bold text-white">Schedule Circle Mock Test</h3>
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
                  placeholder="e.g. Sunday Electrostatics Sprint"
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
                  placeholder="e.g. Rotational Dynamics (or leave 'All')"
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