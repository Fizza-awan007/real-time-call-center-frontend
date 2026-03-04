import axios from "axios";
import { getAccessToken } from "./localStorage";

export const BASE_URL = "https://dev-api.colnor.ai";

axios.defaults.baseURL = BASE_URL;

export const postAPIWithoutAuth = async (url, body) => {
  try {
    RemoveApiHeader();
    const res = await axios.post(url, body);

    return {
      data: res.data,
      status: res.status,
      success: true,
      headers: res.headers
    };
  } catch (err) {
    return { data: err.response.data, success: false };
  }
};

export const postAPIWithAuth = async (url, body, headers) => {
  try {
    await setApiHeader();
    let res = {};
    if (headers) {
      res = await axios.post(url, body, { headers });
    } else {
      res = await axios.post(url, body);
    }
    return { data: res.data, status: res.status, success: true };
  } catch (err) {
    console.log(err, "err");
    return { data: err.response.data, success: false };
  }
};

export const putAPIWithAuth = async (url, body, headers) => {
  try {
    await setApiHeader();
    let res = {};
    if (headers) {
      res = await axios.put(url, body, { headers });
    } else {
      res = await axios.put(url, body);
    }
    return { data: res.data, status: res.status, success: true };
  } catch (err) {
    console.log(err, "err");
    return { data: err.response.data, success: false };
  }
};

// export const getApiWithAuth = async (url) => {
//   try {
//     await setApiHeader();
//     const res = await axios.get(url);
//     return { data: res?.data, status: res.status, success: true };
//   } catch (err) {
//     return { data: err?.response?.data, success: false };
//   }
// };

export const getApiWithAuth = async (url) => {
  try {
    await setApiHeader();
    const res = await axios.get(url);
    return { data: res?.data, status: res.status, success: true };
  } catch (err) {
    if (
      err.response?.data?.code === "token_not_valid" ||
      err.response?.data?.messages?.some(
        (m) => m.message === "Token is expired"
      )
    ) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");

      window.location.href = "/login";
      return { success: false, redirecting: true };
    }

    return { data: err?.response?.data, success: false };
  }
};

export const patchApiWithAuth = async (url, body, headers) => {
  try {
    await setApiHeader();
    let res = {};
    if (headers) {
      res = await axios.patch(url, body, { headers });
    } else {
      res = await axios.patch(url, body);
    }
    return { data: res.data, status: res.status, success: true };
  } catch (err) {
    console.log(err, "err");
    return { data: err.response.data, success: false };
  }
};

export const deleteApi = async (url) => {
  try {
    await setApiHeader();
    const res = await axios.delete(url);
    return { data: res.data, status: res.status, success: true };
  } catch (err) {
    return { data: err.response.data, success: false };
  }
};

const setApiHeader = async () => {
  const token = await getAccessToken();
  console.log("------token", token);
  axios.defaults.headers.common.Authorization = `Bearer ${token}`;
};

const RemoveApiHeader = () => {
  delete axios.defaults.headers.common.Authorization;
};
// utils/auth.js
export const isTokenExpiredError = (error) => {
  return (
    error.response?.data?.code === "token_not_valid" ||
    error.response?.data?.messages?.some(
      (m) => m.message === "Token is expired"
    )
  );
};

export const logout = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  window.location.href = "/login";
};
