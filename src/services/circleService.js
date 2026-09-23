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
        status: 'approved' // Automatically approve for seamless peer study
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
export async function fetchQuestionsForTest(subject, chapter, count, exam = 'JEE Main') {
  const normalizedExam = normalizeExam(exam);
  const requestedCount = Math.max(1, Number(count) || 10);

  try {
    let query = supabase.from('custom_questions').select('*').eq('exam', normalizedExam);

    if (subject && subject !== 'All' && subject !== 'Full Syllabus') {
      query = query.eq('subject', subject);
    }
    if (chapter && chapter !== 'All') {
      query = query.eq('chapter', chapter);
    }

    const { data, error } = await query.limit(requestedCount);
    if (error) throw error;

    const dbQuestions = (data || []).map((q, idx) => ({
      id: q.id || idx + 1,
      question: q.question,
      options: Array.isArray(q.options) ? q.options : [],
      correctAnswer: q.correct_answer,
      explanation: q.explanation || '',
      subject: q.subject,
      chapter: q.chapter,
      yearTag: q.year_tag || q.yearTag
    }));

    if (dbQuestions.length >= requestedCount) return dbQuestions.slice(0, requestedCount);

    const needed = requestedCount - dbQuestions.length;
    const fallback = normalizedExam === 'NEET'
      ? getStandardNEETQuestions(subject === 'All' || subject === 'Full Syllabus' ? 'All' : subject, chapter, needed)
      : getStandardQuestions(subject === 'All' || subject === 'Full Syllabus' ? 'Physics' : subject, chapter, needed);

    return [...dbQuestions, ...fallback].slice(0, requestedCount);
  } catch (err) {
    console.warn('Questions table unavailable; using the exam-specific question bank:', err.message);
    return normalizedExam === 'NEET'
      ? getStandardNEETQuestions(subject === 'All' || subject === 'Full Syllabus' ? 'All' : subject, chapter, requestedCount)
      : getStandardQuestions(subject === 'All' || subject === 'Full Syllabus' ? 'Physics' : subject, chapter, requestedCount);
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

    const authorIds = Array.from(new Set(data.map((a) => a.user_id).filter(Boolean)));
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
      author: { username: profileMap[a.user_id] || 'Member' }
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
      .insert([
        {
          circle_id: circleId,
          user_id: userId,
          message: message
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    console.error('Error posting announcement:', err);
    return { data: null, error: err.message };
  }
}