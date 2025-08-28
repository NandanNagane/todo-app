import { AppSidebar } from "@/components/app-sidebar";
import { NavActions } from "@/components/nav-actions";
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
import { useUser } from "../Custom_hooks/useUser";

export default function AppLayout() {

  const { isLoading, isError, error, isAuthenticated } = useUser();

  
// if (!isAuthenticated) return <UnauthorizedError />;
// if (isError) return <ErrorComponent error={error} />;

  if (isLoading) {
    return <div>Loading...</div>; // Or a proper loading skeleton
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2">
          <div className={`flex flex-1 items-center gap-2 px-3 `}>
            <SidebarTrigger />

            {/* <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            /> */}
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage
                    className={`line-clamp-1 `}
                    onClick={() => console.log("clicked")}
                  >
                    Project Management & Task Tracking
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="ml-auto px-3">
            <NavActions />
          </div>
        </header>
      </SidebarInset>
    </SidebarProvider>
  );
}
