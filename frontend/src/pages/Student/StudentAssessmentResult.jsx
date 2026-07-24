import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import { getStudentSubmissionDetail } from "../../services/codingService";
import {
    FaCheckCircle, FaTimesCircle, FaClock, FaTrophy,
    FaArrowLeft, FaRedo, FaCode, FaList, FaExclamationCircle, FaShieldAlt, FaLayerGroup
} from "react-icons/fa";

function StudentAssessmentResult() {
    const { submissionId } = useParams();
    const navigate = useNavigate();

    const [submission, setSubmission] = useState(null);
    const [activeQuestionIdx, setActiveQuestionIdx] = useState(0);
    const [viewAllMode, setViewAllMode] = useState(false);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState("");

    useEffect(() => {
        loadResult();
    }, [submissionId]);

    const loadResult = async () => {
        try {
            setLoading(true);
            const res = await getStudentSubmissionDetail(submissionId);
            setSubmission(res.data);

            // Find index of the clicked submission in all_submissions if present
            if (res.data?.all_submissions && res.data.all_submissions.length > 0) {
                const foundIdx = res.data.all_submissions.findIndex(s => s.id === parseInt(submissionId));
                if (foundIdx !== -1) {
                    setActiveQuestionIdx(foundIdx);
                }
            }
        } catch (error) {
            console.error("Failed to load submission result", error);
            setErrorMsg("Failed to load assessment submission results. Please check your network connection.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <>
                <Sidebar activeRole="student" />
                <Navbar title="Assessment Results" userRole="student" />
                <div className="container" style={{ marginLeft: "260px", paddingTop: "90px" }}>
                    <div className="text-center py-5">
                        <div className="spinner-border text-success" role="status">
                            <span className="visually-hidden">Loading results...</span>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    if (errorMsg || !submission) {
        return (
            <>
                <Sidebar activeRole="student" />
                <Navbar title="Assessment Results" userRole="student" />
                <div className="container" style={{ marginLeft: "260px", paddingTop: "90px" }}>
                    <div className="alert alert-danger p-4 rounded-4 shadow-sm text-center">
                        <FaExclamationCircle className="display-4 text-danger mb-3" />
                        <h5>{errorMsg || "Result Not Found"}</h5>
                        <button className="btn btn-primary rounded-pill px-4 mt-3" onClick={() => navigate("/student/coding-attempts")}>
                            Go to My Coding Attempts
                        </button>
                    </div>
                </div>
            </>
        );
    }

    const {
        assessment_title,
        attempt_number,
        assessment_allowed_attempts,
        assessment_id,
        all_submissions,
        attempt_total_score,
        attempt_max_marks,
        submitted_at
    } = submission;

    // Use all_submissions list if available, fallback to single submission
    const submissionsList = (all_submissions && all_submissions.length > 0) ? all_submissions : [submission];
    const currentSub = submissionsList[activeQuestionIdx] || submissionsList[0];

    const totalScore = attempt_total_score !== undefined ? attempt_total_score : submissionsList.reduce((sum, s) => sum + (s.score || 0), 0);
    const maxMarks = attempt_max_marks || submission.max_marks || 100;
    const overallPercentage = maxMarks > 0 ? Math.round((totalScore / maxMarks) * 100) : 0;

    const allowedAttempts = assessment_allowed_attempts !== undefined ? assessment_allowed_attempts : 1;
    const isUnlimited = allowedAttempts === 0;
    const remainingAttempts = isUnlimited ? 999 : Math.max(0, allowedAttempts - attempt_number);
    const canAttemptAgain = isUnlimited || remainingAttempts > 0;

    return (
        <>
            <Sidebar activeRole="student" />
            <Navbar title="Assessment Results" userRole="student" />

            <div className="container-fluid" style={{ marginLeft: "260px", paddingTop: "90px", paddingRight: "30px", maxWidth: "calc(100% - 260px)" }}>
                
                {/* Result Header Banner */}
                <div className="card shadow-lg border-0 rounded-4 bg-white p-4 mb-4">
                    <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 pb-2 border-bottom">
                        <div>
                            <span className="badge bg-success-subtle text-success border border-success mb-2 px-3 py-1 rounded-pill fw-bold">
                                <FaCheckCircle className="me-1" /> Assessment Evaluation Completed
                            </span>
                            <h3 className="fw-bold text-dark m-0">{assessment_title || "Technical Coding Assessment"}</h3>
                            <p className="text-muted small m-0 mt-1">
                                Submitted: {new Date(submitted_at || currentSub.submitted_at).toLocaleString()} | Attempt #{attempt_number}
                            </p>
                        </div>
                        <div className="d-flex gap-2">
                            <button className="btn btn-outline-secondary rounded-pill px-4" onClick={() => navigate("/student/coding-assessments")}>
                                <FaArrowLeft className="me-1" /> All Assessments
                            </button>
                            <button className="btn btn-outline-primary rounded-pill px-4" onClick={() => navigate("/student/coding-attempts")}>
                                My Attempts
                            </button>
                        </div>
                    </div>

                    {/* Overall Metrics Summary Row */}
                    <div className="row g-3">
                        <div className="col-md-3">
                            <div className="bg-light p-3 rounded-4 border border-light-subtle h-100 text-center">
                                <div className="text-muted small fw-semibold text-uppercase mb-1">Overall Score</div>
                                <h2 className="fw-bold text-success m-0">{totalScore} <span className="fs-6 text-muted">/ {maxMarks} pts</span></h2>
                                <div className="badge bg-success mt-2">{overallPercentage}% Score</div>
                            </div>
                        </div>

                        <div className="col-md-3">
                            <div className="bg-light p-3 rounded-4 border border-light-subtle h-100 text-center">
                                <div className="text-muted small fw-semibold text-uppercase mb-1">Total Questions</div>
                                <h2 className="fw-bold text-primary m-0">{submissionsList.length} <span className="fs-6 text-muted">Questions</span></h2>
                                <div className="small text-secondary mt-2">All Evaluated</div>
                            </div>
                        </div>

                        <div className="col-md-3">
                            <div className="bg-light p-3 rounded-4 border border-light-subtle h-100 text-center">
                                <div className="text-muted small fw-semibold text-uppercase mb-1">Active Question Score</div>
                                <h3 className="fw-bold text-dark m-0 mt-1">{currentSub.score} <span className="fs-6 text-muted">/ {currentSub.max_marks} pts</span></h3>
                                <span className={`badge ${currentSub.status === 'Accepted' ? 'bg-success' : 'bg-warning'} mt-1`}>{currentSub.status}</span>
                            </div>
                        </div>

                        <div className="col-md-3">
                            <div className="bg-light p-3 rounded-4 border border-light-subtle h-100 text-center">
                                <div className="text-muted small fw-semibold text-uppercase mb-1">Attempt Session</div>
                                <h4 className="fw-bold text-primary m-0 mt-1">Attempt #{attempt_number}</h4>
                                <div className="small fw-semibold text-secondary mt-1">
                                    {isUnlimited ? "Unlimited Attempts" : `${remainingAttempts} Attempt(s) Remaining`}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Question Selection Tabs Toolbar */}
                <div className="card shadow-sm border-0 rounded-4 bg-white p-3 mb-4">
                    <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
                        <div className="d-flex align-items-center gap-2 flex-wrap">
                            <span className="fw-bold text-secondary small me-2"><FaLayerGroup /> Select Question:</span>
                            {submissionsList.map((sub, idx) => {
                                const isActive = !viewAllMode && idx === activeQuestionIdx;
                                return (
                                    <button
                                        key={sub.id || idx}
                                        className={`btn btn-sm rounded-pill px-3 fw-bold d-flex align-items-center gap-2 ${isActive ? 'btn-success text-white shadow-sm' : 'btn-outline-secondary'}`}
                                        onClick={() => { setActiveQuestionIdx(idx); setViewAllMode(false); }}
                                    >
                                        <span>Q{idx + 1}. {sub.question_title}</span>
                                        <span className={`badge ${sub.status === 'Accepted' ? 'bg-light text-success' : 'bg-dark text-warning'}`}>
                                            {sub.score}/{sub.max_marks} pts
                                        </span>
                                    </button>
                                );
                            })}
                        </div>

                        {submissionsList.length > 1 && (
                            <button
                                className={`btn btn-sm rounded-pill px-3 fw-bold ${viewAllMode ? 'btn-primary' : 'btn-outline-primary'}`}
                                onClick={() => setViewAllMode(!viewAllMode)}
                            >
                                {viewAllMode ? "Single Question View" : `View All (${submissionsList.length}) Codes`}
                            </button>
                        )}
                    </div>
                </div>

                {/* VIEW ALL SUBMITTED CODES MODE */}
                {viewAllMode ? (
                    <div className="d-flex flex-column gap-4 mb-4">
                        {submissionsList.map((sub, idx) => (
                            <div key={sub.id || idx} className="card shadow-md border-0 rounded-4 bg-white p-4">
                                <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
                                    <div>
                                        <h5 className="fw-bold text-success m-0">
                                            Q{idx + 1}. {sub.question_title}
                                        </h5>
                                        <div className="small text-muted mt-1">
                                            Language: <strong className="text-dark">{sub.language}</strong> | Execution Time: {sub.execution_time_ms} ms
                                        </div>
                                    </div>
                                    <div className="text-end">
                                        <h4 className="fw-bold text-primary m-0">{sub.score} / {sub.max_marks} pts</h4>
                                        <span className={`badge ${sub.status === 'Accepted' ? 'bg-success' : 'bg-warning'} px-3 py-1 rounded-pill mt-1`}>
                                            {sub.status} ({sub.passed_test_cases}/{sub.total_test_cases} Test Cases Passed)
                                        </span>
                                    </div>
                                </div>

                                <div className="row g-3">
                                    <div className="col-lg-7">
                                        <h6 className="fw-bold text-dark mb-2"><FaCode className="text-primary me-1" /> Submitted Code</h6>
                                        <pre className="bg-dark text-white p-3 rounded-4 font-monospace small overflow-auto" style={{ maxHeight: "350px" }}>
                                            <code>{sub.code}</code>
                                        </pre>
                                    </div>
                                    <div className="col-lg-5">
                                        <h6 className="fw-bold text-dark mb-2"><FaList className="text-success me-1" /> Test Case Breakdown</h6>
                                        <div className="d-flex flex-column gap-2 overflow-auto" style={{ maxHeight: "350px" }}>
                                            {(sub.test_case_results || []).map((tc, i) => (
                                                <div key={i} className={`p-2.5 rounded-3 border extra-small ${tc.passed ? 'bg-success-subtle border-success-subtle' : 'bg-danger-subtle border-danger-subtle'}`}>
                                                    <div className="d-flex justify-content-between align-items-center">
                                                        <span className="fw-bold text-dark">Test Case #{i + 1} {tc.is_hidden ? "(Hidden)" : "(Visible)"}</span>
                                                        <span className={`badge ${tc.passed ? 'bg-success' : 'bg-danger'}`}>{tc.passed ? 'PASSED ✓' : 'FAILED ✗'}</span>
                                                    </div>
                                                    {!tc.is_hidden && (
                                                        <div className="text-secondary mt-1 font-monospace">
                                                            <div>In: <code>{tc.input}</code> | Out: <code>{tc.actual_output || '(blank)'}</code></div>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    /* SINGLE QUESTION VIEW MODE */
                    <div className="row g-4 mb-4">
                        
                        {/* Left Col: Submitted Source Code */}
                        <div className="col-lg-6">
                            <div className="card shadow-md border-0 rounded-4 bg-white p-4 h-100">
                                <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
                                    <div>
                                        <h5 className="fw-bold text-dark m-0">
                                            <FaCode className="text-primary me-2" /> Q{activeQuestionIdx + 1}. {currentSub.question_title}
                                        </h5>
                                        <span className="small text-muted">Submitted Language: <strong className="text-dark">{currentSub.language}</strong></span>
                                    </div>
                                    <span className="badge bg-dark px-3 py-1 rounded-pill">{currentSub.language}</span>
                                </div>

                                <pre className="bg-dark text-white p-3 rounded-4 font-monospace small flex-grow-1" style={{ minHeight: "360px", maxHeight: "460px", overflowY: "auto" }}>
                                    <code>{currentSub.code}</code>
                                </pre>
                            </div>
                        </div>

                        {/* Right Col: Detailed Test Case Breakdown */}
                        <div className="col-lg-6">
                            <div className="card shadow-md border-0 rounded-4 bg-white p-4 h-100">
                                <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
                                    <h5 className="fw-bold text-dark m-0">
                                        <FaList className="text-success me-2" /> Test Case Breakdown
                                    </h5>
                                    <span className="fw-bold text-primary">
                                        {currentSub.passed_test_cases} / {currentSub.total_test_cases} Passed
                                    </span>
                                </div>

                                {(!currentSub.test_case_results || currentSub.test_case_results.length === 0) ? (
                                    <div className="text-muted small py-4 text-center">No individual test case breakdowns recorded.</div>
                                ) : (
                                    <div className="d-flex flex-column gap-3" style={{ maxHeight: "460px", overflowY: "auto" }}>
                                        {currentSub.test_case_results.map((tc, i) => (
                                            <div key={i} className={`p-3 rounded-3 border ${tc.passed ? 'bg-success-subtle border-success-subtle' : 'bg-danger-subtle border-danger-subtle'}`}>
                                                <div className="d-flex justify-content-between align-items-center mb-1">
                                                    <span className="fw-bold text-dark">
                                                        Test Case #{i + 1} {tc.is_hidden ? "(Hidden)" : "(Visible)"}
                                                    </span>
                                                    <span className={`badge ${tc.passed ? 'bg-success' : 'bg-danger'}`}>
                                                        {tc.passed ? 'PASSED ✓' : 'FAILED ✗'}
                                                    </span>
                                                </div>

                                                {!tc.is_hidden && (
                                                    <div className="small text-secondary mt-2">
                                                        <div><strong>Input:</strong> <code>{tc.input}</code></div>
                                                        <div><strong>Expected Output:</strong> <code>{tc.expected_output}</code></div>
                                                        <div><strong>Actual Output:</strong> <code>{tc.actual_output || "(blank)"}</code></div>
                                                    </div>
                                                )}

                                                {tc.error_message && (
                                                    <div className="small text-danger mt-1 font-monospace">
                                                        <strong>Error:</strong> {tc.error_message}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                )}

                {/* Bottom Action Footer Banner */}
                <div className="card shadow-lg border-0 rounded-4 bg-white p-4 text-center mb-5">
                    {canAttemptAgain ? (
                        <div>
                            <h5 className="fw-bold text-dark mb-2">You Have Attempts Remaining!</h5>
                            <p className="text-muted small mb-3">
                                You have used {attempt_number} of {isUnlimited ? "Unlimited" : allowedAttempts} allowed attempts. If you wish to improve your score, you can initiate a fresh attempt session.
                            </p>
                            <button
                                className="btn btn-success btn-lg fw-bold rounded-pill px-5 shadow"
                                onClick={() => navigate(`/student/coding-assessments/${assessment_id || 1}/solve?new_attempt=true`)}
                            >
                                <FaRedo className="me-2" /> Attempt Again
                            </button>
                        </div>
                    ) : (
                        <div className="py-2">
                            <div className="d-inline-flex align-items-center justify-content-center bg-secondary-subtle p-3 rounded-circle mb-3">
                                <FaShieldAlt className="display-6 text-secondary" />
                            </div>
                            <h5 className="fw-bold text-dark mb-2">This Assessment Has Been Completed</h5>
                            <p className="text-secondary small mb-3">
                                Maximum attempt limit reached ({allowedAttempts} of {allowedAttempts} attempts used). Your final score has been locked and updated on the leaderboard.
                            </p>
                            <button className="btn btn-primary fw-bold rounded-pill px-4" onClick={() => navigate("/student/coding-attempts")}>
                                View All My Coding Attempts
                            </button>
                        </div>
                    )}
                </div>

            </div>
        </>
    );
}

export default StudentAssessmentResult;
