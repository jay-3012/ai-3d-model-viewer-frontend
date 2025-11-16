import  { useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

interface ModelProps {
  url: string;
  onLoaded?: (scene: THREE.Group) => void;
}

export function Model({ url, onLoaded }: ModelProps) {
  const gltf = useGLTF(url, true);

  useEffect(() => {
    if (gltf.scene && onLoaded) {
      // Center the model
      const box = new THREE.Box3().setFromObject(gltf.scene);
      const center = box.getCenter(new THREE.Vector3());
      gltf.scene.position.sub(center);

      // Enable shadows for all meshes
      gltf.scene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });

      onLoaded(gltf.scene);
    }
  }, [gltf.scene, onLoaded]);

  return <primitive object={gltf.scene} dispose={null} />;
}