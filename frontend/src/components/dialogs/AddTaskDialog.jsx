import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAtom } from "jotai";
import { toast } from "sonner";
import { createTaskMutationAtom } from "@/store/atoms/taskMutationAtoms";
import { motion } from "motion/react";
import { useEffect, useState } from "react";

export function AddTaskDialog({ children }) {
  const [task, setTask] = useState({ title: "", description: "" });
  const [open, setOpen] = useState(false);
  const [{ mutate: addTask, isPending }] = useAtom(createTaskMutationAtom);

  useEffect(() => {
  if (!open) {
    setTask({ title: "", description: "" });
  }
}, [open]);

const handleTaskInput = (e) => {
  const field = e.target.id === "titleInput" ? "title" : "description";
  setTask((prev) => ({
    ...prev,
    [field]: e.target.value,
  }));
};
  const handleAddTask = (e) => {
    setOpen(false);
    e.preventDefault();

    addTask(task, {
      onSuccess: (data) => {
        setTask({ title: "", description: "" });
         setOpen(false);  // Close dialog on success
        toast.success("Task added successfully!");
       
      },
      onError: (error) => {
        console.log("error", error);

        if (error?.response?.status !== 401) {
          toast.error(error?.response?.data?.message || "Failed to add task");
        }
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <form>
        <DialogTrigger asChild>{children}</DialogTrigger>

        <DialogContent
          className="sm:max-w-[425px] top-1/3 "
          showCloseButton={false}
        >
          <DialogHeader>
            <DialogTitle>Add Task</DialogTitle>
            <DialogDescription>
              Create a new task with a name and description.
            </DialogDescription>
          </DialogHeader>
          <div className="grid ">
            <div className="flex flex-col gap-2">
              <input
                id="titleInput"
                type="text"
                name="taskName"
                placeholder="Task Name"
                className="outline-none text-xl"
                onChange={handleTaskInput}
                value={task.title}
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
                value={task.description}
              />
            </div>
          </div>
          <Separator />
          <DialogFooter className="flex flex-row justify-end">
            <Button
              variant="outline"
              type="button"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={isPending || task.title === ""}
              onClick={handleAddTask}
            >
              Add Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
}
