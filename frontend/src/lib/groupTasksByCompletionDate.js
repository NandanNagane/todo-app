// Helper function to group tasks by completion date
import { format,parseISO, isToday, isYesterday } from "date-fns";
function groupTasksByCompletionDate(tasks) {
  const groups = {};

  tasks.forEach((task) => {
    const completedDate = task.completedAt ? parseISO(task.completedAt) : new Date();
    let dateLabel;

    if (isToday(completedDate)) {
      dateLabel = "Today";
    } else if (isYesterday(completedDate)) {
      dateLabel = "Yesterday";
    } else {
      dateLabel = format(completedDate, "EEEE, MMMM d"); // "Monday, October 30"
    }

    if (!groups[dateLabel]) {
      groups[dateLabel] = [];
    }
    groups[dateLabel].push(task);
  });

  return groups;
}
export { groupTasksByCompletionDate };