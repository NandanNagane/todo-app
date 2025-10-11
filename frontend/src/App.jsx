import { RouterProvider } from "react-router-dom";
import "./App.css";
import { router } from "./routes/index";
import { Toaster } from "sonner";
import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";


function App() {
  return (
    <>

      <QueryClientProvider client={queryClient}>
        <Toaster richColors position="bottom-left" />
        <RouterProvider router={router} />
      </QueryClientProvider>

    </>
  );
}

export default App;
