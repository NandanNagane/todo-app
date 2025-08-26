import { useRouteError, Link, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export default function ErrorPage() {
  const error = useRouteError();
  const navigate = useNavigate();
  console.error(error); // For debugging purposes

  // If the error is 401, show a dedicated redirect message
  if (error?.status === 401) {
    return (
      <div id="error-page">
        <h1>401 - Unauthorized</h1>
        <p>Your session has expired or is invalid.</p>
        <p>Redirecting you to the login page...</p>
      </div>
    );
  }

  // ---  Prepare dynamic content for all other errors  ---
  let title = "Oops! Something Went Wrong";
  let message = "An unexpected error has occurred. Please try again.";

  if (error.status) {
    // This handles errors thrown as a Response from a loader
    switch (error.status) {
      case 404:
        title = "404 - Not Found";
        message = "Sorry, we couldn't find the page or resource you're looking for.";
        break;
      case 400:
        title = "400 - Bad Request";
        // Safely access the detailed message from your backend's JSON response
        message = error.data?.message || "There was a problem with your request.";
        break;
      default: // Handles 5xx server errors
        title = "Server Error";
        message = "There was an issue on our end. We're working to fix it!";
        break;
    }
  } else if (error.message) {
      // This handles generic errors (e.g., network failure, client-side rendering issues)
      message = error.message;
  }

  // ---  Render the final error page  ---
  return (
    <div id="error-page">
      <h1>{title}</h1>
      <p>{message}</p>
      <Link to="/auth/login">Go Back Home</Link>
    </div>
  );
}