import { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import {
    getAdminStudents, createStudent, deleteStudent, resetStudentPassword
} from "../../services/adminService";
import { getBackendUrl } from "../../services/api";
import {
    FaUsers, FaSearch, FaFilePdf, FaPlus, FaTrash, FaKey,
    FaCheckCircle, FaExclamationCircle, FaUserGraduate
} from "react-icons/fa";

function StudentManagement() {
    const [students, setStudents] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [msg, setMsg] = useState({ type: "", text: "" });

    // Create Modal State
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [createForm, setCreateForm] = useState({
        username: "",
        email: "",
        password: "Student@123",
        full_name: "",
        roll_number: "",
        branch: "Computer Science Engineering",
        year: "1",
        phone: "",
        cgpa: "8.5"
    });
    const [creating, setCreating] = useState(false);

    // Reset Password Modal State
    const [resetUser, setResetUser] = useState(null);
    const [customPassword, setCustomPassword] = useState("Student@123");
    const [resetting, setResetting] = useState(false);

    useEffect(() => {
        loadStudents();
    }, []);

    const loadStudents = async () => {
        try {
            setLoading(true);
            const res = await getAdminStudents();
            setStudents(res.data);
        } catch (error) {
            console.error("Failed to load students", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        try {
            setCreating(true);
            setMsg({ type: "", text: "" });
            const res = await createStudent(createForm);
            setMsg({ type: "success", text: res.data.message || "Student account created successfully!" });
            setShowCreateModal(false);
            setCreateForm({
                username: "", email: "", password: "Student@123", full_name: "",
                roll_number: "", branch: "Computer Science Engineering", year: "1", phone: "", cgpa: "8.5"
            });
            loadStudents();
        } catch (error) {
            console.error(error);
            const errDetail = error.response?.data?.detail || "Failed to create student account.";
            setMsg({ type: "danger", text: errDetail });
        } finally {
            setCreating(false);
        }
    };

    const handleDelete = async (id, studentName) => {
        if (!window.confirm(`Are you sure you want to permanently delete student '${studentName}' from the database?`)) return;

        try {
            setMsg({ type: "", text: "" });
            await deleteStudent(id);
            setMsg({ type: "success", text: `Student '${studentName}' deleted successfully from database.` });
            loadStudents();
        } catch (error) {
            console.error(error);
            setMsg({ type: "danger", text: "Failed to delete student user." });
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (!resetUser) return;

        try {
            setResetting(true);
            setMsg({ type: "", text: "" });
            const res = await resetStudentPassword(resetUser.id, customPassword);
            setMsg({ type: "success", text: res.data.message || "Password reset successfully!" });
            setResetUser(null);
        } catch (error) {
            console.error(error);
            setMsg({ type: "danger", text: "Failed to reset student password." });
        } finally {
            setResetting(false);
        }
    };

    const filteredStudents = students.filter(s =>
        (s.full_name || "").toLowerCase().includes(search.toLowerCase()) ||
        (s.roll_number || "").toLowerCase().includes(search.toLowerCase()) ||
        (s.branch || "").toLowerCase().includes(search.toLowerCase()) ||
        (s.email || "").toLowerCase().includes(search.toLowerCase())
    );

    return (
        <>
            <Sidebar activeRole="admin" />
            <Navbar title="Student Placement Roster & Management" userRole="admin" />

            <div className="container-fluid animate-fade-in" style={{ marginLeft: "260px", paddingTop: "90px", paddingRight: "30px", maxWidth: "calc(100% - 260px)" }}>
                
                <div className="card shadow-lg border-0 rounded-4 bg-white p-4">
                    
                    {/* Header Banner */}
                    <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 pb-3 border-bottom gap-3">
                        <div>
                            <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 px-3 py-1.5 rounded-pill fw-bold mb-2">
                                Student Database Oversight
                            </span>
                            <h3 className="fw-bold text-dark m-0 d-flex align-items-center gap-2">
                                <FaUsers className="text-primary" /> Registered Student Roster & Account Control
                            </h3>
                            <p className="text-muted small m-0 mt-1">Manage student profiles, reset passwords to default, view PDF resumes, or remove student accounts.</p>
                        </div>

                        <button className="btn btn-primary fw-bold rounded-pill px-4 shadow-sm d-flex align-items-center gap-2" onClick={() => setShowCreateModal(true)}>
                            <FaPlus /> Create New Student
                        </button>
                    </div>

                    {msg.text && (
                        <div className={`alert alert-${msg.type} py-2.5 px-3 mb-4 small fw-semibold rounded-3 d-flex align-items-center justify-content-between`}>
                            <div>
                                {msg.type === "success" ? <FaCheckCircle className="me-2" /> : <FaExclamationCircle className="me-2" />}
                                {msg.text}
                            </div>
                            <button type="button" className="btn-close" onClick={() => setMsg({ type: "", text: "" })}></button>
                        </div>
                    )}

                    {/* Search & Stats Header */}
                    <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
                        <div className="position-relative" style={{ minWidth: "320px" }}>
                            <FaSearch className="position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary" />
                            <input
                                type="text"
                                className="form-control rounded-pill ps-5 pe-4 shadow-2xs border-light-subtle"
                                placeholder="Search by name, roll number, department..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>

                        <span className="badge bg-light text-dark border px-3 py-2 rounded-pill fw-semibold">
                            Total Registered Students: {students.length}
                        </span>
                    </div>

                    {/* Table */}
                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading student roster...</span>
                            </div>
                        </div>
                    ) : filteredStudents.length === 0 ? (
                        <div className="text-center py-5 text-muted">
                            <FaUserGraduate className="display-4 text-secondary mb-3 opacity-50" />
                            <h5 className="fw-bold text-dark">No Students Found</h5>
                            <p className="small">Click 'Create New Student' to add a student user directly to the database.</p>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0">
                                <thead className="table-light rounded-3">
                                    <tr>
                                        <th className="py-3 px-3">Student Details</th>
                                        <th className="py-3">Roll Number</th>
                                        <th className="py-3">Branch & Year</th>
                                        <th className="py-3">CGPA</th>
                                        <th className="py-3">Resume PDF</th>
                                        <th className="py-3 text-end px-3">Database Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredStudents.map(s => (
                                        <tr key={s.id}>
                                            <td className="py-3 px-3">
                                                <div className="d-flex align-items-center gap-3">
                                                    <div className="p-2 bg-primary text-white rounded-circle fw-bold fs-6 d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: "40px", height: "40px" }}>
                                                        {(s.full_name || "S").charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="d-flex flex-column justify-content-center">
                                                        <span className="fw-bold text-dark lh-sm mb-1" style={{ fontSize: "0.95rem" }}>
                                                            {s.full_name || "Student"}
                                                        </span>
                                                        <span className="text-secondary small lh-sm" style={{ fontSize: "0.825rem" }}>
                                                            {s.email || "No Email"}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3 font-monospace fw-semibold text-secondary">{s.roll_number || "N/A"}</td>
                                            <td className="py-3">
                                                <span className="badge bg-light text-dark border px-2.5 py-1 rounded-pill me-1">
                                                    {s.branch || "General"}
                                                </span>
                                                <span className="extra-small text-muted fw-semibold">
                                                    ({s.year ? `${s.year} Year` : "1st Year"})
                                                </span>
                                            </td>
                                            <td className="py-3 fw-bold text-success fs-6">{s.cgpa || "0.00"}</td>
                                            <td className="py-3">
                                                {s.resume ? (
                                                    <a
                                                        href={s.resume.startsWith("http") ? s.resume : `${getBackendUrl() || 'http://127.0.0.1:8000'}${s.resume}`}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="btn btn-outline-primary btn-sm fw-bold rounded-pill px-3 shadow-2xs"
                                                    >
                                                        <FaFilePdf className="me-1" /> View PDF
                                                    </a>
                                                ) : (
                                                    <span className="badge bg-secondary-subtle text-secondary border border-secondary-subtle px-2.5 py-1 rounded-pill extra-small">
                                                        No PDF
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-3 text-end px-3">
                                                <div className="d-flex justify-content-end gap-2">
                                                    <button
                                                        className="btn btn-outline-warning text-dark btn-sm rounded-pill px-3 fw-semibold shadow-2xs"
                                                        onClick={() => { setResetUser(s); setCustomPassword("Student@123"); }}
                                                        title="Reset password to default"
                                                    >
                                                        <FaKey className="me-1" /> Reset Password
                                                    </button>
                                                    <button
                                                        className="btn btn-outline-danger btn-sm rounded-pill px-3 fw-semibold shadow-2xs"
                                                        onClick={() => handleDelete(s.id, s.full_name || s.username || "Student")}
                                                        title="Delete student from database"
                                                    >
                                                        <FaTrash className="me-1" /> Delete
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
            </div>

            {/* CREATE STUDENT MODAL */}
            {showCreateModal && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
                    <div className="modal-dialog modal-dialog-centered modal-lg">
                        <div className="modal-content rounded-4 border-0 shadow-lg">
                            <div className="modal-header bg-primary text-white p-3">
                                <h5 className="modal-title fw-bold">
                                    <FaUserGraduate className="me-2" /> Create New Student Account
                                </h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setShowCreateModal(false)}></button>
                            </div>
                            <form onSubmit={handleCreateSubmit}>
                                <div className="modal-body p-4">
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <label className="form-label fw-bold small text-secondary">Username</label>
                                            <input
                                                type="text"
                                                className="form-control rounded-3"
                                                placeholder="e.g. john_doe"
                                                value={createForm.username}
                                                onChange={(e) => setCreateForm({ ...createForm, username: e.target.value })}
                                                required
                                            />
                                        </div>

                                        <div className="col-md-6">
                                            <label className="form-label fw-bold small text-secondary">Email Address</label>
                                            <input
                                                type="email"
                                                className="form-control rounded-3"
                                                placeholder="student@university.edu"
                                                value={createForm.email}
                                                onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                                                required
                                            />
                                        </div>

                                        <div className="col-md-6">
                                            <label className="form-label fw-bold small text-secondary">Full Name</label>
                                            <input
                                                type="text"
                                                className="form-control rounded-3"
                                                placeholder="John Doe"
                                                value={createForm.full_name}
                                                onChange={(e) => setCreateForm({ ...createForm, full_name: e.target.value })}
                                                required
                                            />
                                        </div>

                                        <div className="col-md-6">
                                            <label className="form-label fw-bold small text-secondary">Roll Number</label>
                                            <input
                                                type="text"
                                                className="form-control rounded-3"
                                                placeholder="e.g. 21CS001"
                                                value={createForm.roll_number}
                                                onChange={(e) => setCreateForm({ ...createForm, roll_number: e.target.value })}
                                                required
                                            />
                                        </div>

                                        <div className="col-md-6">
                                            <label className="form-label fw-bold small text-secondary">Branch / Department</label>
                                            <input
                                                type="text"
                                                className="form-control rounded-3"
                                                placeholder="e.g. Computer Science Engineering"
                                                value={createForm.branch}
                                                onChange={(e) => setCreateForm({ ...createForm, branch: e.target.value })}
                                                required
                                            />
                                        </div>

                                        <div className="col-md-6">
                                            <label className="form-label fw-bold small text-secondary">Year of Study</label>
                                            <select
                                                className="form-select rounded-3"
                                                value={createForm.year}
                                                onChange={(e) => setCreateForm({ ...createForm, year: e.target.value })}
                                            >
                                                <option value="1">1st Year</option>
                                                <option value="2">2nd Year</option>
                                                <option value="3">3rd Year</option>
                                                <option value="4">4th Year</option>
                                            </select>
                                        </div>

                                        <div className="col-md-6">
                                            <label className="form-label fw-bold small text-secondary">CGPA (0.00 - 10.00)</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                max="10"
                                                className="form-control rounded-3"
                                                value={createForm.cgpa}
                                                onChange={(e) => setCreateForm({ ...createForm, cgpa: e.target.value })}
                                                required
                                            />
                                        </div>

                                        <div className="col-md-6">
                                            <label className="form-label fw-bold small text-secondary">Initial Password</label>
                                            <input
                                                type="text"
                                                className="form-control rounded-3 font-monospace fw-bold text-primary"
                                                value={createForm.password}
                                                onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer bg-light p-3">
                                    <button type="button" className="btn btn-secondary rounded-pill px-4" onClick={() => setShowCreateModal(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-primary fw-bold rounded-pill px-4" disabled={creating}>
                                        {creating ? "Creating Student..." : "Create & Save to DB"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* RESET PASSWORD MODAL */}
            {resetUser && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content rounded-4 border-0 shadow-lg">
                            <div className="modal-header bg-warning text-dark p-3">
                                <h5 className="modal-title fw-bold">
                                    <FaKey className="me-2" /> Reset Password for '{resetUser.full_name || resetUser.username}'
                                </h5>
                                <button type="button" className="btn-close" onClick={() => setResetUser(null)}></button>
                            </div>
                            <form onSubmit={handleResetPassword}>
                                <div className="modal-body p-4">
                                    <p className="text-secondary small mb-3">
                                        Resetting password for student <strong>{resetUser.full_name || resetUser.username}</strong>. This will update the database password hash immediately.
                                    </p>

                                    <div className="mb-3">
                                        <label className="form-label fw-bold small text-secondary">Default / New Password</label>
                                        <input
                                            type="text"
                                            className="form-control rounded-3 font-monospace fw-bold text-primary"
                                            value={customPassword}
                                            onChange={(e) => setCustomPassword(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="modal-footer bg-light p-3">
                                    <button type="button" className="btn btn-secondary rounded-pill px-4" onClick={() => setResetUser(null)}>Cancel</button>
                                    <button type="submit" className="btn btn-warning text-dark fw-bold rounded-pill px-4" disabled={resetting}>
                                        {resetting ? "Resetting..." : "Reset Password & Update DB"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

        </>
    );
}

export default StudentManagement;
