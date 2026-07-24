import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import { getAvailableSlots, bookInterview, getStudentProfile, getStudentBookings } from "../../services/studentService";
import { FaCalendarAlt, FaSearch, FaUserTie, FaClock, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";

function Slots() {
    const navigate = useNavigate();
    const [slots, setSlots] = useState([]);
    const [userBookings, setUserBookings] = useState([]);
    const [search, setSearch] = useState("");
    const [dateFilter, setDateFilter] = useState("");
    const [loading, setLoading] = useState(true);
    const [bookingId, setBookingId] = useState(null);
    const [profile, setProfile] = useState(null);
    const [msg, setMsg] = useState({ type: "", text: "" });

    useEffect(() => {
        loadData();
    }, [search, dateFilter]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [slotsRes, profileRes, bookingsRes] = await Promise.all([
                getAvailableSlots(search, dateFilter),
                getStudentProfile(),
                getStudentBookings()
            ]);
            setSlots(slotsRes.data);
            setProfile(profileRes.data);
            setUserBookings(bookingsRes.data || []);
        } catch (error) {
            console.error("Error loading slots", error);
        } finally {
            setLoading(false);
        }
    };

    const isProfileComplete = Boolean(
        profile?.full_name &&
        profile?.branch &&
        profile?.phone &&
        profile?.roll_number &&
        !profile?.roll_number.startsWith("TEMP_") &&
        profile?.resume
    );

    const handleBook = async (slotId) => {
        setMsg({ type: "", text: "" });
        setBookingId(slotId);

        if (!isProfileComplete) {
            setMsg({ type: "danger", text: "Please complete your student profile details (Full Name, Roll Number, Branch, Phone) and upload your resume before applying for interview slots." });
            setBookingId(null);
            return;
        }

        try {
            await bookInterview(slotId);
            setMsg({ type: "success", text: "Interview slot request submitted successfully!" });
            loadData();
        } catch (error) {
            console.error(error);
            const errorText = error.response?.data?.detail || error.response?.data?.message || "Failed to book interview slot.";
            setMsg({ type: "danger", text: errorText });
        } finally {
            setBookingId(null);
        }
    };

    return (
        <>
            <Sidebar activeRole="student" />
            <Navbar title="Available Interview Slots" userRole="student" />

            <div className="container-fluid" style={{ marginLeft: "260px", paddingTop: "90px", paddingRight: "30px", maxWidth: "calc(100% - 260px)" }}>
                
                {!loading && !isProfileComplete && (
                    <div className="alert alert-warning shadow-sm border-0 d-flex justify-content-between align-items-center mb-4 rounded-3">
                        <div>
                            <h6 className="alert-heading mb-1 fw-bold">⚠️ Profile Setup Required Before Applying</h6>
                            <p className="mb-0 small">You must complete your student profile details (Full Name, Roll Number, Branch, Phone) and upload your PDF resume before applying for interview slots.</p>
                        </div>
                        <button className="btn btn-warning btn-sm fw-bold px-3 ms-3 text-nowrap" onClick={() => navigate("/student/profile")}>
                            Complete Profile Now
                        </button>
                    </div>
                )}

                {/* Search & Filter Bar */}
                <div className="card shadow-sm border-0 rounded-4 p-4 mb-4 bg-white">
                    <div className="row g-3 align-items-center">
                        <div className="col-md-6">
                            <div className="input-group">
                                <span className="input-group-text bg-light border-end-0">
                                    <FaSearch className="text-secondary" />
                                </span>
                                <input
                                    type="text"
                                    className="form-control bg-light border-start-0"
                                    placeholder="Search by faculty name or interview topic..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="col-md-4">
                            <input
                                type="date"
                                className="form-control bg-light"
                                value={dateFilter}
                                onChange={(e) => setDateFilter(e.target.value)}
                            />
                        </div>

                        <div className="col-md-2">
                            <button
                                className="btn btn-outline-secondary w-100 fw-bold"
                                onClick={() => { setSearch(""); setDateFilter(""); }}
                            >
                                Clear Filters
                            </button>
                        </div>
                    </div>
                </div>

                {msg.text && (
                    <div className={`alert alert-${msg.type} py-2 px-3 mb-4 small fw-semibold rounded-3`} role="alert">
                        {msg.type === "success" ? <FaCheckCircle /> : <FaExclamationTriangle />} {msg.text}
                    </div>
                )}

                {/* Slots List Table */}
                <div className="card shadow-lg border-0 rounded-4 bg-white p-4">
                    <h5 className="fw-bold mb-3 text-dark">📅 Available Slots ({slots.length})</h5>

                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading slots...</span>
                            </div>
                        </div>
                    ) : slots.length === 0 ? (
                        <div className="text-center py-5 text-muted">
                            <FaCalendarAlt className="display-4 text-secondary mb-2" />
                            <h6>No available interview slots matching your criteria.</h6>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover align-middle">
                                <thead className="table-light">
                                    <tr>
                                        <th>Title & Topic</th>
                                        <th>Faculty Panel</th>
                                        <th>Date & Time</th>
                                        <th>Mode & Location</th>
                                        <th>Remaining Seats</th>
                                        <th className="text-end">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {slots.map(s => {
                                        const existingBooking = userBookings.find(
                                            (b) => (b.interview_slot === s.id || b.interview_slot_details?.id === s.id) &&
                                                   ['Pending', 'Booked'].includes(b.status)
                                        );

                                        return (
                                            <tr key={s.id}>
                                                <td className="fw-bold text-primary">{s.title}</td>
                                                <td>
                                                    <div className="d-flex align-items-center gap-2">
                                                        <FaUserTie className="text-secondary" />
                                                        <span>{s.faculty_name}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="small">
                                                        <div className="fw-bold">{s.interview_date}</div>
                                                        <div className="text-muted"><FaClock /> {s.interview_time} ({s.duration_minutes} mins)</div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className={`badge ${s.mode === 'Online' ? 'bg-info' : 'bg-secondary'} me-2`}>
                                                        {s.mode}
                                                    </span>
                                                    <span className="small text-muted">{s.venue_or_link}</span>
                                                </td>
                                                <td>
                                                    <span className={`badge rounded-pill ${s.remaining_seats > 0 ? 'bg-success' : 'bg-danger'}`}>
                                                        {s.remaining_seats} / {s.max_students} Seats Left
                                                    </span>
                                                </td>
                                                <td className="text-end">
                                                    {existingBooking ? (
                                                        <button
                                                            className="btn btn-success btn-sm fw-bold px-3 rounded-pill"
                                                            disabled
                                                        >
                                                            {existingBooking.status === 'Booked' ? "Booked" : "Booked (Pending)"}
                                                        </button>
                                                    ) : (
                                                        <button
                                                            className="btn btn-primary btn-sm fw-bold px-3 rounded-pill"
                                                            disabled={bookingId === s.id || s.remaining_seats <= 0 || !isProfileComplete}
                                                            title={!isProfileComplete ? "Complete your profile setup to apply for interview slots" : ""}
                                                            onClick={() => handleBook(s.id)}
                                                        >
                                                            {bookingId === s.id ? "Booking..." : "Book Slot"}
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

export default Slots;