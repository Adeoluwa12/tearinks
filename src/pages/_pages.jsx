// 1. ALL IMPORTS AT THE TOP
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  usersApi, 
  postsApi, 
  collectionsApi, 
  leaderboardApi 
} from '@/api';
import { useAuthStore } from '@/store/authStore';
import PostCard from '@/components/post/PostCard';
import styles from './GenericPage.module.css';

// ---------------------------------------------------------
// 2. INDIVIDUAL PAGE FUNCTIONS
// ---------------------------------------------------------

export function ExplorePage() {
  const [params, setParams] = useSearchParams();
  const tag = params.get('tag') || '';

  const { data, isLoading } = useQuery({
    queryKey: ['posts', 'explore', tag],
    queryFn: () => postsApi.list({ tag: tag || undefined, sort: 'top', limit: 30 }).then(r => r.data),
  });

  return (
    <div className={styles.page}>
      <div className="container">
        <div className={styles.header}>
          <h1 className={`display ${styles.title}`}>Explore</h1>
          {tag && (
            <div className={styles.filterBadge}>
              #{tag}
              <button className={styles.clearFilter} onClick={() => setParams({})}>×</button>
            </div>
          )}
        </div>
        {isLoading && <p className={styles.muted}>loading…</p>}
        {data?.posts?.map(post => <PostCard key={post._id} post={post} />)}
        {data?.posts?.length === 0 && <p className={styles.muted}>No poems found{tag ? ` for #${tag}` : ''}.</p>}
      </div>
    </div>
  );
}

export function ProfilePage() {
  const { username } = useParams();
  const me = useAuthStore(s => s.user);
  const qc = useQueryClient();

  const { data: profileData } = useQuery({
    queryKey: ['profile', username],
    queryFn: () => usersApi.profile(username).then(r => r.data),
  });

  const { data: postsData } = useQuery({
    queryKey: ['posts', 'author', profileData?.user?._id],
    queryFn: () => postsApi.list({ author: profileData.user._id }).then(r => r.data),
    enabled: !!profileData?.user?._id,
  });

  const followMutation = useMutation({
    mutationFn: () => usersApi.follow(profileData.user._id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['profile', username] }),
  });

  const user = profileData?.user;
  if (!user) return <div className={styles.page}><div className="container"><p className={styles.muted}>Loading…</p></div></div>;

  const isMe = me?._id === user._id;
  const isFollowing = user.followers?.includes(me?._id);

  return (
    <div className={styles.page}>
      <div className="container">
        <div className={styles.profileHero}>
          <div className={styles.profileAvatar}>
            {user.avatar ? <img src={user.avatar} alt="" /> : <span>{user.username[0].toUpperCase()}</span>}
          </div>
          <div className={styles.profileInfo}>
            <h1 className={`display ${styles.profileName}`}>{user.username}</h1>
            {user.bio && <p className={styles.profileBio}>{user.bio}</p>}
            <div className={styles.profileStats}>
              <span><strong>{profileData.postCount}</strong> poems</span>
              <span><strong>{user.followers?.length ?? 0}</strong> followers</span>
              <span><strong>{user.following?.length ?? 0}</strong> following</span>
            </div>
          </div>
          {me && !isMe && (
            <button
              className={`${styles.followBtn} ${isFollowing ? styles.following : ''}`}
              onClick={() => followMutation.mutate()}
            >
              {isFollowing ? 'Unfollow' : 'Follow'}
            </button>
          )}
        </div>

        <div className={styles.sectionTitle}>
          <span className="display">Poems</span>
        </div>
        {postsData?.posts?.map(p => <PostCard key={p._id} post={p} />)}
      </div>
    </div>
  );
}

export function CollectionPage() {
  const { id } = useParams();
  const { data, isLoading } = useQuery({
    queryKey: ['collection', id],
    queryFn: () => collectionsApi.get(id).then(r => r.data),
  });

  if (isLoading) return <div className={styles.page}><div className="container"><p className={styles.muted}>Loading…</p></div></div>;

  const col = data?.collection;
  return (
    <div className={styles.page}>
      <div className="container">
        <h1 className={`display ${styles.title}`}>{col?.title}</h1>
        {col?.description && <p className={styles.collectionDesc}>{col.description}</p>}
        <p className={styles.muted} style={{ marginBottom: '2rem' }}>
          {col?.poems?.length ?? 0} poems · by{' '}
          <Link to={`/profile/${col?.owner?.username}`}>{col?.owner?.username}</Link>
        </p>
        {col?.poems?.map(p => <PostCard key={p._id} post={p} />)}
      </div>
    </div>
  );
}

export function LeaderboardPage() {
  const { data: weekData } = useQuery({
    queryKey: ['leaderboard', 'current'],
    queryFn: () => leaderboardApi.weekly('current').then(r => r.data),
  });

  const { data: topPoemsData } = useQuery({
    queryKey: ['leaderboard', 'top-poems'],
    queryFn: () => leaderboardApi.topPoems().then(r => r.data),
  });

  return (
    <div className={styles.page}>
      <div className="container">
        <h1 className={`display ${styles.title}`}>Rankings</h1>

        <h2 className={styles.sectionHeading}>This Week's Poets</h2>
        <div className={styles.rankList}>
          {weekData?.entries?.map((entry, i) => (
            <div key={entry._id} className={styles.rankRow}>
              <span className={`${styles.rankNum} mono`}>
                {String(i + 1).padStart(2, '0')}
              </span>
              <Link to={`/profile/${entry.user?.username}`} className={styles.rankUser}>
                <div className={styles.rankAvatar}>
                  {entry.user?.avatar
                    ? <img src={entry.user.avatar} alt="" />
                    : <span>{entry.user?.username?.[0]?.toUpperCase()}</span>
                  }
                </div>
                <span>{entry.user?.username}</span>
              </Link>
              <span className={`${styles.rankPoints} mono`}>{entry.points} pts</span>
            </div>
          ))}
          {weekData?.entries?.length === 0 && (
            <p className={styles.muted}>No rankings yet this week.</p>
          )}
        </div>

        <h2 className={styles.sectionHeading} style={{ marginTop: '3rem' }}>Top Poems</h2>
        <div className={styles.rankList}>
          {topPoemsData?.posts?.map((post, i) => (
            <div key={post._id} className={styles.rankRow}>
              <span className={`${styles.rankNum} mono`}>{String(i + 1).padStart(2, '0')}</span>
              <Link to={`/posts/${post._id}`} className={styles.rankPoem}>
                <span className={`display ${styles.rankPoemTitle}`}>{post.title}</span>
                <span className={styles.rankPoemAuthor}>by {post.author?.username}</span>
              </Link>
              <span className={`${styles.rankPoints} mono`}>{post.score} pts</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}