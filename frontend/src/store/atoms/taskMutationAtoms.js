import { atomWithMutation } from 'jotai-tanstack-query';
import { createTask, updateTask, deleteTask, toggleTaskCompletion } from '@/api/task.js';
import { queryClient } from '@/lib/queryClient.js';

// Create task mutation - uses server response to update cache directly
export const createTaskMutationAtom = atomWithMutation(() => {
  
  return {
  mutationFn: createTask,
  onSuccess: (response) => {
    // ✅ Use server response instead of refetching
    const newTask = response.data;
    
    // Update incomplete tasks cache if task is not completed
    if (!newTask.completed) {
      const incompleteData = queryClient.getQueryData(['tasks', 'incomplete']);
      
      if (incompleteData) {
        queryClient.setQueryData(['tasks', 'incomplete'], (old) => ({
          ...old,
          data: [newTask, ...old.data],
          count: (old.count || 0) + 1,
        }));
      }
    }
    
    // Update completed tasks cache if task is completed
    if (newTask.completed) {
      const completedData = queryClient.getQueryData(['tasks', 'completed']);
      
      if (completedData?.pages) {
        queryClient.setQueryData(['tasks', 'completed'], (old) => ({
          ...old,
          pages: old.pages.map((page, index) => 
            index === 0 
              ? { ...page, data: [newTask, ...page.data], total: page.total + 1 }
              : page
          )
        }));
      }
    }
  },
  // No onSettled with invalidateQueries - we're updating cache directly!
  };
});

