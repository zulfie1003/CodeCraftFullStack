import { sendSuccess, sendError } from '../utils/response.js';

const GITHUB_API_URL = 'https://api.github.com';
const GITHUB_GRAPHQL_URL = 'https://api.github.com/graphql';

const htmlToText = (html = '') =>
  html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, '\n')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/')
    .replace(/\r/g, '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{2,}/g, '\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();

const normalizeUsername = (value = '') => value.trim().replace(/^@/, '');

const extractUsernameFromUrl = (value = '', domains = []) => {
  const trimmed = value.trim();

  if (!trimmed) {
    return '';
  }

  try {
    const parsedUrl = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`);
    if (!domains.length || domains.some((domain) => parsedUrl.hostname.includes(domain))) {
      const segments = parsedUrl.pathname.split('/').filter(Boolean);
      return segments[segments.length - 1] || '';
    }
  } catch {
    return normalizeUsername(trimmed.replace(/\/+$/, '').split('/').pop() || trimmed);
  }

  return normalizeUsername(trimmed);
};

const buildDayBuckets = (days = 7) => {
  const buckets = [];

  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - offset);

    buckets.push({
      key: date.toISOString().slice(0, 10),
      label: date.toLocaleDateString('en-US', { weekday: 'short' }),
      count: 0,
    });
  }

  return buckets;
};

const getDateBoundaryIso = ({ daysAgo = 0, endOfDay = false } = {}) => {
  const date = new Date();

  if (endOfDay) {
    date.setHours(23, 59, 59, 999);
  } else {
    date.setHours(0, 0, 0, 0);
  }

  date.setDate(date.getDate() - daysAgo);
  return date.toISOString();
};

const createPublicHeaders = (extraHeaders = {}) => ({
  'User-Agent': 'CodeCraft-Dashboard-Sync',
  Accept: 'application/json, text/html;q=0.9, */*;q=0.8',
  ...extraHeaders,
});

const normalizeGitHubToken = (rawValue = '') => {
  const token = rawValue.trim();

  if (!token) {
    return '';
  }

  // Ignore checked-in placeholder values so local/dev setups fall back to public endpoints.
  if (/^your[-_ ]github[-_ ]token$/i.test(token)) {
    return '';
  }

  return token;
};

const isUnauthorizedError = (error) =>
  error?.status === 401 || /status 401/i.test(error?.message || '');

const isForbiddenError = (error) =>
  error?.status === 403 || /status 403/i.test(error?.message || '');

const createGitHubSyncError = (message, status) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const parseNumber = (value = '') => {
  const normalized = String(value).replace(/[^\d.]/g, '');

  if (!normalized) {
    return 0;
  }

  return Number.parseFloat(normalized);
};

const safeJsonFetch = async (url, options = {}) => {
  const response = await fetch(url, options);

  if (!response.ok) {
    const error = new Error(`Request failed with status ${response.status}`);
    error.status = response.status;
    throw error;
  }

  return response.json();
};

const safeTextFetch = async (url, options = {}) => {
  const response = await fetch(url, options);

  if (!response.ok) {
    const error = new Error(`Request failed with status ${response.status}`);
    error.status = response.status;
    throw error;
  }

  return response.text();
};

const withOptionalGitHubData = async (promise, fallbackValue, label) => {
  try {
    return await promise;
  } catch (error) {
    console.error(`${label} failed:`, error.message || error);
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

const buildActivityBucketsFromCountMap = (countMap = new Map(), days = 7) =>
  buildDayBuckets(days).map((bucket) => ({
    ...bucket,
    count: countMap.get(bucket.key) || 0,
  }));

const sumBucketCounts = (buckets = []) =>
  buckets.reduce((total, bucket) => total + (bucket.count || 0), 0);

const GITHUB_CONTRIBUTIONS_QUERY = `
  query getContributionSnapshot($login: String!, $from: DateTime!, $to: DateTime!) {
    user(login: $login) {
      contributionsCollection(from: $from, to: $to) {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              date
              contributionCount
            }
          }
        }
        restrictedContributionsCount
        totalCommitContributions
        commitContributionsByRepository(maxRepositories: 100) {
          contributions(first: 100) {
            nodes {
              occurredAt
              commitCount
            }
          }
        }
      }
    }
  }
