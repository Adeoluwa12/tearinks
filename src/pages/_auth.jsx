import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/api';
import styles from './AuthPages.module.css';

// ── Login ────────────────────────────────────────────────────────────
export function LoginPage() {
  const navigate = useNavigate();
  const { login, loading, error, clearError } = useAuthStore();
  const [form, setForm] = useState({ email: '', password: '' });

  const set = (f) => (e) => { clearError(); setForm(p => ({ ...p, [f]: e.target.value })); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try { await login(form); navigate('/'); } catch {}
  };

  return (
    <div className={styles.page}>
      <div className={styles.glow} />
      <div className={styles.card}>
        <Link to="/" className={styles.logo}>Tearinks</Link>
        <h1 className={styles.heading}>Welcome back</h1>
        <p className={styles.sub}>Sign in to continue your poetry journey</p>

        <a href={authApi.googleUrl()} className={styles.googleBtn}>
          <GoogleIcon /> Continue with Google
        </a>
        <div className={styles.orDivider}><span>or</span></div>

        <form onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label className={styles.label}>Email</label>
            <input className={styles.input} type="email" required value={form.email} onChange={set('email')} autoComplete="email" placeholder="you@example.com" />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>
              Password
              <Link to="/forgot-password" className={styles.forgotLink}>Forgot password?</Link>
            </label>
            <input className={styles.input} type="password" required value={form.password} onChange={set('password')} autoComplete="current-password" placeholder="••••••••" />
          </div>
          {error && <p className={styles.error}>{error}</p>}
          <button className={styles.submitBtn} type="submit" disabled={loading}>
            {loading ? <span className={styles.spinner} /> : 'Sign in'}
          </button>
        </form>

        <p className={styles.switchText}>
          No account? <Link to="/register" className={styles.switchLink}>Join Tearinks</Link>
        </p>
      </div>
    </div>
  );
}

