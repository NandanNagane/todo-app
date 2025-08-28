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
import { queryClient } from "./utils/queryClient";
import GlobalErrorBoundary from "./components/GlobalErrorBoundry";

function App() {
  return (
    <>
     <GlobalErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Toaster richColors position="top-center" />
        <RouterProvider router={router} />
      </QueryClientProvider>
      </GlobalErrorBoundary>
    </>
  );
}

export default App;
