import { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import { getPendingFaculty, approveFaculty, rejectFaculty } from "../../services/adminService";
import { FaUserCheck, FaCheckCircle, FaTimesCircle, FaExclamationCircle } from "react-icons/fa";

function FacultyApprovals() {
    const [pendingList, setPendingList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionId, setActionId] = useState(null);
    const [msg, setMsg] = useState({ type: "", text: "" });

    useEffect(() => {
        loadPendingFaculty();
    }, []);

    const loadPendingFaculty = async () => {
        try {
            setLoading(true);
            const res = await getPendingFaculty();
            setPendingList(res.data);
        } catch (error) {
            console.error("Failed to load pending faculty", error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id) => {
        try {
            setActionId(id);
            setMsg({ type: "", text: "" });
            await approveFaculty(id);
            setMsg({ type: "success", text: "Faculty account approved successfully! User notified via system alert." });
            loadPendingFaculty();
        } catch (error) {
            console.error(error);
            setMsg({ type: "danger", text: "Failed to approve faculty account." });
        } finally {
            setActionId(null);
        }
    };

    const handleReject = async (id) => {
        if (!window.confirm("Are you sure you want to reject and remove this faculty registration?")) return;

        try {
            setActionId(id);
            setMsg({ type: "", text: "" });
            await rejectFaculty(id);
            setMsg({ type: "success", text: "Faculty application rejected and account removed." });
            loadPendingFaculty();
        } catch (error) {
            console.error(error);
            setMsg({ type: "danger", text: "Failed to reject faculty account." });
        } finally {
            setActionId(null);
        }
    };

    return (
        <>
            <Sidebar activeRole="admin" />
            <Navbar title="Faculty Account Approvals" userRole="admin" />

            <div className="container-fluid animate-fade-in" style={{ marginLeft: "260px", paddingTop: "90px", paddingRight: "30px", maxWidth: "calc(100% - 260px)" }}>
                
                {msg.text && (
                    <div className={`alert alert-${msg.type} py-2 px-3 mb-4 small fw-semibold rounded-3`} role="alert">
                        {msg.type === "success" ? <FaCheckCircle /> : <FaExclamationCircle />} {msg.text}
                    </div>
                )}

                <div className="card shadow-lg border-0 rounded-4 bg-white p-4">
                    <h5 className="fw-bold mb-3 text-danger"><FaUserCheck className="me-2" /> Pending Faculty Applications ({pendingList.length})</h5>

                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-danger" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    ) : pendingList.length === 0 ? (
                        <div className="text-center py-5 text-muted">
                            <FaCheckCircle className="display-4 text-success mb-2" />
                            <h6>No pending faculty account approvals.</h6>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover align-middle">
                                <thead className="table-light">
                                    <tr>
                                        <th>Username</th>
                                        <th>Email Address</th>
                                        <th>Registration Date</th>
                                        <th>Status</th>
                                        <th className="text-end">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pendingList.map(f => (
                                        <tr key={f.id}>
                                            <td className="fw-bold">{f.username}</td>
                                            <td className="small text-muted">{f.email}</td>
                                            <td className="small">{new Date(f.date_joined).toLocaleDateString()}</td>
                                            <td>
                                                <span className="badge bg-warning text-dark">Pending Admin Approval</span>
                                            </td>
                                            <td className="text-end">
                                                <button
                                                    className="btn btn-success btn-sm fw-bold px-3 rounded-pill me-2"
                                                    disabled={actionId === f.id}
                                                    onClick={() => handleApprove(f.id)}
                                                >
                                                    Approve
                                                </button>
                                                <button
                                                    className="btn btn-outline-danger btn-sm fw-bold rounded-pill px-3"
                                                    disabled={actionId === f.id}
                                                    onClick={() => handleReject(f.id)}
                                                >
                                                    Reject
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

            </div>
        </>
    );
}

export default FacultyApprovals;
