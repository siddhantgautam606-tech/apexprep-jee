import { supabase } from './supabaseClient';

// 1. Search users by username (excluding current user)
export async function searchUsers(searchTerm, currentUserId) {
  if (!searchTerm.trim()) return [];

  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, email, target_exam')
    .neq('id', currentUserId)
    .ilike('username', `${searchTerm.trim()}%`)
    .limit(10);

  if (error) throw error;
  return data || [];
}

// 2. Send a friend request
export async function sendFriendRequest(senderId, receiverId) {
  const { data, error } = await supabase
    .from('friendships')
    .insert([{ sender_id: senderId, receiver_id: receiverId, status: 'pending' }])
    .select();

  if (error) throw error;
  return data[0];
}

// 3. Respond to friend request ('accepted' or 'declined')
export async function respondToFriendRequest(friendshipId, status) {
  const { data, error } = await supabase
    .from('friendships')
    .update({ status })
    .eq('id', friendshipId)
    .select();

  if (error) throw error;
  return data[0];
}

// 4. Get confirmed friends for a user
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

// 5. Get pending incoming friend requests
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

// 6. Get direct message conversation between two users
export async function getDirectMessages(userId1, userId2) {
  if (!userId1 || !userId2) return [];

  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .or(
      `and(sender_id.eq.${userId1},receiver_id.eq.${userId2}),and(sender_id.eq.${userId2},receiver_id.eq.${userId1})`
    )
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching messages:', error);
    return [];
  }
  return data || [];
}

// 7. Send a direct message
export async function sendDirectMessage(senderId, receiverId, content) {
  if (!senderId || !receiverId || !content.trim()) return { error: 'Invalid message payload' };

  const { data, error } = await supabase
    .from('messages')
    .insert([
      {
        sender_id: senderId,
        receiver_id: receiverId,
        content: content.trim(),
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Error sending message:', error);
    return { error: error.message };
  }
  return { data };
}

// 8. Subscribe to realtime messages between two users
export function subscribeToDirectMessages(userId1, userId2, onNewMessage) {
  const channel = supabase
    .channel(`dm_${[userId1, userId2].sort().join('_')}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
      },
      (payload) => {
        const msg = payload.new;
        if (
          (msg.sender_id === userId1 && msg.receiver_id === userId2) ||
          (msg.sender_id === userId2 && msg.receiver_id === userId1)
        ) {
          onNewMessage(msg);
        }
      }
    )
    .subscribe();

  return channel;
}