import { useState, useCallback } from 'react';
import * as THREE from 'three';
import type { ModelInfo } from '../types';

interface UseModelLoaderReturn {
  modelInfo: ModelInfo | null;
  loading: boolean;
  handleModelLoaded: (scene: THREE.Group, url: string) => void;
  reset: () => void;
}

export function useModelLoader(): UseModelLoaderReturn {
  const [modelInfo, setModelInfo] = useState<ModelInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const handleModelLoaded = useCallback((scene: THREE.Group, url: string) => {
    setLoading(true);

    // Calculate bounding box
    const box = new THREE.Box3().setFromObject(scene);
    const size = box.getSize(new THREE.Vector3());

    // Count vertices and triangles
    let totalVertices = 0;
    let totalTriangles = 0;

    scene.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        const mesh = obj as THREE.Mesh;
        const geometry = mesh.geometry;
        
        if (geometry.attributes.position) {
          totalVertices += geometry.attributes.position.count;
        }
        
        if (geometry.index) {
          totalTriangles += geometry.index.count / 3;
        } else if (geometry.attributes.position) {
          totalTriangles += geometry.attributes.position.count / 3;
        }
      }
    });

    const fileName = url.split('/').pop() || 'model.glb';

    setModelInfo({
      url,
      name: fileName,
      size: {
        x: parseFloat(size.x.toFixed(2)),
        y: parseFloat(size.y.toFixed(2)),
        z: parseFloat(size.z.toFixed(2)),
      },
      vertices: Math.round(totalVertices),
      triangles: Math.round(totalTriangles),
    });

    setLoading(false);
  }, []);

  const reset = useCallback(() => {
    setModelInfo(null);
    setLoading(true);
  }, []);

  return {
    modelInfo,
    loading,
    handleModelLoaded,
    reset,
  };
}