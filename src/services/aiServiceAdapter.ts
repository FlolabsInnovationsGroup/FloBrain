import axios, { AxiosInstance } from 'axios';
import { AI_CONFIG } from '../config/ai.config';
import {
  TranscriptionBody,
  TranscriptionResponse,
  SummaryBody,
  SummaryResponse,
  TagsBody,
  TagsResponse,
  EmbeddingBody,
  EmbeddingResponse,
} from '../features/ai-pipeline/ai.types';

class AiServiceAdapter {
  private readonly client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: AI_CONFIG.serviceBaseUrl,
      timeout: AI_CONFIG.jobTimeoutMs,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Optional: Add interceptors for logging or error handling if needed
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        // Axios wraps network errors, timeout errors, and non-2xx responses in an error object.
        // This makes it easy to handle them uniformly.
        if (axios.isAxiosError(error)) {
          // Extract a more useful error message from the response if available
          const errorMessage = error.response?.data?.message || error.message;
          return Promise.reject(new Error(errorMessage));
        }
        return Promise.reject(error);
      }
    );
  }

  async transcription(body: TranscriptionBody): Promise<TranscriptionResponse> {
    const response = await this.client.post<TranscriptionResponse>('/v1/transcription', body);
    // As per rules, we must validate the response contains the required fields
    if (!response.data || !response.data.text) {
      throw new Error('Invalid response from transcription service: missing "text" field.');
    }
    return response.data;
  }

  async summary(body: SummaryBody): Promise<SummaryResponse> {
    const response = await this.client.post<SummaryResponse>('/v1/summary', body);
    if (!response.data || !response.data.summary) {
      throw new Error('Invalid response from summary service: missing "summary" field.');
    }
    return response.data;
  }

  async tags(body: TagsBody): Promise<TagsResponse> {
    const response = await this.client.post<TagsResponse>('/v1/tags', body);
    if (!response.data || !Array.isArray(response.data.tags)) {
      throw new Error('Invalid response from tags service: missing "tags" array.');
    }
    return response.data;
  }

  async embedding(body: EmbeddingBody): Promise<EmbeddingResponse> {
    const response = await this.client.post<EmbeddingResponse>('/v1/embedding', body);
    if (!response.data || !Array.isArray(response.data.vector)) {
      throw new Error('Invalid response from embedding service: missing "vector" array.');
    }
    return response.data;
  }
}

// Export a singleton instance so the rest of the app shares the same client
export const aiServiceAdapter = new AiServiceAdapter();