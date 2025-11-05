import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAtom } from "jotai";
import { toast } from "sonner";
import { updateTaskMutationAtom } from "@/store/atoms/taskMutationAtoms";
import { useEffect, useState } from "react";

export function EditTaskDialog({ task, open, onOpenChange }) {
  const [editedTask, setEditedTask] = useState({
    title: task?.title || "",
    description: task?.description || "",
  });
  
  const [{ mutate: editTask, isPending }] = useAtom(updateTaskMutationAtom);

  // Update local state when task prop changes
  useEffect(() => {
    if (task) {
      setEditedTask({
        title: task.title || "",
        description: task.description || "",
      });
    }
  }, [task]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!open && task) {
      setEditedTask({
        title: task.title || "",
        description: task.description || "",
      });
    }
  }, [open, task]);

  const handleTaskInput = (e) => {
    const field = e.target.id === "titleInput" ? "title" : "description";
    setEditedTask((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    
    if (!editedTask.title.trim()) {
      toast.error("Task name is required");
      return;
    }

    editTask(
      {
        taskId: task._id,
        updates: {
          title: editedTask.title,
          description: editedTask.description,
        },
      },
      {
        onSuccess: () => {
          toast.success("Task updated successfully!");
          onOpenChange(false);
        },
        onError: (error) => {
          if (error?.response?.status !== 401) {
            toast.error(error?.response?.data?.message || "Failed to update task");
          }
        },
      }
    );
  };

  const handleCancel = () => {
    setEditedTask({
      title: task?.title || "",
      description: task?.description || "",
    });
    onOpenChange(false);
  };

  if (!task) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[425px] top-1/3"
        showCloseButton={false}
      >
        <form onSubmit={handleSave}>
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>
              Make changes to your task details.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="flex flex-col gap-2">
              <input
                id="titleInput"
                type="text"
                name="taskName"
                placeholder="Task Name"
                className="outline-none text-xl"
                onChange={handleTaskInput}
                value={editedTask.title}
                autoFocus
              />
              <textarea
                id="descriptionInput"
                type="text"
                name="description"
                placeholder="Description"
                className="outline-none text-sm h-auto max-h-30 resize-none overflow-y-auto"
                onChange={handleTaskInput}
                onInput={(e) => {
                  e.target.style.height = "auto";
                  e.target.style.height =
                    Math.min(e.target.scrollHeight, 120) + "px";
                }}
                value={editedTask.description}
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
