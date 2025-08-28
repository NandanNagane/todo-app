import { useAtomValue } from 'jotai';
import { userQueryAtom } from '../store/atoms/userQueryAtom';

export function useUser() {
  const { data, isLoading, isError, error } = useAtomValue(userQueryAtom);
  
  return {
    user: data,
    isLoading,
    isError,
    error,
    isAuthenticated: !isError && !isLoading && !!data,
  };
}