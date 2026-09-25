import { supabase } from './supabaseClient';
import { getStandardQuestions } from '../data/jeeQuestionBank';
import { getStandardNEETQuestions } from '../data/neetQuestionBank';
import { normalizeExam } from '../config/examConfig';

/**
 * Circles CRUD & Fetching
 */
export async function getAllCircles() {
  try {
    const { data: circles, error } = await supabase
      .from('circles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (!circles || circles.length === 0) return [];

    // Fetch profiles to get creator usernames
    const creatorIds = Array.from(new Set(circles.map((c) => c.created_by).filter(Boolean)));
    let profileMap = {};

    if (creatorIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, username')
        .in('id', creatorIds);

      (profiles || []).forEach((p) => {
        profileMap[p.id] = p.username;
      });
    }

    return circles.map((c) => ({
      ...c,
      creator: { username: profileMap[c.created_by] || 'Aspirant' }
    }));
  } catch (err) {
    console.error('Error fetching circles:', err);
    return [];
  }
}

export async function getUserCircleMemberships(userId) {
  if (!userId) return [];
  try {
    const { data, error } = await supabase
      .from('circle_members')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error fetching memberships:', err);
    return [];
  }
}

export async function createCircle(name, description, userId) {
  try {
    const { data: circle, error } = await supabase
      .from('circles')
      .insert([{ name, description, created_by: userId }])
      .select()
      .single();

    if (error) throw error;

    // Add creator as approved admin
    await supabase.from('circle_members').insert([
      {
        circle_id: circle.id,
        user_id: userId,
        role: 'admin',
        status: 'approved'
      }
    ]);

    return { data: circle, error: null };
  } catch (err) {
    console.error('Error creating circle:', err);
    return { data: null, error: err.message };
  }
}

export async function deleteCircle(circleId, userId) {
  try {
    const { error } = await supabase
      .from('circles')
      .delete()
      .eq('id', circleId);

    if (error) throw error;
    return { error: null };
  } catch (err) {
    console.error('Error deleting circle:', err);
    return { error: err.message };
  }
}

export async function requestJoinCircle(circleId, userId) {
  try {
    const { error } = await supabase.from('circle_members').insert([
      {
        circle_id: circleId,
        user_id: userId,
        role: 'member',
        status: 'pending'
      }
    ]);
    if (error) throw error;
    return { error: null };
  } catch (err) {
    console.error('Error joining circle:', err);
    return { error: err.message };
  }
}

export async function leaveCircle(circleId, userId) {
  try {
    const { error } = await supabase
      .from('circle_members')
      .delete()
      .eq('circle_id', circleId)
      .eq('user_id', userId);

    if (error) throw error;
    return { error: null };
  } catch (err) {
    console.error('Error leaving circle:', err);
    return { error: err.message };
  }
}

export async function getCircleMembers(circleId) {
  try {
    const { data, error } = await supabase
      .from('circle_members')
      .select('*')
      .eq('circle_id', circleId);

    if (error) throw error;
    if (!data || data.length === 0) return { approved: [], pending: [] };

    const userIds = Array.from(new Set(data.map((m) => m.user_id).filter(Boolean)));
    let profileMap = {};

    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, username, target_exam')
        .in('id', userIds);

      (profiles || []).forEach((p) => {
        profileMap[p.id] = p;
      });
    }

    const approved = [];
    const pending = [];

    data.forEach((m) => {
      const profile = profileMap[m.user_id] || {
        username: 'Aspirant',
        target_exam: 'JEE Main'
      };
      const enriched = { ...m, user: profile };

      if (m.status === 'pending') {
        pending.push(enriched);
      } else {
        approved.push(enriched);
      }
    });

    return { approved, pending };
  } catch (err) {
    console.error('Error fetching members:', err);
    return { approved: [], pending: [] };
  }
}

export async function handleJoinRequest({ memberRecordId, accept }) {
  try {
    if (accept) {
      await supabase
        .from('circle_members')
        .update({ status: 'approved' })
        .eq('id', memberRecordId);
    } else {
      await supabase
        .from('circle_members')
        .delete()
        .eq('id', memberRecordId);
    }
  } catch (err) {
    console.error('Error handling join request:', err);
  }
}

/**
 * Circle Tests CRUD
 */
