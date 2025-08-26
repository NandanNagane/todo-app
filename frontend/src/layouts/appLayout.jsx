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
import { useAtom, useSetAtom } from "jotai";
import { useEffect } from "react";
import userAtom from "../store/atoms/userAtom";
import { getUser } from "../api/axios";
import { useNavigate } from "react-router-dom";
import sidebarAtom from "../store/atoms/sidebarAtom";
import { useQuery } from "@tanstack/react-query";

export default function AppLayout() {
  const setUser = useSetAtom(userAtom);
  const navigate = useNavigate();

  const { data: user, isLoading, isError } = useQuery({
    queryKey: ["user"],
    queryFn: getUser,
    retry: false, // Don't retry on auth errors
  });

  useEffect(() => {
    if (user) {
      setUser(user);
    }
    if (isError) {
      // If we can't get the user, they are not logged in.
      navigate("/auth/login");
    }
  }, [user, isError, setUser, navigate]);

  const [isSidebarOpen, setIsSidebarOpen] = useAtom(sidebarAtom);

  if (isLoading) {
    return <div>Loading...</div>; // Or a proper loading skeleton
  }

  return (
    <SidebarProvider open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
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
