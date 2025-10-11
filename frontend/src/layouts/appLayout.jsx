import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { NavActions } from "@/components/sidebar/nav-actions";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useEffect } from "react";
import { userQueryAtom } from "../store/atoms/userQueryAtom";
import { useUser } from "../hooks/useUser";
import { ErrorBoundary, useErrorBoundary } from "react-error-boundary";
import RootErrorFallbackpage from "../pages/RootErrorCallbackPage";
import { LoaderOne } from "@/components/ui/loader";
import SessionExpiredView from "@/components/session-expiredView";
import { ModeToggle } from "@/components/mode-toggle";
import { Outlet } from "react-router-dom";

export default function AppLayout() {
  const { isLoading, isError, error, isAuthenticated } = useUser();

  const { showBoundary } = useErrorBoundary();
  useEffect(() => {
    if (isError && error) {
      // Trigger error boundary for critical errors
      if (error?.response?.status === 500) {
        showBoundary(
          new Error("Critical server error. Please contact support.")
        );
      }

      // Trigger for data corruption
      if (error?.message?.includes("corrupted")) {
        showBoundary(
          new Error("Data corruption detected. Please refresh the page.")
        );
      }

      // Network errors with no response
      if (!error?.response && error?.code === "NETWORK_ERROR") {
        showBoundary(
          new Error(
            "Network connection failed. Please check your internet connection."
          )
        );
      }
    }
  }, [isError, error, showBoundary]);

  if (isLoading)
    return (
      <div className="h-screen flex justify-center items-center">
        <LoaderOne />
      </div>
    );
  if (!isAuthenticated)
    return (
      <div>
        <SessionExpiredView />
      </div>
    );

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2">
          <div className={`flex flex-1 items-center gap-2 px-3 `}>
            <SidebarTrigger />
          </div>
          <div className="ml-auto px-3">
            <ModeToggle />
          </div>
        </header>
        <main className="flex flex-1 flex-col overflow-auto">
          <div className="flex-1 px-8 py-6 max-w-5xl w-full mx-auto">
            <Outlet />
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
