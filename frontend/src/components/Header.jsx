import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/authSlice';
import NotificationBell from './NotificationBell';
import ThemeToggle from './ThemeToggle';

export default function Header() {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);

  return (
    <header style={styles.header}>
      <div style={styles.user}>
        <span style={styles.name}>{user?.first_name ?? ''} {user?.last_name ?? ''}</span>
        <span style={styles.role}>{user?.role ? String(user.role).replace(/_/g, ' ') : ''}</span>
      </div>
      <div style={styles.actions}>
        <NotificationBell />
        <ThemeToggle />
        <button style={styles.logoutBtn} onClick={() => dispatch(logout())}>
          Logout
        </button>
      </div>
    </header>
  );
}

const styles = {
  header: {
    padding: '1rem 2rem',
    background: 'var(--color-surface)',
    borderBottom: '1px solid var(--color-border)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  user: {
    display: 'flex',
    flexDirection: 'column',
  },
  name: {
    fontWeight: 600,
  },
  role: {
    fontSize: '0.8rem',
    color: 'var(--color-text-muted)',
    textTransform: 'capitalize',
  },
  actions: {
    display: 'flex',
    gap: '0.75rem',
    alignItems: 'center',
  },
  logoutBtn: {
    padding: '0.5rem 1rem',
    background: 'transparent',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text-muted)',
    borderRadius: '6px',
    cursor: 'pointer',
  },
};
