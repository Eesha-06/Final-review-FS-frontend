// src/services/api.js
import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8080/api',
  timeout: 15000,
});

// Attach JWT to every request
API.interceptors.request.use(config => {
  const token = localStorage.getItem('lms_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
API.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ── Auth ──────────────────────────────────────────────────────────
export const login    = data => API.post('/auth/login', data);
export const register = data => API.post('/auth/register', data);

// ── Public Courses ────────────────────────────────────────────────
export const getPublicCourses  = (keyword, categoryId) =>
  API.get('/courses/public', { params: { keyword, categoryId } });
export const getCourseDetails  = id  => API.get(`/courses/public/${id}`);
export const getCourseContent  = id  => API.get(`/courses/public/${id}/content`);

// ── Enrollment ────────────────────────────────────────────────────
export const enroll         = courseId => API.post(`/enrollments/${courseId}`);
export const getMyEnrollments = ()     => API.get('/enrollments/my');

// ── Student ───────────────────────────────────────────────────────
export const submitAssignment = (assignmentId, data) =>
  API.post(`/student/assignments/${assignmentId}/submit`, data);
export const getMySubmissions = () => API.get('/student/submissions');

// ── Assignments ───────────────────────────────────────────────────
export const getCourseAssignments = courseId =>
  API.get(`/courses/${courseId}/assignments`);

// ── Instructor ────────────────────────────────────────────────────
export const getMyCourses      = ()     => API.get('/instructor/courses');
export const createCourse      = data   => API.post('/instructor/courses', data);
export const updateCourse      = (id,d) => API.put(`/instructor/courses/${id}`, d);
export const deleteCourse      = id     => API.delete(`/instructor/courses/${id}`);
export const addCourseContent  = (cid,d)=> API.post(`/instructor/courses/${cid}/content`, d);
export const createAssignment  = data   => API.post('/instructor/assignments', data);
export const getAssignmentSubs = aId    => API.get(`/instructor/assignments/${aId}/submissions`);
export const gradeSubmission   = (sid,d)=> API.put(`/instructor/submissions/${sid}/grade`, d);
export const getEnrollmentsByCourse = cid => API.get(`/enrollments/course/${cid}`);

// ── Admin ─────────────────────────────────────────────────────────
export const getAdminAnalytics = ()     => API.get('/admin/analytics');
export const getAllUsers        = ()     => API.get('/admin/users');
export const createUser        = data   => API.post('/admin/users', data);
export const deleteUser        = id     => API.delete(`/admin/users/${id}`);
export const toggleUserStatus  = id     => API.put(`/admin/users/${id}/toggle-status`);
export const getAllCourses      = ()     => API.get('/admin/courses');

export default API;
