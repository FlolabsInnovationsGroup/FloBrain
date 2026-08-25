This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Clean reinstall (remove node_modules and lockfile, then install and run)

From the `flobrain-website` directory:

```bash
# Remove dependencies and lockfile for a clean install
rm -rf node_modules package-lock.json

# Install dependencies
npm install

# Run the dev server
npm run dev
```

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

## Model Registry

Authenticated users can view and manage the AI model pool at `/models`. The page follows the React Query pattern above and calls the Django CRUD API at `/api/model-registry/`. The full data contract and deployment notes are documented in [`docs/features/MODEL_REGISTRY.md`](../docs/features/MODEL_REGISTRY.md).

