// _pages.jsx - Consolidated Version
import { useState } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi, postsApi, collectionsApi, leaderboardApi } from '@/api';
import { useAuthStore } from '@/store/authStore';
import PostCard from '@/components/post/PostCard';
import styles from './GenericPage.module.css';

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
  const [tab, setTab] = useState('poems');

  const { data: profileData } = useQuery({
    queryKey: ['profile', username],
    queryFn: () => usersApi.profile(username).then(r => r.data),
  });

  const { data: postsData } = useQuery({
    queryKey: ['posts', 'author', profileData?.user?._id],
    queryFn: () => postsApi.list({ author: profileData.user._id }).then(r => r.data),
    enabled: !!profileData?.user?._id && tab === 'poems',
  });

  const { data: collectionsData } = useQuery({
    queryKey: ['collections', 'user', profileData?.user?._id],
    queryFn: () => collectionsApi.list().then(r => r.data),
    enabled: !!profileData?.user?._id && tab === 'collections' && me?._id === profileData?.user?._id,
  });

  const followMutation = useMutation({
    mutationFn: () => usersApi.follow(profileData.user._id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['profile', username] }),
  });

  const user = profileData?.user;
  if (!user) return <div className={styles.page}><div className="container"><p className={styles.muted}>Loading…</p></div></div>;

  const isMe = me?._id === user._id;
  const isFollowing = user.followers?.some(f => (f._id || f) === me?._id);

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
              disabled={followMutation.isPending}
            >
              {isFollowing ? 'Unfollow' : 'Follow'}
            </button>
          )}
        </div>

        <div className={styles.tabs}>
          <button className={`${styles.tab} ${tab === 'poems' ? styles.tabActive : ''}`} onClick={() => setTab('poems')}>
            Poems
          </button>
          {isMe && (
            <button className={`${styles.tab} ${tab === 'collections' ? styles.tabActive : ''}`} onClick={() => setTab('collections')}>
              Collections
            </button>
          )}
        </div>

        {tab === 'poems' && (
          <div>
            {postsData?.posts?.length === 0 && <p className={styles.muted}>No poems yet.</p>}
            {postsData?.posts?.map(p => <PostCard key={p._id} post={p} />)}
          </div>
        )}

        {tab === 'collections' && isMe && (
          <div>
            <div className={styles.collectionsRow}>
              <Link to="/collections" className={styles.manageLink}>Manage collections →</Link>
            </div>
            {collectionsData?.collections?.length === 0 && (
              <p className={styles.muted}>No collections yet. <Link to="/collections" className={styles.linkBlue}>Create one</Link>.</p>
            )}
            <div className={styles.collectionsGrid}>
              {collectionsData?.collections?.map(col => (
                <Link key={col._id} to={`/collections/${col._id}`} className={styles.collectionMini}>
                  <span className={`display ${styles.collectionMiniTitle}`}>{col.title}</span>
                  <span className={styles.collectionMiniCount}>{col.poems?.length ?? 0} poems</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function CollectionPage() {
  const { id } = useParams();
  return <div style={{ padding: '4rem 1.25rem', textAlign: 'center', fontFamily: 'var(--font-mono)', color: 'var(--fog)' }}>
    Redirecting… <Link to={`/collections/${id}`} style={{ color: 'var(--blue-bright)' }}>click here</Link>
  </div>;
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

export default ExplorePage;