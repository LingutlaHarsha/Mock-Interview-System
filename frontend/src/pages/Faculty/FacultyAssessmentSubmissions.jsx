import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import {
    getFacultyAssessmentDetail,
    getFacultySubmissions,
    getFacultyLeaderboard,
    updateSubmissionMarks
} from "../../services/codingService";
import { FaCode, FaTrophy, FaFileDownload, FaEdit, FaCheckCircle, FaTimesCircle, FaClock, FaMemory, FaUser, FaDownload } from "react-icons/fa";

function FacultyAssessmentSubmissions() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [assessment, setAssessment] = useState(null);
    const [submissions, setSubmissions] = useState([]);
    const [leaderboard, setLeaderboard] = useState([]);
    const [activeTab, setActiveTab] = useState("submissions"); // 'submissions' or 'leaderboard'
    const [loading, setLoading] = useState(true);

    const [selectedSubmission, setSelectedSubmission] = useState(null);
    const [adjustScore, setAdjustScore] = useState("");
    const [adjustRemarks, setAdjustRemarks] = useState("");
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        loadData();
    }, [id]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [detailRes, subRes, leaderRes] = await Promise.all([
                getFacultyAssessmentDetail(id),
                getFacultySubmissions(id),
                getFacultyLeaderboard(id)
            ]);
            setAssessment(detailRes.data);
            setSubmissions(subRes.data);
            setLeaderboard(leaderRes.data);
        } catch (error) {
            console.error("Failed to load submissions", error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenAdjustModal = (sub) => {
        setSelectedSubmission(sub);
        setAdjustScore(sub.score);
        setAdjustRemarks(sub.manual_remarks || "");
    };

    const handleSaveAdjustedMarks = async (e) => {
        e.preventDefault();
        if (!selectedSubmission) return;
        try {
            setUpdating(true);
            await updateSubmissionMarks(selectedSubmission.id, {
                score: parseFloat(adjustScore),
                manual_remarks: adjustRemarks
            });
            setSelectedSubmission(null);
            loadData();
        } catch (error) {
            console.error(error);
        } finally {
            setUpdating(false);
        }
    };

    const handleDownloadCode = (sub) => {
        const extMap = { python: 'py', javascript: 'js', cpp: 'cpp', c: 'c', java: 'java' };
        const ext = extMap[sub.language?.toLowerCase()] || 'txt';
        const element = document.createElement("a");
        const file = new Blob([sub.code], { type: 'text/plain' });
        element.href = URL.createObjectURL(file);
        element.download = `${sub.student_name.replace(/\s+/g, '_')}_${sub.question_title.replace(/\s+/g, '_')}.${ext}`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    const handleExportCSV = () => {
        if (!submissions.length) return;
        let csvContent = "data:text/csv;charset=utf-8,Student,Email,Question,Language,AttemptsUsed,Score,MaxMarks,Status,ExecutionTime(ms),Memory(KB),SubmittedAt\n";
        submissions.forEach(s => {
            csvContent += `"${s.student_name}","${s.student_email}","${s.question_title}","${s.language}",${s.attempt_number},${s.score},${s.max_marks},"${s.status}",${s.execution_time_ms},${s.memory_kb},"${s.submitted_at}"\n`;
        });
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `submissions_assessment_${id}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <>
            <Sidebar activeRole="faculty" />
            <Navbar title="Assessment Submissions & Leaderboard" userRole="faculty" />

            <div className="container-fluid" style={{ marginLeft: "260px", paddingTop: "90px", paddingRight: "30px", maxWidth: "calc(100% - 260px)" }}>
                <div className="card shadow-lg border-0 rounded-4 bg-white p-4">
                    
                    <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 pb-3 border-bottom">
                        <div>
                            <button className="btn btn-outline-secondary btn-sm rounded-pill mb-2" onClick={() => navigate("/faculty/coding-assessments")}>
                                ← Back to Assessments
                            </button>
                            <h4 className="fw-bold m-0 text-dark">
                                <FaCode className="text-success me-2" /> {assessment?.title || "Assessment Results"}
                            </h4>
                        </div>

                        <div className="d-flex gap-2">
                            <button className="btn btn-outline-success fw-bold rounded-pill px-3" onClick={handleExportCSV}>
                                <FaFileDownload className="me-1" /> Export CSV Results
                            </button>
                        </div>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="d-flex gap-2 mb-4">
                        <button className={`btn rounded-pill px-4 fw-bold ${activeTab === 'submissions' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setActiveTab('submissions')}>
                            📋 Student Submissions ({submissions.length})
                        </button>
                        <button className={`btn rounded-pill px-4 fw-bold ${activeTab === 'leaderboard' ? 'btn-warning text-dark' : 'btn-outline-warning'}`} onClick={() => setActiveTab('leaderboard')}>
                            <FaTrophy className="me-1" /> Contest Leaderboard ({leaderboard.length})
                        </button>
                    </div>

                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-success" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    ) : activeTab === 'submissions' ? (
                        submissions.length === 0 ? (
                            <p className="text-muted text-center py-4">No student submissions recorded for this assessment yet.</p>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-hover align-middle">
                                    <thead>
                                        <tr>
                                            <th>Student</th>
                                            <th>Question</th>
                                            <th>Language</th>
                                            <th>Attempts Used</th>
                                            <th>Score</th>
                                            <th>Exec Time</th>
                                            <th>Memory</th>
                                            <th>Status</th>
                                            <th className="text-end">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {submissions.map(s => (
                                            <tr key={s.id}>
                                                <td>
                                                    <div className="fw-bold text-dark">{s.student_name}</div>
                                                    <div className="small text-muted">{s.student_email}</div>
                                                </td>
                                                <td className="fw-semibold text-primary">{s.question_title}</td>
                                                <td><span className="badge bg-dark">{s.language}</span></td>
                                                <td><span className="badge bg-secondary">Attempt #{s.attempt_number}</span></td>
                                                <td className="fw-bold text-success">{s.score} / {s.max_marks}</td>
                                                <td className="small"><FaClock className="me-1 text-muted" />{s.execution_time_ms} ms</td>
                                                <td className="small">{s.memory_kb} KB</td>
                                                <td>
                                                    <span className={`badge rounded-pill ${s.status === 'Accepted' ? 'bg-success' : s.status === 'Partial' ? 'bg-warning text-dark' : 'bg-danger'}`}>
                                                        {s.status}
                                                    </span>
                                                </td>
                                                <td className="text-end">
                                                    <button className="btn btn-outline-dark btn-sm rounded-circle me-1" title="Download Code" onClick={() => handleDownloadCode(s)}>
                                                        <FaDownload />
                                                    </button>
                                                    <button className="btn btn-outline-primary btn-sm rounded-pill px-3" onClick={() => handleOpenAdjustModal(s)}>
                                                        View Code & Adjust
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )
                    ) : (
                        leaderboard.length === 0 ? (
                            <p className="text-muted text-center py-4">No leaderboard rankings available yet.</p>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-hover align-middle">
                                    <thead className="table-dark">
                                        <tr>
                                            <th>Rank</th>
                                            <th>Student Name</th>
                                            <th>Total Score</th>
                                            <th>Percentage</th>
                                            <th>Status</th>
                                            <th>Completed At</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {leaderboard.map(r => (
                                            <tr key={r.id}>
                                                <td className="fw-bold fs-5">
                                                    {r.rank === 1 ? '🥇 1st' : r.rank === 2 ? '🥈 2nd' : r.rank === 3 ? '🥉 3rd' : `#${r.rank}`}
                                                </td>
                                                <td>
                                                    <div className="fw-bold text-dark">{r.student_name}</div>
                                                    <div className="small text-muted">{r.student_email}</div>
                                                </td>
                                                <td className="fw-bold text-success fs-6">{r.total_score} / {r.max_score}</td>
                                                <td className="fw-semibold">{r.percentage}%</td>
                                                <td><span className="badge bg-success">{r.status}</span></td>
                                                <td className="small text-muted">{new Date(r.completed_at).toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )
                    )}

                </div>

                {/* View Code & Adjust Marks Modal */}
                {selectedSubmission && (
                    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
                        <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
                            <div className="modal-content rounded-4 border-0 shadow-lg">
                                <div className="modal-header bg-dark text-white p-3 d-flex justify-content-between align-items-center">
                                    <h5 className="modal-title fw-bold m-0">Student Submission: {selectedSubmission.student_name}</h5>
                                    <div className="d-flex align-items-center gap-2">
                                        <button className="btn btn-outline-light btn-sm rounded-pill" onClick={() => handleDownloadCode(selectedSubmission)}>
                                            <FaDownload className="me-1" /> Download Code
                                        </button>
                                        <button type="button" className="btn-close btn-close-white" onClick={() => setSelectedSubmission(null)}></button>
                                    </div>
                                </div>
                                <div className="modal-body p-4">
                                    <div className="d-flex justify-content-between mb-3 bg-light p-3 rounded-3 border">
                                        <div>
                                            <strong>Language:</strong> {selectedSubmission.language} | <strong>Attempt:</strong> #{selectedSubmission.attempt_number} | <strong>Score:</strong> {selectedSubmission.score}/{selectedSubmission.max_marks}
                                        </div>
                                        <div>
                                            <span className={`badge ${selectedSubmission.status === 'Accepted' ? 'bg-success' : 'bg-danger'}`}>{selectedSubmission.status}</span>
                                        </div>
                                    </div>

                                    <h6 className="fw-bold text-dark">Source Code</h6>
                                    <pre className="bg-dark text-white p-3 rounded-3 font-monospace small mb-4" style={{ maxHeight: "300px", overflowY: "auto" }}>
                                        <code>{selectedSubmission.code}</code>
                                    </pre>

                                    <form onSubmit={handleSaveAdjustedMarks} className="bg-light p-3 rounded-3 border">
                                        <h6 className="fw-bold text-dark mb-2">Adjust Student Score / Add Feedback Remarks</h6>
                                        <div className="row g-3">
                                            <div className="col-md-6">
                                                <label className="form-label small fw-semibold">Score (Max: {selectedSubmission.max_marks})</label>
                                                <input type="number" step="0.5" className="form-control" value={adjustScore} onChange={(e) => setAdjustScore(e.target.value)} required />
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label small fw-semibold">Faculty Remarks</label>
                                                <input type="text" className="form-control" placeholder="e.g. Clean solution, good time complexity." value={adjustRemarks} onChange={(e) => setAdjustRemarks(e.target.value)} />
                                            </div>
                                            <div className="col-12 text-end">
                                                <button type="submit" className="btn btn-success fw-bold rounded-pill px-4" disabled={updating}>
                                                    {updating ? "Saving..." : "Save Score Adjustment"}
                                                </button>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </>
    );
}

export default FacultyAssessmentSubmissions;
