import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import "./Career.css";

const ROLE_SKILLS = {
  "AI Engineer": ["Python", "Machine Learning", "Deep Learning", "SQL", "TensorFlow", "PyTorch", "NLP", "Data Structures", "Git", "REST API"],
  "ML Engineer": ["Python", "Machine Learning", "Statistics", "SQL", "Scikit-learn", "Pandas", "NumPy", "Deep Learning", "Git", "Model Deployment"],
  "Data Scientist": ["Python", "Statistics", "SQL", "Pandas", "NumPy", "Data Visualization", "Machine Learning", "Feature Engineering", "Git", "Communication"],
  "Java Developer": ["Java", "OOP", "Data Structures", "SQL", "Spring Boot", "REST API", "Git", "Testing", "Maven", "Problem Solving"],
  "Web Developer": ["HTML", "CSS", "JavaScript", "React", "REST API", "Git", "Responsive Design", "Testing", "SQL", "Deployment"],
};

function normalizeRole(value) {
  const role = String(value || "").toLowerCase();
  if (role.includes("data scientist") || role.includes("data science")) return "Data Scientist";
  if (role.includes("ml engineer") || role.includes("machine learning engineer")) return "ML Engineer";
  if (role.includes("java")) return "Java Developer";
  if (role.includes("web") || role.includes("frontend") || role.includes("front-end") || role.includes("full stack")) return "Web Developer";
  return "AI Engineer";
}

function parseSkills(value) {
  if (Array.isArray(value)) return value.map(String).map((x) => x.trim()).filter(Boolean);
  if (typeof value !== "string") return [];
  return value.split(/[,;\n]/).map((x) => x.trim()).filter(Boolean);
}

function makeStages(role, profileSkills, analysis) {
  const matched = analysis?.matchedSkills || [];
  const missing = analysis?.missingSkills || [];
  const known = [...new Set([...profileSkills, ...matched])];
  const skillStages = (missing.length ? missing : ROLE_SKILLS[role].filter(
    (skill) => !known.some((item) => item.toLowerCase() === skill.toLowerCase())
  )).slice(0, 5);

  const stages = [
    {
      id: "foundation",
      number: "01",
      title: "Build your foundation",
      subtitle: "Strengthen the core skills for your target role.",
      duration: "1–2 weeks",
      tasks: [
        `Review the fundamentals required for ${role}.`,
        known.length ? `Revise your current skills: ${known.slice(0, 4).join(", ")}.` : "Choose a beginner-friendly course and create a weekly study plan.",
        "Practise coding or role-related exercises for at least 30 minutes a day.",
      ],
    },
  ];

  if (skillStages.length) {
    stages.push({
      id: "skills",
      number: "02",
      title: "Close your skill gaps",
      subtitle: analysis ? "Prioritised using the skills missing from your resume analysis." : "Start with the important skills not yet listed in your profile.",
      duration: `${Math.max(2, skillStages.length)}–${Math.max(3, skillStages.length + 2)} weeks`,
      tasks: skillStages.map((skill) => `Learn ${skill} and practise it with a small hands-on exercise.`),
    });
  } else {
    stages.push({
      id: "skills",
      number: "02",
      title: "Deepen your expertise",
      subtitle: "Your current skill list covers the initial target skills.",
      duration: "2–3 weeks",
      tasks: ["Build an advanced exercise using your strongest skill.", "Practise explaining your technical decisions.", "Add tests and clear documentation to your code."],
    });
  }

  stages.push(
    {
      id: "project",
      number: "03",
      title: "Build a role-focused project",
      subtitle: "Turn your learning into evidence you can demonstrate.",
      duration: "2–4 weeks",
      tasks: [
        `Build one end-to-end project related to ${role}.`,
        "Use a clean GitHub repository with a useful README and setup instructions.",
        "Document the problem, your approach, results, and what you would improve.",
      ],
    },
    {
      id: "portfolio",
      number: "04",
      title: "Polish your portfolio and resume",
      subtitle: "Make your skills and results easy for recruiters to understand.",
      duration: "3–5 days",
      tasks: [
        "Add your best projects with measurable outcomes where possible.",
        "Update your resume with relevant skills and project contributions.",
        "Check that your GitHub and LinkedIn links work and look professional.",
      ],
    },
    {
      id: "applications",
      number: "05",
      title: "Prepare and apply",
      subtitle: "Turn your preparation into internship and entry-level applications.",
      duration: "Ongoing",
      tasks: [
        `Practise common technical and behavioural questions for ${role}.`,
        "Solve interview problems consistently and review mistakes.",
        "Apply to relevant internships and entry-level roles; track each application.",
      ],
    }
  );

  return stages;
}

