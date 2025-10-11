import { atomWithQuery } from 'jotai-tanstack-query';
import { getTasks } from '@/api/task.js';

// Query atom for fetching tasks
const taskListAtom = atomWithQuery(() => ({
  queryKey: ['tasks'],
  queryFn: getTasks,
  // Transform the response to extract just the data array
  select: (response) => response?.data || [],
  staleTime: 1000 * 60, // 1 minute
  retry: 2,
  // Enable structural sharing for better optimistic updates
  structuralSharing: true,
}));

export default taskListAtom;