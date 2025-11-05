import InboxPage from "@/pages/InboxPage";
import CompletedPage from "@/pages/CompletedPage";
import { Inbox, CheckCircle2 } from "lucide-react";


export const appRoutes = [
  {
    index: true,
    path: "inbox",
    element: <InboxPage />,
    handle: {
      title: "Inbox",
      icon: Inbox,
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
