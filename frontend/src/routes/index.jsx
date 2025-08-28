import { createBrowserRouter, Navigate } from "react-router-dom";


import { authRoutes } from "./auth.routes";
import { appRoutes } from "./app.routes";
import AppLayout from "../layouts/appLayout";
import ErrorPage from "../pages/ErrorPage";


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
        element: <AppLayout />,
        children: appRoutes
      },
    ],
  },
]);
