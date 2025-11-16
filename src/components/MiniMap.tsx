import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

interface MiniMapProps {
  playerRef: React.RefObject<THREE.Object3D>;
}

export function MiniMap({ playerRef }: MiniMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.OrthographicCamera | null>(null);
  const markerRef = useRef<THREE.Mesh | null>(null);
  const circleRef = useRef<THREE.Mesh | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(220, 220);
    renderer.setClearColor(0x0f172a, 0.95);
    rendererRef.current = renderer;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Grid
    const gridHelper = new THREE.GridHelper(60, 30, 0x475569, 0x1e293b);
    scene.add(gridHelper);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambientLight);

    // Camera
    const camera = new THREE.OrthographicCamera(-18, 18, 18, -18, 0.1, 100);
    camera.position.set(0, 50, 0);
    camera.up.set(0, 0, -1);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Player marker (cone)
    const markerGeometry = new THREE.ConeGeometry(0.6, 1.2, 8);
    const markerMaterial = new THREE.MeshBasicMaterial({
      color: 0x3b82f6,
    //   emissive: 0x3b82f6,
    //   emissiveIntensity: 0.5,
    });
    const marker = new THREE.Mesh(markerGeometry, markerMaterial);
    marker.rotation.x = Math.PI;
    markerRef.current = marker;
    scene.add(marker);

    // Circle under marker
    const circleGeometry = new THREE.CircleGeometry(0.8, 32);
    const circleMaterial = new THREE.MeshBasicMaterial({
      color: 0x3b82f6,
      transparent: true,
      opacity: 0.3,
    });
    const circle = new THREE.Mesh(circleGeometry, circleMaterial);
    circle.rotation.x = -Math.PI / 2;
    circle.position.y = 0.05;
    circleRef.current = circle;
    scene.add(circle);

    // Animation loop
    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);

      if (playerRef.current && markerRef.current && circleRef.current) {
        markerRef.current.position.set(
          playerRef.current.position.x,
          0.6,
          playerRef.current.position.z
        );
        circleRef.current.position.set(
          playerRef.current.position.x,
          0.05,
          playerRef.current.position.z
        );
      }

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationId);
      renderer.dispose();
      markerGeometry.dispose();
      markerMaterial.dispose();
      circleGeometry.dispose();
      circleMaterial.dispose();
    };
  }, [playerRef]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 20,
        right: 20,
        width: 220,
        height: 220,
        border: '3px solid rgba(59, 130, 246, 0.5)',
        borderRadius: 12,
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(10px)',
      }}
    />
  );
}