// queryClient.js - Enhanced with error monitoring
import { QueryClient } from "@tanstack/react-query";
import { handleQueryError } from "../lib/errorHandler";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,

   onError: (error, query) => {
        handleQueryError(error, query.queryKey[0]);
      },
    },
  },
});
