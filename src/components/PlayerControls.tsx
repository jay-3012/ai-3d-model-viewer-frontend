import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface PlayerControlsProps {
  playerRef: React.RefObject<THREE.Object3D>;
  enabled: boolean;
}

export function PlayerControls({ playerRef, enabled }: PlayerControlsProps) {
  const { camera, gl } = useThree();
  const keysRef = useRef<Record<string, boolean>>({});
  const isLockedRef = useRef(false);
  const velocityRef = useRef(new THREE.Vector3());

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.key.toLowerCase()] = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.key.toLowerCase()] = false;
    };

    const handlePointerLockChange = () => {
      isLockedRef.current = document.pointerLockElement === gl.domElement;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    document.addEventListener('pointerlockchange', handlePointerLockChange);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      document.removeEventListener('pointerlockchange', handlePointerLockChange);
    };
  }, [gl]);

  useEffect(() => {
    if (enabled && playerRef.current) {
      camera.position.set(0, 1.7, 8);
      playerRef.current.position.set(0, 1.7, 8);
    }
  }, [camera, playerRef, enabled]);

  useFrame((state, delta) => {
    if (!enabled || !playerRef.current || !isLockedRef.current) return;

    const speed = 6;
    const dampening = 0.9;

    const direction = new THREE.Vector3();
    camera.getWorldDirection(direction);
    direction.y = 0;
    direction.normalize();

    const right = new THREE.Vector3();
    right.crossVectors(camera.up, direction).normalize();

    const moveForward = keysRef.current['w'] || keysRef.current['arrowup'];
    const moveBackward = keysRef.current['s'] || keysRef.current['arrowdown'];
    const moveLeft = keysRef.current['a'] || keysRef.current['arrowleft'];
    const moveRight = keysRef.current['d'] || keysRef.current['arrowright'];
    const moveUp = keysRef.current[' '] || keysRef.current['e'];
    const moveDown = keysRef.current['shift'] || keysRef.current['q'];

    const acceleration = new THREE.Vector3();
    if (moveForward) acceleration.addScaledVector(direction, speed);
    if (moveBackward) acceleration.addScaledVector(direction, -speed);
    if (moveLeft) acceleration.addScaledVector(right, speed);
    if (moveRight) acceleration.addScaledVector(right, -speed);
    if (moveUp) acceleration.y += speed;
    if (moveDown) acceleration.y -= speed;

    velocityRef.current.add(acceleration.multiplyScalar(delta));
    velocityRef.current.multiplyScalar(dampening);

    playerRef.current.position.add(
      velocityRef.current.clone().multiplyScalar(delta)
    );
    camera.position.copy(playerRef.current.position);
  });

  useEffect(() => {
    if (!enabled) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!isLockedRef.current) return;

      const sensitivity = 0.002;
      const euler = new THREE.Euler().setFromQuaternion(camera.quaternion, 'YXZ');
      euler.y -= e.movementX * sensitivity;
      euler.x = Math.max(
        -Math.PI / 2 + 0.01,
        Math.min(Math.PI / 2 - 0.01, euler.x - e.movementY * sensitivity)
      );
      camera.quaternion.setFromEuler(euler);
    };

    const handleClick = () => {
      if (enabled && !isLockedRef.current) {
        gl.domElement.requestPointerLock();
      }
    };

    gl.domElement.addEventListener('click', handleClick);
    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      gl.domElement.removeEventListener('click', handleClick);
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [camera, gl, enabled]);

  return null;
}