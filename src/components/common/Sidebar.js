// src/components/common/Sidebar.js
import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Sidebar({ links, active, onSelect }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="sidebar">
      <div className="sidebar-brand">
        <div><span>🎓 LearnHub</span></div>
        <div className="sidebar-role">{user?.role?.replace('_', ' ')}</div>
        <div style={{ fontSize:13, color:'var(--text)', marginTop:4 }}>{user?.name}</div>
      </div>

      <nav className="sidebar-nav">
        {links.map(link => (
          <button key={link.id} className={`sidebar-link ${active === link.id ? 'active' : ''}`}
            onClick={() => onSelect(link.id)}>
            <span className="sidebar-icon">{link.icon}</span>
            {link.label}
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="sidebar-link w-full" onClick={() => navigate('/courses')}>
          <span className="sidebar-icon">🌐</span> Browse Courses
        </button>
        <button className="sidebar-link w-full" onClick={handleLogout} style={{ color:'var(--danger)' }}>
          <span className="sidebar-icon">🚪</span> Sign Out
        </button>
      </div>
    </div>
  );
}
