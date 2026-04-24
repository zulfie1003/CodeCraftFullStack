const GITHUB_API_URL = "https://api.github.com";
const ACTIVITY_WINDOW_DAYS = 7;

const normalizeUsername = (value = "") => value.trim().replace(/^@/, "");

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

const safeJsonFetch = async (url) => {
  const response = await fetch(url, {
    headers: {
      Accept: "application/vnd.github+json",
    },
  });

  if (!response.ok) {
    const error = new Error(`Request failed with status ${response.status}`);
    error.status = response.status;
    throw error;
  }

  return response.json();
};

const withOptionalGitHubData = async (promise, fallbackValue) => {
  try {
    return await promise;
  } catch {
    return fallbackValue;
  }
};

const calculateDayStreak = (countMap = new Map()) => {
  let streak = 0;
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  while ((countMap.get(cursor.toISOString().slice(0, 10)) || 0) > 0) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
};

export const fetchGitHubPublicFallback = async (rawValue = "") => {
  const username = normalizeUsername(rawValue);

  if (!username) {
    return null;
  }

  const [user, events, repos] = await Promise.all([
    safeJsonFetch(`${GITHUB_API_URL}/users/${username}`),
    withOptionalGitHubData(
      safeJsonFetch(`${GITHUB_API_URL}/users/${username}/events/public?per_page=100`),
      []
    ),
    withOptionalGitHubData(
      safeJsonFetch(`${GITHUB_API_URL}/users/${username}/repos?sort=updated&per_page=6`),
      []
    ),
  ]);

  const activityByDay = createDayBuckets();
  const bucketMap = new Map(activityByDay.map((bucket) => [bucket.key, bucket]));

  let recentPublicCommits = 0;
  let recentPublicActivity = 0;

  events.forEach((event) => {
    const bucketKey = event.created_at?.slice(0, 10);
    const bucket = bucketMap.get(bucketKey);

    if (!bucket) {
      return;
    }

    if (event.type === "PushEvent") {
      const commitCount = Array.isArray(event.payload?.commits) ? event.payload.commits.length : 0;
      bucket.count += commitCount || 1;
      recentPublicCommits += commitCount || 1;
      recentPublicActivity += commitCount || 1;
    } else {
      bucket.count += 1;
      recentPublicActivity += 1;
    }
  });

  const eventDayMap = new Map(
    [...new Set(events.map((event) => event.created_at?.slice(0, 10)).filter(Boolean))].map(
      (dayKey) => [dayKey, 1]
    )
  );

  return {
    username: user.login,
    profileUrl: user.html_url,
    avatarUrl: user.avatar_url,
    followers: user.followers || 0,
    following: user.following || 0,
    publicRepos: user.public_repos || 0,
    recentPublicCommits,
    recentPublicActivity,
    streak: calculateDayStreak(eventDayMap),
    activityByDay,
    topRepos: repos.map((repo) => ({
      name: repo.name,
      url: repo.html_url,
      description: repo.description || "",
      language: repo.language || "Not specified",
      stars: repo.stargazers_count || 0,
      updatedAt: repo.updated_at,
    })),
    source: "GitHub public browser API fallback",
  };
};
