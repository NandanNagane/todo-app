import { toast } from "sonner";

/**
 * Handles errors from asynchronous API calls, often within forms.
 * @param {Error} err - The error object, typically from Axios.
 * @param {object} form - The react-hook-form instance to set field errors.
 */
export function handleApiError(err, form) {
  // Always good to log the raw error for debugging
  console.error("An API error occurred:", err);

  // Network error (server is down, etc.)
  if (!err.response) {
    toast.error("Cannot connect to the server. Please try again later.");
    return;
  }

  // Server responded with an error
  const errorData = err.response.data;

  // Handle specific, field-level validation errors
  if (errorData?.errors && form) {
    const fieldErrors = errorData.errors;
    Object.entries(fieldErrors).forEach(([field, messages]) => {
      form.setError(field, {
        type: "server",
        message: messages[0],
      });
    });
  } else {
    // Handle generic errors (e.g., incorrect credentials, server errors)
    const message = errorData?.message || "An unexpected error occurred. Please try again.";
    toast.error(message);
  }
}

/**
 * Handles errors passed back in URL search parameters, typically from OAuth redirects.
 * @param {string | null} errorCode - The error code from the URL (e.g., "auth_failed").
 */
export function handleRedirectError(errorCode) {
  if (!errorCode) return;

  let message;
  switch (errorCode) {
    case "auth_failed":
      message = "Authentication failed. Please try again.";
      break;
    case "email_exists":
      message = "An account with that email already exists. Please log in with your original method.";
      break;
    default:
      message = "An unknown error occurred during authentication.";
  }

  toast.error(message, {
    id: "auth-error-toast",
  });
}