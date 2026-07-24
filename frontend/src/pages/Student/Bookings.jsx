import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import { getStudentBookings, cancelBooking } from "../../services/studentService";
import { FaBookmark, FaCalendarAlt, FaUserTie, FaClock, FaCheckCircle, FaTimesCircle, FaStar } from "react-icons/fa";

function Bookings() {
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cancellingId, setCancellingId] = useState(null);
    const [msg, setMsg] = useState({ type: "", text: "" });

    useEffect(() => {
        loadBookings();
    }, []);

    const loadBookings = async () => {
        try {
            setLoading(true);
            const res = await getStudentBookings();
            setBookings(res.data);
        } catch (error) {
            console.error("Failed to load bookings", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (id) => {
        if (!window.confirm("Are you sure you want to cancel this interview booking?")) return;

        try {
            setCancellingId(id);
            setMsg({ type: "", text: "" });
            await cancelBooking(id);
            setMsg({ type: "success", text: "Booking cancelled successfully. Available seat released." });
            loadBookings();
        } catch (error) {
            console.error(error);
            const errorText = error.response?.data?.detail || "Failed to cancel booking.";
            setMsg({ type: "danger", text: errorText });
        } finally {
            setCancellingId(null);
        }
    };

    return (
        <>
            <Sidebar activeRole="student" />
            <Navbar title="My Interview Bookings" userRole="student" />

            <div className="container-fluid" style={{ marginLeft: "260px", paddingTop: "90px", paddingRight: "30px", maxWidth: "calc(100% - 260px)" }}>
                
                {msg.text && (
                    <div className={`alert alert-${msg.type} py-2 px-3 mb-4 small fw-semibold rounded-3`} role="alert">
                        {msg.type === "success" ? <FaCheckCircle /> : <FaTimesCircle />} {msg.text}
                    </div>
                )}

                <div className="card shadow-lg border-0 rounded-4 bg-white p-4">
                    <h5 className="fw-bold mb-3 text-dark"><FaBookmark className="text-primary me-2" /> Booked Interviews Roster ({bookings.length})</h5>

                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading bookings...</span>
                            </div>
                        </div>
                    ) : bookings.length === 0 ? (
                        <div className="text-center py-5 text-muted">
                            <FaCalendarAlt className="display-4 text-secondary mb-2" />
                            <h6>You have no mock interview bookings yet.</h6>
                            <button className="btn btn-primary btn-sm fw-bold mt-2 rounded-3" onClick={() => navigate("/student/slots")}>
                                Browse Available Slots
                            </button>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover align-middle">
                                <thead className="table-light">
                                    <tr>
                                        <th>Interview Title</th>
                                        <th>Faculty Panelist</th>
                                        <th>Date & Time</th>
                                        <th>Mode & Venue</th>
                                        <th>Status</th>
                                        <th className="text-end">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bookings.map(b => {
                                        const slot = b.interview_slot_details || {};
                                        return (
                                            <tr key={b.id}>
                                                <td className="fw-bold text-dark">{slot.title || "Mock Interview"}</td>
                                                <td>
                                                    <div className="d-flex align-items-center gap-2">
                                                        <FaUserTie className="text-secondary" />
                                                        <span>{slot.faculty_name || "Faculty Member"}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="small">
                                                        <div className="fw-bold">{slot.interview_date}</div>
                                                        <div className="text-muted"><FaClock /> {slot.interview_time}</div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className={`badge ${slot.mode === 'Online' ? 'bg-info' : 'bg-secondary'} me-2`}>
                                                        {slot.mode}
                                                    </span>
                                                    <span className="small text-muted">{slot.venue_or_link}</span>
                                                </td>
                                                <td>
                                                    <span className={`badge rounded-pill ${
                                                        b.status === 'Pending' ? 'bg-warning text-dark' :
                                                        b.status === 'Booked' ? 'bg-success' :
                                                        b.status === 'Completed' ? 'bg-info' : 'bg-danger'
                                                    }`}>
                                                        {b.status === 'Pending' ? 'Awaiting Faculty Approval ⏳' : b.status === 'Booked' ? 'Approved & Confirmed ✅' : b.status === 'Rejected' ? 'Declined by Faculty ❌' : b.status}
                                                    </span>
                                                </td>
                                                <td className="text-end">
                                                    {(b.status === 'Booked' || b.status === 'Pending') && (
                                                        <button
                                                            className="btn btn-outline-danger btn-sm fw-bold rounded-pill px-3"
                                                            disabled={cancellingId === b.id}
                                                            onClick={() => handleCancel(b.id)}
                                                        >
                                                            {cancellingId === b.id ? "Cancelling..." : "Cancel Request"}
                                                        </button>
                                                    )}

                                                    {b.has_feedback && (
                                                        <button
                                                            className="btn btn-success btn-sm fw-bold rounded-pill px-3 ms-2"
                                                            onClick={() => navigate("/student/feedback")}
                                                        >
                                                            <FaStar /> View Feedback
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

            </div>
        </>
    );
}

export default Bookings;