export const setAccessToken = async (value) => {
  try {
    return localStorage.setItem("access_token", value);
  } catch (e) {
    return null;
  }
};

export const getAccessToken = async () => {
  try {
    const value = localStorage.getItem("access_token");

    return value;
  } catch (e) {
    return null;
  }
};

export const removeAccessToken = async () => {
  localStorage.removeItem("access_token");
};
