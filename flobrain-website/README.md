This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## to add new components from shadcn/ui

npx shadcn@latest add "component name"
example :   npx shadcn@latest add card
            npx shadcn@latest add button

## How to add new APIs

The app uses **Axios** (`apiClient`) and **React Query** for API calls. The backend URL is set via `NEXT_PUBLIC_API_URL` (default: `http://127.0.0.1:8000`). Authenticated requests automatically send the JWT via the `Authorization` header.

### 1. Fetching data (GET) – use `useQuery` + `apiClient`

Import from `@/hooks/useApi` and call your backend endpoint:

```tsx
import { useQuery, apiClient } from "@/hooks/useApi";

// In your component:
const { data, isLoading, error } = useQuery({
  queryKey: ["my-collection"],  // unique key for caching
  queryFn: async () => {
    const res = await apiClient.get("/api/my-collection/");
    return res.data;
  },
});
```

### 2. Creating/updating/deleting (POST, PUT, PATCH, DELETE) – use `useMutation` + `apiClient`

```tsx
import { useMutation, useQueryClient, apiClient } from "@/hooks/useApi";

const queryClient = useQueryClient();
const mutation = useMutation({
  mutationFn: (body: { name: string }) =>
    apiClient.post("/api/my-collection/", body),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["my-collection"] });
  },
});
```

### Files to know

|------------------------|---------------------------------------------------------------------|
| File                   | Purpose                                                             |
|------------------------|---------------------------------------------------------------------|
| `src/lib/axios.ts`     | Axios instance (`apiClient`), base URL, auth header interceptor     | 
| `src/lib/api.ts`       | Auth methods + optional shared API methods; uses `apiClient`        |
| `src/hooks/useApi.ts`  | Re-exports `useQuery`, `useMutation`, `useQueryClient`, `apiClient` |
|------------------------|---------------------------------------------------------------------|

Auth (login, register, sign out) is handled by `AuthContext` and the methods in `api`; use the pattern above for other collections and endpoints.

