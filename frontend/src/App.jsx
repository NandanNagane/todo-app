import { RouterProvider } from 'react-router-dom'
import './App.css'
import { router } from './routes'
import { Toaster } from 'sonner'
import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'

const queryClient = new QueryClient()
function App() {
 

  return (
    <>
    <QueryClientProvider client={queryClient}>
       <Toaster richColors position="top-center" />
      <RouterProvider router={router} />
    </QueryClientProvider>
      
    </>
  )
}

export default App
