import axiosInstance from "./axios.js";

// Get all tasks for the authenticated user
export async function getTasks(filters = {}) {
  try {
    const params = new URLSearchParams();
    
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.completed !== undefined) params.append('completed', filters.completed);
    
    const response = await axiosInstance.get(`/tasks?${params.toString()}`);
    return response.data;
  } catch (error) {
    throw error;
  }
}// Create a new task
export async function createTask(taskData) {
  try {
    const response = await axiosInstance.post('/tasks', taskData);
    return response.data;
  } catch (error) {
    throw error;
  }
}

// Update a task
export async function updateTask({ taskId, updates }) {
  try {
    const response = await axiosInstance.patch(`/tasks/${taskId}`, updates);
    return response.data;
  } catch (error) {
    throw error;
  }
}

// Delete a task
export async function deleteTask(taskId) {
  try {
    const response = await axiosInstance.delete(`/tasks/${taskId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
}

// Toggle task completion status
export async function toggleTaskCompletion(taskId) {
  try {
    const response = await axiosInstance.patch(`/tasks/${taskId}/toggle`);
    return response.data;
  } catch (error) {
    throw error;
  }
}

