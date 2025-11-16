import { useState, useCallback, useRef, useEffect } from 'react';
import { apiService } from '../services/api';

interface UseFileUploadReturn {
  upload: (files: File[]) => Promise<void>;
  uploading: boolean;
  progress: number;
  status: string;
  error: string | null;
  reset: () => void;
}

export function useFileUpload(
  onSuccess: (modelUrl: string) => void
): UseFileUploadReturn {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [error, setError] = useState<string | null>(null);
  const pollIntervalRef = useRef<number>(0);

  const pollJobStatus = useCallback(
    async (jobId: string) => {
      try {
        const jobStatus = await apiService.getJobStatus(jobId);

        setStatus(`Processing... ${jobStatus.progress}%`);

        if (jobStatus.status === 'completed' && jobStatus.modelUrl) {
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
          }
          setStatus('Model ready!');
          setTimeout(() => {
            onSuccess(jobStatus.modelUrl!);
          }, 500);
        } else if (jobStatus.status === 'failed') {
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
          }
          setError(jobStatus.error || 'Conversion failed');
          setUploading(false);
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    },
    [onSuccess]
  );

  const upload = useCallback(
    async (files: File[]) => {
      setUploading(true);
      setError(null);
      setStatus('Uploading files...');
      setProgress(0);

      try {
        const result = await apiService.uploadModel(files, (p) => setProgress(p));

        if (result.status === 'completed' && result.modelUrl) {
          setStatus('Upload complete!');
          setTimeout(() => {
            onSuccess(result.modelUrl!);
          }, 500);
        } else if (result.status === 'processing') {
          setStatus('Processing model...');

          pollIntervalRef.current = window.setInterval(() => {
            pollJobStatus(result.jobId);
          }, 2000);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Upload failed';
        setError(message);
        console.error('Upload error:', err);
      } finally {
        setUploading(false);
      }
    },
    [onSuccess, pollJobStatus]
  );

  const reset = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }
    setUploading(false);
    setProgress(0);
    setStatus('');
    setError(null);
  }, []);

  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  return {
    upload,
    uploading,
    progress,
    status,
    error,
    reset,
  };
}