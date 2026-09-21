import { supabase } from './supabaseClient';

// 1. Fetch all circles with member counts
export async function getAllCircles() {
  const { data, error } = await supabase
    .from('circles')
    .select(`
      *,
      creator:created_by ( username ),
      members:circle_members ( count )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching circles:', error);
    return [];
  }
  return data || [];
}

// 2. Fetch circles for current user with their approval status
export async function getUserCircleMemberships(userId) {
  if (!userId) return [];
  const { data, error } = await supabase
    .from('circle_members')
    .select(`
      circle_id,
      role,
      status
    `)
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching user memberships:', error);
    return [];
  }
  return data || [];
}

// 3. Create a circle and automatically add creator as approved admin
export async function createCircle(name, description, userId) {
  if (!name.trim() || !userId) return { error: 'Name and user are required.' };

  const { data: circle, error: circleError } = await supabase
    .from('circles')
    .insert([{ name: name.trim(), description: description.trim(), created_by: userId }])
    .select()
    .single();

  if (circleError) {
    console.error('Error creating circle:', circleError);
    return { error: circleError.message };
  }

  const { error: memberError } = await supabase
    .from('circle_members')
    .insert([{ circle_id: circle.id, user_id: userId, role: 'admin', status: 'approved' }]);

  if (memberError) {
    console.error('Error attaching creator to circle:', memberError);
  }

  return { data: circle };
}

// 4. Request to join a circle (status: 'pending')
export async function requestJoinCircle(circleId, userId) {
  if (!circleId || !userId) return { error: 'Invalid parameters.' };

  const { data, error } = await supabase
    .from('circle_members')
    .insert([{ circle_id: circleId, user_id: userId, role: 'member', status: 'pending' }])
    .select()
    .single();

  if (error) {
    console.error('Error requesting to join circle:', error);
    return { error: error.message };
  }
  return { data };
}

// 5. Leave a circle
export async function leaveCircle(circleId, userId) {
  if (!circleId || !userId) return { error: 'Invalid parameters.' };

  const { error } = await supabase
    .from('circle_members')
    .delete()
    .eq('circle_id', circleId)
    .eq('user_id', userId);

  if (error) {
    console.error('Error leaving circle:', error);
    return { error: error.message };
  }
  return { success: true };
}

// 6. Fetch members (approved and pending)
export async function getCircleMembers(circleId) {
  if (!circleId) return { approved: [], pending: [] };

  const { data, error } = await supabase
    .from('circle_members')
    .select(`
      id,
      role,
      status,
      joined_at,
      user:user_id ( id, username, target_exam )
    `)
    .eq('circle_id', circleId);

  if (error) {
    console.error('Error fetching circle members:', error);
    return { approved: [], pending: [] };
  }

  const approved = (data || []).filter((m) => m.status === 'approved');
  const pending = (data || []).filter((m) => m.status === 'pending');
  return { approved, pending };
}

// 7. Admin: Accept or Reject a join request
export async function handleJoinRequest(memberRecordId, accept = true) {
  try {
    if (accept) {
      const { data, error } = await supabase
        .from('circle_members')
        .update({ status: 'approved' })
        .eq('id', memberRecordId)
        .select();

      if (error) {
        console.error('Error accepting member:', error);
        return { error: error.message };
      }
      return { data };
    } else {
      const { error } = await supabase
        .from('circle_members')
        .delete()
        .eq('id', memberRecordId);

      if (error) {
        console.error('Error rejecting member:', error);
        return { error: error.message };
      }
      return { success: true };
    }
  } catch (err) {
    return { error: err.message };
  }
}

// 8. Schedule a circle test with fixed availability window (Admin only)
export async function scheduleCircleTest(circleId, testData, userId) {
  const { title, subject, chapter, durationMinutes, windowStart, windowEnd } = testData;

  const { data, error } = await supabase
    .from('circle_tests')
    .insert([
      {
        circle_id: circleId,
        title: title.trim(),
        subject,
        chapter: chapter || 'All',
        duration_minutes: Number(durationMinutes) || 60,
        window_start: windowStart ? new Date(windowStart).toISOString() : new Date().toISOString(),
        window_end: windowEnd ? new Date(windowEnd).toISOString() : new Date(Date.now() + 86400000).toISOString(),
        created_by: userId,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Error scheduling test:', error);
    return { error: error.message };
  }
  return { data };
}

// 9. Fetch scheduled tests
export async function getCircleTests(circleId) {
  if (!circleId) return [];

  const { data, error } = await supabase
    .from('circle_tests')
    .select('*')
    .eq('circle_id', circleId)
    .order('scheduled_at', { ascending: true });

  if (error) {
    console.error('Error fetching circle tests:', error);
    return [];
  }
  return data || [];
}

// 10. Admin Announcements (Broadcast)
export async function getCircleAnnouncements(circleId) {
  if (!circleId) return [];

  const { data, error } = await supabase
    .from('circle_announcements')
    .select(`
      id,
      message,
      created_at,
      author:created_by ( username )
    `)
    .eq('circle_id', circleId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching announcements:', error);
    return [];
  }
  return data || [];
}

export async function postAnnouncement(circleId, message, userId) {
  if (!circleId || !message.trim() || !userId) return { error: 'Invalid parameters.' };

  const { data, error } = await supabase
    .from('circle_announcements')
    .insert([{ circle_id: circleId, message: message.trim(), created_by: userId }])
    .select(`
      id,
      message,
      created_at,
      author:created_by ( username )
    `)
    .single();

  if (error) {
    console.error('Error posting announcement:', error);
    return { error: error.message };
  }
  return { data };
}

// 11. Circle Leaderboard Computation
export async function getCircleLeaderboard(circleId) {
  if (!circleId) return [];

  const { data, error } = await supabase
    .from('circle_test_submissions')
    .select(`
      user_id,
      score,
      total_marks,
      accuracy_pct,
      user:user_id ( username, target_exam )
    `)
    .eq('circle_id', circleId);

  if (error) {
    console.error('Error fetching circle submissions:', error);
    return [];
  }

  const userMap = {};
  (data || []).forEach((sub) => {
    const uid = sub.user_id;
    if (!userMap[uid]) {
      userMap[uid] = {
        userId: uid,
        username: sub.user?.username || 'Candidate',
        targetExam: sub.user?.target_exam || 'JEE Main',
        totalScore: 0,
        testsTaken: 0,
        avgAccuracy: 0,
        accuracySum: 0,
      };
    }
    userMap[uid].totalScore += sub.score;
    userMap[uid].testsTaken += 1;
    userMap[uid].accuracySum += Number(sub.accuracy_pct || 0);
  });

  const ranked = Object.values(userMap).map((entry) => ({
    ...entry,
    avgAccuracy: (entry.accuracySum / entry.testsTaken).toFixed(1),
  }));

  ranked.sort((a, b) => b.totalScore - a.totalScore || b.avgAccuracy - a.avgAccuracy);
  return ranked;
}