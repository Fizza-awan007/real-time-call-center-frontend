export const isJwtExpired = (token) => {
  if (!token || typeof token !== "string") {
    return true;
  }

  const parts = token.split(".");
  if (parts.length !== 3) {
    return true;
  }

  try {
    const payload = JSON.parse(atob(parts[1]));
    if (!payload?.exp) {
      return true;
    }

    return Date.now() >= payload.exp * 1000;
  } catch {
    return true;
  }
};

export const clearAuthAndRedirect = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  window.location.href = "/login";
};
