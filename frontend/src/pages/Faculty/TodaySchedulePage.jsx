import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import { getTodayInterviews } from "../../services/facultyService";
import { FaTasks, FaCalendarPlus, FaUserGraduate } from "react-icons/fa";

function TodaySchedulePage() {
    const navigate = useNavigate();
    const [todaySchedule, setTodaySchedule] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const res = await getTodayInterviews();
            setTodaySchedule(res.data);
        } catch (error) {
            console.error("Failed to load today's schedule", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Sidebar activeRole="faculty" />
            <Navbar title="Today's Interview Schedule" userRole="faculty" />

            <div className="container-fluid" style={{ marginLeft: "260px", paddingTop: "90px", paddingRight: "30px", maxWidth: "calc(100% - 260px)" }}>
                <div className="card shadow-lg border-0 rounded-4 bg-white p-4">
                    
                    <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 pb-3 border-bottom">
                        <div>
                            <h4 className="fw-bold m-0 text-dark">
                                <FaTasks className="text-success me-2" /> Today's Scheduled Mock Interviews
                            </h4>
                            <p className="text-muted small m-0">View all interview sessions scheduled for today with student booking status.</p>
                        </div>
                        <button className="btn btn-success fw-bold rounded-pill px-3 mt-2 mt-md-0" onClick={() => navigate("/faculty/slots")}>
                            <FaCalendarPlus className="me-1" /> + Create New Slot
                        </button>
                    </div>

                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-success" role="status">
                                <span className="visually-hidden">Loading schedule...</span>
                            </div>
                        </div>
                    ) : todaySchedule.length === 0 ? (
                        <div className="text-center py-5">
                            <FaTasks className="display-4 text-muted mb-3" />
                            <h6 className="fw-bold text-secondary">No mock interviews scheduled for today.</h6>
                            <p className="text-muted small">Slots allocated for today's date will automatically appear here.</p>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover align-middle">
                                <thead className="table-light">
                                    <tr>
                                        <th>Student / Status</th>
                                        <th>Topic</th>
                                        <th>Time</th>
                                        <th>Mode</th>
                                        <th>Venue / Link</th>
                                        <th className="text-end">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {todaySchedule.map(b => (
                                        <tr key={b.id}>
                                            <td>
                                                <span className={`fw-bold ${b.is_booked ? 'text-dark' : 'text-muted fst-italic'}`}>
                                                    <FaUserGraduate className="me-1 text-secondary" />
                                                    {b.student_name}
                                                </span>
                                            </td>
                                            <td className="fw-bold text-success">{b.interview_slot_details?.title}</td>
                                            <td className="fw-bold">{b.interview_slot_details?.interview_time}</td>
                                            <td>
                                                <span className="badge bg-secondary">
                                                    {b.interview_slot_details?.mode}
                                                </span>
                                            </td>
                                            <td className="small text-muted">{b.interview_slot_details?.venue_or_link || "N/A"}</td>
                                            <td className="text-end">
                                                {b.is_booked ? (
                                                    b.has_feedback || b.status === 'Completed' ? (
                                                        <span className="badge bg-success border border-success px-3 py-2 rounded-pill fw-bold">
                                                            Evaluated ✅
                                                        </span>
                                                    ) : (
                                                        <button className="btn btn-success btn-sm fw-bold rounded-pill px-3" onClick={() => navigate("/faculty/students")}>
                                                            Evaluate Student
                                                        </button>
                                                    )
                                                ) : (
                                                    <span className="badge bg-success-subtle text-success border border-success-subtle px-3 py-2 rounded-pill">
                                                        Available Slot
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                </div>
            </div>
        </>
    );
}

export default TodaySchedulePage;
