

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AddTaskDialog } from "@/components/dialogs/AddTaskDialog";
import { ChevronRight, Plus, Circle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function TodayPage() {
  const [showOverdue, setShowOverdue] = useState(true);
  
  // Mock data - replace with actual data from your state management
  const totalTasks = 4;
  const overdueTasks = 2; // Example overdue tasks count
  
  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-US', { 
    day: 'numeric', 
    month: 'short' 
  });
  const dayOfWeek = today.toLocaleDateString('en-US', { weekday: 'long' });

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Today</h1>
        <div className="flex items-center text-sm text-muted-foreground">
          <Circle className="size-4 mr-2" />
          <span>{totalTasks} tasks</span>
        </div>
      </div>

      {/* Overdue Section */}
      {overdueTasks > 0 && (
        <div className="mb-6">
          <button
            onClick={() => setShowOverdue(!showOverdue)}
            className="flex items-center justify-between w-full py-3 px-0 hover:bg-accent/50 rounded-md transition-colors group"
          >
            <div className="flex items-center gap-2">
              <ChevronRight 
                className={cn(
                  "size-4 text-muted-foreground transition-transform",
                  showOverdue && "rotate-90"
                )} 
              />
              <h2 className="text-base font-semibold">Overdue</h2>
            </div>
            <span className="text-sm text-red-500 group-hover:underline">
              Reschedule
            </span>
          </button>
          
          {showOverdue && (
            <div className="ml-6 mt-2 space-y-2">
              {/* Overdue tasks will be rendered here */}
              <p className="text-sm text-muted-foreground">No overdue tasks</p>
            </div>
          )}
        </div>
      )}

      {/* Today's Date Section */}
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-muted-foreground">
          {formattedDate} · Today · {dayOfWeek}
        </h2>
      </div>

      {/* Task List */}
      <div className="space-y-2 mb-4">
        {/* Tasks will be mapped here */}
        {/* Example empty state - remove when you have tasks */}
        <div className="text-sm text-muted-foreground py-8 text-center">
          No tasks for today
        </div>
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
