import { createBrowserRouter, Navigate } from "react-router-dom";

import { authRoutes } from "./auth.routes";
import { appRoutes } from "./app.routes";
import AppLayout from "../layouts/appLayout";

import RouteErrorPage from "../pages/RouteErrorPage";
import RootErrorFallbackpage from "../pages/RootErrorCallbackPage";
import { ErrorBoundary } from "react-error-boundary";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/providers/AuthProvider";

export const router = createBrowserRouter([
  {
    path: "/",
    errorElement: <RouteErrorPage />,
    children: [
      {
        index: true,
        element: <Navigate to="/auth/register" replace />,
      },
      {
        path: "auth",
        children: authRoutes,
      },
      {
        path: "app",
        element: (
          <AuthProvider>
            <ThemeProvider storageKey="vite-ui-theme">
              <ErrorBoundary FallbackComponent={RootErrorFallbackpage}>
                <AppLayout />
              </ErrorBoundary>
            </ThemeProvider>
          </AuthProvider>
        ),
        children: appRoutes,
      },
    ],
  },
]);
