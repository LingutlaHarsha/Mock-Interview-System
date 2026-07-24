import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import {
    getStudentAssessmentDetail,
    runStudentCode,
    submitStudentCode
} from "../../services/codingService";
import {
    FaArrowLeft, FaPlay, FaPaperPlane, FaClock, FaCheckCircle,
    FaExclamationTriangle, FaCode, FaTrophy, FaBookmark, FaFlag,
    FaArrowRight, FaSave, FaEye, FaQuestionCircle, FaCheck
} from "react-icons/fa";

const BOILERPLATE_CODE = {
    python: `# Write your Python solution below
class Solution:
    def solve(self, input_data):
        # Your algorithm logic here
        return input_data
`,
    java: `// Write your Java solution below
public class Solution {
    public static void main(String[] args) {
        // Your algorithm logic here
    }
}
`,
    cpp: `// Write your C++ solution below
#include <iostream>
using namespace std;

int main() {
    // Your algorithm logic here
    return 0;
}
`,
    c: `// Write your C solution below
#include <stdio.h>

int main() {
    // Your algorithm logic here
    return 0;
}
`,
    javascript: `// Write your JavaScript solution below
function solve(inputData) {
    // Your algorithm logic here
    return inputData;
}
`
};

function StudentCodingEnvironment() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const isNewAttemptRequested = searchParams.get("new_attempt") === "true";

    const [assessment, setAssessment] = useState(null);
    const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);

    // Independent Per-Question & Per-Language State Management
    // editorStates: { [qId]: { python: "...", java: "..." } }
    const [editorStates, setEditorStates] = useState({});
    // questionLanguages: { [qId]: "python" }
    const [questionLanguages, setQuestionLanguages] = useState({});
    // savedCodes: { [qId]: { code: "...", language: "python", savedAt: "..." } }
    const [savedCodes, setSavedCodes] = useState({});
    // runResults: { [qId]: outputConsoleObj }
    const [runResults, setRunResults] = useState({});
    // questionStatuses: { [qId]: 'not_visited' | 'visited' | 'saved' | 'flagged' }
    const [questionStatuses, setQuestionStatuses] = useState({});

    const [running, setRunning] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [msg, setMsg] = useState({ type: "", text: "" });

    // Submission Review & Confirmation Modal State
    const [showSubmitConfirmModal, setShowSubmitConfirmModal] = useState(false);

    // Sticky Timer State & Ref
    const [timeLeftSeconds, setTimeLeftSeconds] = useState(3600);
    const timerRef = useRef(null);

    useEffect(() => {
        loadAssessment();
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [id]);

    useEffect(() => {
        if (!assessment || !assessment.duration_minutes) return;

        if (timerRef.current) clearInterval(timerRef.current);
        setTimeLeftSeconds(assessment.duration_minutes * 60);

        timerRef.current = setInterval(() => {
            setTimeLeftSeconds(prev => {
                if (prev <= 1) {
                    if (timerRef.current) clearInterval(timerRef.current);
                    alert("Time limit expired for this technical assessment!");
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [assessment]);

    const getDraftStorageKey = (qId, lang) => `coding_draft_${id}_${qId}_${lang}`;

    const loadAssessment = async () => {
        try {
            const res = await getStudentAssessmentDetail(id);
            const data = res.data;

            if (data.is_locked || (data.remaining_attempts === 0 && !isNewAttemptRequested)) {
                if (data.latest_submission_id) {
                    navigate(`/student/coding-assessments/results/${data.latest_submission_id}`, { replace: true });
                } else {
                    navigate("/student/coding-attempts", { replace: true });
                }
                return;
            }

            setAssessment(data);

            // Initialize question states
            const initialLangs = {};
            const initialStates = {};
            const initialStatuses = {};
            const defaultLang = (data.allowed_languages && data.allowed_languages.length > 0)
                ? (data.allowed_languages[0].toLowerCase() === 'c++' ? 'cpp' : data.allowed_languages[0].toLowerCase() === 'js' ? 'javascript' : data.allowed_languages[0].toLowerCase())
                : 'python';

            (data.questions || []).forEach((q, index) => {
                initialLangs[q.id] = defaultLang;
                
                // Try restoring draft from localStorage
                const savedDraft = localStorage.getItem(getDraftStorageKey(q.id, defaultLang));
                const initialCode = savedDraft !== null ? savedDraft : (BOILERPLATE_CODE[defaultLang] || BOILERPLATE_CODE.python);
                
                initialStates[q.id] = { [defaultLang]: initialCode };
                initialStatuses[q.id] = index === 0 ? 'visited' : 'not_visited';
            });

            setQuestionLanguages(initialLangs);
            setEditorStates(initialStates);
            setQuestionStatuses(initialStatuses);

        } catch (error) {
            console.error("Failed to load assessment details", error);
            setMsg({ type: "danger", text: "Failed to load coding assessment." });
        }
    };

    const currentQuestion = assessment?.questions?.[activeQuestionIndex];
    const currentQuestionId = currentQuestion?.id;
    const currentLang = questionLanguages[currentQuestionId] || 'python';
    
    // Get current question code safely
    const currentCode = editorStates[currentQuestionId]?.[currentLang] !== undefined
        ? editorStates[currentQuestionId][currentLang]
        : (localStorage.getItem(getDraftStorageKey(currentQuestionId, currentLang)) || (BOILERPLATE_CODE[currentLang] || BOILERPLATE_CODE.python));

    // Handle code editing with instant auto-save to editorStates & localStorage
    const handleCodeChange = (newCode) => {
        if (!currentQuestionId) return;

        setEditorStates(prev => ({
            ...prev,
            [currentQuestionId]: {
                ...(prev[currentQuestionId] || {}),
                [currentLang]: newCode
            }
        }));

        // Auto-save to localStorage
        localStorage.setItem(getDraftStorageKey(currentQuestionId, currentLang), newCode);
    };

    // Handle changing programming language for active question
    const handleLanguageChange = (e) => {
        const newLang = e.target.value;
        if (!currentQuestionId) return;

        setQuestionLanguages(prev => ({
            ...prev,
            [currentQuestionId]: newLang
        }));

        // Retrieve existing code for new language or load draft / boilerplate
        const existingLangCode = editorStates[currentQuestionId]?.[newLang];
        if (existingLangCode === undefined) {
            const savedDraft = localStorage.getItem(getDraftStorageKey(currentQuestionId, newLang));
            const initialCode = savedDraft !== null ? savedDraft : (BOILERPLATE_CODE[newLang] || BOILERPLATE_CODE.python);
            
            setEditorStates(prev => ({
                ...prev,
                [currentQuestionId]: {
                    ...(prev[currentQuestionId] || {}),
                    [newLang]: initialCode
                }
            }));
        }
    };

    // Reset current question code to default template
    const handleResetCode = () => {
        if (!currentQuestionId) return;
        const resetCode = BOILERPLATE_CODE[currentLang] || BOILERPLATE_CODE.python;
        handleCodeChange(resetCode);
        
        setRunResults(prev => ({
            ...prev,
            [currentQuestionId]: null
        }));
    };

    // Navigate to target question index safely with auto-save & status update
    const switchQuestion = (targetIdx) => {
        if (targetIdx < 0 || targetIdx >= (assessment?.questions || []).length) return;

        // Auto-mark current question as visited if not saved or flagged
        if (currentQuestionId && questionStatuses[currentQuestionId] === 'not_visited') {
            setQuestionStatuses(prev => ({ ...prev, [currentQuestionId]: 'visited' }));
        }

        const targetQuestion = assessment.questions[targetIdx];
        const targetId = targetQuestion.id;

        // Ensure target question status becomes at least 'visited'
        if (questionStatuses[targetId] === 'not_visited') {
            setQuestionStatuses(prev => ({ ...prev, [targetId]: 'visited' }));
        }

        setActiveQuestionIndex(targetIdx);
        setMsg({ type: "", text: "" });
    };

    // Save Question Solution (Marks status as 'saved')
    const handleSaveQuestion = () => {
        if (!currentQuestionId) return;

        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        
        setSavedCodes(prev => ({
            ...prev,
            [currentQuestionId]: {
                code: currentCode,
                language: currentLang,
                savedAt: timeStr
            }
        }));

        setQuestionStatuses(prev => ({
            ...prev,
            [currentQuestionId]: 'saved'
        }));

        setMsg({ type: "success", text: `Question ${activeQuestionIndex + 1} solution saved successfully at ${timeStr}!` });
    };

    // Toggle Flag for Review for current question
    const handleToggleFlag = () => {
        if (!currentQuestionId) return;

        setQuestionStatuses(prev => {
            const currentStatus = prev[currentQuestionId];
            const newStatus = currentStatus === 'flagged' ? (savedCodes[currentQuestionId] ? 'saved' : 'visited') : 'flagged';
            return { ...prev, [currentQuestionId]: newStatus };
        });
    };

    // Run active question code against visible test cases
    const handleRunCode = async () => {
        if (!currentQuestionId) return;

        try {
            setRunning(true);
            setMsg({ type: "", text: "" });

            const res = await runStudentCode({
                question: currentQuestionId,
                language: currentLang,
                code: currentCode
            });

            setRunResults(prev => ({
                ...prev,
                [currentQuestionId]: {
                    type: "run",
                    data: res.data
                }
            }));
        } catch (error) {
            console.error(error);
            setMsg({ type: "danger", text: "Error executing code. Check syntax or code logic." });
        } finally {
            setRunning(false);
        }
    };

    // Calculate Question Summary Metrics for Confirmation Dialog
    const questionsList = assessment?.questions || [];
    const totalQuestionsCount = questionsList.length;
    
    const savedCount = Object.keys(questionStatuses).filter(qId => 
        questionStatuses[qId] === 'saved' || savedCodes[qId]
    ).length;

    const flaggedCount = Object.values(questionStatuses).filter(st => st === 'flagged').length;
    const unansweredCount = totalQuestionsCount - savedCount;

    // Open Final Submit Confirmation Modal
    const handleOpenSubmitConfirmation = () => {
        setShowSubmitConfirmModal(true);
    };

    // Final Assessment Submission Handler
    const handleConfirmSubmit = async () => {
        if (!assessment) return;

        try {
            setSubmitting(true);
            setShowSubmitConfirmModal(false);
            setMsg({ type: "", text: "Evaluating all questions & processing final submission..." });

            // Stop timer session
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
            setTimeLeftSeconds(0);

            // Collect solutions for ALL questions
            const submissionsPayload = questionsList.map(q => {
                const qLang = questionLanguages[q.id] || 'python';
                const qCode = savedCodes[q.id]?.code || editorStates[q.id]?.[qLang] || (localStorage.getItem(getDraftStorageKey(q.id, qLang)) || (BOILERPLATE_CODE[qLang] || BOILERPLATE_CODE.python));
                return {
                    question: q.id,
                    language: qLang,
                    code: qCode
                };
            });

            // Clean up localStorage drafts for this assessment
            questionsList.forEach(q => {
                (assessment.allowed_languages || ["python", "java", "c", "cpp", "javascript"]).forEach(l => {
                    const lKey = l.toLowerCase() === 'c++' ? 'cpp' : l.toLowerCase() === 'js' ? 'javascript' : l.toLowerCase();
                    localStorage.removeItem(getDraftStorageKey(q.id, lKey));
                });
            });

            const res = await submitStudentCode({
                assessment: assessment.id,
                submissions: submissionsPayload
            });

            if (res.data?.submission_id) {
                navigate(`/student/coding-assessments/results/${res.data.submission_id}`, { replace: true });
            } else {
                navigate("/student/coding-attempts", { replace: true });
            }
        } catch (error) {
            console.error(error);
            const errMsg = error.response?.data?.detail || "Submission failed. Check your network connection.";
            setMsg({ type: "danger", text: errMsg });
        } finally {
            setSubmitting(false);
        }
    };

    const formatTimer = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    if (!assessment || !currentQuestion) {
        return (
            <>
                <Sidebar activeRole="student" />
                <Navbar title="Coding Platform" userRole="student" />
                <div className="container" style={{ marginLeft: "260px", paddingTop: "90px" }}>
                    <div className="text-center py-5">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading environment...</span>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    const currentRunResult = runResults[currentQuestionId];

    return (
        <>
            <Sidebar activeRole="student" />
            <Navbar title="Coding Assessment Platform" userRole="student" />

            <div className="container-fluid" style={{ marginLeft: "260px", paddingTop: "90px", paddingRight: "30px", maxWidth: "calc(100% - 260px)" }}>
                
                {/* Header Toolbar */}
                <div className="card shadow-sm border-0 rounded-4 bg-white p-3 mb-3 d-flex flex-row flex-wrap justify-content-between align-items-center">
                    <div className="d-flex align-items-center gap-3">
                        <button className="btn btn-outline-secondary btn-sm rounded-pill" onClick={() => navigate("/student/coding-assessments")}>
                            <FaArrowLeft /> Exit
                        </button>
                        <div>
                            <h5 className="fw-bold text-dark m-0">{assessment.title}</h5>
                            <span className="badge bg-primary me-2">{assessment.difficulty}</span>
                            <span className="small text-muted me-3">Max Marks: {assessment.max_marks} pts</span>
                            <span className="small text-primary fw-bold">
                                Attempts Used: {assessment.attempts_used} / {assessment.allowed_attempts === 0 ? 'Unlimited' : assessment.allowed_attempts}
                            </span>
                        </div>
                    </div>

                    <div className="d-flex align-items-center gap-3">
                        {/* Sticky Timer */}
                        {assessment.duration_minutes > 0 && (
                            <div className="bg-dark text-warning px-3 py-1.5 rounded-pill fw-bold font-monospace d-flex align-items-center gap-1 shadow-sm">
                                <FaClock /> {formatTimer(timeLeftSeconds)}
                            </div>
                        )}

                        <button className="btn btn-success fw-bold rounded-pill px-4 shadow-sm" onClick={handleOpenSubmitConfirmation}>
                            <FaPaperPlane className="me-2" /> Finish & Submit Assessment
                        </button>
                    </div>
                </div>

                {msg.text && (
                    <div className={`alert alert-${msg.type} py-2 px-3 mb-3 small fw-semibold rounded-3 d-flex align-items-center justify-content-between`}>
                        <div>{msg.text}</div>
                        <button type="button" className="btn-close" onClick={() => setMsg({ type: "", text: "" })}></button>
                    </div>
                )}

                {/* 3-Column Layout: Left (Question Info) | Middle (Editor & Console) | Right (Question Palette) */}
                <div className="row g-3">
                    
                    {/* Column 1: Question Description, Constraints & Visible Test Cases */}
                    <div className="col-lg-5">
                        <div className="card shadow-md border-0 rounded-4 bg-white p-4 h-100" style={{ minHeight: "680px", maxHeight: "780px", overflowY: "auto" }}>
                            
                            <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
                                <div>
                                    <h5 className="fw-bold text-success m-0">
                                        Q{activeQuestionIndex + 1}. {currentQuestion.title}
                                    </h5>
                                    {savedCodes[currentQuestionId] && (
                                        <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-0.5 rounded-pill extra-small mt-1">
                                            Saved at {savedCodes[currentQuestionId].savedAt}
                                        </span>
                                    )}
                                </div>
                                <span className="badge bg-success text-white px-3 py-1.5 rounded-pill fw-bold fs-6">
                                    {currentQuestion.marks} Marks
                                </span>
                            </div>

                            <div className="mb-4">
                                <h6 className="fw-bold text-dark mb-2">Problem Description</h6>
                                <p className="text-secondary small whitespace-pre-line m-0" style={{ lineHeight: "1.6" }}>
                                    {currentQuestion.description || "No description provided."}
                                </p>
                            </div>

                            {currentQuestion.constraints && (
                                <div className="mb-4">
                                    <h6 className="fw-bold text-dark mb-2">Constraints</h6>
                                    <pre className="bg-light p-3 rounded-3 small font-monospace text-danger border m-0">
                                        {currentQuestion.constraints}
                                    </pre>
                                </div>
                            )}

                            {/* Examples */}
                            {currentQuestion.examples && currentQuestion.examples.length > 0 && (
                                <div className="mb-4">
                                    <h6 className="fw-bold text-dark mb-2">Examples</h6>
                                    {currentQuestion.examples.map((ex, idx) => (
                                        <div key={idx} className="bg-light p-3 rounded-3 mb-2 border small">
                                            <div className="font-monospace"><strong>Input:</strong> {ex.input}</div>
                                            <div className="font-monospace text-primary"><strong>Output:</strong> {ex.output}</div>
                                            {ex.explanation && <div className="text-muted extra-small mt-1"><strong>Explanation:</strong> {ex.explanation}</div>}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Visible Test Cases Section */}
                            {(() => {
                                const rawVisible = currentQuestion.visible_test_cases || (currentQuestion.test_cases ? currentQuestion.test_cases.filter(tc => !tc.is_hidden) : []);
                                const displayVisibleCases = rawVisible.length > 0 ? rawVisible : (currentQuestion.examples || []).map((ex, i) => ({
                                    id: `ex-${i}`,
                                    input_data: ex.input,
                                    expected_output: ex.output,
                                    explanation: ex.explanation
                                }));

                                return (
                                    <div className="mt-4 pt-3 border-top">
                                        <h6 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
                                            <FaCode className="text-primary" /> Visible Test Cases ({displayVisibleCases.length})
                                        </h6>

                                        {displayVisibleCases.length === 0 ? (
                                            <div className="text-muted small fst-italic py-2">No visible test cases available for this question.</div>
                                        ) : (
                                            <div className="d-flex flex-column gap-3">
                                                {displayVisibleCases.map((tc, i) => (
                                                    <div key={tc.id || i} className="bg-light p-3 rounded-3 border">
                                                        <div className="fw-bold text-primary small mb-2">Test Case #{i + 1}</div>
                                                        <div className="mb-2">
                                                            <label className="extra-small text-muted fw-semibold">Input</label>
                                                            <pre className="bg-white p-2 rounded border small font-monospace m-0">{tc.input_data !== undefined ? tc.input_data : tc.input}</pre>
                                                        </div>
                                                        <div className="mb-2">
                                                            <label className="extra-small text-muted fw-semibold">Expected Output</label>
                                                            <pre className="bg-white p-2 rounded border small font-monospace text-success m-0">{tc.expected_output !== undefined ? tc.expected_output : tc.output}</pre>
                                                        </div>
                                                        {tc.explanation && (
                                                            <div>
                                                                <label className="extra-small text-muted fw-semibold">Explanation</label>
                                                                <div className="small text-muted fst-italic">{tc.explanation}</div>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })()}

                        </div>
                    </div>

                    {/* Column 2: Code Editor, Navigation Bar & Execution Console */}
                    <div className="col-lg-5">
                        <div className="card shadow-md border-0 rounded-4 bg-white p-4 h-100 d-flex flex-column" style={{ minHeight: "680px", maxHeight: "780px" }}>
                            
                            {/* Language Selector Toolbar */}
                            <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
                                <div className="d-flex align-items-center gap-2">
                                    <label className="fw-bold small text-secondary">Language:</label>
                                    <select
                                        className="form-select form-select-sm fw-semibold rounded-pill border-primary"
                                        style={{ width: "150px" }}
                                        value={currentLang}
                                        onChange={handleLanguageChange}
                                    >
                                        {(assessment.allowed_languages || ["Python", "Java", "C", "C++", "JavaScript"]).map(l => {
                                            const val = l.toLowerCase() === 'c++' ? 'cpp' : l.toLowerCase() === 'js' ? 'javascript' : l.toLowerCase();
                                            return <option key={l} value={val}>{l}</option>;
                                        })}
                                    </select>
                                </div>
                                <button className="btn btn-outline-secondary btn-sm rounded-pill px-3" onClick={handleResetCode}>
                                    Reset Code
                                </button>
                            </div>

                            {/* Code Editor */}
                            <div className="flex-grow-1 mb-3 position-relative" style={{ minHeight: "260px" }}>
                                <textarea
                                    className="form-control font-monospace bg-dark text-white p-3 rounded-4 h-100 w-100"
                                    style={{ fontSize: "14px", lineHeight: "1.5", resize: "none" }}
                                    value={currentCode}
                                    onChange={(e) => handleCodeChange(e.target.value)}
                                    spellCheck="false"
                                ></textarea>
                            </div>

                            {/* Question Action Navigation Bar */}
                            <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3 p-2 bg-light rounded-4 border">
                                <div className="d-flex gap-2">
                                    <button
                                        className="btn btn-outline-secondary btn-sm rounded-pill px-3 fw-semibold"
                                        disabled={activeQuestionIndex === 0}
                                        onClick={() => switchQuestion(activeQuestionIndex - 1)}
                                    >
                                        <FaArrowLeft className="me-1" /> Prev
                                    </button>

                                    <button
                                        className={`btn btn-sm rounded-pill px-3 fw-semibold ${questionStatuses[currentQuestionId] === 'flagged' ? 'btn-warning text-dark' : 'btn-outline-warning text-dark'}`}
                                        onClick={handleToggleFlag}
                                    >
                                        <FaFlag className="me-1" /> {questionStatuses[currentQuestionId] === 'flagged' ? 'Flagged' : 'Flag'}
                                    </button>
                                </div>

                                <div className="d-flex gap-2">
                                    <button
                                        className="btn btn-success btn-sm rounded-pill px-3 fw-bold shadow-sm"
                                        onClick={handleSaveQuestion}
                                    >
                                        <FaSave className="me-1" /> Save Question
                                    </button>

                                    <button
                                        className="btn btn-outline-primary btn-sm rounded-pill px-3 fw-semibold"
                                        onClick={handleRunCode}
                                        disabled={running || submitting}
                                    >
                                        {running ? "Running..." : <><FaPlay className="me-1" /> Run</>}
                                    </button>

                                    {activeQuestionIndex < questionsList.length - 1 ? (
                                        <button
                                            className="btn btn-primary btn-sm rounded-pill px-3 fw-semibold"
                                            onClick={() => switchQuestion(activeQuestionIndex + 1)}
                                        >
                                            Next <FaArrowRight className="ms-1" />
                                        </button>
                                    ) : (
                                        <button
                                            className="btn btn-success btn-sm rounded-pill px-3 fw-bold"
                                            onClick={handleOpenSubmitConfirmation}
                                        >
                                            Finish <FaCheck className="ms-1" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Output Console Display for Current Question */}
                            {currentRunResult && (
                                <div className="bg-dark text-white p-3 rounded-4 overflow-auto font-monospace small" style={{ maxHeight: "180px" }}>
                                    <div className="d-flex justify-content-between align-items-center mb-2 pb-1 border-bottom border-secondary">
                                        <span className="fw-bold text-info">
                                            Execution Console (Visible Cases - Q{activeQuestionIndex + 1})
                                        </span>
                                        <span className="badge bg-secondary">
                                            {currentRunResult.data?.execution_time_ms ? `${currentRunResult.data.execution_time_ms} ms` : ''}
                                        </span>
                                    </div>

                                    {currentRunResult.data?.results && (
                                        <div className="d-flex flex-column gap-2">
                                            {currentRunResult.data.results.map((r, idx) => (
                                                <div key={idx} className="border-bottom border-secondary pb-2">
                                                    <div className="d-flex justify-content-between">
                                                        <span className="fw-semibold text-white">Test Case #{idx + 1}</span>
                                                        <span className={r.passed ? 'text-success fw-bold' : 'text-danger fw-bold'}>
                                                            {r.passed ? 'PASSED ✓' : 'FAILED ✗'}
                                                        </span>
                                                    </div>

                                                    {r.error_message && (
                                                        <div className="text-warning mt-1 font-monospace">{r.error_message}</div>
                                                    )}

                                                    {!r.is_hidden && (
                                                        <div className="mt-1 font-monospace extra-small">
                                                            <div><strong>Input:</strong> {r.input}</div>
                                                            <div><strong>Expected Output:</strong> {r.expected_output}</div>
                                                            <div><strong>Actual Output:</strong> {r.actual_output}</div>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                </div>
                            )}

                        </div>
                    </div>

                    {/* Column 3: Question Palette Sidebar */}
                    <div className="col-lg-2">
                        <div className="card shadow-md border-0 rounded-4 bg-white p-3 h-100 d-flex flex-column justify-content-between" style={{ minHeight: "680px", maxHeight: "780px" }}>
                            <div>
                                <h6 className="fw-bold text-dark mb-3 pb-2 border-bottom d-flex align-items-center gap-2">
                                    <FaQuestionCircle className="text-primary" /> Question Palette
                                </h6>

                                {/* Question Buttons Grid */}
                                <div className="d-grid gap-2" style={{ gridTemplateColumns: "repeat(2, 1fr)" }}>
                                    {questionsList.map((q, idx) => {
                                        const status = questionStatuses[q.id] || 'not_visited';
                                        const isActive = idx === activeQuestionIndex;
                                        const isSaved = status === 'saved' || savedCodes[q.id];
                                        const isFlagged = status === 'flagged';
                                        const isVisited = status === 'visited';

                                        let btnClass = "btn-light text-secondary border";
                                        if (isSaved) btnClass = "btn-success text-white";
                                        else if (isFlagged) btnClass = "btn-warning text-dark";
                                        else if (isVisited) btnClass = "btn-info text-white";

                                        return (
                                            <button
                                                key={q.id}
                                                className={`btn btn-sm fw-bold p-2.5 rounded-3 d-flex flex-column align-items-center justify-content-center ${btnClass} ${isActive ? 'ring-4 ring-primary border-primary border-3 shadow' : ''}`}
                                                onClick={() => switchQuestion(idx)}
                                            >
                                                <span>Q{idx + 1}</span>
                                                <span className="extra-small opacity-75" style={{ fontSize: "10px" }}>
                                                    {isSaved ? "Saved ✓" : isFlagged ? "Flagged 🚩" : isVisited ? "Visited" : "Not Visited"}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Status Legend Box */}
                            <div className="bg-light p-2.5 rounded-3 border mt-3 extra-small">
                                <div className="fw-bold text-dark mb-2 border-bottom pb-1">Status Legend</div>
                                <div className="d-flex align-items-center gap-2 mb-1">
                                    <span className="badge bg-success rounded-circle px-1 py-1">✓</span>
                                    <span>Saved ({savedCount})</span>
                                </div>
                                <div className="d-flex align-items-center gap-2 mb-1">
                                    <span className="badge bg-warning text-dark rounded-circle px-1 py-1">🚩</span>
                                    <span>Flagged ({flaggedCount})</span>
                                </div>
                                <div className="d-flex align-items-center gap-2 mb-1">
                                    <span className="badge bg-info text-white rounded-circle px-1 py-1">👁</span>
                                    <span>Visited ({Object.values(questionStatuses).filter(s => s === 'visited').length})</span>
                                </div>
                                <div className="d-flex align-items-center gap-2">
                                    <span className="badge bg-secondary rounded-circle px-1 py-1">-</span>
                                    <span>Not Visited ({Object.values(questionStatuses).filter(s => s === 'not_visited').length})</span>
                                </div>
                            </div>

                        </div>
                    </div>

                </div>

                {/* Submit Confirmation & Review Modal */}
                {showSubmitConfirmModal && (
                    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content rounded-4 border-0 shadow-lg p-3">
                                <div className="modal-header border-0 pb-0">
                                    <h5 className="modal-title fw-bold text-dark d-flex align-items-center gap-2">
                                        <FaExclamationTriangle className="text-warning fs-4" /> Confirm Assessment Submission
                                    </h5>
                                    <button type="button" className="btn-close" onClick={() => setShowSubmitConfirmModal(false)}></button>
                                </div>
                                <div className="modal-body py-3">
                                    
                                    {/* Assessment Summary Breakdown */}
                                    <div className="bg-light p-3 rounded-4 mb-3 border">
                                        <h6 className="fw-bold text-dark mb-2">Submission Summary</h6>
                                        <div className="row g-2 small">
                                            <div className="col-6"><strong>Total Questions:</strong> {totalQuestionsCount}</div>
                                            <div className="col-6 text-success"><strong>Saved / Answered:</strong> {savedCount}</div>
                                            <div className="col-6 text-danger"><strong>Unanswered:</strong> {unansweredCount}</div>
                                            <div className="col-6 text-warning"><strong>Flagged for Review:</strong> {flaggedCount}</div>
                                        </div>
                                    </div>

                                    {unansweredCount > 0 ? (
                                        <div className="alert alert-warning py-2 px-3 small fw-semibold mb-0 rounded-3">
                                            ⚠️ You still have <strong>{unansweredCount}</strong> unanswered question(s). Are you sure you want to submit your assessment?
                                        </div>
                                    ) : (
                                        <p className="text-secondary small mb-0" style={{ fontSize: "14px", lineHeight: "1.6" }}>
                                            All questions have been saved! Are you ready to submit your assessment solutions for evaluation?
                                        </p>
                                    )}

                                </div>
                                <div className="modal-footer border-0 pt-0 d-flex justify-content-end gap-2">
                                    <button className="btn btn-secondary rounded-pill px-4 fw-semibold" onClick={() => setShowSubmitConfirmModal(false)}>
                                        Continue Assessment
                                    </button>
                                    <button className="btn btn-success rounded-pill px-4 fw-bold shadow-sm" onClick={handleConfirmSubmit} disabled={submitting}>
                                        {submitting ? "Submitting..." : "✓ Submit Assessment"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </>
    );
}

export default StudentCodingEnvironment;
