import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { OrreryBody } from '../adapters/dataAdapter';

interface BodiesProps {
  bodies: OrreryBody[];
  hoveredId: string | null;
  selectedId: string | null;
  onHoverBody: (id: string | null) => void;
  onSelectBody: (id: string) => void;
}

export const Bodies: React.FC<BodiesProps> = ({
  bodies,
  hoveredId,
  selectedId,
  onHoverBody,
  onSelectBody,
}) => {
  const groupRef = useRef<THREE.Group>(null!);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.05;
    }
  });

  return (
    <group ref={groupRef}>
      {bodies.map((body) => {
        const x = Math.cos(body.angle) * body.radius;
        const z = Math.sin(body.angle) * body.radius;
        const isHovered = hoveredId === body.id;
        const isSelected = selectedId === body.id;

        return (
          <group key={body.id} position={[x, 0, z]}>
            {/* 3D Body Mesh */}
            <mesh
              onPointerOver={(e) => {
                e.stopPropagation();
                onHoverBody(body.id);
              }}
              onPointerOut={() => onHoverBody(null)}
              onClick={(e) => {
                e.stopPropagation();
                onSelectBody(body.id);
              }}
            >
              <icosahedronGeometry args={[body.size, 1]} />
              <meshStandardMaterial
                color={isHovered || isSelected ? '#F0C879' : body.color}
                emissive={isHovered || isSelected ? '#D6A24A' : body.color}
                emissiveIntensity={isHovered || isSelected ? 1.2 : 0.6}
                roughness={0.3}
                metalness={0.7}
              />
            </mesh>

            {/* Rotating Selection Reticle Ring */}
            {(isHovered || isSelected) && (
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <ringGeometry args={[body.size * 1.4, body.size * 1.6, 32]} />
                <meshBasicMaterial color="#8EDCEB" side={THREE.DoubleSide} transparent opacity={0.8} />
              </mesh>
            )}

            {/* Anchored Label Tooltip */}
            {isHovered && (
              <Html distanceFactor={10} zIndexRange={[100, 0]}>
                <div className="bg-[#0B0E17]/95 border border-[#D6A24A]/50 px-3 py-2 rounded-xl text-xs font-mono text-[#ECE8DF] shadow-2xl pointer-events-none whitespace-nowrap">
                  <span className="font-bold text-[#F0C879] block">{body.filename}</span>
                  <span className="text-[#A9A8A0] text-[10px]">
                    {body.featureCount} features • {body.status} • {body.processingTimeMs ?? '-'} ms
                  </span>
                </div>
              </Html>
            )}
          </group>
        );
      })}
    </group>
  );
};
