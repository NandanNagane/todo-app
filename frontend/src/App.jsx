import { RouterProvider } from "react-router-dom";
import "./App.css";
import { router } from "./routes/index";
import { Toaster } from "sonner";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { AuthProvider } from "./providers/AuthProvider";


function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Toaster richColors position="bottom-left" />
        <RouterProvider router={router} />
        <ReactQueryDevtools initialIsOpen={false} />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
