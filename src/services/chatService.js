import { supabase } from './supabaseClient';

// Send a chat message
export async function sendMessage({ senderId, receiverId, content }) {
  const { data, error } = await supabase
    .from('messages')
    .insert([
      {
        sender_id: senderId,
        receiver_id: receiverId,
        content: content.trim(),
      },
    ])
    .select();

  if (error) throw error;
  return data[0];
}

// Fetch message history between two users
export async function fetchConversation(currentUserId, friendId) {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .or(
      `and(sender_id.eq.${currentUserId},receiver_id.eq.${friendId}),and(sender_id.eq.${friendId},receiver_id.eq.${currentUserId})`
    )
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data || [];
}

// Subscribe to incoming messages in real-time
export function subscribeToMessages(currentUserId, onNewMessage) {
  const channel = supabase
    .channel('chat_realtime')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `receiver_id=eq.${currentUserId}`,
      },
      (payload) => {
        onNewMessage(payload.new);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}