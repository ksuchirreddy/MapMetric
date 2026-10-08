import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const Oculus: React.FC = () => {
  const coneRef = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    if (coneRef.current) {
      coneRef.current.rotation.y = Math.sin(state.clock.getElapsedTime() * 0.1) * 0.1;
    }
  });

  return (
    <group position={[0, 18, 0]}>
      {/* Overhead Brass Oculus Ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[4, 4.4, 32]} />
        <meshStandardMaterial color="#D6A24A" metalness={1} roughness={0.35} emissive="#8A6428" emissiveIntensity={0.5} />
      </mesh>

      {/* Volumetric Light Shaft Cone */}
      <mesh ref={coneRef} position={[0, -9, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[10, 18, 32, 1, true]} />
        <meshBasicMaterial
          color="#F0C879"
          transparent
          opacity={0.06}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
};
