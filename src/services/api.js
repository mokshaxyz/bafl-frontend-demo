import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || "https://bafl-backend.onrender.com/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

// Automatically attach the token from localStorage (for authentication)
api.interceptors.request.use((config) => {
  // Read token ONLY from localStorage.auth.token
  let token = null;
  
  const authData = localStorage.getItem("auth");
  if (authData) {
    try {
      const parsed = JSON.parse(authData);
      token = parsed?.token;
    } catch (err) {
      console.error('Failed to parse auth from localStorage', err);
    }
  }
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;