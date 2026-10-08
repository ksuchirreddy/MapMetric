import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Float } from '@react-three/drei';
import * as THREE from 'three';

interface HolographicGlobeProps {
  featureCount?: number;
  activeDatasetName?: string;
}

const GlobeInner = ({
  featureCount = 12,
  activeDatasetName = 'UTM Projection Engine',
}: HolographicGlobeProps) => {
  const globeGroupRef = useRef<THREE.Group>(null!);
  const atmosphereRef = useRef<THREE.Mesh>(null!);
  const ringRef = useRef<THREE.Mesh>(null!);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  // Generate spatial coordinate markers around the globe
  const markers = [
    { id: 'UTM-Zone-32N', pos: [1.8, 0.8, 1.2], label: 'UTM Zone 32N (m²)', area: '45,210 m²' },
    { id: 'UTM-Zone-18N', pos: [-1.5, 1.4, 0.9], label: `UTM Zone 18N (${activeDatasetName || 'KML'})`, area: '128,400 m²' },
    { id: 'UTM-Zone-43N', pos: [0.5, -1.8, 1.3], label: `UTM Zone 43N (${featureCount} features)`, area: '89,150 m²' },
    { id: 'UTM-Zone-30S', pos: [-1.2, -1.2, -1.5], label: 'UTM Zone 30S (Polygon)', area: '210,000 m²' },
    { id: 'UTM-Zone-54N', pos: [1.6, -0.5, -1.4], label: 'UTM Zone 54N (LineString)', length: '4,320 m' },
  ];

  useFrame((state, delta) => {
    if (globeGroupRef.current) {
      globeGroupRef.current.rotation.y += delta * 0.15;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z += delta * 0.2;
      ringRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
    }
    if (atmosphereRef.current) {
      atmosphereRef.current.rotation.y -= delta * 0.05;
    }
  });

  return (
    <group ref={globeGroupRef}>
      {/* Central Wireframe Geospatial Core Sphere */}
      <mesh>
        <sphereGeometry args={[2.2, 32, 32]} />
        <meshStandardMaterial
          color="#10B981"
          wireframe
          transparent
          opacity={0.3}
          emissive="#047857"
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* Solid Inner Core Glow */}
      <mesh>
        <sphereGeometry args={[1.9, 24, 24]} />
        <meshPhysicalMaterial
          color="#0F172A"
          roughness={0.2}
          metalness={0.8}
          transmission={0.6}
          thickness={1.2}
          clearcoat={1}
        />
      </mesh>

      {/* Atmospheric Glow Mesh */}
      <mesh ref={atmosphereRef}>
        <sphereGeometry args={[2.4, 32, 32]} />
        <meshBasicMaterial
          color="#3B82F6"
          transparent
          opacity={0.12}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Orbital Ring */}
      <mesh ref={ringRef} rotation={[Math.PI / 3, 0, 0]}>
        <ringGeometry args={[2.8, 2.9, 64]} />
        <meshBasicMaterial color="#06B6D4" side={THREE.DoubleSide} transparent opacity={0.5} />
      </mesh>

      {/* Spatial Feature Markers */}
      {markers.map((m) => (
        <group key={m.id} position={m.pos as [number, number, number]}>
          <mesh
            onPointerOver={() => setHoveredNode(m.id)}
            onPointerOut={() => setHoveredNode(null)}
          >
            <sphereGeometry args={[0.12, 16, 16]} />
            <meshStandardMaterial
              color={hoveredNode === m.id ? '#38BDF8' : '#10B981'}
              emissive={hoveredNode === m.id ? '#0284C7' : '#059669'}
              emissiveIntensity={1}
            />
          </mesh>

          {/* HTML Overlay Tooltip on Hover */}
          {hoveredNode === m.id && (
            <Html distanceFactor={10} zIndexRange={[100, 0]}>
              <div className="bg-slate-900/95 backdrop-blur-md border border-emerald-500/50 px-3 py-2 rounded-xl text-[11px] font-mono text-slate-100 shadow-2xl pointer-events-none whitespace-nowrap animate-in zoom-in-95">
                <span className="font-bold text-emerald-400 block">{m.label}</span>
                <span className="text-slate-400">{m.area || m.length}</span>
              </div>
            </Html>
          )}
        </group>
      ))}
    </group>
  );
};

export const HolographicGlobe: React.FC<HolographicGlobeProps> = (props) => {
  return (
    <div className="w-full h-80 sm:h-96 relative rounded-2xl overflow-hidden bg-gradient-to-b from-slate-950/80 via-slate-900/40 to-slate-950/80 border border-slate-800/80 shadow-2xl">
      <div className="absolute top-4 left-4 z-10 font-mono text-xs">
        <span className="text-emerald-400 font-bold tracking-wider uppercase flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          Interactive 3D Spatial Core
        </span>
        <span className="text-slate-400 text-[11px] block mt-0.5">
          Drag to rotate • Scroll to zoom • Hover nodes
        </span>
      </div>

      <Canvas camera={{ position: [0, 0, 7], fov: 45 }}>
        <ambientLight intensity={0.6} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#10B981" />
        <pointLight position={[-10, -10, -10]} intensity={1} color="#3B82F6" />
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
          <GlobeInner {...props} />
        </Float>
        <OrbitControls enableZoom={true} minDistance={4} maxDistance={10} autoRotate={false} />
      </Canvas>
    </div>
  );
};
