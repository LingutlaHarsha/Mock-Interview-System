import api from "./api";

// Faculty Assessment Management
export const getFacultyAssessments = () => api.get("coding/faculty/assessments/");
export const createAssessment = (data) => api.post("coding/faculty/assessments/", data);
export const getFacultyAssessmentDetail = (id) => api.get(`coding/faculty/assessments/${id}/`);
export const updateAssessment = (id, data) => api.put(`coding/faculty/assessments/${id}/`, data);
export const deleteAssessment = (id) => api.delete(`coding/faculty/assessments/${id}/`);
export const duplicateAssessment = (id) => api.post(`coding/faculty/assessments/${id}/duplicate/`);

// Faculty Questions & Test Cases
export const parseLeetCodeURL = (url) => api.post("coding/faculty/parse-leetcode/", { url });
export const createQuestion = (assessmentId, data) => api.post(`coding/faculty/assessments/${assessmentId}/questions/`, data);
export const updateQuestion = (id, data) => api.put(`coding/faculty/questions/${id}/`, data);
export const deleteQuestion = (id) => api.delete(`coding/faculty/questions/${id}/`);

export const createTestCase = (questionId, data) => api.post(`coding/faculty/questions/${questionId}/test-cases/`, data);
export const deleteTestCase = (id) => api.delete(`coding/faculty/test-cases/${id}/`);

// Faculty Submissions & Leaderboard
export const getFacultySubmissions = (assessmentId) => api.get(`coding/faculty/assessments/${assessmentId}/submissions/`);
export const updateSubmissionMarks = (id, data) => api.patch(`coding/faculty/submissions/${id}/`, data);
export const getFacultyLeaderboard = (assessmentId) => api.get(`coding/faculty/assessments/${assessmentId}/leaderboard/`);

// Student Assessment Flow
export const getStudentAssessments = () => api.get("coding/student/assessments/");
export const getStudentAssessmentDetail = (id) => api.get(`coding/student/assessments/${id}/`);
export const runStudentCode = (data) => api.post("coding/student/run/", data);
export const submitStudentCode = (data) => api.post("coding/student/submit/", data);
export const getStudentAttempts = () => api.get("coding/student/attempts/");
export const getStudentSubmissionDetail = (id) => api.get(`coding/student/submissions/${id}/`);
