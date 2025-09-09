import { createBrowserRouter, Navigate } from "react-router-dom";


import { authRoutes } from "./auth.routes";
import { appRoutes } from "./app.routes";
import AppLayout from "../layouts/appLayout";

import RouteErrorPage from "../pages/RouteErrorPage";
import RootErrorFallbackpage from "../pages/RootErrorCallbackPage";
import { ErrorBoundary } from "react-error-boundary";
import { ThemeProvider } from "@/components/theme-provider";



export const router = createBrowserRouter([
  {
    path: "/",
    // element: <RootLayout />,
       errorElement: <RouteErrorPage />,// <-- Common error page for all children
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
        element: (
              <ThemeProvider>
            <ErrorBoundary FallbackComponent={RootErrorFallbackpage}>
            <AppLayout />
          </ErrorBoundary>
          </ThemeProvider>
        ),
        children: appRoutes,
      
      },
    ],
  },
]);
