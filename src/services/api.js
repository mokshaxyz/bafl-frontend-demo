import axios from "axios";

const api = axios.create({
  baseURL: "https://bafl-backend.onrender.com/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

// Automatically attach the token from localStorage (for authentication)
api.interceptors.request.use((config) => {
  // Try to get token from auth context storage
  const authData = localStorage.getItem("auth");
  let token = null;
  
  if (authData) {
    try {
      const parsed = JSON.parse(authData);
      token = parsed?.token;
    } catch (err) {
      console.error('Failed to parse auth from localStorage', err);
    }
  }
  
  // Fallback to access_token if auth not found
  if (!token) {
    token = localStorage.getItem("access_token");
  }
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
