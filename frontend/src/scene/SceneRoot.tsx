import React from 'react';
import { Canvas } from '@react-three/fiber';
import { EnvironmentGroup } from './Environment/EnvironmentGroup';
import { FileRecordItem } from '../services/api';
import { PerformanceTier, SceneMode } from './store';

interface SceneRootProps {
  files: FileRecordItem[];
  hoveredId: string | null;
  selectedId: string | null;
  onHoverBody: (id: string | null) => void;
  onSelectBody: (id: string) => void;
  tier?: PerformanceTier;
  sceneMode?: SceneMode;
}

export const SceneRoot: React.FC<SceneRootProps> = ({
  tier = 'high',
}) => {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none select-none">
      <Canvas
        camera={{ position: [0, 1.2, 16], fov: 38 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[0, 18, 5]} intensity={1.8} color="#F59E0B" />
        <hemisphereLight intensity={0.3} color="#2563EB" groundColor="#06070B" />

        {/* 3D Flowing Liquid Metal Fluid Sculpture & Environment Layers */}
        <EnvironmentGroup tier={tier} />
      </Canvas>
    </div>
  );
};
