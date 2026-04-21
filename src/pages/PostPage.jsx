import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { postsApi, commentsApi, reactionsApi } from '@/api';
import { useAuthStore } from '@/store/authStore';
import styles from './PostPage.module.css';

const REACTIONS = [
  { type: 'DEEP',     emoji: '💔', label: 'Deep' },
  { type: 'POWERFUL', emoji: '🔥', label: 'Powerful' },
  { type: 'CALM',     emoji: '🌙', label: 'Calm' },
  { type: 'RAW',      emoji: '🩸', label: 'Raw' },
];

export default function PostPage() {
  const { id } = useParams();
  const user = useAuthStore(s => s.user);
  const qc = useQueryClient();
  const [comment, setComment] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['post', id],
    queryFn: () => postsApi.get(id).then(r => r.data),
  });

  const { data: commentsData } = useQuery({
    queryKey: ['comments', id],
    queryFn: () => commentsApi.list(id).then(r => r.data),
  });

  const { data: reactionsData } = useQuery({
    queryKey: ['reactions', id],
    queryFn: () => reactionsApi.summary(id).then(r => r.data),
  });

  const likeMutation = useMutation({
    mutationFn: () => postsApi.like(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['post', id] }),
  });

  const reactMutation = useMutation({
    mutationFn: (type) => reactionsApi.react(id, type),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['reactions', id] }),
  });

  const commentMutation = useMutation({
    mutationFn: () => commentsApi.add(id, { content: comment }),
    onSuccess: () => {
      setComment('');
      qc.invalidateQueries({ queryKey: ['comments', id] });
    },
  });

  if (isLoading) return <div className={styles.loading}>loading…</div>;
  if (!data?.post) return <div className={styles.loading}>post not found.</div>;

  const { post, liked } = data;

  return (
    <div className={styles.page}>
      <div className="container">
        {/* Back */}
        <Link to="/" className={styles.back}>← back to feed</Link>

        {/* Author */}
        <div className={styles.meta}>
          <Link to={`/profile/${post.author?.username}`} className={styles.author}>
            <div className={styles.avatar}>
              {post.author?.avatar
                ? <img src={post.author.avatar} alt="" />
                : <span>{post.author?.username?.[0]?.toUpperCase()}</span>
              }
            </div>
            <div>
              <p className={styles.authorName}>{post.author?.username}</p>
              <p className={styles.authorBio}>{post.author?.bio}</p>
            </div>
          </Link>
        </div>

        {/* Title */}
        <h1 className={`display ${styles.title}`}>{post.title}</h1>

        {/* Content */}
        {post.type === 'WRITTEN' && (
          <div className={styles.poemWrap}>
            <p className={styles.poem}>{post.content}</p>
          </div>
        )}

        {post.type === 'VIDEO' && post.videoUrl && (
          <div className={styles.videoWrap}>
            <a href={post.videoUrl} target="_blank" rel="noopener noreferrer" className={styles.videoLink}>
              ▶ Watch on external platform
            </a>
          </div>
        )}

        {/* Tags */}
        {post.tags?.length > 0 && (
          <div className={styles.tags}>
            {post.tags.map(t => (
              <Link key={t} to={`/explore?tag=${t}`} className={styles.tag}>#{t}</Link>
            ))}
          </div>
        )}

        {/* Engagement */}
        <div className={styles.engagementBar}>
          <button
            className={`${styles.likeBtn} ${liked ? styles.liked : ''}`}
            onClick={() => user && likeMutation.mutate()}
            disabled={!user}
          >
            {liked ? '♥' : '♡'} {post.likeCount ?? 0}
          </button>

          <div className={styles.reactions}>
            {REACTIONS.map(r => (
              <button
                key={r.type}
                className={styles.reactionBtn}
                title={r.label}
                onClick={() => user && reactMutation.mutate(r.type)}
                disabled={!user}
              >
                {r.emoji}
                <span className={styles.reactionCount}>
                  {reactionsData?.summary?.[r.type] ?? 0}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className={styles.divider} />

        {/* Comments */}
        <section id="comments" className={styles.comments}>
          <h2 className={`display ${styles.commentsTitle}`}>
            Responses <span className={styles.commentsCount}>
              {commentsData?.comments?.length ?? 0}
            </span>
          </h2>

          {user && (
            <div className={styles.commentForm}>
              <textarea
                className={styles.commentInput}
                placeholder="Leave a response…"
                value={comment}
                onChange={e => setComment(e.target.value)}
                rows={3}
              />
              <button
                className={styles.commentSubmit}
                onClick={() => comment.trim() && commentMutation.mutate()}
                disabled={commentMutation.isPending || !comment.trim()}
              >
                {commentMutation.isPending ? 'Posting…' : 'Post'}
              </button>
            </div>
          )}

          <div className={styles.commentList}>
            {commentsData?.comments?.map(c => (
              <div key={c._id} className={styles.comment}>
                <Link to={`/profile/${c.author?.username}`} className={styles.commentAuthor}>
                  {c.author?.username}
                </Link>
                <p className={styles.commentText}>{c.content}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
