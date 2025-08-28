import { useSearchParams } from "react-router-dom";
import LoginForm from "../components/auth/LoginForm";
import { toast } from "sonner";
import { useEffect } from "react";
import { handleRedirectError } from "../utils/errorHandler";

export default function LoginPage() {
  //we are handling redirect errors from social logins  here 
  const [searchParams, setSearchParams] = useSearchParams();

  // This hook runs once when the component loads
  useEffect(() => {
    const error = searchParams.get("error");

    // Check if there is an error we need to handle
    if (error) {

      handleRedirectError(error);

      setSearchParams(
        (prevParams) => {
          prevParams.delete("error");
          return prevParams;
        },
        { replace: true }
      );
    }
  }, [searchParams, setSearchParams]);

  return (
    <>
      <LoginForm />
    </>
  );
}
