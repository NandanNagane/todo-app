import axiosInstance from "./axios.js";

// Get all tasks for the authenticated user
export async function getTasks(filters = {}) {
  try {
    const params = new URLSearchParams();
    
    if (filters.view) params.append('view', filters.view);
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);
 
    
    const response = await axiosInstance.get(`/tasks?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error("getTasks error:", error.message);
    throw error;
  }
}// Create a new task
export async function createTask(taskData) {
  try {
    const response = await axiosInstance.post('/tasks', taskData);
    return response.data;
  } catch (error) {
    console.error("createTask error:", error.message);
    throw error;
  }
}

// Update a task
export async function updateTask({ taskId, updates }) {
  try {
    const response = await axiosInstance.patch(`/tasks/${taskId}`, updates);
    return response.data;
  } catch (error) {
    console.error("updateTask error:", error.message);
    throw error;
  }
}

// Delete a task
export async function deleteTask(taskId) {
  try {
    const response = await axiosInstance.delete(`/tasks/${taskId}`);
    return response.data;
  } catch (error) {
    console.error("deleteTask error:", error.message);
    throw error;
  }
}

// Toggle task completion status
export async function toggleTaskCompletion(taskId) {
  try {
    const response = await axiosInstance.patch(`/tasks/${taskId}/toggle`);
    return response.data;
  } catch (error) {
    console.error("toggleTaskCompletion error:", error.message);
    throw error;
  }
}

