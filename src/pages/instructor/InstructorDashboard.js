// src/pages/instructor/InstructorDashboard.js
import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/common/Sidebar';
import Modal from '../../components/common/Modal';
import {
  getMyCourses, createCourse, updateCourse, deleteCourse, addCourseContent,
  createAssignment, getAssignmentSubs, gradeSubmission, getEnrollmentsByCourse,
  getCourseAssignments
} from '../../services/api';

const LINKS = [
  { id:'courses',     icon:'📚', label:'My Courses'  },
  { id:'assignments', icon:'📝', label:'Assignments' },
  { id:'students',    icon:'🎓', label:'Students'    },
];

/* ── Courses Panel ───────────────────────────────────────── */
function CoursesPanel() {
  const [courses,     setCourses]   = useState([]);
  const [loading,     setLoading]   = useState(true);
  const [showModal,   setModal]     = useState(false);
  const [editCourse,  setEdit]      = useState(null);   // null = create
  const [contentModal, setContent]  = useState(null);   // courseId
  const [form, setForm]             = useState({ title:'', description:'', level:'BEGINNER', status:'DRAFT', price:0 });
  const [contentForm, setContentForm] = useState({ title:'', contentType:'TEXT', contentText:'', contentUrl:'', orderIndex:0, durationMin:0 });
  const [msg, setMsg] = useState('');

  const load = () => getMyCourses().then(r => setCourses(r.data.data || [])).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const set = (s, fn) => k => e => fn(f => ({ ...f, [k]: e.target.value }));
  const setF = set(form, setForm);
  const setCF = set(contentForm, setContentForm);

  const openCreate = () => { setEdit(null); setForm({ title:'', description:'', level:'BEGINNER', status:'DRAFT', price:0 }); setModal(true); };
  const openEdit   = c  => { setEdit(c); setForm({ title:c.title, description:c.description, level:c.level, status:c.status, price:c.price }); setModal(true); };

  const handleSave = async () => {
    try {
      if (editCourse) await updateCourse(editCourse.id, form);
      else            await createCourse(form);
      setModal(false); load(); setMsg(editCourse ? 'Course updated!' : 'Course created!');
    } catch (e) { setMsg(e.response?.data?.message || 'Error'); }
  };

  const handleDelete = async id => {
    if (!window.confirm('Delete this course?')) return;
    await deleteCourse(id); load();
  };

  const handleAddContent = async () => {
    try {
      await addCourseContent(contentModal, contentForm);
      setContent(null); setMsg('Content added!');
    } catch (e) { setMsg(e.response?.data?.message || 'Error'); }
  };

  const STATUS_COLOR = { PUBLISHED:'var(--success)', DRAFT:'var(--warning)', ARCHIVED:'var(--muted)' };

  return (
    <div>
      <div className="page-header" style={{ display:'flex', justifyContent:'space-between' }}>
        <div><h1>My Courses</h1><p>Create and manage your course catalogue</p></div>
        <button className="btn btn-primary" onClick={openCreate}>+ New Course</button>
      </div>
      {msg && <div className="alert alert-success">{msg}</div>}

      {loading ? <div className="spinner" /> :
        courses.length === 0 ? (
          <div className="empty-state"><div className="empty-icon">📚</div><p>No courses yet. Create your first one!</p></div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {courses.map(c => (
              <div key={c.id} className="card" style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'16px 20px' }}>
                <div style={{ flex:1 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:4 }}>
                    <span style={{ fontFamily:'var(--font-head)', fontSize:16, fontWeight:600 }}>{c.title}</span>
                    <span style={{ fontSize:12, color: STATUS_COLOR[c.status], fontWeight:500 }}>● {c.status}</span>
                  </div>
                  <div style={{ fontSize:13, color:'var(--muted)' }}>{c.level} · 🎓 {c.enrollmentCount || 0} enrolled</div>
                </div>
                <div style={{ display:'flex', gap:8 }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => { setContent(c.id); setContentForm({ title:'', contentType:'TEXT', contentText:'', contentUrl:'', orderIndex:0, durationMin:0 }); }}>+ Content</button>
                  <button className="btn btn-secondary btn-sm" onClick={() => openEdit(c)}>Edit</button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c.id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )
      }

      {/* Create / Edit Course Modal */}
      {showModal && (
        <Modal title={editCourse ? 'Edit Course' : 'Create New Course'} onClose={() => setModal(false)}
          footer={<><button className="btn btn-secondary" onClick={() => setModal(false)}>Cancel</button><button className="btn btn-primary" onClick={handleSave}>{editCourse ? 'Save' : 'Create'}</button></>}>
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <div className="form-group"><label>Title</label><input className="form-control" value={form.title} onChange={setF('title')} /></div>
            <div className="form-group"><label>Description</label><textarea className="form-control" value={form.description} onChange={setF('description')} /></div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              <div className="form-group"><label>Level</label>
                <select className="form-control" value={form.level} onChange={setF('level')}>
                  <option>BEGINNER</option><option>INTERMEDIATE</option><option>ADVANCED</option>
                </select>
              </div>
              <div className="form-group"><label>Status</label>
                <select className="form-control" value={form.status} onChange={setF('status')}>
                  <option>DRAFT</option><option>PUBLISHED</option><option>ARCHIVED</option>
                </select>
              </div>
            </div>
            <div className="form-group"><label>Price ($)</label><input className="form-control" type="number" value={form.price} onChange={setF('price')} /></div>
          </div>
        </Modal>
      )}

      {/* Add Content Modal */}
      {contentModal && (
        <Modal title="Add Course Content" onClose={() => setContent(null)}
          footer={<><button className="btn btn-secondary" onClick={() => setContent(null)}>Cancel</button><button className="btn btn-primary" onClick={handleAddContent}>Add</button></>}>
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <div className="form-group"><label>Title</label><input className="form-control" value={contentForm.title} onChange={setCF('title')} /></div>
            <div className="form-group"><label>Type</label>
              <select className="form-control" value={contentForm.contentType} onChange={setCF('contentType')}>
                <option>TEXT</option><option>VIDEO</option><option>PDF</option><option>LINK</option>
              </select>
            </div>
            {contentForm.contentType === 'TEXT' && (
              <div className="form-group"><label>Content</label><textarea className="form-control" style={{ minHeight:120 }} value={contentForm.contentText} onChange={setCF('contentText')} /></div>
            )}
            {(contentForm.contentType === 'VIDEO' || contentForm.contentType === 'PDF' || contentForm.contentType === 'LINK') && (
              <div className="form-group"><label>URL</label><input className="form-control" placeholder="https://…" value={contentForm.contentUrl} onChange={setCF('contentUrl')} /></div>
            )}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              <div className="form-group"><label>Order</label><input className="form-control" type="number" value={contentForm.orderIndex} onChange={setCF('orderIndex')} /></div>
              <div className="form-group"><label>Duration (min)</label><input className="form-control" type="number" value={contentForm.durationMin} onChange={setCF('durationMin')} /></div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ── Assignments Panel ───────────────────────────────────── */
function AssignmentsPanel() {
  const [courses,     setCourses]  = useState([]);
  const [selCourse,   setSelCourse] = useState('');
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [showModal,   setModal]    = useState(false);
  const [gradeModal,  setGradeModal] = useState(null);
  const [form, setForm]            = useState({ title:'', description:'', maxScore:100, dueDate:'' });
  const [gradeForm, setGradeForm]  = useState({ score:'', feedback:'' });
  const [msg, setMsg]              = useState('');

  useEffect(() => { getMyCourses().then(r => setCourses(r.data.data || [])); }, []);

  const loadAssignments = async cid => {
    setSelCourse(cid);
    if (!cid) { setAssignments([]); return; }
    getCourseAssignments(cid).then(r => setAssignments(r.data.data || []));
  };

  const loadSubs = async aId => {
    getAssignmentSubs(aId).then(r => setSubmissions(r.data.data || []));
  };

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleCreate = async () => {
    try {
      await createAssignment({ ...form, courseId: parseInt(selCourse) });
      setModal(false); loadAssignments(selCourse); setMsg('Assignment created!');
    } catch (e) { setMsg(e.response?.data?.message || 'Error'); }
  };

  const handleGrade = async () => {
    try {
      await gradeSubmission(gradeModal.id, { score: parseInt(gradeForm.score), feedback: gradeForm.feedback });
      setGradeModal(null); loadSubs(gradeModal.assignmentId); setMsg('Graded!');
    } catch (e) { setMsg('Error grading'); }
  };

  return (
    <div>
      <div className="page-header" style={{ display:'flex', justifyContent:'space-between' }}>
        <div><h1>Assignments</h1><p>Manage and grade student submissions</p></div>
        {selCourse && <button className="btn btn-primary" onClick={() => setModal(true)}>+ New Assignment</button>}
      </div>
      {msg && <div className="alert alert-success">{msg}</div>}

      <div className="form-group" style={{ marginBottom:20 }}>
        <label>Select Course</label>
        <select className="form-control" style={{ maxWidth:320 }} value={selCourse} onChange={e => loadAssignments(e.target.value)}>
          <option value="">— Choose a course —</option>
          {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
        </select>
      </div>

      {assignments.map(a => (
        <div key={a.id} className="card" style={{ marginBottom:16 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
            <div>
              <div style={{ fontFamily:'var(--font-head)', fontSize:17, fontWeight:600 }}>{a.title}</div>
              <div style={{ fontSize:13, color:'var(--muted)', marginTop:2 }}>Max score: {a.maxScore} · Due: {a.dueDate ? new Date(a.dueDate).toLocaleDateString() : 'No deadline'}</div>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => loadSubs(a.id)}>View Submissions</button>
          </div>
          {submissions.filter(s => s.assignmentId === a.id).length > 0 && (
            <div className="table-wrap">
              <table>
                <thead><tr><th>Student</th><th>Submitted</th><th>Score</th><th>Feedback</th><th>Action</th></tr></thead>
                <tbody>
                  {submissions.filter(s => s.assignmentId === a.id).map(s => (
                    <tr key={s.id}>
                      <td>{s.studentName}</td>
                      <td style={{ fontSize:13, color:'var(--muted)' }}>{s.submittedAt ? new Date(s.submittedAt).toLocaleDateString() : '—'}</td>
                      <td>{s.score != null ? <span className="badge badge-success">{s.score}/{a.maxScore}</span> : <span className="badge badge-warning">Ungraded</span>}</td>
                      <td style={{ fontSize:13, color:'var(--muted)' }}>{s.feedback || '—'}</td>
                      <td><button className="btn btn-secondary btn-sm" onClick={() => { setGradeModal(s); setGradeForm({ score: s.score || '', feedback: s.feedback || '' }); }}>Grade</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ))}

      {showModal && (
        <Modal title="Create Assignment" onClose={() => setModal(false)}
          footer={<><button className="btn btn-secondary" onClick={() => setModal(false)}>Cancel</button><button className="btn btn-primary" onClick={handleCreate}>Create</button></>}>
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <div className="form-group"><label>Title</label><input className="form-control" value={form.title} onChange={set('title')} /></div>
            <div className="form-group"><label>Description</label><textarea className="form-control" value={form.description} onChange={set('description')} /></div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              <div className="form-group"><label>Max Score</label><input className="form-control" type="number" value={form.maxScore} onChange={set('maxScore')} /></div>
              <div className="form-group"><label>Due Date</label><input className="form-control" type="datetime-local" value={form.dueDate} onChange={set('dueDate')} /></div>
            </div>
          </div>
        </Modal>
      )}

      {gradeModal && (
        <Modal title={`Grade: ${gradeModal.studentName}`} onClose={() => setGradeModal(null)}
          footer={<><button className="btn btn-secondary" onClick={() => setGradeModal(null)}>Cancel</button><button className="btn btn-primary" onClick={handleGrade}>Submit Grade</button></>}>
          <div style={{ marginBottom:12, padding:12, background:'var(--bg3)', borderRadius:8, fontSize:14, color:'var(--muted)' }}>
            <strong style={{ color:'var(--text)' }}>Submission:</strong><br />
            {gradeModal.submissionText || <em>No text submitted</em>}
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <div className="form-group"><label>Score</label><input className="form-control" type="number" value={gradeForm.score} onChange={e => setGradeForm(f => ({ ...f, score: e.target.value }))} /></div>
            <div className="form-group"><label>Feedback</label><textarea className="form-control" value={gradeForm.feedback} onChange={e => setGradeForm(f => ({ ...f, feedback: e.target.value }))} /></div>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ── Students Panel ──────────────────────────────────────── */
function StudentsPanel() {
  const [courses,   setCourses]   = useState([]);
  const [selCourse, setSelCourse] = useState('');
  const [students,  setStudents]  = useState([]);

  useEffect(() => { getMyCourses().then(r => setCourses(r.data.data || [])); }, []);

  const load = async cid => {
    setSelCourse(cid);
    if (!cid) { setStudents([]); return; }
    getEnrollmentsByCourse(cid).then(r => setStudents(r.data.data || []));
  };

  return (
    <div>
      <div className="page-header"><h1>Students</h1><p>View students enrolled in your courses</p></div>
      <div className="form-group" style={{ marginBottom:20 }}>
        <label>Select Course</label>
        <select className="form-control" style={{ maxWidth:320 }} value={selCourse} onChange={e => load(e.target.value)}>
          <option value="">— Choose a course —</option>
          {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
        </select>
      </div>
      {students.length > 0 ? (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Student Name</th><th>Enrolled On</th><th>Completed</th></tr></thead>
            <tbody>
              {students.map(e => (
                <tr key={e.id}>
                  <td style={{ fontWeight:500 }}>{e.studentName}</td>
                  <td style={{ color:'var(--muted)', fontSize:13 }}>{e.enrolledAt ? new Date(e.enrolledAt).toLocaleDateString() : '—'}</td>
                  <td><span className={`badge ${e.completed ? 'badge-success' : 'badge-warning'}`}>{e.completed ? 'Completed' : 'In Progress'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : selCourse ? (
        <div className="empty-state"><div className="empty-icon">🎓</div><p>No students enrolled yet.</p></div>
      ) : null}
    </div>
  );
}

/* ── Dashboard shell ─────────────────────────────────────── */
export default function InstructorDashboard() {
  const [active, setActive] = useState('courses');
  return (
    <div className="dashboard-layout">
      <Sidebar links={LINKS} active={active} onSelect={setActive} />
      <main className="dashboard-main fade-in">
        {active === 'courses'     && <CoursesPanel />}
        {active === 'assignments' && <AssignmentsPanel />}
        {active === 'students'    && <StudentsPanel />}
      </main>
    </div>
  );
}
