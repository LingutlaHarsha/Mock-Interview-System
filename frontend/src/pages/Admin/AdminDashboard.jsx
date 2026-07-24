import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import { getAdminDashboard } from "../../services/adminService";
import {
    FaUserGraduate, FaChalkboardTeacher, FaUserCheck, FaStar,
    FaChartLine, FaArrowRight, FaBullhorn, FaUserCog
} from "react-icons/fa";

function AdminDashboard() {
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const res = await getAdminDashboard();
            setStats(res.data);
        } catch (error) {
            console.error("Failed to load admin dashboard", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <>
                <Sidebar activeRole="admin" />
                <Navbar title="Admin Placement Overview" userRole="admin" />
                <div className="container" style={{ marginLeft: "260px", paddingTop: "90px" }}>
                    <div className="d-flex justify-content-center align-items-center vh-50 py-5">
                        <div className="spinner-border text-danger" role="status">
                            <span className="visually-hidden">Loading admin portal...</span>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    const {
        total_students,
        total_faculty,
        pending_faculty_approvals,
        today_interviews,
        completed_interviews,
        average_rating
    } = stats || {};

    return (
        <>
            <Sidebar activeRole="admin" />
            <Navbar title="Admin Placement Overview" userRole="admin" />

            <div className="container-fluid animate-fade-in" style={{ marginLeft: "260px", paddingTop: "90px", paddingRight: "30px", maxWidth: "calc(100% - 260px)" }}>
                
                {/* Hero Executive Banner */}
                <div className="card border-0 rounded-4 p-4 text-white mb-4 shadow-sm" style={{ background: "linear-gradient(135deg, #881337 0%, #be123c 60%, #fb7185 100%)" }}>
                    <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
                        <div>
                            <span className="badge bg-white text-danger px-3 py-1.5 rounded-pill fw-bold mb-2 shadow-2xs">
                                System Administrator Portal
                            </span>
                            <h2 className="fw-bold m-0 text-white">Admin Executive Control Center 🛡️</h2>
                            <p className="text-white-50 m-0 mt-1">
                                System administration, faculty registration approvals, student roster oversight, and placement broadcasts.
                            </p>
                        </div>
                        <div className="d-flex gap-2">
                            <button
                                className="btn btn-light text-danger fw-bold rounded-pill px-4 shadow-sm"
                                onClick={() => navigate("/admin/faculty-approvals")}
                            >
                                <FaUserCheck className="me-1.5" /> Faculty Queue ({pending_faculty_approvals || 0})
                            </button>
                        </div>
                    </div>
                </div>

                {/* Top Metrics Cards Grid */}
                <div className="row g-3 mb-4">
                    <div className="col-lg-3 col-md-6">
                        <div className="card border-0 rounded-4 p-3.5 bg-white h-100 shadow-sm border border-light-subtle">
                            <div className="d-flex align-items-center justify-content-between">
                                <div>
                                    <span className="text-secondary small fw-bold text-uppercase tracking-wider">Total Students</span>
                                    <h2 className="fw-bold mb-0 text-dark mt-1" style={{ fontSize: "2.2rem" }}>{total_students || 0}</h2>
                                    <span className="badge bg-primary-subtle text-primary mt-1.5 small fw-semibold">Registered Roster</span>
                                </div>
                                <div className="p-3 bg-primary bg-opacity-10 text-primary rounded-4 shadow-2xs">
                                    <FaUserGraduate className="fs-3" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-lg-3 col-md-6">
                        <div className="card border-0 rounded-4 p-3.5 bg-white h-100 shadow-sm border border-light-subtle">
                            <div className="d-flex align-items-center justify-content-between">
                                <div>
                                    <span className="text-secondary small fw-bold text-uppercase tracking-wider">Active Faculty</span>
                                    <h2 className="fw-bold mb-0 text-dark mt-1" style={{ fontSize: "2.2rem" }}>{total_faculty || 0}</h2>
                                    <span className="badge bg-success-subtle text-success mt-1.5 small fw-semibold">Approved Instructors</span>
                                </div>
                                <div className="p-3 bg-success bg-opacity-10 text-success rounded-4 shadow-2xs">
                                    <FaChalkboardTeacher className="fs-3" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-lg-3 col-md-6">
                        <div className="card border-0 rounded-4 p-3.5 bg-white h-100 shadow-sm border border-light-subtle">
                            <div className="d-flex align-items-center justify-content-between">
                                <div>
                                    <span className="text-secondary small fw-bold text-uppercase tracking-wider">Pending Approvals</span>
                                    <h2 className="fw-bold mb-0 text-dark mt-1" style={{ fontSize: "2.2rem" }}>{pending_faculty_approvals || 0}</h2>
                                    <span className="badge bg-danger-subtle text-danger mt-1.5 small fw-semibold">Faculty Review Queue</span>
                                </div>
                                <div className="p-3 bg-danger bg-opacity-10 text-danger rounded-4 shadow-2xs">
                                    <FaUserCheck className="fs-3" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-lg-3 col-md-6">
                        <div className="card border-0 rounded-4 p-3.5 bg-white h-100 shadow-sm border border-light-subtle">
                            <div className="d-flex align-items-center justify-content-between">
                                <div>
                                    <span className="text-secondary small fw-bold text-uppercase tracking-wider">Average Rating</span>
                                    <h2 className="fw-bold mb-0 text-dark mt-1" style={{ fontSize: "2.2rem" }}>{average_rating || "4.0"} <span className="fs-6 text-warning">⭐</span></h2>
                                    <span className="badge bg-warning-subtle text-warning mt-1.5 small fw-semibold">Overall Evaluation Score</span>
                                </div>
                                <div className="p-3 bg-warning bg-opacity-10 text-warning rounded-4 shadow-2xs">
                                    <FaStar className="fs-3" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Row */}
                <div className="row g-4 mb-5">
                    
                    {/* Left: Progress Summary */}
                    <div className="col-lg-7">
                        <div className="card border-0 rounded-4 p-4 bg-white shadow-sm border border-light-subtle h-100">
                            <h5 className="fw-bold mb-3 text-dark pb-2 border-bottom d-flex align-items-center gap-2">
                                <FaChartLine className="text-primary" /> Placement Mock Interview Progress
                            </h5>
                            <div className="row g-3 text-center my-auto">
                                <div className="col-6">
                                    <div className="p-4 bg-light rounded-4 border border-light-subtle">
                                        <span className="text-secondary small fw-bold d-block text-uppercase mb-1">Today's Scheduled Interviews</span>
                                        <h2 className="fw-bold text-dark m-0" style={{ fontSize: "2.5rem" }}>{today_interviews || 0}</h2>
                                        <span className="badge bg-primary-subtle text-primary mt-2">Active Today</span>
                                    </div>
                                </div>
                                <div className="col-6">
                                    <div className="p-4 bg-light rounded-4 border border-light-subtle">
                                        <span className="text-secondary small fw-bold d-block text-uppercase mb-1">Total Completed Interviews</span>
                                        <h2 className="fw-bold text-success m-0" style={{ fontSize: "2.5rem" }}>{completed_interviews || 0}</h2>
                                        <span className="badge bg-success-subtle text-success mt-2">Evaluation Finalized</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Quick Actions */}
                    <div className="col-lg-5">
                        <div className="card border-0 rounded-4 p-4 bg-white shadow-sm border border-light-subtle h-100">
                            <h5 className="fw-bold mb-3 text-dark pb-2 border-bottom d-flex align-items-center gap-2">
                                <span className="text-warning fs-5">⚡</span> Admin Management Portal
                            </h5>
                            <div className="d-flex flex-column gap-3">

                                {/* Action 1: Pending Approvals */}
                                <div
                                    className="p-3.5 rounded-4 border bg-white border-light-subtle cursor-pointer shadow-2xs hover-lift d-flex align-items-center justify-content-between w-100"
                                    style={{ cursor: "pointer", transition: "all 0.2s ease" }}
                                    onClick={() => navigate("/admin/faculty-approvals")}
                                >
                                    <div className="d-flex align-items-center gap-3">
                                        <FaUserCheck className="text-danger fs-4 flex-shrink-0" />
                                        <div>
                                            <h6 className="fw-bold text-dark m-0 mb-1" style={{ fontSize: "0.95rem" }}>
                                                Pending Faculty Approvals ({pending_faculty_approvals || 0})
                                            </h6>
                                            <p className="text-muted small m-0" style={{ fontSize: "0.825rem" }}>Review & approve new faculty requests</p>
                                        </div>
                                    </div>
                                    <FaArrowRight className="text-danger fs-5 flex-shrink-0 ms-2" />
                                </div>

                                {/* Action 2: Student Roster */}
                                <div
                                    className="p-3.5 rounded-4 border bg-white border-light-subtle cursor-pointer shadow-2xs hover-lift d-flex align-items-center justify-content-between w-100"
                                    style={{ cursor: "pointer", transition: "all 0.2s ease" }}
                                    onClick={() => navigate("/admin/students")}
                                >
                                    <div className="d-flex align-items-center gap-3">
                                        <FaUserGraduate className="text-primary fs-4 flex-shrink-0" />
                                        <div>
                                            <h6 className="fw-bold text-dark m-0 mb-1" style={{ fontSize: "0.95rem" }}>Student Roster & Resumes</h6>
                                            <p className="text-muted small m-0" style={{ fontSize: "0.825rem" }}>View full student list & PDF resumes</p>
                                        </div>
                                    </div>
                                    <FaArrowRight className="text-primary fs-5 flex-shrink-0 ms-2" />
                                </div>

                                {/* Action 3: Broadcast Notification */}
                                <div
                                    className="p-3.5 rounded-4 border bg-white border-light-subtle cursor-pointer shadow-2xs hover-lift d-flex align-items-center justify-content-between w-100"
                                    style={{ cursor: "pointer", transition: "all 0.2s ease" }}
                                    onClick={() => navigate("/admin/broadcast")}
                                >
                                    <div className="d-flex align-items-center gap-3">
                                        <FaBullhorn className="text-warning fs-4 flex-shrink-0" />
                                        <div>
                                            <h6 className="fw-bold text-dark m-0 mb-1" style={{ fontSize: "0.95rem" }}>Broadcast System Alert</h6>
                                            <p className="text-muted small m-0" style={{ fontSize: "0.825rem" }}>Send global announcements to all users</p>
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

export default AdminDashboard;
