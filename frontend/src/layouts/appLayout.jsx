import { AppSidebar } from "@/components/sidebar/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useEffect, useState } from "react";
import { useUser } from "../hooks/useUser";
import { useErrorBoundary } from "react-error-boundary";
import { LoaderOne } from "@/components/ui/loader";
import SessionExpiredView from "@/components/session-expiredView";
import { ModeToggle } from "@/components/mode-toggle";
import { Outlet, useMatches } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useInView } from "react-intersection-observer";

export default function AppLayout() {
  const { isLoading, isError, error, isAuthenticated } = useUser();
  const matches = useMatches();

  // Get current page title from route handle
  const currentRoute = matches[matches.length - 1];
  const pageTitle = currentRoute?.handle?.title;
  const PageIcon = currentRoute?.handle?.icon;

  const { showBoundary } = useErrorBoundary();

  // Use Intersection Observer to track when page heading scrolls out of view
  const { ref: headingRef, inView } = useInView({
    threshold: 0,
    initialInView: true,
  });

  // Show title in header when heading is not in view (scrolled up)
  const showTitleInHeader = !inView;

  // Handle critical errors via error boundary
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

  if (isLoading) {
    return (
      <div className="h-screen flex justify-center items-center">
        <LoaderOne />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div>
        <SessionExpiredView />
      </div>
    );
  }  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className={cn(
          "flex h-14 shrink-0 items-center gap-2 sticky top-0 z-10 bg-background transition-all duration-200",
          showTitleInHeader && "border-b"
        )}>
          <div className="flex flex-1 items-center gap-2 px-3">
            <SidebarTrigger />
            {/* Dynamic page title - appears when scrolled */}
            <div
              className={cn(
                "flex items-center w-full justify-center gap-2 font-semibold transition-all duration-200",
                showTitleInHeader
                  ? "opacity-100 -translate-y-0"
                  : "opacity-0 translate-y-4 pointer-events-none"
              )}
            >
              {PageIcon && <PageIcon className="h-4 w-4" />}
              <span>{pageTitle}</span>
            </div>
          </div>

          <div className="ml-auto px-3">
            <ModeToggle />
          </div>
        </header>
        <main className="flex-1">
          <div className="px-8 py-6 max-w-5xl w-full mx-auto">
            {/* Invisible sentinel element to track scroll position */}
            <div ref={headingRef} className="h-px -mb-px" />
            <Outlet />
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}