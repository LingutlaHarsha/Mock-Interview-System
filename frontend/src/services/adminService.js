import api from "./api";

// Admin Dashboard
export const getAdminDashboard = () => api.get("dashboard/admin/");

// Faculty Approvals & Queue
export const getPendingFaculty = () => api.get("admin/faculty/pending/");
export const approveFaculty = (id) => api.put(`admin/faculty/${id}/approve/`);
export const rejectFaculty = (id) => api.delete(`admin/faculty/${id}/reject/`);

// Admin Faculty Management
export const getAllFaculty = () => api.get("admin/faculty/manage/");
export const createFaculty = (data) => api.post("admin/faculty/manage/", data);
export const deleteFaculty = (id) => api.delete(`admin/faculty/${id}/manage/`);
export const resetFacultyPassword = (id, newPassword) => api.post(`admin/faculty/${id}/reset-password/`, { new_password: newPassword });

// Student Roster & Management
export const getAdminStudents = () => api.get("admin/students/");
export const createStudent = (data) => api.post("admin/students/create/", data);
export const deleteStudent = (id) => api.delete(`admin/students/${id}/manage/`);
export const resetStudentPassword = (id, newPassword) => api.post(`admin/students/${id}/reset-password/`, { new_password: newPassword });

// Broadcast Announcements
export const broadcastAnnouncement = (data) => api.post("admin/broadcast/", data);

// Universal Password Change (All roles)
export const changeUserPassword = (data) => api.post("change-password/", data);
