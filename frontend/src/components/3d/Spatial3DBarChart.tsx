import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import { FileRecordItem } from '../../services/api';

interface Spatial3DBarChartProps {
  files: FileRecordItem[];
}

const BarsGroup = ({ files }: Spatial3DBarChartProps) => {
  const groupRef = useRef<THREE.Group>(null!);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const data = files.length > 0 ? files.slice(0, 6) : [
    { id: '1', filename: 'polygons_shapefile.zip', feature_count: 5, processing_time_ms: 31 },
    { id: '2', filename: 'mixed.kml', feature_count: 3, processing_time_ms: 48 },
    { id: '3', filename: 'survey.kml', feature_count: 8, processing_time_ms: 25 },
  ];

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.08;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Base Grid Plane */}
      <gridHelper args={[12, 12, '#1E293B', '#0F172A']} position={[0, -0.01, 0]} />

      {/* 3D Extruded Columns */}
      {data.map((item, idx) => {
        const height = Math.max(0.8, Math.min(4, (item.processing_time_ms || 20) / 12));
        const x = (idx - data.length / 2) * 1.6 + 0.8;
        const color = idx % 2 === 0 ? '#10B981' : '#3B82F6';

        return (
          <group key={item.id} position={[x, 0, 0]}>
            <mesh
              position={[0, height / 2, 0]}
              onPointerOver={() => setHoveredIdx(idx)}
              onPointerOut={() => setHoveredIdx(null)}
            >
              <boxGeometry args={[0.9, height, 0.9]} />
              <meshStandardMaterial
                color={hoveredIdx === idx ? '#38BDF8' : color}
                emissive={hoveredIdx === idx ? '#0284C7' : color}
                emissiveIntensity={hoveredIdx === idx ? 0.8 : 0.4}
                roughness={0.2}
                metalness={0.5}
              />
            </mesh>

            {/* Hover Tooltip */}
            {hoveredIdx === idx && (
              <Html position={[0, height + 0.5, 0]} center zIndexRange={[100, 0]}>
                <div className="bg-slate-900/95 border border-emerald-500/50 px-3 py-1.5 rounded-lg text-[11px] font-mono text-slate-100 shadow-2xl pointer-events-none whitespace-nowrap">
                  <span className="font-bold text-emerald-400 block">{item.filename}</span>
                  <span className="text-slate-300">{item.processing_time_ms} ms • {item.feature_count} features</span>
                </div>
              </Html>
            )}
          </group>
        );
      })}
    </group>
  );
};

export const Spatial3DBarChart: React.FC<Spatial3DBarChartProps> = ({ files }) => {
  return (
    <div className="w-full h-64 relative rounded-xl bg-slate-950/80 border border-slate-800 p-4">
      <div className="absolute top-3 left-3 z-10 font-mono text-xs text-slate-400">
        <span className="text-emerald-400 font-bold uppercase">3D Extruded Latency Bars</span>
      </div>
      <Canvas camera={{ position: [0, 4, 8], fov: 45 }}>
        <ambientLight intensity={0.6} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#10B981" />
        <pointLight position={[-10, 10, -5]} intensity={1} color="#3B82F6" />
        <BarsGroup files={files} />
        <OrbitControls enableZoom={false} />
      </Canvas>
    </div>
  );
};
