import React, { useEffect, useRef, useState } from 'react';
import { Send, Smile, Trash2, MessageCircle } from 'lucide-react';
import { UserProfile, ChatMessage } from '../types';
import {
  getDbChatMessages,
  sendDbChatMessage,
  deleteDbChatMessage,
  toggleDbChatReaction,
  subscribeToDbChatRealtime
} from '../db-router';
import { isSupabaseConfigured } from '../supabase-service';

const QUICK_REACTIONS = ['👍', '❤️', '😂', '🎉', '👏', '🙏'];

interface ChatRoomProps {
  user: UserProfile;
}

export default function ChatRoom({ user }: ChatRoomProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [reactionPickerFor, setReactionPickerFor] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getDbChatMessages()
      .then((msgs) => { if (!cancelled) setMessages(msgs); })
      .catch((err) => { if (!cancelled) setError(err.message || 'Could not load chat.'); })
      .finally(() => { if (!cancelled) setLoading(false); });

    const unsubscribe = subscribeToDbChatRealtime({
      onMessageInsert: (row) => {
        setMessages((prev) => prev.some((m) => m.id === row.id) ? prev : [...prev, {
          id: row.id,
          senderId: row.sender_id,
          senderName: row.sender_name,
          content: row.content,
          createdAt: row.created_at,
          reactions: []
        }]);
      },
      onMessageDelete: (id) => {
        setMessages((prev) => prev.filter((m) => m.id !== id));
      },
      onReactionInsert: (row) => {
        setMessages((prev) => prev.map((m) => m.id === row.message_id
          ? { ...m, reactions: [...m.reactions.filter((r) => r.id !== row.id), { id: row.id, emoji: row.emoji, userId: row.user_id }] }
          : m));
      },
      onReactionDelete: (row) => {
        setMessages((prev) => prev.map((m) => m.id === row.message_id
          ? { ...m, reactions: m.reactions.filter((r) => r.id !== row.id) }
          : m));
      }
    });

    return () => { cancelled = true; unsubscribe(); };
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages.length]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text || !user.authUserId) return;
    setSending(true);
    setError('');
    try {
      await sendDbChatMessage(user.authUserId, user.name, text);
      setDraft('');
    } catch (err: any) {
      setError(err.message || 'Could not send message.');
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (messageId: string) => {
    if (!window.confirm('Delete this message?')) return;
    try {
      await deleteDbChatMessage(messageId);
    } catch (err: any) {
      setError(err.message || 'Could not delete message.');
    }
  };

  const handleReact = async (messageId: string, emoji: string) => {
    if (!user.authUserId) return;
    setReactionPickerFor(null);
    try {
      await toggleDbChatReaction(messageId, user.authUserId, emoji);
    } catch (err: any) {
      setError(err.message || 'Could not react.');
    }
  };

  if (!isSupabaseConfigured) {
    return (
      <div className="bg-amber-50 border border-amber-200 text-amber-700 p-4 rounded-2xl text-xs">
        Club Chat requires a configured Supabase project.
      </div>
    );
  }

  if (!user.authUserId) {
    return null;
  }

  const groupedReactions = (msg: ChatMessage) => {
    const groups: Record<string, { emoji: string; count: number; mine: boolean }> = {};
    for (const r of msg.reactions) {
      if (!groups[r.emoji]) groups[r.emoji] = { emoji: r.emoji, count: 0, mine: false };
      groups[r.emoji].count += 1;
      if (r.userId === user.authUserId) groups[r.emoji].mine = true;
    }
    return Object.values(groups);
  };

  return (
    <section className="bg-white rounded-3xl border border-slate-150 shadow-sm flex flex-col overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
        <MessageCircle className="h-4 w-4 text-rotary-azure" />
        <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider font-display">Club Chat</h3>
        <span className="text-[10px] text-slate-400 font-medium ml-auto">Live — visible to all members</span>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-4 space-y-4 max-h-[480px] min-h-[280px]">
        {loading ? (
          <p className="text-xs text-slate-400 text-center py-8">Loading messages…</p>
        ) : messages.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-8">No messages yet. Say hello!</p>
        ) : (
          messages.map((msg) => {
            const isOwn = msg.senderId === user.authUserId;
            const canDelete = isOwn || !!user.isAdmin;
            return (
              <div key={msg.id} className="group flex flex-col gap-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-xs font-bold text-slate-700 font-display">{msg.senderName}</span>
                  <span className="text-[10px] text-slate-400">{new Date(msg.createdAt).toLocaleString(undefined, { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}</span>
                  {canDelete && (
                    <button
                      onClick={() => handleDelete(msg.id)}
                      className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-slate-300 hover:text-rose-500"
                      title="Delete message"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                </div>
                <p className="text-sm text-slate-700 whitespace-pre-wrap break-words">{msg.content}</p>

                <div className="flex items-center gap-1.5 flex-wrap relative">
                  {groupedReactions(msg).map((g) => (
                    <button
                      key={g.emoji}
                      onClick={() => handleReact(msg.id, g.emoji)}
                      className={`text-[11px] px-1.5 py-0.5 rounded-full border transition-colors ${
                        g.mine ? 'bg-rotary-azure/10 border-rotary-azure/40 text-rotary-azure' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                      }`}
                    >
                      {g.emoji} {g.count}
                    </button>
                  ))}
                  <button
                    onClick={() => setReactionPickerFor(reactionPickerFor === msg.id ? null : msg.id)}
                    className="text-slate-300 hover:text-rotary-azure transition-colors"
                    title="React"
                  >
                    <Smile className="h-3.5 w-3.5" />
                  </button>
                  {reactionPickerFor === msg.id && (
                    <div className="absolute top-6 left-0 z-10 bg-white border border-slate-200 rounded-xl shadow-lg px-2 py-1.5 flex gap-1">
                      {QUICK_REACTIONS.map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => handleReact(msg.id, emoji)}
                          className="text-base hover:scale-125 transition-transform"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {error && (
        <div className="mx-6 mb-2 p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">{error}</div>
      )}

      <form onSubmit={handleSend} className="border-t border-slate-100 p-4 flex gap-2">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Message the club…"
          maxLength={2000}
          className="flex-1 px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rotary-azure/50 focus:border-rotary-azure text-sm text-slate-800"
        />
        <button
          type="submit"
          disabled={sending || !draft.trim()}
          className="px-4 py-2.5 bg-rotary-azure hover:bg-rotary-azure-dark text-white rounded-xl transition-all disabled:opacity-50 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider"
        >
          <Send className="h-3.5 w-3.5" />
          Send
        </button>
      </form>
    </section>
  );
}
