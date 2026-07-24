import { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import { getStudentBookings } from "../../services/studentService";
import { FaCalendarCheck, FaUserTie, FaClock, FaVideo, FaMapMarkerAlt, FaCheckCircle, FaStar } from "react-icons/fa";

function UpcomingInterviews() {
    const [upcoming, setUpcoming] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const isUpcomingSlot = (slot) => {
        if (!slot || !slot.interview_date) return false;
        try {
            const todayStr = new Date().toISOString().split('T')[0];
            if (slot.interview_date > todayStr) return true;
            if (slot.interview_date < todayStr) return false;

            if (slot.interview_time) {
                const now = new Date();
                const [hours, minutes] = slot.interview_time.split(':').map(Number);
                const slotStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes || 0);
                return slotStart > now;
            }
            return true;
        } catch (e) {
            return true;
        }
    };

    const loadData = async () => {
        try {
            setLoading(true);
            const res = await getStudentBookings();
            // Filter strictly accepted/approved bookings (status === 'Booked') AND whose start time is in the future
            const approvedAndUpcoming = res.data.filter(b => 
                b.status === 'Booked' && isUpcomingSlot(b.interview_slot_details)
            );
            setUpcoming(approvedAndUpcoming);
        } catch (error) {
            console.error("Failed to load upcoming interviews", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Sidebar activeRole="student" />
            <Navbar title="Upcoming Accepted Interviews" userRole="student" />

            <div className="container-fluid" style={{ marginLeft: "260px", paddingTop: "90px", paddingRight: "30px", maxWidth: "calc(100% - 260px)" }}>
                <div className="card shadow-lg border-0 rounded-4 bg-white p-4">
                    
                    <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 pb-3 border-bottom">
                        <div>
                            <h4 className="fw-bold m-0 text-dark">
                                <FaCalendarCheck className="text-success me-2" /> My Upcoming Accepted Interviews
                            </h4>
                            <p className="text-muted small m-0">View all mock interview requests accepted by faculty members that you are scheduled to attend.</p>
                        </div>
                        <span className="badge bg-success-subtle text-success border border-success-subtle px-3 py-2 rounded-pill fw-bold">
                            {upcoming.length} Confirmed {upcoming.length === 1 ? 'Interview' : 'Interviews'}
                        </span>
                    </div>

                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-success" role="status">
                                <span className="visually-hidden">Loading upcoming interviews...</span>
                            </div>
                        </div>
                    ) : upcoming.length === 0 ? (
                        <div className="text-center py-5">
                            <FaCalendarCheck className="display-4 text-muted mb-3" />
                            <h6 className="fw-bold text-secondary">No upcoming accepted interviews found.</h6>
                            <p className="text-muted small">Once a faculty member accepts your interview booking request, it will appear here.</p>
                        </div>
                    ) : (
                        <div className="row g-4">
                            {upcoming.map(b => {
                                const slot = b.interview_slot_details || {};
                                return (
                                    <div key={b.id} className="col-md-6">
                                        <div className="card shadow-sm border border-success-subtle rounded-4 h-100 p-4 bg-white position-relative">
                                            
                                            <div className="d-flex justify-content-between align-items-start mb-3">
                                                <div>
                                                    <h5 className="fw-bold text-success mb-1">{slot.title || "Mock Interview"}</h5>
                                                    <div className="small text-muted d-flex align-items-center gap-1">
                                                        <FaUserTie className="text-secondary" />
                                                        <span className="fw-semibold text-dark">{slot.faculty_name || "Faculty Panelist"}</span>
                                                        ({slot.faculty_email})
                                                    </div>
                                                </div>
                                                <span className="badge bg-success rounded-pill px-3 py-2 fw-semibold">
                                                    Approved ✅
                                                </span>
                                            </div>

                                            <div className="bg-light p-3 rounded-3 mb-3">
                                                <div className="row g-2 small">
                                                    <div className="col-6">
                                                        <div className="text-muted">Interview Date</div>
                                                        <div className="fw-bold text-dark">{slot.interview_date}</div>
                                                    </div>
                                                    <div className="col-6">
                                                        <div className="text-muted">Start Time</div>
                                                        <div className="fw-bold text-dark"><FaClock className="me-1 text-primary" />{slot.interview_time}</div>
                                                    </div>
                                                    <div className="col-6 mt-2">
                                                        <div className="text-muted">Mode</div>
                                                        <span className={`badge ${slot.mode === 'Online' ? 'bg-info' : 'bg-secondary'}`}>
                                                            {slot.mode}
                                                        </span>
                                                    </div>
                                                    <div className="col-6 mt-2">
                                                        <div className="text-muted">Venue / Google Meet Link</div>
                                                        <div className="fw-bold text-truncate" title={slot.venue_or_link}>
                                                            {slot.mode === 'Online' ? <FaVideo className="me-1 text-info" /> : <FaMapMarkerAlt className="me-1 text-danger" />}
                                                            {slot.venue_or_link || "N/A"}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {slot.mode === 'Online' && slot.venue_or_link?.startsWith('http') && (
                                                <a
                                                    href={slot.venue_or_link}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="btn btn-success fw-bold rounded-pill w-100 py-2"
                                                >
                                                    🎥 Join Online Interview Session
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                </div>
            </div>
        </>
    );
}

export default UpcomingInterviews;
