import React from "react";
import { Link } from "react-router-dom";
import "./Home.css";

function Home() {
    return (
        <div className="home">

            {/* Navbar */}
            <nav className="navbar">
                <div className="logo">
                    AI Mock Interview
                </div>

                <ul>
                    <li><a href="#about">About</a></li>
                    <li><a href="#features">Features</a></li>
                    <li><a href="#contact">Contact</a></li>
                </ul>
            </nav>

            {/* Hero Section */}
            <section className="hero">

                <h1>AI Mock Interview Scheduling System</h1>

                <p>
                    Prepare smarter. Schedule interviews with faculty members
                    and senior interviewers. Improve your technical,
                    communication and aptitude skills with AI-powered mock
                    interviews.
                </p>

                <div className="buttons">

                    <Link
                        to="/login"
                        state={{ role: "student" }}
                        className="btn student"
                    >
                        🎓 Student Login
                    </Link>

                    <Link
                        to="/login"
                        state={{ role: "faculty" }}
                        className="btn faculty"
                    >
                        👨‍🏫 Faculty Login
                    </Link>

                    <Link
                        to="/login"
                        state={{ role: "admin" }}
                        className="btn admin"
                    >
                        🛡️ Admin Login
                    </Link>

                </div>

            </section>

            {/* About */}

            <section className="features" id="about">

                <div className="card">
                    <h3>📅 Interview Scheduling</h3>
                    <p>
                        Students can schedule interviews with available faculty
                        and senior interviewers.
                    </p>
                </div>

                <div className="card">
                    <h3>📄 Resume Upload</h3>
                    <p>
                        Upload resumes and manage documents before attending
                        interviews.
                    </p>
                </div>

                <div className="card">
                    <h3>🤖 AI Feedback</h3>
                    <p>
                        Receive intelligent feedback and suggestions to improve
                        interview performance.
                    </p>
                </div>

                <div className="card">
                    <h3>📊 Performance Dashboard</h3>
                    <p>
                        Track interview history, scores and placement
                        preparation progress.
                    </p>
                </div>

            </section>

            {/* Footer */}

            <footer className="footer">
                © 2026 AI Mock Interview Scheduling System
            </footer>

        </div>
    );
}

export default Home;