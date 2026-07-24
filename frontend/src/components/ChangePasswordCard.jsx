import { useState } from "react";
import { changeUserPassword } from "../services/adminService";
import { FaKey, FaLock, FaCheckCircle, FaExclamationCircle } from "react-icons/fa";

function ChangePasswordCard() {
    const [formData, setFormData] = useState({
        current_password: "",
        new_password: "",
        confirm_password: ""
    });

    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState({ type: "", text: "" });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        if (msg.text) setMsg({ type: "", text: "" });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMsg({ type: "", text: "" });

        if (formData.new_password !== formData.confirm_password) {
            setMsg({ type: "danger", text: "New password and confirm password do not match!" });
            return;
        }

        if (formData.new_password.length < 6) {
            setMsg({ type: "danger", text: "New password must be at least 6 characters long." });
            return;
        }

        try {
            setLoading(true);
            const res = await changeUserPassword(formData);
            setMsg({ type: "success", text: res.data.message || "Password updated successfully in database!" });
            setFormData({ current_password: "", new_password: "", confirm_password: "" });
        } catch (error) {
            console.error("Change password error", error);
            const errDetail = error.response?.data?.detail || "Failed to change password. Please check your current password.";
            setMsg({ type: "danger", text: errDetail });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card shadow-md border-0 rounded-4 bg-white p-4">
            <div className="d-flex align-items-center gap-2 mb-3 pb-2 border-bottom">
                <div className="p-2 bg-primary bg-opacity-10 text-primary rounded-circle">
                    <FaKey className="fs-5" />
                </div>
                <div>
                    <h5 className="fw-bold text-dark m-0">Security & Change Password</h5>
                    <span className="extra-small text-muted">Update your account login password</span>
                </div>
            </div>

            {msg.text && (
                <div className={`alert alert-${msg.type} py-2.5 px-3 mb-3 small fw-semibold rounded-3 d-flex align-items-center gap-2`}>
                    {msg.type === "success" ? <FaCheckCircle className="fs-5 text-success" /> : <FaExclamationCircle className="fs-5 text-danger" />}
                    <span>{msg.text}</span>
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label className="form-label fw-bold small text-secondary">Current Password</label>
                    <div className="input-group">
                        <span className="input-group-text bg-light border-light-subtle"><FaLock className="text-secondary" /></span>
                        <input
                            type="password"
                            name="current_password"
                            className="form-control border-light-subtle rounded-end-3"
                            placeholder="Enter current password"
                            value={formData.current_password}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>

                <div className="row g-3 mb-4">
                    <div className="col-md-6">
                        <label className="form-label fw-bold small text-secondary">New Password</label>
                        <input
                            type="password"
                            name="new_password"
                            className="form-control border-light-subtle rounded-3"
                            placeholder="Create new password"
                            value={formData.new_password}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="col-md-6">
                        <label className="form-label fw-bold small text-secondary">Confirm New Password</label>
                        <input
                            type="password"
                            name="confirm_password"
                            className="form-control border-light-subtle rounded-3"
                            placeholder="Confirm new password"
                            value={formData.confirm_password}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>

                <button type="submit" className="btn btn-primary fw-bold rounded-pill px-4 shadow-sm" disabled={loading}>
                    {loading ? "Updating Database..." : "Update Password"}
                </button>
            </form>
        </div>
    );
}

export default ChangePasswordCard;
