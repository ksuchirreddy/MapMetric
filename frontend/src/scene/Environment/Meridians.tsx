import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const Meridians: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null!);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.002;
    }
  });

  return (
    <group ref={groupRef}>
      {[0, Math.PI / 4, Math.PI / 2, (3 * Math.PI) / 4].map((angle, i) => (
        <group key={i} rotation={[0, angle, 0]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[22, 22.05, 64]} />
            <meshBasicMaterial color="#ECE8DF" transparent opacity={0.08} side={THREE.DoubleSide} />
          </mesh>
        </group>
      ))}
    </group>
  );
};
