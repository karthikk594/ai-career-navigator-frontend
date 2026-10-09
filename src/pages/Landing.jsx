
import { Link } from "react-router-dom";
import "./Landing.css";

function Landing() {
    return (
        <div className="landing-page">

            <nav className="landing-nav">
                <div className="brand">
                    AI Career Navigator
                </div>

                <div className="nav-links">
                    <Link to="/login">Log in</Link>
                    <Link to="/register" className="nav-register">
                        Get Started
                    </Link>
                </div>
            </nav>


            <main className="hero-section">

                <p className="eyebrow">
                    AI-POWERED CAREER GUIDANCE
                </p>

                <h1>
                    Your career.
                    <br />
                    <span>Powered by AI.</span>
                </h1>

                <p className="hero-description">
                    Discover the right skills, opportunities, and career path
                    with intelligent guidance built around you.
                </p>

                <div className="hero-buttons">

                    <Link to="/register" className="primary-button">
                        Get Started
                        <span>→</span>
                    </Link>

                    <Link to="/login" className="secondary-button">
                        Sign in
                    </Link>

                </div>

            </main>


            <div className="hero-footer">
                <span>Personalized</span>
                <span>•</span>
                <span>AI-Powered</span>
                <span>•</span>
                <span>Career-Focused</span>
            </div>

        </div>
    );
}

export default Landing;

