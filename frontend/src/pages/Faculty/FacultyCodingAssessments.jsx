import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import {
    getFacultyAssessments,
    getFacultyAssessmentDetail,
    parseLeetCodeURL,
    createAssessment,
    updateAssessment,
    deleteAssessment,
    duplicateAssessment,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    createTestCase,
    deleteTestCase
} from "../../services/codingService";
import {
    FaCode, FaPlus, FaCopy, FaEdit, FaTrash, FaEye, FaTrophy,
    FaCheckCircle, FaExclamationCircle, FaClock, FaList, FaVial, FaTimes, FaBolt, FaLink, FaMagic, FaExclamationTriangle, FaCheck
} from "react-icons/fa";

const ALL_LANGUAGES = ["Python", "Java", "C", "C++", "JavaScript"];
const ALL_TOPICS = ["Arrays", "Strings", "Linked Lists", "Stacks", "Queues", "Trees", "Graphs", "DP", "Sorting", "Searching"];

const LEETCODE_PRESETS = [
    {
        title: "Two Sum (LeetCode #1)",
        difficulty: "Easy",
        marks: 20,
        description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.",
        constraints: "2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\n-10^9 <= target <= 10^9",
        examples: [{ input: "2 7 11 15\n9", output: "0 1", explanation: "nums[0] + nums[1] == 9, so return 0 1" }]
    },
    {
        title: "Add Two Numbers (LeetCode #2)",
        difficulty: "Medium",
        marks: 25,
        description: "You are given two non-empty linked lists representing two non-negative integers. The digits are stored in reverse order, and each of their nodes contains a single digit. Add the two numbers and return the sum as a linked list.",
        constraints: "The number of nodes in each linked list is in the range [1, 100].\n0 <= Node.val <= 9",
        examples: [{ input: "2 4 3\n5 6 4", output: "7 0 8", explanation: "342 + 465 = 807." }]
    },
    {
        title: "Longest Substring Without Repeating Characters (LeetCode #3)",
        difficulty: "Medium",
        marks: 25,
        description: "Given a string s, find the length of the longest substring without repeating characters.",
        constraints: "0 <= s.length <= 5 * 10^4\ns consists of English letters, digits, symbols and spaces.",
        examples: [{ input: "abcabcbb", output: "3", explanation: "The answer is 'abc', with the length of 3." }]
    },
    {
        title: "Palindrome Number (LeetCode #9)",
        difficulty: "Easy",
        marks: 15,
        description: "Given an integer x, return true if x is a palindrome, and false otherwise.",
        constraints: "-2^31 <= x <= 2^31 - 1",
        examples: [{ input: "121", output: "true", explanation: "121 reads as 121 from left to right and right to left." }]
    },
    {
        title: "Container With Most Water (LeetCode #11)",
        difficulty: "Medium",
        marks: 25,
        description: "You are given an integer array height of length n. There are n vertical lines drawn such that the two endpoints of the ith line are (i, 0) and (i, height[i]). Find two lines that together with the x-axis form a container, such that the container contains the most water.",
        constraints: "n == height.length\n2 <= n <= 10^5\n0 <= height[i] <= 10^4",
        examples: [{ input: "1 8 6 2 5 4 8 3 7", output: "49", explanation: "The max area of water the container can contain is 49." }]
    },
    {
        title: "3Sum (LeetCode #15)",
        difficulty: "Medium",
        marks: 30,
        description: "Given an integer array nums, return all the triplets [nums[i], nums[j], nums[k]] such that i != j, i != k, and j != k, and nums[i] + nums[j] + nums[k] == 0.",
        constraints: "3 <= nums.length <= 3000\n-10^5 <= nums[i] <= 10^5",
        examples: [{ input: "-1 0 1 2 -1 -4", output: "-1 -1 2\n-1 0 1", explanation: "Distinct triplets summing to 0." }]
    },
    {
        title: "Valid Parentheses (LeetCode #20)",
        difficulty: "Easy",
        marks: 20,
        description: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
        constraints: "1 <= s.length <= 10^4\ns consists of parentheses only '()[]{}'.",
        examples: [{ input: "()[]{}", output: "true", explanation: "All brackets match correctly." }]
    }
];

