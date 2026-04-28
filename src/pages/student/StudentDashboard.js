// src/pages/student/StudentDashboard.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/common/Sidebar';
import Modal from '../../components/common/Modal';
import { getMyEnrollments, getMySubmissions, getCourseAssignments, submitAssignment } from '../../services/api';
import { RadialBarChart, RadialBar, ResponsiveContainer, Tooltip } from 'recharts';

const LINKS = [
  { id:'home',        icon:'🏠', label:'My Learning'  },
  { id:'assignments', icon:'📝', label:'Assignments'  },
  { id:'grades',      icon:'📊', label:'My Grades'    },
];

/* ── Home: enrolled courses ──────────────────────────────── */
function LearningPanel() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading]         = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getMyEnrollments().then(r => setEnrollments(r.data.data || [])).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="spinner" />;

  return (
    <div>
      <div className="page-header">
        <h1>My Learning</h1>
        <p>Continue where you left off</p>
      </div>

      {enrollments.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📚</div>
          <p>You haven't enrolled in any courses yet.</p>
          <button className="btn btn-primary" style={{ marginTop:16 }} onClick={() => navigate('/courses')}>
            Browse Courses
          </button>
        </div>
      ) : (
        <div className="courses-grid">
          {enrollments.map(e => (
            <div key={e.id} className="course-card" style={{ cursor:'pointer' }}
              onClick={() => navigate(`/courses/${e.courseId}`)}>
              <div className="course-thumb">📚</div>
              <div className="course-body">
                <div className="course-title">{e.courseTitle}</div>
                <div style={{ marginTop:8 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4, fontSize:12, color:'var(--muted)' }}>
                    <span>Progress</span>
                    <span>{e.progressPercent ? Math.round(e.progressPercent) : 0}%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width:`${e.progressPercent || 0}%` }} />
                  </div>
                </div>
                <div style={{ marginTop:10, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <span style={{ fontSize:13, color:'var(--muted)' }}>
                    Enrolled {e.enrolledAt ? new Date(e.enrolledAt).toLocaleDateString() : ''}
                  </span>
                  <span className={`badge ${e.completed ? 'badge-success' : 'badge-warning'}`}>
                    {e.completed ? '✓ Done' : 'In Progress'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Assignments Panel ───────────────────────────────────── */
function AssignmentsPanel() {
  const [enrollments,  setEnrollments]  = useState([]);
  const [selCourse,    setSelCourse]    = useState('');
  const [assignments,  setAssignments]  = useState([]);
  const [mySubmissions,setMySubs]       = useState([]);
  const [submitModal,  setSubmitModal]  = useState(null);
  const [form, setForm]                 = useState({ submissionText:'' });
  const [msg, setMsg]                   = useState('');

  useEffect(() => {
    getMyEnrollments().then(r => setEnrollments(r.data.data || []));
    getMySubmissions().then(r => setMySubs(r.data.data || []));
  }, []);

  const loadAssignments = async cid => {
    setSelCourse(cid);
    if (!cid) { setAssignments([]); return; }
    getCourseAssignments(cid).then(r => setAssignments(r.data.data || []));
  };

  const isSubmitted = aId => mySubmissions.some(s => s.assignmentId === aId);

  const handleSubmit = async () => {
    try {
      await submitAssignment(submitModal.id, form);
      getMySubmissions().then(r => setMySubs(r.data.data || []));
      setSubmitModal(null);
      setMsg('Assignment submitted!');
    } catch (e) { setMsg(e.response?.data?.message || 'Error submitting'); }
  };

  const getDue = dueDate => {
    if (!dueDate) return 'No deadline';
    const d = new Date(dueDate);
    const now = new Date();
    const diff = Math.ceil((d - now) / (1000 * 60 * 60 * 24));
    if (diff < 0) return `Overdue by ${-diff} days`;
    if (diff === 0) return 'Due today!';
    return `Due in ${diff} days`;
  };

  const getDueColor = dueDate => {
    if (!dueDate) return 'var(--muted)';
    const diff = Math.ceil((new Date(dueDate) - new Date()) / (1000 * 60 * 60 * 24));
    if (diff < 0) return 'var(--danger)';
    if (diff <= 2) return 'var(--warning)';
    return 'var(--success)';
  };

  return (
    <div>
      <div className="page-header"><h1>Assignments</h1><p>Submit your work and track deadlines</p></div>
      {msg && <div className="alert alert-success">{msg}</div>}

      <div className="form-group" style={{ marginBottom:20 }}>
        <label>Select Course</label>
        <select className="form-control" style={{ maxWidth:320 }} value={selCourse} onChange={e => loadAssignments(e.target.value)}>
          <option value="">— Choose a course —</option>
          {enrollments.map(e => <option key={e.courseId} value={e.courseId}>{e.courseTitle}</option>)}
        </select>
      </div>

      {assignments.length > 0 ? (
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {assignments.map(a => {
            const submitted = isSubmitted(a.id);
            return (
              <div key={a.id} className="card" style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'16px 20px' }}>
                <div style={{ flex:1 }}>
                  <div style={{ fontFamily:'var(--font-head)', fontSize:16, fontWeight:600, marginBottom:4 }}>{a.title}</div>
                  <div style={{ fontSize:13, color:'var(--muted)', marginBottom:4 }}>{a.description}</div>
                  <div style={{ fontSize:13, color: getDueColor(a.dueDate), fontWeight:500 }}>⏰ {getDue(a.dueDate)}</div>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                  <span style={{ fontSize:13, color:'var(--muted)' }}>Max: {a.maxScore} pts</span>
                  {submitted ? (
                    <span className="badge badge-success">✓ Submitted</span>
                  ) : (
                    <button className="btn btn-primary btn-sm" onClick={() => { setSubmitModal(a); setForm({ submissionText:'' }); }}>Submit</button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : selCourse ? (
        <div className="empty-state"><div className="empty-icon">📝</div><p>No assignments for this course yet.</p></div>
      ) : null}

      {submitModal && (
        <Modal title={`Submit: ${submitModal.title}`} onClose={() => setSubmitModal(null)}
          footer={<><button className="btn btn-secondary" onClick={() => setSubmitModal(null)}>Cancel</button><button className="btn btn-primary" onClick={handleSubmit}>Submit Assignment</button></>}>
          <div style={{ marginBottom:12, padding:12, background:'var(--bg3)', borderRadius:8, fontSize:13, color:'var(--muted)' }}>
            {submitModal.description}
          </div>
          <div className="form-group">
            <label>Your Answer / Notes</label>
            <textarea className="form-control" style={{ minHeight:140 }}
              placeholder="Write your submission here…"
              value={form.submissionText}
              onChange={e => setForm(f => ({ ...f, submissionText: e.target.value }))} />
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ── Grades Panel ────────────────────────────────────────── */
function GradesPanel() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading]         = useState(true);

  useEffect(() => { getMySubmissions().then(r => setSubmissions(r.data.data || [])).finally(() => setLoading(false)); }, []);

  const graded   = submissions.filter(s => s.score != null);
  const avgScore = graded.length ? Math.round(graded.reduce((sum, s) => sum + s.score, 0) / graded.length) : 0;

  const chartData = [{ name:'Score', value: avgScore, fill:'#6ee7b7' }];

  if (loading) return <div className="spinner" />;

  return (
    <div>
      <div className="page-header"><h1>My Grades</h1><p>Track your academic performance</p></div>

      <div style={{ display:'grid', gridTemplateColumns:'200px 1fr', gap:24, marginBottom:28 }}>
        <div className="card" style={{ textAlign:'center' }}>
          <div style={{ fontSize:13, color:'var(--muted)', marginBottom:8, textTransform:'uppercase', letterSpacing:'.5px' }}>Avg. Score</div>
          <ResponsiveContainer width="100%" height={130}>
            <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="100%" data={chartData} startAngle={90} endAngle={-270}>
              <RadialBar minAngle={15} dataKey="value" cornerRadius={10} />
              <Tooltip formatter={v => `${v}%`} contentStyle={{ background:'#1a1e29', border:'1px solid #262b38' }} />
            </RadialBarChart>
          </ResponsiveContainer>
          <div style={{ fontFamily:'var(--font-head)', fontSize:28, color:'var(--accent)', fontWeight:700 }}>{avgScore}%</div>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <div className="stat-card"><div className="stat-icon">📝</div><div className="stat-value">{submissions.length}</div><div className="stat-label">Submissions</div></div>
          <div className="stat-card"><div className="stat-icon">✅</div><div className="stat-value">{graded.length}</div><div className="stat-label">Graded</div></div>
        </div>
      </div>

      {submissions.length === 0 ? (
        <div className="empty-state"><div className="empty-icon">📊</div><p>No submissions yet.</p></div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Assignment</th><th>Submitted</th><th>Score</th><th>Feedback</th><th>Status</th></tr></thead>
            <tbody>
              {submissions.map(s => (
                <tr key={s.id}>
                  <td style={{ fontWeight:500 }}>{s.assignmentTitle}</td>
                  <td style={{ color:'var(--muted)', fontSize:13 }}>{s.submittedAt ? new Date(s.submittedAt).toLocaleDateString() : '—'}</td>
                  <td>{s.score != null ? <span style={{ fontFamily:'var(--font-head)', fontSize:18, color:'var(--accent)' }}>{s.score}</span> : <span className="badge badge-warning">Pending</span>}</td>
                  <td style={{ fontSize:13, color:'var(--muted)', maxWidth:200 }}>{s.feedback || '—'}</td>
                  <td><span className={`badge ${s.score != null ? 'badge-success' : 'badge-warning'}`}>{s.score != null ? 'Graded' : 'Awaiting'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ── Dashboard shell ─────────────────────────────────────── */
export default function StudentDashboard() {
  const [active, setActive] = useState('home');
  return (
    <div className="dashboard-layout">
      <Sidebar links={LINKS} active={active} onSelect={setActive} />
      <main className="dashboard-main fade-in">
        {active === 'home'        && <LearningPanel />}
        {active === 'assignments' && <AssignmentsPanel />}
        {active === 'grades'      && <GradesPanel />}
      </main>
    </div>
  );
}
