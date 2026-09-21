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

// 2. Fetch circles that the current user has joined
export async function getUserCircles(userId) {
  if (!userId) return [];
  const { data, error } = await supabase
    .from('circle_members')
    .select(`
      circle_id,
      role,
      circles:circle_id (
        id,
        name,
        description,
        created_by,
        created_at
      )
    `)
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching user circles:', error);
    return [];
  }
  return data ? data.map((item) => ({ ...item.circles, userRole: item.role })) : [];
}

// 3. Create a new circle and make creator the admin
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

  // Add creator as circle admin member
  const { error: memberError } = await supabase
    .from('circle_members')
    .insert([{ circle_id: circle.id, user_id: userId, role: 'admin' }]);

  if (memberError) {
    console.error('Error adding creator to circle:', memberError);
  }

  return { data: circle };
}

// 4. Join a circle
export async function joinCircle(circleId, userId) {
  if (!circleId || !userId) return { error: 'Invalid parameters.' };

  const { data, error } = await supabase
    .from('circle_members')
    .insert([{ circle_id: circleId, user_id: userId, role: 'member' }])
    .select()
    .single();

  if (error) {
    console.error('Error joining circle:', error);
    return { error: error.message };
  }
  return { data };
}

// 5. Fetch members of a specific circle
export async function getCircleMembers(circleId) {
  if (!circleId) return [];

  const { data, error } = await supabase
    .from('circle_members')
    .select(`
      role,
      joined_at,
      user:user_id ( id, username, target_exam )
    `)
    .eq('circle_id', circleId);

  if (error) {
    console.error('Error fetching circle members:', error);
    return [];
  }
  return data || [];
}

// 6. Schedule a test inside a circle
export async function scheduleCircleTest(circleId, testData, userId) {
  const { title, subject, chapter, durationMinutes, scheduledAt } = testData;

  const { data, error } = await supabase
    .from('circle_tests')
    .insert([
      {
        circle_id: circleId,
        title: title.trim(),
        subject,
        chapter: chapter || 'All',
        duration_minutes: Number(durationMinutes) || 60,
        scheduled_at: scheduledAt || new Date().toISOString(),
        created_by: userId
      }
    ])
    .select()
    .single();

  if (error) {
    console.error('Error scheduling test:', error);
    return { error: error.message };
  }
  return { data };
}

// 7. Get scheduled tests for a circle
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