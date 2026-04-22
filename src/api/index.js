import api from './client';

const BASE = import.meta.env.VITE_API_URL || 'https://tearinks-api.onrender.com/api';

// ── Auth ────────────────────────────────────────────────────────────
export const authApi = {
  register:        (data)    => api.post('/auth/register', data),
  login:           (data)    => api.post('/auth/login', data),
  me:              ()        => api.get('/auth/me'),
  forgotPassword:  (email)   => api.post('/auth/forgot-password', { email }),
  resetPassword:   (token, password) => api.post(`/auth/reset-password/${token}`, { password }),
  verifyEmail:     (token)   => api.get(`/auth/verify-email/${token}`),
  googleUrl:       ()        => `${BASE}/auth/google`,
};

// ── Posts ───────────────────────────────────────────────────────────
export const postsApi = {
  list:   (params)   => api.get('/posts', { params }),
  get:    (id)       => api.get(`/posts/${id}`),
  create: (data)     => api.post('/posts', data),
  delete: (id)       => api.delete(`/posts/${id}`),
  like:   (id)       => api.post(`/posts/${id}/like`),
};

// ── Comments ─────────────────────────────────────────────────────────
export const commentsApi = {
  list:   (postId, params) => api.get(`/posts/${postId}/comments`, { params }),
  add:    (postId, data)   => api.post(`/posts/${postId}/comments`, data),
  delete: (postId, id)     => api.delete(`/posts/${postId}/comments/${id}`),
};

// ── Reactions ─────────────────────────────────────────────────────────
export const reactionsApi = {
  react:    (postId, type) => api.post(`/posts/${postId}/reaction`, { type }),
  summary:  (postId)       => api.get(`/posts/${postId}/reactions`),
};

// ── Collections ──────────────────────────────────────────────────────
export const collectionsApi = {
  list:       ()           => api.get('/collections'),
  get:        (id)         => api.get(`/collections/${id}`),
  create:     (data)       => api.post('/collections', data),
  update:     (id, data)   => api.patch(`/collections/${id}`, data),
  delete:     (id)         => api.delete(`/collections/${id}`),
  addPoem:    (id, postId) => api.post(`/collections/${id}/poems`, { postId }),
  removePoem: (id, postId) => api.delete(`/collections/${id}/poems/${postId}`),
};

// ── Users ─────────────────────────────────────────────────────────────
export const usersApi = {
  profile:       (username) => api.get(`/users/${username}/profile`),
  updateMe:      (data)     => api.patch('/users/me', data),
  follow:        (id)       => api.post(`/users/${id}/follow`),
  getFollowers:  (id)       => api.get(`/users/${id}/followers`),
  getFollowing:  (id)       => api.get(`/users/${id}/following`),
};

// ── Leaderboard ───────────────────────────────────────────────────────
export const leaderboardApi = {
  weekly:    (week) => api.get('/leaderboard', { params: { week } }),
  topPoems:  ()     => api.get('/leaderboard/top-poems'),
  refresh:   ()     => api.post('/leaderboard/refresh'),  // admin trigger
};
