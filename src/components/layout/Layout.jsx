import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import styles from './Layout.module.css';

export default function Layout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [installPrompt, setInstallPrompt] = useState(null);
  const [showBanner,    setShowBanner]    = useState(false);

  // Capture the beforeinstallprompt event for the PWA install banner
  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
      setShowBanner(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') setShowBanner(false);
    setInstallPrompt(null);
  };

  const navCls = ({ isActive }) =>
    isActive ? `${styles.link} ${styles.active}` : styles.link;

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <nav className={styles.nav}>
          <NavLink to="/" className={styles.logo}>
            <span className={styles.logoText}>Tearinks</span>
          </NavLink>

          <div className={styles.navLinks}>
            <NavLink to="/"            className={navCls} end>Feed</NavLink>
            <NavLink to="/explore"     className={navCls}>Explore</NavLink>
            <NavLink to="/leaderboard" className={navCls}>Ranks</NavLink>
          </div>

          <div className={styles.navActions}>
            {user ? (
              <>
                <button className={styles.createBtn} onClick={() => navigate('/create')}>
                  + <span>Write</span>
                </button>
                <NavLink to={`/profile/${user.username}`} className={styles.avatar}>
                  {user.avatar
                    ? <img src={user.avatar} alt={user.username} />
                    : <span>{user.username[0].toUpperCase()}</span>
                  }
                </NavLink>
                <button className={styles.logoutBtn} onClick={logout}>Out</button>
              </>
            ) : (
              <>
                <NavLink to="/login"    className={styles.link}>Sign in</NavLink>
                <NavLink to="/register" className={styles.createBtn}>Join</NavLink>
              </>
            )}
          </div>
        </nav>
      </header>

      <main className={styles.main}>
        <Outlet />
      </main>

      <footer className={styles.footer}>
        <p className={styles.footerText}>
          <span className="display">Tearinks</span> — where poetry breathes
        </p>
      </footer>

      {/* PWA install banner */}
      {showBanner && (
        <div className={styles.installBanner}>
          <span>Add Tearinks to your home screen</span>
          <button className={styles.installBtn} onClick={handleInstall}>Install</button>
          <button className={styles.dismissBtn} onClick={() => setShowBanner(false)}>×</button>
        </div>
      )}
    </div>
  );
}
