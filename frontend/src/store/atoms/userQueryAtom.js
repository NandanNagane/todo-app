import { atom } from "jotai";
import { atomWithQuery } from "jotai-tanstack-query";
import { getUser } from "../../api/axios"; // Assuming getUser is in 'src/api/axios.js'

/**
 * Formats the user object received from the backend to match frontend needs.
 * @param {object} user - The raw user object from the API.
 * @returns {object|null} The formatted user object or null.
 */
const formatUser = (user) => {
  if (!user) {
    return null;
  }

  const { userName } = user;
  const firstName = userName?.split(" ")[0];
  const lastName = userName?.split(" ")[1];

  const formattedUser = {
    ...user,
    id: user._id,
    firstName,
    lastName,
  };

  return formattedUser;
};

export const userQueryAtom = atomWithQuery(() => ({
  queryKey: ["user"],
  queryFn: getUser,
  select: (user) => {
    const formattedUser = formatUser(user);

    return formattedUser;
  },

  retry: (failureCount, error) => {
    // Don't retry auth errors - interceptor handles these
    if (error?.response?.status === 401) return false;

    // Don't retry client errors (4xx except 401)
    if (error?.response?.status >= 400 && error?.response?.status < 500) {
      return false;
    }

    // Retry network errors and server errors (5xx) up to 3 times
    if (
      error?.errorType === "NETWORK_ERROR" ||
      error?.response?.status >= 500
    ) {
      return failureCount < 3;
    }

    return false;
  },

  // Exponential backoff for retries
  retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

  staleTime: 5 * 60 * 1000, // 5 minutes
  cacheTime: 10 * 60 * 1000, // 10 minutes
}));
