import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAtom } from "jotai";
import { getTasks } from "@/api/task";
import { toggleTaskMutationAtom, deleteTaskMutationAtom } from "@/store/atoms/taskMutationAtoms";
import { Button } from "@/components/ui/button";
import { AddTaskDialog } from "@/components/dialogs/AddTaskDialog";
import { ChevronRight, Plus, Circle, CheckCircle2, Calendar, Loader2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function TodayPage() {
  const [showOverdue, setShowOverdue] = useState(true);
  
  // Fetch all incomplete tasks and filter client-side for today
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["tasks", "incomplete"],
    queryFn: () => getTasks({ completed: false }),
    staleTime: 1 * 60 * 1000,
  });

  const [{ mutate: toggleTask }] = useAtom(toggleTaskMutationAtom);
  const [{ mutate: deleteTask }] = useAtom(deleteTaskMutationAtom);
  
  // Client-side filter for today's tasks
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const endOfDay = new Date(today);
  endOfDay.setHours(23, 59, 59, 999);
  
  const allTasks = data?.data ?? [];
  const tasks = allTasks.filter(task => {
    if (!task.dueDate) return false;
    const taskDate = new Date(task.dueDate);
    return taskDate >= today && taskDate <= endOfDay;
  });
  
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
  
  // Date formatting for display
  const formattedDate = today.toLocaleDateString('en-US', { 
    day: 'numeric', 
    month: 'short' 
  });
  const dayOfWeek = today.toLocaleDateString('en-US', { weekday: 'long' });

  const totalTasks = tasks.length;

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
          <h1 className="text-3xl font-bold">Today</h1>
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
        <h1 className="text-3xl font-bold mb-2">Today</h1>
        <div className="flex items-center text-sm text-muted-foreground">
          <Circle className="size-4 mr-2" />
          <span>{totalTasks} {totalTasks === 1 ? 'task' : 'tasks'}</span>
        </div>
      </div>

      {/* Today's Date Section */}
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-muted-foreground">
          {formattedDate} · Today · {dayOfWeek}
        </h2>
      </div>

      {/* Task List */}
      <div className="space-y-1 mb-4">
        {totalTasks === 0 ? (
          <div className="text-sm text-muted-foreground py-8 text-center">
            No tasks for today
          </div>
        ) : (
          tasks.map((task) => (
            <div
              key={task._id}
              className="group flex items-start gap-3 py-2 px-2 rounded-md hover:bg-accent/50 transition-colors cursor-pointer border-b border-border/40"
            >
              {/* Checkbox */}
              <button
                onClick={() => handleToggleTask(task._id)}
                className="mt-1 flex-shrink-0"
              >
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
              </div>

              {/* Delete Button - Shows on hover */}
              <button
                onClick={(e) => handleDeleteTask(task._id, e)}
                className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 p-1 hover:bg-destructive/10 rounded"
                title="Delete task"
              >
                <Trash2 className="size-4 text-muted-foreground hover:text-destructive transition-colors" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Add Task Button */}
      <AddTaskDialog>
        <Button
          variant="ghost"
          className="justify-start text-muted-foreground hover:text-foreground hover:bg-accent/50 w-full"
        >
          <Plus className="size-4 text-red-500" />
          <span>Add task</span>
        </Button>
      </AddTaskDialog>
    </div>
  );
}
