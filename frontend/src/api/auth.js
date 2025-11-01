// api/auth.js
import axiosInstance from './axios.js';

export async function getUser() {
  try {
    const { data } = await axiosInstance.get("/auth/user");
    return data.data;
  } catch (error) {
    console.error("getUser error:", error.message);
    throw error;
  }
}


//haven't used these anywhere yet

// export async function login(credentials) {
//   try {
//     const { data } = await axiosInstance.post("/auth/login", credentials);
//     return data;
//   } catch (error) {
//     console.error("login error:", error.message);
//     throw error;
//   }
// }

// export async function logout() {
//   try {
//     const { data } = await axiosInstance.post("/auth/logout");
//     return data;
//   } catch (error) {
//     console.error("logout error:", error.message);
//     throw error;
//   }
// }
