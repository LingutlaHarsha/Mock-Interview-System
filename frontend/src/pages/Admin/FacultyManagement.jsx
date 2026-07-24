import { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import {
    getAllFaculty, createFaculty, deleteFaculty, resetFacultyPassword
} from "../../services/adminService";
import {
    FaChalkboardTeacher, FaPlus, FaTrash, FaKey, FaSearch,
    FaCheckCircle, FaExclamationCircle, FaUserShield
} from "react-icons/fa";

function FacultyManagement() {
    const [facultyList, setFacultyList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [msg, setMsg] = useState({ type: "", text: "" });

    // Create Modal state
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [createForm, setCreateForm] = useState({
        username: "",
        email: "",
        password: "Faculty@123"
    });
    const [creating, setCreating] = useState(false);

    // Reset Password Modal state
    const [resetUser, setResetUser] = useState(null);
    const [customPassword, setCustomPassword] = useState("Faculty@123");
    const [resetting, setResetting] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const res = await getAllFaculty();
            setFacultyList(res.data);
        } catch (error) {
            console.error("Failed to load faculty list", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        try {
            setCreating(true);
            setMsg({ type: "", text: "" });
            const res = await createFaculty(createForm);
            setMsg({ type: "success", text: res.data.message || "Faculty account created successfully!" });
            setShowCreateModal(false);
            setCreateForm({ username: "", email: "", password: "Faculty@123" });
            loadData();
        } catch (error) {
            console.error(error);
            const errDetail = error.response?.data?.detail || "Failed to create faculty account.";
            setMsg({ type: "danger", text: errDetail });
        } finally {
            setCreating(false);
        }
    };

    const handleDelete = async (id, username) => {
        if (!window.confirm(`Are you sure you want to permanently delete faculty user '${username}' from the database?`)) return;

        try {
            setMsg({ type: "", text: "" });
            await deleteFaculty(id);
            setMsg({ type: "success", text: `Faculty user '${username}' deleted successfully from database.` });
            loadData();
        } catch (error) {
            console.error(error);
            setMsg({ type: "danger", text: "Failed to delete faculty user." });
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (!resetUser) return;

        try {
            setResetting(true);
            setMsg({ type: "", text: "" });
            const res = await resetFacultyPassword(resetUser.id, customPassword);
            setMsg({ type: "success", text: res.data.message || "Password reset successfully!" });
            setResetUser(null);
        } catch (error) {
            console.error(error);
            setMsg({ type: "danger", text: "Failed to reset password." });
        } finally {
            setResetting(false);
        }
    };

    const filteredList = facultyList.filter(f =>
        (f.username || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (f.email || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <>
            <Sidebar activeRole="admin" />
            <Navbar title="Manage Faculty Accounts" userRole="admin" />

            <div className="container-fluid animate-fade-in" style={{ marginLeft: "260px", paddingTop: "90px", paddingRight: "30px", maxWidth: "calc(100% - 260px)" }}>
                <div className="card shadow-lg border-0 rounded-4 bg-white p-4">

                    {/* Header Banner */}
                    <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 pb-3 border-bottom gap-3">
                        <div>
                            <span className="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25 px-3 py-1.5 rounded-pill fw-bold mb-2">
                                Admin Control Panel
                            </span>
                            <h3 className="fw-bold text-dark m-0 d-flex align-items-center gap-2">
                                <FaChalkboardTeacher className="text-danger" /> Faculty User Account Management
                            </h3>
                            <p className="text-muted small m-0 mt-1">Create new faculty, reset account passwords to default, or delete faculty users directly in database.</p>
                        </div>

                        <button className="btn btn-danger fw-bold rounded-pill px-4 shadow-sm d-flex align-items-center gap-2" onClick={() => setShowCreateModal(true)}>
                            <FaPlus /> Create New Faculty
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

                    {/* Search & Stats Bar */}
                    <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
                        <div className="position-relative" style={{ minWidth: "300px" }}>
                            <FaSearch className="position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary" />
                            <input
                                type="text"
                                className="form-control rounded-pill ps-5 pe-4 shadow-2xs border-light-subtle"
                                placeholder="Search by username or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <span className="badge bg-light text-dark border px-3 py-2 rounded-pill fw-semibold">
                            Total Registered Faculty: {facultyList.length}
                        </span>
                    </div>

                    {/* Faculty Table */}
                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-danger" role="status">
                                <span className="visually-hidden">Loading faculty accounts...</span>
                            </div>
                        </div>
                    ) : filteredList.length === 0 ? (
                        <div className="text-center py-5 text-muted">
                            <FaChalkboardTeacher className="display-4 text-secondary mb-3 opacity-50" />
                            <h5 className="fw-bold text-dark">No Faculty Accounts Found</h5>
                            <p className="small">Click 'Create New Faculty' to add an instructor user directly to the database.</p>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0">
                                <thead className="table-light rounded-3">
                                    <tr>
                                        <th className="py-3">Faculty User</th>
                                        <th className="py-3">Email Address</th>
                                        <th className="py-3">Approval Status</th>
                                        <th className="py-3">Date Joined</th>
                                        <th className="py-3 text-end">Database Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredList.map(f => (
                                        <tr key={f.id}>
                                            <td className="py-3">
                                                <div className="d-flex align-items-center gap-3">
                                                    <div className="p-2.5 bg-success text-white rounded-circle fw-bold fs-6 d-flex align-items-center justify-content-center" style={{ width: "40px", height: "40px" }}>
                                                        {f.username.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <span className="fw-bold text-dark d-block">{f.username}</span>
                                                        <span className="extra-small text-muted">ID #{f.id}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3 fw-semibold text-secondary">{f.email}</td>
                                            <td className="py-3">
                                                {f.is_approved ? (
                                                    <span className="badge bg-success-subtle text-success border border-success border-opacity-25 px-3 py-1 rounded-pill fw-bold">
                                                        Approved ✅
                                                    </span>
                                                ) : (
                                                    <span className="badge bg-warning-subtle text-warning border border-warning border-opacity-25 px-3 py-1 rounded-pill fw-bold">
                                                        Pending Approval ⏳
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-3 text-muted extra-small">
                                                {new Date(f.date_joined).toLocaleDateString()}
                                            </td>
                                            <td className="py-3 text-end">
                                                <div className="d-flex justify-content-end gap-2">
                                                    <button
                                                        className="btn btn-outline-warning text-dark btn-sm rounded-pill px-3 fw-semibold shadow-2xs"
                                                        onClick={() => { setResetUser(f); setCustomPassword("Faculty@123"); }}
                                                        title="Reset password to default"
                                                    >
                                                        <FaKey className="me-1" /> Reset Password
                                                    </button>
                                                    <button
                                                        className="btn btn-outline-danger btn-sm rounded-pill px-3 fw-semibold shadow-2xs"
                                                        onClick={() => handleDelete(f.id, f.username)}
                                                        title="Delete user from database"
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

            {/* CREATE FACULTY MODAL */}
            {showCreateModal && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content rounded-4 border-0 shadow-lg">
                            <div className="modal-header bg-danger text-white p-3">
                                <h5 className="modal-title fw-bold">
                                    <FaUserShield className="me-2" /> Create New Faculty Account
                                </h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setShowCreateModal(false)}></button>
                            </div>
                            <form onSubmit={handleCreateSubmit}>
                                <div className="modal-body p-4">
                                    <div className="mb-3">
                                        <label className="form-label fw-bold small text-secondary">Username</label>
                                        <input
                                            type="text"
                                            className="form-control rounded-3"
                                            placeholder="Enter faculty username"
                                            value={createForm.username}
                                            onChange={(e) => setCreateForm({ ...createForm, username: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label fw-bold small text-secondary">Email Address</label>
                                        <input
                                            type="email"
                                            className="form-control rounded-3"
                                            placeholder="faculty@university.edu"
                                            value={createForm.email}
                                            onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label fw-bold small text-secondary">Initial Password</label>
                                        <input
                                            type="text"
                                            className="form-control rounded-3 font-monospace fw-bold text-danger"
                                            value={createForm.password}
                                            onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                                            required
                                        />
                                        <div className="form-text extra-small text-muted">Default is set to <code>Faculty@123</code>. Faculty can change it anytime in settings.</div>
                                    </div>
                                </div>
                                <div className="modal-footer bg-light p-3">
                                    <button type="button" className="btn btn-secondary rounded-pill px-4" onClick={() => setShowCreateModal(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-danger fw-bold rounded-pill px-4" disabled={creating}>
                                        {creating ? "Creating Account..." : "Create & Save to DB"}
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
                                    <FaKey className="me-2" /> Reset Password for '{resetUser.username}'
                                </h5>
                                <button type="button" className="btn-close" onClick={() => setResetUser(null)}></button>
                            </div>
                            <form onSubmit={handleResetPassword}>
                                <div className="modal-body p-4">
                                    <p className="text-secondary small mb-3">
                                        Resetting password for <strong>{resetUser.username}</strong> ({resetUser.email}). This will immediately update the database password hash.
                                    </p>

                                    <div className="mb-3">
                                        <label className="form-label fw-bold small text-secondary">Default / New Password</label>
                                        <input
                                            type="text"
                                            className="form-control rounded-3 font-monospace fw-bold text-danger"
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

export default FacultyManagement;
