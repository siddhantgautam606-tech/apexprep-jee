import { supabase } from './supabaseClient';

// Search users by username (excluding the current user)
export async function searchUsers(searchTerm, currentUserId) {
  if (!searchTerm.trim()) return [];

  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, email, target_exam')
    .neq('id', currentUserId)
    .ilike('username', `%${searchTerm.trim()}%`)
    .limit(10);

  if (error) throw error;
  return data || [];
}

// Send a friend request
export async function sendFriendRequest(senderId, receiverId) {
  const { data, error } = await supabase
    .from('friendships')
    .insert([{ sender_id: senderId, receiver_id: receiverId, status: 'pending' }])
    .select();

  if (error) throw error;
  return data[0];
}

// Respond to friend request ('accepted' or 'declined')
export async function respondToFriendRequest(friendshipId, status) {
  const { data, error } = await supabase
    .from('friendships')
    .update({ status })
    .eq('id', friendshipId)
    .select();

  if (error) throw error;
  return data[0];
}

// Get confirmed friends for a user
export async function getFriendsList(currentUserId) {
  const { data, error } = await supabase
    .from('friendships')
    .select(`
      id,
      status,
      sender:profiles!friendships_sender_id_fkey(id, username, target_exam),
      receiver:profiles!friendships_receiver_id_fkey(id, username, target_exam)
    `)
    .or(`sender_id.eq.${currentUserId},receiver_id.eq.${currentUserId}`)
    .eq('status', 'accepted');

  if (error) throw error;

  return (data || []).map((row) => {
    return row.sender.id === currentUserId ? row.receiver : row.sender;
  });
}

// Get pending incoming friend requests
export async function getPendingRequests(currentUserId) {
  const { data, error } = await supabase
    .from('friendships')
    .select(`
      id,
      status,
      sender:profiles!friendships_sender_id_fkey(id, username, target_exam)
    `)
    .eq('receiver_id', currentUserId)
    .eq('status', 'pending');

  if (error) throw error;
  return data || [];
}