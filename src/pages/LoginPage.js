// src/pages/LoginPage.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [email, setEmail]   = useState('');
  const [password, setPass] = useState('');
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const { login }   = useAuth();
  const navigate    = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const user = await login(email, password);
      switch (user.role) {
        case 'ADMIN':           navigate('/admin');      break;
        case 'INSTRUCTOR':      navigate('/instructor'); break;
        case 'CONTENT_CREATOR': navigate('/instructor'); break;
        default:                navigate('/student');    break;
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-card fade-in">
        <div className="auth-logo">🎓 LearnHub</div>
        <p className="auth-subtitle">Welcome back — sign in to continue learning</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:16 }}>
          <div className="form-group">
            <label>Email address</label>
            <input className="form-control" type="email" placeholder="you@example.com"
              value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input className="form-control" type="password" placeholder="••••••••"
              value={password} onChange={e => setPass(e.target.value)} required />
          </div>
          <button className="btn btn-primary w-full" type="submit" disabled={loading}
            style={{ marginTop:8, justifyContent:'center' }}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        {/* Quick fill demo accounts */}
        <div style={{ marginTop:20, padding:14, background:'var(--bg3)', borderRadius:8, fontSize:13 }}>
          <div style={{ color:'var(--muted)', marginBottom:8, fontWeight:500 }}>🧪 Demo Accounts (password: password123)</div>
          {[
            ['admin@lms.com','Admin'],['instructor@lms.com','Instructor'],
            ['student@lms.com','Student'],['creator@lms.com','Creator']
          ].map(([em, label]) => (
            <button key={em} onClick={() => { setEmail(em); setPass('password123'); }}
              style={{ display:'block', background:'none', border:'none', color:'var(--accent)', cursor:'pointer', fontSize:13, marginBottom:2 }}>
              → {label}: {em}
            </button>
          ))}
        </div>

        <div className="auth-footer">
          New here? <Link to="/register">Create an account</Link>
        </div>
      </div>
    </div>
  );
}
