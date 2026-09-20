import React, { useState, useEffect } from 'react';
import { 
  Users, Trophy, Calendar, Award, Play, Plus, 
  CheckCircle2, Clock, Search, ShieldCheck, Lock, ArrowRight,
  Megaphone, Send, AlertCircle
} from 'lucide-react';

const INITIAL_CIRCLES = [
  {
    id: 'circle-1',
    name: 'Top 100 IIT Bombay Dreamers',
    tag: '#IITB-2025',
    creator: 'rohan_iitb',
    members: ['rohan_iitb', 'priya_phy', 'math_wizard'],
    description: 'Daily 20m timed PYQ drills & mock reviews.',
    testsCount: 14,
    announcements: [
      {
        id: 'ann-1',
        sender: 'rohan_iitb',
        text: 'Welcome all! New Kinematics mock is scheduled for tonight. Be on time—test unlocks strictly at the set hour.',
        timestamp: 'Yesterday, 08:00 PM'
      }
    ]
  },
  {
    id: 'circle-2',
    name: 'Calculus & Mechanics Masters',
    tag: '#CALC-GODS',
    creator: 'math_wizard',
    members: ['math_wizard', 'ankit_99'],
    description: 'Targeting 99+ percentile in Math & Physics.',
    testsCount: 9,
    announcements: [
      {
        id: 'ann-2',
        sender: 'math_wizard',
        text: 'Next challenge will cover standard limits and L’Hôpital applications.',
        timestamp: '2 days ago'
      }
    ]
  }
];

const INITIAL_LEADERBOARD = [
  { username: 'rohan_iitb', name: 'Rohan Verma', points: 1420, avgAccuracy: 84, testsTaken: 18 },
  { username: 'priya_phy', name: 'Priya Patel', points: 1290, avgAccuracy: 79, testsTaken: 15 },
  { username: 'math_wizard', name: 'Aarav Sharma', points: 1150, avgAccuracy: 76, testsTaken: 14 },
  { username: 'ankit_99', name: 'Ankit Gupta', points: 980, avgAccuracy: 71, testsTaken: 11 }
];

