// queryClient.js - Enhanced with error monitoring
import { QueryClient } from "@tanstack/react-query";
import { handleQueryError } from "../lib/errorHandler";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache settings - more aggressive defaults
      staleTime: 5 * 60 * 1000,        // 5 minutes default
      gcTime: 10 * 60 * 1000,          // 10 minutes (renamed from cacheTime)
      
      // Refetch settings - prevent unnecessary refetches
      refetchOnWindowFocus: false,     // Don't refetch when tab gains focus
      refetchOnMount: false,           // Don't refetch when component mounts
      refetchOnReconnect: false,       // Don't refetch on network reconnect
      
      // Error handling
      retry: 1,                        // Only retry once on failure
      
      onError: (error, query) => {
        handleQueryError(error, query.queryKey[0]);
      },
    },
  },
});
