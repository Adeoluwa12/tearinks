import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';

import Layout            from '@/components/layout/Layout';
import HomePage          from '@/pages/HomePage';
import ExplorePage       from '@/pages/ExplorePage';
import PostPage          from '@/pages/PostPage';
import CreatePostPage    from '@/pages/CreatePostPage';
import ProfilePage       from '@/pages/ProfilePage';
import CollectionPage    from '@/pages/CollectionPage';
import LeaderboardPage   from '@/pages/LeaderboardPage';
import LoginPage         from '@/pages/LoginPage';
import RegisterPage      from '@/pages/RegisterPage';
import AuthCallback      from '@/pages/AuthCallback';
import ForgotPasswordPage from '@/pages/ForgotPasswordPage';
import ResetPasswordPage  from '@/pages/ResetPasswordPage';
import VerifyEmailPage    from '@/pages/VerifyEmailPage';

const ProtectedRoute = ({ children }) => {
  const token = useAuthStore(s => s.token);
  return token ? children : <Navigate to="/login" replace />;
};

export default function App() {
  const fetchMe = useAuthStore(s => s.fetchMe);

  useEffect(() => { fetchMe(); }, [fetchMe]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index                    element={<HomePage />} />
          <Route path="explore"           element={<ExplorePage />} />
          <Route path="posts/:id"         element={<PostPage />} />
          <Route path="profile/:username" element={<ProfilePage />} />
          <Route path="collections/:id"   element={<CollectionPage />} />
          <Route path="leaderboard"       element={<LeaderboardPage />} />

          <Route path="create" element={
            <ProtectedRoute><CreatePostPage /></ProtectedRoute>
          } />
        </Route>

        <Route path="/login"                   element={<LoginPage />} />
        <Route path="/register"                element={<RegisterPage />} />
        <Route path="/forgot-password"         element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token"   element={<ResetPasswordPage />} />
        <Route path="/verify-email/:token"     element={<VerifyEmailPage />} />
        <Route path="/auth/callback"           element={<AuthCallback />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
