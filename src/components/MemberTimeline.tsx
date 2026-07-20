import React, { useEffect, useRef, useState } from 'react';
import { Image as ImageIcon, Send, Trash2, X, Rss, MessageSquare } from 'lucide-react';
import { UserProfile, TimelinePost } from '../types';
import {
  getDbTimelinePosts,
  createDbTimelinePost,
  deleteDbTimelinePost,
  addDbTimelineComment,
  deleteDbTimelineComment,
  subscribeToDbTimelineRealtime
} from '../db-router';
import { isSupabaseConfigured, supabase } from '../supabase-service';

interface MemberTimelineProps {
  user: UserProfile;
}

export default function MemberTimeline({ user }: MemberTimelineProps) {
  const [posts, setPosts] = useState<TimelinePost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [composerText, setComposerText] = useState('');
  const [composerImageUrl, setComposerImageUrl] = useState('');
  const [imageUploading, setImageUploading] = useState(false);
  const [posting, setPosting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [commentDraftByPost, setCommentDraftByPost] = useState<Record<string, string>>({});
  const [commentSubmittingFor, setCommentSubmittingFor] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getDbTimelinePosts()
      .then((p) => { if (!cancelled) setPosts(p); })
      .catch((err) => { if (!cancelled) setError(err.message || 'Could not load the feed.'); })
      .finally(() => { if (!cancelled) setLoading(false); });

    const unsubscribe = subscribeToDbTimelineRealtime({
      onPostInsert: (row) => {
        setPosts((prev) => prev.some((p) => p.id === row.id) ? prev : [{
          id: row.id,
          authorId: row.author_id,
          authorName: row.author_name,
          authorAvatarUrl: row.author_avatar_url || undefined,
          content: row.content || undefined,
          imageUrl: row.image_url || undefined,
          createdAt: row.created_at,
          comments: []
        }, ...prev]);
      },
      onPostDelete: (id) => {
        setPosts((prev) => prev.filter((p) => p.id !== id));
      },
      onCommentInsert: (row) => {
        setPosts((prev) => prev.map((p) => p.id === row.post_id
          ? (p.comments.some((c) => c.id === row.id) ? p : { ...p, comments: [...p.comments, { id: row.id, postId: row.post_id, authorId: row.author_id, authorName: row.author_name, content: row.content, createdAt: row.created_at }] })
          : p));
      },
      onCommentDelete: (row) => {
        setPosts((prev) => prev.map((p) => p.id === row.post_id
          ? { ...p, comments: p.comments.filter((c) => c.id !== row.id) }
          : p));
      }
    });

    return () => { cancelled = true; unsubscribe(); };
  }, []);

  const handleImageSelect = async (file: File) => {
    if (!user.authUserId || !supabase) return;
    setImageUploading(true);
    setError('');
    try {
      const ext = file.name.split('.').pop() || 'jpg';
      const path = `${user.authUserId}/timeline/${Date.now()}.${ext}`;
      const { error: uploadErr } = await supabase.storage.from('member-uploads').upload(path, file, { cacheControl: '3600', upsert: false });
      if (uploadErr) throw uploadErr;
      const { data } = supabase.storage.from('member-uploads').getPublicUrl(path);
      setComposerImageUrl(data.publicUrl);
    } catch (err: any) {
      setError(err.message || 'Could not upload photo.');
    } finally {
      setImageUploading(false);
    }
  };

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user.authUserId) return;
    if (!composerText.trim() && !composerImageUrl) return;
    setPosting(true);
    setError('');
    try {
      await createDbTimelinePost({
        authorId: user.authUserId,
        authorName: user.name,
        authorAvatarUrl: user.avatarUrl,
        content: composerText.trim() || undefined,
        imageUrl: composerImageUrl || undefined
      });
      setComposerText('');
      setComposerImageUrl('');
    } catch (err: any) {
      setError(err.message || 'Could not publish your post.');
    } finally {
      setPosting(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!window.confirm('Delete this post? This also deletes its comments.')) return;
    try {
      await deleteDbTimelinePost(postId);
    } catch (err: any) {
      setError(err.message || 'Could not delete post.');
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await deleteDbTimelineComment(commentId);
    } catch (err: any) {
      setError(err.message || 'Could not delete comment.');
    }
  };

  const handleAddComment = async (postId: string) => {
    const text = (commentDraftByPost[postId] || '').trim();
    if (!text || !user.authUserId) return;
    setCommentSubmittingFor(postId);
    try {
      await addDbTimelineComment(postId, user.authUserId, user.name, text);
      setCommentDraftByPost((prev) => ({ ...prev, [postId]: '' }));
    } catch (err: any) {
      setError(err.message || 'Could not add comment.');
    } finally {
      setCommentSubmittingFor(null);
    }
  };

  if (!isSupabaseConfigured) {
    return (
      <div className="bg-amber-50 border border-amber-200 text-amber-700 p-4 rounded-2xl text-xs">
        Member Timeline requires a configured Supabase project.
      </div>
    );
  }

  if (!user.authUserId) return null;

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2 px-1">
        <Rss className="h-4 w-4 text-rotary-azure" />
        <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider font-display">Member Timeline</h3>
      </div>

      {/* Composer */}
      <div className="bg-white rounded-3xl border border-slate-150 shadow-sm p-5 space-y-3">
        <form onSubmit={handlePost} className="space-y-3">
          <textarea
            value={composerText}
            onChange={(e) => setComposerText(e.target.value)}
            placeholder={`Share something with the club, ${user.name.split(' ')[0]}…`}
            rows={3}
            maxLength={5000}
            className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rotary-azure/50 focus:border-rotary-azure text-sm text-slate-800 resize-none"
          />

          {composerImageUrl && (
            <div className="relative inline-block">
              <img src={composerImageUrl} alt="Attached" className="h-28 rounded-xl border border-slate-200 object-cover" />
              <button
                type="button"
                onClick={() => setComposerImageUrl('')}
                className="absolute -top-2 -right-2 bg-slate-800 text-white rounded-full p-1 shadow-md"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}

          <div className="flex items-center justify-between">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageSelect(f); e.target.value = ''; }}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={imageUploading}
              className="px-3 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 disabled:opacity-50"
            >
              <ImageIcon className="h-3.5 w-3.5" />
              {imageUploading ? 'Uploading…' : 'Photo'}
            </button>
            <button
              type="submit"
              disabled={posting || imageUploading || (!composerText.trim() && !composerImageUrl)}
              className="px-4 py-2 bg-rotary-azure hover:bg-rotary-azure-dark text-white rounded-xl text-xs font-bold uppercase tracking-wider disabled:opacity-50 flex items-center gap-1.5"
            >
              <Send className="h-3.5 w-3.5" />
              Post
            </button>
          </div>
        </form>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">{error}</div>
      )}

      {/* Feed */}
      {loading ? (
        <p className="text-xs text-slate-400 text-center py-8">Loading feed…</p>
      ) : posts.length === 0 ? (
        <p className="text-xs text-slate-400 text-center py-8">No posts yet. Be the first to share something!</p>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => {
            const canDeletePost = post.authorId === user.authUserId || !!user.isAdmin;
            return (
              <div key={post.id} className="bg-white rounded-3xl border border-slate-150 shadow-sm p-5 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-bold text-slate-800 font-display">{post.authorName}</p>
                    <p className="text-[10px] text-slate-400">{new Date(post.createdAt).toLocaleString(undefined, { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}</p>
                  </div>
                  {canDeletePost && (
                    <button onClick={() => handleDeletePost(post.id)} className="text-slate-300 hover:text-rose-500 shrink-0" title="Delete post">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                {post.content && <p className="text-sm text-slate-700 whitespace-pre-wrap break-words">{post.content}</p>}
                {post.imageUrl && (
                  <img src={post.imageUrl} alt="" className="w-full max-h-[420px] object-cover rounded-2xl border border-slate-100" />
                )}

                {/* Comments */}
                <div className="pt-2 border-t border-slate-100 space-y-2">
                  {post.comments.length > 0 && (
                    <div className="space-y-2">
                      {post.comments.map((c) => {
                        const canDeleteComment = c.authorId === user.authUserId || !!user.isAdmin;
                        return (
                          <div key={c.id} className="flex items-start justify-between gap-2 bg-slate-50 rounded-xl px-3 py-2">
                            <div>
                              <span className="text-xs font-bold text-slate-700 font-display mr-1.5">{c.authorName}</span>
                              <span className="text-xs text-slate-600">{c.content}</span>
                            </div>
                            {canDeleteComment && (
                              <button onClick={() => handleDeleteComment(c.id)} className="text-slate-300 hover:text-rose-500 shrink-0">
                                <X className="h-3 w-3" />
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-3.5 w-3.5 text-slate-300 shrink-0" />
                    <input
                      type="text"
                      value={commentDraftByPost[post.id] || ''}
                      onChange={(e) => setCommentDraftByPost((prev) => ({ ...prev, [post.id]: e.target.value }))}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddComment(post.id); } }}
                      placeholder="Add a comment…"
                      maxLength={1000}
                      className="flex-1 px-3 py-1.5 bg-slate-50/50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-rotary-azure/50 focus:border-rotary-azure"
                    />
                    <button
                      onClick={() => handleAddComment(post.id)}
                      disabled={commentSubmittingFor === post.id || !(commentDraftByPost[post.id] || '').trim()}
                      className="text-rotary-azure disabled:text-slate-300 shrink-0"
                    >
                      <Send className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
