import LoginPage from "@/pages/LoginPage";
import SignUpPage from "@/pages/SignupPage";

export const authRoutes = [
  {
    path: "register",
    element: <SignUpPage />,
  },
  {
    path: "login",
    element: <LoginPage />,
  },
];
