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

// 2. Get the friendship relationship for a set of users.
// This lets the UI keep a searched user visible after a request is declined.
export async function getFriendshipStatuses(currentUserId, userIds = []) {
  if (!currentUserId || !userIds.length) return {};

  const { data, error } = await supabase
    .from('friendships')
    .select('id, sender_id, receiver_id, status, created_at')
    .or(`sender_id.eq.${currentUserId},receiver_id.eq.${currentUserId}`)
    .in('status', ['pending', 'accepted', 'declined'])
    .order('created_at', { ascending: false });

  if (error) throw error;

  const requestedIds = new Set(userIds);
  const map = {};

  for (const row of data || []) {
    const otherId = row.sender_id === currentUserId ? row.receiver_id : row.sender_id;
    if (requestedIds.has(otherId) && !map[otherId]) {
      map[otherId] = {
        id: row.id,
        status: row.status,
        direction: row.sender_id === currentUserId ? 'outgoing' : 'incoming',
      };
    }
  }

  return map;
}

// 3. Send a friend request.
// Reuses a previous declined outgoing request instead of creating duplicates.
export async function sendFriendRequest(senderId, receiverId) {
  if (!senderId || !receiverId || senderId === receiverId) {
    throw new Error('Invalid friend request');
  }

  const { data: existing, error: lookupError } = await supabase
    .from('friendships')
    .select('id, sender_id, receiver_id, status, created_at')
    .or(
      `and(sender_id.eq.${senderId},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${senderId})`
    )
    .order('created_at', { ascending: false });

  if (lookupError) throw lookupError;

  const sameDirection = (existing || []).find(
    (row) => row.sender_id === senderId && row.receiver_id === receiverId
  );
  const reverseDirection = (existing || []).find(
    (row) => row.sender_id === receiverId && row.receiver_id === senderId
  );

  if (sameDirection?.status === 'pending') {
    return { ...sameDirection, action: 'pending' };
  }

  if (sameDirection?.status === 'accepted') {
    return { ...sameDirection, action: 'accepted' };
  }

  if (reverseDirection?.status === 'pending') {
    return { ...reverseDirection, action: 'incoming' };
  }

  if (reverseDirection?.status === 'accepted') {
    return { ...reverseDirection, action: 'accepted' };
  }

  if (sameDirection?.status === 'declined') {
    const { data, error } = await supabase
      .from('friendships')
      .update({ status: 'pending', created_at: new Date().toISOString() })
      .eq('id', sameDirection.id)
      .eq('sender_id', senderId)
      .eq('receiver_id', receiverId)
      .select()
      .single();

    if (error) throw error;
    return { ...data, action: 'pending' };
  }

  // If the old relationship was declined in the opposite direction,
  // start a fresh request in the direction chosen by the current user.
  const { data, error } = await supabase
    .from('friendships')
    .insert([{ sender_id: senderId, receiver_id: receiverId, status: 'pending' }])
    .select()
    .single();

  if (error) throw error;
  return { ...data, action: 'pending' };
}

// 4. Respond to a friend request ('accepted' or 'declined')
export async function respondToFriendRequest(friendshipId, status) {
  if (!['accepted', 'declined'].includes(status)) {
    throw new Error('Invalid friendship response');
  }

  const { data, error } = await supabase
    .from('friendships')
    .update({ status })
    .eq('id', friendshipId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// 5. Get confirmed friends for a user
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

// 6. Get pending incoming friend requests
export async function getPendingRequests(currentUserId) {
  const { data, error } = await supabase
    .from('friendships')
    .select(`
      id,
      status,
      created_at,
      sender:profiles!friendships_sender_id_fkey(id, username, target_exam)
    `)
    .eq('receiver_id', currentUserId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

// 7. Realtime friendship updates for incoming requests and responses
export function subscribeToFriendships(currentUserId, onChange) {
  if (!currentUserId) return null;

  return supabase
    .channel(`friendships_${currentUserId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'friendships',
      },
      (payload) => {
        const row = payload.new || payload.old;
        if (!row) return;

        if (row.sender_id === currentUserId || row.receiver_id === currentUserId) {
          onChange?.(payload);
        }
      }
    )
    .subscribe();
}

// 8. Get direct message conversation between two users
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

// 9. Send a direct message
export async function sendDirectMessage(senderId, receiverId, content) {
  if (!senderId || !receiverId || !content.trim()) return { error: 'Invalid message payload' };

  const { data, error } = await supabase
    .from('messages')
    .insert([{
      sender_id: senderId,
      receiver_id: receiverId,
      content: content.trim(),
      status: 'sent'
    }])
    .select()
    .single();

  if (error) {
    console.error('Error sending message:', error);
    return { error: error.message };
  }
  return { data };
}

export async function markMessageDelivered(messageId, userId) {
  if (!messageId || !userId) return;
  await supabase
    .from('messages')
    .update({ status: 'delivered', delivered_at: new Date().toISOString() })
    .eq('id', messageId)
    .eq('receiver_id', userId)
    .eq('status', 'sent');
}

export async function markMessageRead(messageId, userId) {
  if (!messageId || !userId) return;
  await supabase
    .from('messages')
    .update({
      status: 'read',
      delivered_at: new Date().toISOString(),
      read_at: new Date().toISOString()
    })
    .eq('id', messageId)
    .eq('receiver_id', userId)
    .neq('status', 'read');
}

// 10. Subscribe to realtime messages between two users
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

export function subscribeToOnlinePresence(currentUserId, onOnlineUsers) {
  if (!currentUserId) return null;
  const channel = supabase
    .channel('prepxai-online-users', { config: { presence: { key: currentUserId } } })
    .on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState();
      const ids = new Set(Object.keys(state));
      Object.values(state).flat().forEach((presence) => {
        if (presence?.userId) ids.add(presence.userId);
      });
      onOnlineUsers(Array.from(ids));
    })
    .subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({
          userId: currentUserId,
          online_at: new Date().toISOString()
        });
      }
    });
  return channel;
}

export function subscribeToUserMessages(currentUserId, onInsert, onUpdate) {
  if (!currentUserId) return null;
  return supabase
    .channel(`user_messages_${currentUserId}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: `receiver_id=eq.${currentUserId}`
    }, (payload) => onInsert?.(payload.new))
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'messages'
    }, (payload) => {
      const row = payload.new;
      if (row?.sender_id === currentUserId || row?.receiver_id === currentUserId) onUpdate?.(row);
    })
    .subscribe();
}
