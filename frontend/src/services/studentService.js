import api from "./api";

// Student Profile & Resume
export const getStudentProfile = () => api.get("students/profile/");
export const updateStudentProfile = (data) => api.patch("students/profile/", data);
export const uploadResume = (formData) => api.put("students/upload-resume/", formData, {
    headers: { "Content-Type": "multipart/form-data" }
});

// Student Dashboard
export const getStudentDashboard = () => api.get("dashboard/student/");

// Available Slots & Bookings
export const getAvailableSlots = (search = "", date = "") => {
    let query = "";
    if (search) query += `search=${encodeURIComponent(search)}&`;
    if (date) query += `date=${encodeURIComponent(date)}&`;
    return api.get(`bookings/available-slots/?${query}`);
};

export const bookInterview = (slotId) => api.post("bookings/book/", { interview_slot: slotId });
export const getStudentBookings = () => api.get("bookings/book/");
export const cancelBooking = (bookingId) => api.post(`bookings/${bookingId}/cancel/`);

// Notifications
export const getNotifications = () => api.get("notifications/");
export const markNotificationRead = (id) => api.put(`notifications/${id}/read/`);
export const markAllNotificationsRead = () => api.put("notifications/read-all/");

// Feedback
export const getStudentFeedback = () => api.get("feedback/");
export const getFeedbackDetail = (id) => api.get(`feedback/${id}/`);