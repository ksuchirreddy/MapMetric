import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const ORBIT_RADII = [3.0, 4.6, 6.4, 8.5, 11.0];
export const ORBIT_TILTS = [0, 0.08, 0.15, 0.1, 0.22];

export const Rings: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null!);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.02;
    }
  });

  return (
    <group ref={groupRef}>
      {ORBIT_RADII.map((radius, idx) => (
        <group key={idx} rotation={[ORBIT_TILTS[idx], 0, 0]}>
          {/* Brass Orbit Ring Housing */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[radius, 0.03, 16, 100]} />
            <meshStandardMaterial
              color="#D6A24A"
              metalness={0.9}
              roughness={0.35}
              emissive="#8A6428"
              emissiveIntensity={0.3}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
};
