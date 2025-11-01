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
    
    console.log('✅ Task created, updating cache:', newTask);
    
    // Update all relevant view caches with the new task
    ['inbox', 'today', 'upcoming', 'completed'].forEach((view) => {
    const existingData = queryClient.getQueryData(['tasks', view]);
    
    // Only update if this query has been fetched before
    if (!existingData) {
      console.log(`⏭️ Skipping ${view} - not fetched yet`);
      return;
    }
    
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
      console.log(`📝 Adding task to ${view} cache`);
      queryClient.setQueryData(['tasks', view], (old) => {
        // Handle paginated data structure (for completed page)
        if (old.pages) {
          return {
            ...old,
            pages: old.pages.map((page, index) => 
              index === 0 
                ? { ...page, data: [newTask, ...page.data], total: page.total + 1 }
                : page
            )
          };
        }
        
        // Handle regular data structure (for other pages)
        return {
          ...old,
          data: [newTask, ...old.data],
          count: (old.count || 0) + 1,
        };
      });
    } else {
      console.log(`⏭️ Task doesn't belong in ${view}`);
    }
    });
  },
  // No onSettled with invalidateQueries - we're updating cache directly!
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
        const existingData = queryClient.getQueryData(['tasks', view]);
        
        if (!existingData) return;

        queryClient.setQueryData(['tasks', view], (old) => {
          // Handle paginated data (CompletedPage uses infinite query)
          if (old.pages) {
            return {
              ...old,
              pages: old.pages.map((page) => {
                const taskIndex = page.data.findIndex((task) => task._id === taskId);
                if (taskIndex === -1) return page;

                const task = page.data[taskIndex];
                const isCompletingTask = !task.completed;

                // Remove from completed view when uncompleting
                if (!isCompletingTask && view === 'completed') {
                  return {
                    ...page,
                    data: page.data.filter((t) => t._id !== taskId),
                    total: page.total - 1,
                  };
                }

                // Update task status
                const updatedData = [...page.data];
                updatedData[taskIndex] = {
                  ...task,
                  completed: !task.completed,
                  completedAt: !task.completed ? new Date().toISOString() : null,
                };

                return { ...page, data: updatedData };
              }),
            };
          }

          // Handle regular data (other pages)
          const tasksArray = old.data;
          const taskIndex = tasksArray.findIndex((task) => task._id === taskId);
          
          if (taskIndex === -1) return old;

          const task = tasksArray[taskIndex];
          const isCompletingTask = !task.completed;

          // Remove from view when completing (except completed view)
          if (isCompletingTask && view !== 'completed') {
            const filteredTasks = tasksArray.filter((t) => t._id !== taskId);
            return {
              ...old,
              data: filteredTasks,
              count: (old.count || 0) - 1,
            };
          }

          // Update task status
          const updatedData = [...tasksArray];
          updatedData[taskIndex] = {
            ...task,
            completed: !task.completed,
            completedAt: !task.completed ? new Date().toISOString() : null,
          };

          return { ...old, data: updatedData };
        });
      });

      return { previousData };
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
      }
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
      const previousData = {};
      ['inbox', 'today', 'upcoming', 'completed'].forEach((view) => {
        previousData[view] = queryClient.getQueryData(['tasks', view]);
      });

      // Optimistically update all views
      ['inbox', 'today', 'upcoming', 'completed'].forEach((view) => {
        const existingData = queryClient.getQueryData(['tasks', view]);
        if (!existingData) return;

        queryClient.setQueryData(['tasks', view], (old) => {
          // Handle paginated data
          if (old.pages) {
            return {
              ...old,
              pages: old.pages.map((page) => ({
                ...page,
                data: page.data.map((task) =>
                  task._id === taskId ? { ...task, ...updates } : task
                ),
              })),
            };
          }

          // Handle regular data
          const updatedTasks = old.data.map((task) =>
            task._id === taskId ? { ...task, ...updates } : task
          );

          return { ...old, data: updatedTasks };
        });
      });

      return { previousData };
    },
    onSuccess: (response) => {
      // ✅ Use server response to ensure accurate data
      const updatedTask = response.data;
      
      ['inbox', 'today', 'upcoming', 'completed'].forEach((view) => {
        const existingData = queryClient.getQueryData(['tasks', view]);
        if (!existingData) return;

        queryClient.setQueryData(['tasks', view], (old) => {
          // Handle paginated data
          if (old.pages) {
            return {
              ...old,
              pages: old.pages.map((page) => ({
                ...page,
                data: page.data.map((task) =>
                  task._id === updatedTask._id ? updatedTask : task
                ),
              })),
            };
          }

          // Handle regular data
          return {
            ...old,
            data: old.data.map((task) =>
              task._id === updatedTask._id ? updatedTask : task
            ),
          };
        });
      });
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
      const previousData = {};
      ['inbox', 'today', 'upcoming', 'completed'].forEach((view) => {
        previousData[view] = queryClient.getQueryData(['tasks', view]);
      });

      // Optimistically remove the task from all views
      ['inbox', 'today', 'upcoming', 'completed'].forEach((view) => {
        const existingData = queryClient.getQueryData(['tasks', view]);
        if (!existingData) return;

        queryClient.setQueryData(['tasks', view], (old) => {
          // Handle paginated data
          if (old.pages) {
            return {
              ...old,
              pages: old.pages.map((page) => ({
                ...page,
                data: page.data.filter((task) => task._id !== taskId),
                total: page.total - 1,
              })),
            };
          }

          // Handle regular data
          const filteredTasks = old.data.filter((task) => task._id !== taskId);

          return {
            ...old,
            data: filteredTasks,
            count: (old.count || 0) - 1,
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
    // ✅ No onSuccess needed - deletion is permanent, optimistic update is enough
    // ❌ Removed onSettled invalidation - optimistic update handles it!
  };
});
