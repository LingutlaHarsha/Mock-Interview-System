import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";

import {
    getStudentProfile,
    updateStudentProfile,
    uploadResume,
} from "../../services/studentService";
import { getBackendUrl } from "../../services/api";
import ChangePasswordCard from "../../components/ChangePasswordCard";
import { FaUserGraduate, FaFilePdf, FaFileUpload, FaCheckCircle, FaExclamationCircle } from "react-icons/fa";

function Profile() {
    const [profile, setProfile] = useState({
        full_name: "",
        email: "",
        roll_number: "",
        branch: "",
        year: "1",
        phone: "",
        cgpa: "",
        skills: "",
        resume: "",
    });

    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadingFile, setUploadingFile] = useState(false);
    const [msg, setMsg] = useState({ type: "", text: "" });

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const response = await getStudentProfile();

            setProfile({
                full_name: response.data.full_name || "",
                email: response.data.email || "",
                roll_number: response.data.roll_number || "",
                branch: response.data.branch || "",
                year: response.data.year || "1",
                phone: response.data.phone || "",
                cgpa: response.data.cgpa || "",
                skills: response.data.skills || "",
                resume: response.data.resume || "",
            });
        } catch (error) {
            console.error(error);
            setMsg({ type: "danger", text: "Failed to load student profile." });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setProfile({
            ...profile,
            [e.target.name]: e.target.value,
        });
        setMsg({ type: "", text: "" });
    };

    const handleUploadResume = async () => {
        if (!file) return;
        try {
            setUploadingFile(true);
            setMsg({ type: "", text: "" });
            const formData = new FormData();
            formData.append("resume", file);
            const res = await uploadResume(formData);
            setProfile(prev => ({ ...prev, resume: res.data.resume }));
            setFile(null);
            setMsg({ type: "success", text: "Resume PDF uploaded successfully!" });
        } catch (error) {
            console.error(error);
            setMsg({ type: "danger", text: "Failed to upload resume. Ensure file is a valid PDF." });
        } finally {
            setUploadingFile(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setMsg({ type: "", text: "" });

        if (profile.phone && !/^\d{10}$/.test(profile.phone)) {
            setMsg({ type: "danger", text: "Phone number must be exactly 10 digits." });
            return;
        }

        if (profile.cgpa && (parseFloat(profile.cgpa) < 0 || parseFloat(profile.cgpa) > 10)) {
            setMsg({ type: "danger", text: "CGPA must be a value between 0.00 and 10.00." });
            return;
        }

        try {
            setSaving(true);

            await updateStudentProfile({
                full_name: profile.full_name,
                roll_number: profile.roll_number,
                branch: profile.branch || "General",
                year: profile.year || "1",
                phone: profile.phone || "",
                cgpa: profile.cgpa !== "" && profile.cgpa !== null && profile.cgpa !== undefined ? parseFloat(profile.cgpa) : 0.00,
                skills: profile.skills || "",
            });

            setMsg({ type: "success", text: "Profile details updated successfully!" });
        } catch (error) {
            console.error(error);
            const errData = error.response?.data;
            let errMsg = "Failed to update profile. Please verify your details.";
            if (errData) {
                if (typeof errData === "string") errMsg = errData;
                else if (errData.detail) errMsg = errData.detail;
                else {
                    const firstKey = Object.keys(errData)[0];
                    if (firstKey) {
                        const val = errData[firstKey];
                        errMsg = `${firstKey.replace('_', ' ')}: ${Array.isArray(val) ? val[0] : val}`;
                    }
                }
            }
            setMsg({ type: "danger", text: errMsg });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <>
                <Sidebar activeRole="student" />
                <Navbar title="Student Profile" userRole="student" />

                <div className="container" style={{ marginLeft: "260px", paddingTop: "90px" }}>
                    <div className="d-flex justify-content-center align-items-center vh-50">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading Profile...</span>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Sidebar activeRole="student" />
            <Navbar title="Student Profile" userName={profile.full_name} userRole="student" />

            <div className="container-fluid" style={{ marginLeft: "260px", paddingTop: "90px", paddingRight: "30px", maxWidth: "calc(100% - 260px)" }}>
                <div className="card shadow-lg border-0 rounded-4 bg-white">

                    <div className="card-header bg-primary text-white p-4 rounded-top-4 d-flex align-items-center justify-content-between">
                        <div>
                            <h4 className="mb-0 fw-bold"><FaUserGraduate className="me-2" /> Student Profile & Resume</h4>
                            <p className="mb-0 small text-white-50">Manage your academic profile and upload your resume for faculty evaluations.</p>
                        </div>
                    </div>

                    <div className="card-body p-4">

                        {msg.text && (
                            <div className={`alert alert-${msg.type} py-2 px-3 mb-4 small fw-semibold rounded-3 d-flex align-items-center justify-content-between`} role="alert">
                                <div>
                                    {msg.type === "success" ? <FaCheckCircle className="me-2" /> : <FaExclamationCircle className="me-2" />}
                                    {msg.text}
                                </div>
                                <button type="button" className="btn-close" onClick={() => setMsg({ type: "", text: "" })}></button>
                            </div>
                        )}

                        {/* Resume Section Box */}
                        <div className="bg-light p-4 rounded-4 border mb-4">
                            <h6 className="fw-bold text-dark mb-2">
                                <FaFilePdf className="text-danger me-2" /> Student Resume Document (.pdf)
                            </h6>
                            <p className="text-muted small mb-3">Upload your latest PDF resume. Faculty members will review this document when reviewing your interview requests.</p>

                            <div className="d-flex flex-wrap align-items-center gap-3">
                                <input
                                    type="file"
                                    accept=".pdf"
                                    className="form-control"
                                    style={{ maxWidth: "350px" }}
                                    onChange={(e) => setFile(e.target.files[0])}
                                />
                                <button
                                    type="button"
                                    className="btn btn-success fw-bold rounded-pill px-4"
                                    disabled={!file || uploadingFile}
                                    onClick={handleUploadResume}
                                >
                                    <FaFileUpload className="me-1" /> {uploadingFile ? "Uploading..." : "Upload PDF Resume"}
                                </button>

                                {profile.resume ? (
                                    <a
                                        href={profile.resume.startsWith("http") ? profile.resume : `${getBackendUrl() || 'http://127.0.0.1:8000'}${profile.resume}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="btn btn-outline-primary fw-bold rounded-pill px-4"
                                    >
                                        <FaFilePdf className="me-1" /> View Uploaded Resume
                                    </a>
                                ) : (
                                    <span className="badge bg-danger p-2 rounded-pill px-3">
                                        ❌ Resume Not Uploaded
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Academic Details Form */}
                        <form onSubmit={handleSave}>
                            <h6 className="fw-bold text-dark mb-3">📋 Academic & Personal Details</h6>
                            <div className="row g-3">

                                <div className="col-md-6">
                                    <label className="form-label fw-bold small text-secondary">
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="full_name"
                                        value={profile.full_name}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label fw-bold small text-secondary">
                                        Email (Read-Only)
                                    </label>
                                    <input
                                        type="email"
                                        className="form-control bg-light"
                                        value={profile.email}
                                        readOnly
                                    />
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label fw-bold small text-secondary">
                                        Roll Number
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="roll_number"
                                        value={profile.roll_number}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label fw-bold small text-secondary">
                                        Branch / Department
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="branch"
                                        placeholder="e.g. Computer Science Engineering"
                                        value={profile.branch}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label fw-bold small text-secondary">
                                        Year of Study
                                    </label>
                                    <select
                                        className="form-select"
                                        name="year"
                                        value={profile.year}
                                        onChange={handleChange}
                                    >
                                        <option value="1">1st Year</option>
                                        <option value="2">2nd Year</option>
                                        <option value="3">3rd Year</option>
                                        <option value="4">4th Year</option>
                                    </select>
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label fw-bold small text-secondary">
                                        Phone Number (10 digits)
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="phone"
                                        placeholder="10-digit mobile number"
                                        value={profile.phone}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label fw-bold small text-secondary">
                                        CGPA (0.00 - 10.00)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        max="10"
                                        className="form-control"
                                        name="cgpa"
                                        value={profile.cgpa}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="col-12">
                                    <label className="form-label fw-bold small text-secondary">
                                        Technical & Soft Skills
                                    </label>
                                    <textarea
                                        className="form-control"
                                        rows="3"
                                        name="skills"
                                        placeholder="e.g. Python, Java, React, Data Structures, Communication, Problem Solving"
                                        value={profile.skills}
                                        onChange={handleChange}
                                    ></textarea>
                                </div>

                            </div>

                            <div className="text-end mt-4">
                                <button
                                    type="submit"
                                    className="btn btn-primary px-4 py-2 fw-bold rounded-pill"
                                    disabled={saving}
                                >
                                    {saving ? "Saving..." : "Save Profile Details"}
                                </button>
                            </div>
                        </form>

                        <div className="mt-5 pt-4 border-top">
                            <ChangePasswordCard />
                        </div>

                    </div>

                </div>
            </div>
        </>
    );
}

export default Profile;