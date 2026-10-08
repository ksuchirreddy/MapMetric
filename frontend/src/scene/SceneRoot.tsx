import React, { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { EnvironmentGroup } from './Environment/EnvironmentGroup';
import { Core } from './Orrery/Core';
import { Rings } from './Orrery/Rings';
import { Bodies } from './Orrery/Bodies';
import { Trails } from './Orrery/Trails';
import { Flares } from './Orrery/Flares';
import { Armature } from './Orrery/Armature';
import { adaptFilesToOrreryBodies } from './adapters/dataAdapter';
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
  files,
  hoveredId,
  selectedId,
  onHoverBody,
  onSelectBody,
  tier = 'high',
}) => {
  const bodies = useMemo(() => adaptFilesToOrreryBodies(files), [files]);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none select-none">
      <Canvas
        camera={{ position: [0, 1.2, 16], fov: 38 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[0, 18, 5]} intensity={1.4} color="#F0C879" />
        <hemisphereLight intensity={0.25} color="#8EDCEB" groundColor="#06070B" />

        {/* Environment Layers */}
        <EnvironmentGroup tier={tier} />

        {/* The Signal Orrery Midground */}
        <group position={[0, 0, 0]}>
          <Core />
          <Rings />
          <Bodies
            bodies={bodies}
            hoveredId={hoveredId}
            selectedId={selectedId}
            onHoverBody={onHoverBody}
            onSelectBody={onSelectBody}
          />
          <Trails />
          <Flares />
          <Armature />
        </group>
      </Canvas>
    </div>
  );
};
