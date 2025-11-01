import { useAtomValue } from 'jotai';
import { currentUserAtom } from '../store/atoms/currentUserAtom';

export function useUser() {
  const { data, isLoading, isError, error } = useAtomValue(currentUserAtom);
  
  return {
    user: data,
    isLoading,
    isError,
    error,
    isAuthenticated: !isError && !isLoading && !!data,
  };
}