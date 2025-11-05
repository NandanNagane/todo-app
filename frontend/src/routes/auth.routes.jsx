import LoginPage from "@/pages/LoginPage";
import SignUpPage from "@/pages/SignupPage";
import { AuthGuard } from "@/components/auth/AuthGuard";

export const authRoutes = [
  {
    element: <AuthGuard />,
    children: [
      {
        path: "register",
        element: <SignUpPage />,
      },
      {
        path: "login",
        element: <LoginPage />,
      },
    ],
  },
];
