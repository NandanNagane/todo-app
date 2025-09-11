

// errorHandler.js - Enhanced version of your handler
import { toast } from "sonner";

/**
 * Handle validation errors (400/422 status codes)
 */
function handleValidationError(errorData, form, showToast) {
  // Handle field-specific validation errors
  if (errorData?.errors && form) {
    Object.entries(errorData.errors).forEach(([field, messages]) => {
      form.setError(field, {
        type: "server",
   
      });
    });

    // Show toast for validation errors
    if (showToast) {
      const firstError = Object.values(errorData.errors)[0];
      const message = Array.isArray(firstError) ? firstError[0] : firstError;
      toast.error(message);
    }
  } else {
    // Generic validation error
    const message = errorData?.message || "Invalid data provided.";
    if (showToast) toast.error(message);
  }

  return { type: "validation", message: "Validation failed" };
}

/**
 * Global API error handler for form submissions and API calls
 */
export function handleApiError(err, form = null, options = {}) {
  const { showToast = true, logError = true } = options;

  if (logError) {
    console.group("🚨 API Error");
    console.error("Message:", err.message);
    console.error("Status:", err.response?.status);
    console.error("URL:", err.config?.url);
    console.error("Full Error:", err);
    console.groupEnd();
  }

  // Network error (server down, no internet)
  if (!err.response) {
    if (showToast) {
      toast.error(
        "Cannot connect to the server. Please check your internet connection."
      );
    }
    return {
      type: "network",
      message: "Network error occurred",
    };
  }

  const { status, data } = err.response;
  console.log(err.response);
  
  
  // Handle different status codes
  switch (status) {
    case 400:
    case 422:
      return handleValidationError(data, form, showToast);
    case 401:
      return handleValidationError(data, form, showToast);
    case 403:
      if (showToast)
        toast.error("You don't have permission to perform this action.");
      return { type: "forbidden", message: "Access denied" };
    case 404:
      // Check if it's a validation error with specific field errors
      if (data?.errors && Object.keys(data.errors).length > 0) {   
        return handleValidationError(data, form, showToast);
      }
      // Otherwise, treat as a generic 404
      if (showToast) toast.error(`The requested resource was not found.`);
      return { type: "not-found", message: "Resource not found" };
    case 500:
      if (showToast) toast.error("Server error. Our team has been notified.");
      return { type: "server", message: "Internal server error" };
    default:
      const message = data?.message || "An unexpected error occurred.";
      if (showToast) toast.error(message);
      return { type: "unknown", message };
  }
}

/**
 * Handle OAuth/redirect errors
 */
export function handleRedirectError(errorCode) {
  if (!errorCode) return;

  const errorMessages = {
    auth_failed: "Authentication failed. Please try again.",
    email_exists: "An account with that email already exists.",
    access_denied: "Access was denied. Please try again.",
    invalid_request: "Invalid authentication request.",
    server_error: "Authentication server error. Please try again later.",
  };

  const message =
    errorMessages[errorCode] || "An unknown authentication error occurred.";

  toast.error(message, {
    id: "auth-error-toast",
    duration: 5000,
  });
}

/**
 * Specialized handler for query errors (TanStack Query)
 */
export function handleQueryError(error, queryKey) {
  console.error(`Query error for ${queryKey}:`, error);

  // Don't show toast for auth errors - interceptor handles
  if (error?.response?.status === 401) {
    return;
  }

  // Handle based on error type
  if (!error.response) {
    toast.error("Connection problem. Data may be outdated.");
  } else if (error.response.status >= 500) {
    toast.error("Server issue loading data. Please refresh.");
  }
  // For other errors, let component handle them
}
