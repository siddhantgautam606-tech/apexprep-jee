import { supabase } from './supabaseClient';

// Get all circles
export async function getAllCircles() {
  try {
    const { data, error } = await supabase
      .from('circles')
      .select('*, creator:created_by(id, username), members:circle_members(count)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error fetching circles:', err);
    return [];
  }
}

// Get user circle memberships
export async function getUserCircleMemberships(userId) {
  try {
    const { data, error } = await supabase
      .from('circle_members')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error fetching user circle memberships:', err);
    return [];
  }
}

// Create a new circle
export async function createCircle(name, description, userId) {
  try {
    const { data, error } = await supabase
      .from('circles')
      .insert([{ name, description, created_by: userId }])
      .select()
      .single();

    if (error) throw error;

    await supabase.from('circle_members').insert([
      { circle_id: data.id, user_id: userId, role: 'admin', status: 'approved' }
    ]);

    return { data, error: null };
  } catch (err) {
    console.error('Error creating circle:', err);
    return { data: null, error: err.message };
  }
}

// Delete circle
export async function deleteCircle(circleId, userId) {
  try {
    const { error } = await supabase
      .from('circles')
      .delete()
      .eq('id', circleId)
      .eq('created_by', userId);

    if (error) throw error;
    return { error: null };
  } catch (err) {
    console.error('Error deleting circle:', err);
    return { error: err.message };
  }
}

// Request to join circle
export async function requestJoinCircle(circleId, userId) {
  try {
    const { data, error } = await supabase
      .from('circle_members')
      .insert([{ circle_id: circleId, user_id: userId, role: 'member', status: 'pending' }])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    console.error('Error requesting join circle:', err);
    return { data: null, error: err.message };
  }
}

// Leave circle
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

// Get members of circle
export async function getCircleMembers(circleId) {
  try {
    const { data, error } = await supabase
      .from('circle_members')
      .select('*, user:user_id(id, username, target_exam)')
      .eq('circle_id', circleId);

    if (error) throw error;
    const approved = (data || []).filter((m) => m.status === 'approved');
    const pending = (data || []).filter((m) => m.status === 'pending');
    return { approved, pending };
  } catch (err) {
    console.error('Error fetching circle members:', err);
    return { approved: [], pending: [] };
  }
}

// Handle join requests (accept/decline)
export async function handleJoinRequest({ circleId, userId, memberRecordId, accept }) {
  try {
    if (accept) {
      const { error } = await supabase
        .from('circle_members')
        .update({ status: 'approved' })
        .match(memberRecordId ? { id: memberRecordId } : { circle_id: circleId, user_id: userId });

      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('circle_members')
        .delete()
        .match(memberRecordId ? { id: memberRecordId } : { circle_id: circleId, user_id: userId });

      if (error) throw error;
    }
    return { error: null };
  } catch (err) {
    console.error('Error handling join request:', err);
    return { error: err.message };
  }
}

// Get circle tests
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

// Schedule a circle test (with schema fallback)
export async function scheduleCircleTest(circleId, testData, userId) {
  try {
    const qCount = Number(testData.questionCount) || Number(testData.question_count) || 5;

    const payload = {
      circle_id: circleId,
      title: testData.title,
      subject: testData.subject,
      chapter: testData.chapter || 'All',
      duration_minutes: Number(testData.durationMinutes) || 60,
      question_count: qCount,
      questions: testData.questions,
      window_start: testData.windowStart || null,
      window_end: testData.windowEnd || null,
      created_by: userId
    };

    let { data, error } = await supabase
      .from('circle_tests')
      .insert([payload])
      .select()
      .single();

    if (error && error.message && error.message.includes('question_count')) {
      delete payload.question_count;
      payload.total_questions = qCount;
      const retry = await supabase
        .from('circle_tests')
        .insert([payload])
        .select()
        .single();
      data = retry.data;
      error = retry.error;
    }

    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    console.error('Error scheduling circle test:', err);
    return { data: null, error: err.message };
  }
}

// Delete circle test
export async function deleteCircleTest(testId) {
  try {
    const { error } = await supabase
      .from('circle_tests')
      .delete()
      .eq('id', testId);

    if (error) throw error;
    return { error: null };
  } catch (err) {
    console.error('Error deleting circle test:', err);
    return { error: err.message };
  }
}

// Announcements
export async function getCircleAnnouncements(circleId) {
  try {
    const { data, error } = await supabase
      .from('circle_announcements')
      .select('*, author:created_by(id, username)')
      .eq('circle_id', circleId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error fetching announcements:', err);
    return [];
  }
}

export async function postAnnouncement(circleId, message, userId) {
  try {
    const { data, error } = await supabase
      .from('circle_announcements')
      .insert([{ circle_id: circleId, message, created_by: userId }])
      .select('*, author:created_by(id, username)')
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    console.error('Error posting announcement:', err);
    return { data: null, error: err.message };
  }
}

// Leaderboard
export async function getCircleLeaderboard(circleId) {
  try {
    const { data, error } = await supabase
      .from('circle_test_submissions')
      .select('*, user:user_id(id, username, target_exam)')
      .eq('circle_id', circleId);

    if (error) throw error;

    const userStats = {};
    (data || []).forEach((sub) => {
      const uId = sub.user_id;
      if (!userStats[uId]) {
        userStats[uId] = {
          userId: uId,
          username: sub.user?.username || 'Aspirant',
          targetExam: sub.user?.target_exam || 'JEE Main',
          totalScore: 0,
          testsTaken: 0,
          totalAccuracy: 0
        };
      }
      userStats[uId].totalScore += sub.score || 0;
      userStats[uId].testsTaken += 1;
      userStats[uId].totalAccuracy += sub.accuracy_pct || 0;
    });

    const leaderboard = Object.values(userStats).map((u) => ({
      ...u,
      avgAccuracy: u.testsTaken > 0 ? (u.totalAccuracy / u.testsTaken).toFixed(1) : 0
    }));

    leaderboard.sort((a, b) => b.totalScore - a.totalScore);
    return leaderboard;
  } catch (err) {
    console.error('Error fetching leaderboard:', err);
    return [];
  }
}

// Re-export question pool functions from central questionService
export { addCustomQuestionToDB, fetchQuestionsForTest } from './questionService';