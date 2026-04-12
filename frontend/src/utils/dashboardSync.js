const PROFILE_STORAGE_KEY = "studentProfile";
const PRACTICE_STORAGE_KEY = "practice-submissions-v1";
const ACTIVITY_WINDOW_DAYS = 7;

const readStorageJson = (key, fallback) => {
  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    const rawValue = localStorage.getItem(key);
    return rawValue ? JSON.parse(rawValue) : fallback;
  } catch (error) {
    console.error(`Unable to read ${key} from local storage:`, error);
    return fallback;
  }
};

const normalizeUsername = (value = "") => value.trim().replace(/^@/, "");

const extractUsernameFromValue = (value = "", domains = []) => {
  const trimmed = value.trim();

  if (!trimmed) {
    return "";
  }

  try {
    const parsedUrl = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);

    if (!domains.length || domains.some((domain) => parsedUrl.hostname.includes(domain))) {
      const segments = parsedUrl.pathname.split("/").filter(Boolean);
      return normalizeUsername(segments[segments.length - 1] || "");
    }
  } catch {
    return normalizeUsername(trimmed.replace(/\/+$/, "").split("/").pop() || trimmed);
  }

  return normalizeUsername(trimmed);
};

const createDayBuckets = (days = ACTIVITY_WINDOW_DAYS) => {
  const buckets = [];

  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - offset);

    buckets.push({
      key: date.toISOString().slice(0, 10),
      label: date.toLocaleDateString("en-US", { weekday: "short" }),
      count: 0,
    });
  }

  return buckets;
};

const calculateCurrentStreak = (dayKeys = []) => {
  const uniqueDays = new Set(dayKeys.filter(Boolean));
  let streak = 0;
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  while (uniqueDays.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
};

export const getStoredProfile = () => readStorageJson(PROFILE_STORAGE_KEY, {});

export const getPlatformHandles = (profile = getStoredProfile()) => ({
  githubUsername: extractUsernameFromValue(
    profile.githubUsername || profile.githubUrl || profile.github || "",
    ["github.com"]
  ),
  leetcodeUsername: extractUsernameFromValue(
    profile.leetcodeUsername || profile.leetcodeUrl || profile.leetcode || "",
    ["leetcode.com"]
  ),
  gfgUsername: extractUsernameFromValue(
    profile.gfgUsername || profile.gfgUrl || profile.gfg || "",
    ["geeksforgeeks.org"]
  ),
});

export const getLocalPracticeSnapshot = () => {
  const rawSubmissions = readStorageJson(PRACTICE_STORAGE_KEY, {});
  const submissions = Object.values(rawSubmissions)
    .filter((submission) => submission && submission.title)
    .map((submission) => ({
      title: submission.title || "Untitled Problem",
      language: submission.language || "Unknown",
      submittedAt: submission.submittedAt || null,
    }))
    .sort(
      (left, right) =>
        new Date(right.submittedAt || 0).getTime() - new Date(left.submittedAt || 0).getTime()
    );

  const activityByDay = createDayBuckets();
  const bucketMap = new Map(activityByDay.map((bucket) => [bucket.key, bucket]));

  submissions.forEach((submission) => {
    const dayKey = submission.submittedAt?.slice(0, 10);
    const bucket = bucketMap.get(dayKey);

    if (bucket) {
      bucket.count += 1;
    }
  });

  const languageTotals = submissions.reduce((totals, submission) => {
    const key = submission.language || "Unknown";
    totals[key] = (totals[key] || 0) + 1;
    return totals;
  }, {});

  return {
    acceptedCount: submissions.length,
    currentStreak: calculateCurrentStreak(
      submissions.map((submission) => submission.submittedAt?.slice(0, 10))
    ),
    lastSubmissionAt: submissions[0]?.submittedAt || null,
    recentSubmissions: submissions.slice(0, 5),
    activityByDay,
    languageBreakdown: Object.entries(languageTotals)
      .map(([language, count]) => ({ language, count }))
      .sort((left, right) => right.count - left.count)
      .slice(0, 4),
  };
};

export const mergeWeeklyActivity = ({
  githubActivity = [],
  practiceActivity = [],
} = {}) => {
  const mergedDays = createDayBuckets();
  const githubMap = new Map(githubActivity.map((day) => [day.key, day.count || 0]));
  const practiceMap = new Map(practiceActivity.map((day) => [day.key, day.count || 0]));

  return mergedDays.map((bucket) => {
    const githubCount = githubMap.get(bucket.key) || 0;
    const practiceCount = practiceMap.get(bucket.key) || 0;

    return {
      ...bucket,
      githubCount,
      practiceCount,
      totalCount: githubCount + practiceCount,
    };
  });
};

export const getTopPortfolioSkills = (profile = getStoredProfile()) =>
  Array.isArray(profile.skills)
    ? [...profile.skills]
        .sort((left, right) => (right.level || 0) - (left.level || 0))
        .slice(0, 5)
    : [];

export const getPortfolioProjects = (profile = getStoredProfile()) =>
  Array.isArray(profile.projects) ? profile.projects.slice(0, 6) : [];

export const formatCompactNumber = (value = 0) =>
  new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(Number(value) || 0);

export const formatSyncLabel = (value) => {
  if (!value) {
    return "Not synced yet";
  }

  const syncedAt = new Date(value);

  if (Number.isNaN(syncedAt.getTime())) {
    return "Not synced yet";
  }

  const diffMs = Date.now() - syncedAt.getTime();
  const diffMinutes = Math.max(0, Math.round(diffMs / 60000));

  if (diffMinutes < 1) {
    return "Synced just now";
  }

  if (diffMinutes < 60) {
    return `Synced ${diffMinutes} min ago`;
  }

  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) {
    return `Synced ${diffHours} hr ago`;
  }

  const diffDays = Math.round(diffHours / 24);
  return `Synced ${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
};
