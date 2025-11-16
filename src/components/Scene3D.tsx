import { Suspense, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { Model } from './Model';
import { PlayerControls } from './PlayerControls';
import { MiniMap } from './MiniMap';
import { LoadingScreen } from './LoadingScreen';
import { ControlsOverlay } from './ControlsOverlay';
import { useModelLoader } from '../hooks/useModelLoader';

interface Scene3DProps {
  modelUrl: string;
}

export function Scene3D({ modelUrl }: Scene3DProps) {
  const playerRef = useRef<THREE.Object3D>(new THREE.Object3D());
  const { modelInfo, loading, handleModelLoaded } = useModelLoader();

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Canvas
        shadows
        camera={{ position: [0, 1.7, 8], fov: 75 }}
        gl={{ antialias: true, alpha: false }}
      >
        <color attach="background" args={['#0a0a0a']} />
        <fog attach="fog" args={['#0a0a0a', 15, 60]} />

        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[10, 20, 10]}
          intensity={1.2}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-far={50}
          shadow-camera-left={-20}
          shadow-camera-right={20}
          shadow-camera-top={20}
          shadow-camera-bottom={-20}
        />
        <hemisphereLight args={['#87ceeb', '#545454', 0.6]} />
        <pointLight position={[-10, 10, -10]} intensity={0.5} />

        {/* Model */}
        <Suspense fallback={<LoadingScreen />}>
          <Model
            url={modelUrl}
            onLoaded={(scene) => handleModelLoaded(scene, modelUrl)}
          />
        </Suspense>

        {/* Controls */}
        <PlayerControls playerRef={playerRef} enabled={!loading} />

        {/* Grid */}
        <gridHelper args={[100, 100, '#1e293b', '#0f172a']} position={[0, -0.01, 0]} />
      </Canvas>

      {/* UI Overlays */}
      <MiniMap playerRef={playerRef} />
      <ControlsOverlay modelInfo={modelInfo} loading={loading} />
    </div>
  );
}