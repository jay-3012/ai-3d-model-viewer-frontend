import axios, { AxiosProgressEvent } from 'axios';
import type { UploadResponse, JobStatus, TripoBalance, TripoGenerationOptions } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

class APIService {
  private api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 300000, // 5 minutes
    headers: {
      'Content-Type': 'application/json',
    },
  });

  /**
   * Upload model files (with textures)
   */
  async uploadModel(
    files: File | File[],
    onProgress?: (percentage: number) => void
  ): Promise<UploadResponse> {
    const formData = new FormData();
    
    // Handle both single file and multiple files
    const fileArray = Array.isArray(files) ? files : [files];
    
    console.log(`Uploading ${fileArray.length} files:`, fileArray.map(f => f.name));
    
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

      console.log('Upload response:', response.data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.error || 'Upload failed. Please try again.';
        console.error('Upload error:', errorMessage);
        throw new Error(errorMessage);
      }
      throw error;
    }
  }

  /**
   * Get job status (works for both conversion and Tripo jobs)
   */
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

  /**
   * Generate 3D model from text using Tripo AI
   */
  async generateFromText(
    prompt: string,
    options?: TripoGenerationOptions
  ): Promise<UploadResponse> {
    try {
      console.log('Generating from text:', prompt);
      
      const response = await this.api.post<UploadResponse>('/tripo/generate-from-text', {
        prompt,
        options: options || {}
      });
      
      console.log('Text generation response:', response.data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.error || 'AI generation failed';
        console.error('Text generation error:', errorMessage);
        throw new Error(errorMessage);
      }
      throw error;
    }
  }

  /**
   * Generate 3D model from image using Tripo AI
   */
  async generateFromImage(
    image: File,
    options?: TripoGenerationOptions,
    onProgress?: (percentage: number) => void
  ): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('image', image);
    
    if (options) {
      formData.append('options', JSON.stringify(options));
    }

    try {
      console.log('Generating from image:', image.name);
      
      const response = await this.api.post<UploadResponse>(
        '/tripo/generate-from-image',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent: AxiosProgressEvent) => {
            if (progressEvent.total && onProgress) {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              onProgress(Math.min(percentCompleted, 95)); // Cap at 95% for upload
            }
          },
        }
      );
      
      console.log('Image generation response:', response.data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.error || 'AI generation failed';
        console.error('Image generation error:', errorMessage);
        throw new Error(errorMessage);
      }
      throw error;
    }
  }

  /**
   * Get Tripo task status (alias for getJobStatus for backward compatibility)
   */
  async getTripoStatus(jobId: string): Promise<JobStatus> {
    return this.getJobStatus(jobId);
  }

  /**
   * Get Tripo balance
   */
  async getTripoBalance(): Promise<TripoBalance> {
    try {
      const response = await this.api.get<TripoBalance>('/tripo/balance');
      return response.data;
    } catch (error) {
      console.error('Balance check error:', error);
      return { success: false, error: 'Failed to get balance' };
    }
  }

  /**
   * Get system health
   */
  async checkHealth(): Promise<boolean> {
    try {
      const response = await this.api.get('/health');
      return response.data.success;
    } catch {
      return false;
    }
  }

  /**
   * Get full model URL
   */
  getModelUrl(filename: string): string {
    // Remove /api prefix if it's there, as models are served directly
    const baseUrl = API_BASE_URL.replace('/api', '');
    return `${baseUrl}/api/models/${filename}`;
  }

  /**
   * Test API connection
   */
  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const healthy = await this.checkHealth();
      
      if (healthy) {
        return { success: true, message: 'Backend is connected' };
      } else {
        return { success: false, message: 'Backend is not responding' };
      }
    } catch (error) {
      return { 
        success: false, 
        message: `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
}

export const apiService = new APIService();
export default apiService;