function FacultyCodingAssessments() {
    const navigate = useNavigate();
    const [assessments, setAssessments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState({ type: "", text: "" });

    // Assessment Modal State
    const [showAssessmentModal, setShowAssessmentModal] = useState(false);
    const [editingAssessmentId, setEditingAssessmentId] = useState(null);
    const [leetcodePresetSet, setLeetcodePresetSet] = useState("none");
    const [assessmentForm, setAssessmentForm] = useState({
        title: "",
        description: "",
        difficulty: "Medium",
        duration_minutes: 60,
        max_marks: 100,
        total_questions_allowed: 5,
        start_date: new Date().toISOString().split("T")[0],
        start_time: "09:00",
        deadline_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        deadline_time: "23:59",
        allowed_attempts: 1,
        visibility: "Public",
        allowed_languages: ["Python", "Java", "C", "C++", "JavaScript"],
        instructions: "1. Read all problem statements carefully.\n2. Ensure your code passes both visible and hidden test cases."
    });

    // Manage Questions Modal State
    const [showQuestionsModal, setShowQuestionsModal] = useState(false);
    const [modalMsg, setModalMsg] = useState({ type: "", text: "" });
    const [selectedAssessment, setSelectedAssessment] = useState(null);
    const [customLeetCodeInput, setCustomLeetCodeInput] = useState("");
    const [editingQuestionId, setEditingQuestionId] = useState(null);
    const [questionForm, setQuestionForm] = useState({
        title: "",
        difficulty: "Medium",
        marks: 25,
        topic: "Arrays",
        description: "",
        constraints: "",
        input_format: "",
        output_format: "",
        examples: []
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const res = await getFacultyAssessments();
            setAssessments(res.data);
        } catch (error) {
            console.error("Load assessments error", error);
            setMsg({ type: "danger", text: "Failed to load assessments from server." });
        } finally {
            setLoading(false);
        }
    };

    const handleOpenCreateModal = () => {
        setEditingAssessmentId(null);
        setLeetcodePresetSet("none");
        setAssessmentForm({
            title: "",
            description: "",
            difficulty: "Medium",
            duration_minutes: 60,
            max_marks: 100,
            total_questions_allowed: 5,
            start_date: new Date().toISOString().split("T")[0],
            start_time: "09:00",
            deadline_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
            deadline_time: "23:59",
            allowed_attempts: 1,
            visibility: "Public",
            allowed_languages: ["Python", "Java", "C", "C++", "JavaScript"],
            instructions: "1. Read all problem statements carefully.\n2. Ensure your code passes both visible and hidden test cases."
        });
        setShowAssessmentModal(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleOpenEditModal = (assessment) => {
        setEditingAssessmentId(assessment.id);
        setLeetcodePresetSet("none");
        setAssessmentForm({
            title: assessment.title,
            description: assessment.description || "",
            difficulty: assessment.difficulty || "Medium",
            duration_minutes: assessment.duration_minutes || 60,
            max_marks: assessment.max_marks || 100,
            total_questions_allowed: assessment.total_questions_allowed || 5,
            start_date: assessment.start_date,
            start_time: assessment.start_time,
            deadline_date: assessment.deadline_date,
            deadline_time: assessment.deadline_time,
            allowed_attempts: assessment.allowed_attempts !== undefined ? assessment.allowed_attempts : 1,
            visibility: assessment.visibility || "Public",
            allowed_languages: assessment.allowed_languages || ["Python", "Java", "C", "C++", "JavaScript"],
            instructions: assessment.instructions || ""
        });
        setShowAssessmentModal(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleSaveAssessment = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            setMsg({ type: "", text: "" });

            let responseAssessment = null;
            if (editingAssessmentId) {
                const res = await updateAssessment(editingAssessmentId, assessmentForm);
                responseAssessment = res.data;
                setMsg({ type: "success", text: "Assessment updated successfully!" });
            } else {
                const res = await createAssessment(assessmentForm);
                responseAssessment = res.data;
                setMsg({ type: "success", text: "Assessment created successfully!" });

                // Handle 1-Click LeetCode Presets if chosen
                if (leetcodePresetSet !== "none" && responseAssessment?.id) {
                    let presetsToInsert = [];
                    if (leetcodePresetSet === "easy_set") presetsToInsert = LEETCODE_PRESETS.slice(0, 3);
                    else if (leetcodePresetSet === "medium_set") presetsToInsert = LEETCODE_PRESETS.slice(1, 4);
                    else if (leetcodePresetSet === "full_dsa") presetsToInsert = LEETCODE_PRESETS.slice(0, 5);

                    for (let p of presetsToInsert) {
                        const qRes = await createQuestion(responseAssessment.id, {
                            title: p.title,
                            difficulty: p.difficulty,
                            marks: p.marks,
                            description: p.description,
                            constraints: p.constraints,
                            examples: p.examples
                        });
                        // Add test cases
                        if (qRes.data?.id && p.examples) {
                            for (let ex of p.examples) {
                                await createTestCase(qRes.data.id, {
                                    input_data: ex.input,
                                    expected_output: ex.output,
                                    is_hidden: false
                                });
                                await createTestCase(qRes.data.id, {
                                    input_data: ex.input,
                                    expected_output: ex.output,
                                    is_hidden: true
                                });
                            }
                        }
                    }
                }
            }

            setShowAssessmentModal(false);
            loadData();
        } catch (error) {
            console.error("Save assessment error", error);
            const errMsg = error.response?.data?.detail || "Failed to save assessment. Check all fields.";
            setMsg({ type: "danger", text: errMsg });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this assessment?")) return;
        try {
            setMsg({ type: "", text: "" });
            const res = await deleteAssessment(id);
            setMsg({ type: "success", text: res.data?.message || "Assessment deleted successfully." });
            loadData();
        } catch (error) {
            console.error(error);
            setMsg({ type: "danger", text: "Failed to delete assessment." });
        }
    };

    const handleDuplicate = async (id) => {
        try {
            await duplicateAssessment(id);
            setMsg({ type: "success", text: "Assessment duplicated!" });
            loadData();
        } catch (error) {
            console.error(error);
            setMsg({ type: "danger", text: "Failed to duplicate assessment." });
        }
    };

    const handleOpenQuestions = async (assessment) => {
        setModalMsg({ type: "", text: "" });
        try {
            const res = await getFacultyAssessmentDetail(assessment.id);
            setSelectedAssessment(res.data);
        } catch (error) {
            setSelectedAssessment(assessment);
        }
        setEditingQuestionId(null);
        setQuestionForm({
            title: "",
            difficulty: "Medium",
            marks: 25,
            topic: "Arrays",
            description: "",
            constraints: "",
            input_format: "",
            output_format: "",
            examples: []
        });
        setShowQuestionsModal(true);
    };

    const handleParseCustomLeetCode = async () => {
        if (!customLeetCodeInput.trim()) return;
        try {
            setModalMsg({ type: "", text: "" });
            const res = await parseLeetCodeURL(customLeetCodeInput.trim());
            const data = res.data;
            setQuestionForm(prev => ({
                ...prev,
                title: data.title || "LeetCode Problem",
                difficulty: data.difficulty || "Medium",
                marks: data.marks || 25,
                topic: data.topic || "Algorithms",
                description: data.description || "",
                constraints: data.constraints || "",
                examples: data.examples || []
            }));
            setCustomLeetCodeInput("");
            setModalMsg({ type: "success", text: `Parsed LeetCode problem "${data.title}" with dynamic constraints!` });
        } catch (error) {
            console.error("Parse LeetCode API error", error);
            const text = customLeetCodeInput.trim().toLowerCase();
            let matched = LEETCODE_PRESETS.find(p => p.title.toLowerCase().includes(text) || text.includes(p.title.toLowerCase()));

            if (!matched) {
                matched = {
                    title: customLeetCodeInput.split('/').filter(Boolean).pop()?.replace(/-/g, ' ').toUpperCase() || customLeetCodeInput,
                    difficulty: "Medium",
                    marks: 25,
                    description: `Given problem statement for ${customLeetCodeInput}. Implement an efficient algorithm.`,
                    constraints: "1 <= N <= 10^5",
                    examples: [{ input: "5\n1 2 3 4 5", output: "15", explanation: "Sample case execution." }]
                };
            }

            setQuestionForm(prev => ({
                ...prev,
                title: matched.title,
                difficulty: matched.difficulty,
                marks: matched.marks,
                description: matched.description,
                constraints: matched.constraints,
                examples: matched.examples
            }));
            setCustomLeetCodeInput("");
            setModalMsg({ type: "success", text: `Auto-populated details for "${matched.title}"!` });
        }
    };

    const handleAddQuestion = async (e) => {
        e.preventDefault();
        if (!selectedAssessment) return;

        const newQuestionMarks = parseInt(questionForm.marks) || 0;
        const currentOtherMarks = editingQuestionId
            ? (selectedAssessment.questions || []).filter(q => q.id !== editingQuestionId).reduce((sum, q) => sum + (q.marks || 0), 0)
            : currentTotalMarks;

        // Check if adding/updating question exceeds target max marks limit
        if (targetMaxMarks > 0 && (currentOtherMarks + newQuestionMarks > targetMaxMarks)) {
            const remaining = Math.max(0, targetMaxMarks - currentOtherMarks);
            const exceededBy = (currentOtherMarks + newQuestionMarks) - targetMaxMarks;
            setModalMsg({
                type: "danger",
                text: `Cannot ${editingQuestionId ? 'update' : 'save'} question! Total assessment target is ${targetMaxMarks} pts (${currentOtherMarks} pts already allocated). Giving ${newQuestionMarks} pts to this question exceeds the total assessment marks limit by ${exceededBy} pts! (Maximum allowed for this question is ${remaining} pts).`
            });
            return;
        }

        try {
            if (editingQuestionId) {
                await updateQuestion(editingQuestionId, questionForm);
                setModalMsg({ type: "success", text: "Question updated successfully!" });
            } else {
                const qRes = await createQuestion(selectedAssessment.id, questionForm);
                // Create visible & hidden test cases automatically
                if (qRes.data?.id && (questionForm.examples || []).length > 0) {
                    for (let ex of questionForm.examples) {
                        await createTestCase(qRes.data.id, { input_data: ex.input, expected_output: ex.output, is_hidden: false });
                        await createTestCase(qRes.data.id, { input_data: ex.input, expected_output: ex.output, is_hidden: true });
                    }
                }
                setModalMsg({ type: "success", text: "Question added! You can now add the next question below." });
            }

            // Refresh selected assessment details in real time inside the modal without closing!
            const updatedDetail = await getFacultyAssessmentDetail(selectedAssessment.id);
            setSelectedAssessment(updatedDetail.data);

            // Reset form for next question entry
            setEditingQuestionId(null);
            setQuestionForm({
                title: "",
                difficulty: "Medium",
                marks: 25,
                topic: "Arrays",
                description: "",
                constraints: "",
                input_format: "",
                output_format: "",
                examples: []
            });

            loadData(); // Refresh dashboard cards
        } catch (error) {
            console.error(error);
            const errMsg = error.response?.data?.detail || error.response?.data?.message || "Failed to save question.";
            setModalMsg({ type: "danger", text: errMsg });
        }
    };

    const handleDeleteQuestionFromModal = async (qId) => {
        if (!window.confirm("Are you sure you want to delete this question?")) return;
        try {
            await deleteQuestion(qId);
            setModalMsg({ type: "success", text: "Question removed." });
            const updatedDetail = await getFacultyAssessmentDetail(selectedAssessment.id);
            setSelectedAssessment(updatedDetail.data);
            loadData();
        } catch (error) {
            console.error(error);
            setModalMsg({ type: "danger", text: "Failed to delete question." });
        }
    };

    const handleEditQuestionInModal = (q) => {
        setEditingQuestionId(q.id);
        setQuestionForm({
            title: q.title,
            difficulty: q.difficulty || "Medium",
            marks: q.marks || 25,
            topic: q.topic || "Arrays",
            description: q.description || "",
            constraints: q.constraints || "",
            input_format: q.input_format || "",
            output_format: q.output_format || "",
            examples: q.examples || []
        });
    };

    const currentQuestionsCount = selectedAssessment?.questions_count || selectedAssessment?.questions?.length || 0;
    const maxQuestionsAllowed = selectedAssessment?.total_questions_allowed || 5;
    const currentTotalMarks = selectedAssessment?.questions?.reduce((sum, q) => sum + (q.marks || 0), 0) || 0;
    const targetMaxMarks = selectedAssessment?.max_marks || 0;
    const isQuestionLimitReached = currentQuestionsCount >= maxQuestionsAllowed;
    const isMarksLimitReached = targetMaxMarks > 0 && currentTotalMarks >= targetMaxMarks;
    const isLimitReached = isQuestionLimitReached || isMarksLimitReached;

    return (
        <div style={{ minHeight: "100vh", backgroundColor: "#f8fafc", paddingBottom: "40px" }}>
            <Sidebar activeRole="faculty" />
            <Navbar title="Technical Coding Assessments" userRole="faculty" />

            <div className="container-fluid animate-fade-in" style={{ marginLeft: "260px", paddingTop: "90px", paddingRight: "30px", maxWidth: "calc(100% - 260px)", minHeight: "calc(100vh - 90px)" }}>
                <div className="card shadow-lg border-0 rounded-4 bg-white p-4">
                    
                    {msg.text && (
                        <div className={`alert alert-${msg.type} py-2 px-3 mb-4 small fw-semibold rounded-3 d-flex align-items-center justify-content-between`}>
                            <div>
                                {msg.type === "success" ? <FaCheckCircle className="me-2" /> : <FaExclamationCircle className="me-2" />}
                                {msg.text}
                            </div>
                            <button type="button" className="btn-close" onClick={() => setMsg({ type: "", text: "" })}></button>
                        </div>
                    )}

                    <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 pb-3 border-bottom">
                        <div>
                            <h4 className="fw-bold m-0 text-dark">
                                <FaCode className="text-success me-2" /> Technical Coding Assessment Dashboard
                            </h4>
                            <p className="text-muted small m-0">Create, manage, and assign LeetCode-style coding tests to students.</p>
                        </div>
                        <button className="btn btn-success fw-bold rounded-pill px-4 py-2 shadow-sm" onClick={handleOpenCreateModal}>
                            <FaPlus className="me-2" /> Create New Assessment
                        </button>
                    </div>

                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-success" role="status">
                                <span className="visually-hidden">Loading assessments...</span>
                            </div>
                        </div>
                    ) : assessments.length === 0 ? (
                        <div className="text-center py-5 text-muted">
                            <FaCode className="display-4 text-secondary mb-3" />
                            <h5>No Technical Assessments Created Yet</h5>
                            <p className="small mb-3">Click "+ Create New Assessment" below to publish a new coding test for students.</p>
                            <button className="btn btn-success fw-bold rounded-pill px-4 py-2" onClick={handleOpenCreateModal}>
                                <FaPlus className="me-2" /> Create New Assessment
                            </button>
                        </div>
                    ) : (
                        <div className="row g-4">
                            {assessments.map(a => (
                                <div key={a.id} className="col-md-6 col-lg-4">
                                    <div className="card shadow-sm border border-light-subtle rounded-4 h-100 p-4 bg-white position-relative">
                                        <div className="d-flex justify-content-between align-items-start mb-2">
                                            <span className={`badge rounded-pill ${a.difficulty === 'Easy' ? 'bg-success' : a.difficulty === 'Medium' ? 'bg-warning text-dark' : 'bg-danger'}`}>
                                                {a.difficulty}
                                            </span>
                                            <span className={`badge rounded-pill ${a.status === 'Active' ? 'bg-primary' : 'bg-secondary'}`}>
                                                {a.status}
                                            </span>
                                        </div>

                                        <h5 className="fw-bold text-dark mb-1">{a.title}</h5>
                                        <p className="text-muted small text-truncate-2 mb-3">{a.description || "No description provided."}</p>

                                        <div className="bg-light p-3 rounded-3 mb-3 small">
                                            <div className="d-flex justify-content-between mb-1">
                                                <span className="text-muted">Questions Added / Allowed:</span>
                                                <span className="fw-bold text-dark">{a.questions_count || 0} / {a.total_questions_allowed || 5}</span>
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
                                                <span className="text-muted">Allowed Attempts:</span>
                                                <span className="fw-bold text-primary">{a.allowed_attempts === 0 ? 'Unlimited' : `${a.allowed_attempts} Attempt(s)`}</span>
                                            </div>
                                            <div className="d-flex justify-content-between">
                                                <span className="text-muted">Deadline:</span>
                                                <span className="fw-bold text-danger">{a.deadline_date} ({a.deadline_time})</span>
                                            </div>
                                        </div>

                                        <div className="mt-auto pt-3 border-top d-flex flex-wrap gap-2 justify-content-between">
                                            <button className="btn btn-outline-primary btn-sm rounded-pill px-3 fw-semibold" onClick={() => handleOpenQuestions(a)}>
                                                <FaList /> Questions ({a.questions_count || 0} / {a.total_questions_allowed || 5})
                                            </button>
                                            <button className="btn btn-outline-success btn-sm rounded-pill px-3 fw-semibold" onClick={() => navigate(`/faculty/coding-assessments/${a.id}/submissions`)}>
                                                <FaEye /> Submissions
                                            </button>
                                            <button className="btn btn-outline-dark btn-sm rounded-pill px-2" title="Duplicate" onClick={() => handleDuplicate(a.id)}>
                                                <FaCopy />
                                            </button>
                                            <button className="btn btn-outline-warning btn-sm rounded-pill px-2" title="Edit" onClick={() => handleOpenEditModal(a)}>
                                                <FaEdit />
                                            </button>
                                            <button className="btn btn-outline-danger btn-sm rounded-pill px-2" title="Delete" onClick={() => handleDelete(a.id)}>
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Create / Edit Assessment Modal with Clean Dedicated Scrollbar */}
            {showAssessmentModal && (
                <div className="modal show d-block" tabIndex="-1" style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", zIndex: 1050, backgroundColor: "rgba(0,0,0,0.5)", overflowY: "auto" }}>
                        <div className="modal-dialog modal-lg" style={{ marginTop: "85px", marginBottom: "35px" }}>
                            <div className="modal-content rounded-4 border-0 shadow-lg d-flex flex-column" style={{ maxHeight: "calc(100vh - 120px)" }}>
                                
                                <div className="modal-header bg-success text-white p-3 flex-shrink-0">
                                    <h5 className="modal-title fw-bold">
                                        <FaCode className="me-2" /> {editingAssessmentId ? "Edit Assessment Settings" : "Create Technical Coding Assessment"}
                                    </h5>
                                    <button type="button" className="btn-close btn-close-white" onClick={() => setShowAssessmentModal(false)}></button>
                                </div>

                                <form onSubmit={handleSaveAssessment} className="d-flex flex-column flex-grow-1 overflow-hidden">
                                    <div className="modal-body p-4 flex-grow-1" style={{ overflowY: "auto", maxHeight: "calc(100vh - 240px)" }}>

                                        {!editingAssessmentId && (
                                            <div className="bg-success-subtle p-3 rounded-4 border border-success mb-4">
                                                <label className="form-label fw-bold text-success small mb-1">
                                                    <FaBolt className="me-1" /> Auto-Populate LeetCode Questions Preset (Optional)
                                                </label>
                                                <select
                                                    className="form-select border-success fw-semibold"
                                                    value={leetcodePresetSet}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        setLeetcodePresetSet(val);
                                                        if (val === "easy_set") {
                                                            setAssessmentForm(prev => ({ ...prev, title: "LeetCode DSA Qualifier (Easy)", max_marks: 60, total_questions_allowed: 3 }));
                                                        } else if (val === "medium_set") {
                                                            setAssessmentForm(prev => ({ ...prev, title: "LeetCode Medium Algorithms Contest", max_marks: 75, total_questions_allowed: 3 }));
                                                        } else if (val === "full_dsa") {
                                                            setAssessmentForm(prev => ({ ...prev, title: "Comprehensive LeetCode Data Structures Exam", max_marks: 100, total_questions_allowed: 5 }));
                                                        }
                                                    }}
                                                >
                                                    <option value="none">Manual Entry (I will add custom questions manually)</option>
                                                    <option value="easy_set">⚡ Auto-Add Top 3 Easy LeetCode Questions (Two Sum, Palindrome, Valid Parentheses)</option>
                                                    <option value="medium_set">⚡ Auto-Add Top 3 Medium LeetCode Questions (Longest Substring, Max Subarray, Product of Array)</option>
                                                    <option value="full_dsa">⚡ Auto-Add Comprehensive 5 DSA LeetCode Set</option>
                                                </select>
                                            </div>
                                        )}

                                        <div className="row g-3">
                                            <div className="col-12">
                                                <label className="form-label fw-bold small text-secondary">Assessment Title</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    placeholder="e.g. Data Structures & Algorithms Qualifier 2026"
                                                    value={assessmentForm.title}
                                                    onChange={(e) => setAssessmentForm({ ...assessmentForm, title: e.target.value })}
                                                    required
                                                />
                                            </div>

                                            <div className="col-12">
                                                <label className="form-label fw-bold small text-secondary">Description</label>
                                                <textarea
                                                    className="form-control"
                                                    rows="2"
                                                    placeholder="Brief overview of what this technical assessment evaluates..."
                                                    value={assessmentForm.description}
                                                    onChange={(e) => setAssessmentForm({ ...assessmentForm, description: e.target.value })}
                                                ></textarea>
                                            </div>

                                            <div className="col-md-4">
                                                <label className="form-label fw-bold small text-secondary">Difficulty Level</label>
                                                <select
                                                    className="form-select"
                                                    value={assessmentForm.difficulty}
                                                    onChange={(e) => setAssessmentForm({ ...assessmentForm, difficulty: e.target.value })}
                                                >
                                                    <option value="Easy">Easy</option>
                                                    <option value="Medium">Medium</option>
                                                    <option value="Hard">Hard</option>
                                                </select>
                                            </div>

                                            <div className="col-md-4">
                                                <label className="form-label fw-bold small text-secondary">Duration (Minutes)</label>
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    value={assessmentForm.duration_minutes}
                                                    onChange={(e) => setAssessmentForm({ ...assessmentForm, duration_minutes: parseInt(e.target.value) || 0 })}
                                                />
                                            </div>

                                            <div className="col-md-4">
                                                <label className="form-label fw-bold small text-secondary">Target Total Max Marks</label>
                                                <input
                                                    type="number"
                                                    className="form-control fw-bold text-dark"
                                                    value={assessmentForm.max_marks}
                                                    onChange={(e) => setAssessmentForm({ ...assessmentForm, max_marks: parseInt(e.target.value) || 0 })}
                                                    placeholder="e.g. 100"
                                                    required
                                                />
                                                <div className="form-text extra-small text-muted" style={{ fontSize: "0.75rem" }}>
                                                    Target total marks for this assessment (e.g. 100 pts).
                                                </div>
                                            </div>

                                            <div className="col-md-6">
                                                <label className="form-label fw-bold small text-primary">No. of Questions Allowed</label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max="50"
                                                    className="form-control border-primary fw-bold text-primary"
                                                    value={assessmentForm.total_questions_allowed}
                                                    onChange={(e) => setAssessmentForm({ ...assessmentForm, total_questions_allowed: parseInt(e.target.value) || 1 })}
                                                    required
                                                />
                                            </div>

                                            {/* Dual Select + Custom Number Entry for Allowed Attempts */}
                                            <div className="col-md-6">
                                                <label className="form-label fw-bold small text-primary">Allowed Attempts Limit (Dropdown / Custom #)</label>
                                                <div className="input-group">
                                                    <select
                                                        className="form-select border-primary fw-bold text-primary"
                                                        style={{ maxWidth: "55%" }}
                                                        value={[0, 1, 2, 3, 5, 10].includes(assessmentForm.allowed_attempts) ? assessmentForm.allowed_attempts : "custom"}
                                                        onChange={(e) => {
                                                            const val = e.target.value;
                                                            if (val !== "custom") {
                                                                setAssessmentForm({ ...assessmentForm, allowed_attempts: parseInt(val) });
                                                            }
                                                        }}
                                                    >
                                                        <option value={1}>1 Attempt</option>
                                                        <option value={2}>2 Attempts</option>
                                                        <option value={3}>3 Attempts</option>
                                                        <option value={5}>5 Attempts</option>
                                                        <option value={10}>10 Attempts</option>
                                                        <option value={0}>Unlimited (0)</option>
                                                        <option value="custom">Custom #</option>
                                                    </select>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        max="100"
                                                        className="form-control border-primary fw-bold text-primary"
                                                        placeholder="Custom #"
                                                        value={assessmentForm.allowed_attempts}
                                                        onChange={(e) => setAssessmentForm({ ...assessmentForm, allowed_attempts: parseInt(e.target.value) || 0 })}
                                                        required
                                                    />
                                                </div>
                                                <div className="form-text extra-small text-muted">Type any custom number of attempts (0 = Unlimited).</div>
                                            </div>

                                            <div className="col-md-6">
                                                <label className="form-label fw-bold small text-secondary">Start Date & Time</label>
                                                <div className="d-flex gap-2">
                                                    <input type="date" className="form-control" value={assessmentForm.start_date} onChange={(e) => setAssessmentForm({ ...assessmentForm, start_date: e.target.value })} required />
                                                    <input type="time" className="form-control" value={assessmentForm.start_time} onChange={(e) => setAssessmentForm({ ...assessmentForm, start_time: e.target.value })} required />
                                                </div>
                                            </div>

                                            <div className="col-md-6">
                                                <label className="form-label fw-bold small text-secondary">Deadline Date & Time</label>
                                                <div className="d-flex gap-2">
                                                    <input type="date" className="form-control" value={assessmentForm.deadline_date} onChange={(e) => setAssessmentForm({ ...assessmentForm, deadline_date: e.target.value })} required />
                                                    <input type="time" className="form-control" value={assessmentForm.deadline_time} onChange={(e) => setAssessmentForm({ ...assessmentForm, deadline_time: e.target.value })} required />
                                                </div>
                                            </div>

                                            <div className="col-12">
                                                <label className="form-label fw-bold small text-secondary">Visibility Scope</label>
                                                <select
                                                    className="form-select"
                                                    value={assessmentForm.visibility}
                                                    onChange={(e) => setAssessmentForm({ ...assessmentForm, visibility: e.target.value })}
                                                >
                                                    <option value="Public">Public (All Students)</option>
                                                    <option value="Department Only">Department Only</option>
                                                    <option value="Year Only">Year Only</option>
                                                </select>
                                            </div>

                                            <div className="col-12">
                                                <label className="form-label fw-bold small text-secondary">Allowed Programming Languages</label>
                                                <div className="d-flex flex-wrap gap-3">
                                                    {ALL_LANGUAGES.map(lang => (
                                                        <div key={lang} className="form-check">
                                                            <input
                                                                type="checkbox"
                                                                className="form-check-input"
                                                                id={`lang-${lang}`}
                                                                checked={(assessmentForm.allowed_languages || []).includes(lang)}
                                                                onChange={(e) => {
                                                                    const current = assessmentForm.allowed_languages || [];
                                                                    if (e.target.checked) setAssessmentForm({ ...assessmentForm, allowed_languages: [...current, lang] });
                                                                    else setAssessmentForm({ ...assessmentForm, allowed_languages: current.filter(l => l !== lang) });
                                                                }}
                                                            />
                                                            <label className="form-check-label small" htmlFor={`lang-${lang}`}>{lang}</label>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                        </div>
                                    </div>

                                    <div className="modal-footer bg-light p-3 border-top flex-shrink-0">
                                        <button type="button" className="btn btn-secondary rounded-pill px-4" onClick={() => setShowAssessmentModal(false)}>Cancel</button>
                                        <button type="submit" className="btn btn-success fw-bold rounded-pill px-4" disabled={saving}>
                                            {saving ? "Saving..." : editingAssessmentId ? "Update Assessment" : "✓ Create Assessment"}
                                        </button>
                                    </div>
                                </form>

                            </div>
                        </div>
                    </div>
                )}

            {/* Manage Questions Modal with Continuous Add Workflow & Added Questions List */}
            {showQuestionsModal && selectedAssessment && (
                <div className="modal show d-block" tabIndex="-1" style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", zIndex: 1050, backgroundColor: "rgba(0,0,0,0.5)", overflowY: "auto" }}>
                        <div className="modal-dialog modal-xl" style={{ marginTop: "85px", marginBottom: "35px" }}>
                            <div className="modal-content rounded-4 border-0 shadow-lg d-flex flex-column" style={{ maxHeight: "calc(100vh - 120px)" }}>
                                
                                <div className="modal-header bg-dark text-white p-3 flex-shrink-0 d-flex justify-content-between align-items-center">
                                    <h5 className="modal-title fw-bold m-0">
                                        <FaList className="me-2 text-warning" /> Questions Builder: {selectedAssessment.title}
                                    </h5>
                                    <div className="d-flex align-items-center gap-3">
                                        <span className={`badge px-3 py-2 fs-6 rounded-pill fw-bold ${isMarksLimitReached ? 'bg-warning text-dark' : 'bg-info text-dark'}`}>
                                            ⚡ Allocated Marks: {currentTotalMarks} {targetMaxMarks > 0 ? `/ ${targetMaxMarks}` : ''} pts
                                        </span>
                                        <span className={`badge px-3 py-2 fs-6 rounded-pill ${isQuestionLimitReached ? 'bg-danger' : 'bg-success'}`}>
                                            Questions: {currentQuestionsCount} / {maxQuestionsAllowed} Allowed
                                        </span>
                                        <button type="button" className="btn-close btn-close-white" onClick={() => setShowQuestionsModal(false)}></button>
                                    </div>
                                </div>

                                <div className="modal-body p-4 flex-grow-1" style={{ overflowY: "auto", maxHeight: "calc(100vh - 240px)" }}>

                                    {/* Question or Marks Limit Reached Warning Alert */}
                                    {isLimitReached && !editingQuestionId && (
                                        <div className="alert alert-success py-3 px-3 mb-4 rounded-3 d-flex align-items-center justify-content-between border-success">
                                            <div className="d-flex align-items-center gap-2">
                                                <FaCheckCircle className="fs-4 text-success" />
                                                <div>
                                                    <strong className="text-dark">
                                                        {isMarksLimitReached
                                                            ? `🎯 Total Assessment Marks (${currentTotalMarks} / ${targetMaxMarks} pts) Completed!`
                                                            : `✅ All ${maxQuestionsAllowed} Questions Added Successfully!`}
                                                    </strong>
                                                    <div className="small text-secondary">
                                                        {isMarksLimitReached
                                                            ? `You have allocated all ${targetMaxMarks} marks across ${currentQuestionsCount} question(s). Total target marks completed!`
                                                            : `You have reached the limit of ${maxQuestionsAllowed} question(s) for this assessment.`}
                                                    </div>
                                                </div>
                                            </div>
                                            <button className="btn btn-success fw-bold rounded-pill px-4" onClick={() => setShowQuestionsModal(false)}>
                                                <FaCheck className="me-1" /> Done
                                            </button>
                                        </div>
                                    )}

                                    {/* Custom LeetCode URL / Title Importer Bar */}
                                    {!isLimitReached && (
                                        <div className="bg-primary-subtle p-3 rounded-4 border border-primary-subtle mb-4">
                                            <label className="form-label fw-bold text-primary small mb-1">
                                                <FaLink className="me-1" /> Paste Any LeetCode Problem URL or Title
                                            </label>
                                            <div className="input-group">
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    placeholder="e.g. https://leetcode.com/problems/trapping-rain-water/ OR 'Trapping Rain Water'"
                                                    value={customLeetCodeInput}
                                                    onChange={(e) => setCustomLeetCodeInput(e.target.value)}
                                                />
                                                <button className="btn btn-primary fw-bold px-4" type="button" onClick={handleParseCustomLeetCode}>
                                                    <FaMagic className="me-1" /> Auto-Fill Problem Details
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {/* Add / Edit Question Form */}
                                    {(!isLimitReached || editingQuestionId) && (
                                        <form onSubmit={handleAddQuestion} className="bg-light p-4 rounded-4 border mb-4 shadow-sm">
                                            <div className="d-flex flex-wrap justify-content-between align-items-center mb-3">
                                                <h6 className="fw-bold text-dark m-0">
                                                    {editingQuestionId ? "✏️ Edit Coding Question" : `➕ Add Question #${currentQuestionsCount + 1} of ${maxQuestionsAllowed}`}
                                                </h6>
                                                <div className="d-flex align-items-center gap-2">
                                                    <span className="small text-secondary fw-semibold"><FaBolt className="text-warning" /> Select Preset:</span>
                                                    <select
                                                        className="form-select form-select-sm rounded-pill px-3 fw-semibold bg-success-subtle text-success border-success"
                                                        style={{ width: "auto" }}
                                                        onChange={(e) => {
                                                            const idx = e.target.value;
                                                            if (idx !== "") {
                                                                const preset = LEETCODE_PRESETS[parseInt(idx)];
                                                                setQuestionForm(prev => ({
                                                                    ...prev,
                                                                    title: preset.title,
                                                                    difficulty: preset.difficulty,
                                                                    marks: preset.marks,
                                                                    description: preset.description,
                                                                    constraints: preset.constraints,
                                                                    examples: preset.examples
                                                                }));
                                                            }
                                                        }}
                                                    >
                                                        <option value="">-- Select LeetCode Problem --</option>
                                                        {LEETCODE_PRESETS.map((p, i) => (
                                                            <option key={i} value={i}>{p.title} ({p.difficulty})</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="row g-3">
                                                <div className="col-md-8">
                                                    <label className="form-label small fw-semibold text-secondary">Question Title</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        placeholder="Question Title (e.g. Reverse Words in String)"
                                                        value={questionForm.title}
                                                        onChange={(e) => setQuestionForm({ ...questionForm, title: e.target.value })}
                                                        required
                                                    />
                                                </div>
                                                <div className="col-md-2">
                                                    <label className="form-label small fw-semibold text-secondary">Difficulty</label>
                                                    <select className="form-select" value={questionForm.difficulty} onChange={(e) => setQuestionForm({ ...questionForm, difficulty: e.target.value })}>
                                                        <option value="Easy">Easy</option>
                                                        <option value="Medium">Medium</option>
                                                        <option value="Hard">Hard</option>
                                                    </select>
                                                </div>
                                                <div className="col-md-2">
                                                    <label className="form-label small fw-semibold text-secondary">Marks</label>
                                                    <input type="number" className="form-control" placeholder="Marks" value={questionForm.marks} onChange={(e) => setQuestionForm({ ...questionForm, marks: parseInt(e.target.value) || 20 })} required />
                                                </div>

                                                <div className="col-12">
                                                    <label className="form-label small fw-semibold text-secondary">Problem Description</label>
                                                    <textarea className="form-control" rows="3" placeholder="Detailed problem statement..." value={questionForm.description} onChange={(e) => setQuestionForm({ ...questionForm, description: e.target.value })} required></textarea>
                                                </div>

                                                <div className="col-12">
                                                    <label className="form-label small fw-semibold text-secondary">Constraints</label>
                                                    <textarea className="form-control" rows="2" placeholder="Constraints (e.g. 1 <= N <= 10^5)..." value={questionForm.constraints} onChange={(e) => setQuestionForm({ ...questionForm, constraints: e.target.value })}></textarea>
                                                </div>

                                                <div className="col-12 text-end">
                                                    {modalMsg.text && (
                                                        <div className={`alert alert-${modalMsg.type} text-start py-2 px-3 mb-3 rounded-3 shadow-sm border-${modalMsg.type}`}>
                                                            <div className="d-flex align-items-center justify-content-between">
                                                                <div className="d-flex align-items-center gap-2">
                                                                    {modalMsg.type === "success" ? <FaCheckCircle className="text-success fs-5 flex-shrink-0" /> : <FaExclamationCircle className="text-danger fs-5 flex-shrink-0" />}
                                                                    <div>
                                                                        <strong className="d-block text-dark small">{modalMsg.type === "danger" ? "⚠️ Question Save Error" : "Notice"}</strong>
                                                                        <span className="small">{modalMsg.text}</span>
                                                                    </div>
                                                                </div>
                                                                <button type="button" className="btn-close ms-2" onClick={() => setModalMsg({ type: "", text: "" })}></button>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {editingQuestionId && (
                                                        <button type="button" className="btn btn-outline-secondary rounded-pill me-2 px-3" onClick={() => { setEditingQuestionId(null); setQuestionForm({ title: "", difficulty: "Medium", marks: 25, topic: "Arrays", description: "", constraints: "", input_format: "", output_format: "", examples: [] }); }}>
                                                            Cancel Edit
                                                        </button>
                                                    )}
                                                    <button type="submit" className="btn btn-success fw-bold rounded-pill px-4">
                                                        {editingQuestionId ? "✏️ Update Question" : (currentQuestionsCount + 1 < maxQuestionsAllowed ? `➕ Save & Add Next Question (${currentQuestionsCount + 1} of ${maxQuestionsAllowed})` : "✓ Save Question & Complete")}
                                                    </button>
                                                </div>
                                            </div>
                                        </form>
                                    )}

                                    {/* Existing Added Questions List */}
                                    <div className="mt-4">
                                        <h6 className="fw-bold text-dark mb-3 d-flex align-items-center justify-content-between">
                                            <span>📋 Added Questions ({currentQuestionsCount} / {maxQuestionsAllowed})</span>
                                        </h6>

                                        {(!selectedAssessment.questions || selectedAssessment.questions.length === 0) ? (
                                            <p className="text-muted small fst-italic py-3 text-center bg-light rounded-3 border">No questions added to this assessment yet. Fill out the form above to add your first question.</p>
                                        ) : (
                                            <div className="d-flex flex-column gap-3">
                                                {selectedAssessment.questions.map((q, idx) => (
                                                    <div key={q.id || idx} className="card border-0 shadow-sm rounded-3 bg-white p-3">
                                                        <div className="d-flex justify-content-between align-items-start mb-2">
                                                            <div>
                                                                <h6 className="fw-bold text-dark m-0">
                                                                    #{idx + 1}. {q.title}
                                                                </h6>
                                                                <span className="badge bg-secondary-subtle text-dark me-2">{q.topic || 'General'}</span>
                                                                <span className={`badge ${q.difficulty === 'Easy' ? 'bg-success' : q.difficulty === 'Medium' ? 'bg-warning text-dark' : 'bg-danger'}`}>{q.difficulty}</span>
                                                            </div>
                                                            <div className="d-flex align-items-center gap-2">
                                                                <span className="fw-bold text-success me-2">{q.marks} Marks</span>
                                                                <button className="btn btn-outline-warning btn-sm rounded-circle" title="Edit" onClick={() => handleEditQuestionInModal(q)}>
                                                                    <FaEdit />
                                                                </button>
                                                                <button className="btn btn-outline-danger btn-sm rounded-circle" title="Delete" onClick={() => handleDeleteQuestionFromModal(q.id)}>
                                                                    <FaTrash />
                                                                </button>
                                                            </div>
                                                        </div>
                                                        <p className="text-muted small text-truncate-2 m-0">{q.description}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                </div>

                                {/* Modal Footer with Done / Close Button */}
                                <div className="modal-footer bg-light p-3 border-top flex-shrink-0 d-flex justify-content-between align-items-center">
                                    <span className="small text-dark fw-bold">
                                        Questions: {currentQuestionsCount} / {maxQuestionsAllowed} Added | <span className={`${isMarksLimitReached ? 'text-warning' : 'text-success'} fw-bold`}>⚡ Allocated Marks: {currentTotalMarks} {targetMaxMarks > 0 ? `/ ${targetMaxMarks}` : ''} pts</span>
                                    </span>
                                    <button type="button" className="btn btn-success fw-bold rounded-pill px-4 shadow-sm" onClick={() => { setModalMsg({ type: "", text: "" }); setShowQuestionsModal(false); }}>
                                        <FaCheck className="me-1" /> Done Adding Questions
                                    </button>
                                </div>

                            </div>
                        </div>
                    </div>
            )}

        </div>
    );
}

export default FacultyCodingAssessments;
