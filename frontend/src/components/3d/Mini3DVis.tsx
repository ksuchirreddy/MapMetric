import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface Mini3DVisProps {
  type?: 'datasets' | 'features' | 'area' | 'latency';
  color?: string;
}

const MeshObject = ({ type = 'datasets', color = '#10B981' }: Mini3DVisProps) => {
  const meshRef = useRef<THREE.Mesh>(null!);
  const [hovered, setHovered] = useState(false);

  useFrame((_, delta) => {
    if (meshRef.current) {
      const speed = hovered ? 2.5 : 1;
      meshRef.current.rotation.x += delta * 0.8 * speed;
      meshRef.current.rotation.y += delta * 1.2 * speed;
    }
  });

  const getGeometry = () => {
    switch (type) {
      case 'datasets':
        return <icosahedronGeometry args={[1, 1]} />;
      case 'features':
        return <torusKnotGeometry args={[0.7, 0.25, 64, 8]} />;
      case 'area':
        return <cylinderGeometry args={[0.8, 0.8, 1.2, 16]} />;
      case 'latency':
        return <dodecahedronGeometry args={[0.9]} />;
      default:
        return <octahedronGeometry args={[1]} />;
    }
  };

  return (
    <mesh
      ref={meshRef}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {getGeometry()}
      <meshStandardMaterial
        color={color}
        wireframe
        emissive={color}
        emissiveIntensity={hovered ? 1.2 : 0.6}
        transparent
        opacity={0.85}
      />
    </mesh>
  );
};

export const Mini3DVis: React.FC<Mini3DVisProps> = ({ type, color }) => {
  return (
    <div className="w-12 h-12 relative overflow-hidden rounded-xl bg-slate-950/80 border border-slate-800/80 shrink-0">
      <Canvas camera={{ position: [0, 0, 3], fov: 50 }} gl={{ antialias: true, alpha: true }}>
        <ambientLight intensity={0.8} />
        <pointLight position={[5, 5, 5]} intensity={1.5} color={color || '#10B981'} />
        <MeshObject type={type} color={color} />
      </Canvas>
    </div>
  );
};