// ── Register ─────────────────────────────────────────────────────────
export function RegisterPage() {
  const navigate = useNavigate();
  const { register, loading, error, clearError } = useAuthStore();
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [success, setSuccess] = useState(false);

  const set = (f) => (e) => { clearError(); setForm(p => ({ ...p, [f]: e.target.value })); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(form);
      setSuccess(true);
      setTimeout(() => navigate('/'), 3000);
    } catch {}
  };

  return (
    <div className={styles.page}>
      <div className={styles.glow} />
      <div className={styles.card}>
        <Link to="/" className={styles.logo}>Tearinks</Link>
        <h1 className={styles.heading}>Join the poets</h1>
        <p className={styles.sub}>Create your account and start writing</p>

        {success ? (
          <div className={styles.successBox}>
            <span className={styles.successIcon}>✓</span>
            <p>Account created! Check your email to verify your address.</p>
          </div>
        ) : (
          <>
            <a href={authApi.googleUrl()} className={styles.googleBtn}>
              <GoogleIcon /> Continue with Google
            </a>
            <div className={styles.orDivider}><span>or</span></div>

            <form onSubmit={handleSubmit}>
              <div className={styles.field}>
                <label className={styles.label}>Username</label>
                <input className={styles.input} required minLength={3} maxLength={30} value={form.username} onChange={set('username')} autoComplete="username" placeholder="poetryhandle" />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Email</label>
                <input className={styles.input} type="email" required value={form.email} onChange={set('email')} autoComplete="email" placeholder="you@example.com" />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>
                  Password <span className={styles.hint}>(min 8 chars)</span>
                </label>
                <input className={styles.input} type="password" required minLength={8} value={form.password} onChange={set('password')} autoComplete="new-password" placeholder="••••••••" />
              </div>
              {error && <p className={styles.error}>{error}</p>}
              <button className={styles.submitBtn} type="submit" disabled={loading}>
                {loading ? <span className={styles.spinner} /> : 'Create account'}
              </button>
            </form>

            <p className={styles.switchText}>
              Have an account? <Link to="/login" className={styles.switchLink}>Sign in</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}

// ── Forgot Password ───────────────────────────────────────────────────
export function ForgotPasswordPage() {
  const { forgotPassword, loading } = useAuthStore();
  const [email, setEmail] = useState('');
  const [sent, setSent]   = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try { await forgotPassword(email); setSent(true); }
    catch (err) { setError(err.response?.data?.message || 'Failed to send email'); }
  };

  return (
    <div className={styles.page}>
      <div className={styles.glow} />
      <div className={styles.card}>
        <Link to="/" className={styles.logo}>Tearinks</Link>
        <h1 className={styles.heading}>Reset password</h1>
        <p className={styles.sub}>We'll send a reset link to your email</p>

        {sent ? (
          <div className={styles.successBox}>
            <span className={styles.successIcon}>✉</span>
            <p>Reset link sent to <strong>{email}</strong>. Check your inbox.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className={styles.field}>
              <label className={styles.label}>Email</label>
              <input className={styles.input} type="email" required value={email}
                onChange={e => { setError(''); setEmail(e.target.value); }}
                placeholder="you@example.com" />
            </div>
            {error && <p className={styles.error}>{error}</p>}
            <button className={styles.submitBtn} type="submit" disabled={loading}>
              {loading ? <span className={styles.spinner} /> : 'Send reset link'}
            </button>
          </form>
        )}

        <p className={styles.switchText}>
          <Link to="/login" className={styles.switchLink}>← Back to sign in</Link>
        </p>
      </div>
    </div>
  );
}

// ── Reset Password ────────────────────────────────────────────────────
export function ResetPasswordPage() {
  const { resetPassword, loading } = useAuthStore();
  const navigate  = useNavigate();
  const token     = window.location.pathname.split('/').pop();
  const [password, setPassword] = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [error,    setError]    = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirm)  return setError('Passwords do not match');
    if (password.length < 8)   return setError('Password must be at least 8 characters');
    try { await resetPassword(token, password); navigate('/'); }
    catch (err) { setError(err.response?.data?.message || 'Reset failed — link may have expired'); }
  };

  return (
    <div className={styles.page}>
      <div className={styles.glow} />
      <div className={styles.card}>
        <Link to="/" className={styles.logo}>Tearinks</Link>
        <h1 className={styles.heading}>New password</h1>
        <p className={styles.sub}>Choose a strong password for your account</p>

        <form onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label className={styles.label}>New password</label>
            <input className={styles.input} type="password" required minLength={8}
              value={password} onChange={e => { setError(''); setPassword(e.target.value); }}
              placeholder="••••••••" />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Confirm password</label>
            <input className={styles.input} type="password" required
              value={confirm} onChange={e => { setError(''); setConfirm(e.target.value); }}
              placeholder="••••••••" />
          </div>
          {error && <p className={styles.error}>{error}</p>}
          <button className={styles.submitBtn} type="submit" disabled={loading}>
            {loading ? <span className={styles.spinner} /> : 'Set new password'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Verify Email ──────────────────────────────────────────────────────
export function VerifyEmailPage() {
  const navigate = useNavigate();
  const token    = window.location.pathname.split('/').pop();
  const [status, setStatus] = useState('verifying');

  useState(() => {
    authApi.verifyEmail(token)
      .then(() => { setStatus('success'); setTimeout(() => navigate('/login'), 2500); })
      .catch(() => setStatus('error'));
  });

  return (
    <div className={styles.page}>
      <div className={styles.glow} />
      <div className={styles.card} style={{ textAlign: 'center' }}>
        <Link to="/" className={styles.logo}>Tearinks</Link>
        {status === 'verifying' && (
          <><div className={styles.verifySpinner} /><p className={styles.sub}>Verifying your email…</p></>
        )}
        {status === 'success' && (
          <div className={styles.successBox}>
            <span className={styles.successIcon}>✓</span>
            <p>Email verified! Redirecting to sign in…</p>
          </div>
        )}
        {status === 'error' && (
          <>
            <p className={styles.error} style={{ textAlign: 'center', marginBottom: '1rem' }}>
              This verification link is invalid or has expired.
            </p>
            <Link to="/login" className={styles.switchLink}>Go to sign in</Link>
          </>
        )}
      </div>
    </div>
  );
}

// ── AuthCallback ──────────────────────────────────────────────────────
export function AuthCallback() {
  const navigate = useNavigate();
  const setToken = useAuthStore(s => s.setToken);
  const fetchMe  = useAuthStore(s => s.fetchMe);

  useState(() => {
    const params = new URLSearchParams(window.location.search);
    const token  = params.get('token');
    if (token) { setToken(token); fetchMe().then(() => navigate('/')); }
    else navigate('/login?error=oauth');
  });

  return (
    <div className={styles.page}>
      <div className={styles.glow} />
      <div className={styles.card} style={{ textAlign: 'center' }}>
        <div className={styles.verifySpinner} />
        <p className={styles.sub}>Signing you in…</p>
      </div>
    </div>
  );
}

// ── Google Icon ───────────────────────────────────────────────────────
function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48" style={{ flexShrink: 0 }}>
      <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.2l6.7-6.7C35.8 2.5 30.2 0 24 0 14.6 0 6.6 5.4 2.6 13.3l7.8 6C12.3 13 17.7 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.2-.4-4.7H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7.1-10.1 7.1-17.3z"/>
      <path fill="#FBBC05" d="M10.4 28.7A14.5 14.5 0 0 1 9.5 24c0-1.6.3-3.2.8-4.7l-7.8-6A24 24 0 0 0 0 24c0 3.8.9 7.4 2.6 10.7l7.8-6z"/>
      <path fill="#34A853" d="M24 48c6.2 0 11.4-2 15.2-5.5l-7.5-5.8c-2 1.4-4.6 2.2-7.7 2.2-6.3 0-11.7-4.3-13.6-10l-7.8 6C6.6 42.6 14.6 48 24 48z"/>
    </svg>
  );
}

export default LoginPage;
