import InboxPage from "@/pages/InboxPage";
import TodayPage from "../pages/todayPage";
import CompletedPage from "@/pages/CompletedPage";
import UpcomingPage from "@/pages/UpcomingPage";
import { Calendar, Inbox, CalendarCheck, CheckCircle2 } from "lucide-react";


export const appRoutes = [
  {
    index: true,
    path: "today",
    element: <TodayPage />,
    handle: {
      title: "Today",
      icon: Calendar,
    },
  },
  {
    path: "inbox",
    element: <InboxPage />,
    handle: {
      title: "Inbox",
      icon: Inbox,
    },
  },
  {
    path: "upcoming",
    element: <UpcomingPage />,
    handle: {
      title: "Upcoming",
      icon: CalendarCheck,
    },
  },
  {
    path: "completed",
    element: <CompletedPage />,
    handle: {
      title: "Completed",
      icon: CheckCircle2,
    },
  },

];
