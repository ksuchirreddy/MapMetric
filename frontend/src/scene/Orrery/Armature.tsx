import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const Armature: React.FC = () => {
  const gear1Ref = useRef<THREE.Group>(null!);
  const gear2Ref = useRef<THREE.Group>(null!);

  useFrame((_, delta) => {
    if (gear1Ref.current) gear1Ref.current.rotation.z += delta * 0.1;
    if (gear2Ref.current) gear2Ref.current.rotation.z -= delta * 0.1;
  });

  return (
    <group position={[0, -2, 0]}>
      {/* Central Brass Gimbal Base */}
      <mesh position={[0, -2, 0]}>
        <cylinderGeometry args={[1.5, 2, 0.4, 32]} />
        <meshStandardMaterial color="#D6A24A" metalness={1} roughness={0.35} emissive="#8A6428" emissiveIntensity={0.4} />
      </mesh>

      {/* Vertical Struts */}
      {[-3.5, 3.5].map((x, idx) => (
        <mesh key={idx} position={[x, 0, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 6, 16]} />
          <meshStandardMaterial color="#D6A24A" metalness={1} roughness={0.35} />
        </mesh>
      ))}

      {/* Interlocking Gears */}
      <group ref={gear1Ref} position={[-1.2, -1.8, 0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.6, 0.08, 16, 24]} />
          <meshStandardMaterial color="#F0C879" metalness={1} roughness={0.3} />
        </mesh>
      </group>

      <group ref={gear2Ref} position={[1.2, -1.8, 0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.6, 0.08, 16, 24]} />
          <meshStandardMaterial color="#F0C879" metalness={1} roughness={0.3} />
        </mesh>
      </group>
    </group>
  );
};
