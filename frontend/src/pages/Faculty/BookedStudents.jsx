import { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import { getBookedStudents, submitFeedback, approveBooking, rejectBooking } from "../../services/facultyService";
import { getBackendUrl } from "../../services/api";
import { FaUsers, FaFilePdf, FaStar, FaCheckCircle, FaExclamationCircle, FaCheck, FaTimes, FaUser, FaGraduationCap, FaFilter, FaSortAmountDown } from "react-icons/fa";

function BookedStudents() {
    const [bookings, setBookings] = useState([]);
    const [filter, setFilter] = useState("all");
    const [sortBy, setSortBy] = useState("newest");
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

    const loadData = async () => {
        try {
            setLoading(true);
            const res = await getBookedStudents();
            setBookings(res.data);
        } catch (error) {
            console.error("Failed to load booked students", error);
        } finally {
            setLoading(false);
        }
    };

    const handleApproveRequest = async (id) => {
        try {
            setMsg({ type: "", text: "" });
            await approveBooking(id);
            setMsg({ type: "success", text: "Student interview request approved! The student can now attend the interview." });
            loadData();
        } catch (error) {
            console.error(error);
            setMsg({ type: "danger", text: "Failed to approve request." });
        }
    };

    const handleRejectRequest = async (id) => {
        try {
            setMsg({ type: "", text: "" });
            await rejectBooking(id);
            setMsg({ type: "warning", text: "Student interview request declined." });
            loadData();
        } catch (error) {
            console.error(error);
            setMsg({ type: "danger", text: "Failed to decline request." });
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

            setMsg({ type: "success", text: `Evaluation submitted successfully for ${selectedBooking.student_name}!` });
            setSelectedBooking(null);
            loadData();
        } catch (error) {
            console.error("Failed to submit feedback", error);
            const errDetail = error.response?.data?.detail || "Failed to submit evaluation.";
            setMsg({ type: "danger", text: errDetail });
        } finally {
            setSubmitting(false);
        }
    };

    // Filter & Sort Bookings
    let filteredBookings = [...bookings];

    if (filter === "pending") {
        filteredBookings = filteredBookings.filter(b => b.status === 'Pending');
    } else if (filter === "booked") {
        filteredBookings = filteredBookings.filter(b => b.status === 'Booked' && !b.has_feedback);
    } else if (filter === "evaluated") {
        filteredBookings = filteredBookings.filter(b => b.status === 'Completed' || b.has_feedback);
    } else if (filter === "declined") {
        filteredBookings = filteredBookings.filter(b => b.status === 'Rejected' || b.status === 'Cancelled');
    }

    filteredBookings.sort((a, b) => {
        if (sortBy === "name") {
            return (a.student_name || "").localeCompare(b.student_name || "");
        } else if (sortBy === "date") {
            return (a.interview_slot_details?.interview_date || "").localeCompare(b.interview_slot_details?.interview_date || "");
        }
        return b.id - a.id;
    });

    const pendingCount = bookings.filter(b => b.status === 'Pending').length;
    const bookedCount = bookings.filter(b => b.status === 'Booked' && !b.has_feedback).length;
    const evaluatedCount = bookings.filter(b => b.status === 'Completed' || b.has_feedback).length;
    const declinedCount = bookings.filter(b => b.status === 'Rejected' || b.status === 'Cancelled').length;

    return (
        <>
            <Sidebar activeRole="faculty" />
            <Navbar title="Student Interview Bookings" userRole="faculty" />

            <div className="container-fluid animate-fade-in" style={{ marginLeft: "260px", paddingTop: "90px", paddingRight: "30px", maxWidth: "calc(100% - 260px)" }}>
                <div className="card shadow-lg border-0 rounded-4 bg-white p-4">
                    
                    {msg.text && (
                        <div className={`alert alert-${msg.type} py-2 px-3 mb-4 small fw-semibold rounded-3 d-flex align-items-center justify-content-between`} role="alert">
                            <div>
                                {msg.type === "success" ? <FaCheckCircle className="me-2" /> : <FaExclamationCircle className="me-2" />}
                                {msg.text}
                            </div>
                            <button type="button" className="btn-close" onClick={() => setMsg({ type: "", text: "" })}></button>
                        </div>
                    )}

                    <div className="d-flex flex-wrap justify-content-between align-items-center mb-3">
                        <h5 className="fw-bold m-0 text-dark">
                            <FaUsers className="text-success me-2" /> Student Interview Requests & Bookings ({bookings.length})
                        </h5>
                    </div>

                    {/* Filter Tabs & Sort Controls */}
                    <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4 p-3 bg-light rounded-4">
                        <div className="d-flex flex-wrap align-items-center gap-2">
                            <span className="small fw-bold text-secondary me-2"><FaFilter /> Filter Status:</span>
                            <button
                                className={`btn btn-sm rounded-pill px-3 fw-semibold ${filter === 'all' ? 'btn-success' : 'btn-outline-secondary'}`}
                                onClick={() => setFilter('all')}
                            >
                                All ({bookings.length})
                            </button>
                            <button
                                className={`btn btn-sm rounded-pill px-3 fw-semibold ${filter === 'pending' ? 'btn-warning text-dark' : 'btn-outline-warning'}`}
                                onClick={() => setFilter('pending')}
                            >
                                Pending ({pendingCount})
                            </button>
                            <button
                                className={`btn btn-sm rounded-pill px-3 fw-semibold ${filter === 'booked' ? 'btn-primary' : 'btn-outline-primary'}`}
                                onClick={() => setFilter('booked')}
                            >
                                Approved ({bookedCount})
                            </button>
                            <button
                                className={`btn btn-sm rounded-pill px-3 fw-semibold ${filter === 'evaluated' ? 'btn-info text-white' : 'btn-outline-info'}`}
                                onClick={() => setFilter('evaluated')}
                            >
                                Evaluated ({evaluatedCount})
                            </button>
                            <button
                                className={`btn btn-sm rounded-pill px-3 fw-semibold ${filter === 'declined' ? 'btn-danger' : 'btn-outline-danger'}`}
                                onClick={() => setFilter('declined')}
                            >
                                Declined ({declinedCount})
                            </button>
                        </div>

                        <div className="d-flex align-items-center gap-2">
                            <span className="small fw-bold text-secondary"><FaSortAmountDown /> Sort By:</span>
                            <select
                                className="form-select form-select-sm rounded-pill px-3 fw-semibold"
                                style={{ width: "auto" }}
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                            >
                                <option value="newest">🆕 Newest Requests</option>
                                <option value="name">🔤 Student Name (A-Z)</option>
                                <option value="date">📅 Interview Date</option>
                            </select>
                        </div>
                    </div>

                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-success" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    ) : filteredBookings.length === 0 ? (
                        <p className="text-muted small py-4 text-center">No student interview bookings match your current filter.</p>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover align-middle">
                                <thead>
                                    <tr>
                                        <th>Student Details</th>
                                        <th>Interview Title</th>
                                        <th>Date & Time</th>
                                        <th>Resume</th>
                                        <th>Status</th>
                                        <th className="text-end">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredBookings.map(b => (
                                        <tr key={b.id}>
                                            <td>
                                                <div className="fw-bold text-dark">{b.student_name}</div>
                                                <button
                                                    className="btn btn-link p-0 text-primary small text-decoration-none"
                                                    onClick={() => setViewingStudent(b)}
                                                >
                                                    <FaUser className="me-1" /> View Full Profile
                                                </button>
                                            </td>
                                            <td>{b.interview_slot_details?.title}</td>
                                            <td className="small">
                                                <div>{b.interview_slot_details?.interview_date}</div>
                                                <div className="text-muted">{b.interview_slot_details?.interview_time}</div>
                                            </td>
                                            <td>
                                                {b.student_resume ? (
                                                    <a
                                                        href={b.student_resume.startsWith("http") ? b.student_resume : `${getBackendUrl() || 'http://127.0.0.1:8000'}${b.student_resume}`}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="btn btn-outline-primary btn-sm fw-bold rounded-pill px-3"
                                                    >
                                                        <FaFilePdf /> View PDF
                                                    </a>
                                                ) : (
                                                    <span className="text-muted small">No Resume</span>
                                                )}
                                            </td>
                                            <td>
                                                <span className={`badge rounded-pill ${
                                                    b.status === 'Pending' ? 'bg-warning text-dark' :
                                                    b.status === 'Booked' ? 'bg-primary' :
                                                    b.status === 'Completed' ? 'bg-success' : 'bg-danger'
                                                }`}>
                                                    {b.status === 'Pending' ? 'Awaiting Approval ⏳' : b.status === 'Booked' ? 'Approved ✅' : b.status}
                                                </span>
                                            </td>
                                            <td className="text-end">
                                                {b.status === 'Pending' && (
                                                    <div className="d-flex gap-2 justify-content-end">
                                                        <button
                                                            className="btn btn-success btn-sm fw-bold rounded-pill px-3"
                                                            onClick={() => handleApproveRequest(b.id)}
                                                        >
                                                            <FaCheck /> Accept
                                                        </button>
                                                        <button
                                                            className="btn btn-outline-danger btn-sm fw-bold rounded-pill px-3"
                                                            onClick={() => handleRejectRequest(b.id)}
                                                        >
                                                            <FaTimes /> Decline
                                                        </button>
                                                    </div>
                                                )}

                                                {b.status === 'Booked' && (
                                                    b.has_feedback ? (
                                                        <span className="badge bg-success border border-success px-3 py-2 rounded-pill fw-bold">
                                                            Evaluated ✅
                                                        </span>
                                                    ) : (
                                                        <button
                                                            className="btn btn-primary btn-sm fw-bold rounded-pill px-3"
                                                            onClick={() => handleOpenEvalModal(b)}
                                                        >
                                                            <FaStar /> Evaluate Student
                                                        </button>
                                                    )
                                                )}

                                                {b.status === 'Completed' && (
                                                    <span className="badge bg-success border border-success px-3 py-2 rounded-pill fw-bold">
                                                        Evaluated ✅
                                                    </span>
                                                )}

                                                {(b.status === 'Cancelled' || b.status === 'Rejected') && (
                                                    <span className="text-muted small fst-italic">No action needed</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* View Student Profile Modal */}
                {viewingStudent && (
                    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content rounded-4 border-0 shadow-lg">
                                <div className="modal-header bg-success text-white p-3">
                                    <h5 className="modal-title fw-bold">
                                        <FaGraduationCap className="me-2" /> Student Profile: {viewingStudent.student_name}
                                    </h5>
                                    <button type="button" className="btn-close btn-close-white" onClick={() => setViewingStudent(null)}></button>
                                </div>
                                <div className="modal-body p-4">
                                    <div className="row g-3">
                                        <div className="col-6">
                                            <div className="text-muted small">Full Name</div>
                                            <div className="fw-bold">{viewingStudent.student_profile?.full_name || viewingStudent.student_name}</div>
                                        </div>
                                        <div className="col-6">
                                            <div className="text-muted small">Email Address</div>
                                            <div className="fw-bold">{viewingStudent.student_email}</div>
                                        </div>
                                        <div className="col-6">
                                            <div className="text-muted small">Roll Number</div>
                                            <div className="fw-bold">{viewingStudent.student_profile?.roll_number || "N/A"}</div>
                                        </div>
                                        <div className="col-6">
                                            <div className="text-muted small">Branch / Dept</div>
                                            <div className="fw-bold">{viewingStudent.student_profile?.branch || "N/A"}</div>
                                        </div>
                                        <div className="col-6">
                                            <div className="text-muted small">Year of Study</div>
                                            <div className="fw-bold">{viewingStudent.student_profile?.year ? `${viewingStudent.student_profile.year} Year` : "N/A"}</div>
                                        </div>
                                        <div className="col-6">
                                            <div className="text-muted small">CGPA</div>
                                            <div className="fw-bold text-success">{viewingStudent.student_profile?.cgpa || "0.00"}</div>
                                        </div>
                                        <div className="col-12">
                                            <div className="text-muted small">Skills & Expertise</div>
                                            <div className="fw-bold text-dark">{viewingStudent.student_profile?.skills || "Not specified"}</div>
                                        </div>
                                        <div className="col-12 pt-2 border-top">
                                            <div className="text-muted small mb-2">Uploaded Resume</div>
                                            {viewingStudent.student_resume ? (
                                                <a
                                                    href={viewingStudent.student_resume.startsWith("http") ? viewingStudent.student_resume : `${getBackendUrl() || 'http://127.0.0.1:8000'}${viewingStudent.student_resume}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="btn btn-outline-primary btn-sm fw-bold rounded-pill px-3"
                                                >
                                                    <FaFilePdf className="me-1" /> Open Resume PDF
                                                </a>
                                            ) : (
                                                <span className="badge bg-danger">No Resume Uploaded</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer bg-light p-3">
                                    {viewingStudent.status === 'Pending' && (
                                        <>
                                            <button className="btn btn-success fw-bold rounded-pill px-3" onClick={() => { handleApproveRequest(viewingStudent.id); setViewingStudent(null); }}>
                                                <FaCheck className="me-1" /> Accept Request
                                            </button>
                                            <button className="btn btn-outline-danger fw-bold rounded-pill px-3" onClick={() => { handleRejectRequest(viewingStudent.id); setViewingStudent(null); }}>
                                                <FaTimes className="me-1" /> Decline
                                            </button>
                                        </>
                                    )}
                                    <button className="btn btn-secondary rounded-pill px-3" onClick={() => setViewingStudent(null)}>Close</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Evaluation Modal */}
                {selectedBooking && (
                    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
                        <div className="modal-dialog modal-lg modal-dialog-centered">
                            <div className="modal-content rounded-4 border-0 shadow-lg">
                                <div className="modal-header bg-dark text-white p-3">
                                    <h5 className="modal-title fw-bold">Evaluate Student: {selectedBooking.student_name}</h5>
                                    <button type="button" className="btn-close btn-close-white" onClick={() => setSelectedBooking(null)}></button>
                                </div>
                                <form onSubmit={handleSubmitEvaluation}>
                                    <div className="modal-body p-4" style={{ maxHeight: "65vh", overflowY: "auto" }}>

                                        <div className="row g-3 mb-3">
                                            <div className="col-md-4">
                                                <label className="form-label small fw-semibold">Technical Score (1-5)</label>
                                                <select className="form-select" name="technical" value={evalForm.technical} onChange={handleEvalChange}>
                                                    {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} ⭐</option>)}
                                                </select>
                                            </div>
                                            <div className="col-md-4">
                                                <label className="form-label small fw-semibold">Communication Score (1-5)</label>
                                                <select className="form-select" name="communication" value={evalForm.communication} onChange={handleEvalChange}>
                                                    {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} ⭐</option>)}
                                                </select>
                                            </div>
                                            <div className="col-md-4">
                                                <label className="form-label small fw-semibold">Confidence Score (1-5)</label>
                                                <select className="form-select" name="confidence" value={evalForm.confidence} onChange={handleEvalChange}>
                                                    {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} ⭐</option>)}
                                                </select>
                                            </div>
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label small fw-semibold">Placement Readiness Recommendation</label>
                                            <select className="form-select" name="recommendation" value={evalForm.recommendation} onChange={handleEvalChange}>
                                                <option value="Ready">Ready for Placements</option>
                                                <option value="Needs Practice">Needs Practice</option>
                                                <option value="Not Ready">Not Ready</option>
                                            </select>
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label small fw-semibold">Key Strengths</label>
                                            <input type="text" className="form-control" name="strengths" placeholder="e.g. Excellent SQL knowledge & problem solving..." value={evalForm.strengths} onChange={handleEvalChange} />
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label small fw-semibold">Areas for Improvement</label>
                                            <input type="text" className="form-control" name="improvements" placeholder="e.g. Work on system design principles..." value={evalForm.improvements} onChange={handleEvalChange} />
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label small fw-semibold">Overall Comments</label>
                                            <textarea className="form-control" rows="3" name="comments" placeholder="Detailed feedback notes for the student..." value={evalForm.comments} onChange={handleEvalChange}></textarea>
                                        </div>
                                    </div>
                                    <div className="modal-footer bg-light p-3">
                                        <button type="button" className="btn btn-secondary rounded-pill px-4" onClick={() => setSelectedBooking(null)}>Cancel</button>
                                        <button type="submit" className="btn btn-success fw-bold rounded-pill px-4" disabled={submitting}>
                                            {submitting ? "Submitting..." : "Submit Student Evaluation"}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

export default BookedStudents;
