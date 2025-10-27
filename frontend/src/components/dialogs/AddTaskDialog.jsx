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
import { useState } from "react";

export function AddTaskDialog({ children }) {
  const [task, setTask] = useState({ title: "", description: "" });
  const [open, setOpen] = useState(false);
  const [{ mutate: addTask, isPending }] = useAtom(createTaskMutationAtom);

  const handleTaskInput = (e) => {
    if (e.target.id === "taskInput") {
      setTask((prev) => {
        return {
          ...prev,
          title: e.target.value,
        };
      });
    } else {
      setTask((prev) => {
        return {
          ...prev,
          description: e.target.value,
        };
      });
    }
  };

  const handleAddTask = (e) => {
     setOpen(false);
    e.preventDefault();

    addTask(task, {
      onSuccess: (data) => {
        setTask({ title: "", description: "" });
        toast.success("Task added successfully!");
        // Close dialog on success
      },
      onError: (error) => {
        console.log('error', error);
        
        if (error?.response?.status !== 401) {
          toast.error(error?.response?.data?.message || "Failed to add task");
        }
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen} >
      <form>
        <DialogTrigger asChild>{children}</DialogTrigger>

        <DialogContent className="sm:max-w-[425px] top-1/3 " showCloseButton={false}>
    
            <DialogHeader>
              <DialogTitle>Add Task</DialogTitle>
              <DialogDescription>
                Create a new task with a name and description.
              </DialogDescription>
            </DialogHeader>
            <div className="grid ">
              <div className="flex flex-col gap-2">
                <input
                  id="taskInput"
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
                  name="discription"
                  placeholder="Description"
                  className="outline-none text-sm h-40 overflow-y-auto resize-none "
                  onChange={handleTaskInput}
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