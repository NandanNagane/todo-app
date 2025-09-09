import axiosInstance from "./axios.js";


export async function createTask(taskData) {
  try {
    const response = await axiosInstance.post('/todos/task', taskData)
    return response.data
  } catch (error) {
    console.error("createTask error:", error.message);
    throw error;
  }
}

