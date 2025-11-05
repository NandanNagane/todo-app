import { useQuery } from "@tanstack/react-query";
import { Navigate, Outlet } from "react-router-dom";
import { LoaderOne } from "@/components/ui/loader";
import { getUser } from "@/api/auth";

/**
 * AuthGuard: Redirects authenticated users away from auth pages
 * Used to wrap login/signup routes to prevent authenticated users
 * from accessing them. If user is already logged in, redirects to /app/inbox
 * 
 * Note: Uses separate query from AuthProvider to check auth status
 * without triggering the full auth flow
 */
export function AuthGuard() {
  const { data, isLoading } = useQuery({
    queryKey: ['user'],
    queryFn: getUser,
    retry: false,
    staleTime: Infinity,
  });

  // Show loader while checking authentication
  if (isLoading) {
    return (
      <div className="h-screen flex justify-center items-center">
        <LoaderOne />
      </div>
    );
  }

  // If already authenticated, redirect to app
  if (data) {
    return <Navigate to="/app/inbox" replace />;
  }

  // Not authenticated, allow access to auth pages
  return <Outlet />;
}
