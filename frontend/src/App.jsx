import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";

import Dashboard from "./pages/Student/Dashboard";
import Resume from "./pages/Student/Resume";
import Slots from "./pages/Student/Slots";
import Bookings from "./pages/Student/Bookings";
import Notifications from "./pages/Student/Notifications";
import Feedback from "./pages/Student/Feedback";
import Profile from "./pages/Student/Profile";
import UpcomingInterviews from "./pages/Student/UpcomingInterviews";
import StudentCodingAssessments from "./pages/Student/StudentCodingAssessments";
import StudentCodingEnvironment from "./pages/Student/StudentCodingEnvironment";
import StudentCodingAttempts from "./pages/Student/StudentCodingAttempts";
import StudentAssessmentResult from "./pages/Student/StudentAssessmentResult";

import FacultyDashboard from "./pages/Faculty/FacultyDashboard";
import ManageSlots from "./pages/Faculty/ManageSlots";
import BookedStudents from "./pages/Faculty/BookedStudents";
import FacultyProfile from "./pages/Faculty/FacultyProfile";
import FacultyFeedback from "./pages/Faculty/FacultyFeedback";
import TodaySchedulePage from "./pages/Faculty/TodaySchedulePage";
import FacultyCodingAssessments from "./pages/Faculty/FacultyCodingAssessments";
import FacultyAssessmentSubmissions from "./pages/Faculty/FacultyAssessmentSubmissions";
import FacultyUpcomingInterviews from "./pages/Faculty/FacultyUpcomingInterviews";

import AdminDashboard from "./pages/Admin/AdminDashboard";
import FacultyApprovals from "./pages/Admin/FacultyApprovals";
import FacultyManagement from "./pages/Admin/FacultyManagement";
import StudentManagement from "./pages/Admin/StudentManagement";
import BroadcastNotifications from "./pages/Admin/BroadcastNotifications";
import AdminSubmissions from "./pages/Admin/AdminSubmissions";
import AdminProfile from "./pages/Admin/AdminProfile";

// Protected Route Guard Component
const ProtectedRoute = ({ children, allowedRole }) => {
    const token = localStorage.getItem("access");
    const role = localStorage.getItem("role");

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRole && role !== allowedRole) {
        if (role === "student") return <Navigate to="/student/dashboard" replace />;
        if (role === "faculty") return <Navigate to="/faculty/dashboard" replace />;
        if (role === "admin") return <Navigate to="/admin/dashboard" replace />;
        return <Navigate to="/login" replace />;
    }

    return children;
};

function App() {
    return (
        <BrowserRouter>
            <Routes>

                {/* Public Routes */}
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Student Routes */}
                <Route path="/student/dashboard" element={<ProtectedRoute allowedRole="student"><Dashboard /></ProtectedRoute>} />
                <Route path="/student/profile" element={<ProtectedRoute allowedRole="student"><Profile /></ProtectedRoute>} />
                <Route path="/student/resume" element={<ProtectedRoute allowedRole="student"><Profile /></ProtectedRoute>} />
                <Route path="/student/upcoming" element={<ProtectedRoute allowedRole="student"><UpcomingInterviews /></ProtectedRoute>} />
                <Route path="/student/slots" element={<ProtectedRoute allowedRole="student"><Slots /></ProtectedRoute>} />
                <Route path="/student/coding-assessments" element={<ProtectedRoute allowedRole="student"><StudentCodingAssessments /></ProtectedRoute>} />
                <Route path="/student/coding-assessments/:id/solve" element={<ProtectedRoute allowedRole="student"><StudentCodingEnvironment /></ProtectedRoute>} />
                <Route path="/student/coding-assessments/results/:submissionId" element={<ProtectedRoute allowedRole="student"><StudentAssessmentResult /></ProtectedRoute>} />
                <Route path="/student/coding-attempts" element={<ProtectedRoute allowedRole="student"><StudentCodingAttempts /></ProtectedRoute>} />
                <Route path="/student/bookings" element={<ProtectedRoute allowedRole="student"><Bookings /></ProtectedRoute>} />
                <Route path="/student/notifications" element={<ProtectedRoute allowedRole="student"><Notifications /></ProtectedRoute>} />
                <Route path="/student/feedback" element={<ProtectedRoute allowedRole="student"><Feedback /></ProtectedRoute>} />

                {/* Faculty Routes */}
                <Route path="/faculty/dashboard" element={<ProtectedRoute allowedRole="faculty"><FacultyDashboard /></ProtectedRoute>} />
                <Route path="/faculty/slots" element={<ProtectedRoute allowedRole="faculty"><ManageSlots /></ProtectedRoute>} />
                <Route path="/faculty/upcoming" element={<ProtectedRoute allowedRole="faculty"><FacultyUpcomingInterviews /></ProtectedRoute>} />
                <Route path="/faculty/coding-assessments" element={<ProtectedRoute allowedRole="faculty"><FacultyCodingAssessments /></ProtectedRoute>} />
                <Route path="/faculty/coding-assessments/:id/submissions" element={<ProtectedRoute allowedRole="faculty"><FacultyAssessmentSubmissions /></ProtectedRoute>} />
                <Route path="/faculty/today" element={<ProtectedRoute allowedRole="faculty"><TodaySchedulePage /></ProtectedRoute>} />
                <Route path="/faculty/students" element={<ProtectedRoute allowedRole="faculty"><BookedStudents /></ProtectedRoute>} />
                <Route path="/faculty/feedback" element={<ProtectedRoute allowedRole="faculty"><FacultyFeedback /></ProtectedRoute>} />
                <Route path="/faculty/notifications" element={<ProtectedRoute allowedRole="faculty"><Notifications /></ProtectedRoute>} />
                <Route path="/faculty/profile" element={<ProtectedRoute allowedRole="faculty"><FacultyProfile /></ProtectedRoute>} />

                {/* Admin Routes */}
                <Route path="/admin/dashboard" element={<ProtectedRoute allowedRole="admin"><AdminDashboard /></ProtectedRoute>} />
                <Route path="/admin/faculty-management" element={<ProtectedRoute allowedRole="admin"><FacultyManagement /></ProtectedRoute>} />
                <Route path="/admin/faculty-approvals" element={<ProtectedRoute allowedRole="admin"><FacultyApprovals /></ProtectedRoute>} />
                <Route path="/admin/students" element={<ProtectedRoute allowedRole="admin"><StudentManagement /></ProtectedRoute>} />
                <Route path="/admin/submissions" element={<ProtectedRoute allowedRole="admin"><AdminSubmissions /></ProtectedRoute>} />
                <Route path="/admin/broadcast" element={<ProtectedRoute allowedRole="admin"><BroadcastNotifications /></ProtectedRoute>} />
                <Route path="/admin/profile" element={<ProtectedRoute allowedRole="admin"><AdminProfile /></ProtectedRoute>} />

                {/* Catch All */}
                <Route path="*" element={<Navigate to="/" replace />} />

            </Routes>
        </BrowserRouter>
    );
}

export default App;