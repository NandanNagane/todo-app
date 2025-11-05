import * as React from "react";
import {
  AudioWaveform,
  Blocks,
  Calendar,
  CalendarDays,
  CheckCircle,
  Command,
  Filter,
  Hash,
  Home,
  Inbox,
  MessageCircleQuestion,
  Plus,
  Search,
  Settings2,
  Sparkles,
  Trash2,
  Grid3X3,
  BookOpen,
  HomeIcon,
} from "lucide-react";

import { NavMain } from "@/components/sidebar/nav-main";
import { NavSecondary } from "@/components/sidebar/nav-secondary";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";

import { Profile } from "./profile";
import { useQuery } from "@tanstack/react-query";
import { getTasks } from "@/api/task";

export function AppSidebar({ ...props }) {
  // Fetch incomplete tasks count for badge
  const { data: inboxData } = useQuery({
    queryKey: ["tasks", "incomplete"],
    queryFn: () => getTasks({ completed: false }),
    staleTime: 1 * 60 * 1000,
  });

  const inboxCount = inboxData?.data?.length || 0;

  const data = {
    actionButtons: [
      {
        title: "Add task",
        url: "#",
        icon: Plus,
      },
      {
        title: "Search",
        url: "#",
        icon: Search,
      },
    ],
    navMain: [
      {
        title: "Inbox",
        url: "/app/inbox",
        icon: Inbox,
        badge: inboxCount > 0 ? String(inboxCount) : undefined,
   
      },
      {
        title: "Completed",
        url: "/app/completed",
        icon: CheckCircle,
      },
    ],
  };

  return (
    <Sidebar className="border-r-0 pt-1.5 " {...props}>
      <SidebarHeader>
        <div className="flex relative ">
          <Profile />
        </div>
        <NavMain
          items={{
            actionButtons: data.actionButtons,
            navMain: data.navMain,
          }}
        />
      </SidebarHeader>
      <SidebarRail />
    </Sidebar>
  );
}
