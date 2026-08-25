import { apiClient } from "@/lib/axios";

export const PROVIDER_TYPES = ["private", "open-source"] as const;
export const INPUT_TYPES = ["text", "image", "audio", "video", "document", "multimodal"] as const;

export type ProviderType = (typeof PROVIDER_TYPES)[number];
export type InputType = (typeof INPUT_TYPES)[number];

export type RegisteredModel = {
  id: number;
  name: string;
  provider_name: string;
  provider_type: ProviderType;
  supported_input_types: InputType[];
  capabilities: string[];
  created_at: string;
  updated_at: string;
};

export type ModelRegistryPayload = Pick<
  RegisteredModel,
  "name" | "provider_name" | "provider_type" | "supported_input_types" | "capabilities"
>;

export async function listRegisteredModels(): Promise<RegisteredModel[]> {
  const response = await apiClient.get<RegisteredModel[]>("/api/model-registry/");
  return response.data;
}

export async function createRegisteredModel(
  payload: ModelRegistryPayload
): Promise<RegisteredModel> {
  const response = await apiClient.post<RegisteredModel>("/api/model-registry/", payload);
  return response.data;
}

export async function updateRegisteredModel(
  id: number,
  payload: ModelRegistryPayload
): Promise<RegisteredModel> {
  const response = await apiClient.patch<RegisteredModel>(`/api/model-registry/${id}/`, payload);
  return response.data;
}

export async function deleteRegisteredModel(id: number): Promise<void> {
  await apiClient.delete(`/api/model-registry/${id}/`);
}

function formatDetails(details: unknown): string | undefined {
  if (typeof details === "string") return details;
  if (!details || typeof details !== "object" || Array.isArray(details)) {
    return undefined;
  }
  const messages = Object.values(details).flatMap((value) =>
    Array.isArray(value) ? value.map(String) : [String(value)]
  );
  return messages.length ? messages.join(" ") : undefined;
}

export function getModelRegistryError(error: unknown): string {
  if (error && typeof error === "object" && "response" in error) {
    const response = (
      error as {
        response?: { data?: { error?: string; details?: unknown } };
      }
    ).response;
    const message = response?.data?.error;
    const details = formatDetails(response?.data?.details);
    if (message && details) return `${message}. ${details}`;
    if (message) return message;
  }
  return "Couldn't connect to the FloBrain model registry.";
}
