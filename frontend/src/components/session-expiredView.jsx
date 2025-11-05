import { Button } from "./ui/button";

const SessionExpiredView = () => {
  const handleLoginRedirect = () => {
    window.location.href = "/auth/login";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          {/* Icon */}
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-destructive/10">
            <svg 
              className="h-6 w-6 text-destructive" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 15v2m0 0v2m0-2h2m-2 0H10m2-5V9.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
              />
            </svg>
          </div>
          
          {/* Main message */}
          <h2 className="mt-6 text-2xl font-bold text-foreground">
            Session Expired
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Your session has expired for security reasons. Please Log in again to continue.
          </p>
                    
          {/* Additional help */}
          <p className="mt-4 text-xs text-muted-foreground">
            This helps protect your account from unauthorized access.
          </p>
          
          {/* Login button */}
          <div className="mt-6">
            <Button 
              onClick={handleLoginRedirect}
              className="w-full"
            >
              Go to Login
            </Button>
            
          </div>
          
        </div>
      </div>
    </div>
  );
};


export default SessionExpiredView;