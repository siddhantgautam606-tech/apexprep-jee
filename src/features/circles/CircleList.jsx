import React, { useState, useEffect, useRef } from 'react';
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
  Hourglass,
  Lock,
  Trash2,
  CheckCircle,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import { getStandardQuestions, formatMathSymbols } from '../../data/jeeQuestionBank';
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
  addCustomQuestionToDB,
  fetchQuestionsForTest
} from '../../services/circleService';
import { supabase } from '../../services/supabaseClient';

function generateStandardQuestionSet(subject, chapter, count) {
  return getStandardQuestions(subject, chapter, count);
}

export default function CircleList({ currentUser, onStartTest, generateQuestionsForTest }) {
  const [circles, setCircles] = useState([]);
  const [membershipMap, setMembershipMap] = useState({});
  const [selectedCircle, setSelectedCircle] = useState(null);

  const [circleMembers, setCircleMembers] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [circleTests, setCircleTests] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);

  const [circleTab, setCircleTab] = useState('tests');
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [isGeneratingTest, setIsGeneratingTest] = useState(false);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showAddQuestionModal, setShowAddQuestionModal] = useState(false);
  const [announcementMsg, setAnnouncementMsg] = useState('');

  // Add Question State
  const [newQuestionData, setNewQuestionData] = useState({
    subject: 'Physics',
    chapter: 'All',
    question: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctAnswer: 0,
    explanation: ''
  });

  // Exam Interface Modal
  const [activeExam, setActiveExam] = useState(null);
  const [examAnswers, setExamAnswers] = useState({});
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [examSubmitted, setExamSubmitted] = useState(false);
  const [examScoreResult, setExamScoreResult] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);

  const announcementsEndRef = useRef(null);

  const [newCircle, setNewCircle] = useState({ name: '', description: '' });
  const [newTest, setNewTest] = useState({
    title: '',
    subject: 'Physics',
    chapter: 'All',
    durationMinutes: 60,
    questionCount: 5,
    windowStart: '',
    windowEnd: ''
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

  useEffect(() => {
    if (circleTab === 'announcements') {
      announcementsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [announcements, circleTab]);

  // Exam timer countdown
  useEffect(() => {
    if (!activeExam || examSubmitted || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleExamSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [activeExam, examSubmitted, timeLeft]);

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
    const sortedAnn = Array.isArray(ann)
      ? [...ann].sort((a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0))
      : [];
    setAnnouncements(sortedAnn);
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

  const handleDeleteCircle = async () => {
    if (!selectedCircle || !currentUser?.id) return;
    const confirm = window.confirm(
      `Are you sure you want to PERMANENTLY delete "${selectedCircle.name}"? This action cannot be undone.`
    );
    if (!confirm) return;

    const res = await deleteCircle(selectedCircle.id, currentUser.id);
    if (res.error) {
      alert(res.error);
    } else {
      setSelectedCircle(null);
      await loadData();
    }
  };

  const handleJoinRequestClick = async (circleId, e) => {
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

  const handleApproveReject = async (req, accept) => {
    const targetUserId = req.user_id || req.user?.id;
    const recordId = req.id;
    setProcessingId(recordId || targetUserId);

    const res = await handleJoinRequest({
      circleId: selectedCircle.id,
      userId: targetUserId,
      memberRecordId: recordId,
      accept
    });

    setProcessingId(null);

    if (res.error) {
      alert('Action failed: ' + res.error);
    } else {
      const refreshed = await getCircleMembers(selectedCircle.id);
      setCircleMembers(refreshed.approved);
      setPendingRequests(refreshed.pending);
      await loadData();
    }
  };

  const handleScheduleTest = async (e) => {
    e.preventDefault();
    if (!selectedCircle || !currentUser?.id) return;

    setIsGeneratingTest(true);
    let questions = [];

    if (typeof generateQuestionsForTest === 'function') {
      try {
        questions = await generateQuestionsForTest({
          subject: newTest.subject,
          chapter: newTest.chapter,
          count: Number(newTest.questionCount) || 5
        });
      } catch (err) {
        console.error('Error generating questions via prop:', err);
      }
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      if (typeof fetchQuestionsForTest === 'function') {
        questions = await fetchQuestionsForTest(
          newTest.subject,
          newTest.chapter,
          Number(newTest.questionCount) || 5
        );
      } else {
        questions = generateStandardQuestionSet(
          newTest.subject,
          newTest.chapter,
          Number(newTest.questionCount) || 5
        );
      }
    }

    const res = await scheduleCircleTest(
      selectedCircle.id,
      { ...newTest, questions },
      currentUser.id
    );

    setIsGeneratingTest(false);

    if (res.error) {
      alert(res.error);
    } else {
      setShowScheduleModal(false);
      setNewTest({
        title: '',
        subject: 'Physics',
        chapter: 'All',
        durationMinutes: 60,
        questionCount: 5,
        windowStart: '',
        windowEnd: ''
      });
      const tests = await getCircleTests(selectedCircle.id);
      setCircleTests(tests);
    }
  };

  const handleCreateQuestionSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser?.id) return alert('Please sign in first.');
    if (!newQuestionData.question.trim()) return alert('Question text is required.');

    const payload = {
      subject: newQuestionData.subject,
      chapter: newQuestionData.chapter,
      question: newQuestionData.question,
      options: [
        newQuestionData.optionA,
        newQuestionData.optionB,
        newQuestionData.optionC,
        newQuestionData.optionD
      ],
      correctAnswer: Number(newQuestionData.correctAnswer),
      explanation: newQuestionData.explanation
    };

    if (typeof addCustomQuestionToDB === 'function') {
      const res = await addCustomQuestionToDB(payload, currentUser.id);
      if (res.error) {
        alert('Failed to save question: ' + res.error);
      } else {
        alert('Question added successfully to the website question pool!');
        setShowAddQuestionModal(false);
        setNewQuestionData({
          subject: 'Physics',
          chapter: 'All',
          question: '',
          optionA: '',
          optionB: '',
          optionC: '',
          optionD: '',
          correctAnswer: 0,
          explanation: ''
        });
      }
    } else {
      alert('Database addition is not configured in circleService.');
    }
  };

  const handleDeleteTest = async (testId, e) => {
    e?.stopPropagation();
    const confirm = window.confirm('Are you sure you want to delete this test?');
    if (!confirm) return;

    const res = await deleteCircleTest(testId);
    if (res.error) {
      alert(res.error);
    } else {
      setCircleTests((prev) => prev.filter((t) => t.id !== testId));
    }
  };

  const handleAttemptTest = (test) => {
    let questions = [];

    if (Array.isArray(test.questions) && test.questions.length > 0) {
      questions = test.questions.map((q) => ({
        ...q,
        question: formatMathSymbols(q.question),
        options: Array.isArray(q.options) ? q.options.map((opt) => formatMathSymbols(opt)) : [],
        explanation: formatMathSymbols(q.explanation || '')
      }));
    } else {
      questions = generateStandardQuestionSet(
        test.subject,
        test.chapter,
        Number(test.question_count) || 5
      );
    }

    const standardizedTest = {
      ...test,
      questions
    };

    setActiveExam(standardizedTest);
    setExamAnswers({});
    setCurrentQIndex(0);
    setExamSubmitted(false);
    setExamScoreResult(null);
    setTimeLeft((Number(test.duration_minutes) || 60) * 60);
  };

  const handleExamSubmit = async () => {
    if (!activeExam || !currentUser?.id) return;

    const questions = activeExam.questions || [];
    let correctCount = 0;

    questions.forEach((q, idx) => {
      if (examAnswers[idx] === q.correctAnswer) {
        correctCount += 1;
      }
    });

    const attemptedCount = Object.keys(examAnswers).length;
    const incorrectCount = attemptedCount - correctCount;
    const score = correctCount * 4 - incorrectCount * 1;
    const finalScore = Math.max(0, score);
    const accuracy = attemptedCount > 0 ? ((correctCount / attemptedCount) * 100).toFixed(1) : 0;

    try {
      await supabase
        .from('circle_test_submissions')
        .upsert(
          [
            {
              circle_id: selectedCircle.id,
              test_id: activeExam.id,
              user_id: currentUser.id,
              score: finalScore,
              total_marks: questions.length * 4,
              accuracy_pct: Number(accuracy),
              submitted_at: new Date().toISOString()
            }
          ],
          { onConflict: 'test_id,user_id' }
        );

      const refreshedRanks = await getCircleLeaderboard(selectedCircle.id);
      setLeaderboard(refreshedRanks);
    } catch (err) {
      console.error('Error submitting exam to leaderboard:', err);
    }

    setExamScoreResult({
      correct: correctCount,
      total: questions.length,
      attempted: attemptedCount,
      score: finalScore,
      accuracy
    });
    setExamSubmitted(true);
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
      const sortedAnn = Array.isArray(ann)
        ? [...ann].sort((a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0))
        : [];
      setAnnouncements(sortedAnn);
    }
  };

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const isCircleAdmin =
    selectedCircle &&
    currentUser?.id &&
    (selectedCircle.created_by === currentUser.id ||
      membershipMap[selectedCircle.id]?.role === 'admin');

  const isCircleCreator = selectedCircle?.created_by === currentUser?.id;
  const userStatus = selectedCircle ? membershipMap[selectedCircle.id]?.status : null;
  const isApprovedMember = userStatus === 'approved' || isCircleAdmin;

  return (
    <div className="w-full max-w-5xl flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600/20 text-indigo-400 p-2.5 rounded-xl border border-indigo-600/30">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Friend Circles & Cohorts</h2>
            <p className="text-xs text-slate-400">Admin-gated study circles with uniform timed tests, notices & rank boards</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddQuestionModal(true)}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-slate-700 transition shrink-0"
          >
            <Plus className="w-4 h-4 text-emerald-400" /> Add to Question Pool
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow transition shrink-0"
          >
            <Plus className="w-4 h-4" /> Create Circle
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                        onClick={(e) => handleJoinRequestClick(circle.id, e)}
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

        <div className="lg:col-span-2 flex flex-col gap-5">
          {selectedCircle ? (
            <>
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
                    {isCircleAdmin && (
                      <button
                        onClick={() => setShowScheduleModal(true)}
                        className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium px-3 py-1.5 rounded-xl transition shadow"
                      >
                        <Calendar className="w-3.5 h-3.5" /> Schedule Test
                      </button>
                    )}

                    {isApprovedMember && !isCircleCreator && (
                      <button
                        onClick={handleLeaveCircle}
                        title="Leave this Circle"
                        className="flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 px-3 py-1.5 rounded-xl transition"
                      >
                        <LogOut className="w-3.5 h-3.5" /> Leave
                      </button>
                    )}

                    {isCircleCreator && (
                      <button
                        onClick={handleDeleteCircle}
                        title="Permanently Delete Circle"
                        className="flex items-center gap-1 text-xs text-rose-400 hover:text-white bg-rose-500/10 hover:bg-rose-600 border border-rose-500/30 px-3 py-1.5 rounded-xl transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete Circle
                      </button>
                    )}
                  </div>
                </div>

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

                  {isCircleAdmin && (
                    <button
                      onClick={() => setCircleTab('admin')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition ml-auto ${
                        circleTab === 'admin'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold'
                          : 'text-amber-400/80 hover:text-amber-300'
                      }`}
                    >
                      <UserPlus className="w-3.5 h-3.5" /> Requests ({pendingRequests.length})
                    </button>
                  )}
                </div>
              </div>

              {!isApprovedMember ? (
                <div className="bg-slate-900/60 border border-slate-800 p-8 rounded-2xl text-center flex flex-col items-center justify-center gap-2">
                  <Lock className="w-8 h-8 text-amber-400/60 mb-1" />
                  <h4 className="text-sm font-semibold text-slate-200">Gated Circle</h4>
                  <p className="text-xs text-slate-400 max-w-sm">
                    {userStatus === 'pending'
                      ? 'Your join request is awaiting circle admin authorization. You will gain full access as soon as it is approved.'
                      : 'You must request and be granted admission by the circle admin to view tests, announcements, and ranks.'}
                  </p>
                </div>
              ) : (
                <>
                  {circleTab === 'tests' && (
                    <div className="flex flex-col gap-3">
                      {circleTests.length === 0 ? (
                        <div className="p-8 text-center text-slate-500 text-xs bg-slate-900/50 border border-slate-800 rounded-xl">
                          No tests scheduled yet. {isCircleAdmin ? 'Click "Schedule Test" above to configure a test for all members.' : 'Circle admin has not scheduled any exams yet.'}
                        </div>
                      ) : (
                        circleTests.map((test) => {
                          const now = new Date();
                          const start = test.window_start ? new Date(test.window_start) : null;
                          const end = test.window_end ? new Date(test.window_end) : null;

                          const isUpcoming = start && now < start;
                          const isOpen = (!start || now >= start) && (!end || now <= end);

                          return (
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
                                  <span className="text-[10px] font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2 py-0.5 rounded">
                                    {Array.isArray(test.questions) && test.questions.length > 0 ? test.questions.length : 5} Qs (Standardized Paper)
                                  </span>
                                </div>
                                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1">
                                  <span className="flex items-center gap-1">
                                    <BookOpen className="w-3.5 h-3.5 text-slate-500" /> {test.chapter}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3.5 h-3.5 text-slate-500" /> {test.duration_minutes} mins
                                  </span>
                                  {start && end && (
                                    <span className="text-[11px] text-indigo-400 bg-indigo-950/40 px-2 py-0.5 rounded border border-indigo-800/40">
                                      Window: {start.toLocaleDateString()} {start.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {end.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                {isOpen ? (
                                  <button
                                    onClick={() => handleAttemptTest(test)}
                                    className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-2 rounded-xl transition shadow"
                                  >
                                    Attempt Test
                                  </button>
                                ) : isUpcoming ? (
                                  <span className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-lg">
                                    Opens at {start?.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                  </span>
                                ) : (
                                  <span className="text-xs text-slate-500 bg-slate-800/60 px-3 py-1.5 rounded-lg">
                                    Window Closed
                                  </span>
                                )}

                                {isCircleAdmin && (
                                  <button
                                    onClick={(e) => handleDeleteTest(test.id, e)}
                                    title="Delete this test"
                                    className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 rounded-xl transition"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}

                  {circleTab === 'announcements' && (
                    <div className="bg-slate-950 border border-slate-800 rounded-2xl flex flex-col h-[calc(100vh-250px)] min-h-[560px] max-h-[780px] overflow-hidden shadow-2xl">
                      <div className="p-4 px-5 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                            <Megaphone className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-bold text-white tracking-wide">
                                #{selectedCircle.name} Announcements
                              </h4>
                              <span className="text-[10px] font-semibold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 px-2 py-0.5 rounded">
                                Official Notice Board
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400">
                              Admin broadcasts, test schedules, and cohort updates
                            </p>
                          </div>
                        </div>

                        <span className="text-xs text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700/60 hidden sm:inline-block">
                          {circleMembers.length} Subscriber{circleMembers.length !== 1 ? 's' : ''}
                        </span>
                      </div>

                      <div className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col gap-4">
                        {announcements.length === 0 ? (
                          <div className="m-auto text-center flex flex-col items-center gap-2 text-slate-500 text-xs py-12">
                            <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-600">
                              <Megaphone className="w-6 h-6" />
                            </div>
                            <p className="font-medium text-slate-400">No announcements posted yet.</p>
                            <p className="text-[11px] text-slate-500 max-w-xs">
                              {isCircleAdmin
                                ? 'Broadcast schedules, test links, or motivation messages below.'
                                : 'Check back later for updates from your circle admin.'}
                            </p>
                          </div>
                        ) : (
                          announcements.map((a) => {
                            const authorName = a.author?.username || 'Circle Admin';
                            const initial = authorName[0]?.toUpperCase() || 'A';
                            const timeStr = a.created_at
                              ? new Date(a.created_at).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })
                              : '';
                            const dateStr = a.created_at
                              ? new Date(a.created_at).toLocaleDateString([], {
                                  month: 'short',
                                  day: 'numeric'
                                })
                              : '';

                            return (
                              <div
                                key={a.id}
                                className="bg-slate-900/90 border border-slate-800 p-4 md:p-5 rounded-2xl max-w-2xl self-start flex gap-3.5 shadow-md"
                              >
                                <div className="w-9 h-9 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300 font-bold text-xs shrink-0">
                                  {initial}
                                </div>

                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1.5">
                                    <span className="text-xs font-bold text-indigo-400">
                                      @{authorName}
                                    </span>
                                    <span className="text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1.5 py-0.2 rounded">
                                      Admin
                                    </span>
                                    <span className="text-[10px] text-slate-500 ml-auto">
                                      {dateStr} - {timeStr}
                                    </span>
                                  </div>

                                  <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">
                                    {a.message}
                                  </p>
                                </div>
                              </div>
                            );
                          })
                        )}
                        <div ref={announcementsEndRef} />
                      </div>

                      {isCircleAdmin ? (
                        <form
                          onSubmit={handleSendAnnouncement}
                          className="p-3 md:p-4 border-t border-slate-800 bg-slate-900/95 flex items-center gap-2.5"
                        >
                          <input
                            type="text"
                            placeholder={`Broadcast an announcement to #${selectedCircle.name}...`}
                            value={announcementMsg}
                            onChange={(e) => setAnnouncementMsg(e.target.value)}
                            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-200 outline-none focus:border-indigo-500 transition placeholder:text-slate-500"
                          />
                          <button
                            type="submit"
                            disabled={!announcementMsg.trim()}
                            className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white px-5 py-3 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow"
                          >
                            <Send className="w-3.5 h-3.5" /> Broadcast
                          </button>
                        </form>
                      ) : (
                        <div className="p-3 text-center text-[11px] text-slate-500 border-t border-slate-800 bg-slate-950/80">
                          Broadcasts are exclusive to the Circle Admin. Members receive notifications in read-only mode.
                        </div>
                      )}
                    </div>
                  )}

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
                                  {idx === 0 ? '1' : idx === 1 ? '2' : idx === 2 ? '3' : `#${idx + 1}`}
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
                        pendingRequests.map((req) => {
                          const isActing = processingId === (req.id || req.user_id || req.user?.id);

                          return (
                            <div
                              key={req.id || req.user_id || req.user?.id}
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
                                  disabled={isActing}
                                  onClick={() => handleApproveReject(req, true)}
                                  className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-[11px] font-medium px-3 py-1.5 rounded-lg transition"
                                >
                                  <UserCheck className="w-3.5 h-3.5" /> {isActing ? 'Updating...' : 'Accept'}
                                </button>
                                <button
                                  disabled={isActing}
                                  onClick={() => handleApproveReject(req, false)}
                                  className="flex items-center gap-1 bg-slate-800 hover:bg-rose-600/80 disabled:opacity-50 text-slate-300 hover:text-white text-[11px] font-medium px-3 py-1.5 rounded-lg transition"
                                >
                                  <UserX className="w-3.5 h-3.5" /> {isActing ? '...' : 'Decline'}
                                </button>
                              </div>
                            </div>
                          );
                        })
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

      {activeExam && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl p-6 shadow-2xl flex flex-col gap-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white">{activeExam.title}</h3>
                <span className="text-[11px] text-slate-400">
                  Standardized Exam - {activeExam.questions?.length || 0} Questions - Marking: +4, -1
                </span>
              </div>
              <div className="flex items-center gap-3">
                {!examSubmitted && (
                  <div className="flex items-center gap-1.5 bg-slate-800 text-amber-400 font-mono text-xs px-3 py-1 rounded-lg border border-slate-700">
                    <Clock className="w-3.5 h-3.5" /> {formatTimer(timeLeft)}
                  </div>
                )}
                <button
                  onClick={() => setActiveExam(null)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {!examSubmitted ? (
              activeExam.questions && activeExam.questions.length > 0 && (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between text-xs text-indigo-400 font-semibold">
                    <span>Question {currentQIndex + 1} of {activeExam.questions.length}</span>
                    <span className="text-slate-400">{activeExam.subject} - {activeExam.chapter}</span>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-sm text-slate-200 font-medium">
                    {activeExam.questions[currentQIndex].question}
                  </div>

                  <div className="grid grid-cols-1 gap-2.5">
                    {activeExam.questions[currentQIndex].options.map((opt, optIdx) => {
                      const isChosen = examAnswers[currentQIndex] === optIdx;
                      return (
                        <button
                          key={optIdx}
                          onClick={() =>
                            setExamAnswers((prev) => ({ ...prev, [currentQIndex]: optIdx }))
                          }
                          className={`p-3 rounded-xl border text-left text-xs transition flex items-center gap-3 ${
                            isChosen
                              ? 'bg-indigo-600/20 border-indigo-500 text-white font-semibold'
                              : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          <span
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold border ${
                              isChosen
                                ? 'bg-indigo-600 border-indigo-400 text-white'
                                : 'bg-slate-900 border-slate-700 text-slate-400'
                            }`}
                          >
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span>{opt}</span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                    <button
                      disabled={currentQIndex === 0}
                      onClick={() => setCurrentQIndex((prev) => prev - 1)}
                      className="flex items-center gap-1 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs disabled:opacity-40 transition"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" /> Previous
                    </button>

                    {currentQIndex < activeExam.questions.length - 1 ? (
                      <button
                        onClick={() => setCurrentQIndex((prev) => prev + 1)}
                        className="flex items-center gap-1 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition"
                      >
                        Next <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        onClick={handleExamSubmit}
                        className="flex items-center gap-1 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow"
                      >
                        Submit Test Paper
                      </button>
                    )}
                  </div>
                </div>
              )
            ) : (
              <div className="flex flex-col items-center justify-center gap-4 py-6 text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white">Test Submitted Successfully!</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Your result has been registered to the Circle Leaderboard.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-4 w-full max-w-md bg-slate-950 p-4 rounded-xl border border-slate-800 mt-2">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Score</span>
                    <span className="text-base font-bold text-indigo-400">{examScoreResult?.score} pts</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Correct</span>
                    <span className="text-base font-bold text-emerald-400">
                      {examScoreResult?.correct} / {examScoreResult?.total}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Accuracy</span>
                    <span className="text-base font-bold text-amber-400">{examScoreResult?.accuracy}%</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setActiveExam(null);
                    setCircleTab('leaderboard');
                  }}
                  className="mt-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition"
                >
                  View Circle Leaderboard
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {showAddQuestionModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl p-6 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div>
                <h3 className="text-base font-bold text-white">Add Question to Pool</h3>
                <p className="text-[11px] text-slate-400">Questions added here automatically populate both test modes</p>
              </div>
              <button onClick={() => setShowAddQuestionModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateQuestionSubmit} className="flex flex-col gap-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Subject</label>
                  <select
                    value={newQuestionData.subject}
                    onChange={(e) => setNewQuestionData({ ...newQuestionData, subject: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200"
                  >
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Mathematics">Mathematics</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Chapter</label>
                  <input
                    type="text"
                    placeholder="e.g. Thermodynamics or All"
                    value={newQuestionData.chapter}
                    onChange={(e) => setNewQuestionData({ ...newQuestionData, chapter: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Question Prompt</label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. A particle moves with velocity v = k*sqrt(x)..."
                  value={newQuestionData.question}
                  onChange={(e) => setNewQuestionData({ ...newQuestionData, question: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 font-mono text-[11px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-slate-400 block mb-1">Option A</label>
                  <input
                    type="text"
                    required
                    placeholder="Option A"
                    value={newQuestionData.optionA}
                    onChange={(e) => setNewQuestionData({ ...newQuestionData, optionA: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Option B</label>
                  <input
                    type="text"
                    required
                    placeholder="Option B"
                    value={newQuestionData.optionB}
                    onChange={(e) => setNewQuestionData({ ...newQuestionData, optionB: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Option C</label>
                  <input
                    type="text"
                    required
                    placeholder="Option C"
                    value={newQuestionData.optionC}
                    onChange={(e) => setNewQuestionData({ ...newQuestionData, optionC: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Option D</label>
                  <input
                    type="text"
                    required
                    placeholder="Option D"
                    value={newQuestionData.optionD}
                    onChange={(e) => setNewQuestionData({ ...newQuestionData, optionD: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Correct Answer</label>
                <select
                  value={newQuestionData.correctAnswer}
                  onChange={(e) => setNewQuestionData({ ...newQuestionData, correctAnswer: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                >
                  <option value={0}>Option A</option>
                  <option value={1}>Option B</option>
                  <option value={2}>Option C</option>
                  <option value={3}>Option D</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Explanation (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="Solution steps or key formula..."
                  value={newQuestionData.explanation}
                  onChange={(e) => setNewQuestionData({ ...newQuestionData, explanation: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 text-[11px]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddQuestionModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow"
                >
                  Save to Pool
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
                  placeholder="e.g. Daily chapterwise problem tests & rank analysis..."
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
                  placeholder="e.g. Electrostatics Full Sprint"
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
                    min="1"
                    max="180"
                    value={newTest.durationMinutes}
                    onChange={(e) => setNewTest({ ...newTest, durationMinutes: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Chapter Focus</label>
                  <input
                    type="text"
                    placeholder="e.g. Current Electricity (or 'All')"
                    value={newTest.chapter}
                    onChange={(e) => setNewTest({ ...newTest, chapter: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Number of Questions</label>
                  <input
                    type="number"
                    min="5"
                    max="30"
                    value={newTest.questionCount}
                    onChange={(e) => setNewTest({ ...newTest, questionCount: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Window Starts</label>
                  <input
                    type="datetime-local"
                    value={newTest.windowStart}
                    onChange={(e) => setNewTest({ ...newTest, windowStart: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Window Ends</label>
                  <input
                    type="datetime-local"
                    value={newTest.windowEnd}
                    onChange={(e) => setNewTest({ ...newTest, windowEnd: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                  />
                </div>
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
                  disabled={isGeneratingTest}
                  className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 font-semibold disabled:opacity-50"
                >
                  {isGeneratingTest ? 'Generating Standard Paper...' : 'Schedule Test for All'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}