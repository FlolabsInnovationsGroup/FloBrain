/**
 * React Query hooks for API data fetching.
 * Use these for non-auth endpoints (other collections).
 *
 * Auth (login, register, signout) stays in AuthContext and uses api.signIn etc.
 * For lists, details, and mutations on other resources, use useQuery / useMutation
 * with apiClient.
 *
 * Example - fetch a list:
 *   const { data, isLoading, error } = useQuery({
 *     queryKey: ['myCollection'],
 *     queryFn: async () => {
 *       const res = await apiClient.get('/api/my-collection/');
 *       return res.data;
 *     },
 *   });
 *
 * Example - mutation:
 *   const mutation = useMutation({
 *     mutationFn: (body: MyType) => apiClient.post('/api/my-collection/', body),
 *     onSuccess: () => queryClient.invalidateQueries({ queryKey: ['myCollection'] }),
 *   });
 */

export {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";

export { apiClient } from "@/lib/axios";
