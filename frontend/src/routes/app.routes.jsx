import InboxPage from "@/pages/InboxPage";
import TodayPage from "../pages/todayPage";


export const appRoutes = [
  {
    index: true,
    path: "today",
    element: <TodayPage />,
  },
  {
    path: "inbox",
    element: <InboxPage />,
  },

];