export default function FriendCircleSection({ currentUser, onStartCircleTest }) {
  // Sub-Tabs: 'tests' | 'announcements' | 'rankings' | 'circles'
  const [subTab, setSubTab] = useState('tests');

  // Master Circles State
  const [circles, setCircles] = useState(() => {
    const saved = localStorage.getItem('apex_master_circles');
    return saved ? JSON.parse(saved) : INITIAL_CIRCLES;
  });

  const userCircles = circles.filter(c => c.members.includes(currentUser.username));
  const [activeCircleId, setActiveCircleId] = useState(userCircles[0]?.id || circles[0]?.id);

  // Search & Notice
  const [circleSearch, setCircleSearch] = useState('');
  const [joinStatusNotice, setJoinStatusNotice] = useState('');

  // Modals & Forms
  const [showCreateCircleModal, setShowCreateCircleModal] = useState(false);
  const [showScheduleTestModal, setShowScheduleTestModal] = useState(false);
  const [newCircleName, setNewCircleName] = useState('');
  const [newCircleTag, setNewCircleTag] = useState('');
  const [newCircleDesc, setNewCircleDesc] = useState('');

  // Scheduled Test Form Fields
  const [testTitle, setTestTitle] = useState('');
  const [testSubject, setTestSubject] = useState('Physics');
  const [testDate, setTestDate] = useState('');
  const [testTime, setTestTime] = useState('');
  const [testDuration, setTestDuration] = useState('20');
  const [testQCount, setTestQCount] = useState('10');

  // Creator Announcement input
  const [announcementText, setAnnouncementText] = useState('');

  // Clock state for real-time countdown updates
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const ticker = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(ticker);
  }, []);

  // Scheduled Tests inside circles
  const [circleTests, setCircleTests] = useState(() => {
    const saved = localStorage.getItem('apex_circle_tests');
    return saved ? JSON.parse(saved) : [
      {
        id: 'test-room-1',
        circleId: 'circle-1',
        creator: 'rohan_iitb',
        title: 'Kinematics & Projectile Showdown',
        subject: 'Physics',
        // Target set 1 hour from current time by default
        targetTimestamp: Date.now() + 3600000,
        formattedDateTime: 'Scheduled Today',
        durationMinutes: 20,
        questionCount: 10,
        participants: ['rohan_iitb', 'priya_phy']
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('apex_master_circles', JSON.stringify(circles));
  }, [circles]);

  useEffect(() => {
    localStorage.setItem('apex_circle_tests', JSON.stringify(circleTests));
  }, [circleTests]);

  const currentCircle = circles.find(c => c.id === activeCircleId) || circles[0];
  const isMember = currentCircle?.members.includes(currentUser.username);
  const isCreator = currentCircle?.creator === currentUser.username;

  // Format remaining time until test unlocks
  const getRemainingTime = (targetTimestamp) => {
    const diff = targetTimestamp - now;
    if (diff <= 0) return null;
    const hours = Math.floor(diff / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    const secs = Math.floor((diff % 60000) / 1000);
    return `${hours > 0 ? `${hours}h ` : ''}${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
  };

  // Schedule Test Handler (Creator Only)
  const handleScheduleTest = (e) => {
    e.preventDefault();
    if (!testTitle.trim() || !testDate || !testTime) return;

    const scheduledDateObj = new Date(`${testDate}T${testTime}`);
    const targetTimestamp = scheduledDateObj.getTime();

    if (isNaN(targetTimestamp)) {
      alert('Please enter a valid date and time.');
      return;
    }

    const newTest = {
      id: `test-room-${Date.now()}`,
      circleId: currentCircle.id,
      creator: currentUser.username,
      title: testTitle.trim(),
      subject: testSubject,
      targetTimestamp: targetTimestamp,
      formattedDateTime: `${testDate} at ${testTime}`,
      durationMinutes: parseInt(testDuration, 10),
      questionCount: parseInt(testQCount, 10),
      participants: [currentUser.username]
    };

    setCircleTests([newTest, ...circleTests]);
    setShowScheduleTestModal(false);
    setTestTitle('');
    setTestDate('');
    setTestTime('');
  };

  // Post Creator-Only Announcement
  const handlePostAnnouncement = (e) => {
    e.preventDefault();
    if (!announcementText.trim() || !isCreator) return;

    const newAnnouncement = {
      id: `ann-${Date.now()}`,
      sender: currentUser.username,
      text: announcementText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updated = circles.map(c => {
      if (c.id === currentCircle.id) {
        return {
          ...c,
          announcements: [newAnnouncement, ...(c.announcements || [])]
        };
      }
      return c;
    });

    setCircles(updated);
    setAnnouncementText('');
  };

  // Request to Join Logic
  const handleRequestToJoin = (circle) => {
    if (circle.members.includes(currentUser.username)) {
      setJoinStatusNotice(`You are already an authorized member of ${circle.name}.`);
      return;
    }

    const appKey = `apex_inbox_applications_${circle.creator}`;
    const currentApps = JSON.parse(localStorage.getItem(appKey) || '[]');

    if (currentApps.some(app => app.senderUsername === currentUser.username && app.circleId === circle.id)) {
      setJoinStatusNotice(`Request already pending creator (@${circle.creator}) authorization.`);
      return;
    }

    const application = {
      id: `app-${Date.now()}`,
      type: 'circle_join',
      circleId: circle.id,
      circleName: circle.name,
      senderUsername: currentUser.username,
      senderName: currentUser.name,
      senderExam: currentUser.targetExam,
      senderClass: currentUser.targetClass,
      requestedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    localStorage.setItem(appKey, JSON.stringify([application, ...currentApps]));
    setJoinStatusNotice(`Request dispatched! Waiting for authorization from creator @${circle.creator}.`);
  };

  const handleCreateCircle = (e) => {
    e.preventDefault();
    if (!newCircleName.trim() || !newCircleTag.trim()) return;

    const formattedTag = newCircleTag.startsWith('#') ? newCircleTag : `#${newCircleTag}`;

    const newCircle = {
      id: `circle-${Date.now()}`,
      name: newCircleName.trim(),
      tag: formattedTag.toUpperCase(),
      creator: currentUser.username,
      members: [currentUser.username],
      description: newCircleDesc || 'Serious JEE squad for daily test drills.',
      testsCount: 0,
      announcements: [
        {
          id: `ann-${Date.now()}`,
          sender: currentUser.username,
          text: `Welcome to ${newCircleName}! This is our circle's official broadcast feed.`,
          timestamp: 'Just now'
        }
      ]
    };

    setCircles([newCircle, ...circles]);
    setActiveCircleId(newCircle.id);
    setShowCreateCircleModal(false);
    setNewCircleName('');
    setNewCircleTag('');
    setNewCircleDesc('');
  };

  const currentCircleTests = circleTests.filter(t => t.circleId === currentCircle?.id);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-900/40 via-slate-900 to-indigo-950/40 border border-slate-800 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <Users className="w-4 h-4" /> Study Circle Hub
          </div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            {currentCircle?.name} <span className="text-sm font-normal text-blue-400 font-mono">{currentCircle?.tag}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Circle Leader: <strong className="text-slate-200">@{currentCircle?.creator}</strong> {isCreator && <span className="text-emerald-400 font-bold ml-1">(You)</span>} • {currentCircle?.members.length} Members
          </p>
        </div>

        {/* Sub-Tabs */}
        <div className="flex bg-slate-800/80 p-1.5 rounded-2xl border border-slate-700/60 self-stretch md:self-auto">
          <button
            onClick={() => setSubTab('tests')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
              subTab === 'tests' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" /> Tests
          </button>
          <button
            onClick={() => setSubTab('announcements')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
              subTab === 'announcements' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Megaphone className="w-3.5 h-3.5" /> Announcements
          </button>
          <button
            onClick={() => setSubTab('rankings')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
              subTab === 'rankings' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" /> Rankings
          </button>
          <button
            onClick={() => setSubTab('circles')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
              subTab === 'circles' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Search className="w-3.5 h-3.5" /> Circles
          </button>
        </div>
      </div>

      {joinStatusNotice && (
        <div className="p-3.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs rounded-2xl flex items-center justify-between">
          <span>{joinStatusNotice}</span>
          <button onClick={() => setJoinStatusNotice('')} className="text-slate-400 hover:text-white font-bold ml-2">×</button>
        </div>
      )}

      {/* =========================================================================
          SUB-SECTION 1: FIXED TIME SCHEDULED TESTS
          ========================================================================= */}
      {subTab === 'tests' && (
        <div className="space-y-4">
          {!isMember ? (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-10 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Authorized Members Only</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Send a join request to creator <strong>@{currentCircle?.creator}</strong> to access this circle’s scheduled tests.
              </p>
              <button
                onClick={() => handleRequestToJoin(currentCircle)}
                className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-6 py-2.5 rounded-xl transition shadow"
              >
                Send Join Authorization Request
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Scheduled Circle Tests</h3>
                  <p className="text-[11px] text-slate-400">Tests unlock synchronously at the exact scheduled date and time.</p>
                </div>

                {isCreator && (
                  <button
                    onClick={() => setShowScheduleTestModal(true)}
                    className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2 rounded-xl transition shadow flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" /> Organize Circle Test
                  </button>
                )}
              </div>

              {currentCircleTests.length === 0 ? (
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center text-slate-500 text-xs">
                  No tests scheduled in this circle yet. {isCreator && 'Click "Organize Circle Test" to set one up!'}
                </div>
              ) : (
                currentCircleTests.map(test => {
                  const remainingStr = getRemainingTime(test.targetTimestamp);
                  const isUnlocked = !remainingStr;

                  return (
                    <div key={test.id} className="bg-slate-900 border border-slate-800 rounded-3xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                            {test.subject}
                          </span>
                          <span className="text-xs text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {test.formattedDateTime}
                          </span>
                        </div>

                        <h4 className="text-sm font-bold text-white">{test.title}</h4>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {test.questionCount} Questions • {test.durationMinutes} Minutes • Scheduled by @{test.creator}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        {/* Status / Countdown Indicator */}
                        {!isUnlocked ? (
                          <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 px-4 py-2 rounded-xl text-amber-400 font-mono text-xs font-bold">
                            <Lock className="w-3.5 h-3.5" />
                            <span>Unlocks in {remainingStr}</span>
                          </div>
                        ) : (
                          <span className="text-emerald-400 font-bold text-xs flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Test Unlocked & Live
                          </span>
                        )}

                        <button
                          disabled={!isUnlocked}
                          onClick={() => onStartCircleTest && onStartCircleTest(test)}
                          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-lg flex-shrink-0 ${
                            isUnlocked 
                              ? 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer' 
                              : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-60'
                          }`}
                        >
                          <Play className="w-3.5 h-3.5 fill-current" /> Launch Test
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          SUB-SECTION 2: CREATOR-ONLY ANNOUNCEMENT CHANNEL
          ========================================================================= */}
      {subTab === 'announcements' && (
        <div className="space-y-4">
          {!isMember ? (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-10 text-center text-slate-400 text-xs">
              Join this circle to view official announcements from creator @{currentCircle?.creator}.
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Megaphone className="w-4 h-4 text-blue-400" /> Circle Broadcast Feed
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Official broadcast notices. Only the circle creator (@{currentCircle?.creator}) can post.
                  </p>
                </div>
                {isCreator ? (
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Leader Broadcasting Rights Active
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700 flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Read-Only Mode
                  </span>
                )}
              </div>

              {/* Creator Broadcast Composer Form */}
              {isCreator ? (
                <form onSubmit={handlePostAnnouncement} className="space-y-2 bg-slate-800/40 p-4 rounded-2xl border border-slate-800">
                  <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider block">
                    Broadcast a Message to Circle Members
                  </span>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      placeholder="Type test updates, tips, or study schedule for members..."
                      value={announcementText}
                      onChange={(e) => setAnnouncementText(e.target.value)}
                      className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                    <button
                      type="submit"
                      disabled={!announcementText.trim()}
                      className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold px-5 py-2 rounded-xl text-xs flex items-center gap-1.5 transition shadow"
                    >
                      <Send className="w-3.5 h-3.5" /> Broadcast
                    </button>
                  </div>
                </form>
              ) : (
                <div className="bg-slate-950/60 border border-slate-800 p-3.5 rounded-2xl flex items-center gap-2.5 text-xs text-slate-400">
                  <AlertCircle className="w-4 h-4 text-blue-400 flex-shrink-0" />
                  <span>Only circle creator <strong>@{currentCircle?.creator}</strong> has permission to post announcements.</span>
                </div>
              )}

              {/* Feed of Announcements */}
              <div className="space-y-3">
                {(currentCircle?.announcements || []).length === 0 ? (
                  <p className="text-center py-8 text-slate-500 text-xs">No announcements broadcasted yet.</p>
                ) : (
                  currentCircle.announcements.map(ann => (
                    <div key={ann.id} className="bg-slate-800/50 border border-slate-800 p-4 rounded-2xl space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">@{ann.sender}</span>
                          <span className="text-[9px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 font-semibold border border-blue-500/20">
                            Creator Notice
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono">{ann.timestamp}</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">{ann.text}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          SUB-SECTION 3: CIRCLE RANKINGS
          ========================================================================= */}
      {subTab === 'rankings' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" /> {currentCircle?.name} Leaderboard
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="border-b border-slate-800 text-slate-400 uppercase">
                <tr>
                  <th className="py-3 px-3">Rank</th>
                  <th className="py-3 px-3">Aspirant</th>
                  <th className="py-3 px-3">Tests Taken</th>
                  <th className="py-3 px-3">Accuracy</th>
                  <th className="py-3 px-3 text-right">Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {INITIAL_LEADERBOARD.map((u, i) => (
                  <tr key={u.username}>
                    <td className="py-3.5 px-3 font-mono text-amber-400 font-bold">#{i + 1}</td>
                    <td className="py-3.5 px-3">
                      <span className="text-white font-medium">{u.name}</span>
                      <span className="text-[11px] text-slate-400 block">@{u.username}</span>
                    </td>
                    <td className="py-3.5 px-3 font-mono text-slate-300">{u.testsTaken}</td>
                    <td className="py-3.5 px-3 font-mono text-blue-400">{u.avgAccuracy}%</td>
                    <td className="py-3.5 px-3 text-right font-mono font-bold text-emerald-400">{u.points} pts</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          SUB-SECTION 4: EXPLORE & JOIN CIRCLES
          ========================================================================= */}
      {subTab === 'circles' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search circles by name or #tag (e.g. #IITB)..."
                value={circleSearch}
                onChange={(e) => setCircleSearch(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <button
              onClick={() => setShowCreateCircleModal(true)}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white font-semibold px-5 py-2.5 rounded-2xl text-xs transition shadow flex items-center justify-center gap-1.5 flex-shrink-0"
            >
              <Plus className="w-4 h-4" /> Create New Circle
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {circles
              .filter(c => 
                c.name.toLowerCase().includes(circleSearch.toLowerCase()) || 
                c.tag.toLowerCase().includes(circleSearch.toLowerCase())
              )
              .map(circle => {
                const isMemberOfThis = circle.members.includes(currentUser.username);

                return (
                  <div key={circle.id} className="bg-slate-900 border border-slate-800 rounded-3xl p-5 flex flex-col justify-between hover:border-slate-700 transition">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-mono font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2.5 py-0.5 rounded-full">
                          {circle.tag}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          Leader: <strong className="text-slate-300">@{circle.creator}</strong>
                        </span>
                      </div>

                      <h4 className="text-base font-bold text-white mb-1">{circle.name}</h4>
                      <p className="text-xs text-slate-400 leading-relaxed mb-4">{circle.description}</p>
                    </div>

                    <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                      <span className="text-xs text-slate-400">
                        👥 {circle.members.length} Members
                      </span>

                      {isMemberOfThis ? (
                        <button
                          onClick={() => {
                            setActiveCircleId(circle.id);
                            setSubTab('tests');
                          }}
                          className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-1.5 rounded-xl text-xs font-semibold transition"
                        >
                          View Circle
                        </button>
                      ) : (
                        <button
                          onClick={() => handleRequestToJoin(circle)}
                          className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded-xl text-xs font-semibold transition shadow flex items-center gap-1"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" /> Request to Join
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* MODAL 1: ORGANIZE FIXED-TIME TEST (Creator Only) */}
      {showScheduleTestModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-400" /> Organize Circle Test (Fixed Date & Time)
            </h3>

            <form onSubmit={handleScheduleTest} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Test Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 2D Kinematics Weekly Mock"
                  value={testTitle}
                  onChange={(e) => setTestTitle(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Subject</label>
                <select
                  value={testSubject}
                  onChange={(e) => setTestSubject(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                >
                  <option value="Physics">Physics</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Mathematics">Mathematics</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={testDate}
                    onChange={(e) => setTestDate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Time</label>
                  <input
                    type="time"
                    required
                    value={testTime}
                    onChange={(e) => setTestTime(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1">Duration</label>
                  <select
                    value={testDuration}
                    onChange={(e) => setTestDuration(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="15">15 Minutes</option>
                    <option value="20">20 Minutes</option>
                    <option value="30">30 Minutes</option>
                    <option value="60">60 Minutes</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Questions</label>
                  <select
                    value={testQCount}
                    onChange={(e) => setTestQCount(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="5">5 Qs</option>
                    <option value="10">10 Qs</option>
                    <option value="15">15 Qs</option>
                    <option value="25">25 Qs</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowScheduleTestModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-500 shadow"
                >
                  Set Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CREATE CIRCLE */}
      {showCreateCircleModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-blue-400" /> Create a Friend Circle
            </h3>

            <form onSubmit={handleCreateCircle} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Circle Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. JEE 2025 Rankers Hub"
                  value={newCircleName}
                  onChange={(e) => setNewCircleName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Unique Tag (#)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. #RANKERS-HUB"
                  value={newCircleTag}
                  onChange={(e) => setNewCircleTag(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white uppercase font-mono"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Description</label>
                <textarea
                  rows="2"
                  placeholder="Circle goals & guidelines..."
                  value={newCircleDesc}
                  onChange={(e) => setNewCircleDesc(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateCircleModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-500 shadow"
                >
                  Create Circle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}