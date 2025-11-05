// api/auth.js
import axiosInstance from './axios.js';

export async function getUser() {
  try {
    const response = await axiosInstance.get("/auth/user");
    return response.data.data; // Return the user data directly
  } catch (error) {
    throw error;
  }
}

export async function logout() {
  try {
    const { data } = await axiosInstance.post("/auth/logout");
    return data;
  } catch (error) {
    throw error;
  }
}

export async function login(credentials) {
  try {
    const { data } = await axiosInstance.post("/auth/login", credentials);
    return data;
  } catch (error) {
    throw error;
  }
}
