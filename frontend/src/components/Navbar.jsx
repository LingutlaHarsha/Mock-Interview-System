import { useNavigate } from "react-router-dom";
import { FaUserCircle, FaSignOutAlt, FaGraduationCap } from "react-icons/fa";
import "../styles/navbar.css";

function Navbar({ title, userName, userRole }) {
    const navigate = useNavigate();
    const role = userRole || localStorage.getItem("role") || "student";
    const username = userName || localStorage.getItem("username") || "User";

    const handleLogout = () => {
        localStorage.clear();
        navigate("/login");
    };

    return (
        <div
            className="navbar shadow-sm border-bottom px-4 py-3 d-flex justify-content-between align-items-center position-fixed top-0 end-0"
            style={{
                left: "260px",
                zIndex: 1000,
                height: "70px",
                backgroundColor: "rgba(255, 255, 255, 0.88)",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)"
            }}
        >
            <div className="d-flex align-items-center gap-2">
                <div className="p-2 bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center">
                    <FaGraduationCap className="fs-4" />
                </div>
                <h4 className="m-0 text-dark fw-bold" style={{ fontSize: "1.25rem", tracking: "-0.02em" }}>{title || "Placement Interview Portal"}</h4>
            </div>

            <div className="d-flex align-items-center gap-3">
                <div className="d-flex align-items-center gap-2 bg-light px-3 py-1.5 rounded-pill border border-light-subtle shadow-2xs">
                    <FaUserCircle className="fs-4 text-primary opacity-75" />
                    <span className="fw-bold text-dark small">
                        {username}
                    </span>
                    <span className={`badge rounded-pill text-uppercase ms-1 px-2.5 py-1 ${
                        role === 'admin' ? 'bg-danger' : role === 'faculty' ? 'bg-success' : 'bg-primary'
                    }`}>
                        {role}
                    </span>
                </div>

                <button
                    className="btn btn-outline-danger btn-sm rounded-pill px-3 py-1.5 d-flex align-items-center gap-1.5 fw-semibold"
                    onClick={handleLogout}
                >
                    <FaSignOutAlt /> Logout
                </button>
            </div>
        </div>
    );
}

export default Navbar;