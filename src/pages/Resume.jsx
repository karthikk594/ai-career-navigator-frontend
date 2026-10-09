
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import "./Resume.css";

function Resume() {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [existingResume, setExistingResume] = useState(null);
    const [checkingResume, setCheckingResume] = useState(true);

    const [targetRole, setTargetRole] = useState("AI Engineer");
    const [analysis, setAnalysis] = useState(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [analysisError, setAnalysisError] = useState("");

    const userId = localStorage.getItem("userId");

    useEffect(() => {
        let cancelled = false;

        async function fetchResume() {
            if (!userId) {
                setCheckingResume(false);
                return;
            }

            try {
                const response = await API.get(`/resume/${userId}`);

                if (cancelled) return;

                if (response.data?.id) {
                    setExistingResume(response.data);
                } else {
                    setExistingResume(null);
                }
            } catch (error) {
                console.error("Error fetching resume:", error);
            } finally {
                if (!cancelled) {
                    setCheckingResume(false);
                }
            }
        }

        fetchResume();

        return () => {
            cancelled = true;
        };
    }, [userId]);

    const handleFileChange = (event) => {
        const selectedFile = event.target.files?.[0];

        if (!selectedFile) return;

        if (
            selectedFile.type !== "application/pdf" &&
            !selectedFile.name.toLowerCase().endsWith(".pdf")
        ) {
            alert("Please select a PDF file.");
            event.target.value = "";
            return;
        }

        if (selectedFile.size > 10 * 1024 * 1024) {
            alert("The maximum file size is 10 MB.");
            event.target.value = "";
            return;
        }

        setFile(selectedFile);
    };

    const uploadResume = async () => {
        if (!userId) {
            alert("Please log in again.");
            return;
        }

        if (!file) {
            alert("Please select a PDF resume.");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        try {
            setUploading(true);

            const response = await API.post(
                `/resume/upload/${userId}`,
                formData
            );

            setExistingResume(response.data);
            setFile(null);
            setAnalysis(null);
            setAnalysisError("");

            const input = document.getElementById("resume-input");
            if (input) input.value = "";

            alert("Resume uploaded successfully.");
        } catch (error) {
            console.error("Resume upload error:", error);

            alert(
                error.response?.data?.message ||
                "Resume upload failed. Please try again."
            );
        } finally {
            setUploading(false);
        }
    };

    const analyzeResume = async () => {
        if (!userId) {
            setAnalysisError("Please log in again to continue.");
            return;
        }

        if (!existingResume) {
            setAnalysisError("Please upload your resume first.");
            return;
        }

        try {
            setAnalyzing(true);
            setAnalysisError("");
            setAnalysis(null);

            const response = await API.post(
                `/resume/analyze/${userId}`,
                null,
                {
                    params: { targetRole }
                }
            );

            setAnalysis(response.data);
        } catch (error) {
            console.error("Resume analysis error:", error);

            setAnalysisError(
                error.response?.data?.message ||
                error.response?.data?.detail ||
                "Analysis failed. Please check that the backend is running."
            );
        } finally {
            setAnalyzing(false);
        }
    };

    const removeSelectedFile = () => {
        setFile(null);

        const input = document.getElementById("resume-input");
        if (input) input.value = "";
    };

    const sectionStyle = {
        marginTop: "24px",
        padding: "24px",
        border: "1px solid #e5e7eb",
        borderRadius: "16px",
        background: "#ffffff"
    };

    const skillStyle = {
        display: "inline-block",
        padding: "8px 12px",
        margin: "5px 6px 5px 0",
        borderRadius: "20px",
        fontSize: "13px",
        fontWeight: 500
    };

    // Format section names for display.
    const formatSectionName = (section) =>
        section
            .replace(/([A-Z])/g, " $1")
            .replace(/[_-]/g, " ")
            .replace(/\s+/g, " ")
            .trim()
            .replace(/\b\w/g, (letter) => letter.toUpperCase());

    return (
        <div className="resume-page">
            <header className="resume-navbar">
                <Link to="/dashboard" className="resume-brand">
                    <div className="resume-logo">AI</div>
                    <span>Career Navigator</span>
                </Link>

                <Link to="/dashboard" className="back-dashboard">
                    ← Dashboard
                </Link>
            </header>

            <main className="resume-main">
                {/* PAGE HEADER */}
                <section className="resume-header">
                    <span className="resume-label">RESUME</span>
                    <h1>Build a stronger resume.</h1>
                    <p>
                        Upload your resume, check your skill match,
                        and discover what to learn next.
                    </p>
                </section>

                {/* RESUME UPLOAD */}
                <section className="resume-card">
                    <div className="card-heading">
                        <div>
                            <h2>Your resume</h2>
                            <p>Upload your latest resume in PDF format.</p>
                        </div>

                        <div className="pdf-icon">PDF</div>
                    </div>

                    {checkingResume ? (
                        <p>Checking your saved resume...</p>
                    ) : !userId ? (
                        <p>Your session was not found. Please log in again.</p>
                    ) : existingResume ? (
                        <div className="selected-file">
                            <div className="file-icon">PDF</div>

                            <div className="file-info">
                                <strong>{existingResume.fileName}</strong>
                                <span>Resume saved successfully</span>
                            </div>
                        </div>
                    ) : (
                        <>
                            {!file ? (
                                <label
                                    htmlFor="resume-input"
                                    className="upload-area"
                                >
                                    <div className="upload-icon">↑</div>
                                    <h3>Choose your resume</h3>
                                    <p>Click here to select a PDF file</p>
                                    <span>Maximum file size: 10 MB</span>

                                    <input
                                        id="resume-input"
                                        type="file"
                                        accept=".pdf,application/pdf"
                                        onChange={handleFileChange}
                                    />
                                </label>
                            ) : (
                                <div className="selected-file">
                                    <div className="file-icon">PDF</div>

                                    <div className="file-info">
                                        <strong>{file.name}</strong>
                                        <span>
                                            {(file.size / 1024 / 1024).toFixed(2)}
                                            {" MB"}
                                        </span>
                                    </div>

                                    <button
                                        type="button"
                                        className="remove-file"
                                        onClick={removeSelectedFile}
                                        disabled={uploading}
                                    >
                                        ×
                                    </button>
                                </div>
                            )}

                            <button
                                type="button"
                                className="upload-button"
                                onClick={uploadResume}
                                disabled={!file || uploading}
                            >
                                {uploading ? "Uploading..." : "Upload Resume"}
                            </button>
                        </>
                    )}

                    {existingResume && (
                        <div className="upload-success">
                            <span>✓</span>

                            <div>
                                <strong>Resume ready for analysis</strong>
                                <p>Your saved PDF can now be analyzed.</p>
                            </div>
                        </div>
                    )}
                </section>

                {/* RESUME ANALYSIS CONTROLS */}
                <section style={sectionStyle}>
                    <span className="resume-label">CAREER MATCH</span>

                    <h2 style={{ marginTop: "10px" }}>
                        Analyze your resume
                    </h2>

                    <p>
                        Choose your target role to compare your resume's
                        detected skills against the role requirements.
                    </p>

                    <label
                        htmlFor="target-role"
                        style={{
                            display: "block",
                            marginTop: "20px",
                            marginBottom: "8px",
                            fontWeight: 600
                        }}
                    >
                        Target career role
                    </label>

                    <select
                        id="target-role"
                        value={targetRole}
                        onChange={(event) => {
                            setTargetRole(event.target.value);
                            setAnalysis(null);
                            setAnalysisError("");
                        }}
                        disabled={analyzing}
                        style={{
                            width: "100%",
                            maxWidth: "420px",
                            padding: "12px",
                            border: "1px solid #d1d5db",
                            borderRadius: "10px",
                            background: "#fff",
                            fontSize: "15px"
                        }}
                    >
                        <option>AI Engineer</option>
                        <option>ML Engineer</option>
                        <option>Data Scientist</option>
                        <option>Java Developer</option>
                        <option>Web Developer</option>
                    </select>

                    <div>
                        <button
                            type="button"
                            className="upload-button"
                            onClick={analyzeResume}
                            disabled={
                                !existingResume ||
                                analyzing ||
                                checkingResume
                            }
                            style={{ marginTop: "18px" }}
                        >
                            {analyzing
                                ? "Analyzing resume..."
                                : "Analyze Resume"}
                        </button>
                    </div>

                    {analyzing && (
                        <p role="status" style={{ marginTop: "12px" }}>
                            Extracting text and checking your skills...
                        </p>
                    )}

                    {analysisError && (
                        <p
                            role="alert"
                            style={{
                                color: "#b91c1c",
                                marginTop: "16px"
                            }}
                        >
                            {analysisError}
                        </p>
                    )}
                </section>

                {/* ANALYSIS RESULTS */}
                {analysis && (
                    <section style={sectionStyle}>
                        <span className="resume-label">YOUR RESULTS</span>

                        <h2 style={{ marginTop: "10px" }}>
                            Resume analysis
                        </h2>

                        <p>
                            Target role:{" "}
                            <strong>{analysis.targetRole}</strong>
                        </p>

                        {/* MATCH SCORE */}
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "20px",
                                flexWrap: "wrap",
                                margin: "24px 0"
                            }}
                        >
                            <div
                                style={{
                                    width: "112px",
                                    height: "112px",
                                    borderRadius: "50%",
                                    border: "8px solid #16a34a",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flexDirection: "column",
                                    flexShrink: 0
                                }}
                            >
                                <strong style={{ fontSize: "28px" }}>
                                    {analysis.matchScore ?? 0}%
                                </strong>

                                <span style={{ fontSize: "11px" }}>
                                    MATCH
                                </span>
                            </div>

                            <div style={{ flex: 1, minWidth: "180px" }}>
                                <h3>Skill match score</h3>

                                <p>
                                    {(analysis.matchedSkills || []).length} of{" "}
                                    {(analysis.requiredSkills || []).length}{" "}
                                    required skills detected in your resume.
                                </p>

                                <div
                                    style={{
                                        height: "10px",
                                        borderRadius: "10px",
                                        background: "#e5e7eb",
                                        overflow: "hidden"
                                    }}
                                >
                                    <div
                                        style={{
                                            width: `${Math.min(
                                                100,
                                                Math.max(
                                                    0,
                                                    Number(analysis.matchScore) || 0
                                                )
                                            )}%`,
                                            height: "100%",
                                            background: "#16a34a",
                                            borderRadius: "10px"
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* MATCHED SKILLS */}
                        <div style={{ marginTop: "24px" }}>
                            <h3>✓ Matched skills</h3>

                            {(analysis.matchedSkills || []).length > 0 ? (
                                <div style={{ marginTop: "10px" }}>
                                    {analysis.matchedSkills.map((skill) => (
                                        <span
                                            key={skill}
                                            style={{
                                                ...skillStyle,
                                                color: "#166534",
                                                background: "#dcfce7"
                                            }}
                                        >
                                            ✓ {skill}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <p>No required skills were detected.</p>
                            )}
                        </div>

                        {/* MISSING SKILLS */}
                        <div style={{ marginTop: "24px" }}>
                            <h3>Skills to develop</h3>

                            {(analysis.missingSkills || []).length > 0 ? (
                                <div style={{ marginTop: "10px" }}>
                                    {analysis.missingSkills.map((skill) => (
                                        <span
                                            key={skill}
                                            style={{
                                                ...skillStyle,
                                                color: "#92400e",
                                                background: "#fef3c7"
                                            }}
                                        >
                                            + {skill}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <p>
                                    All skills in this role's checklist were
                                    detected in your resume.
                                </p>
                            )}
                        </div>

                        {/* RECOMMENDATIONS */}
                        <div style={{ marginTop: "28px" }}>
                            <h3>Recommendations</h3>

                            {(analysis.suggestions || []).length > 0 ? (
                                <ul
                                    style={{
                                        paddingLeft: "22px",
                                        lineHeight: 1.8
                                    }}
                                >
                                    {analysis.suggestions.map(
                                        (suggestion, index) => (
                                            <li key={index}>{suggestion}</li>
                                        )
                                    )}
                                </ul>
                            ) : (
                                <p>No additional recommendations available.</p>
                            )}
                        </div>

                        {/* NEW: RESUME INSIGHTS */}
                        <section
                            className="analysis-insights"
                            style={{
                                ...sectionStyle,
                                marginTop: "30px",
                                background: "#f9fafb"
                            }}
                        >
                            <span className="resume-label">
                                DETAILED REVIEW
                            </span>

                            <h3 style={{ marginTop: "10px" }}>
                                Resume insights
                            </h3>

                            <p style={{ color: "#4b5563" }}>
                                Review the extracted content and the sections
                                detected in your resume.
                            </p>

                            {/* WORD COUNT */}
                            <div
                                style={{
                                    marginTop: "20px",
                                    padding: "18px",
                                    background: "#ffffff",
                                    border: "1px solid #e5e7eb",
                                    borderRadius: "12px"
                                }}
                            >
                                <span
                                    style={{
                                        display: "block",
                                        color: "#6b7280",
                                        fontSize: "13px"
                                    }}
                                >
                                    WORDS EXTRACTED
                                </span>

                                <strong
                                    style={{
                                        display: "block",
                                        fontSize: "28px",
                                        marginTop: "5px"
                                    }}
                                >
                                    {analysis.wordCount ?? "N/A"}
                                </strong>
                            </div>

                            {/* DETECTED SECTIONS */}
                            <div style={{ marginTop: "24px" }}>
                                <h4>Detected sections</h4>

                                {analysis.sectionsDetected &&
                                Object.keys(analysis.sectionsDetected).length > 0 ? (
                                    <div
                                        className="section-list"
                                        style={{
                                            display: "flex",
                                            flexWrap: "wrap",
                                            gap: "10px",
                                            marginTop: "12px"
                                        }}
                                    >
                                        {Object.entries(
                                            analysis.sectionsDetected
                                        ).map(([section, detected]) => (
                                            <span
                                                key={section}
                                                className={
                                                    detected
                                                        ? "section-found"
                                                        : "section-missing"
                                                }
                                                style={{
                                                    display: "inline-block",
                                                    padding: "8px 12px",
                                                    borderRadius: "20px",
                                                    fontSize: "13px",
                                                    background: detected
                                                        ? "#dcfce7"
                                                        : "#f3f4f6",
                                                    color: detected
                                                        ? "#166534"
                                                        : "#6b7280",
                                                    border: "1px solid",
                                                    borderColor: detected
                                                        ? "#bbf7d0"
                                                        : "#e5e7eb"
                                                }}
                                            >
                                                {detected ? "✓" : "○"}{" "}
                                                {formatSectionName(section)}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <p style={{ color: "#6b7280" }}>
                                        Section detection data is not available
                                        from the analysis service.
                                    </p>
                                )}
                            </div>

                            {/* SKILL EVIDENCE */}
                            <div style={{ marginTop: "28px" }}>
                                <h4>Skill evidence</h4>

                                <p
                                    style={{
                                        color: "#6b7280",
                                        fontSize: "14px"
                                    }}
                                >
                                    Evidence shows where a skill was detected
                                    in the extracted resume text.
                                </p>

                                {analysis.skillEvidence &&
                                Object.keys(analysis.skillEvidence).length > 0 ? (
                                    <div
                                        style={{
                                            display: "grid",
                                            gap: "12px",
                                            marginTop: "14px"
                                        }}
                                    >
                                        {Object.entries(
                                            analysis.skillEvidence
                                        ).map(([skill, evidence]) => (
                                            <div
                                                className="skill-evidence"
                                                key={skill}
                                                style={{
                                                    padding: "14px",
                                                    border: "1px solid #e5e7eb",
                                                    borderRadius: "12px",
                                                    background: "#ffffff"
                                                }}
                                            >
                                                <strong>{skill}</strong>

                                                <p
                                                    style={{
                                                        marginTop: "6px",
                                                        marginBottom: 0,
                                                        color: "#4b5563",
                                                        lineHeight: 1.6,
                                                        overflowWrap: "anywhere"
                                                    }}
                                                >
                                                    {typeof evidence === "string"
                                                        ? evidence
                                                        : JSON.stringify(evidence)}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p style={{ color: "#6b7280" }}>
                                        Skill evidence is not available from
                                        the analysis service yet.
                                    </p>
                                )}
                            </div>
                        </section>

                        {/* DISCLAIMER */}
                        <p
                            style={{
                                marginTop: "24px",
                                color: "#6b7280",
                                fontSize: "13px",
                                lineHeight: 1.6
                            }}
                        >
                            This score measures detected keywords against a
                            predefined skills checklist. It is not a complete
                            assessment of your experience or resume quality.
                            Detected sections and skill evidence also depend
                            on the content extracted from your PDF.
                        </p>
                    </section>
                )}

                {/* HOW IT WORKS */}
                <section className="analysis-section">
                    <div className="analysis-header">
                        <span className="resume-label">HOW IT WORKS</span>

                        <h2>Understand your career fit.</h2>

                        <p>
                            Use your results to identify skills to practice
                            and improve your resume for your chosen role.
                        </p>
                    </div>

                    <div className="analysis-grid">
                        <div className="analysis-card">
                            <div className="analysis-number">01</div>
                            <h3>Skill Extraction</h3>
                            <p>
                                Extract readable text and detect relevant
                                technical skills from your PDF.
                            </p>
                        </div>

                        <div className="analysis-card">
                            <div className="analysis-number">02</div>
                            <h3>Role Match</h3>
                            <p>
                                Compare detected skills against a predefined
                                checklist for your target career.
                            </p>
                        </div>

                        <div className="analysis-card">
                            <div className="analysis-number">03</div>
                            <h3>Improvement Tips</h3>
                            <p>
                                Find missing skills and practical ways to
                                strengthen your resume.
                            </p>
                        </div>
                    </div>
                </section>

                <div className="resume-footer">
                    <Link to="/dashboard">← Back to Dashboard</Link>
                </div>
            </main>
        </div>
    );
}

export default Resume;

