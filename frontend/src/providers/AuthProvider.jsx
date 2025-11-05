import { useQuery } from "@tanstack/react-query";
import { getUser } from "@/api/auth";
import { createContext, useContext, useMemo } from "react";
import SessionExpiredView from "@/components/session-expiredView";
import { LoaderOne } from "@/components/ui/loader";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const isProtectedRoute = window.location.pathname.startsWith('/app');

  const { data: user, isLoading, isError } = useQuery({
    queryKey: ["user"],
    queryFn: getUser,
    retry: false,
    staleTime: Infinity,
    gcTime: Infinity, // ✅ Prevent garbage collection
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    networkMode: 'offlineFirst', // ✅ Use cache first, even if network is available
  });

  // Memoize context value to prevent re-renders
  const contextValue = useMemo(() => ({ user }), [user]);

  // Don't block rendering on auth routes
  if (!isProtectedRoute) {
    return (
      <AuthContext.Provider value={contextValue}>
        {children}
      </AuthContext.Provider>
    );
  }

  // Protected routes - handle auth states
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoaderOne />
      </div>
    );
  }

  if (isError) {
    return <SessionExpiredView />;
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