`;

const fetchGitHubContributionSnapshot = async (username, token) => {
  if (!token) {
    return null;
  }

  const response = await fetch(GITHUB_GRAPHQL_URL, {
    method: 'POST',
    headers: createPublicHeaders({
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    }),
    body: JSON.stringify({
      query: GITHUB_CONTRIBUTIONS_QUERY,
      variables: {
        login: username,
        from: getDateBoundaryIso({ daysAgo: 89 }),
        to: getDateBoundaryIso({ endOfDay: true }),
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`GitHub GraphQL failed with status ${response.status}`);
  }

  const payload = await response.json();

  if (Array.isArray(payload.errors) && payload.errors.length > 0) {
    throw new Error(payload.errors.map((error) => error.message).join(', '));
  }

  return payload?.data?.user?.contributionsCollection || null;
};

const getContributionCountMap = (contributionCalendar) => {
  const days =
    contributionCalendar?.weeks?.flatMap((week) => week.contributionDays || []) || [];

  return new Map(
    days
      .filter((day) => day?.date)
      .map((day) => [day.date, Number.parseInt(day.contributionCount, 10) || 0])
  );
};

const getCommitCountMap = (collection) => {
  const byDay = new Map();
  const repositories = collection?.commitContributionsByRepository || [];

  repositories.forEach((repository) => {
    const nodes = repository?.contributions?.nodes || [];

    nodes.forEach((node) => {
      const dayKey = node?.occurredAt?.slice(0, 10);

      if (!dayKey) {
        return;
      }

      byDay.set(dayKey, (byDay.get(dayKey) || 0) + (node.commitCount || 0));
    });
  });

  return byDay;
};

const fetchGitHubStats = async (username, githubToken = '') => {
  const headers = createPublicHeaders({
    Accept: 'application/vnd.github+json',
    ...(githubToken ? { Authorization: `Bearer ${githubToken}` } : {}),
  });

  const eventsEndpoint = githubToken
    ? `${GITHUB_API_URL}/users/${username}/events?per_page=100`
    : `${GITHUB_API_URL}/users/${username}/events/public?per_page=100`;

  const [user, events, repos, contributionSnapshot] = await Promise.all([
    safeJsonFetch(`${GITHUB_API_URL}/users/${username}`, { headers }),
    withOptionalGitHubData(
      safeJsonFetch(eventsEndpoint, { headers }),
      [],
      'GitHub events sync'
    ),
    withOptionalGitHubData(
      safeJsonFetch(`${GITHUB_API_URL}/users/${username}/repos?sort=updated&per_page=6`, { headers }),
      [],
      'GitHub repos sync'
    ),
    githubToken
      ? withOptionalGitHubData(
          fetchGitHubContributionSnapshot(username, githubToken),
          null,
          'GitHub contribution snapshot'
        )
      : Promise.resolve(null),
  ]);

  const activityByDay = buildDayBuckets();
  const bucketMap = new Map(activityByDay.map((bucket) => [bucket.key, bucket]));

  let recentPublicCommits = 0;
  let recentPublicActivity = 0;

  events.forEach((event) => {
    const bucketKey = event.created_at?.slice(0, 10);
    const bucket = bucketMap.get(bucketKey);

    if (!bucket) {
      return;
    }

    if (event.type === 'PushEvent') {
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
    [...new Set(events.map((event) => event.created_at?.slice(0, 10)).filter(Boolean))].map((dayKey) => [
      dayKey,
      1,
    ])
  );
  let streak = calculateDayStreak(eventDayMap);
  let source = githubToken ? 'GitHub authenticated events API' : 'GitHub public REST API';

  if (contributionSnapshot) {
    const contributionCountMap = getContributionCountMap(contributionSnapshot.contributionCalendar);
    const commitCountMap = getCommitCountMap(contributionSnapshot);
    const contributionActivity = buildActivityBucketsFromCountMap(contributionCountMap);
    const recentCommitBuckets = buildActivityBucketsFromCountMap(commitCountMap);
    const commitStreak = calculateDayStreak(commitCountMap);
    const contributionStreak = calculateDayStreak(contributionCountMap);

    recentPublicActivity = sumBucketCounts(contributionActivity);
    recentPublicCommits = Math.max(recentPublicCommits, sumBucketCounts(recentCommitBuckets));
    streak = Math.max(streak, commitStreak, contributionStreak);

    contributionActivity.forEach((bucket, index) => {
      activityByDay[index].count = bucket.count;
    });

    source =
      contributionSnapshot.restrictedContributionsCount > 0
        ? 'GitHub contribution calendar + REST API'
        : 'GitHub contribution calendar + public REST API';
  }

  return {
    username: user.login,
    profileUrl: user.html_url,
    avatarUrl: user.avatar_url,
    followers: user.followers || 0,
    following: user.following || 0,
    publicRepos: user.public_repos || 0,
    recentPublicCommits,
    recentPublicActivity,
    streak,
    activityByDay,
    topRepos: repos.map((repo) => ({
      name: repo.name,
      url: repo.html_url,
      description: repo.description || '',
      language: repo.language || 'Not specified',
      stars: repo.stargazers_count || 0,
      updatedAt: repo.updated_at,
    })),
    source,
  };
};

const getGitHubStats = async (rawValue = '') => {
  const username = extractUsernameFromUrl(rawValue, ['github.com']);

  if (!username) {
    return null;
  }

  const githubToken = normalizeGitHubToken(process.env.GITHUB_API_TOKEN || '');

  try {
    return await fetchGitHubStats(username, githubToken);
  } catch (error) {
    if (githubToken && isUnauthorizedError(error)) {
      console.error('GitHub token rejected, retrying with public API:', error.message || error);
      return fetchGitHubStats(username, '');
    }

    if (isForbiddenError(error)) {
      throw createGitHubSyncError(
        'GitHub rate limit reached for the backend API. Add GITHUB_API_TOKEN to the backend to make GitHub sync reliable.',
        403
      );
    }

    throw error;
  }
};

const LEETCODE_QUERY = `
  query getUserProfile($username: String!) {
    matchedUser(username: $username) {
      username
      profile {
        ranking
        userAvatar
        realName
        aboutMe
        reputation
      }
      submitStatsGlobal {
        acSubmissionNum {
          difficulty
          count
          submissions
        }
      }
      languageProblemCount {
        languageName
        problemsSolved
      }
      userCalendar {
        streak
        totalActiveDays
      }
      badges {
        displayName
        icon
      }
    }
    userContestRanking(username: $username) {
      attendedContestsCount
      rating
      globalRanking
      topPercentage
      badge {
        name
      }
    }
  }
