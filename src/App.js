// src/App.js
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import LoginPage    from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CoursesPage  from './pages/CoursesPage';
import CourseDetailPage from './pages/CourseDetailPage';

// Dashboards
import AdminDashboard      from './pages/admin/AdminDashboard';
import InstructorDashboard from './pages/instructor/InstructorDashboard';
import StudentDashboard    from './pages/student/StudentDashboard';

import './App.css';

function PrivateRoute({ children, roles }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

function RoleRoute() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  switch (user.role) {
    case 'ADMIN':           return <Navigate to="/admin"      replace />;
    case 'INSTRUCTOR':      return <Navigate to="/instructor" replace />;
    case 'STUDENT':         return <Navigate to="/student"    replace />;
    case 'CONTENT_CREATOR': return <Navigate to="/instructor" replace />;
    default:                return <Navigate to="/courses"    replace />;
  }
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/"        element={<RoleRoute />} />
          <Route path="/login"   element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/courses/:id" element={<CourseDetailPage />} />

          <Route path="/admin/*" element={
            <PrivateRoute roles={['ADMIN']}>
              <AdminDashboard />
            </PrivateRoute>
          } />
          <Route path="/instructor/*" element={
            <PrivateRoute roles={['INSTRUCTOR','CONTENT_CREATOR','ADMIN']}>
              <InstructorDashboard />
            </PrivateRoute>
          } />
          <Route path="/student/*" element={
            <PrivateRoute roles={['STUDENT']}>
              <StudentDashboard />
            </PrivateRoute>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
