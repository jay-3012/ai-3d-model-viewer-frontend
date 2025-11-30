import * as THREE from 'three';

// ============================================
// Upload & Job Types
// ============================================

export interface UploadResponse {
  success: boolean;
  status: 'completed' | 'processing';
  jobId: string;
  modelUrl?: string;
  message?: string;
  pollUrl?: string;
  error?: string;
  tripoTaskId?: string; // For Tripo jobs
}

export interface JobStatus {
  success: boolean;
  jobId: string;
  type?: 'conversion' | 'tripo_text' | 'tripo_image';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  modelUrl?: string;
  error?: string;
  createdAt?: number;
  updatedAt?: number;
}

// ============================================
// Tripo AI Types (Official API v2)
// ============================================

export type TripoModelVersion = 
  | 'Turbo-v1.0-20250506'
  | 'v3.0-20250812'
  | 'v2.5-20250123'
  | 'v2.0-20240919'
  | 'v1.4-20240625';

export type TripoTextureQuality = 'standard' | 'detailed';
export type TripoGeometryQuality = 'standard' | 'detailed';
export type TripoTextureAlignment = 'original_image' | 'geometry';
export type TripoOrientation = 'default' | 'align_image';

export interface TripoGenerationOptions {
  // Common options (v2.0+)
  model_version?: TripoModelVersion;
  face_limit?: number; // If smart_low_poly=true: 1000-16000, if quad=true: 500-8000
  texture?: boolean; // Default: true
  pbr?: boolean; // Default: true (overrides texture if true)
  texture_seed?: number;
  texture_quality?: TripoTextureQuality; // Default: 'standard'
  auto_size?: boolean; // Default: false
  quad?: boolean; // Forces FBX output if true
  smart_low_poly?: boolean; // Default: false
  generate_parts?: boolean; // Default: false (incompatible with texture/pbr/quad)
  
  // Text-to-3D specific
  negative_prompt?: string; // Max 255 chars
  image_seed?: number;
  model_seed?: number;
  
  // Image-to-3D specific
  enable_image_autofix?: boolean; // Default: false
  texture_alignment?: TripoTextureAlignment; // Default: 'original_image'
  orientation?: TripoOrientation; // Default: 'default'
  
  // v3.0+ only
  geometry_quality?: TripoGeometryQuality; // Default: 'standard'
  
  // Advanced
  compress?: 'geometry'; // Use meshopt compression
}

export interface TripoBalance {
  success: boolean;
  balance?: number;
  credits?: number;
  raw?: any;
  error?: string;
}

export interface TripoTaskResponse {
  code: number;
  data: {
    task_id: string;
  };
  message?: string;
}

export interface TripoTaskStatus {
  code: number;
  data: {
    task_id: string;
    status: 'queued' | 'running' | 'success' | 'failed' | 'cancelled';
    progress?: number;
    output?: {
      model?: string; // GLB URL
      pbr_model?: string;
      rendered_image?: string;
      base_color_map?: string;
      normal_map?: string;
      roughness_map?: string;
      metallic_map?: string;
    };
    error?: string;
  };
}

// ============================================
// Model & Scene Types
// ============================================

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