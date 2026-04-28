// src/pages/CourseDetailPage.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCourseDetails, getCourseContent, getCourseAssignments, enroll } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function CourseDetailPage() {
  const { id }  = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [course,      setCourse]      = useState(null);
  const [contents,    setContents]    = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [activeContent, setActive]   = useState(null);
  const [enrolled, setEnrolled]       = useState(false);
  const [loading,  setLoading]        = useState(true);
  const [enrolling, setEnrolling]     = useState(false);
  const [msg, setMsg]                 = useState('');

  useEffect(() => {
    Promise.all([
      getCourseDetails(id),
      getCourseContent(id),
      getCourseAssignments(id)
    ]).then(([cr, cc, ca]) => {
      setCourse(cr.data.data);
      setContents(cc.data.data || []);
      setAssignments(ca.data.data || []);
      if (cc.data.data?.length) setActive(cc.data.data[0]);
    }).finally(() => setLoading(false));
  }, [id]);

  const handleEnroll = async () => {
    if (!user) { navigate('/login'); return; }
    setEnrolling(true);
    try {
      await enroll(id);
      setEnrolled(true);
      setMsg('✅ Enrolled successfully!');
    } catch (err) {
      setMsg(err.response?.data?.message || 'Enrollment failed');
    } finally { setEnrolling(false); }
  };

  if (loading) return <div className="spinner" style={{ marginTop:100 }} />;
  if (!course)  return <div style={{ textAlign:'center', marginTop:100, color:'var(--muted)' }}>Course not found.</div>;

  return (
    <>
      <nav className="navbar">
        <span className="navbar-brand" onClick={() => navigate('/courses')} style={{ cursor:'pointer' }}>🎓 LearnHub</span>
        <div className="navbar-nav">
          <button className="nav-link" onClick={() => navigate('/courses')}>← All Courses</button>
          {user && <button className="btn btn-secondary btn-sm" onClick={() =>
            navigate(user.role === 'ADMIN' ? '/admin' : user.role === 'INSTRUCTOR' ? '/instructor' : '/student')
          }>Dashboard</button>}
        </div>
      </nav>

      {/* Course hero */}
      <div style={{ background:'linear-gradient(180deg, var(--bg2), var(--bg))', padding:'40px 32px', borderBottom:'1px solid var(--border)' }}>
        <div className="container">
          <div style={{ display:'flex', gap:8, marginBottom:12 }}>
            <span className="badge badge-success">{course.status}</span>
            <span className="badge badge-info">{course.level}</span>
            {course.categoryName && <span className="badge badge-muted">{course.categoryName}</span>}
          </div>
          <h1 style={{ fontFamily:'var(--font-head)', fontSize:36, marginBottom:12 }}>{course.title}</h1>
          <p style={{ color:'var(--muted)', fontSize:16, maxWidth:700, marginBottom:20 }}>{course.description}</p>
          <div style={{ display:'flex', gap:24, alignItems:'center', flexWrap:'wrap' }}>
            <span style={{ color:'var(--muted)', fontSize:14 }}>👤 {course.instructorName}</span>
            <span style={{ color:'var(--muted)', fontSize:14 }}>🎓 {course.enrollmentCount} students</span>
            <span style={{ color:'var(--muted)', fontSize:14 }}>📄 {contents.length} lessons</span>
            <span style={{ fontFamily:'var(--font-head)', fontSize:22, color:'var(--accent)', fontWeight:700 }}>
              {course.price > 0 ? `$${course.price}` : 'Free'}
            </span>
            {msg && <span style={{ color: msg.startsWith('✅') ? 'var(--success)' : 'var(--danger)', fontSize:14 }}>{msg}</span>}
            {!enrolled && user?.role === 'STUDENT' && (
              <button className="btn btn-primary" onClick={handleEnroll} disabled={enrolling}>
                {enrolling ? 'Enrolling…' : '🚀 Enroll Now'}
              </button>
            )}
            {enrolled && <span className="badge badge-success">✓ Enrolled</span>}
          </div>
        </div>
      </div>

      {/* Content area */}
      <div className="container" style={{ padding:'32px 24px', display:'flex', gap:24, alignItems:'flex-start' }}>
        {/* Sidebar – lesson list */}
        <div style={{ width:280, flexShrink:0 }}>
          <h3 style={{ fontFamily:'var(--font-head)', fontSize:16, marginBottom:12 }}>Course Content</h3>
          <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
            {contents.map((c, i) => (
              <button key={c.id} onClick={() => setActive(c)}
                style={{
                  display:'flex', alignItems:'center', gap:10, padding:'10px 12px',
                  borderRadius:8, border:'none', cursor:'pointer', textAlign:'left', width:'100%',
                  background: activeContent?.id === c.id ? 'rgba(110,231,183,.12)' : 'var(--bg2)',
                  color: activeContent?.id === c.id ? 'var(--accent)' : 'var(--text)',
                  fontFamily:'var(--font-body)', fontSize:13,
                  borderLeft: activeContent?.id === c.id ? '2px solid var(--accent)' : '2px solid transparent'
                }}>
                <span style={{ color:'var(--muted)', minWidth:20 }}>{i+1}</span>
                <span style={{ flex:1 }}>{c.title}</span>
                <span style={{ fontSize:11, color:'var(--muted)' }}>
                  {c.contentType === 'VIDEO' ? '🎬' : c.contentType === 'PDF' ? '📄' : '📝'}
                </span>
              </button>
            ))}
          </div>

          {assignments.length > 0 && (
            <>
              <h3 style={{ fontFamily:'var(--font-head)', fontSize:16, margin:'20px 0 12px' }}>Assignments</h3>
              {assignments.map(a => (
                <div key={a.id} className="card" style={{ marginBottom:8, padding:12 }}>
                  <div style={{ fontWeight:600, fontSize:14 }}>{a.title}</div>
                  <div style={{ fontSize:12, color:'var(--muted)', marginTop:4 }}>
                    Due: {a.dueDate ? new Date(a.dueDate).toLocaleDateString() : 'No deadline'}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Main content viewer */}
        <div style={{ flex:1, minWidth:0 }}>
          {activeContent ? (
            <div className="card fade-in">
              <h2 style={{ fontFamily:'var(--font-head)', fontSize:22, marginBottom:16 }}>{activeContent.title}</h2>
              {activeContent.contentType === 'VIDEO' && activeContent.contentUrl && (
                <video controls style={{ width:'100%', borderRadius:8, marginBottom:16 }}>
                  <source src={activeContent.contentUrl} />
                </video>
              )}
              {activeContent.contentType === 'LINK' && activeContent.contentUrl && (
                <a href={activeContent.contentUrl} target="_blank" rel="noreferrer"
                  className="btn btn-ghost" style={{ marginBottom:16, display:'inline-flex' }}>
                  🔗 Open Resource
                </a>
              )}
              {activeContent.contentText && (
                <div style={{ color:'var(--text)', lineHeight:1.8, whiteSpace:'pre-wrap' }}>
                  {activeContent.contentText}
                </div>
              )}
              <div style={{ marginTop:20, paddingTop:16, borderTop:'1px solid var(--border)', display:'flex', gap:12 }}>
                {contents.findIndex(c => c.id === activeContent.id) > 0 && (
                  <button className="btn btn-secondary btn-sm" onClick={() => {
                    const i = contents.findIndex(c => c.id === activeContent.id);
                    setActive(contents[i-1]);
                  }}>← Previous</button>
                )}
                {contents.findIndex(c => c.id === activeContent.id) < contents.length - 1 && (
                  <button className="btn btn-primary btn-sm" onClick={() => {
                    const i = contents.findIndex(c => c.id === activeContent.id);
                    setActive(contents[i+1]);
                  }}>Next →</button>
                )}
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">📖</div>
              <p>Select a lesson from the sidebar to begin.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
