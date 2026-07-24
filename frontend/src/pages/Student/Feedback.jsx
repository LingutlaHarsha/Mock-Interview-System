import { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import { getStudentFeedback } from "../../services/studentService";
import { FaStar, FaUserTie, FaCheckCircle, FaExclamationCircle, FaRegStar } from "react-icons/fa";

function Feedback() {
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const res = await getStudentFeedback();
            setFeedbacks(res.data);
        } catch (error) {
            console.error("Failed to load feedbacks", error);
        } finally {
            setLoading(false);
        }
    };

    const renderStars = (score) => {
        return (
            <div className="text-warning d-inline-flex gap-1">
                {[1, 2, 3, 4, 5].map(num => (
                    num <= score ? <FaStar key={num} /> : <FaRegStar key={num} className="text-muted opacity-50" />
                ))}
            </div>
        );
    };

    return (
        <>
            <Sidebar activeRole="student" />
            <Navbar title="Mock Interview Evaluations" userRole="student" />

            <div className="container-fluid" style={{ marginLeft: "260px", paddingTop: "90px", paddingRight: "30px", maxWidth: "calc(100% - 260px)" }}>
                <div className="mb-4">
                    <h4 className="fw-bold text-dark mb-1">⭐ Faculty Evaluation Reports</h4>
                    <p className="text-muted small">Review faculty feedback, skill ratings, and placement readiness recommendations.</p>
                </div>

                {loading ? (
                    <div className="text-center py-5">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading feedback reports...</span>
                        </div>
                    </div>
                ) : feedbacks.length === 0 ? (
                    <div className="card shadow-sm border-0 rounded-4 p-5 text-center bg-white text-muted">
                        <FaStar className="display-4 text-secondary mb-2" />
                        <h6>No interview evaluations available yet.</h6>
                        <p className="small mb-0">Attend scheduled mock interviews to receive evaluation feedback from faculty panelists.</p>
                    </div>
                ) : (
                    <div className="row g-4">
                        {feedbacks.map(f => {
                            const b = f.booking_details || {};
                            const slot = b.interview_slot_details || {};
                            return (
                                <div key={f.id} className="col-12">
                                    <div className="card shadow-lg border-0 rounded-4 bg-white overflow-hidden">
                                        <div className="card-header bg-dark text-white p-3 d-flex justify-content-between align-items-center">
                                            <div>
                                                <h5 className="mb-0 fw-bold">{slot.title || "Mock Interview"}</h5>
                                                <span className="small text-white-50">Faculty Panel: {slot.faculty_name || "Faculty Member"} | Date: {slot.interview_date}</span>
                                            </div>

                                            <span className={`badge px-3 py-2 fs-6 rounded-pill ${
                                                f.recommendation === 'Ready' ? 'bg-success' : f.recommendation === 'Needs Practice' ? 'bg-warning text-dark' : 'bg-danger'
                                            }`}>
                                                Readiness: {f.recommendation}
                                            </span>
                                        </div>

                                        <div className="card-body p-4">
                                            <div className="row g-4">
                                                {/* Metrics breakdown */}
                                                <div className="col-md-6 border-end">
                                                    <h6 className="fw-bold text-secondary mb-3">Skill Performance Ratings</h6>

                                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                                        <span className="small fw-semibold">Overall Score:</span>
                                                        {renderStars(f.rating)}
                                                    </div>

                                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                                        <span className="small fw-semibold">Technical Knowledge:</span>
                                                        {renderStars(f.technical)}
                                                    </div>

                                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                                        <span className="small fw-semibold">Communication Skills:</span>
                                                        {renderStars(f.communication)}
                                                    </div>

                                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                                        <span className="small fw-semibold">Problem Solving:</span>
                                                        {renderStars(f.problem_solving)}
                                                    </div>

                                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                                        <span className="small fw-semibold">Confidence Level:</span>
                                                        {renderStars(f.confidence)}
                                                    </div>

                                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                                        <span className="small fw-semibold">Body Language & Posture:</span>
                                                        {renderStars(f.body_language)}
                                                    </div>
                                                </div>

                                                {/* Comments & Remarks */}
                                                <div className="col-md-6">
                                                    <h6 className="fw-bold text-secondary mb-3">Faculty Remarks & Feedback</h6>

                                                    <div className="mb-3">
                                                        <span className="fw-bold text-success small d-block mb-1">💪 Key Strengths:</span>
                                                        <p className="bg-light p-2 rounded-3 small mb-0 text-dark">{f.strengths || "No specific strengths listed."}</p>
                                                    </div>

                                                    <div className="mb-3">
                                                        <span className="fw-bold text-danger small d-block mb-1">📈 Areas for Improvement:</span>
                                                        <p className="bg-light p-2 rounded-3 small mb-0 text-dark">{f.improvements || "No specific improvements listed."}</p>
                                                    </div>

                                                    <div>
                                                        <span className="fw-bold text-primary small d-block mb-1">💬 Detailed Comments:</span>
                                                        <p className="bg-light p-2 rounded-3 small mb-0 text-dark">{f.comments || "No additional comments."}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </>
    );
}

export default Feedback;