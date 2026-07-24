import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import { getStudentDashboard, getNotifications } from "../../services/studentService";
import {
    FaMicrophone, FaCalendarAlt, FaFilePdf, FaStar, FaBell,
    FaArrowRight, FaUserEdit, FaCalendarPlus, FaFileUpload, FaClipboardCheck, FaExclamationTriangle
} from "react-icons/fa";

function Dashboard() {
    const navigate = useNavigate();
    const [dashboardData, setDashboardData] = useState(null);
    const [notificationsList, setNotificationsList] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [dashRes, notifRes] = await Promise.all([
                getStudentDashboard(),
                getNotifications()
            ]);
            setDashboardData(dashRes.data);
            setNotificationsList(notifRes.data.slice(0, 5));
        } catch (error) {
            console.error("Failed to load dashboard data", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <>
                <Sidebar activeRole="student" />
                <Navbar title="Student Dashboard" />
                <div className="container" style={{ marginLeft: "260px", paddingTop: "90px" }}>
                    <div className="d-flex justify-content-center align-items-center vh-50 py-5">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading dashboard...</span>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    const {
        student_name,
        resume,
        profile_complete,
        bookings,
        feedbacks,
        upcoming_interview
    } = dashboardData || {};

    return (
        <>
            <Sidebar activeRole="student" />
            <Navbar title="Student Dashboard" userName={student_name} userRole="student" />

            <div className="container-fluid animate-fade-in" style={{ marginLeft: "260px", paddingTop: "90px", paddingRight: "30px", maxWidth: "calc(100% - 260px)" }}>
                
                {/* Hero Welcome Banner */}
                <div className="card border-0 rounded-4 p-4 text-white mb-4 shadow-sm" style={{ background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)" }}>
                    <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
                        <div>
                            <span className="badge bg-white bg-opacity-20 text-info px-3 py-1 rounded-pill fw-bold mb-2">
                                Student Placement Portal
                            </span>
                            <h2 className="fw-bold m-0">Welcome Back, {student_name || "Student"}! 👋</h2>
                            <p className="text-white-50 m-0 mt-1">
                                Prepare for upcoming placement drives with mock interview slots and technical coding assessments.
                            </p>
                        </div>
                        <div className="d-flex gap-2">
                            <button
                                className="btn btn-info text-dark fw-bold rounded-pill px-4 shadow-sm"
                                disabled={!profile_complete || !resume}
                                onClick={() => navigate("/student/slots")}
                            >
                                <FaCalendarPlus className="me-1.5" /> Book Slot
                            </button>
                        </div>
                    </div>
                </div>

                {/* Profile Completion Warning Banner */}
                {!profile_complete && (
                    <div className="card border-0 rounded-4 p-4 bg-danger bg-opacity-10 border-start border-danger border-4 text-danger mb-4 shadow-sm">
                        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
                            <div className="d-flex align-items-center gap-3">
                                <div className="p-3 bg-danger text-white rounded-circle shadow-sm">
                                    <FaExclamationTriangle className="fs-4" />
                                </div>
                                <div>
                                    <h5 className="fw-bold mb-1 text-dark">Profile Details Setup Required</h5>
                                    <p className="mb-0 text-muted small">Please complete your roll number, branch, phone number, and upload your PDF resume to unlock interview slot bookings.</p>
                                </div>
                            </div>
                            <button className="btn btn-danger fw-bold rounded-pill px-4 shadow-sm" onClick={() => navigate("/student/profile")}>
                                Complete Profile Setup →
                            </button>
                        </div>
                    </div>
                )}

                {/* Top Metrics Cards Grid */}
                <div className="row g-3 mb-4">
                    <div className="col-lg-3 col-md-6">
                        <div className="card border-0 rounded-4 p-3 bg-white h-100 shadow-sm border border-light-subtle">
                            <div className="d-flex align-items-center justify-content-between">
                                <div>
                                    <span className="text-secondary small fw-bold text-uppercase">Total Interviews</span>
                                    <h2 className="fw-bold mb-0 text-dark mt-1">{bookings || 0}</h2>
                                    <span className="badge bg-primary-subtle text-primary mt-1 small">Session History</span>
                                </div>
                                <div className="p-3.5 bg-primary bg-opacity-10 text-primary rounded-4 shadow-2xs">
                                    <FaMicrophone className="fs-3" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-lg-3 col-md-6">
                        <div className="card border-0 rounded-4 p-3 bg-white h-100 shadow-sm border border-light-subtle">
                            <div className="d-flex align-items-center justify-content-between">
                                <div>
                                    <span className="text-secondary small fw-bold text-uppercase">Upcoming Session</span>
                                    <h5 className="fw-bold mb-0 text-dark mt-1">
                                        {upcoming_interview ? `${upcoming_interview.date}` : "None Scheduled"}
                                    </h5>
                                    {upcoming_interview ? (
                                        <span className="badge bg-success mt-1 small">{upcoming_interview.time}</span>
                                    ) : (
                                        <span className="badge bg-secondary bg-opacity-10 text-secondary mt-1 small">No Active Booking</span>
                                    )}
                                </div>
                                <div className="p-3.5 bg-warning bg-opacity-10 text-warning rounded-4 shadow-2xs">
                                    <FaCalendarAlt className="fs-3" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-lg-3 col-md-6">
                        <div className="card border-0 rounded-4 p-3 bg-white h-100 shadow-sm border border-light-subtle">
                            <div className="d-flex align-items-center justify-content-between">
                                <div>
                                    <span className="text-secondary small fw-bold text-uppercase">Resume Status</span>
                                    <div className="mt-1">
                                        {resume ? (
                                            <span className="badge bg-success-subtle text-success border border-success border-opacity-25 px-2.5 py-1 rounded-pill fw-bold">
                                                Uploaded ✅
                                            </span>
                                        ) : (
                                            <span className="badge bg-danger-subtle text-danger border border-danger border-opacity-25 px-2.5 py-1 rounded-pill fw-bold">
                                                Not Uploaded ❌
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-muted extra-small d-block mt-1">PDF File Required</span>
                                </div>
                                <div className="p-3.5 bg-info bg-opacity-10 text-info rounded-4 shadow-2xs">
                                    <FaFilePdf className="fs-3" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-lg-3 col-md-6">
                        <div className="card border-0 rounded-4 p-3 bg-white h-100 shadow-sm border border-light-subtle">
                            <div className="d-flex align-items-center justify-content-between">
                                <div>
                                    <span className="text-secondary small fw-bold text-uppercase">Evaluations</span>
                                    <h2 className="fw-bold mb-0 text-dark mt-1">{feedbacks || 0}</h2>
                                    <span className="badge bg-success-subtle text-success mt-1 small">Completed Reviews</span>
                                </div>
                                <div className="p-3.5 bg-success bg-opacity-10 text-success rounded-4 shadow-2xs">
                                    <FaStar className="fs-3" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Dashboard Main Content Row */}
                <div className="row g-4 mb-5">
                    
                    {/* Left: Recent Notifications */}
                    <div className="col-lg-7">
                        <div className="card border-0 rounded-4 p-4 h-100 bg-white shadow-sm border border-light-subtle">
                            <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
                                <h5 className="fw-bold m-0 text-dark d-flex align-items-center gap-2">
                                    <FaBell className="text-primary" /> Recent Notifications
                                </h5>
                                <button className="btn btn-outline-primary btn-sm rounded-pill px-3 fw-bold" onClick={() => navigate("/student/notifications")}>
                                    View All
                                </button>
                            </div>
                            
                            {notificationsList.length === 0 ? (
                                <div className="text-muted small py-4 text-center">No notifications received yet.</div>
                            ) : (
                                <div className="d-flex flex-column gap-2.5">
                                    {notificationsList.map(notif => (
                                        <div key={notif.id} className="p-3 rounded-3 bg-light border border-light-subtle d-flex justify-content-between align-items-start gap-3">
                                            <div>
                                                <h6 className="fw-bold text-dark mb-1">{notif.title}</h6>
                                                <p className="text-secondary small m-0">{notif.message}</p>
                                            </div>
                                            <span className="badge bg-white text-secondary border shadow-2xs small text-nowrap">
                                                {new Date(notif.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: Quick Actions */}
                    <div className="col-lg-5">
                        <div className="card border-0 rounded-4 p-4 h-100 bg-white shadow-sm border border-light-subtle">
                            <h5 className="fw-bold mb-3 text-dark pb-2 border-bottom">⚡ Quick Actions</h5>
                            <div className="d-flex flex-column gap-3">
                                
                                {/* Action 1: Book Slot */}
                                <div
                                    className={`p-3 rounded-4 border d-flex justify-content-between align-items-center transition-all ${
                                        (!profile_complete || !resume)
                                            ? 'bg-light text-muted opacity-75 cursor-not-allowed'
                                            : 'bg-primary bg-opacity-10 border-primary border-opacity-20 cursor-pointer text-primary shadow-2xs hover-lift'
                                    }`}
                                    style={{ cursor: (!profile_complete || !resume) ? "not-allowed" : "pointer" }}
                                    onClick={() => {
                                        if (profile_complete && resume) navigate("/student/slots");
                                    }}
                                >
                                    <div className="d-flex align-items-center gap-3">
                                        <div className="p-2.5 bg-primary text-white rounded-3 shadow-2xs">
                                            <FaCalendarPlus className="fs-5" />
                                        </div>
                                        <div>
                                            <h6 className="fw-bold text-dark m-0">Book Interview Slot</h6>
                                            <span className="extra-small text-secondary">Schedule a 1-on-1 mock interview session</span>
                                        </div>
                                    </div>
                                    <FaArrowRight className="text-primary fs-5" />
                                </div>

                                {/* Action 2: Resume */}
                                <div
                                    className="p-3 rounded-4 border bg-info bg-opacity-10 border-info border-opacity-20 cursor-pointer text-info shadow-2xs hover-lift"
                                    style={{ cursor: "pointer" }}
                                    onClick={() => navigate("/student/resume")}
                                >
                                    <div className="d-flex align-items-center gap-3">
                                        <div className="p-2.5 bg-info text-white rounded-3 shadow-2xs">
                                            <FaFileUpload className="fs-5" />
                                        </div>
                                        <div>
                                            <h6 className="fw-bold text-dark m-0">Upload / Manage Resume</h6>
                                            <span className="extra-small text-secondary">Keep your PDF resume updated</span>
                                        </div>
                                    </div>
                                    <FaArrowRight className="text-info fs-5" />
                                </div>

                                {/* Action 3: Feedback */}
                                <div
                                    className="p-3 rounded-4 border bg-success bg-opacity-10 border-success border-opacity-20 cursor-pointer text-success shadow-2xs hover-lift"
                                    style={{ cursor: "pointer" }}
                                    onClick={() => navigate("/student/feedback")}
                                >
                                    <div className="d-flex align-items-center gap-3">
                                        <div className="p-2.5 bg-success text-white rounded-3 shadow-2xs">
                                            <FaClipboardCheck className="fs-5" />
                                        </div>
                                        <div>
                                            <h6 className="fw-bold text-dark m-0">View Faculty Feedback</h6>
                                            <span className="extra-small text-secondary">Check ratings & detailed evaluations</span>
                                        </div>
                                    </div>
                                    <FaArrowRight className="text-success fs-5" />
                                </div>

                                {/* Action 4: Profile */}
                                <div
                                    className="p-3 rounded-4 border bg-purple bg-opacity-10 border-purple border-opacity-20 cursor-pointer text-purple shadow-2xs hover-lift"
                                    style={{ cursor: "pointer" }}
                                    onClick={() => navigate("/student/profile")}
                                >
                                    <div className="d-flex align-items-center gap-3">
                                        <div className="p-2.5 bg-indigo text-white rounded-3 shadow-2xs" style={{ backgroundColor: "#6366f1" }}>
                                            <FaUserEdit className="fs-5" />
                                        </div>
                                        <div>
                                            <h6 className="fw-bold text-dark m-0">Update Profile Details</h6>
                                            <span className="extra-small text-secondary">Maintain roll number, branch & phone</span>
                                        </div>
                                    </div>
                                    <FaArrowRight className="text-indigo fs-5" style={{ color: "#6366f1" }} />
                                </div>

                            </div>
                        </div>
                    </div>

                </div>

            </div>
        </>
    );
}

export default Dashboard;