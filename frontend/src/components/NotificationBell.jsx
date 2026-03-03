import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const s = {
  container: { position: 'relative', display: 'flex', alignItems: 'center' },
  bell: {
    background: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: '8px',
    padding: '0.5rem 0.75rem',
    cursor: 'pointer',
    color: 'var(--color-text)',
    fontSize: '1.2rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '40px',
    height: '40px',
    transition: 'all 0.2s',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: '-4px',
    right: '-4px',
    background: 'var(--color-danger)',
    color: 'white',
    borderRadius: '50%',
    width: '20px',
    height: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.75rem',
    fontWeight: 600,
  },
  dropdown: {
    position: 'absolute',
    top: '50px',
    right: 0,
    background: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: '12px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
    minWidth: '320px',
    maxWidth: '400px',
    zIndex: 1000,
    overflow: 'hidden',
  },
  dropdownHeader: {
    padding: '1rem',
    borderBottom: '1px solid var(--color-border)',
    fontWeight: 600,
    fontSize: '0.95rem',
  },
  dropdownList: {
    maxHeight: '400px',
    overflowY: 'auto',
  },
  item: {
    padding: '1rem',
    borderBottom: '1px solid var(--color-border)',
    cursor: 'pointer',
    transition: 'background 0.2s',
    ':hover': { background: 'var(--color-surface-hover)' },
  },
  itemTitle: {
    fontWeight: 500,
    color: 'var(--color-text)',
    marginBottom: '0.25rem',
  },
  itemText: {
    fontSize: '0.85rem',
    color: 'var(--color-text-muted)',
    marginBottom: '0.5rem',
  },
  itemTime: {
    fontSize: '0.75rem',
    color: 'var(--color-text-muted)',
  },
  priority: (level) => ({
    display: 'inline-block',
    padding: '0.15rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.7rem',
    fontWeight: 600,
    background:
      level === 'urgent' ? 'rgba(239,68,68,0.2)' :
      level === 'high' ? 'rgba(245,158,11,0.2)' :
      'rgba(59,130,246,0.2)',
    color:
      level === 'urgent' ? 'var(--color-danger)' :
      level === 'high' ? 'var(--color-warning)' :
      'var(--color-accent)',
  }),
  empty: {
    padding: '2rem 1rem',
    textAlign: 'center',
    color: 'var(--color-text-muted)',
    fontSize: '0.9rem',
  },
};

export default function NotificationBell() {
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await api.get('/announcements?limit=5');
      const data = Array.isArray(res.data) ? res.data : res.data?.announcements || [];
      
      // Filter for announcements from last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const recent = data.filter(a => new Date(a.created_at) > sevenDaysAgo);
      setAnnouncements(recent);
    } catch (err) {
      console.error('Failed to load announcements:', err);
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (date) => {
    const now = new Date();
    const created = new Date(date);
    const diff = Math.floor((now - created) / 1000);
    
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const handleClick = (announce) => {
    navigate('/announcements');
    setShowDropdown(false);
  };

  const unreadCount = announcements.length;

  return (
    <div style={s.container}>
      <button
        style={s.bell}
        onClick={() => setShowDropdown(!showDropdown)}
        title="Notifications"
      >
        🔔
        {unreadCount > 0 && <div style={s.badge}>{unreadCount > 9 ? '9+' : unreadCount}</div>}
      </button>

      {showDropdown && (
        <div style={s.dropdown}>
          <div style={s.dropdownHeader}>
            Recent Announcements ({unreadCount})
          </div>
          <div style={s.dropdownList}>
            {announcements.length === 0 ? (
              <div style={s.empty}>No recent announcements</div>
            ) : (
              announcements.map(announce => (
                <div
                  key={announce.id}
                  style={s.item}
                  onClick={() => handleClick(announce)}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-surface-hover)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={s.itemTitle}>{announce.title}</div>
                  <div style={s.itemText}>
                    {announce.content.substring(0, 80)}...
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'space-between' }}>
                    <span style={s.priority(announce.priority)}>
                      {announce.priority?.toUpperCase() || 'NORMAL'}
                    </span>
                    <span style={s.itemTime}>{formatTime(announce.created_at)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
