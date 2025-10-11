import { atomWithMutation, queryClientAtom } from 'jotai-tanstack-query';
import { createTask, updateTask, deleteTask, toggleTaskCompletion } from '@/api/task.js';

// Create task mutation with optimistic updates
export const createTaskMutationAtom = atomWithMutation((get) => {
  const queryClient = get(queryClientAtom);
  
  return {
    mutationFn: createTask,
    onMutate: async (newTask) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['tasks'] });

      // Snapshot the previous value
      const previousTasks = queryClient.getQueryData(['tasks']);

      // Optimistically add the new task
      queryClient.setQueryData(['tasks'], (old) => {
        const optimisticTask = {
          ...newTask,
          _id: `temp-${Date.now()}`, // Temporary ID
          completed: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        // Handle both response shapes
        const tasksArray = old?.data || old;
        if (!Array.isArray(tasksArray)) {
          return old?.data ? { ...old, data: [optimisticTask], count: 1 } : [optimisticTask];
        }

        const updatedTasks = [optimisticTask, ...tasksArray];
        
        // Return in the same shape as the original response
        return old?.data 
          ? { ...old, data: updatedTasks, count: (old.count || 0) + 1 }
          : updatedTasks;
      });

      return { previousTasks };
    },
    onError: (err, newTask, context) => {
      // Revert to previous value on error
      if (context?.previousTasks) {
        queryClient.setQueryData(['tasks'], context.previousTasks);
      }
    },
    onSettled: () => {
      // Refetch to get the real task with server-generated ID
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  };
});

// Toggle task completion mutation with optimistic updates
export const toggleTaskMutationAtom = atomWithMutation((get) => {
  const queryClient = get(queryClientAtom);
  
  return {
    mutationFn: toggleTaskCompletion,
    onMutate: async (taskId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['tasks'] });

      // Snapshot the previous value (full response object)
      const previousTasks = queryClient.getQueryData(['tasks']);

      // Optimistically update the task in the cache
      queryClient.setQueryData(['tasks'], (old) => {
        // Handle both response shapes
        const tasksArray = old?.data || old;
        if (!Array.isArray(tasksArray)) return old;
        
        const updatedTasks = tasksArray.map((task) =>
          task._id === taskId
            ? {
                ...task,
                completed: !task.completed,
                completedAt: !task.completed ? new Date().toISOString() : null,
              }
            : task
        );

        // Return in the same shape as the original response
        return old?.data ? { ...old, data: updatedTasks } : updatedTasks;
      });

      // Return context with the previous value
      return { previousTasks };
    },
    onError: (err, taskId, context) => {
      // Revert to previous value on error
      if (context?.previousTasks) {
        queryClient.setQueryData(['tasks'], context.previousTasks);
      }
    },
    onSettled: () => {
      // Refetch to ensure we have the latest data
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  };
});

// Update task mutation
export const updateTaskMutationAtom = atomWithMutation((get) => {
  const queryClient = get(queryClientAtom);
  
  return {
    mutationFn: updateTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  };
});

// Delete task mutation with optimistic updates
export const deleteTaskMutationAtom = atomWithMutation((get) => {
  const queryClient = get(queryClientAtom);
  
  return {
    mutationFn: deleteTask,
    onMutate: async (taskId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['tasks'] });

      // Snapshot the previous value
      const previousTasks = queryClient.getQueryData(['tasks']);

      // Optimistically remove the task
      queryClient.setQueryData(['tasks'], (old) => {
        // Handle both response shapes
        const tasksArray = old?.data || old;
        if (!Array.isArray(tasksArray)) return old;
        
        const updatedTasks = tasksArray.filter((task) => task._id !== taskId);
        
        // Return in the same shape as the original response
        return old?.data 
          ? { ...old, data: updatedTasks, count: (old.count || 1) - 1 }
          : updatedTasks;
      });

      return { previousTasks };
    },
    onError: (err, taskId, context) => {
      // Revert to previous value on error
      if (context?.previousTasks) {
        queryClient.setQueryData(['tasks'], context.previousTasks);
      }
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  };
});
