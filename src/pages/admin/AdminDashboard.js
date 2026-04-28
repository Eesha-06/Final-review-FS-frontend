// src/pages/admin/AdminDashboard.js
import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/common/Sidebar';
import Modal from '../../components/common/Modal';
import { getAdminAnalytics, getAllUsers, createUser, deleteUser, toggleUserStatus, getAllCourses } from '../../services/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const LINKS = [
  { id:'overview',  icon:'📊', label:'Overview'  },
  { id:'users',     icon:'👥', label:'Users'     },
  { id:'courses',   icon:'📚', label:'Courses'   },
];

/* ── Analytics Panel ─────────────────────────────────────── */
function OverviewPanel() {
  const [stats, setStats] = useState(null);
  useEffect(() => { getAdminAnalytics().then(r => setStats(r.data.data)); }, []);
  if (!stats) return <div className="spinner" />;

  const barData = [
    { name:'Users',       value: stats.totalUsers },
    { name:'Courses',     value: stats.totalCourses },
    { name:'Enrollments', value: stats.totalEnrollments },
    { name:'Submissions', value: stats.totalSubmissions },
  ];
  const pieData = [
    { name:'Active Students', value: stats.activeStudents },
    { name:'Published Courses', value: stats.publishedCourses },
  ];
  const COLORS = ['#6ee7b7','#818cf8','#fbbf24','#f87171'];

  return (
    <div>
      <div className="page-header">
        <h1>Platform Overview</h1>
        <p>Real-time metrics across your LMS</p>
      </div>

      <div className="stats-grid">
        {[
          { icon:'👥', value:stats.totalUsers,       label:'Total Users'      },
          { icon:'📚', value:stats.totalCourses,     label:'Total Courses'    },
          { icon:'🎓', value:stats.totalEnrollments, label:'Enrollments'      },
          { icon:'📝', value:stats.totalSubmissions,  label:'Submissions'     },
          { icon:'✅', value:stats.publishedCourses,  label:'Published Courses'},
          { icon:'🟢', value:stats.activeStudents,    label:'Active Students' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:20, marginTop:8 }}>
        <div className="card">
          <h3 style={{ fontFamily:'var(--font-head)', marginBottom:20 }}>Platform Metrics</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barData}>
              <XAxis dataKey="name" tick={{ fill:'#6b7280', fontSize:12 }} />
              <YAxis tick={{ fill:'#6b7280', fontSize:12 }} />
              <Tooltip contentStyle={{ background:'#1a1e29', border:'1px solid #262b38', borderRadius:8 }} />
              <Bar dataKey="value" fill="#6ee7b7" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <h3 style={{ fontFamily:'var(--font-head)', marginBottom:20 }}>Distribution</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={e => e.name}>
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip contentStyle={{ background:'#1a1e29', border:'1px solid #262b38' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

/* ── Users Panel ─────────────────────────────────────────── */
function UsersPanel() {
  const [users,    setUsers]   = useState([]);
  const [showModal, setModal]  = useState(false);
  const [form, setForm]        = useState({ name:'', email:'', password:'', role:'STUDENT' });
  const [msg, setMsg]          = useState('');

  const load = () => getAllUsers().then(r => setUsers(r.data.data || []));
  useEffect(() => { load(); }, []);

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleCreate = async () => {
    try { await createUser(form); setModal(false); setForm({ name:'', email:'', password:'', role:'STUDENT' }); load(); setMsg('User created!'); }
    catch (e) { setMsg(e.response?.data?.message || 'Error'); }
  };
  const handleDelete = async id => {
    if (!window.confirm('Delete this user?')) return;
    await deleteUser(id); load();
  };
  const handleToggle = async id => { await toggleUserStatus(id); load(); };

  const ROLE_BADGE = { ADMIN:'badge-danger', INSTRUCTOR:'badge-info', STUDENT:'badge-success', CONTENT_CREATOR:'badge-warning' };

  return (
    <div>
      <div className="page-header" style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
        <div><h1>User Management</h1><p>Create and manage platform users</p></div>
        <button className="btn btn-primary" onClick={() => setModal(true)}>+ Add User</button>
      </div>
      {msg && <div className="alert alert-success" style={{ marginBottom:16 }}>{msg}</div>}

      <div className="table-wrap">
        <table>
          <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Joined</th><th>Actions</th></tr></thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td style={{ fontWeight:500 }}>{u.name}</td>
                <td style={{ color:'var(--muted)' }}>{u.email}</td>
                <td><span className={`badge ${ROLE_BADGE[u.role] || 'badge-muted'}`}>{u.role}</span></td>
                <td><span className={`badge ${u.isActive ? 'badge-success' : 'badge-danger'}`}>{u.isActive ? 'Active' : 'Inactive'}</span></td>
                <td style={{ color:'var(--muted)', fontSize:13 }}>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}</td>
                <td>
                  <div style={{ display:'flex', gap:8 }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => handleToggle(u.id)}>
                      {u.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(u.id)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <Modal title="Create New User" onClose={() => setModal(false)}
          footer={<><button className="btn btn-secondary" onClick={() => setModal(false)}>Cancel</button><button className="btn btn-primary" onClick={handleCreate}>Create</button></>}>
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <div className="form-group"><label>Full Name</label><input className="form-control" value={form.name} onChange={set('name')} /></div>
            <div className="form-group"><label>Email</label><input className="form-control" type="email" value={form.email} onChange={set('email')} /></div>
            <div className="form-group"><label>Password</label><input className="form-control" type="password" value={form.password} onChange={set('password')} /></div>
            <div className="form-group"><label>Role</label>
              <select className="form-control" value={form.role} onChange={set('role')}>
                <option>STUDENT</option><option>INSTRUCTOR</option><option>CONTENT_CREATOR</option><option>ADMIN</option>
              </select>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ── Courses Panel ───────────────────────────────────────── */
function CoursesPanel() {
  const [courses, setCourses] = useState([]);
  useEffect(() => { getAllCourses().then(r => setCourses(r.data.data || [])); }, []);
  const STATUS_BADGE = { PUBLISHED:'badge-success', DRAFT:'badge-warning', ARCHIVED:'badge-muted' };
  return (
    <div>
      <div className="page-header"><h1>All Courses</h1><p>Platform-wide course management</p></div>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Title</th><th>Instructor</th><th>Level</th><th>Status</th><th>Enrollments</th><th>Created</th></tr></thead>
          <tbody>
            {courses.map(c => (
              <tr key={c.id}>
                <td style={{ fontWeight:500 }}>{c.title}</td>
                <td style={{ color:'var(--muted)' }}>{c.instructorName}</td>
                <td><span className="badge badge-info">{c.level}</span></td>
                <td><span className={`badge ${STATUS_BADGE[c.status] || 'badge-muted'}`}>{c.status}</span></td>
                <td>{c.enrollmentCount || 0}</td>
                <td style={{ color:'var(--muted)', fontSize:13 }}>{c.createdAt ? new Date(c.createdAt).toLocaleDateString() : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── Dashboard shell ─────────────────────────────────────── */
export default function AdminDashboard() {
  const [active, setActive] = useState('overview');
  return (
    <div className="dashboard-layout">
      <Sidebar links={LINKS} active={active} onSelect={setActive} />
      <main className="dashboard-main fade-in">
        {active === 'overview' && <OverviewPanel />}
        {active === 'users'    && <UsersPanel />}
        {active === 'courses'  && <CoursesPanel />}
      </main>
    </div>
  );
}
