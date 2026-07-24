import { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import { getStudentProfile, uploadResume } from "../../services/studentService";
import { FaFilePdf, FaCloudUploadAlt, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";

function Resume() {
    const [currentResume, setCurrentResume] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [msg, setMsg] = useState({ type: "", text: "" });

    useEffect(() => {
        loadProfileData();
    }, []);

    const loadProfileData = async () => {
        try {
            const res = await getStudentProfile();
            setCurrentResume(res.data.resume || "");
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setMsg({ type: "", text: "" });

        if (!file) return;

        if (file.type !== "application/pdf") {
            setMsg({ type: "danger", text: "Only PDF files are allowed!" });
            setSelectedFile(null);
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setMsg({ type: "danger", text: "File size must be 5 MB or less!" });
            setSelectedFile(null);
            return;
        }

        setSelectedFile(file);
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!selectedFile) {
            setMsg({ type: "danger", text: "Please choose a PDF resume file to upload." });
            return;
        }

        const formData = new FormData();
        formData.append("resume", selectedFile);

        try {
            setUploading(true);
            setMsg({ type: "", text: "" });
            const res = await uploadResume(formData);
            setCurrentResume(res.data.resume || "");
            setMsg({ type: "success", text: "Resume uploaded successfully!" });
            setSelectedFile(null);
        } catch (error) {
            console.error(error);
            setMsg({ type: "danger", text: "Failed to upload resume. Please try again." });
        } finally {
            setUploading(false);
        }
    };

    return (
        <>
            <Sidebar activeRole="student" />
            <Navbar title="Resume Management" userRole="student" />

            <div className="container-fluid" style={{ marginLeft: "260px", paddingTop: "90px", paddingRight: "30px", maxWidth: "calc(100% - 260px)" }}>
                <div className="card shadow-lg border-0 rounded-4 mb-4">
                    <div className="card-header bg-primary text-white p-4 rounded-top-4">
                        <h4 className="mb-0 fw-bold"><FaFilePdf /> Student Resume Management</h4>
                        <p className="mb-0 small text-white-50">Upload your latest PDF resume for faculty evaluation during mock interviews.</p>
                    </div>

                    <div className="card-body p-4">

                        {msg.text && (
                            <div className={`alert alert-${msg.type} py-2 px-3 mb-4 small fw-semibold`} role="alert">
                                {msg.type === "success" ? <FaCheckCircle /> : <FaExclamationTriangle />} {msg.text}
                            </div>
                        )}

                        <div className="row g-4">
                            {/* Upload Area */}
                            <div className="col-md-7">
                                <div className="p-4 border-2 border-dashed rounded-4 text-center bg-light">
                                    <FaCloudUploadAlt className="display-3 text-primary mb-3" />
                                    <h5 className="fw-bold">Upload Your Resume (PDF)</h5>
                                    <p className="text-muted small">Only <strong>PDF format</strong> up to <strong>5 MB</strong> is allowed.</p>

                                    <form onSubmit={handleUpload}>
                                        <input
                                            type="file"
                                            accept="application/pdf"
                                            className="form-control mb-3"
                                            onChange={handleFileChange}
                                        />

                                        {selectedFile && (
                                            <div className="alert alert-info py-2 small mb-3">
                                                Selected File: <strong>{selectedFile.name}</strong> ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
                                            </div>
                                        )}

                                        <button
                                            type="submit"
                                            className="btn btn-primary px-4 py-2 fw-bold rounded-3 w-100"
                                            disabled={uploading || !selectedFile}
                                        >
                                            {uploading ? "Uploading PDF..." : "Upload Resume"}
                                        </button>
                                    </form>
                                </div>
                            </div>

                            {/* Current Resume Status */}
                            <div className="col-md-5">
                                <div className="card border shadow-sm rounded-4 p-4 h-100 bg-white">
                                    <h5 className="fw-bold mb-3">Current Resume Status</h5>

                                    {currentResume ? (
                                        <div className="text-center my-auto">
                                            <FaFilePdf className="display-4 text-danger mb-2" />
                                            <h6 className="fw-bold text-success">Resume Uploaded ✅</h6>
                                            <p className="text-muted small">Your resume is active and visible to interview faculty members.</p>

                                            <a
                                                href={currentResume.startsWith("http") ? currentResume : `http://127.0.0.1:8000${currentResume}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="btn btn-outline-primary fw-bold w-100 py-2 rounded-3"
                                            >
                                                📄 View Uploaded Resume
                                            </a>
                                        </div>
                                    ) : (
                                        <div className="text-center my-auto">
                                            <FaExclamationTriangle className="display-4 text-warning mb-2" />
                                            <h6 className="fw-bold text-danger">No Resume Uploaded ❌</h6>
                                            <p className="text-muted small">You cannot book mock interviews until a valid PDF resume is uploaded.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </>
    );
}

export default Resume;