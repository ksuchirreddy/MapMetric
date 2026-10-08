import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const Flares: React.FC = () => {
  const flareRef = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    if (flareRef.current) {
      const t = state.clock.getElapsedTime();
      flareRef.current.position.x = Math.sin(t * 0.8) * 5;
      flareRef.current.position.z = Math.cos(t * 0.8) * 5;
      flareRef.current.position.y = Math.sin(t * 1.5) * 0.5;
    }
  });

  return (
    <group>
      {/* Topology Repair Flare Specimen */}
      <mesh ref={flareRef}>
        <octahedronGeometry args={[0.2, 0]} />
        <meshStandardMaterial color="#F2C14E" emissive="#F59E0B" emissiveIntensity={1.5} />
      </mesh>
    </group>
  );
};
