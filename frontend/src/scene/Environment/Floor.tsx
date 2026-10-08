import React from 'react';
import * as THREE from 'three';

export const Floor: React.FC = () => {
  return (
    <group position={[0, -6, 0]}>
      {/* Dark Engraved Floor Plate */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color="#0B0E17" roughness={0.9} metalness={0.1} />
      </mesh>

      {/* Concentric Engraved Brass Rings */}
      {[3, 6, 9, 12, 16, 20].map((radius, idx) => (
        <mesh key={idx} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
          <ringGeometry args={[radius, radius + 0.03, 64]} />
          <meshBasicMaterial color="#D6A24A" transparent opacity={0.15} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  );
};
