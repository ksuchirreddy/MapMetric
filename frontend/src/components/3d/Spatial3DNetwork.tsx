import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Line } from '@react-three/drei';
import * as THREE from 'three';
import { FileRecordItem } from '../../services/api';

interface Spatial3DNetworkProps {
  files: FileRecordItem[];
}

const NetworkGraph = ({ files }: Spatial3DNetworkProps) => {
  const groupRef = useRef<THREE.Group>(null!);

  const { nodes, connections } = useMemo(() => {
    const nodeList: { id: string; name: string; type: string; pos: [number, number, number]; status: string }[] = [];
    const connList: [number, number, number][][] = [];

    const fileItems = files.length > 0 ? files.slice(0, 8) : [
      { id: '1', filename: 'layer_1.kml', status: 'COMPLETED', feature_count: 5 },
      { id: '2', filename: 'shapefile.zip', status: 'COMPLETED', feature_count: 3 },
      { id: '3', filename: 'survey.kml', status: 'FAILED', feature_count: 0 },
    ];

    fileItems.forEach((f, idx) => {
      const radius = 3;
      const angle = (idx / fileItems.length) * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const y = (Math.sin(idx * 2) * 1.5);
      const z = Math.sin(angle) * radius;

      nodeList.push({
        id: f.id,
        name: f.filename,
        type: f.filename.endsWith('.kml') ? 'KML' : 'SHP',
        pos: [x, y, z],
        status: f.status,
      });
    });

    // Central hub
    nodeList.unshift({
      id: 'hub',
      name: 'UTM Gateway',
      type: 'CORE',
      pos: [0, 0, 0],
      status: 'COMPLETED',
    });

    // Connect all nodes to central hub
    for (let i = 1; i < nodeList.length; i++) {
      connList.push([nodeList[0].pos, nodeList[i].pos]);
    }

    return { nodes: nodeList, connections: connList };
  }, [files]);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Node Spheres */}
      {nodes.map((n) => {
        const isHub = n.id === 'hub';
        const color = isHub ? '#38BDF8' : n.status === 'COMPLETED' ? '#10B981' : '#F43F5E';
        return (
          <mesh key={n.id} position={n.pos}>
            <sphereGeometry args={[isHub ? 0.4 : 0.22, 16, 16]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} />
          </mesh>
        );
      })}

      {/* Connection Lines */}
      {connections.map((points, idx) => (
        <Line key={idx} points={points} color="#0284C7" lineWidth={1.5} transparent opacity={0.5} />
      ))}
    </group>
  );
};

export const Spatial3DNetwork: React.FC<Spatial3DNetworkProps> = ({ files }) => {
  return (
    <div className="w-full h-72 relative rounded-xl bg-slate-950/80 border border-slate-800 p-4">
      <div className="absolute top-3 left-3 z-10 font-mono text-xs text-slate-400">
        <span className="text-cyan-400 font-bold uppercase">3D Topology Node Graph</span>
      </div>
      <Canvas camera={{ position: [0, 2, 7], fov: 50 }}>
        <ambientLight intensity={0.8} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#10B981" />
        <NetworkGraph files={files} />
        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={1} />
      </Canvas>
    </div>
  );
};
