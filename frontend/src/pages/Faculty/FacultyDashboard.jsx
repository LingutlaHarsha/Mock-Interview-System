import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import { getFacultyDashboard } from "../../services/facultyService";
import {
    FaCalendarAlt, FaUserGraduate, FaCheckCircle, FaTasks,
    FaPlus, FaUsers, FaClipboardList, FaFilter, FaSortAmountDown, FaArrowRight, FaClock
} from "react-icons/fa";

function FacultyDashboard() {
    const navigate = useNavigate();
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);

    const [filter, setFilter] = useState("all");
    const [sortBy, setSortBy] = useState("earliest");

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const res = await getFacultyDashboard();
            setDashboardData(res.data);
        } catch (error) {
            console.error("Failed to load faculty dashboard data", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <>
                <Sidebar activeRole="faculty" />
                <Navbar title="Faculty Dashboard Overview" userRole="faculty" />
                <div className="container" style={{ marginLeft: "260px", paddingTop: "90px" }}>
                    <div className="d-flex justify-content-center align-items-center vh-50 py-5">
                        <div className="spinner-border text-success" role="status">
                            <span className="visually-hidden">Loading faculty portal...</span>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    const {
        stats,
        total_slots,
        today_interviews,
        completed_interviews,
        pending_feedback,
        today_schedule
    } = dashboardData || {};

    const rawSchedule = today_schedule || [];

    const filteredSchedule = rawSchedule.filter(b => {
        if (filter === "booked") return b.is_booked && !b.has_feedback && b.status !== 'Completed';
        if (filter === "available") return !b.is_booked;
        if (filter === "evaluated") return b.has_feedback || b.status === 'Completed';
        return true;
    });

    filteredSchedule.sort((a, b) => {
        const timeA = a.interview_slot_details?.interview_time || "";
        const timeB = b.interview_slot_details?.interview_time || "";
        if (sortBy === "earliest") return timeA.localeCompare(timeB);
        if (sortBy === "latest") return timeB.localeCompare(timeA);
        if (sortBy === "topic") return (a.interview_slot_details?.title || "").localeCompare(b.interview_slot_details?.title || "");
        return 0;
    });

    return (
        <>
            <Sidebar activeRole="faculty" />
            <Navbar title="Faculty Dashboard Overview" userRole="faculty" />

            <div className="container-fluid animate-fade-in" style={{ marginLeft: "260px", paddingTop: "90px", paddingRight: "30px", maxWidth: "calc(100% - 260px)" }}>

                {/* Hero Welcome Banner */}
                <div className="card border-0 rounded-4 p-4 text-white mb-4 shadow-sm" style={{ background: "linear-gradient(135deg, #064e3b 0%, #047857 60%, #10b981 100%)" }}>
                    <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
                        <div>
                            <span className="badge bg-white text-success px-3 py-1.5 rounded-pill fw-bold mb-2 shadow-2xs">
                                Faculty Interview Portal
                            </span>
                            <h2 className="fw-bold m-0 text-white">Faculty Management Workspace 🎓</h2>
                            <p className="text-white-50 m-0 mt-1">
                                Manage time slots, evaluate student interviews, and oversee technical coding assessments.
                            </p>
                        </div>
                        <div className="d-flex gap-2">
                            <button
                                className="btn btn-light text-success fw-bold rounded-pill px-4 shadow-sm"
                                onClick={() => navigate("/faculty/slots")}
                            >
                                <FaPlus className="me-1.5" /> Create Time Slot
                            </button>
                        </div>
                    </div>
                </div>

                {/* Top Metrics Cards Row */}
                <div className="row g-3 mb-4">
                    <div className="col-lg-3 col-md-6">
                        <div className="card border-0 rounded-4 p-3.5 bg-white h-100 shadow-sm border border-light-subtle">
                            <div className="d-flex align-items-center justify-content-between">
                                <div>
                                    <span className="text-secondary small fw-bold text-uppercase tracking-wider">Total Conducted</span>
                                    <h2 className="fw-bold mb-0 text-dark mt-1" style={{ fontSize: "2.2rem" }}>{stats?.total_conducted ?? total_slots ?? 0}</h2>
                                    <span className="badge bg-primary-subtle text-primary mt-1.5 small fw-semibold">All Time History</span>
                                </div>
                                <div className="p-3 bg-primary bg-opacity-10 text-primary rounded-4 shadow-2xs">
                                    <FaCalendarAlt className="fs-3" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-lg-3 col-md-6">
                        <div className="card border-0 rounded-4 p-3.5 bg-white h-100 shadow-sm border border-light-subtle">
                            <div className="d-flex align-items-center justify-content-between">
                                <div>
                                    <span className="text-secondary small fw-bold text-uppercase tracking-wider">Today's Sessions</span>
                                    <h2 className="fw-bold mb-0 text-dark mt-1" style={{ fontSize: "2.2rem" }}>{today_interviews || 0}</h2>
                                    <span className="badge bg-success-subtle text-success mt-1.5 small fw-semibold">Scheduled Today</span>
                                </div>
                                <div className="p-3 bg-success bg-opacity-10 text-success rounded-4 shadow-2xs">
                                    <FaUserGraduate className="fs-3" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-lg-3 col-md-6">
                        <div className="card border-0 rounded-4 p-3.5 bg-white h-100 shadow-sm border border-light-subtle">
                            <div className="d-flex align-items-center justify-content-between">
                                <div>
                                    <span className="text-secondary small fw-bold text-uppercase tracking-wider">Evaluated</span>
                                    <h2 className="fw-bold mb-0 text-dark mt-1" style={{ fontSize: "2.2rem" }}>{completed_interviews || 0}</h2>
                                    <span className="badge bg-info-subtle text-info mt-1.5 small fw-semibold">Feedback Submitted</span>
                                </div>
                                <div className="p-3 bg-info bg-opacity-10 text-info rounded-4 shadow-2xs">
                                    <FaCheckCircle className="fs-3" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-lg-3 col-md-6">
                        <div className="card border-0 rounded-4 p-3.5 bg-white h-100 shadow-sm border border-light-subtle">
                            <div className="d-flex align-items-center justify-content-between">
                                <div>
                                    <span className="text-secondary small fw-bold text-uppercase tracking-wider">Pending Review</span>
                                    <h2 className="fw-bold mb-0 text-dark mt-1" style={{ fontSize: "2.2rem" }}>{pending_feedback || 0}</h2>
                                    <span className="badge bg-warning-subtle text-warning mt-1.5 small fw-semibold">Awaiting Feedback</span>
                                </div>
                                <div className="p-3 bg-warning bg-opacity-10 text-warning rounded-4 shadow-2xs">
                                    <FaTasks className="fs-3" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Dashboard Main Content Row */}
                <div className="row g-4 mb-5">

                    {/* Left: Today's Schedule */}
                    <div className="col-lg-8">
                        <div className="card border-0 rounded-4 p-4 bg-white shadow-sm border border-light-subtle">
                            <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
                                <h5 className="fw-bold m-0 text-dark d-flex align-items-center gap-2">
                                    <FaClock className="text-success" /> Today's Interview Schedule
                                </h5>
                                <button className="btn btn-success btn-sm fw-bold rounded-pill px-3 shadow-2xs" onClick={() => navigate("/faculty/slots")}>
                                    + Create Slot
                                </button>
                            </div>

                            {/* Filter & Sort Controls */}
                            <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3 p-3 bg-light rounded-4 border border-light-subtle">
                                <div className="d-flex align-items-center gap-2 flex-wrap">
                                    <span className="small fw-bold text-secondary me-1"><FaFilter /> Filter:</span>
                                    <button
                                        className={`btn btn-sm rounded-pill px-3 fw-bold ${filter === 'all' ? 'btn-success text-white shadow-2xs' : 'btn-outline-secondary'}`}
                                        onClick={() => setFilter('all')}
                                    >
                                        All ({rawSchedule.length})
                                    </button>
                                    <button
                                        className={`btn btn-sm rounded-pill px-3 fw-bold ${filter === 'booked' ? 'btn-primary text-white shadow-2xs' : 'btn-outline-primary'}`}
                                        onClick={() => setFilter('booked')}
                                    >
                                        Booked
                                    </button>
                                    <button
                                        className={`btn btn-sm rounded-pill px-3 fw-bold ${filter === 'available' ? 'btn-secondary text-white shadow-2xs' : 'btn-outline-secondary'}`}
                                        onClick={() => setFilter('available')}
                                    >
                                        Available
                                    </button>
                                    <button
                                        className={`btn btn-sm rounded-pill px-3 fw-bold ${filter === 'evaluated' ? 'btn-info text-white shadow-2xs' : 'btn-outline-info'}`}
                                        onClick={() => setFilter('evaluated')}
                                    >
                                        Evaluated
                                    </button>
                                </div>

                                <div className="d-flex align-items-center gap-2">
                                    <span className="small fw-bold text-secondary me-1"><FaSortAmountDown /> Sort:</span>
                                    <select
                                        className="form-select form-select-sm rounded-pill px-3 fw-semibold border-light-subtle"
                                        style={{ width: "auto" }}
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                    >
                                        <option value="earliest">⏰ Earliest Time</option>
                                        <option value="latest">⌛ Latest Time</option>
                                        <option value="topic">🔤 Topic (A-Z)</option>
                                    </select>
                                </div>
                            </div>

                            {filteredSchedule.length === 0 ? (
                                <p className="text-muted small py-4 text-center">No mock interviews match your selected filter.</p>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table table-hover align-middle mb-0">
                                        <thead className="table-light rounded-3">
                                            <tr>
                                                <th className="py-3">Student Name</th>
                                                <th className="py-3">Interview Topic</th>
                                                <th className="py-3">Scheduled Time</th>
                                                <th className="py-3">Mode</th>
                                                <th className="py-3 text-end">Action / Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredSchedule.map(b => (
                                                <tr key={b.id}>
                                                    <td className="py-3">
                                                        <div className="d-flex align-items-center gap-2">
                                                            <div className={`p-2 rounded-circle d-flex align-items-center justify-content-center text-white fw-bold extra-small ${b.is_booked ? 'bg-primary' : 'bg-secondary'}`} style={{ width: '32px', height: '32px' }}>
                                                                {b.student_name ? b.student_name.charAt(0).toUpperCase() : '?'}
                                                            </div>
                                                            <span className={`fw-bold ${b.is_booked ? 'text-dark' : 'text-muted fst-italic'}`}>
                                                                {b.student_name}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="py-3">
                                                        <span className="badge bg-success-subtle text-success border border-success border-opacity-25 px-2.5 py-1 rounded-pill fw-bold">
                                                            {b.interview_slot_details?.title}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 text-secondary font-monospace fw-semibold">
                                                        {b.interview_slot_details?.interview_time}
                                                    </td>
                                                    <td className="py-3">
                                                        <span className="badge bg-dark bg-opacity-10 text-dark border px-2.5 py-1 rounded-pill">
                                                            {b.interview_slot_details?.mode}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 text-end">
                                                        {b.is_booked ? (
                                                            b.has_feedback || b.status === 'Completed' ? (
                                                                <span className="badge bg-success border border-success px-3 py-1.5 rounded-pill fw-bold">
                                                                    Evaluated ✅
                                                                </span>
                                                            ) : (
                                                                <button className="btn btn-success btn-sm fw-bold rounded-pill px-3 shadow-2xs" onClick={() => navigate("/faculty/students")}>
                                                                    Evaluate Student
                                                                </button>
                                                            )
                                                        ) : (
                                                            <span className="badge bg-secondary-subtle text-secondary border border-secondary-subtle px-3 py-1.5 rounded-pill">
                                                                Available Slot
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: Quick Actions */}
                    <div className="col-lg-4">
                        <div className="card border-0 rounded-4 p-4 h-100 bg-white shadow-sm border border-light-subtle">
                            <h5 className="fw-bold mb-3 text-dark pb-2 border-bottom d-flex align-items-center gap-2">
                                <span className="text-warning fs-5">⚡</span> Quick Actions
                            </h5>
                            <div className="d-flex flex-column gap-3">

                                {/* Action 1: Create Slot */}
                                <div
                                    className="p-3.5 rounded-4 border bg-white border-light-subtle cursor-pointer shadow-2xs hover-lift d-flex align-items-center justify-content-between w-100"
                                    style={{ cursor: "pointer", transition: "all 0.2s ease" }}
                                    onClick={() => navigate("/faculty/slots")}
                                >
                                    <div className="d-flex align-items-center gap-3">
                                        <FaPlus className="text-success fs-4 flex-shrink-0" />
                                        <div>
                                            <h6 className="fw-bold text-dark m-0 mb-1" style={{ fontSize: "0.95rem" }}>Create Interview Slots</h6>
                                            <p className="text-muted small m-0" style={{ fontSize: "0.825rem" }}>Open new time slots for student booking</p>
                                        </div>
                                    </div>
                                    <FaArrowRight className="text-success fs-5 flex-shrink-0 ms-2" />
                                </div>

                                {/* Action 2: View Roster */}
                                <div
                                    className="p-3.5 rounded-4 border bg-white border-light-subtle cursor-pointer shadow-2xs hover-lift d-flex align-items-center justify-content-between w-100"
                                    style={{ cursor: "pointer", transition: "all 0.2s ease" }}
                                    onClick={() => navigate("/faculty/students")}
                                >
                                    <div className="d-flex align-items-center gap-3">
                                        <FaUsers className="text-primary fs-4 flex-shrink-0" />
                                        <div>
                                            <h6 className="fw-bold text-dark m-0 mb-1" style={{ fontSize: "0.95rem" }}>View Booked Students</h6>
                                            <p className="text-muted small m-0" style={{ fontSize: "0.825rem" }}>Review student profiles & PDF resumes</p>
                                        </div>
                                    </div>
                                    <FaArrowRight className="text-primary fs-5 flex-shrink-0 ms-2" />
                                </div>

                                {/* Action 3: Upcoming Interviews */}
                                <div
                                    className="p-3.5 rounded-4 border bg-white border-light-subtle cursor-pointer shadow-2xs hover-lift d-flex align-items-center justify-content-between w-100"
                                    style={{ cursor: "pointer", transition: "all 0.2s ease" }}
                                    onClick={() => navigate("/faculty/upcoming")}
                                >
                                    <div className="d-flex align-items-center gap-3">
                                        <FaClipboardList className="text-warning fs-4 flex-shrink-0" />
                                        <div>
                                            <h6 className="fw-bold text-dark m-0 mb-1" style={{ fontSize: "0.95rem" }}>Upcoming Interviews</h6>
                                            <p className="text-muted small m-0" style={{ fontSize: "0.825rem" }}>View accepted slots & submit feedback</p>
                                        </div>
                                    </div>
                                    <FaArrowRight className="text-warning fs-5 flex-shrink-0 ms-2" />
                                </div>

                            </div>
                        </div>
                    </div>

                </div>

            </div>
        </>
    );
}

export default FacultyDashboard;
