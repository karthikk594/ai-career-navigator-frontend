import { Link, useNavigate } from "react-router-dom";
import "./Dashboard.css";
import { useEffect, useState } from "react";
import API from "../services/api";

function UserDashboard() {

    const navigate = useNavigate();

    const [user, setUser] = useState(() => {

        try {

            const savedUser = localStorage.getItem("user");

            return savedUser
                ? JSON.parse(savedUser)
                : null;

        }
        catch (error) {

            console.log("SAVED USER ERROR:", error);

            localStorage.removeItem("user");

            return null;

        }

    });
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [resumeAnalysis, setResumeAnalysis] = useState(null);
    const [resumeLoading, setResumeLoading] = useState(true);

    const userId = localStorage.getItem("userId");

    // =========================
    // GET USER DETAILS
    // =========================

    useEffect(() => {

        if (!userId) {
            console.log("USER ID NOT FOUND");
            navigate("/login");
            return;
        }

        API.get(`/auth/hi/${userId}`)
            .then((response) => {

                console.log("USER FROM BACKEND:", response.data);

                const loggedInUser = response.data;

                if (!loggedInUser?.id) {

                    return;

                }


                setUser(loggedInUser);

                localStorage.setItem(
                    "user",
                    JSON.stringify(loggedInUser)
                );

            })
            .catch((error) => {

                console.log("USER ERROR:", error);

            });

    }, [userId, navigate]);


    // =========================
    // GET PROFILE
    // =========================

    useEffect(() => {

        if (!userId) {
            return;
        }

        API.get(`/profile/${userId}`)
            .then((response) => {

                console.log("PROFILE DATA:", response.data);

                setProfile(response.data);

            })
            .catch((error) => {

                console.log("PROFILE ERROR:", error);

                setProfile(null);

            })
            .finally(() => {

                setLoading(false);

            });

    }, [userId]);


    // =========================
    // GET RESUME ANALYSIS
    // =========================

    useEffect(() => {

        let cancelled = false;

        const fetchResumeAnalysis = async () => {

            if (!userId) {
                setResumeAnalysis(null);
                setResumeLoading(false);
                return;
            }

            try {
                setResumeLoading(true);

                // First check whether the user has a saved resume.
                const resumeResponse = await API.get(`/resume/${userId}`);

                if (cancelled) return;

                if (!resumeResponse.data?.id) {
                    setResumeAnalysis(null);
                    return;
                }

                // Analyze the saved resume for the selected default role.
                const analysisResponse = await API.post(
                    `/resume/analyze/${userId}`,
                    null,
                    {
                        params: {
                            targetRole: roadmapTargetRole
                        }
                    }
                );

                if (!cancelled) {
                    setResumeAnalysis(analysisResponse.data);
                }

            } catch (error) {
                console.error("DASHBOARD RESUME ANALYSIS ERROR:", error);

                if (!cancelled) {
                    setResumeAnalysis(null);
                }

            } finally {
                if (!cancelled) {
                    setResumeLoading(false);
                }
            }
        };

        fetchResumeAnalysis();

        return () => {
            cancelled = true;
        };

    }, [userId, profile?.careerGoal]);


    // =========================
    // COUNT SKILLS
    // =========================

    const profileSkills = (profile?.skills || "")
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean);

    const skillCount = profileSkills.length;

    // Use the user's career goal when it matches one of the backend's supported roles.
    const requestedCareerGoal = (profile?.careerGoal || "AI Engineer").toLowerCase();
    const supportedRoles = [
        "AI Engineer",
        "ML Engineer",
        "Data Scientist",
        "Java Developer",
        "Web Developer",
    ];
    const roadmapTargetRole = supportedRoles.find(
        (role) => requestedCareerGoal.includes(role.toLowerCase()) ||
            (role === "ML Engineer" && requestedCareerGoal.includes("machine learning engineer"))
    ) || "AI Engineer";

    const resumeMatchedSkills = resumeAnalysis?.matchedSkills || [];
    const resumeMissingSkills = resumeAnalysis?.missingSkills || [];
    const currentSkills = [...new Set([...profileSkills, ...resumeMatchedSkills])];

    const roadmapSteps = [
        {
            title: "Review your career profile",
            detail: profile?.careerGoal
                ? `Target: ${profile.careerGoal}`
                : "Add your target role and current skills to your profile.",
            status: profile?.careerGoal && profileSkills.length > 0 ? "completed" : "current",
            statusLabel: profile?.careerGoal && profileSkills.length > 0 ? "Profile ready" : "Complete your profile",
        },
        {
            title: resumeAnalysis ? "Close your skill gaps" : "Upload and analyze your resume",
            detail: resumeAnalysis
                ? (resumeMissingSkills.length
                    ? `Focus next on: ${resumeMissingSkills.slice(0, 3).join(", ")}${resumeMissingSkills.length > 3 ? "…" : ""}`
                    : "No missing skills were detected by the current keyword check.")
                : "Upload a PDF resume to identify skills to improve for your target role.",
            status: resumeAnalysis && resumeMissingSkills.length === 0 ? "completed" : "current",
            statusLabel: resumeAnalysis && resumeMissingSkills.length === 0 ? "Skill check complete" : "Recommended next step",
        },
        {
            title: `Build a ${roadmapTargetRole} project`,
            detail: currentSkills.length
                ? `Apply skills such as ${currentSkills.slice(0, 3).join(", ")} in a practical project.`
                : "Choose a small project that demonstrates the core skills for your target role.",
            status: "upcoming",
            statusLabel: "Next milestone",
        },
        {
            title: "Strengthen your portfolio and resume",
            detail: "Add project links, clear responsibilities, and measurable outcomes to your resume.",
            status: "upcoming",
            statusLabel: "Upcoming",
        },
        {
            title: `Apply for ${roadmapTargetRole} opportunities`,
            detail: "Prepare interview answers and apply to internships or entry-level roles that fit your skills.",
            status: "upcoming",
            statusLabel: "Career goal",
        },
    ];


    // =========================
    // DISPLAY NAME
    // =========================

    const displayName =
        user?.name?.trim()
        || user?.fullName?.trim()
        || user?.username?.trim()
        || user?.email?.split("@")[0]
        || "User";

    const firstLetter =
        displayName.charAt(0).toUpperCase();


    // =========================
    // LOGOUT
    // =========================

    const handleLogout = () => {

        localStorage.removeItem("user");
        localStorage.removeItem("userId");

        navigate("/login");

    };


    // =========================
    // LOADING
    // =========================

    if (loading) {

        return (

            <div className="dashboard-loading">

                <div className="loading-spinner"></div>

                <p>Loading your dashboard...</p>

            </div>

        );

    }


    return (

        <div className="dashboard">


            {/* =================================
                SIDEBAR
            ================================= */}

            <aside className="sidebar">

                {/* LOGO */}

                <div className="sidebar-logo">

                    <div className="logo-mark">
                        AI
                    </div>

                    <span>
                        Career Navigator
                    </span>

                </div>


                {/* NAVIGATION */}

                <nav className="sidebar-nav">

                    <Link
                        to="/dashboard"
                        className="nav-item active"
                    >

                        <span>⌂</span>

                        <span className="nav-text">
                            Dashboard
                        </span>

                    </Link>


                    <Link
                        to="/profile"
                        className="nav-item"
                    >

                        <span>◎</span>

                        <span className="nav-text">
                            My Profile
                        </span>

                    </Link>


                    <Link
                        to="/resume"
                        className="nav-item"
                    >

                        <span>▤</span>

                        <span className="nav-text">
                            Resume
                        </span>

                    </Link>


                    <Link
                        to="/skills"
                        className="nav-item"
                    >

                        <span>◇</span>

                        <span className="nav-text">
                            Skills
                        </span>

                    </Link>


                    <Link
                        to="/roadmap"
                        className="nav-item"
                    >

                        <span>↗</span>

                        <span className="nav-text">
                            Career Roadmap
                        </span>

                    </Link>


                    <Link
                        to="/opportunities"
                        className="nav-item"
                    >

                        <span>◈</span>

                        <span className="nav-text">
                            Opportunities
                        </span>

                    </Link>


                    <Link
                        to="/applications"
                        className="nav-item"
                    >

                        <span>✓</span>

                        <span className="nav-text">
                            Applications
                        </span>

                    </Link>


                    <Link
                        to="/settings"
                        className="nav-item"
                    >

                        <span>⚙</span>

                        <span className="nav-text">
                            Settings
                        </span>

                    </Link>

                </nav>


                {/* SIDEBAR BOTTOM */}

                <div className="sidebar-bottom">

                    <button
                        className="logout-button"
                        onClick={handleLogout}
                    >

                        <span>↪</span>

                        Logout

                    </button>

                </div>

            </aside>


            {/* =================================
                MAIN CONTENT
            ================================= */}

            <main className="dashboard-main">


                {/* =================================
                    HEADER
                ================================= */}

                <header className="dashboard-header">

                    <div>

                        <p className="header-label">
                            PERSONAL DASHBOARD
                        </p>

                        <h1>
                            Good morning, {displayName}.
                        </h1>

                        <p className="header-description">
                            Here's your career progress today.
                        </p>

                    </div>


                    <div className="user-profile">

                        <button className="notification">
                            ♧
                        </button>

                        <div className="avatar">
                            {firstLetter}
                        </div>

                    </div>

                </header>


                {/* =================================
                    WELCOME
                ================================= */}

                <section className="welcome-section">

                    <div>

                        <h2>
                            Welcome back, {displayName} 👋
                        </h2>

                        <p>
                            Let's continue building your career.
                        </p>

                    </div>

                    <Link
                        to="/profile"
                        className="complete-profile-button"
                    >
                        {profile
                            ? "Edit Profile"
                            : "Complete Profile"}
                    </Link>

                </section>


                {/* =================================
                    TOP GRID
                ================================= */}

                <div className="overview-grid">


                    {/* PROFILE CARD */}

                    <section className="dashboard-card">

                        <div className="card-top">

                            <span className="card-label">
                                CAREER PROFILE
                            </span>

                            <span className="card-icon">
                                ◎
                            </span>

                        </div>


                        <h2>
                            {profile?.careerGoal ||
                                "Your career goal"}
                        </h2>


                        <p className="card-description">

                            {profile?.branch ||
                                "Add your branch to personalize your career journey."}

                        </p>


                        <div className="profile-stats">

                            <div>

                                <strong>
                                    {skillCount}
                                </strong>

                                <span>
                                    Skills
                                </span>

                            </div>


                            <div>

                                <strong>
                                    {profile ? "✓" : "—"}
                                </strong>

                                <span>
                                    Profile
                                </span>

                            </div>


                            <div>

                                <strong>
                                    {profile?.education
                                        ? "✓"
                                        : "—"}
                                </strong>

                                <span>
                                    Education
                                </span>

                            </div>

                        </div>


                        <Link
                            to="/profile"
                            className="card-link"
                        >
                            View / Edit Profile →
                        </Link>

                    </section>


                    {/* RESUME CARD */}

                    <section className="dashboard-card">

                        <div className="card-top">

                            <span className="card-label">
                                RESUME ANALYSIS
                            </span>

                            <span className="card-icon">
                                ▤
                            </span>

                        </div>


                        <div className="resume-score">

                            <div>

                                <span className="score-number">
                                    {resumeLoading
                                        ? "..."
                                        : resumeAnalysis
                                            ? `${resumeAnalysis.matchScore}%`
                                            : "—"}
                                </span>

                                <p>
                                    Skill Match
                                </p>

                            </div>

                        </div>


                        <div className="progress-bar">

                            <div
                                className="progress-fill"
                                style={{
                                    width: `${resumeAnalysis?.matchScore ?? 0}%`
                                }}
                            ></div>

                        </div>


                        <p className="missing-title">
                            {resumeAnalysis?.targetRole
                                ? `SKILLS TO IMPROVE — ${resumeAnalysis.targetRole}`
                                : "SKILLS TO IMPROVE"}
                        </p>

                        <div className="skill-tags">
                            {resumeLoading ? (
                                <span>Loading analysis...</span>
                            ) : resumeAnalysis ? (
                                resumeAnalysis.missingSkills?.length > 0 ? (
                                    resumeAnalysis.missingSkills.slice(0, 4).map((skill) => (
                                        <span key={skill}>{skill}</span>
                                    ))
                                ) : (
                                    <span>No missing skills detected</span>
                                )
                            ) : (
                                <span>No analysis yet</span>
                            )}
                        </div>


                        <Link
                            to="/resume"
                            className="card-link"
                        >
                            Analyze Resume →
                        </Link>

                    </section>

                </div>


                {/* =================================
                    YOUR DETAILS
                ================================= */}

                <section className="dashboard-card details-card">

                    <div className="section-heading">

                        <div>

                            <span className="card-label">
                                YOUR INFORMATION
                            </span>

                            <h2>
                                Profile Details
                            </h2>

                        </div>

                        <Link
                            to="/profile"
                            className="view-link"
                        >
                            Edit
                        </Link>

                    </div>


                    <div className="details-grid">


                        <div className="detail-item">

                            <span>
                                Name
                            </span>

                            <strong>
                                {user?.name || "Not available"}
                            </strong>

                        </div>


                        <div className="detail-item">

                            <span>
                                Email
                            </span>

                            <strong>
                                {user?.email || "Not available"}
                            </strong>

                        </div>


                        <div className="detail-item">

                            <span>
                                Education
                            </span>

                            <strong>
                                {profile?.education ||
                                    "Not added"}
                            </strong>

                        </div>


                        <div className="detail-item">

                            <span>
                                College
                            </span>

                            <strong>
                                {profile?.college ||
                                    "Not added"}
                            </strong>

                        </div>


                        <div className="detail-item">

                            <span>
                                Branch
                            </span>

                            <strong>
                                {profile?.branch ||
                                    "Not added"}
                            </strong>

                        </div>


                        <div className="detail-item">

                            <span>
                                Career Goal
                            </span>

                            <strong>
                                {profile?.careerGoal ||
                                    "Not added"}
                            </strong>

                        </div>


                    </div>


                    <div className="skills-detail">

                        <span>
                            Skills
                        </span>

                        <p>
                            {profile?.skills ||
                                "No skills added yet."}
                        </p>

                    </div>

                </section>


                {/* =================================
                    CAREER ROADMAP
                ================================= */}

                <section className="dashboard-card roadmap-card">

                    <div className="section-heading">

                        <div>

                            <span className="card-label">
                                YOUR JOURNEY
                            </span>

                            <h2>
                                Career Roadmap
                            </h2>

                        </div>

                        <Link
                            to="/roadmap"
                            className="view-link"
                        >
                            View roadmap →
                        </Link>

                    </div>


                    <div className="roadmap">
                        {roadmapSteps.map((step, index) => (
                            <div className="roadmap-step-wrap" key={`${step.title}-${index}`}>
                                <div className={`roadmap-item ${step.status}`}>
                                    <div className="roadmap-dot">
                                        {step.status === "completed" ? "✓" : index + 1}
                                    </div>
                                    <div>
                                        <strong>{step.title}</strong>
                                        <span>{step.statusLabel}</span>
                                        <p className="roadmap-step-detail">{step.detail}</p>
                                    </div>
                                </div>
                                {index < roadmapSteps.length - 1 && (
                                    <div className="roadmap-line" />
                                )}
                            </div>
                        ))}
                    </div>

                </section>


                {/* =================================
                    BOTTOM GRID
                ================================= */}

                <div className="bottom-grid">


                    {/* OPPORTUNITIES */}

                    <section className="dashboard-card">

                        <div className="section-heading">

                            <div>

                                <span className="card-label">
                                    RECOMMENDED FOR YOU
                                </span>

                                <h2>
                                    Opportunities
                                </h2>

                            </div>

                            <Link
                                to="/opportunities"
                                className="view-link"
                            >
                                See all →
                            </Link>

                        </div>


                        <div className="opportunity">

                            <div className="company-logo">
                                AI
                            </div>

                            <div className="opportunity-info">

                                <h3>
                                    AI / ML Intern
                                </h3>

                                <p>
                                    Hyderabad · Internship
                                </p>

                            </div>

                            <span className="match">
                                85%
                            </span>

                        </div>


                        <div className="opportunity">

                            <div className="company-logo">
                                ML
                            </div>

                            <div className="opportunity-info">

                                <h3>
                                    Machine Learning Intern
                                </h3>

                                <p>
                                    Remote · Internship
                                </p>

                            </div>

                            <span className="match">
                                78%
                            </span>

                        </div>


                        <div className="opportunity">

                            <div className="company-logo">
                                DS
                            </div>

                            <div className="opportunity-info">

                                <h3>
                                    Data Science Intern
                                </h3>

                                <p>
                                    Bengaluru · Internship
                                </p>

                            </div>

                            <span className="match">
                                74%
                            </span>

                        </div>

                    </section>


                    {/* QUICK ACTIONS */}

                    <section className="dashboard-card actions-card">

                        <span className="card-label">
                            QUICK ACTIONS
                        </span>

                        <h2>
                            Continue building
                        </h2>


                        <Link
                            to="/resume"
                            className="action-item"
                        >

                            <span>
                                ↑
                            </span>

                            <div>

                                <strong>
                                    Upload Resume
                                </strong>

                                <p>
                                    Analyze your resume with AI
                                </p>

                            </div>

                            <b>
                                →
                            </b>

                        </Link>


                        <Link
                            to="/skills"
                            className="action-item"
                        >

                            <span>
                                ◇
                            </span>

                            <div>

                                <strong>
                                    Add Skills
                                </strong>

                                <p>
                                    Improve your career profile
                                </p>

                            </div>

                            <b>
                                →
                            </b>

                        </Link>


                        <Link
                            to="/roadmap"
                            className="action-item"
                        >

                            <span>
                                ↗
                            </span>

                            <div>

                                <strong>
                                    View Roadmap
                                </strong>

                                <p>
                                    See your personalized path
                                </p>

                            </div>

                            <b>
                                →
                            </b>

                        </Link>

                    </section>

                </div>


            </main>


            {/* =================================
                CAREER AI BUTTON
            ================================= */}

            <button
                className="career-ai"
                onClick={() => alert("Career AI coming soon")}
            >

                <span>
                    ✦
                </span>

                Ask Career AI

            </button>

        </div>

    );

}

export default UserDashboard;