// Toggle task completion mutation with optimistic updates
export const toggleTaskMutationAtom = atomWithMutation(() => {
  
  return {
    mutationFn: toggleTaskCompletion,
    onMutate: async (taskId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['tasks'] });

      // Snapshot the previous values
      const previousIncomplete = queryClient.getQueryData(['tasks', 'incomplete']);
      const previousCompleted = queryClient.getQueryData(['tasks', 'completed']);

      // Optimistically update incomplete tasks cache
      const incompleteData = queryClient.getQueryData(['tasks', 'incomplete']);
      if (incompleteData) {
        queryClient.setQueryData(['tasks', 'incomplete'], (old) => {
          const taskIndex = old.data.findIndex((task) => task._id === taskId);
          if (taskIndex === -1) return old;

          const task = old.data[taskIndex];
          const isCompletingTask = !task.completed;

          // Remove from incomplete when completing
          if (isCompletingTask) {
            return {
              ...old,
              data: old.data.filter((t) => t._id !== taskId),
              count: (old.count || 0) - 1,
            };
          }

          // Update task status if uncompleting (shouldn't happen in incomplete view)
          const updatedData = [...old.data];
          updatedData[taskIndex] = {
            ...task,
            completed: false,
            completedAt: null,
          };

          return { ...old, data: updatedData };
        });
      }

      // Optimistically update completed tasks cache
      const completedData = queryClient.getQueryData(['tasks', 'completed']);
      if (completedData?.pages) {
        queryClient.setQueryData(['tasks', 'completed'], (old) => ({
          ...old,
          pages: old.pages.map((page) => {
            const taskIndex = page.data.findIndex((task) => task._id === taskId);
            if (taskIndex === -1) return page;

            const task = page.data[taskIndex];
            const isUncompletingTask = task.completed;

            // Remove from completed when uncompleting
            if (isUncompletingTask) {
              return {
                ...page,
                data: page.data.filter((t) => t._id !== taskId),
                total: page.total - 1,
              };
            }

            return page;
          }),
        }));
      }

      return { previousIncomplete, previousCompleted };
    },
    onSuccess: (response, taskId) => {
      // ✅ Use server response to add completed task to completed view
      const updatedTask = response.data;
      
      if (updatedTask.completed) {
        const completedData = queryClient.getQueryData(['tasks', 'completed']);
        
        if (completedData?.pages) {
          // Add to first page of infinite query
          queryClient.setQueryData(['tasks', 'completed'], (old) => ({
            ...old,
            pages: old.pages.map((page, index) => 
              index === 0
                ? { ...page, data: [updatedTask, ...page.data], total: page.total + 1 }
                : page
            ),
          }));
        }
      } else {
        // Task was uncompleted, add back to incomplete view
        const incompleteData = queryClient.getQueryData(['tasks', 'incomplete']);
        
        if (incompleteData) {
          queryClient.setQueryData(['tasks', 'incomplete'], (old) => ({
            ...old,
            data: [updatedTask, ...old.data],
            count: (old.count || 0) + 1,
          }));
        }
      }
    },
    onError: (err, taskId, context) => {
      // Revert queries on error
      if (context?.previousIncomplete) {
        queryClient.setQueryData(['tasks', 'incomplete'], context.previousIncomplete);
      }
      if (context?.previousCompleted) {
        queryClient.setQueryData(['tasks', 'completed'], context.previousCompleted);
      }
    },
    // ❌ Removed onSettled with invalidateQueries - using server response instead!
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
      const previousIncomplete = queryClient.getQueryData(['tasks', 'incomplete']);
      const previousCompleted = queryClient.getQueryData(['tasks', 'completed']);

      // Optimistically update incomplete tasks cache
      const incompleteData = queryClient.getQueryData(['tasks', 'incomplete']);
      if (incompleteData) {
        queryClient.setQueryData(['tasks', 'incomplete'], (old) => ({
          ...old,
          data: old.data.map((task) =>
            task._id === taskId ? { ...task, ...updates } : task
          ),
        }));
      }

      // Optimistically update completed tasks cache (paginated)
      const completedData = queryClient.getQueryData(['tasks', 'completed']);
      if (completedData?.pages) {
        queryClient.setQueryData(['tasks', 'completed'], (old) => ({
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            data: page.data.map((task) =>
              task._id === taskId ? { ...task, ...updates } : task
            ),
          })),
        }));
      }

      return { previousIncomplete, previousCompleted };
    },
    onSuccess: (response) => {
      // ✅ Use server response to ensure accurate data
      const updatedTask = response.data;
      
      // Update incomplete cache
      const incompleteData = queryClient.getQueryData(['tasks', 'incomplete']);
      if (incompleteData) {
        queryClient.setQueryData(['tasks', 'incomplete'], (old) => ({
          ...old,
          data: old.data.map((task) =>
            task._id === updatedTask._id ? updatedTask : task
          ),
        }));
      }

      // Update completed cache
      const completedData = queryClient.getQueryData(['tasks', 'completed']);
      if (completedData?.pages) {
        queryClient.setQueryData(['tasks', 'completed'], (old) => ({
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            data: page.data.map((task) =>
              task._id === updatedTask._id ? updatedTask : task
            ),
          })),
        }));
      }
    },
    onError: (err, variables, context) => {
      // Revert queries on error
      if (context?.previousIncomplete) {
        queryClient.setQueryData(['tasks', 'incomplete'], context.previousIncomplete);
      }
      if (context?.previousCompleted) {
        queryClient.setQueryData(['tasks', 'completed'], context.previousCompleted);
      }
    },
    // ❌ Removed onSettled invalidation - using server response!
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
      const previousIncomplete = queryClient.getQueryData(['tasks', 'incomplete']);
      const previousCompleted = queryClient.getQueryData(['tasks', 'completed']);

      // Optimistically remove from incomplete tasks cache
      const incompleteData = queryClient.getQueryData(['tasks', 'incomplete']);
      if (incompleteData) {
        queryClient.setQueryData(['tasks', 'incomplete'], (old) => ({
          ...old,
          data: old.data.filter((task) => task._id !== taskId),
          count: (old.count || 0) - 1,
        }));
      }

      // Optimistically remove from completed tasks cache (paginated)
      const completedData = queryClient.getQueryData(['tasks', 'completed']);
      if (completedData?.pages) {
        queryClient.setQueryData(['tasks', 'completed'], (old) => ({
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            data: page.data.filter((task) => task._id !== taskId),
            total: page.total - 1,
          })),
        }));
      }

      return { previousIncomplete, previousCompleted };
    },
    onError: (err, taskId, context) => {
      // Revert queries on error
      if (context?.previousIncomplete) {
        queryClient.setQueryData(['tasks', 'incomplete'], context.previousIncomplete);
      }
      if (context?.previousCompleted) {
        queryClient.setQueryData(['tasks', 'completed'], context.previousCompleted);
      }
    },
    // ✅ No onSuccess needed - deletion is permanent, optimistic update is enough
    // ❌ Removed onSettled invalidation - optimistic update handles it!
  };
});
