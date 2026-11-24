import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import api from "../../services/api";

function Login() {
    const navigate = useNavigate();
    const location = useLocation();

    const [role, setRole] = useState(location.state?.role || "student");
    const [formData, setFormData] = useState({
        username: "",
        password: "",
    });

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
        setLoading(true);

        try {
            const response = await api.post("login/", {
                username: formData.username,
                password: formData.password,
                role: role,
            });

            localStorage.setItem("access", response.data.access);
            localStorage.setItem("refresh", response.data.refresh);
            localStorage.setItem("username", response.data.username);
            localStorage.setItem("role", response.data.role);

            if (response.data.role === "student") {
                navigate("/student/dashboard");
            } else if (response.data.role === "faculty") {
                navigate("/faculty/dashboard");
            } else if (response.data.role === "admin") {
                navigate("/admin/dashboard");
            }

        } catch (error) {
            console.error(error.response?.data);
            if (error.response?.data?.detail) {
                setErrorMsg(error.response.data.detail);
            } else {
                setErrorMsg("Invalid username, password or role credentials.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-bg-bright">
            <div className="card auth-light-card p-4 p-sm-5 text-dark" style={{ width: "460px" }}>

                <div className="text-center mb-4">
                    <div className="d-inline-flex align-items-center justify-content-center p-3 bg-primary bg-opacity-10 text-primary rounded-circle mb-2 shadow-sm border border-primary border-opacity-20">
                        <span className="fs-1">🎓</span>
                    </div>
                    <h3 className="fw-bold text-dark mb-1" style={{ color: "#1e1b4b" }}>Mock Interview System</h3>
                    <p className="text-muted small">Mock Interview & Technical Assessment System</p>
                </div>

                {/* Role Selector Tabs */}
                <div className="btn-group w-100 mb-4 rounded-3 p-1.5 bg-light border" role="group">
                    <button
                        type="button"
                        className={`btn btn-sm rounded-2 fw-bold ${role === 'student' ? 'btn-primary text-white shadow-sm' : 'btn-light text-secondary'}`}
                        onClick={() => { setRole('student'); setErrorMsg(''); }}
                    >
                        Student
                    </button>
                    <button
                        type="button"
                        className={`btn btn-sm rounded-2 fw-bold ${role === 'faculty' ? 'btn-success text-white shadow-sm' : 'btn-light text-secondary'}`}
                        onClick={() => { setRole('faculty'); setErrorMsg(''); }}
                    >
                        Faculty
                    </button>
                    <button
                        type="button"
                        className={`btn btn-sm rounded-2 fw-bold ${role === 'admin' ? 'btn-danger text-white shadow-sm' : 'btn-light text-secondary'}`}
                        onClick={() => { setRole('admin'); setErrorMsg(''); }}
                    >
                        Admin
                    </button>
                </div>

                {errorMsg && (
                    <div className="alert alert-danger py-2 px-3 mb-3 small fw-semibold rounded-3 d-flex align-items-center gap-2" role="alert">
                        <span>⚠️</span>
                        <span>{errorMsg}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit}>

                    <div className="mb-3">
                        <label className="form-label fw-bold small text-secondary">
                            Username
                        </label>

                        <input
                            type="text"
                            name="username"
                            className="form-control auth-input-light"
                            placeholder="Enter your username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="form-label fw-bold small text-secondary">
                            Password
                        </label>

                        <input
                            type="password"
                            name="password"
                            className="form-control auth-input-light"
                            placeholder="Enter your password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className={`btn w-100 py-3 fw-bold text-white rounded-3 shadow-md ${
                            role === 'faculty' ? 'btn-success' : role === 'admin' ? 'btn-danger' : 'btn-primary'
                        }`}
                        disabled={loading}
                    >
                        {loading ? "Authenticating..." : `Login as ${role.charAt(0).toUpperCase() + role.slice(1)}`}
                    </button>

                    <div className="text-center mt-4">
                        {role !== "admin" && (
                            <p className="text-muted small mb-0">
                                Don't have an account?{" "}
                                <Link to="/register" state={{ role }} className="fw-bold text-primary text-decoration-none">Register Here</Link>
                            </p>
                        )}
                    </div>

                </form>

            </div>
        </div>
    );
}

export default Login;