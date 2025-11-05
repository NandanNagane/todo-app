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
import { Search, Clock, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { getTasks } from "@/api/task";
import { useRecentSearches } from "@/hooks/useRecentSearches";

export function SearchDialog({ children }) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchCompleted, setSearchCompleted] = useState(false);
  
  const { recentSearches, addSearch, removeSearch, clearSearches } = useRecentSearches();

  // ✅ Only fetch active tasks when dialog is open
  const { data } = useQuery({
    queryKey: ["tasks", "incomplete"],
    queryFn: () => getTasks({ completed: false }), // Fetches non-completed tasks
    enabled: open,
    staleTime: 5 * 60 * 1000,
  });

  // ✅ Only fetch completed tasks when user explicitly searches them
  const { data: completedData } = useQuery({
    queryKey: ["tasks", "completed"],
    queryFn: () => getTasks({ completed: true }),
    enabled: open && searchCompleted, // Only fetch when user clicks "Search completed"
    staleTime: 5 * 60 * 1000,
  });

  const taskList = data?.data ?? [];
  const completedTaskList = completedData?.data ?? [];

  // Detect if user is on Mac
  const isMac =
    navigator.userAgentData?.platform === "macOS" ||
    navigator.platform.toUpperCase().indexOf("MAC") >= 0;

  // Keyboard shortcut handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Command+K (Mac) or Ctrl+K (Windows/Linux) - only opens dialog   
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (!open) {
          setOpen(true); // Only open, don't toggle
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  // Filter tasks based on search query
  const allTasks = searchCompleted ? completedTaskList : taskList;
  const filteredTasks = allTasks.filter(
    (task) =>
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.description &&
        task.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const clearSearch = () => {
    setSearchQuery("");
    setSearchCompleted(false); // Reset to active tasks
  };

  const handleRecentSearchClick = (search) => {
    setSearchQuery(search);
  };

  const handleRemoveRecentSearch = (e, search) => {
    e.stopPropagation(); // Prevent triggering the parent button's onClick
    removeSearch(search);
  };

  const handleTaskClick = (taskId) => {
    // Handle task navigation
    setOpen(false);
  };

  // Clear search when dialog closes
  const handleOpenChange = (isOpen) => {
    setOpen(isOpen);
    if (!isOpen) {
      clearSearch(); // Clear search query when dialog closes
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
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
              placeholder="Search for a task..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && searchQuery.trim()) {
                  addSearch(searchQuery);
                }
              }}
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
                <div className="text-center py-8 space-y-3">
                  <p className="text-sm text-muted-foreground">
                    No {searchCompleted ? "completed " : ""}tasks found for "{searchQuery}"
                  </p>
                  {!searchCompleted && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSearchCompleted(true)}
                      className="text-xs"
                    >
                      Search completed tasks
                    </Button>
                  )}
                  {searchCompleted && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSearchCompleted(false)}
                      className="text-xs"
                    >
                      ← Back to active tasks
                    </Button>
                  )}
                </div>
              )}
            </div>
          ) : (
            // Default content when no search query
            <div className="p-4 pt-0">
              {/* Recent searches */}
              {recentSearches.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-medium text-muted-foreground">
                      Recent searches
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
                      onClick={clearSearches}
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
                        onClick={() => handleRecentSearchClick(search)}
                      >
                        <div className="flex items-center gap-2">
                          <Clock className="size-4 text-muted-foreground" />
                          <span className="text-sm">{search}</span>
                        </div>
                        <X 
                          className="size-4 text-muted-foreground hover:text-foreground" 
                          onClick={(e) => handleRemoveRecentSearch(e, search)}
                        />
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
