import { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import api from "../../services/api";
import {
    FaLaptopCode, FaCode, FaEye, FaDownload, FaSearch, FaFilter,
    FaCheckCircle, FaTimesCircle, FaExclamationTriangle, FaClock, FaMicrochip
} from "react-icons/fa";

function AdminSubmissions() {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [selectedSub, setSelectedSub] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const res = await api.get("coding/admin-submissions/");
            setSubmissions(res.data);
        } catch (error) {
            console.error("Failed to load admin submissions", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadCode = (sub) => {
        const filename = `submission_${sub.student_name || 'student'}_${sub.id}.${sub.language === 'python' ? 'py' : sub.language === 'cpp' ? 'cpp' : sub.language === 'java' ? 'java' : 'txt'}`;
        const blob = new Blob([sub.code], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleExportCSV = () => {
        if (submissions.length === 0) return;
        const headers = ["Submission ID", "Student", "Assessment", "Question", "Language", "Score", "Max Marks", "Passed Test Cases", "Status", "Execution Time (ms)", "Memory (KB)", "Submitted At"];
        const rows = filteredSubmissions.map(s => [
            s.id,
            `"${s.student_name || s.student}"`,
            `"${s.assessment_title}"`,
            `"${s.question_title}"`,
            s.language,
            s.score,
            s.max_marks,
            `"${s.passed_test_cases}/${s.total_test_cases}"`,
            s.status,
            s.execution_time_ms,
            s.memory_kb,
            `"${new Date(s.submitted_at).toLocaleString()}"`
        ]);

        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `technical_assessment_submissions_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const filteredSubmissions = submissions.filter(s => {
        const matchesSearch = (s.student_name || s.student || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (s.assessment_title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (s.question_title || "").toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === "All" || s.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <>
            <Sidebar activeRole="admin" />
            <Navbar title="Technical Assessment Submissions Audit" userRole="admin" />

            <div className="container-fluid" style={{ marginLeft: "260px", paddingTop: "90px", paddingRight: "30px", maxWidth: "calc(100% - 260px)" }}>
                <div className="card shadow-lg border-0 rounded-4 bg-white p-4">
                    
                    <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 pb-3 border-bottom">
                        <div>
                            <h4 className="fw-bold m-0 text-dark">
                                <FaLaptopCode className="text-primary me-2" /> Global Technical Assessment Audit Log
                            </h4>
                            <p className="text-muted small m-0">Inspect full student source code, execution logs, runtime metrics, and export reports.</p>
                        </div>
                        <button className="btn btn-success fw-bold rounded-pill px-4" onClick={handleExportCSV}>
                            <FaDownload className="me-2" /> Export CSV Report
                        </button>
                    </div>

                    {/* Filter Toolbar */}
                    <div className="row g-3 mb-4">
                        <div className="col-md-8">
                            <div className="input-group">
                                <span className="input-group-text bg-light border-end-0"><FaSearch className="text-muted" /></span>
                                <input
                                    type="text"
                                    className="form-control bg-light border-start-0"
                                    placeholder="Search by student name, assessment title, or question..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="col-md-4">
                            <select className="form-select bg-light" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                                <option value="All">All Submission Statuses</option>
                                <option value="Accepted">Accepted</option>
                                <option value="Partial">Partial</option>
                                <option value="Wrong Answer">Wrong Answer</option>
                                <option value="Compilation Error">Compilation Error</option>
                            </select>
                        </div>
                    </div>

                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading admin submissions...</span>
                            </div>
                        </div>
                    ) : filteredSubmissions.length === 0 ? (
                        <div className="text-center py-5 text-muted">
                            <FaCode className="display-4 text-secondary mb-3" />
                            <h5>No Submissions Found</h5>
                            <p className="small">Submissions will appear here once students attempt technical assessments.</p>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover align-middle">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Student</th>
                                        <th>Assessment</th>
                                        <th>Question</th>
                                        <th>Language</th>
                                        <th>Score</th>
                                        <th>Test Cases</th>
                                        <th>Status</th>
                                        <th>Execution</th>
                                        <th>Submitted At</th>
                                        <th className="text-end">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredSubmissions.map(s => (
                                        <tr key={s.id}>
                                            <td className="fw-bold text-muted">#{s.id}</td>
                                            <td className="fw-bold text-dark">{s.student_name || s.student}</td>
                                            <td className="fw-semibold text-primary">{s.assessment_title}</td>
                                            <td className="small text-dark">{s.question_title}</td>
                                            <td><span className="badge bg-dark">{s.language}</span></td>
                                            <td className="fw-bold text-success">{s.score} / {s.max_marks}</td>
                                            <td className="small">{s.passed_test_cases} / {s.total_test_cases}</td>
                                            <td>
                                                <span className={`badge rounded-pill ${s.status === 'Accepted' ? 'bg-success' : s.status === 'Partial' ? 'bg-warning text-dark' : 'bg-danger'}`}>
                                                    {s.status}
                                                </span>
                                            </td>
                                            <td className="small text-muted">{s.execution_time_ms} ms | {s.memory_kb} KB</td>
                                            <td className="small text-muted">{new Date(s.submitted_at).toLocaleString()}</td>
                                            <td className="text-end">
                                                <div className="btn-group btn-group-sm">
                                                    <button className="btn btn-outline-primary rounded-pill px-3" onClick={() => setSelectedSub(s)}>
                                                        <FaEye className="me-1" /> View Code
                                                    </button>
                                                    <button className="btn btn-outline-secondary rounded-pill px-2" title="Download Code" onClick={() => handleDownloadCode(s)}>
                                                        <FaDownload />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                </div>

                {/* Audit View Code & Logs Modal */}
                {selectedSub && (
                    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
                        <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
                            <div className="modal-content rounded-4 border-0 shadow-lg">
                                <div className="modal-header bg-dark text-white p-3">
                                    <h5 className="modal-title fw-bold">
                                        <FaCode className="text-success me-2" /> Admin Audit Log: Submission #{selectedSub.id}
                                    </h5>
                                    <button type="button" className="btn-close btn-close-white" onClick={() => setSelectedSub(null)}></button>
                                </div>
                                <div className="modal-body p-4">
                                    <div className="bg-light p-3 rounded-4 border mb-3 small">
                                        <div className="row g-2">
                                            <div className="col-6"><strong>Student:</strong> {selectedSub.student_name || selectedSub.student}</div>
                                            <div className="col-6"><strong>Assessment:</strong> {selectedSub.assessment_title}</div>
                                            <div className="col-6"><strong>Question:</strong> {selectedSub.question_title}</div>
                                            <div className="col-6"><strong>Language:</strong> {selectedSub.language}</div>
                                            <div className="col-6"><strong>Score:</strong> {selectedSub.score} / {selectedSub.max_marks}</div>
                                            <div className="col-6"><strong>Status:</strong> {selectedSub.status}</div>
                                        </div>
                                    </div>

                                    <h6 className="fw-bold text-dark mb-2">Student Source Code</h6>
                                    <pre className="bg-dark text-white p-3 rounded-4 font-monospace small mb-4" style={{ maxHeight: "300px", overflowY: "auto" }}>
                                        <code>{selectedSub.code}</code>
                                    </pre>

                                    {selectedSub.test_case_results && selectedSub.test_case_results.length > 0 && (
                                        <div>
                                            <h6 className="fw-bold text-dark mb-2">Execution Logs & Test Cases</h6>
                                            <div className="d-flex flex-column gap-2" style={{ maxHeight: "200px", overflowY: "auto" }}>
                                                {selectedSub.test_case_results.map((r, i) => (
                                                    <div key={i} className="bg-light p-2 rounded-3 border extra-small font-monospace">
                                                        <div className="d-flex justify-content-between fw-bold">
                                                            <span>Test Case #{i + 1} {r.is_hidden ? "(Hidden)" : "(Visible)"}</span>
                                                            <span className={r.passed ? 'text-success' : 'text-danger'}>{r.passed ? 'PASSED' : 'FAILED'}</span>
                                                        </div>
                                                        {r.error_message && <div className="text-danger mt-1">{r.error_message}</div>}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                </div>
                                <div className="modal-footer bg-light p-3">
                                    <button className="btn btn-outline-success fw-bold rounded-pill me-auto" onClick={() => handleDownloadCode(selectedSub)}>
                                        <FaDownload className="me-1" /> Download Source File
                                    </button>
                                    <button className="btn btn-secondary rounded-pill px-4" onClick={() => setSelectedSub(null)}>Close</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </>
    );
}

export default AdminSubmissions;
