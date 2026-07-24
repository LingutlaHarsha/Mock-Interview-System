import { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import { getStudentAttempts } from "../../services/codingService";
import {
    FaLaptopCode, FaCode, FaClock, FaCheckCircle, FaTimesCircle,
    FaStar, FaEye, FaTerminal, FaFileCode
} from "react-icons/fa";

function StudentCodingAttempts() {
    const [attempts, setAttempts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedAttempt, setSelectedAttempt] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const res = await getStudentAttempts();
            setAttempts(res.data);
        } catch (error) {
            console.error("Failed to load student attempts", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Sidebar activeRole="student" />
            <Navbar title="My Coding Attempts" userRole="student" />

            <div className="container-fluid animate-fade-in" style={{ marginLeft: "260px", paddingTop: "90px", paddingRight: "30px", maxWidth: "calc(100% - 260px)" }}>
                <div className="card shadow-lg border-0 rounded-4 bg-white p-4">
                    
                    {/* Header Banner */}
                    <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 pb-3 border-bottom gap-3">
                        <div>
                            <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 px-3 py-1.5 rounded-pill fw-bold mb-2">
                                Submission History & Metrics
                            </span>
                            <h3 className="fw-bold m-0 text-dark d-flex align-items-center gap-2">
                                <FaLaptopCode className="text-primary" /> My Technical Coding Attempts
                            </h3>
                            <p className="text-muted small m-0 mt-1">Review all your previous coding submissions, scores, test case results, and source code.</p>
                        </div>
                        <span className="badge bg-primary text-white px-3.5 py-2 rounded-pill fw-bold fs-6 shadow-2xs">
                            {attempts.length} Total {attempts.length === 1 ? 'Submission' : 'Submissions'}
                        </span>
                    </div>

                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading attempts...</span>
                            </div>
                        </div>
                    ) : attempts.length === 0 ? (
                        <div className="text-center py-5 text-muted">
                            <FaLaptopCode className="display-4 text-secondary mb-3 opacity-50" />
                            <h5 className="fw-bold text-dark">No Coding Attempts Found</h5>
                            <p className="small text-muted">Go to Technical Assessments and participate in a contest to see your results here.</p>
                        </div>
                    ) : (
                        /* Exactly 3 Cards Per Row Grid Layout (col-lg-4) */
                        <div className="row g-4">
                            {attempts.map(a => {
                                const isAccepted = a.status === 'Accepted';
                                const isPartial = a.status === 'Partial';
                                const topBorderColor = isAccepted ? '#10b981' : isPartial ? '#f59e0b' : '#ef4444';

                                return (
                                    <div key={a.id} className="col-lg-4 col-md-6">
                                        <div 
                                            className="card border-0 rounded-4 shadow-sm h-100 p-4 bg-white hover-lift d-flex flex-column justify-content-between"
                                            style={{
                                                borderTop: `5px solid ${topBorderColor}`,
                                                transition: "all 0.25s ease-in-out"
                                            }}
                                        >
                                            <div>
                                                {/* Assessment Title & Code Language Pill */}
                                                <div className="d-flex justify-content-between align-items-center mb-3">
                                                    <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 px-3 py-1 rounded-pill fw-bold text-truncate" style={{ maxWidth: "180px" }} title={a.assessment_title}>
                                                        {a.assessment_title || "Coding Test"}
                                                    </span>
                                                    <span className="badge bg-dark text-info px-3 py-1 rounded-pill font-monospace fw-bold">
                                                        <FaTerminal className="me-1" />{a.language}
                                                    </span>
                                                </div>

                                                {/* Question Title */}
                                                <h5 className="fw-bold text-dark mb-3 text-truncate-2" style={{ minHeight: "2.8rem", lineHeight: "1.3" }} title={a.question_title}>
                                                    {a.question_title}
                                                </h5>

                                                {/* Status Badge & Attempt Number */}
                                                <div className="d-flex justify-content-between align-items-center mb-3">
                                                    <span className={`badge px-3 py-1.5 rounded-pill fw-bold ${isAccepted ? 'bg-success text-white shadow-2xs' : isPartial ? 'bg-warning text-dark shadow-2xs' : 'bg-danger text-white shadow-2xs'}`}>
                                                        {isAccepted ? 'Accepted ✅' : isPartial ? 'Partial Score ⚠️' : (a.status || 'Wrong Answer ❌')}
                                                    </span>
                                                    <span className="badge bg-light text-secondary border px-2.5 py-1 rounded-pill extra-small fw-bold">
                                                        Attempt #{a.attempt_number}
                                                    </span>
                                                </div>

                                                {/* Score Metric Card */}
                                                <div className="p-3 bg-light rounded-4 border border-light-subtle mb-4">
                                                    <div className="d-flex justify-content-between align-items-center">
                                                        <div>
                                                            <span className="text-secondary extra-small fw-bold d-block text-uppercase mb-0.5">Total Score</span>
                                                            <span className={`fs-4 fw-bold ${a.score > 0 ? 'text-success' : 'text-danger'}`}>
                                                                {a.score} <span className="fs-6 text-muted">/ {a.max_marks}</span>
                                                            </span>
                                                        </div>
                                                        <div className="text-end border-start ps-3">
                                                            <span className="text-secondary extra-small fw-bold d-block text-uppercase mb-0.5">Test Cases</span>
                                                            <span className="fw-bold text-dark fs-6">
                                                                {a.passed_test_cases} / {a.total_test_cases} Passed
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Footer Timestamp & View Code Action */}
                                            <div className="pt-2 border-top">
                                                <div className="text-muted extra-small mb-3 d-flex align-items-center gap-1.5">
                                                    <FaClock className="text-secondary" />
                                                    <span>Submitted on {new Date(a.submitted_at).toLocaleDateString()} at {new Date(a.submitted_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                                <button
                                                    className="btn btn-primary w-100 fw-bold rounded-pill py-2.5 shadow-sm d-flex align-items-center justify-content-center gap-2"
                                                    onClick={() => setSelectedAttempt(a)}
                                                >
                                                    <FaFileCode /> View Submitted Source Code
                                                </button>
                                            </div>

                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                </div>

                {/* View Code Modal */}
                {selectedAttempt && (
                    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
                        <div className="modal-dialog modal-lg modal-dialog-centered">
                            <div className="modal-content rounded-4 border-0 shadow-lg">
                                <div className="modal-header bg-dark text-white p-3.5">
                                    <h5 className="modal-title fw-bold d-flex align-items-center gap-2">
                                        <FaCode className="text-info" /> {selectedAttempt.question_title}
                                    </h5>
                                    <button type="button" className="btn-close btn-close-white" onClick={() => setSelectedAttempt(null)}></button>
                                </div>
                                <div className="modal-body p-4">
                                    <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 bg-light p-3 rounded-3 border gap-2">
                                        <div className="d-flex align-items-center gap-2">
                                            <span className="badge bg-dark font-monospace px-3 py-1.5">Language: {selectedAttempt.language}</span>
                                            <span className="fw-bold text-dark">Score: {selectedAttempt.score}/{selectedAttempt.max_marks}</span>
                                            <span className="text-secondary small">({selectedAttempt.passed_test_cases}/{selectedAttempt.total_test_cases} Test Cases Passed)</span>
                                        </div>
                                        <span className={`badge rounded-pill px-3 py-1.5 fw-bold ${selectedAttempt.status === 'Accepted' ? 'bg-success' : 'bg-danger'}`}>
                                            {selectedAttempt.status}
                                        </span>
                                    </div>

                                    <h6 className="fw-bold text-dark mb-2">Submitted Source Code</h6>
                                    <pre className="bg-dark text-white p-3.5 rounded-3 font-monospace small mb-3" style={{ maxHeight: "360px", overflowY: "auto" }}>
                                        <code>{selectedAttempt.code}</code>
                                    </pre>
                                </div>
                                <div className="modal-footer bg-light p-3">
                                    <button className="btn btn-secondary rounded-pill px-4 fw-bold" onClick={() => setSelectedAttempt(null)}>Close</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </>
    );
}

export default StudentCodingAttempts;
