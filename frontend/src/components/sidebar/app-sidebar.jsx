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

import { NavFavorites } from "@/components/sidebar/nav-MyProjects";
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
import { useAtomValue } from "jotai";
import { useEffect } from "react";
import { useUser } from "@/hooks/useUser";
import { useErrorBoundary } from "react-error-boundary";

// This is sample data.
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
      badge: "2",
    },
    {
      title: "Today",
      url: "/app/today",
      icon: CalendarDays,
      badge: "2",
      isActive: true,
    },
    {
      title: "Upcoming",
      url: "/app/upcoming",
      icon: Calendar,
    },
    {
      title: "Filters & Labels",
      url: "#",
      icon: Grid3X3,
    },
    {
      title: "Completed",
      url: "/app/completed",
      icon: CheckCircle,
    },
  ],

  myProjects: [
    {
      name: "Education",
      url: "#",
      emoji: "�",
      badge: "1",
    },
    {
      name: "Home",
      url: "#",
      emoji: "🏠",
      badge: "2",
    },
    {
      name: "Class Planning",
      url: "#",
      emoji: "",
      badge: "18",
    },
  ],
};

export function AppSidebar({ ...props }) {

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
      <SidebarContent>
        <NavFavorites myProjects={data.myProjects} /> 
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
