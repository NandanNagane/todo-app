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
import { useAtom, useSetAtom } from "jotai";
import { toast } from "sonner";
import taskAtom from "@/store/atoms/taskAtom";
import taskListAtom from "@/store/atoms/task-listAtom";
import addTaskMutationAtom from "@/store/atoms/addTaskMutationAtom";
import { motion } from "motion/react";

export function AddTaskDialog({ children }) {
  const [task, setTask] = useAtom(taskAtom);
  const [taskList, setTaskList] = useAtom(taskListAtom);
  const [{ mutate: addTask, isPending }] = useAtom(addTaskMutationAtom);

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
    e.preventDefault();
    const taskWithTimestamp = {
      ...task,
      createdDate: new Date().toLocaleDateString(),
      createdTime: new Date().toLocaleTimeString(),
    };

    addTask(taskWithTimestamp, {
      onSuccess: (data) => {
        setTaskList((prev) => [...prev, data.task || taskWithTimestamp]);
        setTask({ title: "", description: "" });
        toast.success("Task added successfully!");
      },
      onError: (error) => {
        if (error?.response?.status !== 401) {
          toast.error(error?.response?.data?.message || "Failed to add task");
        }
      },
    });
  };

  return (
    <Dialog>
      <form>
        <DialogTrigger asChild>{children}</DialogTrigger>

        <DialogContent className="sm:max-w-[425px] " showCloseButton={false}>
    
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
                />
                <textarea
                  id="descriptionInput"
                  type="text"
                  name="discription"
                  placeholder="Description"
                  className="outline-none text-sm"
                  onChange={handleTaskInput}
                />
              </div>
            </div>
            <Separator />
            <DialogFooter className="flex flex-row justify-end">
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <DialogClose asChild>
                <Button
                  type="button"
                  disabled={isPending || task.title === ""}
                  onClick={handleAddTask}
                >
                  {isPending ? "Adding..." : "Add Task"}
                </Button>
              </DialogClose>
            </DialogFooter>
   
        </DialogContent>
      </form>
    </Dialog>
  );
}
