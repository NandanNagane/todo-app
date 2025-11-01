import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Search, Clock, Inbox, CalendarDays, Home, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { getTasks } from "@/api/task";

export function SearchDialog({ children }) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // ✅ Only fetch when dialog is open
  const { data } = useQuery({
    queryKey: ["tasks", "all"],
    queryFn: () => getTasks({ view: "all" }),
    enabled: open, // 🔥 Key change - only fetch when dialog opens
    staleTime: 5 * 60 * 1000,
  });

  const taskList = data?.data ?? [];

  // Detect if user is on Mac
  const isMac =
    navigator.userAgentData?.platform === "macOS" ||
    navigator.platform.toUpperCase().indexOf("MAC") >= 0;

  // Keyboard shortcut handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Command+K (Mac) or Ctrl+K (Windows/Linux)
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Filter tasks based on search query
  const filteredTasks = taskList.filter(
    (task) =>
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.description &&
        task.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Recent searches (you can implement this with localStorage)
  const recentSearches = [
    "2025-08-22",
    "2025-10-01",
    "2025-10-08",
    "2025-09-13",
  ];

  // Recently viewed items
  const recentlyViewed = [
    { title: "Inbox", icon: Inbox },
    { title: "Today", icon: CalendarDays },
  ];

  const clearSearch = () => {
    setSearchQuery("");
  };

  const clearRecentSearches = () => {
    // Implementation for clearing recent searches
    console.log("Clear recent searches");
  };

  const handleTaskClick = (taskId) => {
    // Handle task navigation
    console.log("Navigate to task:", taskId);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        className="p-0 max-w-2xl bg-background border-border"
        showCloseButton={false}
      >
        <DialogHeader className="p-4 pb-2">
          <DialogTitle className="sr-only">
            Search tasks and navigate
          </DialogTitle>
          <div className="flex items-center gap-3 w-full">
            <Search className="size-5 text-muted-foreground flex-shrink-0" />
            <input
              placeholder="Search or type a command..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent border-0 outline-none text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0"
              autoFocus
            />
            <div className="flex items-center gap-1 flex-shrink-0">
              <kbd className="pointer-events-none inline-flex h-5 select-none items-center rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                {isMac ? "⌘" : "Ctrl"}
              </kbd>
              <kbd className="pointer-events-none inline-flex h-5 select-none items-center rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                K
              </kbd>
            </div>
          </div>
        </DialogHeader>

        <div className="max-h-96 overflow-y-auto">
          {searchQuery ? (
            // Search Results
            <div className="p-4 pt-0">
              {filteredTasks.length > 0 ? (
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground mb-2">
                    Tasks ({filteredTasks.length})
                  </p>
                  {filteredTasks.map((task) => (
                    <Button
                      key={task._id}
                      variant="ghost"
                      className="w-full justify-start h-auto p-2 text-left"
                      onClick={() => handleTaskClick(task._id)}
                    >
                      <div className="flex items-start gap-2 w-full">
                        <div
                          className={cn(
                            "size-2 rounded-full mt-2 flex-shrink-0",
                            task.completed
                              ? "bg-green-500"
                              : "bg-muted-foreground"
                          )}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">
                            {task.title}
                          </p>
                          {task.description && (
                            <p className="text-xs text-muted-foreground truncate">
                              {task.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground">
                    No tasks found for "{searchQuery}"
                  </p>
                </div>
              )}
            </div>
          ) : (
            // Default content when no search query
            <div className="p-4 pt-0 space-y-4">
              {/* Recent searches */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-medium text-muted-foreground">
                    Recent searches
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
                    onClick={clearRecentSearches}
                  >
                    Clear
                  </Button>
                </div>
                <div className="space-y-1">
                  {recentSearches.map((search, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      className="w-full justify-between h-auto p-2"
                      onClick={() => setSearchQuery(search)}
                    >
                      <div className="flex items-center gap-2">
                        <Clock className="size-4 text-muted-foreground" />
                        <span className="text-sm">{search}</span>
                      </div>
                      <X className="size-4 text-muted-foreground" />
                    </Button>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Recently viewed */}
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  Recently viewed
                </p>
                <div className="space-y-1">
                  {recentlyViewed.map((item, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      className="w-full justify-start h-auto p-2"
                    >
                      <item.icon className="size-4 mr-2 text-muted-foreground" />
                      <span className="text-sm">{item.title}</span>
                    </Button>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Navigation */}
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  Navigation
                </p>
                <Button
                  variant="ghost"
                  className="w-full justify-between h-auto p-2"
                >
                  <div className="flex items-center gap-2">
                    <Home className="size-4 text-muted-foreground" />
                    <span className="text-sm">Go to home</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <kbd className="pointer-events-none inline-flex h-4 select-none items-center gap-1 rounded border bg-muted px-1 font-mono text-[10px] font-medium">
                      G
                    </kbd>
                    <span className="text-xs text-muted-foreground">then</span>
                    <kbd className="pointer-events-none inline-flex h-4 select-none items-center gap-1 rounded border bg-muted px-1 font-mono text-[10px] font-medium">
                      H
                    </kbd>
                  </div>
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
