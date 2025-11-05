import { createContext, useContext } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getUser } from '@/api/auth';
import { LoaderOne } from '@/components/ui/loader';
import SessionExpiredView from '@/components/session-expiredView';

const AuthContext = createContext(null);

/**
 * Formats the user object received from the backend to match frontend needs.
 */
const formatUser = (user) => {
  if (!user) return null;

  const { userName, _id } = user;
  const firstName = userName?.split(" ")[0];
  const lastName = userName?.split(" ")[1];

  return {
    ...user,
    id: _id,
    firstName,
    lastName,
  };
};

export function AuthProvider({ children }) {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['user'],
    queryFn: async () => { 
      const response = await getUser();
      return response;
    },
    retry: false,
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  // Loading state - show while fetching user
  if (isLoading) {
    return (
      <div className="h-screen flex justify-center items-center">
        <LoaderOne />
      </div>
    );
  }

  // Error state - token expired or invalid
  if (isError) {
    // 401 errors mean session expired
    if (error?.response?.status === 401) {
      return <SessionExpiredView />;
    }
    
    // Network or server errors
    return (
      <div className="h-screen flex justify-center items-center">
        <div className="text-center space-y-4">
          <p className="text-destructive">Failed to load user data</p>
          <p className="text-sm text-muted-foreground">
            {error?.message || "Please try again"}
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Success - provide user to app
  const user = formatUser(data);
  
  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Custom hook to access auth context
 * Usage: const { user, isAuthenticated } = useAuth();
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
