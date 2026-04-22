import { Link } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { postsApi } from '@/api';
import { useAuthStore } from '@/store/authStore';
import styles from './PostCard.module.css';

const REACTIONS = [
  { type: 'DEEP',     emoji: '💔', label: 'Deep' },
  { type: 'POWERFUL', emoji: '🔥', label: 'Powerful' },
  { type: 'CALM',     emoji: '🌙', label: 'Calm' },
  { type: 'RAW',      emoji: '🩸', label: 'Raw' },
];

export default function PostCard({ post, showFull = false }) {
  const user = useAuthStore(s => s.user);
  const queryClient = useQueryClient();

  const likeMutation = useMutation({
    mutationFn: () => postsApi.like(post._id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['post', post._id] });
    },
  });

  const preview = !showFull && post.content?.length > 280
    ? post.content.slice(0, 280) + '…'
    : post.content;

  const timeAgo = (dateStr) => {
    const diff = (Date.now() - new Date(dateStr)) / 1000;
    if (diff < 60)   return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    return `${Math.floor(diff / 86400)}d`;
  };

  return (
    <article className={styles.card}>
      {/* Author row */}
      <div className={styles.meta}>
        <Link to={`/profile/${post.author?.username}`} className={styles.author}>
          <div className={styles.authorAvatar}>
            {post.author?.avatar
              ? <img src={post.author.avatar} alt="" />
              : <span>{post.author?.username?.[0]?.toUpperCase()}</span>
            }
          </div>
          <span className={styles.authorName}>{post.author?.username}</span>
        </Link>
        <span className={styles.time}>{timeAgo(post.createdAt)}</span>
      </div>

      {/* Title */}
      <Link to={`/posts/${post._id}`} className={styles.titleLink}>
        <h2 className={`${styles.title} display`}>{post.title}</h2>
      </Link>

      {/* Content */}
      {post.type === 'WRITTEN' && post.content && (
        <div className={styles.content}>
          <p className={styles.poem}>{preview}</p>
          {!showFull && post.content?.length > 280 && (
            <Link to={`/posts/${post._id}`} className={styles.readMore}>
              continue reading
            </Link>
          )}
        </div>
      )}

      {post.type === 'VIDEO' && post.videoUrl && (
        <div className={styles.videoEmbed}>
          <a href={post.videoUrl} target="_blank" rel="noopener noreferrer" className={styles.videoLink}>
            ▶ Watch video
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

      {/* Engagement bar */}
      <div className={styles.engagement}>
        <button
          className={`${styles.likeBtn} ${post.liked ? styles.liked : ''}`}
          onClick={() => user && likeMutation.mutate()}
          disabled={!user}
          aria-label="Like"
        >
          <span className={styles.heartIcon}>{post.liked ? '♥' : '♡'}</span>
          <span className={styles.count}>{post.likeCount ?? 0}</span>
        </button>

        <Link to={`/posts/${post._id}#comments`} className={styles.commentBtn}>
          <span>◇</span>
          <span className={styles.count}>{post.commentCount ?? 0}</span>
        </Link>

        {REACTIONS.map(r => (
          <span key={r.type} className={styles.reactionPill} title={r.label}>
            {r.emoji}
          </span>
        ))}
      </div>
    </article>
  );
}
