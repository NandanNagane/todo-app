import { createBrowserRouter, Navigate } from "react-router-dom";
import { authRoutes } from "./features/auth/auth.routes";
import ErrorPage from "./pages/ErrorPage";
import todayPage from "./pages/todayPage";
import AppLayout from "./layouts/appLayout";

export const router = createBrowserRouter([
  {
    path: "/",
    // element: <RootLayout />,
    errorElement: <ErrorPage />, // <-- Common error page for all children
    children: [
      {
        index: true, // This is the new way to handle the root path "/"
        element: <Navigate to="/auth/register" replace />,
      },
      {
        path: "auth", // Spread your auth routes under a common path
        children: authRoutes,
      },
      {
        path: "app",
        element: <AppLayout/>,
        children: [
          {
            path: "today",
            element: <todayPage/>,
         
          },
        ],
      },
    ],
  },
]);
