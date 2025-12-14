import axios from "axios";

// Initialize Axios instance with backend URL
// Uses environment variable for flexible deployment (dev, staging, production)
const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || "https://bafl-backend.onrender.com/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor: Automatically attach Bearer token to all API calls
// Token is read from localStorage (set during login in AuthContext)
api.interceptors.request.use((config) => {
  // Read token ONLY from access_token field (matches backend contract)
  let token = null;
  
  const authData = localStorage.getItem("auth");
  if (authData) {
    try {
      const parsed = JSON.parse(authData);
      token = parsed?.access_token; // Extract from auth object
    } catch (err) {
      console.error('Failed to parse auth from localStorage', err);
    }
  }
  
  // Fallback to access_token localStorage key if not found in auth object
  if (!token) {
    token = localStorage.getItem("access_token");
  }
  
  // Add Bearer token to Authorization header for authenticated requests
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;