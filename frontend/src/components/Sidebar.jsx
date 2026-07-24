import { NavLink } from "react-router-dom";
import {
    FaHome, FaCalendarAlt, FaBookmark,
    FaBell, FaStar, FaUser,
    FaUserCheck, FaUsers, FaBroadcastTower, FaUserGraduate,
    FaCalendarCheck, FaCode, FaLaptopCode, FaHistory
} from "react-icons/fa";
import "../styles/sidebar.css";

function Sidebar({ activeRole }) {
    const role = activeRole || localStorage.getItem("role") || "student";

    return (
        <div className="sidebar shadow position-fixed top-0 start-0 vh-100 p-3" style={{ width: "260px", zIndex: 1001 }}>
            <div className="sidebar-header d-flex align-items-center gap-2.5 pb-3 mb-3 border-bottom border-white border-opacity-10">
                <div className="p-2 bg-primary bg-opacity-20 rounded-circle text-info d-flex align-items-center justify-content-center">
                    <FaUserGraduate className="fs-4" />
                </div>
                <div>
                    <h5 className="m-0 fw-bold text-white fs-6">Placement Portal</h5>
                    <span className="badge bg-white bg-opacity-10 text-info extra-small px-2 py-0.5 rounded-pill text-uppercase">
                        {role} Panel
                    </span>
                </div>
            </div>

            <ul className="nav nav-pills flex-column mb-auto">
                {role === "student" && (
                    <>
                        <li className="nav-item mb-1.5">
                            <NavLink to="/student/dashboard" className={({ isActive }) => `nav-link d-flex align-items-center gap-2.5 text-white ${isActive ? "active" : ""}`}>
                                <FaHome /> Dashboard
                            </NavLink>
                        </li>
                        <li className="nav-item mb-1.5">
                            <NavLink to="/student/upcoming" className={({ isActive }) => `nav-link d-flex align-items-center gap-2.5 text-white ${isActive ? "active" : ""}`}>
                                <FaCalendarCheck className="text-info" /> Upcoming Interviews
                            </NavLink>
                        </li>
                        <li className="nav-item mb-1.5">
                            <NavLink to="/student/slots" className={({ isActive }) => `nav-link d-flex align-items-center gap-2.5 text-white ${isActive ? "active" : ""}`}>
                                <FaCalendarAlt /> Interview Slots
                            </NavLink>
                        </li>
                        <li className="nav-item mb-1.5">
                            <NavLink to="/student/coding-assessments" className={({ isActive }) => `nav-link d-flex align-items-center gap-2.5 text-white ${isActive ? "active" : ""}`}>
                                <FaCode className="text-warning" /> Technical Assessments
                            </NavLink>
                        </li>
                        <li className="nav-item mb-1.5">
                            <NavLink to="/student/coding-attempts" className={({ isActive }) => `nav-link d-flex align-items-center gap-2.5 text-white ${isActive ? "active" : ""}`}>
                                <FaLaptopCode className="text-success" /> My Coding Attempts
                            </NavLink>
                        </li>
                        <li className="nav-item mb-1.5">
                            <NavLink to="/student/bookings" className={({ isActive }) => `nav-link d-flex align-items-center gap-2.5 text-white ${isActive ? "active" : ""}`}>
                                <FaBookmark /> My Bookings
                            </NavLink>
                        </li>
                        <li className="nav-item mb-1.5">
                            <NavLink to="/student/notifications" className={({ isActive }) => `nav-link d-flex align-items-center gap-2.5 text-white ${isActive ? "active" : ""}`}>
                                <FaBell /> Notifications
                            </NavLink>
                        </li>
                        <li className="nav-item mb-1.5">
                            <NavLink to="/student/feedback" className={({ isActive }) => `nav-link d-flex align-items-center gap-2.5 text-white ${isActive ? "active" : ""}`}>
                                <FaStar className="text-warning" /> Feedback
                            </NavLink>
                        </li>
                        <li className="nav-item mb-1.5">
                            <NavLink to="/student/profile" className={({ isActive }) => `nav-link d-flex align-items-center gap-2.5 text-white ${isActive ? "active" : ""}`}>
                                <FaUser /> Profile
                            </NavLink>
                        </li>
                    </>
                )}

                {role === "faculty" && (
                    <>
                        <li className="nav-item mb-1.5">
                            <NavLink to="/faculty/dashboard" className={({ isActive }) => `nav-link d-flex align-items-center gap-2.5 text-white ${isActive ? "active bg-success" : ""}`}>
                                <FaHome /> Dashboard
                            </NavLink>
                        </li>
                        <li className="nav-item mb-1.5">
                            <NavLink to="/faculty/slots" className={({ isActive }) => `nav-link d-flex align-items-center gap-2.5 text-white ${isActive ? "active bg-success" : ""}`}>
                                <FaCalendarAlt /> Interview Slots
                            </NavLink>
                        </li>
                        <li className="nav-item mb-1.5">
                            <NavLink to="/faculty/upcoming" className={({ isActive }) => `nav-link d-flex align-items-center gap-2.5 text-white ${isActive ? "active bg-success" : ""}`}>
                                <FaCalendarCheck className="text-warning" /> Upcoming Interviews
                            </NavLink>
                        </li>
                        <li className="nav-item mb-1.5">
                            <NavLink to="/faculty/coding-assessments" className={({ isActive }) => `nav-link d-flex align-items-center gap-2.5 text-white ${isActive ? "active bg-success" : ""}`}>
                                <FaCode className="text-warning" /> Technical Assessments
                            </NavLink>
                        </li>
                        <li className="nav-item mb-1.5">
                            <NavLink to="/faculty/students" className={({ isActive }) => `nav-link d-flex align-items-center gap-2.5 text-white ${isActive ? "active bg-success" : ""}`}>
                                <FaUsers /> Students
                            </NavLink>
                        </li>
                        <li className="nav-item mb-1.5">
                            <NavLink to="/faculty/feedback" className={({ isActive }) => `nav-link d-flex align-items-center gap-2.5 text-white ${isActive ? "active bg-success" : ""}`}>
                                <FaHistory /> Interview History
                            </NavLink>
                        </li>
                        <li className="nav-item mb-1.5">
                            <NavLink to="/faculty/notifications" className={({ isActive }) => `nav-link d-flex align-items-center gap-2.5 text-white ${isActive ? "active bg-success" : ""}`}>
                                <FaBell /> Notifications
                            </NavLink>
                        </li>
                        <li className="nav-item mb-1.5">
                            <NavLink to="/faculty/profile" className={({ isActive }) => `nav-link d-flex align-items-center gap-2.5 text-white ${isActive ? "active bg-success" : ""}`}>
                                <FaUser /> Profile
                            </NavLink>
                        </li>
                    </>
                )}

                {role === "admin" && (
                    <>
                        <li className="nav-item mb-1.5">
                            <NavLink to="/admin/dashboard" className={({ isActive }) => `nav-link d-flex align-items-center gap-2.5 text-white ${isActive ? "active bg-danger" : ""}`}>
                                <FaHome /> Dashboard
                            </NavLink>
                        </li>
                        <li className="nav-item mb-1.5">
                            <NavLink to="/admin/faculty-management" className={({ isActive }) => `nav-link d-flex align-items-center gap-2.5 text-white ${isActive ? "active bg-danger" : ""}`}>
                                <FaUserCheck className="text-warning" /> Manage Faculty
                            </NavLink>
                        </li>
                        <li className="nav-item mb-1.5">
                            <NavLink to="/admin/faculty-approvals" className={({ isActive }) => `nav-link d-flex align-items-center gap-2.5 text-white ${isActive ? "active bg-danger" : ""}`}>
                                <FaUserCheck /> Faculty Approvals
                            </NavLink>
                        </li>
                        <li className="nav-item mb-1.5">
                            <NavLink to="/admin/students" className={({ isActive }) => `nav-link d-flex align-items-center gap-2.5 text-white ${isActive ? "active bg-danger" : ""}`}>
                                <FaUsers /> Student Roster
                            </NavLink>
                        </li>
                        <li className="nav-item mb-1.5">
                            <NavLink to="/admin/broadcast" className={({ isActive }) => `nav-link d-flex align-items-center gap-2.5 text-white ${isActive ? "active bg-danger" : ""}`}>
                                <FaBroadcastTower /> Broadcast Alert
                            </NavLink>
                        </li>
                        <li className="nav-item mb-1.5">
                            <NavLink to="/admin/profile" className={({ isActive }) => `nav-link d-flex align-items-center gap-2.5 text-white ${isActive ? "active bg-danger" : ""}`}>
                                <FaUser /> Settings & Profile
                            </NavLink>
                        </li>
                    </>
                )}
            </ul>
        </div>
    );
}

export default Sidebar;