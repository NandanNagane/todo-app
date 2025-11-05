import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, Calendar, Clock, RotateCcw, Trash2 } from "lucide-react";
import { format, parseISO } from "date-fns";

export function TaskDetailsDialog({ task, open, onOpenChange, onUncomplete, onDelete }) {
  if (!task) return null;

  const formatDateTime = (dateString) => {
    if (!dateString) return "Not set";
    try {
      return format(parseISO(dateString), "MMM d, yyyy 'at' h:mm a");
    } catch {
      return "Invalid date";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not set";
    try {
      return format(parseISO(dateString), "MMM d, yyyy");
    } catch {
      return "Invalid date";
    }
  };

  const handleUncomplete = () => {
    onUncomplete(task._id);
    onOpenChange(false);
  };

  const handleDelete = () => {
    onDelete(task._id);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
            <div className="flex-1">
              <DialogTitle className="text-xl">{task.title}</DialogTitle>
              {task.description && (
                <DialogDescription className="mt-2 text-base">
                  {task.description}
                </DialogDescription>
              )}
            </div>
          </div>
        </DialogHeader>

        <Separator className="my-4" />

        {/* Metadata Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Task Details
          </h3>

          {/* Created At */}
          <div className="flex items-start gap-3">
            <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium">Created</p>
              <p className="text-sm text-muted-foreground">
                {formatDateTime(task.createdAt)}
              </p>
            </div>
          </div>

          {/* Completed At */}
          {task.completedAt && (
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium">Completed</p>
                <p className="text-sm text-muted-foreground">
                  {formatDateTime(task.completedAt)}
                </p>
              </div>
            </div>
          )}

          {/* Due Date */}
          {task.dueDate && (
            <div className="flex items-start gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium">Due Date</p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(task.dueDate)}
                </p>
              </div>
            </div>
          )}
        </div>

        <Separator className="my-4" />

        {/* Action Buttons */}
        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            variant="outline"
            onClick={handleUncomplete}
            className="flex-1 sm:flex-1"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Mark Incomplete
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            className="flex-1 sm:flex-1"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Task
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
