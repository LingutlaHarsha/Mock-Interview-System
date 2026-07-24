import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import { getStudentAssessments } from "../../services/codingService";
import {
    FaLaptopCode, FaCode, FaClock, FaCheckCircle, FaExclamationCircle,
    FaPlay, FaInfoCircle, FaTrophy, FaRedo, FaEye, FaLock
} from "react-icons/fa";

function StudentCodingAssessments() {
    const navigate = useNavigate();
    const [assessments, setAssessments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [msg, setMsg] = useState({ type: "", text: "" });

    // Pre-start modal state
    const [selectedAssessmentForModal, setSelectedAssessmentForModal] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const res = await getStudentAssessments();
            setAssessments(res.data);
        } catch (error) {
            console.error("Failed to load student assessments", error);
            setMsg({ type: "danger", text: "Failed to load coding assessments." });
        } finally {
            setLoading(false);
        }
    };

    const handleOpenStartModal = (assessment) => {
        setSelectedAssessmentForModal(assessment);
    };

    const handleConfirmStart = () => {
        if (!selectedAssessmentForModal) return;
        const id = selectedAssessmentForModal.id;
        const hasAttempted = selectedAssessmentForModal.user_attempts > 0;
        setSelectedAssessmentForModal(null);
        if (hasAttempted) {
            navigate(`/student/coding-assessments/${id}/solve?new_attempt=true`);
        } else {
            navigate(`/student/coding-assessments/${id}/solve`);
        }
    };

    return (
        <div style={{ minHeight: "100vh", backgroundColor: "#f8fafc", paddingBottom: "40px" }}>
            <Sidebar activeRole="student" />
            <Navbar title="Technical Coding Assessments" userRole="student" />

            <div className="container-fluid" style={{ marginLeft: "260px", paddingTop: "90px", paddingRight: "30px", maxWidth: "calc(100% - 260px)", minHeight: "calc(100vh - 90px)" }}>
                <div className="card shadow-lg border-0 rounded-4 bg-white p-4">
                    
                    {msg.text && (
                        <div className={`alert alert-${msg.type} py-2 px-3 mb-4 small fw-semibold rounded-3 d-flex align-items-center justify-content-between`}>
                            <div>{msg.text}</div>
                            <button type="button" className="btn-close" onClick={() => setMsg({ type: "", text: "" })}></button>
                        </div>
                    )}

                    <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 pb-3 border-bottom">
                        <div>
                            <h4 className="fw-bold m-0 text-dark">
                                <FaLaptopCode className="text-success me-2" /> Active Coding Assessments
                            </h4>
                            <p className="text-muted small m-0">Participate in LeetCode-style technical coding tests assigned by your faculty.</p>
                        </div>
                    </div>

                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-success" role="status">
                                <span className="visually-hidden">Loading assessments...</span>
                            </div>
                        </div>
                    ) : assessments.length === 0 ? (
                        <div className="text-center py-5 text-muted">
                            <FaLaptopCode className="display-4 text-secondary mb-3" />
                            <h5>No Technical Assessments Available</h5>
                            <p className="small">Check back later when faculty publishes a new coding assessment.</p>
                        </div>
                    ) : (
                        <div className="row g-4">
                            {assessments.map(a => {
                                const isExhausted = a.limit_reached || (a.allowed_attempts > 0 && a.user_attempts >= a.allowed_attempts);
                                const isRunning = !isExhausted && a.user_attempts > 0;
                                const isAvailable = !isExhausted && !isRunning;

                                return (
                                    <div key={a.id} className="col-md-6 col-lg-4">
                                        <div className="card shadow-sm border border-light-subtle rounded-4 h-100 p-4 bg-white position-relative d-flex flex-column">
                                            <div className="d-flex justify-content-between align-items-start mb-2">
                                                <span className={`badge rounded-pill ${a.difficulty === 'Easy' ? 'bg-success' : a.difficulty === 'Medium' ? 'bg-warning text-dark' : 'bg-danger'}`}>
                                                    {a.difficulty}
                                                </span>
                                                <span className={`badge rounded-pill ${
                                                    a.is_expired ? 'bg-secondary' : isExhausted ? 'bg-danger' : isRunning ? 'bg-warning text-dark' : 'bg-primary'
                                                }`}>
                                                    {a.is_expired ? 'Expired' : isExhausted ? 'Completed / Exhausted' : isRunning ? 'Running' : 'Available'}
                                                </span>
                                            </div>

                                            <h5 className="fw-bold text-dark mb-1">{a.title}</h5>
                                            <p className="text-muted small text-truncate-2 mb-3">{a.description || "No description provided."}</p>

                                            <div className="bg-light p-3 rounded-3 mb-3 small">
                                                <div className="d-flex justify-content-between mb-1">
                                                    <span className="text-muted">Faculty Assigned:</span>
                                                    <span className="fw-bold text-dark">{a.faculty_name}</span>
                                                </div>
                                                <div className="d-flex justify-content-between mb-1">
                                                    <span className="text-muted">Questions Count:</span>
                                                    <span className="fw-bold text-dark">{a.questions_count}</span>
                                                </div>
                                                <div className="d-flex justify-content-between mb-1">
                                                    <span className="text-muted">Max Marks:</span>
                                                    <span className="fw-bold text-success">{a.max_marks} pts</span>
                                                </div>
                                                <div className="d-flex justify-content-between mb-1">
                                                    <span className="text-muted">Duration:</span>
                                                    <span className="fw-bold text-dark">{a.duration_minutes ? `${a.duration_minutes} Mins` : "No Limit"}</span>
                                                </div>
                                                <div className="d-flex justify-content-between mb-1">
                                                    <span className="text-muted">Attempts Allowed / Used:</span>
                                                    <span className="fw-bold text-primary">{a.user_attempts} / {a.allowed_attempts === 0 ? 'Unlimited' : a.allowed_attempts}</span>
                                                </div>
                                                <div className="d-flex justify-content-between">
                                                    <span className="text-muted">Deadline:</span>
                                                    <span className="fw-bold text-danger"><FaClock className="me-1" />{a.deadline_date} ({a.deadline_time})</span>
                                                </div>
                                            </div>

                                            <div className="d-flex flex-wrap gap-1 mb-3">
                                                {(a.topics || []).map((t, idx) => (
                                                    <span key={idx} className="badge bg-primary-subtle text-primary border border-primary-subtle px-2 py-1 small rounded-pill">
                                                        {t}
                                                    </span>
                                                ))}
                                            </div>

                                            <div className="mt-auto pt-3 border-top text-center d-flex gap-2">
                                                {a.is_expired ? (
                                                    <button className="btn btn-secondary w-100 fw-bold rounded-pill" disabled>
                                                        Expired
                                                    </button>
                                                ) : isExhausted ? (
                                                    <button
                                                        className="btn btn-outline-primary w-100 fw-bold rounded-pill py-2"
                                                        onClick={() => {
                                                            if (a.latest_submission_id) {
                                                                navigate(`/student/coding-assessments/results/${a.latest_submission_id}`);
                                                            } else {
                                                                navigate("/student/coding-attempts");
                                                            }
                                                        }}
                                                    >
                                                        <FaEye className="me-2" /> View Result
                                                    </button>
                                                ) : (
                                                    <button
                                                        className="btn btn-success w-100 fw-bold rounded-pill py-2 shadow-sm"
                                                        onClick={() => handleOpenStartModal(a)}
                                                    >
                                                        {a.user_attempts > 0 ? (
                                                            <><FaRedo className="me-2" /> Attempt Again</>
                                                        ) : (
                                                            <><FaPlay className="me-2" /> Start Assessment</>
                                                        )}
                                                    </button>
                                                )}
                                            </div>

                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                </div>
            </div>

            {/* Pre-Start Confirmation Modal */}
            {selectedAssessmentForModal && (
                <div className="modal show d-block" tabIndex="-1" style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", zIndex: 1050, backgroundColor: "rgba(0,0,0,0.5)" }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content rounded-4 border-0 shadow-lg">
                            <div className="modal-header bg-success text-white p-3">
                                <h5 className="modal-title fw-bold">
                                    <FaInfoCircle className="me-2" /> Assessment Instructions & Details
                                </h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setSelectedAssessmentForModal(null)}></button>
                            </div>
                            <div className="modal-body p-4">
                                <h5 className="fw-bold text-dark mb-1">{selectedAssessmentForModal.title}</h5>
                                <p className="text-muted small mb-3">{selectedAssessmentForModal.description || "Read all instructions carefully before starting."}</p>

                                <div className="bg-light p-3 rounded-3 mb-3 border small">
                                    <div className="row g-2">
                                        <div className="col-6"><strong>Duration:</strong> {selectedAssessmentForModal.duration_minutes ? `${selectedAssessmentForModal.duration_minutes} Minutes` : "No Limit"}</div>
                                        <div className="col-6"><strong>Questions:</strong> {selectedAssessmentForModal.questions_count}</div>
                                        <div className="col-6"><strong>Maximum Marks:</strong> {selectedAssessmentForModal.max_marks} pts</div>
                                        <div className="col-6"><strong>Deadline:</strong> {selectedAssessmentForModal.deadline_date}</div>
                                        <div className="col-6"><strong>Allowed Attempts:</strong> {selectedAssessmentForModal.allowed_attempts === 0 ? 'Unlimited' : selectedAssessmentForModal.allowed_attempts}</div>
                                        <div className="col-6"><strong>Attempts Used:</strong> {selectedAssessmentForModal.user_attempts || 0}</div>
                                    </div>
                                </div>

                                <div className="alert alert-warning py-2 px-3 small rounded-3 m-0">
                                    <strong>⚠️ Submission Notice:</strong> Submitting your code will complete the active attempt session and evaluate your score.
                                </div>
                            </div>
                            <div className="modal-footer bg-light p-3">
                                <button className="btn btn-secondary rounded-pill px-4" onClick={() => setSelectedAssessmentForModal(null)}>Cancel</button>
                                <button className="btn btn-success fw-bold rounded-pill px-4" onClick={handleConfirmStart}>
                                    Start Assessment →
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}

export default StudentCodingAssessments;
