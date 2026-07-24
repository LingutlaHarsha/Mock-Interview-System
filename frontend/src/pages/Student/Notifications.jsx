import { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import { getNotifications, markNotificationRead, markAllNotificationsRead } from "../../services/studentService";
import { FaBell, FaCheckDouble, FaRegEnvelopeOpen, FaCheckCircle, FaTimesCircle, FaStar, FaSortAmountDown, FaSortAmountUp, FaFilter } from "react-icons/fa";

function Notifications() {
    const [notifications, setNotifications] = useState([]);
    const [filter, setFilter] = useState("all");
    const [sortBy, setSortBy] = useState("newest");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const res = await getNotifications();
            setNotifications(res.data);
        } catch (error) {
            console.error("Failed to load notifications", error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkRead = async (id) => {
        try {
            await markNotificationRead(id);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
        } catch (error) {
            console.error(error);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await markAllNotificationsRead();
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        } catch (error) {
            console.error(error);
        }
    };

    const getCategory = (n) => {
        const text = (n.title + " " + n.message).toLowerCase();
        if (text.includes("approved") || text.includes("accept")) return "accepted";
        if (text.includes("declined") || text.includes("cancel") || text.includes("reject")) return "declined";
        if (text.includes("feedback") || text.includes("evaluat") || text.includes("score")) return "feedback";
        return "general";
    };

    // Filter & Sort notifications
    let filteredList = [...notifications];

    if (filter === "unread") {
        filteredList = filteredList.filter(n => !n.is_read);
    } else if (filter === "read") {
        filteredList = filteredList.filter(n => n.is_read);
    } else if (filter === "accepted") {
        filteredList = filteredList.filter(n => getCategory(n) === "accepted");
    } else if (filter === "declined") {
        filteredList = filteredList.filter(n => getCategory(n) === "declined");
    } else if (filter === "feedback") {
        filteredList = filteredList.filter(n => getCategory(n) === "feedback");
    }

    filteredList.sort((a, b) => {
        const dateA = new Date(a.created_at);
        const dateB = new Date(b.created_at);
        return sortBy === "oldest" ? dateA - dateB : dateB - dateA;
    });

    const unreadCount = notifications.filter(n => !n.is_read).length;
    const acceptedCount = notifications.filter(n => getCategory(n) === "accepted").length;
    const declinedCount = notifications.filter(n => getCategory(n) === "declined").length;
    const feedbackCount = notifications.filter(n => getCategory(n) === "feedback").length;

    const userRole = localStorage.getItem("role") || "student";

    return (
        <>
            <Sidebar activeRole={userRole} />
            <Navbar title="Notifications & Updates" userRole={userRole} />

            <div className="container-fluid" style={{ marginLeft: "260px", paddingTop: "90px", paddingRight: "30px", maxWidth: "calc(100% - 260px)" }}>
                <div className="card shadow-lg border-0 rounded-4 bg-white p-4">
                    
                    <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 pb-3 border-bottom">
                        <div>
                            <h4 className="fw-bold m-0 text-dark">
                                <FaBell className="text-warning me-2" /> System Notifications
                            </h4>
                            <p className="text-muted small mb-0">Sort and filter notifications by interview status, feedback, and date.</p>
                        </div>

                        {unreadCount > 0 && (
                            <button className="btn btn-outline-success btn-sm fw-bold rounded-pill px-3" onClick={handleMarkAllRead}>
                                <FaCheckDouble className="me-1" /> Mark All Read ({unreadCount})
                            </button>
                        )}
                    </div>

                    {/* Filter Tabs & Sort Toolbar */}
                    <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4 p-3 bg-light rounded-4">
                        <div className="d-flex flex-wrap align-items-center gap-2">
                            <span className="small fw-bold text-secondary me-2"><FaFilter /> Filter By:</span>
                            <button
                                className={`btn btn-sm rounded-pill px-3 fw-semibold ${filter === 'all' ? 'btn-primary' : 'btn-outline-secondary'}`}
                                onClick={() => setFilter('all')}
                            >
                                All ({notifications.length})
                            </button>
                            <button
                                className={`btn btn-sm rounded-pill px-3 fw-semibold ${filter === 'accepted' ? 'btn-success' : 'btn-outline-success'}`}
                                onClick={() => setFilter('accepted')}
                            >
                                <FaCheckCircle className="me-1" /> Accepted ({acceptedCount})
                            </button>
                            <button
                                className={`btn btn-sm rounded-pill px-3 fw-semibold ${filter === 'declined' ? 'btn-danger' : 'btn-outline-danger'}`}
                                onClick={() => setFilter('declined')}
                            >
                                <FaTimesCircle className="me-1" /> Declined ({declinedCount})
                            </button>
                            <button
                                className={`btn btn-sm rounded-pill px-3 fw-semibold ${filter === 'feedback' ? 'btn-info text-white' : 'btn-outline-info'}`}
                                onClick={() => setFilter('feedback')}
                            >
                                <FaStar className="me-1" /> Feedback ({feedbackCount})
                            </button>
                            <button
                                className={`btn btn-sm rounded-pill px-3 fw-semibold ${filter === 'unread' ? 'btn-warning text-dark' : 'btn-outline-warning'}`}
                                onClick={() => setFilter('unread')}
                            >
                                Unread ({unreadCount})
                            </button>
                        </div>

                        <div className="d-flex align-items-center gap-2">
                            <span className="small fw-bold text-secondary">Sort By:</span>
                            <select
                                className="form-select form-select-sm rounded-pill px-3 fw-semibold"
                                style={{ width: "auto" }}
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                            >
                                <option value="newest">🆕 Newest First</option>
                                <option value="oldest">⏳ Oldest First</option>
                            </select>
                        </div>
                    </div>

                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading notifications...</span>
                            </div>
                        </div>
                    ) : filteredList.length === 0 ? (
                        <div className="text-center py-5 text-muted">
                            <FaRegEnvelopeOpen className="display-4 text-secondary mb-2" />
                            <h6>No notifications found for the selected filter.</h6>
                        </div>
                    ) : (
                        <ul className="list-group list-group-flush">
                            {filteredList.map(n => {
                                const cat = getCategory(n);
                                return (
                                    <li key={n.id} className={`list-group-item p-3 mb-2 rounded-3 border ${n.is_read ? 'bg-white' : 'bg-light border-primary-subtle'}`}>
                                        <div className="d-flex justify-content-between align-items-start gap-3">
                                            <div className="flex-grow-1">
                                                <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
                                                    <span className={`fw-bold ${n.is_read ? 'text-dark' : 'text-primary fs-6'}`}>{n.title}</span>
                                                    
                                                    {cat === "accepted" && (
                                                        <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill px-2">Accepted ✅</span>
                                                    )}
                                                    {cat === "declined" && (
                                                        <span className="badge bg-danger-subtle text-danger border border-danger-subtle rounded-pill px-2">Declined ❌</span>
                                                    )}
                                                    {cat === "feedback" && (
                                                        <span className="badge bg-info-subtle text-info border border-info-subtle rounded-pill px-2">Feedback ⭐</span>
                                                    )}
                                                    
                                                    {!n.is_read && <span className="badge bg-warning text-dark small rounded-pill">New</span>}
                                                </div>
                                                <p className="mb-1 text-secondary small">{n.message}</p>
                                                <span className="text-muted small">{new Date(n.created_at).toLocaleString()}</span>
                                            </div>

                                            {!n.is_read && (
                                                <button className="btn btn-sm btn-outline-primary rounded-pill px-3 fw-semibold text-nowrap" onClick={() => handleMarkRead(n.id)}>
                                                    Mark Read
                                                </button>
                                            )}
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    )}

                </div>
            </div>
        </>
    );
}

export default Notifications;