import { Button } from "@/components/ui/button";
import axiosInstance from "@/src/api/axios";
import { Bell, CalendarDays, LogOut, Search, UserCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAtomValue } from "jotai";
import userAtom from "@/src/store/atoms/userAtom";
import { useQuery } from "@tanstack/react-query";
import { getTodos } from "../api/todos";
import AddTodoForm from "./AddTodoForm";
import TodoItem from "./TodoItem";

export default function Dashboard() {
  const user = useAtomValue(userAtom);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // Using axiosInstance which should be configured for credentials
      await axiosInstance.post('/auth/logout');
      navigate("/auth/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Get current date for display
  const today = new Date();
  const dayName = today.toLocaleDateString('en-US', { weekday: 'long' });
  const dateString = today.toLocaleDateString('en-GB'); // Format: DD/MM/YYYY

  const { data: todos, isLoading: isLoadingTodos, isError: isErrorTodos } = useQuery({
    queryKey: ["todos"],
    queryFn: getTodos,
  });

  return (
    <>
      {/* Main Header */}
      <header className="w-full bg-slate-900 text-slate-200 p-4 flex items-center justify-between shadow-lg">
        {/* Left Section: Logo */}
        <div className="flex items-center gap-4">
          <h1 >
            <span className="text-blue-400">TO</span>-DO
          </h1>
        </div>

        {/* Middle Section: Search Bar */}
        <div className="flex-1 max-w-2xl  mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
            <input
              type="search"
              className="w-full  border bg-slate-800 border-slate-700 rounded-lg py-2 pl-10 pr-4 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
              name="search-todos"
              id="search-todo"
              placeholder="Search Task Here..."
            />
          </div>
        </div>

        {/* Right Section: Icons and Date */}
        <div className="flex items-center gap-3">
          <Button size="icon" className="rounded-full hover:bg-slate-700 ">
            <Bell className="h-5 w-5" />
          </Button>
          <Button size="icon" className="rounded-full hover:bg-slate-700 ">
            <CalendarDays className="h-5 w-5" />
          </Button>
          {/* <div className="h-8 w-px bg-slate-700 mx-2"></div> */}
          <div className="text-right border-l-2 border-slate-500 pl-4">
            <p className="font-semibold text-sm">{dayName}</p>
            <p className="text-xs text-slate-400">{dateString}</p>
          </div>
        </div>
      </header>

      {/* User Info & Logout Section */}
      <div className="bg-slate-800 p-4 flex items-center justify-between text-slate-200">
        <div className="flex items-center gap-3">
          <UserCircle className="h-8 w-8 text-slate-400" />
          <div>
            <p className="font-medium">Welcome back!</p>
            <p className="text-sm text-slate-400">{user?.email}</p>
          </div>
        </div>
        <Button onClick={handleLogout} variant="destructive" className="bg-blue-600 hover:bg-blue-700 text-white">
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
        
      </div>
      
      {/* Todo List Section */}
      <main className="p-4 md:p-8">
        <h2 className="text-2xl font-bold text-slate-100 mb-4">Today's Tasks</h2>
        <AddTodoForm />
        <div className="mt-4 bg-slate-900 rounded-lg">
          {isLoadingTodos && <div className="p-4 text-slate-400">Loading tasks...</div>}
          {isErrorTodos && <div className="p-4 text-red-500">Error fetching tasks.</div>}
          {todos && todos.length === 0 && <div className="p-4 text-slate-400">No tasks for today. Add one above!</div>}
          {todos && todos.map(todo => (
            <TodoItem key={todo._id} todo={todo} />
          ))}
        </div>
      </main>

    </>
  );
}