import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { collectionsApi, postsApi } from '@/api';
import { useAuthStore } from '@/store/authStore';
import PostCard from '@/components/post/PostCard';
import styles from './CollectionsPage.module.css';

/* ─────────────────────────────────────────────────────────────────
   MyCollectionsPage  —  /collections
   Lists the logged-in user's collections, lets them create new ones
───────────────────────────────────────────────────────────────── */
export function MyCollectionsPage() {
  const user = useAuthStore(s => s.user);
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', isPublic: true });
  const [formErr, setFormErr] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['my-collections'],
    queryFn: () => collectionsApi.list().then(r => r.data),
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: () => collectionsApi.create(form),
    onSuccess: ({ data: res }) => {
      qc.invalidateQueries({ queryKey: ['my-collections'] });
      setCreating(false);
      setForm({ title: '', description: '', isPublic: true });
      navigate(`/collections/${res.collection._id}`);
    },
    onError: (err) => setFormErr(err.response?.data?.message || 'Failed to create'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => collectionsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['my-collections'] }),
  });

  if (!user) return (
    <div className={styles.page}><div className="container">
      <p className={styles.muted}>Please <Link to="/login" className={styles.linkBlue}>sign in</Link> to view your collections.</p>
    </div></div>
  );

  return (
    <div className={styles.page}>
      <div className="container">
        <div className={styles.pageHeader}>
          <h1 className={`display ${styles.title}`}>My Collections</h1>
          <button className={styles.primaryBtn} onClick={() => setCreating(v => !v)}>
            {creating ? 'Cancel' : '+ New Collection'}
          </button>
        </div>

        {/* Create form */}
        {creating && (
          <div className={styles.createForm}>
            <h2 className={styles.formTitle}>New collection</h2>
            <div className={styles.field}>
              <label className={styles.label}>Title</label>
              <input
                className={styles.input}
                placeholder="Midnight Thoughts"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                maxLength={100}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Description <span className={styles.hint}>(optional)</span></label>
              <textarea
                className={styles.input}
                placeholder="A brief description of this collection…"
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                rows={3}
                maxLength={500}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.checkRow}>
                <input
                  type="checkbox"
                  className={styles.checkbox}
                  checked={form.isPublic}
                  onChange={e => setForm(f => ({ ...f, isPublic: e.target.checked }))}
                />
                <span>Public — anyone can view this collection</span>
              </label>
            </div>
            {formErr && <p className={styles.error}>{formErr}</p>}
            <div className={styles.formActions}>
              <button className={styles.ghostBtn} onClick={() => setCreating(false)}>Cancel</button>
              <button
                className={styles.primaryBtn}
                onClick={() => { if (!form.title.trim()) return setFormErr('Title is required'); createMutation.mutate(); }}
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? 'Creating…' : 'Create'}
              </button>
            </div>
          </div>
        )}

        {isLoading && <p className={styles.muted}>Loading…</p>}

        {data?.collections?.length === 0 && !creating && (
          <div className={styles.emptyState}>
            <p className={`display ${styles.emptyTitle}`}>No collections yet</p>
            <p className={styles.muted}>Group your poems into books and share them with the world.</p>
          </div>
        )}

        <div className={styles.grid}>
          {data?.collections?.map(col => (
            <div key={col._id} className={styles.collectionCard}>
              <Link to={`/collections/${col._id}`} className={styles.cardLink}>
                <div className={styles.cardTop}>
                  <h2 className={`display ${styles.cardTitle}`}>{col.title}</h2>
                  <span className={`${styles.badge} ${col.isPublic ? styles.badgePublic : styles.badgePrivate}`}>
                    {col.isPublic ? 'Public' : 'Private'}
                  </span>
                </div>
                {col.description && <p className={styles.cardDesc}>{col.description}</p>}
                <p className={styles.cardMeta}>{col.poems?.length ?? 0} poems</p>
              </Link>
              <div className={styles.cardActions}>
                <Link to={`/collections/${col._id}`} className={styles.cardActionBtn}>View</Link>
                <button
                  className={`${styles.cardActionBtn} ${styles.cardActionDanger}`}
                  onClick={() => { if (confirm('Delete this collection?')) deleteMutation.mutate(col._id); }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   CollectionDetailPage  —  /collections/:id
   View a collection, add/remove poems (if owner)
───────────────────────────────────────────────────────────────── */
export function CollectionDetailPage() {
  const { id } = useParams();
  const me = useAuthStore(s => s.user);
  const qc = useQueryClient();
  const [addingPoem, setAddingPoem] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['collection', id],
    queryFn: () => collectionsApi.get(id).then(r => r.data),
  });

  // Load user's own posts to pick from when adding
  const { data: myPosts } = useQuery({
    queryKey: ['posts', 'author', me?._id],
    queryFn: () => postsApi.list({ author: me._id, limit: 50 }).then(r => r.data),
    enabled: !!me && addingPoem,
  });

  const addPoemMutation = useMutation({
    mutationFn: (postId) => collectionsApi.addPoem(id, postId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['collection', id] }),
  });

  const removePoemMutation = useMutation({
    mutationFn: (postId) => collectionsApi.removePoem(id, postId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['collection', id] }),
  });

  const updateMutation = useMutation({
    mutationFn: () => collectionsApi.update(id, editForm),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['collection', id] });
      setEditing(false);
    },
  });

  if (isLoading) return <div className={styles.page}><div className="container"><p className={styles.muted}>Loading…</p></div></div>;

  const col = data?.collection;
  if (!col) return <div className={styles.page}><div className="container"><p className={styles.muted}>Collection not found.</p></div></div>;

  const isOwner = me?._id === col.owner?._id;
  const poemIds = new Set(col.poems?.map(p => p._id));

  const startEdit = () => {
    setEditForm({ title: col.title, description: col.description, isPublic: col.isPublic });
    setEditing(true);
  };

  return (
    <div className={styles.page}>
      <div className="container">
        <Link to="/collections" className={styles.back}>← My collections</Link>

        {editing ? (
          <div className={styles.createForm}>
            <h2 className={styles.formTitle}>Edit collection</h2>
            <div className={styles.field}>
              <label className={styles.label}>Title</label>
              <input className={styles.input} value={editForm.title}
                onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))} />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Description</label>
              <textarea className={styles.input} rows={3} value={editForm.description}
                onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))} />
            </div>
            <div className={styles.field}>
              <label className={styles.checkRow}>
                <input type="checkbox" className={styles.checkbox}
                  checked={editForm.isPublic}
                  onChange={e => setEditForm(f => ({ ...f, isPublic: e.target.checked }))} />
                <span>Public</span>
              </label>
            </div>
            <div className={styles.formActions}>
              <button className={styles.ghostBtn} onClick={() => setEditing(false)}>Cancel</button>
              <button className={styles.primaryBtn} onClick={() => updateMutation.mutate()} disabled={updateMutation.isPending}>
                {updateMutation.isPending ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        ) : (
          <div className={styles.detailHeader}>
            <div>
              <h1 className={`display ${styles.title}`}>{col.title}</h1>
              {col.description && <p className={styles.collectionDesc}>{col.description}</p>}
              <div className={styles.detailMeta}>
                <span className={`${styles.badge} ${col.isPublic ? styles.badgePublic : styles.badgePrivate}`}>
                  {col.isPublic ? 'Public' : 'Private'}
                </span>
                <span className={styles.muted}>{col.poems?.length ?? 0} poems</span>
                <span className={styles.muted}>by{' '}
                  <Link to={`/profile/${col.owner?.username}`} className={styles.linkBlue}>
                    {col.owner?.username}
                  </Link>
                </span>
              </div>
            </div>
            {isOwner && (
              <div className={styles.ownerActions}>
                <button className={styles.ghostBtn} onClick={startEdit}>Edit</button>
                <button className={styles.primaryBtn} onClick={() => setAddingPoem(v => !v)}>
                  {addingPoem ? 'Done adding' : '+ Add poems'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Add poems panel */}
        {addingPoem && isOwner && (
          <div className={styles.addPoemPanel}>
            <h3 className={styles.panelTitle}>Your poems — click to add or remove</h3>
            {myPosts?.posts?.length === 0 && <p className={styles.muted}>You haven't written any poems yet.</p>}
            <div className={styles.addPoemList}>
              {myPosts?.posts?.map(post => {
                const inCollection = poemIds.has(post._id);
                return (
                  <div key={post._id} className={`${styles.addPoemRow} ${inCollection ? styles.addPoemRowIn : ''}`}>
                    <div className={styles.addPoemInfo}>
                      <span className={`display ${styles.addPoemTitle}`}>{post.title}</span>
                      <span className={styles.addPoemType}>{post.type}</span>
                    </div>
                    <button
                      className={inCollection ? styles.removeBtn : styles.addBtn}
                      onClick={() => inCollection
                        ? removePoemMutation.mutate(post._id)
                        : addPoemMutation.mutate(post._id)
                      }
                    >
                      {inCollection ? '− Remove' : '+ Add'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Poem list */}
        <div className={styles.poemList}>
          {col.poems?.length === 0 && !addingPoem && (
            <div className={styles.emptyState}>
              <p className={`display ${styles.emptyTitle}`}>Empty collection</p>
              {isOwner && <p className={styles.muted}>Click "+ Add poems" to start filling this collection.</p>}
            </div>
          )}
          {col.poems?.map((poem, i) => (
            <div key={poem._id} className={styles.poemEntry}>
              <span className={styles.poemIndex}>{String(i + 1).padStart(2, '0')}</span>
              <div className={styles.poemContent}>
                <PostCard post={poem} />
              </div>
              {isOwner && (
                <button
                  className={styles.removePoemBtn}
                  onClick={() => removePoemMutation.mutate(poem._id)}
                  title="Remove from collection"
                >×</button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default MyCollectionsPage;
