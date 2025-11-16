import axios, { AxiosProgressEvent } from 'axios';
import type { UploadResponse, JobStatus } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

class APIService {
  private api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 300000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  async uploadModel(
    files: File | File[],
    onProgress?: (percentage: number) => void
  ): Promise<UploadResponse> {
    const formData = new FormData();
    
    // Handle both single file and multiple files
    const fileArray = Array.isArray(files) ? files : [files];
    fileArray.forEach(file => {
      formData.append('files', file);
    });

    try {
      const response = await this.api.post<UploadResponse>('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent: AxiosProgressEvent) => {
          if (progressEvent.total && onProgress) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress(percentCompleted);
          }
        },
      });

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.error || 'Upload failed. Please try again.'
        );
      }
      throw error;
    }
  }

  async getJobStatus(jobId: string): Promise<JobStatus> {
    try {
      const response = await this.api.get<JobStatus>(`/jobs/${jobId}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.error || 'Failed to get job status'
        );
      }
      throw error;
    }
  }

  async checkHealth(): Promise<boolean> {
    try {
      const response = await this.api.get('/health');
      return response.data.success;
    } catch {
      return false;
    }
  }

  getModelUrl(filename: string): string {
    return `${API_BASE_URL}/models/${filename}`;
  }
}

export const apiService = new APIService();
export default apiService;