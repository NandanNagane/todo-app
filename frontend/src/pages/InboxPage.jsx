import { useAtom } from "jotai";
import { useQuery } from "@tanstack/react-query";
import { getTasks } from "@/api/task";
import { toggleTaskMutationAtom, deleteTaskMutationAtom } from "@/store/atoms/taskMutationAtoms";
import { AddTaskDialog } from "@/components/dialogs/AddTaskDialog";
import { EditTaskDialog } from "@/components/dialogs/EditTaskDialog";
import { Button } from "@/components/ui/button";
import { Plus, Circle, CheckCircle2, Calendar, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useState } from "react";

export default function InboxPage() {
  const [editingTask, setEditingTask] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  // Fetch all incomplete tasks
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["tasks", "incomplete"],
    queryFn: () => getTasks({ completed: false }),
    staleTime: 1 * 60 * 1000,
  });

  const taskList = data?.data ?? [];
  
  const [{ mutate: toggleTask }] = useAtom(toggleTaskMutationAtom);
  const [{ mutate: deleteTask }] = useAtom(deleteTaskMutationAtom);
    
  const handleToggleTask = (taskId) => {
    toggleTask(taskId, {
      onSuccess: () => {
        toast.success("Task updated");
      },
      onError: (error) => {
        toast.error(error?.response?.data?.message || "Failed to update task");
      },
    });
  };

  const handleDeleteTask = (taskId, e) => {
    e.stopPropagation(); // Prevent task click event
    deleteTask(taskId, {
      onSuccess: () => {
        toast.success("Task deleted");
      },
      onError: (error) => {
        toast.error(error?.response?.data?.message || "Failed to delete task");
      },
    });
  };

  const handleEditTask = (task, e) => {
    e.stopPropagation(); // Prevent any parent click handlers
    setEditingTask(task);
    setIsEditDialogOpen(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);

    // Check if date is today
    if (date.getTime() === today.getTime()) {
      return { text: "Today", color: "text-green-600" };
    }
    
    // Check if date is in the past (overdue)
    if (date < today) {
      const day = date.getDate();
      const month = date.toLocaleDateString('en-US', { month: 'short' });
      return { text: `${day} ${month}`, color: "text-red-600" };
    }

    // Future dates
    const day = date.getDate();
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    return { text: `${day} ${month}`, color: "text-muted-foreground" };
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Inbox</h1>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="flex flex-col h-full">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Inbox</h1>
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
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Inbox</h1>
      </div>

      {/* Task List */}
      <div className="space-y-1">
        {taskList.length === 0 ? (
          <div className="text-sm text-muted-foreground py-8 text-center">
            No tasks in inbox
          </div>
        ) : (
          taskList.map((task) => {
            const dateInfo = task.dueDate ? formatDate(task.dueDate) : null;
            
            return (
              <div
                key={task._id}
                className="group flex items-start gap-3 py-2 px-2 rounded-md hover:bg-accent/50 transition-colors border-b border-border/40"
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

                {/* Task Content - Clickable to edit */}
                <div
                  className="flex-1 min-w-0 cursor-pointer"
                  onClick={(e) => handleEditTask(task, e)}
                >
                  <p className="text-sm font-normal">
                    {task.title}
                  </p>
                  
                  {task.description && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {task.description}
                    </p>
                  )}

                  {/* Due Date */}
                  {dateInfo && (
                    <div className={cn("flex items-center gap-1 mt-1 text-xs", dateInfo.color)}>
                      <Calendar className="size-3" />
                      <span>{dateInfo.text}</span>
                    </div>
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
            );
          })
        )}
      </div>

      {/* Add Task Button */}
      <div className="mt-4">
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

      {/* Edit Task Dialog */}
      <EditTaskDialog
        task={editingTask}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
      />
    </div>
  );
}