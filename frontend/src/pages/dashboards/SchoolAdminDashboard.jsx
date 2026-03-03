import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import { useToast } from '../../components/Toast';

export default function SchoolAdminDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [stats, setStats] = useState(null);
  const [students, setStudents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [discipline, setDiscipline] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const [statsRes, studentsRes, announcementsRes, disciplineRes] = await Promise.all([
        api.get('/dashboard/school-admin'),
        api.get('/students?limit=5'),
        api.get('/announcements?limit=5'),
        api.get('/discipline?status=open'),
      ]);
      
      setStats(statsRes.data);
      setStudents(Array.isArray(studentsRes.data) ? studentsRes.data : studentsRes.data?.students || []);
      setAnnouncements(Array.isArray(announcementsRes.data) ? announcementsRes.data : announcementsRes.data?.announcements || []);
      setDiscipline(Array.isArray(disciplineRes.data) ? disciplineRes.data : disciplineRes.data?.records || []);
    } catch (err) {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) return <div style={s.page}>Loading...</div>;

  const statCards = [
    { label: 'Total Students', value: stats.totalStudents, color: 'var(--color-accent)', icon: '👥' },
    { label: 'Total Teachers', value: stats.totalTeachers, color: 'var(--color-success)', icon: '👨‍🏫' },
    { label: 'Announcements (Month)', value: stats.announcements || 0, color: 'var(--color-warning)', icon: '📢' },
    { label: 'Pending Discipline', value: stats.openDisciplines, color: 'var(--color-danger)', icon: '⚠️' },
  ];

  const quickActions = [
    { label: '+ Register Student', icon: '👥', onClick: () => navigate('/students') },
    { label: '+ Register Teacher', icon: '👨‍🏫', onClick: () => navigate('/teachers') },
    { label: '📢 Post Announcement', icon: '📢', onClick: () => navigate('/announcements') },
    { label: '💰 Record Payment', icon: '💰', onClick: () => navigate('/fees') },
  ];

  const getInitials = (first, last) => {
    return ((first?.[0] || '') + (last?.[0] || '')).toUpperCase();
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div style={s.page}>
      <div style={s.header}>
        <h1 style={s.title}>School Admin Dashboard</h1>
        <p style={s.subtitle}>Overview of your school's activities</p>
      </div>

      {/* Stats Cards */}
      <div style={s.statsGrid}>
        {statCards.map((card) => (
          <div key={card.label} style={{ ...s.statCard, borderLeftColor: card.color }}>
            <div style={s.statIcon}>{card.icon}</div>
            <div style={s.statLabel}>{card.label}</div>
            <div style={{ ...s.statValue, color: card.color }}>{card.value}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div style={s.section}>
        <h2 style={s.sectionTitle}>Quick Actions</h2>
        <div style={s.actionsGrid}>
          {quickActions.map((action) => (
            <button
              key={action.label}
              style={s.actionBtn}
              onClick={action.onClick}
            >
              {action.icon} {action.label}
            </button>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div style={s.section}>
        <h2 style={s.sectionTitle}>Recently Registered Students</h2>
        {students.length === 0 ? (
          <div style={s.emptyState}>No recent registrations</div>
        ) : (
          <div style={s.activityList}>
            {students.slice(0, 5).map((student) => (
              <div key={student.id} style={s.activityItem}>
                <div style={s.avatar}>
                  {getInitials(student.first_name, student.last_name)}
                </div>
                <div style={s.activityInfo}>
                  <div style={s.activityName}>
                    {student.first_name} {student.last_name}
                  </div>
                  <div style={s.activityMeta}>
                    Class {student.class_level} {student.section} • {formatDate(student.created_at)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const s = {
  page: { padding: '2rem', maxWidth: '1200px', margin: '0 auto' },
  header: { marginBottom: '2.5rem' },
  title: { fontSize: '1.75rem', fontFamily: 'var(--font-serif)', margin: '0 0 0.5rem 0' },
  subtitle: { color: 'var(--color-text-muted)', margin: 0, fontSize: '0.9rem' },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '1.5rem',
    marginBottom: '2.5rem',
  },
  statCard: {
    background: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: '12px',
    padding: '1.5rem',
    borderLeft: '4px solid',
    display: 'flex',
    flexDirection: 'column',
  },
  statIcon: { fontSize: '2rem', marginBottom: '0.75rem' },
  statLabel: { fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: 500 },
  statValue: { fontSize: '2.25rem', fontWeight: 700, marginTop: '0.5rem' },
  section: { marginBottom: '2.5rem' },
  sectionTitle: { fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.25rem', color: 'var(--color-text)' },
  actionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
  },
  actionBtn: {
    padding: '1.25rem',
    background: 'var(--color-surface)',
    border: '2px solid var(--color-border)',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: 500,
    color: 'var(--color-text)',
    transition: 'all 0.2s',
    ':hover': { borderColor: 'var(--color-accent)', background: 'var(--color-accent)' },
  },
  activityList: {
    background: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: '10px',
    overflow: 'hidden',
  },
  activityItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1rem',
    borderBottom: '1px solid var(--color-border)',
    ':last-child': { borderBottom: 'none' },
  },
  avatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: 'var(--color-accent)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 600,
    fontSize: '0.85rem',
    flexShrink: 0,
  },
  activityInfo: { flex: 1 },
  activityName: { fontWeight: 500, color: 'var(--color-text)' },
  activityMeta: { fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' },
  emptyState: {
    padding: '2rem',
    textAlign: 'center',
    color: 'var(--color-text-muted)',
    background: 'var(--color-surface)',
    borderRadius: '10px',
  },
};
