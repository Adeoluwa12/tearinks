import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { postsApi } from '@/api';
import styles from './CreatePostPage.module.css';

const TYPES = [
  { value: 'WRITTEN', label: 'Written' },
  { value: 'VIDEO',   label: 'Video link' },
  { value: 'AUDIO',   label: 'Audio' },
];

export default function CreatePostPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    type: 'WRITTEN',
    title: '',
    content: '',
    videoUrl: '',
    tags: '',
  });
  const [error, setError] = useState('');

  const mutation = useMutation({
    mutationFn: (data) => postsApi.create(data),
    onSuccess: ({ data }) => navigate(`/posts/${data.post._id}`),
    onError: (err) => setError(err.response?.data?.message || 'Failed to publish'),
  });

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSubmit = () => {
    if (!form.title.trim()) return setError('Title is required');
    if (form.type === 'WRITTEN' && !form.content.trim()) return setError('Content is required');
    if (form.type === 'VIDEO'   && !form.videoUrl.trim()) return setError('Video URL is required');

    const tags = form.tags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean);
    mutation.mutate({ ...form, tags });
  };

  return (
    <div className={styles.page}>
      <div className="container">
        <h1 className={`display ${styles.heading}`}>Write a poem</h1>

        {/* Type selector */}
        <div className={styles.typeBar}>
          {TYPES.map(t => (
            <button
              key={t.value}
              className={`${styles.typeBtn} ${form.type === t.value ? styles.typeActive : ''}`}
              onClick={() => setForm(f => ({ ...f, type: t.value }))}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Title */}
        <div className={styles.field}>
          <label className={styles.label}>Title</label>
          <input
            className={styles.input}
            placeholder="Give your poem a name…"
            value={form.title}
            onChange={set('title')}
            maxLength={120}
          />
        </div>

        {/* Written content */}
        {form.type === 'WRITTEN' && (
          <div className={styles.field}>
            <label className={styles.label}>Poem</label>
            <textarea
              className={`${styles.input} ${styles.poemArea}`}
              placeholder={"words fall here\nlike rain on stone\n\nline breaks matter"}
              value={form.content}
              onChange={set('content')}
              rows={16}
            />
          </div>
        )}

        {/* Video URL */}
        {form.type === 'VIDEO' && (
          <div className={styles.field}>
            <label className={styles.label}>Video URL</label>
            <input
              className={styles.input}
              placeholder="https://youtube.com/watch?v=..."
              value={form.videoUrl}
              onChange={set('videoUrl')}
              type="url"
            />
          </div>
        )}

        {/* Audio placeholder */}
        {form.type === 'AUDIO' && (
          <div className={`${styles.field} ${styles.audioComing}`}>
            <p className="display">Audio recording — coming in Phase 3</p>
          </div>
        )}

        {/* Tags */}
        <div className={styles.field}>
          <label className={styles.label}>Tags <span className={styles.hint}>(comma-separated)</span></label>
          <input
            className={styles.input}
            placeholder="love, grief, night, city"
            value={form.tags}
            onChange={set('tags')}
          />
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.actions}>
          <button className={styles.cancelBtn} onClick={() => navigate(-1)}>Cancel</button>
          <button
            className={styles.publishBtn}
            onClick={handleSubmit}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? 'Publishing…' : 'Publish'}
          </button>
        </div>
      </div>
    </div>
  );
}
