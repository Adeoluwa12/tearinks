import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import styles from './Layout.module.css';

export default function Layout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [installPrompt, setInstallPrompt] = useState(null);
  const [showBanner, setShowBanner] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Close drawer on route change
  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  // Lock body scroll when drawer open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

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

  const mobileNavCls = ({ isActive }) =>
    isActive ? `${styles.mobileLink} ${styles.mobileLinkActive}` : styles.mobileLink;

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <nav className={styles.nav}>
          <NavLink to="/" className={styles.logo}>
            <span className={styles.logoText}>Tearinks</span>
          </NavLink>

          {/* Desktop nav */}
          <div className={styles.navLinks}>
            <NavLink to="/" className={navCls} end>Feed</NavLink>
            <NavLink to="/explore" className={navCls}>Explore</NavLink>
            <NavLink to="/leaderboard" className={navCls}>Ranks</NavLink>
            {user && <NavLink to="/collections" className={navCls}>Collections</NavLink>}
          </div>

          {/* Desktop actions */}
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
                <NavLink to="/login" className={styles.link}>Sign in</NavLink>
                <NavLink to="/register" className={styles.createBtn}>Join</NavLink>
              </>
            )}
          </div>

          {/* Hamburger — mobile only */}
          <button
            className={styles.hamburger}
            onClick={() => setMenuOpen(o => !o)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            <span className={`${styles.bar} ${menuOpen ? styles.barTop : ''}`} />
            <span className={`${styles.bar} ${menuOpen ? styles.barMid : ''}`} />
            <span className={`${styles.bar} ${menuOpen ? styles.barBot : ''}`} />
          </button>
        </nav>
      </header>

      {/* Backdrop */}
      {menuOpen && (
        <div className={styles.backdrop} onClick={() => setMenuOpen(false)} aria-hidden="true" />
      )}

      {/* Mobile drawer */}
      <div className={`${styles.mobileDrawer} ${menuOpen ? styles.drawerOpen : ''}`}>
        <div className={styles.drawerInner}>
          <div className={styles.mobileSection}>
            <NavLink to="/" className={mobileNavCls} end>Feed</NavLink>
            <NavLink to="/explore" className={mobileNavCls}>Explore</NavLink>
            <NavLink to="/leaderboard" className={mobileNavCls}>Ranks</NavLink>
            {user && <NavLink to="/collections" className={mobileNavCls}>Collections</NavLink>}
          </div>

          <div className={styles.drawerDivider} />

          <div className={styles.mobileSection}>
            {user ? (
              <>
                <NavLink to={`/profile/${user.username}`} className={styles.mobileUserRow}>
                  <div className={styles.mobileAvatar}>
                    {user.avatar
                      ? <img src={user.avatar} alt={user.username} />
                      : <span>{user.username[0].toUpperCase()}</span>
                    }
                  </div>
                  <div>
                    <p className={styles.mobileUsername}>{user.username}</p>
                    <p className={styles.mobileUserSub}>View profile</p>
                  </div>
                </NavLink>
                <button className={styles.mobileLink} onClick={() => navigate('/create')}>
                  + Write a poem
                </button>
                <button className={`${styles.mobileLink} ${styles.mobileLinkDanger}`} onClick={logout}>
                  Sign out
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" className={mobileNavCls}>Sign in</NavLink>
                <NavLink to="/register" className={`${styles.mobileLink} ${styles.mobileLinkBlue}`}>
                  Join Tearinks
                </NavLink>
              </>
            )}
          </div>
        </div>
      </div>

      <main className={styles.main}>
        <Outlet />
      </main>

      <footer className={styles.footer}>
        <p className={styles.footerText}>
          <span className="display">Tearinks</span> — where poetry breathes
        </p>
      </footer>

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
