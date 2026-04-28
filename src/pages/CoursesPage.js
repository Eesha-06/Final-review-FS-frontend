// src/pages/CoursesPage.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getPublicCourses } from '../services/api';
import { useAuth } from '../context/AuthContext';

const LEVELS = { BEGINNER:'🟢', INTERMEDIATE:'🟡', ADVANCED:'🔴' };

function CourseCard({ course }) {
  const navigate = useNavigate();
  return (
    <div className="course-card" onClick={() => navigate(`/courses/${course.id}`)} style={{ cursor:'pointer' }}>
      <div className="course-thumb">{course.thumbnail ? <img src={course.thumbnail} alt={course.title} style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : '📚'}</div>
      <div className="course-body">
        <div className="course-title">{course.title}</div>
        <div className="course-desc">{course.description}</div>
        <div className="course-meta">
          <span>{LEVELS[course.level] || '📘'} {course.level}</span>
          <span>·</span>
          <span>👤 {course.instructorName}</span>
          <span>·</span>
          <span>🎓 {course.enrollmentCount || 0}</span>
        </div>
        <div style={{ marginTop:12, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <span style={{ color:'var(--accent)', fontWeight:600, fontSize:16 }}>
            {course.price > 0 ? `$${course.price}` : 'Free'}
          </span>
          <span className="badge badge-success">{course.status}</span>
        </div>
      </div>
    </div>
  );
}

export default function CoursesPage() {
  const [courses, setCourses]   = useState([]);
  const [keyword, setKeyword]   = useState('');
  const [loading, setLoading]   = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    getPublicCourses().then(r => setCourses(r.data.data || [])).finally(() => setLoading(false));
  }, []);

  const search = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const r = await getPublicCourses(keyword);
      setCourses(r.data.data || []);
    } finally { setLoading(false); }
  };

  return (
    <>
      {/* Navbar */}
      <nav className="navbar">
        <span className="navbar-brand" onClick={() => navigate('/')} style={{ cursor:'pointer' }}>🎓 LearnHub</span>
        <div className="navbar-nav">
          <Link to="/courses" className="nav-link active">Courses</Link>
          {user ? (
            <button className="btn btn-primary btn-sm" onClick={() => navigate(
              user.role === 'ADMIN' ? '/admin' : user.role === 'INSTRUCTOR' ? '/instructor' : '/student'
            )}>Dashboard</button>
          ) : (
            <>
              <Link to="/login"    className="nav-link">Sign In</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <div style={{ background:'radial-gradient(ellipse at 50% 0%, rgba(110,231,183,.12) 0%, transparent 70%), var(--bg)', padding:'60px 24px', textAlign:'center' }}>
        <h1 style={{ fontFamily:'var(--font-head)', fontSize:48, marginBottom:12 }}>
          Learn Without <span style={{ color:'var(--accent)' }}>Limits</span>
        </h1>
        <p style={{ color:'var(--muted)', fontSize:18, marginBottom:32 }}>Explore world-class courses from expert instructors</p>
        <form onSubmit={search} style={{ display:'flex', gap:12, maxWidth:500, margin:'0 auto' }}>
          <div className="search-bar" style={{ flex:1 }}>
            <span className="search-icon">🔍</span>
            <input className="form-control" placeholder="Search courses…"
              value={keyword} onChange={e => setKeyword(e.target.value)} />
          </div>
          <button className="btn btn-primary" type="submit">Search</button>
        </form>
      </div>

      {/* Grid */}
      <div className="container" style={{ padding:'40px 24px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
          <h2 style={{ fontFamily:'var(--font-head)', fontSize:22 }}>
            {keyword ? `Results for "${keyword}"` : 'All Courses'}
          </h2>
          <span style={{ color:'var(--muted)', fontSize:14 }}>{courses.length} courses</span>
        </div>
        {loading ? <div className="spinner" /> :
          courses.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🔎</div>
              <p>No courses found. Try a different search.</p>
            </div>
          ) : (
            <div className="courses-grid">
              {courses.map(c => <CourseCard key={c.id} course={c} />)}
            </div>
          )
        }
      </div>
    </>
  );
}
