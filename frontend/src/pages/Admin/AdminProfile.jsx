import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import ChangePasswordCard from "../../components/ChangePasswordCard";
import { FaUserShield } from "react-icons/fa";

function AdminProfile() {
    const username = localStorage.getItem("username") || "admin";

    return (
        <>
            <Sidebar activeRole="admin" />
            <Navbar title="Admin Account Settings" userRole="admin" />

            <div className="container-fluid animate-fade-in" style={{ marginLeft: "260px", paddingTop: "90px", paddingRight: "30px", maxWidth: "calc(100% - 260px)" }}>
                <div className="card shadow-lg border-0 rounded-4 bg-white p-4 max-w-800 mx-auto">
                    
                    <div className="d-flex align-items-center gap-3 mb-4 pb-3 border-bottom">
                        <div className="p-3 bg-danger bg-opacity-10 text-danger rounded-circle">
                            <FaUserShield className="display-5" />
                        </div>
                        <div>
                            <h4 className="fw-bold m-0 text-dark">{username}</h4>
                            <span className="badge bg-danger">System Administrator</span>
                        </div>
                    </div>

                    <div className="mb-4">
                        <h6 className="fw-bold text-dark mb-2">🛡️ Security & Access Control</h6>
                        <p className="text-secondary small">As a System Administrator, you have full control over user registrations, faculty management, and system-wide settings.</p>
                    </div>

                    <ChangePasswordCard />

                </div>
            </div>
        </>
    );
}

export default AdminProfile;
