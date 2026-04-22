import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { postsApi } from '@/api';
import PostCard from '@/components/post/PostCard';
import styles from './HomePage.module.css';

const SORT_OPTIONS = [
  { value: 'latest', label: 'Latest' },
  { value: 'top',    label: 'Top' },
];

export default function HomePage() {
  const [sort, setSort] = useState('latest');
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['posts', { sort, page }],
    queryFn: () => postsApi.list({ sort, page, limit: 20 }).then(r => r.data),
    keepPreviousData: true,
  });

  return (
    <div className={styles.page}>
      <div className="container">
        {/* Hero */}
        <div className={styles.hero}>
          <h1 className={`display ${styles.heroTitle}`}>The Feed</h1>
          <div className={styles.sortBar}>
            {SORT_OPTIONS.map(o => (
              <button
                key={o.value}
                className={`${styles.sortBtn} ${sort === o.value ? styles.sortActive : ''}`}
                onClick={() => { setSort(o.value); setPage(1); }}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>

        {/* Posts */}
        {isLoading && <div className={styles.loading}>loading poems…</div>}
        {isError   && <div className={styles.error}>failed to load. try again.</div>}

        {data?.posts?.length === 0 && (
          <div className={styles.empty}>
            <p className="display">No poems yet.</p>
            <p>Be the first to write something.</p>
          </div>
        )}

        <div className={styles.feed}>
          {data?.posts?.map(post => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>

        {/* Pagination */}
        {data && data.pages > 1 && (
          <div className={styles.pagination}>
            <button
              className={styles.pageBtn}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >← prev</button>
            <span className={styles.pageInfo}>{page} / {data.pages}</span>
            <button
              className={styles.pageBtn}
              onClick={() => setPage(p => Math.min(data.pages, p + 1))}
              disabled={page === data.pages}
            >next →</button>
          </div>
        )}
      </div>
    </div>
  );
}
