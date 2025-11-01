import { atomWithMutation } from 'jotai-tanstack-query';
import { createTask, updateTask, deleteTask, toggleTaskCompletion } from '@/api/task.js';
import { queryClient } from '@/lib/queryClient.js';

// Create task mutation with optimistic updates
export const createTaskMutationAtom = atomWithMutation(() => {
  
  return {
  mutationFn: createTask,
  onSuccess: (response) => {
    // Get the newly created task from server response
    const newTask = response.data;
    
    // Update all relevant view caches with the new task
    ['inbox', 'today', 'upcoming', 'completed'].forEach((view) => {
    const existingData = queryClient.getQueryData(['tasks', view]);
    
    // Only update if this query has been fetched before
    if (!existingData) return;
    
    // Determine if this task belongs in this view
    const shouldIncludeInView = () => {
      if (view === 'completed') return newTask.completed;
      if (view === 'inbox') return !newTask.dueDate && !newTask.completed;
      if (view === 'today') {
      // Check if dueDate is today
      const today = new Date().toDateString();
      return newTask.dueDate && new Date(newTask.dueDate).toDateString() === today && !newTask.completed;
      }
      if (view === 'upcoming') {
      // Check if dueDate is in the future
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return newTask.dueDate && new Date(newTask.dueDate) > today && !newTask.completed;
      }
      return false;
    };
    
    if (shouldIncludeInView()) {
      queryClient.setQueryData(['tasks', view], (old) => ({
      ...old,
      data: [...old.data, newTask],
      count: old.count + 1,
      }));
    }
    });
  },
  };
});

// Toggle task completion mutation with optimistic updates
export const toggleTaskMutationAtom = atomWithMutation(() => {
  
  return {
    mutationFn: toggleTaskCompletion,
    onMutate: async (taskId) => {
      console.log('🔄 Toggle mutation started for task:', taskId);
      
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['tasks'] });

      // Snapshot the previous values for all views
      const previousData = {};
      ['inbox', 'today', 'upcoming', 'completed'].forEach((view) => {
        previousData[view] = queryClient.getQueryData(['tasks', view]);
      });

      // Optimistically update all relevant queries that exist in cache
      ['inbox', 'today', 'upcoming', 'completed'].forEach((view) => {
        // Only update if this query has been fetched before
        const existingData = queryClient.getQueryData(['tasks', view]);
        console.log(`📦 Checking ${view}:`, existingData ? 'EXISTS' : 'NOT FOUND', existingData);
        
        if (!existingData) {
          // Query not fetched yet, skip it
          return;
        }

        queryClient.setQueryData(['tasks', view], (old) => {
          const tasksArray = old.data;

          const taskIndex = tasksArray.findIndex((task) => task._id === taskId);
          if (taskIndex === -1) {
            // Task not in this view, that's ok
            return old;
          }

          const task = tasksArray[taskIndex];
          const isCompletingTask = !task.completed;
          
          console.log(`✅ Found task in ${view}, completing: ${isCompletingTask}`);

          // If completing task, remove from current view (unless it's completed view)
          // If uncompleting task, remove from completed view
          if (
            (isCompletingTask && view !== 'completed') ||
            (!isCompletingTask && view === 'completed')
          ) {
            console.log(`🗑️ Removing task from ${view}`);
            const filteredTasks = tasksArray.filter((t) => t._id !== taskId);
            
            return {
              ...old,
              data: filteredTasks,
              count: old.count - 1,
            };
          }

          // If uncompleting in completed view or completing in other views, update status
          const updatedData = [...tasksArray];
          updatedData[taskIndex] = {
            ...task,
            completed: !task.completed,
            completedAt: !task.completed ? new Date().toISOString() : null,
          };

          return {
            ...old,
            data: updatedData,
          };
        });
      });

      // Return context with previous values
      return { previousData };
    },
    onError: (err, taskId, context) => {
      // Revert all queries on error
      if (context?.previousData) {
        Object.entries(context.previousData).forEach(([view, data]) => {
          if (data) {
            queryClient.setQueryData(['tasks', view], data);
          }
        });
      }
    },
    onSettled: () => {
      // Refetch all task queries to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  };
});

// Update task mutation
export const updateTaskMutationAtom = atomWithMutation(() => {
  
  return {
    mutationFn: updateTask,
    onMutate: async ({ taskId, updates }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['tasks'] });

      // Snapshot previous values
      const previousData = {};
      ['inbox', 'today', 'upcoming', 'completed'].forEach((view) => {
        previousData[view] = queryClient.getQueryData(['tasks', view]);
      });

      // Optimistically update all views
      ['inbox', 'today', 'upcoming', 'completed'].forEach((view) => {
        const existingData = queryClient.getQueryData(['tasks', view]);
        if (!existingData) return;

        queryClient.setQueryData(['tasks', view], (old) => {
          const updatedTasks = old.data.map((task) =>
            task._id === taskId ? { ...task, ...updates } : task
          );

          return { ...old, data: updatedTasks };
        });
      });

      return { previousData };
    },
    onError: (err, variables, context) => {
      // Revert all queries on error
      if (context?.previousData) {
        Object.entries(context.previousData).forEach(([view, data]) => {
          if (data) {
            queryClient.setQueryData(['tasks', view], data);
          }
        });
      }
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  };
});

// Delete task mutation with optimistic updates
export const deleteTaskMutationAtom = atomWithMutation(() => {
  
  return {
    mutationFn: deleteTask,
    onMutate: async (taskId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['tasks'] });

      // Snapshot previous values
      const previousData = {};
      ['inbox', 'today', 'upcoming', 'completed'].forEach((view) => {
        previousData[view] = queryClient.getQueryData(['tasks', view]);
      });

      // Optimistically remove the task from all views
      ['inbox', 'today', 'upcoming', 'completed'].forEach((view) => {
        const existingData = queryClient.getQueryData(['tasks', view]);
        if (!existingData) return;

        queryClient.setQueryData(['tasks', view], (old) => {
          const filteredTasks = old.data.filter((task) => task._id !== taskId);

          return {
            ...old,
            data: filteredTasks,
            count: old.count - 1,
          };
        });
      });

      return { previousData };
    },
    onError: (err, taskId, context) => {
      // Revert all queries on error
      if (context?.previousData) {
        Object.entries(context.previousData).forEach(([view, data]) => {
          if (data) {
            queryClient.setQueryData(['tasks', view], data);
          }
        });
      }
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  };
});