`;

const parseLeetCodeFromText = (username, text) => {
  const rank = text.match(/Rank\s+([\d,]+)/i)?.[1] || '';
  const contestRating = text.match(/Contest Rating\s+([\d,]+)/i)?.[1] || '';
  const badges = text.match(/Badges\s+([\d,]+)/i)?.[1] || '0';
  const languageMatches = [...text.matchAll(/([A-Za-z0-9#+.]+)\s+([\d,]+)\s+problems?\s+solved/gi)];
  const languages = languageMatches.slice(0, 5).map((match) => ({
    languageName: match[1],
    problemsSolved: parseNumber(match[2]),
  }));
  const totalSolved = languages.reduce(
    (best, current) => Math.max(best, current.problemsSolved),
    0
  );

  return {
    username,
    profileUrl: `https://leetcode.com/u/${username}/`,
    totalSolved,
    easySolved: 0,
    mediumSolved: 0,
    hardSolved: 0,
    ranking: parseNumber(rank),
    streak: 0,
    totalActiveDays: 0,
    contestRating: parseNumber(contestRating),
    contestGlobalRanking: 0,
    attendedContestsCount: 0,
    badges: parseNumber(badges),
    languages,
    source: 'LeetCode public profile page',
  };
};

const getLeetCodeStats = async (rawValue = '') => {
  const username = extractUsernameFromUrl(rawValue, ['leetcode.com']);

  if (!username) {
    return null;
  }

  try {
    const response = await fetch('https://leetcode.com/graphql', {
      method: 'POST',
      headers: createPublicHeaders({
        'Content-Type': 'application/json',
        Referer: `https://leetcode.com/u/${username}/`,
      }),
      body: JSON.stringify({
        query: LEETCODE_QUERY,
        variables: { username },
      }),
    });

    if (!response.ok) {
      throw new Error(`LeetCode GraphQL failed with status ${response.status}`);
    }

    const data = await response.json();
    const matchedUser = data?.data?.matchedUser;
    const contest = data?.data?.userContestRanking;

    if (!matchedUser) {
      throw new Error('LeetCode user not found');
    }

    const submissions = matchedUser.submitStatsGlobal?.acSubmissionNum || [];
    const findDifficultyCount = (difficulty) =>
      submissions.find((item) => item.difficulty === difficulty)?.count || 0;

    return {
      username: matchedUser.username,
      profileUrl: `https://leetcode.com/u/${matchedUser.username}/`,
      avatarUrl: matchedUser.profile?.userAvatar || '',
      totalSolved: findDifficultyCount('All'),
      easySolved: findDifficultyCount('Easy'),
      mediumSolved: findDifficultyCount('Medium'),
      hardSolved: findDifficultyCount('Hard'),
      ranking: matchedUser.profile?.ranking || 0,
      reputation: matchedUser.profile?.reputation || 0,
      streak: matchedUser.userCalendar?.streak || 0,
      totalActiveDays: matchedUser.userCalendar?.totalActiveDays || 0,
      contestRating: contest?.rating ? Math.round(contest.rating) : 0,
      contestGlobalRanking: contest?.globalRanking || 0,
      attendedContestsCount: contest?.attendedContestsCount || 0,
      badges: Array.isArray(matchedUser.badges) ? matchedUser.badges.length : 0,
      languages: Array.isArray(matchedUser.languageProblemCount)
        ? matchedUser.languageProblemCount.slice(0, 5)
        : [],
      source: 'LeetCode GraphQL + public profile',
    };
  } catch (graphqlError) {
    const html = await safeTextFetch(`https://leetcode.com/u/${username}/`, {
      headers: createPublicHeaders({
        Referer: 'https://leetcode.com/',
      }),
    });

    return parseLeetCodeFromText(username, htmlToText(html));
  }
};

