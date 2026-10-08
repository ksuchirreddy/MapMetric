import React from 'react';
import * as THREE from 'three';
import { ORBIT_RADII } from './Rings';

export const Trails: React.FC = () => {
  return (
    <group>
      {ORBIT_RADII.map((radius, idx) => (
        <mesh key={idx} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[radius - 0.05, radius + 0.05, 64, 1, 0, Math.PI * 0.7]} />
          <meshBasicMaterial color="#8EDCEB" transparent opacity={0.25} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  );
};
