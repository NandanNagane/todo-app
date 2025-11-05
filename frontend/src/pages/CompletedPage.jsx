import { useInfiniteQuery } from "@tanstack/react-query";
import { useAtom } from "jotai";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useRef, useEffect, useState } from "react";
import { getTasks } from "@/api/task";
import { toggleTaskMutationAtom, deleteTaskMutationAtom } from "@/store/atoms/taskMutationAtoms";
import { TaskDetailsDialog } from "@/components/dialogs/TaskDetailsDialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2, RotateCcw, Trash2 } from "lucide-react";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import { groupTasksByCompletionDate } from "@/lib/groupTasksByCompletionDate";

// TaskGroup removed - virtualization will handle headers inline

function CompletedTaskCard({ task, onUncomplete, onDelete, onEdit }) {
  const formatDate = (dateString) => {
    if (!dateString) return null;
    try {
      return format(parseISO(dateString), "MMM d, yyyy");
    } catch {
      return null;
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return null;
    try {
      return format(parseISO(dateString), "h:mm a");
    } catch {
      return null;
    }
  };

  return (
    <Card className="border-l-4 border-l-green-600 group hover:shadow-md transition-shadow mb-2">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
          <div 
            className="flex-1 min-w-0 cursor-pointer"
            onClick={() => onEdit(task)}
          >
            <p className="text-base text-muted-foreground">
              {task.title}
            </p>
            {task.description && (
              <p className="text-sm text-muted-foreground mt-1">
                {task.description}
              </p>
            )}
            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
              {task.completedAt && (
                <span>
                  Completed {formatTime(task.completedAt)}
                </span>
              )}
              {task.dueDate && (
                <span>
                  Due: {formatDate(task.dueDate)}
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onUncomplete(task._id)}
              title="Mark as incomplete"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => onDelete(task._id, e)}
              title="Delete task"
              className="hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive transition-colors" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-96 text-center">
      <CheckCircle2 className="h-16 w-16 text-muted-foreground/50 mb-4" />
      <h3 className="text-xl font-semibold mb-2">No completed tasks yet</h3>
      <p className="text-muted-foreground max-w-sm">
        Tasks you complete will appear here. Start checking off your to-dos!
      </p>
    </div>
  );
}

export default function CompletedPage() {
  const parentRef = useRef(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);

  // ✅ PAGINATION: Fetch data in chunks (network efficiency)
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  } = useInfiniteQuery({
    queryKey: ["tasks", "completed"],
    queryFn: ({ pageParam = 1 }) =>
      getTasks({ completed: true, page: pageParam, limit: 50 }),
    getNextPageParam: (lastPage) => {
      const { pagination } = lastPage;
      return pagination?.hasNextPage ? pagination.page + 1 : undefined;
    },
    initialPageParam: 1,
    staleTime: 5 * 60 * 1000,
  });

  const [{ mutate: toggleTask }] = useAtom(toggleTaskMutationAtom);
  const [{ mutate: deleteTask }] = useAtom(deleteTaskMutationAtom);

  // Flatten all pages into single array (do this before early returns)
  const allTasks = data?.pages?.flatMap((page) => page.data) ?? [];

  // Group tasks by completion date
  const groupedTasks = groupTasksByCompletionDate(allTasks);

  // Flatten for virtualization: [header, task, task, header, task, ...]
  const flatItems = Object.entries(groupedTasks).flatMap(([date, tasks]) => [
    { type: "header", date },
    ...tasks.map((task) => ({ type: "task", task })),
  ]);

  // ✅ VIRTUALIZATION: Only render visible items (DOM efficiency)
  const virtualizer = useVirtualizer({
    count: flatItems.length,
    getScrollElement: () => parentRef.current,
    estimateSize: (index) => {
      const item = flatItems[index];
      return item.type === "header" ? 50 : 120; // Headers: 50px, Tasks: 120px
    },
    overscan: 10, // Render 10 extra items above/below viewport
  });

  // ✅ PAGINATION + VIRTUALIZATION: Auto-fetch next page when scrolling near bottom
  const virtualItems = virtualizer.getVirtualItems();
  const lastItem = virtualItems[virtualItems.length - 1];

  useEffect(() => {
    if (!lastItem) return;

    // Fetch next page when user is 20 items away from bottom
    if (
      lastItem.index >= flatItems.length - 20 &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      fetchNextPage();
    }
  }, [lastItem, flatItems.length, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleUncomplete = (taskId) => {
    toggleTask(taskId, {
      onSuccess: () => {
        toast.success("Task marked as incomplete");
      },
      onError: (error) => {
        toast.error(error?.response?.data?.message || "Failed to update task");
      },
    });
  };

  const handleDeleteTask = (taskId, e) => {
    e.stopPropagation();
    deleteTask(taskId, {
      onSuccess: () => {
        toast.success("Task deleted");
      },
      onError: (error) => {
        toast.error(error?.response?.data?.message || "Failed to delete task");
      },
    });
  };

  const handleViewTask = (task) => {
    setSelectedTask(task);
    setIsDetailsDialogOpen(true);
  };

  // Early returns AFTER all hooks
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-destructive">
          {error?.response?.data?.message || "Failed to load completed tasks"}
        </p>
      </div>
    );
  }

  if (allTasks.length === 0) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
            Completed
          </h1>
        </div>
        <EmptyState />
      </div>
    );
  }

  return (
    <div 
      ref={parentRef}
      className="container mx-auto p-6 max-w-4xl overflow-auto"
    >
      {/* Fixed Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <CheckCircle2 className="h-8 w-8 text-green-600" />
          Completed
        </h1>
        <p className="text-muted-foreground mt-2">
          {allTasks.length} completed {allTasks.length === 1 ? "task" : "tasks"}
          {data?.pages[0]?.total && allTasks.length < data.pages[0].total && (
            <span className="text-xs ml-2">
              (of {data.pages[0].total} total)
            </span>
          )}
          {isFetchingNextPage && " (loading more...)"}
        </p>
      </div>

      {/* Virtualized Content */}
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: "100%",
          position: "relative",
        }}
      >
        {/* Only render visible items */}
        {virtualizer.getVirtualItems().map((virtualItem) => {
          const item = flatItems[virtualItem.index];

          return (
            <div
              key={virtualItem.key}
              data-index={virtualItem.index}
              ref={virtualizer.measureElement}
              className="absolute top-0 left-0 w-full"
              style={{
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              {item.type === "header" ? (
                <h2 className="text-sm font-semibold text-muted-foreground mb-3 mt-6 uppercase tracking-wide">
                  {item.date}
                </h2>
              ) : (
                <CompletedTaskCard
                  task={item.task}
                  onUncomplete={handleUncomplete}
                  onDelete={handleDeleteTask}
                  onEdit={handleViewTask}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Loading indicator */}
      {isFetchingNextPage && (
        <div className="flex justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* End message */}
      {!hasNextPage && allTasks.length > 0 && (
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground">
            All completed tasks loaded
          </p>
        </div>
      )}

      {/* Task Details Dialog */}
      <TaskDetailsDialog
        task={selectedTask}
        open={isDetailsDialogOpen}
        onOpenChange={setIsDetailsDialogOpen}
        onUncomplete={handleUncomplete}
        onDelete={handleDeleteTask}
      />
    </div>
  );
}





