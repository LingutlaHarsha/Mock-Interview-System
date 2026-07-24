import { useState } from "react";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import { broadcastAnnouncement } from "../../services/adminService";
import { FaBroadcastTower, FaCheckCircle, FaExclamationCircle } from "react-icons/fa";

function BroadcastNotifications() {
    const [targetRole, setTargetRole] = useState("all");
    const [title, setTitle] = useState("");
    const [message, setMessage] = useState("");
    const [sending, setSending] = useState(false);
    const [msg, setMsg] = useState({ type: "", text: "" });

    const handleBroadcast = async (e) => {
        e.preventDefault();
        setMsg({ type: "", text: "" });

        if (!title || !message) {
            setMsg({ type: "danger", text: "Please enter both announcement title and message body." });
            return;
        }

        try {
            setSending(true);
            const res = await broadcastAnnouncement({
                target_role: targetRole,
                title: title,
                message: message
            });
            setMsg({ type: "success", text: res.data.message || "Announcement broadcasted successfully!" });
            setTitle("");
            setMessage("");
        } catch (error) {
            console.error(error);
            setMsg({ type: "danger", text: "Failed to send broadcast announcement." });
        } finally {
            setSending(false);
        }
    };

    return (
        <>
            <Sidebar activeRole="admin" />
            <Navbar title="Broadcast System Alert" userRole="admin" />

            <div className="container-fluid animate-fade-in" style={{ marginLeft: "260px", paddingTop: "90px", paddingRight: "30px", maxWidth: "calc(100% - 260px)" }}>
                
                {msg.text && (
                    <div className={`alert alert-${msg.type} py-2 px-3 mb-4 small fw-semibold rounded-3`} role="alert">
                        {msg.type === "success" ? <FaCheckCircle /> : <FaExclamationCircle />} {msg.text}
                    </div>
                )}

                <div className="card shadow-lg border-0 rounded-4 bg-white p-4 max-w-700 mx-auto">
                    <div className="d-flex align-items-center gap-2 mb-3 text-danger border-bottom pb-3">
                        <FaBroadcastTower className="fs-3" />
                        <h4 className="fw-bold m-0">Send System-Wide Announcement</h4>
                    </div>

                    <form onSubmit={handleBroadcast}>
                        <div className="mb-3">
                            <label className="form-label fw-semibold">Target Audience</label>
                            <select
                                className="form-select"
                                value={targetRole}
                                onChange={(e) => setTargetRole(e.target.value)}
                            >
                                <option value="all">All Users (Students & Faculty)</option>
                                <option value="student">Students Only</option>
                                <option value="faculty">Approved Faculty Only</option>
                            </select>
                        </div>

                        <div className="mb-3">
                            <label className="form-label fw-semibold">Announcement Title</label>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="e.g. Mandatory Placement Orientation Tomorrow"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                            />
                        </div>

                        <div className="mb-4">
                            <label className="form-label fw-semibold">Message Content</label>
                            <textarea
                                className="form-control"
                                rows="5"
                                placeholder="Enter notification message text to broadcast to users..."
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                required
                            ></textarea>
                        </div>

                        <button type="submit" className="btn btn-danger w-100 py-2 fw-bold" disabled={sending}>
                            {sending ? "Broadcasting Alert..." : "Broadcast Announcement Now"}
                        </button>
                    </form>
                </div>

            </div>
        </>
    );
}

export default BroadcastNotifications;
