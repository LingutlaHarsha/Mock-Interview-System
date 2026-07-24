import { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import { getBookedStudents, submitFeedback } from "../../services/facultyService";
import {
    FaCalendarCheck, FaUserGraduate, FaClock, FaVideo, FaMapMarkerAlt,
    FaStar, FaFilePdf, FaCheckCircle, FaExclamationCircle, FaUser, FaGraduationCap
} from "react-icons/fa";

function FacultyUpcomingInterviews() {
    const [upcoming, setUpcoming] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [viewingStudent, setViewingStudent] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [msg, setMsg] = useState({ type: "", text: "" });

    const [evalForm, setEvalForm] = useState({
        rating: 4,
        technical: 4,
        communication: 4,
        problem_solving: 4,
        confidence: 4,
        body_language: 4,
        comments: "",
        strengths: "",
        improvements: "",
        recommendation: "Ready",
    });

    useEffect(() => {
        loadData();
    }, []);

    const isInterviewEnded = (slot) => {
        if (!slot || !slot.interview_date) return false;
        try {
            const todayStr = new Date().toISOString().split('T')[0];
            if (slot.interview_date < todayStr) return true;
            if (slot.interview_date > todayStr) return false;

            // Today: check if time has passed (+ 30 mins window)
            if (slot.interview_time) {
                const now = new Date();
                const [hours, minutes] = slot.interview_time.split(':').map(Number);
                const slotEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, (minutes || 0) + 30);
                return now >= slotEnd;
            }
            return true;
        } catch (e) {
            return false;
        }
    };

    const loadData = async () => {
        try {
            setLoading(true);
            const res = await getBookedStudents();
            // Filter accepted bookings (status === 'Booked') AND not yet evaluated (!has_feedback)
            const acceptedNotEvaluated = res.data.filter(b =>
                (b.status === 'Booked') && !b.has_feedback && b.status !== 'Completed'
            );
            setUpcoming(acceptedNotEvaluated);
        } catch (error) {
            console.error("Failed to load faculty upcoming interviews", error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenEvalModal = (booking) => {
        setSelectedBooking(booking);
        setEvalForm({
            rating: 4,
            technical: 4,
            communication: 4,
            problem_solving: 4,
            confidence: 4,
            body_language: 4,
            comments: "",
            strengths: "",
            improvements: "",
            recommendation: "Ready",
        });
    };

    const handleEvalChange = (e) => {
        setEvalForm({ ...evalForm, [e.target.name]: e.target.value });
    };

    const handleSubmitEvaluation = async (e) => {
        e.preventDefault();
        if (!selectedBooking) return;

        try {
            setSubmitting(true);
            setMsg({ type: "", text: "" });
            await submitFeedback({
                booking: selectedBooking.id,
                rating: parseInt(evalForm.rating),
                technical_skills_score: parseInt(evalForm.technical),
                communication_score: parseInt(evalForm.communication),
                problem_solving_score: parseInt(evalForm.problem_solving),
                confidence_score: parseInt(evalForm.confidence),
                body_language_score: parseInt(evalForm.body_language),
                comments: evalForm.comments,
                strengths: evalForm.strengths,
                improvements: evalForm.improvements,
                recommendation: evalForm.recommendation,
            });

            setMsg({ type: "success", text: "Feedback submitted successfully! Interview evaluated and archived." });
            setSelectedBooking(null);
            loadData();
        } catch (error) {
            console.error(error);
            setMsg({ type: "danger", text: "Failed to submit evaluation feedback." });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div style={{ minHeight: "100vh", backgroundColor: "#f8fafc", paddingBottom: "40px" }}>
            <Sidebar activeRole="faculty" />
            <Navbar title="Upcoming Accepted Interviews" userRole="faculty" />

            <div className="container-fluid animate-fade-in" style={{ marginLeft: "260px", paddingTop: "90px", paddingRight: "30px", maxWidth: "calc(100% - 260px)", minHeight: "calc(100vh - 90px)" }}>
                <div className="card shadow-lg border-0 rounded-4 bg-white p-4">

                    <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 pb-3 border-bottom">
                        <div>
                            <h4 className="fw-bold m-0 text-dark">
                                <FaCalendarCheck className="text-success me-2" /> Faculty Upcoming Accepted Interviews
                            </h4>
                            <p className="text-muted small m-0">View all accepted student interview bookings. Give feedback after the interview time ends to complete evaluation.</p>
                        </div>
                        <span className="badge bg-success-subtle text-success border border-success-subtle px-3 py-2 rounded-pill fw-bold">
                            {upcoming.length} Accepted {upcoming.length === 1 ? 'Interview' : 'Interviews'}
                        </span>
                    </div>

                    {msg.text && (
                        <div className={`alert alert-${msg.type} py-2 px-3 mb-4 small fw-semibold rounded-3 d-flex align-items-center justify-content-between`}>
                            <div>
                                {msg.type === "success" ? <FaCheckCircle className="me-2" /> : <FaExclamationCircle className="me-2" />}
                                {msg.text}
                            </div>
                            <button type="button" className="btn-close" onClick={() => setMsg({ type: "", text: "" })}></button>
                        </div>
                    )}

                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-success" role="status">
                                <span className="visually-hidden">Loading accepted interviews...</span>
                            </div>
                        </div>
                    ) : upcoming.length === 0 ? (
                        <div className="text-center py-5 text-muted">
                            <FaCalendarCheck className="display-4 text-secondary mb-3" />
                            <h5>No Pending Accepted Interviews</h5>
                            <p className="small">Once you accept student interview requests, they will appear here until feedback is submitted.</p>
                        </div>
                    ) : (
                        <div className="row g-4">
                            {upcoming.map(b => {
                                const slot = b.interview_slot_details || {};
                                const prof = b.student_profile || {};
                                const ended = isInterviewEnded(slot);

                                return (
                                    <div key={b.id} className="col-md-6">
                                        <div className="card shadow-sm border border-success-subtle rounded-4 h-100 p-4 bg-white position-relative d-flex flex-column justify-content-between">
                                            <div>
                                                <div className="d-flex justify-content-between align-items-start mb-3">
                                                    <div>
                                                        <h5 className="fw-bold text-success mb-1">{slot.title || "Mock Interview"}</h5>
                                                        <div className="small text-dark fw-bold d-flex align-items-center gap-1">
                                                            <FaUserGraduate className="text-primary" /> {b.student_name} ({b.student_email})
                                                        </div>
                                                    </div>
                                                    <span className="badge bg-success rounded-pill px-3 py-2 fw-semibold">
                                                        Accepted ✅
                                                    </span>
                                                </div>

                                                <div className="bg-light p-3 rounded-3 mb-3 small">
                                                    <div className="row g-2">
                                                        <div className="col-6">
                                                            <div className="text-muted">Student Details</div>
                                                            <div className="fw-bold text-dark">{prof.branch || "General"} | {prof.year ? `${prof.year} Year` : 'Student'}</div>
                                                            {prof.roll_number && <div className="extra-small text-secondary">Roll: {prof.roll_number}</div>}
                                                        </div>
                                                        <div className="col-6">
                                                            <div className="text-muted">Interview Schedule</div>
                                                            <div className="fw-bold text-dark">{slot.interview_date} at {slot.interview_time}</div>
                                                            <span className={`badge ${slot.mode === 'Online' ? 'bg-info' : 'bg-secondary'} me-1`}>{slot.mode}</span>
                                                        </div>
                                                        <div className="col-12 mt-2">
                                                            <div className="text-muted">Venue / Google Meet Link</div>
                                                            <div className="fw-bold text-truncate" title={slot.venue_or_link}>
                                                                {slot.mode === 'Online' ? <FaVideo className="me-1 text-info" /> : <FaMapMarkerAlt className="me-1 text-danger" />}
                                                                {slot.venue_or_link || "N/A"}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="pt-2 border-top d-flex gap-2 align-items-center">
                                                {b.student_resume ? (
                                                    <a
                                                        href={b.student_resume.startsWith('http') ? b.student_resume : `http://127.0.0.1:8000${b.student_resume}`}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="btn btn-outline-secondary btn-sm rounded-pill px-3 fw-semibold"
                                                    >
                                                        <FaFilePdf className="me-1 text-danger" /> Resume
                                                    </a>
                                                ) : (
                                                    <span className="badge bg-light text-muted border">No Resume</span>
                                                )}

                                                <button
                                                    className="btn btn-outline-info btn-sm rounded-pill px-3 fw-semibold"
                                                    onClick={() => setViewingStudent(b)}
                                                >
                                                    <FaUser className="me-1" /> Student Details
                                                </button>

                                                <div className="ms-auto">
                                                    {ended ? (
                                                        <button
                                                            className="btn btn-success fw-bold rounded-pill px-4"
                                                            onClick={() => handleOpenEvalModal(b)}
                                                        >
                                                            <FaStar className="me-1" /> Evaluate & Give Feedback
                                                        </button>
                                                    ) : (
                                                        <button
                                                            className="btn btn-outline-success fw-bold rounded-pill px-3"
                                                            onClick={() => handleOpenEvalModal(b)}
                                                            title="You can evaluate after or during interview"
                                                        >
                                                            <FaStar className="me-1" /> Evaluate Student
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                </div>
            </div>

            {/* Evaluation Modal */}
            {selectedBooking && (
                <div className="modal show d-block" tabIndex="-1" style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", zIndex: 1050, backgroundColor: "rgba(0,0,0,0.5)" }}>
                        <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
                            <div className="modal-content rounded-4 border-0 shadow-lg">
                                <div className="modal-header bg-success text-white p-3">
                                    <h5 className="modal-title fw-bold">
                                        <FaStar className="me-2" /> Evaluate Student: {selectedBooking.student_name}
                                    </h5>
                                    <button type="button" className="btn-close btn-close-white" onClick={() => setSelectedBooking(null)}></button>
                                </div>
                                <form onSubmit={handleSubmitEvaluation}>
                                    <div className="modal-body p-4" style={{ maxHeight: "65vh", overflowY: "auto" }}>

                                        <div className="row g-3 mb-3">
                                            <div className="col-md-4">
                                                <label className="form-label fw-bold small text-secondary">Overall Score (1 - 5 ⭐)</label>
                                                <select className="form-select fw-bold text-success" name="rating" value={evalForm.rating} onChange={handleEvalChange}>
                                                    {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} ⭐</option>)}
                                                </select>
                                            </div>
                                            <div className="col-md-4">
                                                <label className="form-label fw-bold small text-secondary">Technical Skills (1 - 5 ⭐)</label>
                                                <select className="form-select" name="technical" value={evalForm.technical} onChange={handleEvalChange}>
                                                    {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} ⭐</option>)}
                                                </select>
                                            </div>
                                            <div className="col-md-4">
                                                <label className="form-label fw-bold small text-secondary">Communication (1 - 5 ⭐)</label>
                                                <select className="form-select" name="communication" value={evalForm.communication} onChange={handleEvalChange}>
                                                    {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} ⭐</option>)}
                                                </select>
                                            </div>
                                            <div className="col-md-4">
                                                <label className="form-label fw-bold small text-secondary">Problem Solving (1 - 5 ⭐)</label>
                                                <select className="form-select" name="problem_solving" value={evalForm.problem_solving} onChange={handleEvalChange}>
                                                    {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} ⭐</option>)}
                                                </select>
                                            </div>
                                            <div className="col-md-4">
                                                <label className="form-label fw-bold small text-secondary">Confidence (1 - 5 ⭐)</label>
                                                <select className="form-select" name="confidence" value={evalForm.confidence} onChange={handleEvalChange}>
                                                    {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} ⭐</option>)}
                                                </select>
                                            </div>
                                            <div className="col-md-4">
                                                <label className="form-label fw-bold small text-secondary">Placement Readiness</label>
                                                <select className="form-select fw-semibold" name="recommendation" value={evalForm.recommendation} onChange={handleEvalChange}>
                                                    <option value="Ready">Ready for Placement</option>
                                                    <option value="Needs Work">Needs Work / Improvement</option>
                                                    <option value="Not Ready">Not Ready Currently</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label fw-bold small text-secondary">Key Strengths</label>
                                            <textarea className="form-control" rows="2" name="strengths" placeholder="Highlight student's core strengths..." value={evalForm.strengths} onChange={handleEvalChange}></textarea>
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label fw-bold small text-secondary">Areas for Improvement</label>
                                            <textarea className="form-control" rows="2" name="improvements" placeholder="Areas student should work on..." value={evalForm.improvements} onChange={handleEvalChange}></textarea>
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label fw-bold small text-secondary">Detailed Feedback & Remarks</label>
                                            <textarea className="form-control" rows="3" name="comments" placeholder="Provide overall constructive feedback..." value={evalForm.comments} onChange={handleEvalChange} required></textarea>
                                        </div>

                                    </div>
                                    <div className="modal-footer bg-light p-3">
                                        <button type="button" className="btn btn-secondary rounded-pill px-4" onClick={() => setSelectedBooking(null)}>Cancel</button>
                                        <button type="submit" className="btn btn-success fw-bold rounded-pill px-4" disabled={submitting}>
                                            {submitting ? "Submitting..." : "Submit Evaluation & Remove"}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

            {/* View Student Details Modal */}
            {viewingStudent && (
                <div className="modal show d-block" tabIndex="-1" style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", zIndex: 1050, backgroundColor: "rgba(0,0,0,0.5)" }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content rounded-4 border-0 shadow-lg">
                            <div className="modal-header bg-dark text-white p-3">
                                <h5 className="modal-title fw-bold">
                                    <FaGraduationCap className="text-primary me-2" /> Student Academic Profile
                                </h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setViewingStudent(null)}></button>
                            </div>
                            <div className="modal-body p-4">
                                <div className="d-flex align-items-center gap-3 mb-3 pb-3 border-bottom">
                                    <div className="p-3 bg-primary-subtle text-primary rounded-circle">
                                        <FaUserGraduate className="fs-2" />
                                    </div>
                                    <div>
                                        <h5 className="fw-bold text-dark m-0">{viewingStudent.student_name}</h5>
                                        <span className="text-muted small">{viewingStudent.student_email}</span>
                                    </div>
                                </div>

                                {viewingStudent.student_profile ? (
                                    <div className="row g-2 small">
                                        <div className="col-6"><strong>Roll Number:</strong> {viewingStudent.student_profile.roll_number || 'N/A'}</div>
                                        <div className="col-6"><strong>Branch:</strong> {viewingStudent.student_profile.branch || 'N/A'}</div>
                                        <div className="col-6"><strong>Year:</strong> {viewingStudent.student_profile.year ? `${viewingStudent.student_profile.year} Year` : 'N/A'}</div>
                                        <div className="col-6"><strong>CGPA:</strong> {viewingStudent.student_profile.cgpa || 'N/A'}</div>
                                        <div className="col-6"><strong>Phone:</strong> {viewingStudent.student_profile.phone || 'N/A'}</div>
                                        <div className="col-12 mt-2">
                                            <strong>Skills:</strong> {viewingStudent.student_profile.skills || 'None specified'}
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-muted small">Student profile details not provided.</p>
                                )}
                            </div>
                            <div className="modal-footer bg-light p-3">
                                <button className="btn btn-secondary rounded-pill px-4" onClick={() => setViewingStudent(null)}>Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default FacultyUpcomingInterviews;
