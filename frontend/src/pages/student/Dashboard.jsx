import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  ArrowUpRight,
  BookOpenCheck,
  CircleAlert,
  Code2,
  Flame,
  FolderGit2,
  GitCommitHorizontal,
  Github,
  Link2,
  RefreshCw,
  Sparkles,
  Trophy,
} from "lucide-react";
import api from "../../api/axios";
import StudentLayout from "../../layouts/StudentLayout";
import { STUDENT_PROFILE_UPDATED_EVENT } from "../../utils/studentProfileSync";
import {
  formatCompactNumber,
  formatSyncLabel,
  getLocalPracticeSnapshot,
  getPlatformHandles,
  getPortfolioProjects,
  getStoredProfile,
  getTopPortfolioSkills,
  mergeWeeklyActivity,
} from "../../utils/dashboardSync";

const createPlatformResult = () => ({
  data: null,
  error: null,
});

const EMPTY_SYNC_STATE = {
  github: createPlatformResult(),
  leetcode: createPlatformResult(),
  gfg: createPlatformResult(),
  syncedAt: null,
};

const hasConnectedHandles = (handles) => Object.values(handles).some(Boolean);

const normalizePlatformState = (payload = {}) => ({
  github: payload.github || createPlatformResult(),
  leetcode: payload.leetcode || createPlatformResult(),
  gfg: payload.gfg || createPlatformResult(),
  syncedAt: payload.syncedAt || null,
});

const fetchPlatformState = async (handles) => {
  const response = await api.post("/users/platform-stats", handles);
  return normalizePlatformState(response.data?.data);
};

const readDashboardSources = () => {
  const nextProfile = getStoredProfile();
  return {
    profile: nextProfile,
    practiceSnapshot: getLocalPracticeSnapshot(),
    handles: getPlatformHandles(nextProfile),
  };
};

const getBarHeight = (value, maxValue) => {
  if (!value) {
    return "0%";
  }

  if (!maxValue) {
    return "0%";
  }

  return `${Math.max(10, Math.round((value / maxValue) * 100))}%`;
};

const getProblemSources = ({ leetcode, gfg, practiceSnapshot }) => [
  {
    id: "leetcode",
    label: "LeetCode",
    icon: Code2,
    value: leetcode?.totalSolved || 0,
    detail: leetcode
      ? `${leetcode.easySolved || 0} easy • ${leetcode.mediumSolved || 0} medium • ${
          leetcode.hardSolved || 0
        } hard`
      : "Add your LeetCode profile in Profile",
    extra: leetcode?.streak ? `${leetcode.streak} day streak` : "Public profile sync",
    link: leetcode?.profileUrl || "",
  },
  {
    id: "gfg",
    label: "GeeksforGeeks",
    icon: Trophy,
    value: gfg?.problemsSolved || 0,
    detail: gfg
      ? `Coding score ${formatCompactNumber(gfg.codingScore || 0)}`
      : "Add your GFG profile in Profile",
    extra: gfg?.currentPotdStreak ? `${gfg.currentPotdStreak} day POTD streak` : "Profile-based sync",
    link: gfg?.profileUrl || "",
  },
  {
    id: "practice",
    label: "Practice Section",
    icon: BookOpenCheck,
    value: practiceSnapshot.acceptedCount,
    detail: `${practiceSnapshot.recentSubmissions.length} recent accepted submissions`,
    extra: practiceSnapshot.currentStreak
      ? `${practiceSnapshot.currentStreak} day local streak`
      : "Solve a problem to start a streak",
    link: "",
  },
];

function Dashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(() => getStoredProfile());
  const [practiceSnapshot, setPracticeSnapshot] = useState(() => getLocalPracticeSnapshot());
  const [syncState, setSyncState] = useState(EMPTY_SYNC_STATE);
  const [loading, setLoading] = useState(false);
  const [syncError, setSyncError] = useState("");

  const handles = useMemo(() => getPlatformHandles(profile), [profile]);
  const hasHandles = useMemo(() => hasConnectedHandles(handles), [handles]);

  const refreshDashboard = async () => {
    const { profile: nextProfile, practiceSnapshot: nextPracticeSnapshot, handles: nextHandles } =
      readDashboardSources();

    setProfile(nextProfile);
    setPracticeSnapshot(nextPracticeSnapshot);
    setSyncError("");

    if (!hasConnectedHandles(nextHandles)) {
      setSyncState(EMPTY_SYNC_STATE);
      return;
    }

    setLoading(true);

    try {
      const nextSyncState = await fetchPlatformState(nextHandles);
      setSyncState(nextSyncState);
    } catch (error) {
      setSyncState((current) => ({
        ...current,
        syncedAt: current.syncedAt,
      }));
      setSyncError(
        error.response?.data?.message ||
          "Unable to sync live platform data right now. Local practice stats are still shown."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const syncFromStorage = async () => {
      const {
        profile: nextProfile,
        practiceSnapshot: nextPracticeSnapshot,
        handles: nextHandles,
      } = readDashboardSources();

      if (!isMounted) {
        return;
      }

      setProfile(nextProfile);
      setPracticeSnapshot(nextPracticeSnapshot);
      setSyncError("");

      if (!hasConnectedHandles(nextHandles)) {
        setSyncState(EMPTY_SYNC_STATE);
        return;
      }

      setLoading(true);

      try {
        const nextSyncState = await fetchPlatformState(nextHandles);

        if (!isMounted) {
          return;
        }

        setSyncState(nextSyncState);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setSyncError(
          error.response?.data?.message ||
            "Unable to sync live platform data right now. Local practice stats are still shown."
        );
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    syncFromStorage();

    const handleStorage = (event) => {
      if (event.key === "studentProfile" || event.key === "practice-submissions-v1") {
        syncFromStorage();
      }
    };

    const handleProfileUpdate = () => {
      syncFromStorage();
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener(STUDENT_PROFILE_UPDATED_EVENT, handleProfileUpdate);

    return () => {
      isMounted = false;
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(STUDENT_PROFILE_UPDATED_EVENT, handleProfileUpdate);
    };
  }, []);

  const github = syncState.github.data;
  const leetcode = syncState.leetcode.data;
  const gfg = syncState.gfg.data;
  const topSkills = useMemo(() => getTopPortfolioSkills(profile), [profile]);
  const portfolioProjects = useMemo(() => getPortfolioProjects(profile), [profile]);
  const weeklyActivity = useMemo(
    () =>
      mergeWeeklyActivity({
        githubActivity: github?.activityByDay || [],
        practiceActivity: practiceSnapshot.activityByDay || [],
      }),
    [github, practiceSnapshot.activityByDay]
  );
  const weeklyActivityTotal = weeklyActivity.reduce(
    (total, day) => total + (day.totalCount || 0),
    0
  );
  const maxWeeklyActivity = Math.max(
    ...weeklyActivity.map((day) => day.totalCount || 0),
    1
  );
  const totalProblemsSolved =
    (leetcode?.totalSolved || 0) + (gfg?.problemsSolved || 0) + practiceSnapshot.acceptedCount;
  const currentStreak = Math.max(
    leetcode?.streak || 0,
    gfg?.currentPotdStreak || 0,
    practiceSnapshot.currentStreak || 0,
    github?.streak || 0
  );
  const trackedProfiles = Object.values(handles).filter(Boolean).length;
  const liveProfiles = [github, leetcode, gfg].filter(Boolean).length;
  const platformIssues = [
    syncState.github.error
      ? { id: "github", label: "GitHub", message: syncState.github.error }
      : null,
    syncState.leetcode.error
      ? { id: "leetcode", label: "LeetCode", message: syncState.leetcode.error }
      : null,
    syncState.gfg.error ? { id: "gfg", label: "GeeksforGeeks", message: syncState.gfg.error } : null,
  ].filter(Boolean);
  const problemSources = useMemo(
    () => getProblemSources({ leetcode, gfg, practiceSnapshot }),
    [leetcode, gfg, practiceSnapshot]
  );
  const repoCards = useMemo(() => {
    if (github?.topRepos?.length) {
      return github.topRepos.map((repo) => ({
        id: repo.url,
        title: repo.name,
        description: repo.description || "Public GitHub repository",
        meta: `${repo.language} • ${repo.stars} stars`,
        href: repo.url,
      }));
    }

    return portfolioProjects.map((project) => ({
      id: project.id,
      title: project.title,
      description: project.desc || "Portfolio project",
      meta: Array.isArray(project.tags) && project.tags.length ? project.tags.join(" • ") : "Saved from your profile",
      href: "",
    }));
  }, [github, portfolioProjects]);

  return (
    <StudentLayout>
      <div className="sd-container student-dashboard">
        <div className="sd-header dashboard-header">
          <div>
            <p className="dashboard-kicker">Live Portfolio Sync</p>
            <h1>{profile.name ? `${profile.name.split(" ")[0]}'s Dashboard` : "Dashboard"}</h1>
            <p>
              GitHub activity, LeetCode and GFG progress, and your own practice submissions in one
              place.
            </p>
          </div>

          <div className="dashboard-header-actions">
            <span className={`sync dashboard-sync-pill ${loading ? "is-loading" : ""}`}>
              {loading ? "Syncing live data..." : formatSyncLabel(syncState.syncedAt)}
            </span>
            <button className="dashboard-refresh-btn" onClick={refreshDashboard} disabled={loading}>
              <RefreshCw size={16} className={loading ? "dashboard-spin" : ""} />
              Refresh Sync
            </button>
          </div>
        </div>

        {!hasHandles && (
          <div className="dashboard-callout">
            <div>
              <strong>Connect your coding profiles first.</strong>
              <p>
                Add your GitHub, LeetCode, and GeeksforGeeks profile links in Profile so this
                dashboard can pull your real stats automatically.
              </p>
            </div>
            <button className="dashboard-secondary-btn" onClick={() => navigate("/student/profile")}>
              Update Profiles
            </button>
          </div>
        )}

        {syncError && (
          <div className="dashboard-warning-strip">
            <CircleAlert size={16} />
            <span>{syncError}</span>
          </div>
        )}

        {platformIssues.length > 0 && (
          <div className="dashboard-issue-grid">
            {platformIssues.map((issue) => (
              <div key={issue.id} className="dashboard-issue-card">
                <CircleAlert size={16} />
                <div>
                  <strong>{issue.label}</strong>
                  <p>{issue.message}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <section className="dashboard-hero-grid">
          <article className="dashboard-hero-card">
            <div className="dashboard-panel-head">
              <div>
                <p className="dashboard-eyebrow">
                  <Sparkles size={14} /> Unified Overview
                </p>
                <h2>All of your coding signals, merged</h2>
              </div>
              <span className="dashboard-panel-meta">
                {liveProfiles}/{trackedProfiles || 0} live profiles synced
              </span>
            </div>

            <div className="dashboard-stat-grid">
              <div className="dashboard-stat-card">
                <span className="dashboard-stat-label">
                  <GitCommitHorizontal size={16} /> GitHub Commits
                </span>
                <strong>{formatCompactNumber(github?.recentPublicCommits || 0)}</strong>
                <p>Recent GitHub commits from your synced profile activity</p>
              </div>

              <div className="dashboard-stat-card accent-blue">
                <span className="dashboard-stat-label">
                  <BookOpenCheck size={16} /> Problems Solved
                </span>
                <strong>{formatCompactNumber(totalProblemsSolved)}</strong>
                <p>LeetCode, GFG, and accepted problems in your practice section</p>
              </div>

              <div className="dashboard-stat-card accent-orange">
                <span className="dashboard-stat-label">
                  <Flame size={16} /> Current Streak
                </span>
                <strong>{currentStreak} days</strong>
                <p>Best current streak across GitHub, LeetCode, GFG, and local practice</p>
              </div>

              <div className="dashboard-stat-card accent-slate">
                <span className="dashboard-stat-label">
                  <Link2 size={16} /> Connected Profiles
                </span>
                <strong>{trackedProfiles}</strong>
                <p>{trackedProfiles ? "Saved profile links are feeding the dashboard" : "No platform links added yet"}</p>
              </div>
            </div>

            <div className="dashboard-chip-row">
              {handles.githubUsername && <span className="dashboard-chip">GitHub @{handles.githubUsername}</span>}
              {handles.leetcodeUsername && (
                <span className="dashboard-chip">LeetCode @{handles.leetcodeUsername}</span>
              )}
              {handles.gfgUsername && <span className="dashboard-chip">GFG @{handles.gfgUsername}</span>}
            </div>
          </article>

          <aside className="dashboard-side-card">
            {github ? (
              <div className="dashboard-profile-card">
                <div className="dashboard-profile-head">
                  {github.avatarUrl ? (
                    <img src={github.avatarUrl} alt={github.username} className="dashboard-avatar" />
                  ) : (
                    <div className="dashboard-avatar placeholder">
                      {(github.username || profile.name || "?").charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="dashboard-eyebrow">
                      <Github size={14} /> GitHub Snapshot
                    </p>
                    <h3>{github.username}</h3>
                    <span>{formatCompactNumber(github.publicRepos || 0)} public repos</span>
                  </div>
                </div>

                <div className="dashboard-mini-metrics">
                  <div>
                    <strong>{formatCompactNumber(github.followers || 0)}</strong>
                    <span>Followers</span>
                  </div>
                  <div>
                    <strong>{formatCompactNumber(github.following || 0)}</strong>
                    <span>Following</span>
                  </div>
                  <div>
                    <strong>{formatCompactNumber(github.recentPublicActivity || 0)}</strong>
                    <span>7d activity</span>
                  </div>
                </div>

                <a
                  className="dashboard-inline-link"
                  href={github.profileUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open GitHub profile <ArrowUpRight size={15} />
                </a>
              </div>
            ) : (
              <div className="dashboard-profile-card empty">
                <p className="dashboard-eyebrow">
                  <Github size={14} /> GitHub Snapshot
                </p>
                <h3>Connect GitHub for live repo and commit data</h3>
                <p>
                  Once you add your GitHub profile in Profile, this side card will show your avatar,
                  repos, followers, and recent contribution activity.
                </p>
              </div>
            )}

            <div className="dashboard-skill-box">
              <div className="dashboard-panel-head compact">
                <div>
                  <p className="dashboard-eyebrow">
                    <Code2 size={14} /> Portfolio Strengths
                  </p>
                  <h3>Top skills from your profile</h3>
                </div>
              </div>

              {topSkills.length > 0 ? (
                <div className="dashboard-skill-list">
                  {topSkills.map((skill) => (
                    <div key={skill.id || skill.name} className="dashboard-skill-row">
                      <span>{skill.name}</span>
                      <strong>{skill.level}%</strong>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="dashboard-empty-copy">
                  Add a few skills in your profile to see portfolio strengths here.
                </p>
              )}
            </div>

            <div className="dashboard-action-stack">
              <button className="dashboard-secondary-btn" onClick={() => navigate("/student/practice")}>
                Continue Practice
              </button>
              <button
                className="dashboard-secondary-btn ghost"
                onClick={() => navigate("/student/profile")}
              >
                Edit Coding Profiles
              </button>
            </div>
          </aside>
        </section>

        <section className="dashboard-main-grid">
          <div className="dashboard-panel">
            <div className="dashboard-panel-head">
              <div>
                <p className="dashboard-eyebrow">
                  <Activity size={14} /> Weekly Activity
                </p>
                <h2>GitHub and practice contributions</h2>
              </div>
              <span className="dashboard-panel-meta">{weeklyActivityTotal} total actions in 7 days</span>
            </div>

            <div className="dashboard-activity-chart">
              {weeklyActivity.map((day) => (
                <div key={day.key} className="dashboard-bar-group">
                  <div className="dashboard-bar-stack">
                    <span
                      className="dashboard-bar github"
                      style={{ height: getBarHeight(day.githubCount, maxWeeklyActivity) }}
                      title={`${day.label}: ${day.githubCount} GitHub actions`}
                    />
                    <span
                      className="dashboard-bar practice"
                      style={{ height: getBarHeight(day.practiceCount, maxWeeklyActivity) }}
                      title={`${day.label}: ${day.practiceCount} practice solves`}
                    />
                  </div>
                  <span className="dashboard-bar-total">{day.totalCount}</span>
                  <span className="dashboard-bar-label">{day.label}</span>
                </div>
              ))}
            </div>

            <div className="dashboard-legend">
              <span>
                <i className="legend-dot github" />
                GitHub contribution activity
              </span>
              <span>
                <i className="legend-dot practice" />
                Accepted local practice
              </span>
            </div>
          </div>

          <div className="dashboard-panel">
            <div className="dashboard-panel-head">
              <div>
                <p className="dashboard-eyebrow">
                  <BookOpenCheck size={14} /> Problem Solving
                </p>
                <h2>Where your solved count comes from</h2>
              </div>
            </div>

            <div className="dashboard-platform-grid">
              {problemSources.map((source) => {
                const Icon = source.icon;

                return (
                  <article key={source.id} className="dashboard-platform-card">
                    <div className="dashboard-platform-head">
                      <span className="dashboard-platform-icon">
                        <Icon size={16} />
                      </span>
                      <div>
                        <strong>{source.label}</strong>
                        <p>{source.detail}</p>
                      </div>
                    </div>
                    <div className="dashboard-platform-footer">
                      <span className="dashboard-platform-value">{formatCompactNumber(source.value)}</span>
                      <small>{source.extra}</small>
                    </div>
                    {source.link && (
                      <a href={source.link} target="_blank" rel="noreferrer" className="dashboard-inline-link">
                        Open profile <ArrowUpRight size={15} />
                      </a>
                    )}
                  </article>
                );
              })}
            </div>

            {practiceSnapshot.languageBreakdown.length > 0 && (
              <div className="dashboard-language-strip">
                {practiceSnapshot.languageBreakdown.map((entry) => (
                  <span key={entry.language} className="dashboard-chip">
                    {entry.language}: {entry.count}
                  </span>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="dashboard-lower-grid">
          <div className="dashboard-panel">
            <div className="dashboard-panel-head">
              <div>
                <p className="dashboard-eyebrow">
                  <FolderGit2 size={14} /> Recent Work
                </p>
                <h2>{github?.topRepos?.length ? "GitHub repos" : "Portfolio projects"}</h2>
              </div>
            </div>

            {repoCards.length > 0 ? (
              <div className="dashboard-repo-grid">
                {repoCards.map((item) => (
                  <article key={item.id} className="dashboard-repo-card">
                    <div className="dashboard-repo-copy">
                      <h3>{item.title}</h3>
                      <p>{item.description}</p>
                      <span>{item.meta}</span>
                    </div>
                    {item.href ? (
                      <a href={item.href} target="_blank" rel="noreferrer" className="dashboard-inline-link">
                        Open <ArrowUpRight size={15} />
                      </a>
                    ) : null}
                  </article>
                ))}
              </div>
            ) : (
              <p className="dashboard-empty-copy">
                Add projects in your portfolio or connect GitHub to surface recent work here.
              </p>
            )}
          </div>

          <div className="dashboard-panel">
            <div className="dashboard-panel-head">
              <div>
                <p className="dashboard-eyebrow">
                  <BookOpenCheck size={14} /> Practice Feed
                </p>
                <h2>Latest accepted submissions</h2>
              </div>
            </div>

            {practiceSnapshot.recentSubmissions.length > 0 ? (
              <div className="dashboard-practice-feed">
                {practiceSnapshot.recentSubmissions.map((submission) => (
                  <div
                    key={`${submission.title}-${submission.submittedAt}`}
                    className="dashboard-practice-item"
                  >
                    <div>
                      <strong>{submission.title}</strong>
                      <p>{submission.language}</p>
                    </div>
                    <span>
                      {submission.submittedAt
                        ? new Date(submission.submittedAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })
                        : "Saved"}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="dashboard-empty-copy">
                Your accepted practice problems will appear here after you submit them.
              </p>
            )}
          </div>
        </section>
      </div>
    </StudentLayout>
  );
}

export default Dashboard;
