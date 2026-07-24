import { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import { getFacultySlots, createInterviewSlot, deleteInterviewSlot } from "../../services/facultyService";
import { FaCalendarAlt, FaClock, FaPlus, FaTrash, FaCheckCircle, FaExclamationCircle } from "react-icons/fa";

function ManageSlots() {
    const [slots, setSlots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [msg, setMsg] = useState({ type: "", text: "" });

    const [form, setForm] = useState({
        title: "",
        interview_date: "",
        interview_time: "",
        end_time: "",
        duration_minutes: 30,
        mode: "Online",
        venue_or_link: "",
        max_students: 1,
    });

    useEffect(() => {
        loadSlots();
    }, []);

    const loadSlots = async () => {
        try {
            setLoading(true);
            const res = await getFacultySlots();
            setSlots(res.data);
        } catch (error) {
            console.error("Failed to load slots", error);
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
        setMsg({ type: "", text: "" });

        if (new Date(form.interview_date) < new Date().setHours(0,0,0,0)) {
            setMsg({ type: "danger", text: "Interview date cannot be in the past!" });
            return;
        }

        try {
            setCreating(true);
            const payload = {
                ...form,
                end_time: form.end_time ? form.end_time : null
            };
            await createInterviewSlot(payload);
            setMsg({ type: "success", text: "Interview slot created successfully!" });
            setForm({
                title: "",
                interview_date: "",
                interview_time: "",
                end_time: "",
                duration_minutes: 30,
                mode: "Online",
                venue_or_link: "",
                max_students: 1,
            });
            loadSlots();
        } catch (error) {
            console.error(error);
            setMsg({ type: "danger", text: "Failed to create interview slot. Check form inputs." });
        } finally {
            setCreating(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this interview slot?")) return;
        try {
            await deleteInterviewSlot(id);
            setMsg({ type: "success", text: "Interview slot deleted successfully." });
            loadSlots();
        } catch (error) {
            console.error(error);
            const errDetail = error.response?.data?.detail || "Failed to delete slot.";
            setMsg({ type: "danger", text: errDetail });
        }
    };

    return (
        <>
            <Sidebar activeRole="faculty" />
            <Navbar title="Manage Interview Slots" userRole="faculty" />

            <div className="container-fluid animate-fade-in" style={{ marginLeft: "260px", paddingTop: "90px", paddingRight: "30px", maxWidth: "calc(100% - 260px)" }}>
                
                {msg.text && (
                    <div className={`alert alert-${msg.type} py-2 px-3 mb-4 small fw-semibold rounded-3`} role="alert">
                        {msg.type === "success" ? <FaCheckCircle /> : <FaExclamationCircle />} {msg.text}
                    </div>
                )}

                <div className="row g-4">
                    {/* Create Slot Form */}
                    <div className="col-md-5">
                        <div className="card shadow-lg border-0 rounded-4 bg-white p-4">
                            <h5 className="fw-bold mb-3 text-success"><FaPlus /> Create New Interview Slot</h5>

                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label className="form-label fw-semibold small">Topic / Title</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="title"
                                        placeholder="e.g. Technical System Design Mock"
                                        value={form.title}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="row g-2 mb-3">
                                    <div className="col-md-6">
                                        <label className="form-label fw-semibold small">Date</label>
                                        <input
                                            type="date"
                                            className="form-control"
                                            name="interview_date"
                                            value={form.interview_date}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label fw-semibold small">Start Time</label>
                                        <input
                                            type="time"
                                            className="form-control"
                                            name="interview_time"
                                            value={form.interview_time}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="row g-2 mb-3">
                                    <div className="col-md-6">
                                        <label className="form-label fw-semibold small">Mode</label>
                                        <select
                                            className="form-select"
                                            name="mode"
                                            value={form.mode}
                                            onChange={handleChange}
                                        >
                                            <option value="Online">Online (Google Meet/Zoom)</option>
                                            <option value="Offline">Offline (On-Campus Venue)</option>
                                        </select>
                                    </div>

                                    <div className="col-md-6">
                                        <label className="form-label fw-semibold small">Capacity (Students)</label>
                                        <input
                                            type="number"
                                            min="1"
                                            className="form-control"
                                            name="max_students"
                                            value={form.max_students}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <label className="form-label fw-semibold small">Meeting Link or Location</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="venue_or_link"
                                        placeholder="e.g. https://meet.google.com/xyz or Room 402"
                                        value={form.venue_or_link}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <button type="submit" className="btn btn-success w-100 py-2 fw-bold" disabled={creating}>
                                    {creating ? "Publishing Slot..." : "Publish Interview Slot"}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Slots List */}
                    <div className="col-md-7">
                        <div className="card shadow-lg border-0 rounded-4 bg-white p-4">
                            <h5 className="fw-bold mb-3 text-dark">📋 Published Slots ({slots.length})</h5>

                            {loading ? (
                                <div className="text-center py-5">
                                    <div className="spinner-border text-success" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                </div>
                            ) : slots.length === 0 ? (
                                <p className="text-muted small py-4 text-center">No interview slots published yet.</p>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table table-hover align-middle">
                                        <thead className="table-light">
                                            <tr>
                                                <th>Title</th>
                                                <th>Date & Time</th>
                                                <th>Mode</th>
                                                <th>Capacity</th>
                                                <th className="text-end">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {slots.map(s => (
                                                <tr key={s.id}>
                                                    <td className="fw-bold text-dark">{s.title}</td>
                                                    <td className="small">
                                                        <div>{s.interview_date}</div>
                                                        <div className="text-muted">{s.interview_time}</div>
                                                    </td>
                                                    <td>
                                                        <span className="badge bg-secondary">{s.mode}</span>
                                                    </td>
                                                    <td>
                                                        <span className="badge bg-success">{s.remaining_seats} / {s.max_students} Left</span>
                                                    </td>
                                                    <td className="text-end">
                                                        <button className="btn btn-outline-danger btn-sm" onClick={() => handleDelete(s.id)}>
                                                            <FaTrash />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </>
    );
}

export default ManageSlots;
