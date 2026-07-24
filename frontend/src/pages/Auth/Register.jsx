import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import api from "../../services/api";

const Register = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        confirm_password: "",
        role: location.state?.role || "student",
    });

    const [successMsg, setSuccessMsg] = useState("");
    const [errorMsg, setErrorMsg] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        setErrorMsg("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg("");
        setSuccessMsg("");

        if (formData.password !== formData.confirm_password) {
            setErrorMsg("Passwords do not match!");
            return;
        }

        setLoading(true);

        try {
            await api.post("register/", {
                username: formData.username,
                email: formData.email,
                password: formData.password,
                role: formData.role,
            });

            if (formData.role === "faculty") {
                setSuccessMsg("Registration successful! Your faculty account is pending administrator approval before you can log in.");
            } else {
                setSuccessMsg("Registration successful! Redirecting to login...");
                setTimeout(() => navigate("/login", { state: { role: "student" } }), 1500);
            }
        } catch (error) {
            console.error(error.response?.data);
            if (error.response?.data?.username) {
                setErrorMsg(`Username error: ${error.response.data.username.join(' ')}`);
            } else if (error.response?.data?.detail) {
                setErrorMsg(error.response.data.detail);
            } else {
                setErrorMsg("Registration failed. Please check your details.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-bg-bright">
            <div className="card auth-light-card p-4 p-sm-5 text-dark" style={{ width: "470px" }}>
                <div className="text-center mb-4">
                    <div className="d-inline-flex align-items-center justify-content-center p-3 bg-success bg-opacity-10 text-success rounded-circle mb-2 shadow-sm border border-success border-opacity-20">
                        <span className="fs-1">🎓</span>
                    </div>
                    <h3 className="fw-bold text-dark mb-1" style={{ color: "#1e1b4b" }}>Create Account</h3>
                    <p className="text-muted small">AI Mock Interview Placement Portal</p>
                </div>

                {successMsg && (
                    <div className="alert alert-success py-2 px-3 mb-3 small fw-semibold rounded-3" role="alert">
                        ✅ {successMsg}
                    </div>
                )}

                {errorMsg && (
                    <div className="alert alert-danger py-2 px-3 mb-3 small fw-semibold rounded-3" role="alert">
                        ⚠️ {errorMsg}
                    </div>
                )}

                <form onSubmit={handleSubmit}>

                    <div className="mb-3">
                        <label className="form-label fw-bold small text-secondary">Role</label>
                        <select
                            className="form-select auth-input-light fw-bold text-primary"
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                        >
                            <option value="student">Student</option>
                            <option value="faculty">Faculty (Requires Admin Approval)</option>
                        </select>
                    </div>

                    <div className="mb-3">
                        <label className="form-label fw-bold small text-secondary">Username</label>
                        <input
                            type="text"
                            className="form-control auth-input-light"
                            name="username"
                            placeholder="Enter username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label fw-bold small text-secondary">Email</label>
                        <input
                            type="email"
                            className="form-control auth-input-light"
                            name="email"
                            placeholder="Enter email address"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label fw-bold small text-secondary">Password</label>
                        <input
                            type="password"
                            className="form-control auth-input-light"
                            name="password"
                            placeholder="Create password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="form-label fw-bold small text-secondary">Confirm Password</label>
                        <input
                            type="password"
                            className="form-control auth-input-light"
                            name="confirm_password"
                            placeholder="Confirm password"
                            value={formData.confirm_password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <button type="submit" className="btn btn-success w-100 py-3 fw-bold rounded-3 shadow-md" disabled={loading}>
                        {loading ? "Registering..." : "Complete Registration"}
                    </button>

                    <div className="text-center mt-4">
                        <span className="text-muted small">Already have an account? </span>
                        <Link to="/login" className="fw-bold text-primary text-decoration-none">Login Here</Link>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default Register;