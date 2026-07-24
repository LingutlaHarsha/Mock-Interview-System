import { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import api from "../../services/api";
import {
    FaStar, FaAward, FaSearch, FaCheckCircle, FaTools, FaComments
} from "react-icons/fa";

function FacultyFeedback() {
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        loadFeedbacks();
    }, []);

    const loadFeedbacks = async () => {
        try {
            setLoading(true);
            const res = await api.get("feedback/");
            setFeedbacks(res.data);
        } catch (error) {
            console.error("Failed to load feedbacks", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredFeedbacks = feedbacks.filter(f => {
        const studentName = f.booking_details?.student_name || f.student_name || "";
        const topic = f.booking_details?.interview_slot_details?.title || f.interview_title || "";
        const rec = f.recommendation || "";
        const search = searchTerm.toLowerCase();
        return studentName.toLowerCase().includes(search) || topic.toLowerCase().includes(search) || rec.toLowerCase().includes(search);
    });

    return (
        <>
            <Sidebar activeRole="faculty" />
            <Navbar title="Student Feedback & Evaluations" userRole="faculty" />

            <div className="container-fluid animate-fade-in" style={{ marginLeft: "260px", paddingTop: "90px", paddingRight: "30px", maxWidth: "calc(100% - 260px)" }}>
                <div className="card shadow-lg border-0 rounded-4 bg-white p-4">
                    
                    {/* Header Banner */}
                    <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 pb-3 border-bottom gap-3">
                        <div>
                            <span className="badge bg-warning bg-opacity-20 text-dark px-3 py-1.5 rounded-pill fw-bold mb-2">
                                Performance Evaluations
                            </span>
                            <h3 className="fw-bold text-dark m-0 d-flex align-items-center gap-2">
                                <FaAward className="text-warning" /> Student Evaluation Feedback History
                            </h3>
                            <p className="text-muted small m-0 mt-1">Review interview performance ratings, key strengths, areas for improvement, and placement readiness.</p>
                        </div>

                        <div className="position-relative" style={{ minWidth: "280px" }}>
                            <FaSearch className="position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary" />
                            <input
                                type="text"
                                className="form-control rounded-pill ps-5 pe-4 shadow-2xs border-light-subtle"
                                placeholder="Search student or topic..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-success" role="status">
                                <span className="visually-hidden">Loading feedback history...</span>
                            </div>
                        </div>
                    ) : filteredFeedbacks.length === 0 ? (
                        <div className="text-center py-5 text-muted">
                            <FaAward className="display-4 text-secondary mb-3 opacity-50" />
                            <h5 className="fw-bold text-dark">No Evaluation Records Found</h5>
                            <p className="small text-muted">Submitted student evaluations will be displayed here.</p>
                        </div>
                    ) : (
                        <div className="row g-4">
                            {filteredFeedbacks.map(f => {
                                const booking = f.booking_details || {};
                                const slot = booking.interview_slot_details || {};
                                const studentName = booking.student_name || f.student_name || "Student";
                                const topicTitle = slot.title || f.interview_title || "Mock Interview Session";
                                
                                const ratingVal = f.rating ?? f.overall_rating ?? 4;
                                const techVal = f.technical ?? f.technical_skills_score ?? 4;
                                const commVal = f.communication ?? f.communication_score ?? 4;
                                const confVal = f.confidence ?? f.confidence_score ?? 4;

                                const isReady = f.recommendation === 'Ready' || f.recommendation === 'Ready for Placement';

                                return (
                                    <div key={f.id} className="col-12">
                                        <div className="card shadow-sm border border-light-subtle rounded-4 p-4 bg-white hover-lift">
                                            
                                            {/* Header Row: Student Profile, Ratings Bar & Readiness Badge */}
                                            <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 pb-3 border-bottom gap-3">
                                                <div className="d-flex align-items-center gap-3">
                                                    <div className="p-3 bg-primary text-white rounded-circle fw-bold fs-5 shadow-2xs d-flex align-items-center justify-content-center" style={{ width: "48px", height: "48px" }}>
                                                        {studentName.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <h5 className="fw-bold text-dark mb-1">{studentName}</h5>
                                                        <span className="badge bg-success-subtle text-success border border-success border-opacity-25 px-3 py-1 rounded-pill fw-bold">
                                                            {topicTitle}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Ratings Bar */}
                                                <div className="d-flex align-items-center gap-3 flex-wrap">
                                                    <div className="bg-light px-3 py-2 rounded-3 text-center border border-light-subtle">
                                                        <span className="text-secondary extra-small fw-bold d-block text-uppercase">Overall</span>
                                                        <span className="fw-bold text-dark fs-6">{ratingVal} / 5 ⭐</span>
                                                    </div>
                                                    <div className="bg-light px-3 py-2 rounded-3 text-center border border-light-subtle">
                                                        <span className="text-secondary extra-small fw-bold d-block text-uppercase">Technical</span>
                                                        <span className="fw-bold text-primary fs-6">{techVal} / 5 ⭐</span>
                                                    </div>
                                                    <div className="bg-light px-3 py-2 rounded-3 text-center border border-light-subtle">
                                                        <span className="text-secondary extra-small fw-bold d-block text-uppercase">Communication</span>
                                                        <span className="fw-bold text-info fs-6">{commVal} / 5 ⭐</span>
                                                    </div>
                                                    <div className="bg-light px-3 py-2 rounded-3 text-center border border-light-subtle">
                                                        <span className="text-secondary extra-small fw-bold d-block text-uppercase">Confidence</span>
                                                        <span className="fw-bold text-success fs-6">{confVal} / 5 ⭐</span>
                                                    </div>
                                                </div>

                                                <span className={`badge px-3.5 py-2.5 rounded-pill fw-bold ${isReady ? 'bg-success text-white shadow-2xs' : 'bg-warning text-dark shadow-2xs'}`}>
                                                    {isReady ? 'Ready for Placement ✅' : (f.recommendation || 'Needs Work ⚠️')}
                                                </span>
                                            </div>

                                            {/* Details Section with Generous Spacing */}
                                            <div className="row g-3">
                                                {f.strengths && (
                                                    <div className="col-md-6">
                                                        <div className="p-3 rounded-3 bg-success bg-opacity-10 border border-success border-opacity-20 h-100">
                                                            <span className="fw-bold text-success me-2 d-inline-flex align-items-center gap-1">
                                                                <FaCheckCircle /> Key Strengths:
                                                            </span>
                                                            <span className="text-dark font-medium">{f.strengths}</span>
                                                        </div>
                                                    </div>
                                                )}

                                                {f.improvements && (
                                                    <div className="col-md-6">
                                                        <div className="p-3 rounded-3 bg-warning bg-opacity-10 border border-warning border-opacity-25 h-100">
                                                            <span className="fw-bold text-dark me-2 d-inline-flex align-items-center gap-1">
                                                                <FaTools className="text-warning" /> Areas for Improvement:
                                                            </span>
                                                            <span className="text-dark font-medium">{f.improvements}</span>
                                                        </div>
                                                    </div>
                                                )}

                                                {f.comments && (
                                                    <div className="col-12">
                                                        <div className="p-3 rounded-3 bg-light border border-light-subtle">
                                                            <span className="fw-bold text-dark me-2">Detailed Remarks:</span>
                                                            <span className="text-secondary fst-italic">"{f.comments}"</span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="mt-3 pt-2 border-top d-flex justify-content-between align-items-center text-muted extra-small">
                                                <span>Submitted on: {new Date(f.created_at || Date.now()).toLocaleDateString()}</span>
                                                <span className="fw-bold text-secondary">Verified Evaluation Record</span>
                                            </div>

                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                </div>
            </div>
        </>
    );
}

export default FacultyFeedback;