const getGfgStats = async (rawValue = '') => {
  const username = extractUsernameFromUrl(rawValue, ['geeksforgeeks.org']);

  if (!username) {
    return null;
  }

  const html = await safeTextFetch(`https://www.geeksforgeeks.org/profile/${username}?tab=activity`, {
    headers: createPublicHeaders({
      Referer: 'https://www.geeksforgeeks.org/',
    }),
  });
  const text = htmlToText(html);

  const codingScore = text.match(/Coding Score\s+([\d,]+)/i)?.[1] || '0';
  const problemsSolved = text.match(/Problems Solved\s+([\d,]+)/i)?.[1] || '0';
  const instituteRank = text.match(/Institute Rank\s+([^\n]+)/i)?.[1]?.trim() || '__';
  const currentStreakMatch = text.match(/(\d+)\s+Day POTD Streak/i)?.[1] || '0';
  const longestStreakMatch = text.match(/Longest Streak:\s+(\d+)\s+Days/i)?.[1] || '0';
  const potdsSolvedMatch = text.match(/POTDs Solved:\s+(\d+)/i)?.[1] || '0';

  return {
    username,
    profileUrl: `https://www.geeksforgeeks.org/profile/${username}`,
    codingScore: parseNumber(codingScore),
    problemsSolved: parseNumber(problemsSolved),
    instituteRank,
    currentPotdStreak: parseNumber(currentStreakMatch),
    longestStreak: parseNumber(longestStreakMatch),
    potdsSolved: parseNumber(potdsSolvedMatch),
    source: 'GeeksforGeeks public profile',
  };
};

export const getPlatformStats = async (req, res, next) => {
  try {
    const { githubUsername = '', leetcodeUsername = '', gfgUsername = '' } = req.body || {};

    if (!githubUsername && !leetcodeUsername && !gfgUsername) {
      return sendError(res, 'Provide at least one GitHub, LeetCode, or GFG username', 400);
    }

    const [githubResult, leetcodeResult, gfgResult] = await Promise.allSettled([
      getGitHubStats(githubUsername),
      getLeetCodeStats(leetcodeUsername),
      getGfgStats(gfgUsername),
    ]);

    const buildPlatformPayload = (result) =>
      result.status === 'fulfilled'
        ? { data: result.value, error: null }
        : { data: null, error: result.reason?.message || 'Unable to fetch platform stats' };

    return sendSuccess(
      res,
      {
        github: buildPlatformPayload(githubResult),
        leetcode: buildPlatformPayload(leetcodeResult),
        gfg: buildPlatformPayload(gfgResult),
        syncedAt: new Date().toISOString(),
      },
      'Platform stats fetched successfully'
    );
  } catch (error) {
    next(error);
  }
};
