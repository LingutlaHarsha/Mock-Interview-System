import { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import ChangePasswordCard from "../../components/ChangePasswordCard";
import { getFacultyProfile, updateFacultyProfile } from "../../services/facultyService";
import { FaUserTie, FaCheckCircle, FaEnvelope, FaUser, FaCalendarAlt, FaShieldAlt } from "react-icons/fa";

function FacultyProfile() {
    const [profile, setProfile] = useState(null);
    const [form, setForm] = useState({ username: "", email: "" });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState({ type: "", text: "" });

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            setLoading(true);
            const res = await getFacultyProfile();
            setProfile(res.data);
            setForm({
                username: res.data.username || "",
                email: res.data.email || ""
            });
        } catch (error) {
            console.error("Failed to load faculty profile", error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setMsg({ type: "", text: "" });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            setMsg({ type: "", text: "" });
            
            const payload = {
                username: form.username,
                email: form.email
            };

            const res = await updateFacultyProfile(payload);
            setProfile(res.data);
            if (res.data.username) {
                localStorage.setItem("username", res.data.username);
            }
            setMsg({ type: "success", text: "Faculty profile updated successfully!" });
        } catch (error) {
            console.error(error);
            const errData = error.response?.data;
            let errMsg = "Failed to update profile.";
            if (errData) {
                if (typeof errData === 'string') errMsg = errData;
                else if (errData.detail) errMsg = errData.detail;
                else {
                    const keys = Object.keys(errData);
                    if (keys.length > 0) errMsg = `${keys[0]}: ${errData[keys[0]][0]}`;
                }
            }
            setMsg({ type: "danger", text: errMsg });
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            <Sidebar activeRole="faculty" />
            <Navbar title="Faculty Account Profile" userRole="faculty" />

            <div className="container-fluid animate-fade-in" style={{ marginLeft: "260px", paddingTop: "90px", paddingRight: "30px", maxWidth: "calc(100% - 260px)" }}>
                <div className="card shadow-lg border-0 rounded-4 bg-white p-4 max-w-800 mx-auto">
                    
                    <div className="d-flex align-items-center gap-3 mb-4 pb-3 border-bottom">
                        <div className="p-3 bg-success-subtle text-success rounded-circle">
                            <FaUserTie className="display-5" />
                        </div>
                        <div>
                            <h4 className="fw-bold m-0 text-dark">{profile?.username || "Faculty Member"}</h4>
                            <span className="badge bg-success me-2">Faculty Panelist</span>
                            {profile?.is_approved && <span className="badge bg-primary">Approved Account ✅</span>}
                        </div>
                    </div>

                    {msg.text && (
                        <div className={`alert alert-${msg.type} py-2 px-3 mb-4 small fw-semibold rounded-3`} role="alert">
                            <FaCheckCircle className="me-2" /> {msg.text}
                        </div>
                    )}

                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-success" role="status">
                                <span className="visually-hidden">Loading profile...</span>
                            </div>
                        </div>
                    ) : (
                        <>
                            <form onSubmit={handleSubmit} className="mb-5">
                                <h6 className="fw-bold text-dark mb-3">📋 Faculty Account Information</h6>
                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <label className="form-label fw-semibold small">
                                            <FaUser className="text-muted me-1" /> Username
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="username"
                                            value={form.username}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <div className="col-md-6">
                                        <label className="form-label fw-semibold small">
                                            <FaEnvelope className="text-muted me-1" /> Email Address
                                        </label>
                                        <input
                                            type="email"
                                            className="form-control"
                                            name="email"
                                            value={form.email}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <div className="col-md-6">
                                        <label className="form-label fw-semibold small">
                                            <FaShieldAlt className="text-muted me-1" /> Account Role
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control bg-light text-capitalize"
                                            value={profile?.role || "faculty"}
                                            disabled
                                        />
                                    </div>

                                    <div className="col-md-6">
                                        <label className="form-label fw-semibold small">
                                            <FaCalendarAlt className="text-muted me-1" /> Registration Date
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control bg-light"
                                            value={profile?.date_joined ? new Date(profile.date_joined).toLocaleDateString() : "N/A"}
                                            disabled
                                        />
                                    </div>
                                </div>

                                <div className="mt-4 pt-3 text-end">
                                    <button type="submit" className="btn btn-success fw-bold px-4 rounded-pill shadow-sm" disabled={saving}>
                                        {saving ? "Saving Changes..." : "Save Profile Details"}
                                    </button>
                                </div>
                            </form>

                            {/* Password Change Card */}
                            <div className="pt-4 border-top">
                                <ChangePasswordCard />
                            </div>
                        </>
                    )}

                </div>
            </div>
        </>
    );
}

export default FacultyProfile;