export async function getCircleTests(circleId) {
  try {
    const { data, error } = await supabase
      .from('circle_tests')
      .select('*')
      .eq('circle_id', circleId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error fetching circle tests:', err);
    return [];
  }
}

export async function scheduleCircleTest(circleId, testConfig, userId) {
  try {
    const { data, error } = await supabase
      .from('circle_tests')
      .insert([
        {
          circle_id: circleId,
          exam: testConfig.exam || 'JEE Main',
          title: testConfig.title || 'Untitled Test',
          subject: testConfig.subject || 'All',
          chapter: testConfig.chapter || 'All',
          duration_minutes: Number(testConfig.durationMinutes) || 60,
          question_count: Number(testConfig.questionCount) || 5,
          total_questions: Number(testConfig.questionCount) || 5,
          questions: testConfig.questions || [],
          created_by: userId
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    console.error('Error scheduling circle test:', err);
    return { data: null, error: err.message };
  }
}

export async function deleteCircleTest(testId) {
  try {
    const { error } = await supabase
      .from('circle_tests')
      .delete()
      .eq('id', testId);

    if (error) throw error;
    return { error: null };
  } catch (err) {
    console.error('Error deleting test:', err);
    return { error: err.message };
  }
}

/**
 * Question fetching helper for test scheduling
 */
function normalizeCircleQuestion(q, idx) {
  return {
    id: q.id || idx + 1,
    question: q.question,
    options: Array.isArray(q.options) ? q.options : [],
    correctAnswer: q.correctAnswer !== undefined ? q.correctAnswer : q.correct_answer,
    explanation: q.explanation || '',
    subject: q.subject,
    chapter: q.chapter,
    yearTag: q.year_tag || q.yearTag
  };
}

function shuffleCircleQuestionOptions(question) {
  if (!Array.isArray(question?.options) || question.options.length < 2) return question;
  const correctIndex = Number(question.correctAnswer);
  if (!Number.isInteger(correctIndex) || correctIndex < 0 || correctIndex >= question.options.length) return question;
  const pairs = question.options.map((option, index) => ({ option, index }));
  for (let i = pairs.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [pairs[i], pairs[j]] = [pairs[j], pairs[i]];
  }
  return {
    ...question,
    options: pairs.map((p) => p.option),
    correctAnswer: pairs.findIndex((p) => p.index === correctIndex)
  };
}

export async function fetchQuestionsForTest(subject, chapter, count, exam = 'JEE Main') {
  const normalizedExam = normalizeExam(exam);
  const requestedCount = Math.max(1, Number(count) || 10);
  const subjects = normalizedExam === 'NEET'
    ? ['Physics', 'Chemistry', 'Biology']
    : ['Physics', 'Chemistry', 'Mathematics'];

  const buildForSubject = async (targetSubject, targetCount) => {
    try {
      let query = supabase.from('custom_questions').select('*').eq('exam', normalizedExam);
      if (targetSubject && targetSubject !== 'All' && targetSubject !== 'Full Syllabus') {
        query = query.eq('subject', targetSubject);
      }
      if (chapter && chapter !== 'All') query = query.eq('chapter', chapter);
      const { data, error } = await query.limit(Math.max(targetCount * 2, targetCount));
      if (error) throw error;
      return (data || []).map(normalizeCircleQuestion);
    } catch {
      return [];
    }
  };

  try {
    if (subject === 'All' || subject === 'Full Syllabus') {
      const base = Math.floor(requestedCount / subjects.length);
      let remainder = requestedCount % subjects.length;
      const combined = [];
      for (const targetSubject of subjects) {
        const targetCount = base + (remainder-- > 0 ? 1 : 0);
        if (targetCount <= 0) continue;
        let list = await buildForSubject(targetSubject, targetCount);
        if (list.length < targetCount) {
          const needed = targetCount - list.length;
          const fallback = normalizedExam === 'NEET'
            ? getStandardNEETQuestions(targetSubject, chapter, needed)
            : getStandardQuestions(targetSubject, chapter, needed);
          list = [...list, ...fallback];
        }
        combined.push(...list.slice(0, targetCount));
      }
      return combined.sort(() => 0.5 - Math.random()).map(shuffleCircleQuestionOptions);
    }

    let list = await buildForSubject(subject, requestedCount);
    if (list.length < requestedCount) {
      const needed = requestedCount - list.length;
      const fallback = normalizedExam === 'NEET'
        ? getStandardNEETQuestions(subject, chapter, needed)
        : getStandardQuestions(subject, chapter, needed);
      list = [...list, ...fallback];
    }
    return list.slice(0, requestedCount).sort(() => 0.5 - Math.random()).map(shuffleCircleQuestionOptions);
  } catch (err) {
    console.warn('Questions table unavailable; using the exam-specific question bank:', err.message);
    const fallbackSubjects = subject === 'All' || subject === 'Full Syllabus' ? subjects : [subject];
    const per = Math.ceil(requestedCount / fallbackSubjects.length);
    const all = fallbackSubjects.flatMap((s) =>
      normalizedExam === 'NEET'
        ? getStandardNEETQuestions(s, chapter, per)
        : getStandardQuestions(s, chapter, per)
    );
    return all.slice(0, requestedCount).map(shuffleCircleQuestionOptions);
  }
}

/**
 * Leaderboard Engine: Aggregates submissions per user in the circle
 */
export async function getCircleLeaderboard(circleId) {
  try {
    if (!circleId) return [];

    // Fetch all test submissions for this circle
    const { data: submissions, error } = await supabase
      .from('circle_test_submissions')
      .select('*')
      .eq('circle_id', circleId);

    if (error) throw error;
    if (!submissions || submissions.length === 0) return [];

    // Group scores by userId
    const userAggregates = {};
    const userIds = new Set();

    submissions.forEach((sub) => {
      const uid = sub.user_id;
      if (!uid) return;
      userIds.add(uid);

      if (!userAggregates[uid]) {
        userAggregates[uid] = {
          userId: uid,
          totalScore: 0,
          testsTaken: 0,
          totalAccuracy: 0
        };
      }

      userAggregates[uid].totalScore += Number(sub.score) || 0;
      userAggregates[uid].testsTaken += 1;
      userAggregates[uid].totalAccuracy += Number(sub.accuracy_pct) || 0;
    });

    // Fetch usernames from profiles
    let profileMap = {};
    if (userIds.size > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, username')
        .in('id', Array.from(userIds));

      (profiles || []).forEach((p) => {
        profileMap[p.id] = p.username;
      });
    }

    // Transform into sorted leaderboard list
    const leaderboardList = Object.values(userAggregates).map((item) => ({
      userId: item.userId,
      username: profileMap[item.userId] || 'Aspirant',
      totalScore: item.totalScore,
      testsTaken: item.testsTaken,
      avgAccuracy: item.testsTaken > 0 ? Math.round(item.totalAccuracy / item.testsTaken) : 0
    }));

    // Sort by Total Score descending
    leaderboardList.sort((a, b) => b.totalScore - a.totalScore);

    return leaderboardList;
  } catch (err) {
    console.error('Error generating leaderboard:', err);
    return [];
  }
}

/**
 * Announcements CRUD
 */
export async function getCircleAnnouncements(circleId) {
  try {
    const { data, error } = await supabase
      .from('circle_announcements')
      .select('*')
      .eq('circle_id', circleId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    if (!data || data.length === 0) return [];

    const authorIds = Array.from(new Set(data.map((a) => a.created_by).filter(Boolean)));
    let profileMap = {};

    if (authorIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, username')
        .in('id', authorIds);

      (profiles || []).forEach((p) => {
        profileMap[p.id] = p.username;
      });
    }

    return data.map((a) => ({
      ...a,
      author: { username: profileMap[a.created_by] || 'Member' }
    }));
  } catch (err) {
    console.error('Error fetching announcements:', err);
    return [];
  }
}

export async function postAnnouncement(circleId, message, userId) {
  try {
    const { data, error } = await supabase
      .from('circle_announcements')
      .insert([{ circle_id: circleId, created_by: userId, message }])
      .select()
      .single();
    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    console.error('Error posting announcement:', err);
    return { data: null, error: err.message };
  }
}

export async function updateCircleAnnouncementMode(circleId, mode, userId) {
  if (!circleId || !userId || !['all_members', 'admin_only'].includes(mode)) {
    return { error: 'Invalid circle announcement setting.' };
  }
  try {
    const { data, error } = await supabase
      .from('circles')
      .update({ announcement_mode: mode })
      .eq('id', circleId)
      .eq('created_by', userId)
      .select()
      .single();
    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    console.error('Error updating announcement mode:', err);
    return { data: null, error: err.message };
  }
}

export function subscribeToCircleAnnouncements(circleId, onNewAnnouncement) {
  if (!circleId) return null;
  return supabase
    .channel(`circle_announcements_${circleId}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'circle_announcements',
      filter: `circle_id=eq.${circleId}`
    }, (payload) => {
      if (payload?.new) onNewAnnouncement(payload.new);
    })
    .subscribe();
}
