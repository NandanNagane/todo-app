import axios from "axios";
import { Navigate } from "react-router-dom";
import { toast } from "sonner";

// Get the server URL from environment variables
const BASE_URL = import.meta.env.VITE_SERVER_URL;

// Create an Axios instance with default settings
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

// Set up the response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    // The condition is now more specific
    if (
      error.response &&
      error.response.status === 401 &&
      // ✅ ADD THIS CHECK: Only run this logic if we are NOT on an auth page
      !window.location.pathname.startsWith("/auth")
    ) {
      console.error(
        "Session expired! Caught by interceptor, redirecting to login."
      );
      try {
        // Attempt to log the user out to clear the session
        await axiosInstance.post("/auth/logout");
      } catch (logoutError) {
        console.error("Error during auto-logout:", logoutError);
      } finally {
        // Only redirect if it's a true session expiration
        toast.error(
          "Session expired! Please relogin.Redirecting to login..."
        );
        const timer = setTimeout(() => {
          window.location.href = "/auth/login";
        }, 3000);
      }
    }

    if (!error.response) {
      error.errorType = "NETWORK_ERROR";
    } else {
      error.errorType = "SERVER_ERROR";
    }
    return Promise.reject(error);
  }
);





export default axiosInstance;