function CareerRoadmap() {
  const userId = localStorage.getItem("userId");
  const [profile, setProfile] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analysisMessage, setAnalysisMessage] = useState("");
  const [error, setError] = useState("");
  const [completed, setCompleted] = useState({});

  const savedProgressKey = `careerRoadmapProgress_${userId || "guest"}`;

  useEffect(() => {
    try {
      const saved = localStorage.getItem(savedProgressKey);
      setCompleted(saved ? JSON.parse(saved) : {});
    } catch {
      setCompleted({});
    }
  }, [savedProgressKey]);

  const updateTask = useCallback((taskId, checked) => {
    setCompleted((current) => {
      const next = { ...current, [taskId]: checked };
      try {
        localStorage.setItem(savedProgressKey, JSON.stringify(next));
      } catch (e) {
        console.warn("Could not save roadmap progress", e);
      }
      return next;
    });
  }, [savedProgressKey]);

  useEffect(() => {
    let cancelled = false;

    async function loadRoadmapData() {
      if (!userId) {
        setError("Please log in to view your personalised career roadmap.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");
      try {
        const profileResponse = await API.get(`/profile/${userId}`);
        const profileData = profileResponse.data || null;
        if (cancelled) return;
        setProfile(profileData);

        const role = normalizeRole(
    analysis?.targetRole || profile?.careerGoal
);
        try {
          const resumeResponse = await API.post(`/resume/analyze/${userId}`, null, {
            params: { targetRole: role },
          });
          if (!cancelled) {
            setAnalysis(resumeResponse.data || null);
            setAnalysisMessage("");
          }
        } catch {
          if (!cancelled) {
            setAnalysis(null);
            setAnalysisMessage("Upload a PDF resume on the Resume page to personalise skill priorities with resume analysis. Your profile-based roadmap is still available.");
          }
        }
      } catch (e) {
        if (!cancelled) {
          setError(e?.response?.data?.message || "Could not load your profile. Check that the backend is running and try again.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadRoadmapData();
    return () => { cancelled = true; };
  }, [userId]);

  const role = normalizeRole(profile?.careerGoal);
  const profileSkills = useMemo(() => parseSkills(profile?.skills), [profile?.skills]);
  const stages = useMemo(() => makeStages(role, profileSkills, analysis), [role, profileSkills, analysis]);
  const totalTasks = stages.reduce((sum, stage) => sum + stage.tasks.length, 0);
  const completedTasks = stages.reduce((sum, stage) => sum + stage.tasks.filter((task, index) => completed[`${stage.id}-${index}`]).length, 0);
  const progress = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const name = localStorage.getItem("user") ? (() => {
    try { return JSON.parse(localStorage.getItem("user"))?.name || "there"; } catch { return "there"; }
  })() : "there";

  if (loading) {
    return <main className="roadmap-page"><div className="roadmap-loading"><span className="roadmap-spinner" />Building your personalised roadmap…</div></main>;
  }

  if (error) {
    return (
      <main className="roadmap-page">
        <div className="roadmap-topbar"><Link className="roadmap-back" to="/dashboard">← Dashboard</Link></div>
        <section className="roadmap-empty"><div className="roadmap-eyebrow">CAREER NAVIGATOR</div><h1>Your roadmap starts here.</h1><p>{error}</p><button className="roadmap-primary" onClick={() => window.location.reload()}>Try again</button></section>
      </main>
    );
  }

  return (
    <main className="roadmap-page">
      <div className="roadmap-shell">
        <header className="roadmap-topbar">
          <Link className="roadmap-back" to="/dashboard">← Dashboard</Link>
          <span className="roadmap-brand"><span className="roadmap-brand-mark">N</span> Career Navigator</span>
        </header>

        <section className="roadmap-hero">
          <div className="roadmap-eyebrow">YOUR PERSONAL CAREER PLAN</div>
          <h1>A clearer path to<br /><span>{role}.</span></h1>
          <p className="roadmap-intro">Hi {name}. This roadmap combines your profile and, when available, resume skill analysis to give you practical next steps.</p>
          <div className="roadmap-summary">
            <div className="roadmap-summary-main">
              <div className="roadmap-summary-label">OVERALL PROGRESS</div>
              <div className="roadmap-progress-number">{progress}<span>%</span></div>
              <div className="roadmap-progress-track"><div className="roadmap-progress-fill" style={{ width: `${progress}%` }} /></div>
              <p>{completedTasks} of {totalTasks} tasks completed</p>
            </div>
            <div className="roadmap-summary-stat"><span className="roadmap-stat-icon">◎</span><strong>{stages.length}</strong><span>Learning stages</span></div>
            <div className="roadmap-summary-stat"><span className="roadmap-stat-icon">↗</span><strong>{analysis ? `${analysis.matchScore ?? 0}%` : "—"}</strong><span>Resume skill match</span></div>
          </div>
        </section>

        {analysisMessage && <div className="roadmap-notice">{analysisMessage}</div>}

        {profile && (
          <section className="roadmap-profile-strip">
            <div><span>CAREER GOAL</span><strong>{profile.careerGoal || role}</strong></div>
            <div><span>EDUCATION</span><strong>{profile.education || "Not added yet"}</strong></div>
            <div><span>SKILLS IN PROFILE</span><strong>{profileSkills.length ? profileSkills.slice(0, 4).join(", ") : "Add skills to your profile"}</strong></div>
          </section>
        )}

        <section className="roadmap-stage-heading">
          <div><div className="roadmap-eyebrow">YOUR ACTION PLAN</div><h2>Small steps. Real progress.</h2></div>
          <p>Tick off each task as you complete it. Your progress is saved in this browser for this account.</p>
        </section>

        <div className="roadmap-stages">
          {stages.map((stage) => {
            const stageDone = stage.tasks.filter((task, index) => completed[`${stage.id}-${index}`]).length;
            const stageComplete = stageDone === stage.tasks.length;
            return (
              <article className={`roadmap-stage ${stageComplete ? "is-complete" : ""}`} key={stage.id}>
                <div className="roadmap-stage-number">{stageComplete ? "✓" : stage.number}</div>
                <div className="roadmap-stage-content">
                  <div className="roadmap-stage-meta"><span>{stage.number} / 0{stages.length}</span><span>{stage.duration}</span></div>
                  <h3>{stage.title}</h3>
                  <p className="roadmap-stage-subtitle">{stage.subtitle}</p>
                  <div className="roadmap-task-list">
                    {stage.tasks.map((task, index) => {
                      const taskId = `${stage.id}-${index}`;
                      return (
                        <label className={`roadmap-task ${completed[taskId] ? "task-done" : ""}`} key={taskId}>
                          <input type="checkbox" checked={Boolean(completed[taskId])} onChange={(event) => updateTask(taskId, event.target.checked)} />
                          <span className="roadmap-custom-check" aria-hidden="true">{completed[taskId] ? "✓" : ""}</span>
                          <span>{task}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
                <div className="roadmap-stage-status">{stageComplete ? "COMPLETED" : `${stageDone}/${stage.tasks.length} DONE`}</div>
              </article>
            );
          })}
        </div>

        {analysis?.missingSkills?.length > 0 && (
          <section className="roadmap-gap-panel">
            <div className="roadmap-eyebrow">BASED ON YOUR RESUME</div>
            <h2>Skills to prioritise</h2>
            <p>These skills were not detected in your resume text. That does not necessarily mean you lack them—add them to your resume if you have the experience.</p>
            <div className="roadmap-skill-chips">{analysis.missingSkills.slice(0, 10).map((skill) => <span key={skill}>{skill}</span>)}</div>
          </section>
        )}

        <footer className="roadmap-footer"><span>Built around your goals, not a one-size-fits-all checklist.</span><Link to="/resume">Review resume analysis ↗</Link></footer>
      </div>
    </main>
  );
}

export default CareerRoadmap;
