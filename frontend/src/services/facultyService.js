import api from "./api";

// Faculty Dashboard
export const getFacultyDashboard = () => api.get("dashboard/faculty/");

// Interview Slots Management
export const getFacultySlots = () => api.get("faculty/slots/");
export const createInterviewSlot = (data) => api.post("faculty/slots/", data);
export const updateInterviewSlot = (id, data) => api.put(`faculty/slots/${id}/`, data);
export const deleteInterviewSlot = (id) => api.delete(`faculty/slots/${id}/`);

// Booked Students & Today's Schedule
export const getTodayInterviews = () => api.get("faculty/today-interviews/");
export const getBookedStudents = () => api.get("faculty/booked-students/");
export const approveBooking = (id) => api.post(`bookings/${id}/approve/`);
export const rejectBooking = (id) => api.post(`bookings/${id}/reject/`);

// Feedback Evaluation
export const submitFeedback = (data) => api.post("feedback/", data);

// Faculty Profile
export const getFacultyProfile = () => api.get("me/");
export const updateFacultyProfile = (data) => api.patch("me/", data);
