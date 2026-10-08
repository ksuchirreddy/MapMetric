import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface StarsProps {
  count?: number;
}

export const Stars: React.FC<StarsProps> = ({ count = 8000 }) => {
  const farStarsRef = useRef<THREE.Points>(null!);
  const midStarsRef = useRef<THREE.Points>(null!);

  const { farPos, midPos, farCols, midCols } = useMemo(() => {
    const half = Math.floor(count / 2);
    const fPos = new Float32Array(half * 3);
    const mPos = new Float32Array(half * 3);
    const fCol = new Float32Array(half * 3);
    const mCol = new Float32Array(half * 3);

    const brassHi = new THREE.Color('#F0C879');
    const glassHi = new THREE.Color('#8EDCEB');
    const paperFaint = new THREE.Color('#6F7280');

    for (let i = 0; i < half; i++) {
      // Far Stars (r=30-40)
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const r1 = 30 + Math.random() * 10;

      fPos[i * 3] = r1 * Math.sin(phi) * Math.cos(theta);
      fPos[i * 3 + 1] = r1 * Math.sin(phi) * Math.sin(theta);
      fPos[i * 3 + 2] = r1 * Math.cos(phi);

      const c1 = Math.random() < 0.6 ? paperFaint : Math.random() < 0.8 ? brassHi : glassHi;
      fCol[i * 3] = c1.r;
      fCol[i * 3 + 1] = c1.g;
      fCol[i * 3 + 2] = c1.b;

      // Mid Stars (r=18-28)
      const r2 = 18 + Math.random() * 10;
      mPos[i * 3] = r2 * Math.sin(phi) * Math.cos(theta);
      mPos[i * 3 + 1] = r2 * Math.sin(phi) * Math.sin(theta);
      mPos[i * 3 + 2] = r2 * Math.cos(phi);

      const c2 = Math.random() < 0.5 ? glassHi : brassHi;
      mCol[i * 3] = c2.r;
      mCol[i * 3 + 1] = c2.g;
      mCol[i * 3 + 2] = c2.b;
    }

    return { farPos: fPos, midPos: mPos, farCols: fCol, midCols: mCol };
  }, [count]);

  useFrame((_, delta) => {
    if (farStarsRef.current) farStarsRef.current.rotation.y += delta * 0.003;
    if (midStarsRef.current) midStarsRef.current.rotation.y += delta * 0.008;
  });

  return (
    <group>
      {/* Layer 1: Far Stars */}
      <points ref={farStarsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[farPos, 3]} />
          <bufferAttribute attach="attributes-color" args={[farCols, 3]} />
        </bufferGeometry>
        <pointsMaterial size={0.06} vertexColors transparent opacity={0.5} sizeAttenuation />
      </points>

      {/* Layer 2: Mid Stars */}
      <points ref={midStarsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[midPos, 3]} />
          <bufferAttribute attach="attributes-color" args={[midCols, 3]} />
        </bufferGeometry>
        <pointsMaterial size={0.09} vertexColors transparent opacity={0.7} sizeAttenuation />
      </points>
    </group>
  );
};
