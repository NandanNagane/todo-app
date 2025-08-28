import LoginPage from "@/src/pages/LoginPage";
import SignUpPage from "@/src/pages/signupPage";

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
