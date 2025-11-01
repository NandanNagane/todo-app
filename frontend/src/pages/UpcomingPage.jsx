import { useEffect } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import { useAtom } from "jotai";
import { getTasks } from "@/api/task";
import { toggleTaskMutationAtom } from "@/store/atoms/taskMutationAtoms";
import { Button } from "@/components/ui/button";
import { AddTaskDialog } from "@/components/dialogs/AddTaskDialog";
import { Plus, Circle, CheckCircle2, Calendar, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { format, parseISO, isThisWeek, isThisMonth, addDays } from "date-fns";

export default function UpcomingPage() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  } = useInfiniteQuery({
    queryKey: ["tasks", "upcoming"],
    queryFn: ({ pageParam = 1 }) =>
      getTasks({ view: "upcoming", page: pageParam, limit: 20 }),
    getNextPageParam: (lastPage) => {
      const { pagination } = lastPage;
      return pagination?.hasNextPage ? pagination.page + 1 : undefined;
    },
    initialPageParam: 1,
    staleTime: 1 * 60 * 1000,
  });

  const [{ mutate: toggleTask }] = useAtom(toggleTaskMutationAtom);

  // Intersection observer for infinite scroll
  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleToggleTask = (taskId) => {
    toggleTask(taskId, {
      onSuccess: () => {
        toast.success("Task completed!");
      },
      onError: (error) => {
        toast.error(error?.response?.data?.message || "Failed to update task");
      },
    });
  };

  // Flatten all pages into a single array
  const allTasks = data?.pages.flatMap((page) => page.data) ?? [];

  // Group tasks by date
  const groupedTasks = groupTasksByDate(allTasks);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="flex flex-col h-full">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Upcoming</h1>
        </div>
        <div className="text-sm text-destructive py-8 text-center">
          {error?.response?.data?.message || "Failed to load tasks"}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Upcoming</h1>
        <div className="flex items-center text-sm text-muted-foreground">
          <Calendar className="size-4 mr-2" />
          <span>{allTasks.length} {allTasks.length === 1 ? 'task' : 'tasks'}</span>
        </div>
      </div>

      {/* Task Groups */}
      {allTasks.length === 0 ? (
        <div className="text-sm text-muted-foreground py-8 text-center">
          No upcoming tasks
        </div>
      ) : (
        <div className="space-y-6 mb-4">
          {Object.entries(groupedTasks).map(([dateLabel, tasks]) => (
            <div key={dateLabel}>
              <h2 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
                {dateLabel}
              </h2>
              <div className="space-y-1">
                {tasks.map((task) => (
                  <TaskCard
                    key={task._id}
                    task={task}
                    onToggle={handleToggleTask}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Loading indicator for infinite scroll */}
      <div ref={ref} className="py-4 text-center">
        {isFetchingNextPage && (
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mx-auto" />
        )}
      </div>

      {/* Add Task Button */}
      <AddTaskDialog>
        <Button
          variant="ghost"
          className="justify-start text-muted-foreground hover:text-foreground hover:bg-accent/50 w-full mt-4"
        >
          <Plus className="size-4 text-red-500" />
          <span>Add task</span>
        </Button>
      </AddTaskDialog>
    </div>
  );
}

function TaskCard({ task, onToggle }) {
  return (
    <div className="group flex items-start gap-3 py-2 px-2 rounded-md hover:bg-accent/50 transition-colors cursor-pointer border-b border-border/40">
      {/* Checkbox */}
      <button onClick={() => onToggle(task._id)} className="mt-1 flex-shrink-0">
        {task.completed ? (
          <CheckCircle2 className="size-5 text-green-600" />
        ) : (
          <Circle className="size-5 text-muted-foreground hover:text-foreground transition-colors" />
        )}
      </button>

      {/* Task Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-normal">
          {task.title}
        </p>

        {task.description && (
          <p className="text-xs text-muted-foreground mt-1">
            {task.description}
          </p>
        )}

        <div className="flex items-center gap-3 mt-1">
          {/* Due Date */}
          {task.dueDate && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="size-3" />
              <span>{format(parseISO(task.dueDate), "MMM d")}</span>
            </div>
          )}

          {/* Priority Badge */}
          {task.priority && task.priority !== "medium" && (
            <span
              className={cn(
                "inline-block text-xs px-2 py-0.5 rounded",
                task.priority === "urgent" &&
                  "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
                task.priority === "high" &&
                  "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
                task.priority === "low" &&
                  "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
              )}
            >
              {task.priority}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper function to group tasks by date
function groupTasksByDate(tasks) {
  const groups = {};
  const tomorrow = addDays(new Date(), 1);
  tomorrow.setHours(0, 0, 0, 0);

  tasks.forEach((task) => {
    if (!task.dueDate) {
      if (!groups["No Date"]) groups["No Date"] = [];
      groups["No Date"].push(task);
      return;
    }

    const dueDate = parseISO(task.dueDate);
    let dateLabel;

    // Tomorrow
    const tomorrowDate = new Date(tomorrow);
    if (
      dueDate.getDate() === tomorrowDate.getDate() &&
      dueDate.getMonth() === tomorrowDate.getMonth() &&
      dueDate.getFullYear() === tomorrowDate.getFullYear()
    ) {
      dateLabel = "Tomorrow";
    }
    // This week
    else if (isThisWeek(dueDate, { weekStartsOn: 1 })) {
      dateLabel = format(dueDate, "EEEE"); // "Monday", "Tuesday", etc.
    }
    // This month
    else if (isThisMonth(dueDate)) {
      dateLabel = format(dueDate, "EEEE, MMM d"); // "Monday, Oct 30"
    }
    // Future months
    else {
      dateLabel = format(dueDate, "MMMM yyyy"); // "November 2025"
    }

    if (!groups[dateLabel]) {
      groups[dateLabel] = [];
    }
    groups[dateLabel].push(task);
  });

  return groups;
}
