import * as THREE from 'three';

export interface UploadResponse {
  success: boolean;
  status: 'completed' | 'processing';
  jobId: string;
  modelUrl?: string;
  message?: string;
  pollUrl?: string;
  error?: string;
}

export interface JobStatus {
  success: boolean;
  jobId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  modelUrl?: string;
  error?: string;
}

export interface ModelInfo {
  url: string;
  name: string;
  size?: {
    x: number;
    y: number;
    z: number;
  };
  vertices?: number;
  triangles?: number;
}

export interface PlayerState {
  position: THREE.Vector3;
  rotation: THREE.Euler;
  velocity: THREE.Vector3;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}