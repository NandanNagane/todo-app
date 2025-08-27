import axiosInstance from "./axios";

/**
 * Fetches all todos from the server.
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of todos.
 */
export async function getTodos() {
  try {
    const { data } = await axiosInstance.get("/todos");
    // The backend is expected to return an object with a 'todos' array.
    // e.g., { todos: [ { id: 1, text: '...' }, ... ] }
    // If your API returns the array directly, you should change this to `return data;`
    return data.todos;
  } catch (error) {
    console.error("Error fetching todos:", error);
    // It's important to re-throw the error so that tools like React Query
    // can catch it and manage error states properly.
    throw error;
  }
}

/**
 * Adds a new todo.
 * @param {Object} todoData - The data for the new todo, e.g., { text: 'My new todo' }.
 * @returns {Promise<Object>} A promise that resolves to the newly created todo.
 */
export async function addTodo(todoData) {
  try {
    const { data } = await axiosInstance.post("/todos", todoData);
    return data;
  } catch (error) {
    console.error("Error adding todo:", error);
    throw error;
  }
}

/**
 * Deletes a todo by its ID.
 * @param {string} todoId - The ID of the todo to delete.
 * @returns {Promise<void>}
 */
export async function deleteTodo(todoId) {
  try {
    await axiosInstance.delete(`/todos/${todoId}`);
  } catch (error) {
    console.error(`Error deleting todo ${todoId}:`, error);
    throw error;
  }
}