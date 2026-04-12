export const ROLE_HOME_PATHS = {
  student: "/student/dashboard",
  recruiter: "/recruiter/dashboard",
  organizer: "/organizer/dashboard",
};

export const getStoredToken = () => localStorage.getItem("token");

export const getStoredUser = () => {
  try {
    const rawUser = localStorage.getItem("user");
    return rawUser ? JSON.parse(rawUser) : null;
  } catch {
    return null;
  }
};

export const storeAuthSession = ({ token, user }) => {
  if (!token || !user) {
    return;
  }

  localStorage.setItem("token", token);
  localStorage.setItem("role", user.role);
  localStorage.setItem("user", JSON.stringify(user));
};

export const getHomePathForRole = (role) => ROLE_HOME_PATHS[role] || "/login";

export const clearStoredAuth = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  localStorage.removeItem("user");
};
